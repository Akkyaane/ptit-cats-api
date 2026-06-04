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

      // Self-exclusion : le filtre $ne sur documentId exclut directement le
      // document courant côté base de données, ce qui évite tout décalage
      // entre la valeur de ctx.params.documentId et celle retournée par la
      // couche Document Service. Si aucun AUTRE adoptant n'a cet email, le
      // tableau est vide et la mise à jour est autorisée.
      const duplicates = await strapi.db.query('api::adoptant.adoptant').findMany({
        where: {
          email: { $eq: email },
          document_id: { $ne: documentId },
        },
        limit: 1,
      });

      if (duplicates.length > 0) {
        return ctx.badRequest('Un adoptant avec cet email existe déjà.');
      }
    }

    return super.update(ctx);
  },

}));
