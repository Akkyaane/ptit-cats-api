'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  async login(ctx) {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
      return ctx.badRequest('Email et mot de passe requis');
    }

    // Cherche dans les adoptants
    const [adoptant] = await strapi.db.query('api::adoptant.adoptant').findMany({ where: { email }, limit: 1 })

    if (adoptant) {
      const valid = await bcrypt.compare(password, adoptant.password);
      if (!valid) return ctx.unauthorized('Identifiants invalides');
      const token = jwt.sign(
        { id: adoptant.id, type: 'adoptant' },
        strapi.plugin('users-permissions').config('jwtSecret'),
        { expiresIn: '7d' }
      );
      return ctx.send({ token, user: { ...adoptant, password: undefined }, type: 'adoptant' });
    }

    // Cherche dans les volunteers
    const [volunteer] = await strapi.db.query('api::volunteer.volunteer').findMany({ where: { email }, limit: 1 });

    if (volunteer) {
      const valid = await bcrypt.compare(password, volunteer.password);
      if (!valid) return ctx.unauthorized('Identifiants invalides');
      const token = jwt.sign(
        { id: volunteer.id, type: 'volunteer' },
        strapi.plugin('users-permissions').config('jwtSecret'),
        { expiresIn: '7d' }
      );
      return ctx.send({ token, user: { ...volunteer, password: undefined }, type: 'volunteer' });
    }

    return ctx.unauthorized('Identifiants invalides');
  },

  async registerAdoptant(ctx) {
    const { name, firstName, email, password, housingType, hasGarden } = ctx.request.body;

    const existing = await strapi.db.query('api::adoptant.adoptant').findMany({ where: { email }, limit: 1 });
    if (existing.length) return ctx.badRequest('Cet email est déjà utilisé');

    const hashed = await bcrypt.hash(password, 10);
    const adoptant = await strapi.db.query('api::adoptant.adoptant').create({ data: { name, firstName, email, password: hashed, housingType, hasGarden, publishedAt: new Date() } });

    const token = jwt.sign(
      { id: adoptant.id, type: 'adoptant' },
      strapi.plugin('users-permissions').config('jwtSecret'),
      { expiresIn: '7d' }
    );
    return ctx.send({ token, user: { ...adoptant, password: undefined }, type: 'adoptant' });
  },

  async registerVolunteer(ctx) {
    const { name, firstName, email, password, role } = ctx.request.body;

    const existing = await strapi.db.query('api::volunteer.volunteer').findMany({ where: { email }, limit: 1 });
    if (existing.length) return ctx.badRequest('Cet email est déjà utilisé');

    const hashed = await bcrypt.hash(password, 10);
    const volunteer = await strapi.db.query('api::volunteer.volunteer').create({ data: { name, firstName, email, password: hashed, role, publishedAt: new Date() } });

    const token = jwt.sign(
      { id: volunteer.id, type: 'volunteer' },
      strapi.plugin('users-permissions').config('jwtSecret'),
      { expiresIn: '7d' }
    );
    return ctx.send({ token, user: { ...volunteer, password: undefined }, type: 'volunteer' });
  },
};