'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::adoptant.adoptant', ({ strapi }) => ({

  async create(ctx) {
    const { email } = ctx.request.body?.data || {};

    if (email) {
      const existing = await strapi.documents('api::adoptant.adoptant').findFirst({
        filters: { email: { $eq: email } },
      });

      if (existing) {
        return ctx.badRequest('Un adoptant avec cet email existe déjà.');
      }

      // Rattachement automatique au compte auth users-permissions si même email
      const authUser = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({ where: { email } });

      if (authUser) {
        ctx.request.body.data = {
          ...ctx.request.body.data,
          user: authUser.id,
        };
      }
    }

    return super.create(ctx);
  },

  async update(ctx) {
    const { email } = ctx.request.body?.data || {};

    if (email) {
      const { documentId } = ctx.params;

      // Self-exclusion : strapi.documents().findMany() retourne des objets
      // avec un champ .documentId (camelCase) qui correspond exactement au
      // paramètre d'URL. La comparaison s'effectue en mémoire sur les valeurs
      // normalisées par Strapi, sans passer par knex ni chercher une colonne
      // SQL inexistante (document_id n'est pas exposée dans le querybuilder).
      const matches = await strapi.documents('api::adoptant.adoptant').findMany({
        filters: { email: { $eq: email } },
      });

      const isDuplicate = matches.some((doc) => doc.documentId !== documentId);

      if (isDuplicate) {
        return ctx.badRequest('Un adoptant avec cet email existe déjà.');
      }
    }

    return super.update(ctx);
  },

}));
