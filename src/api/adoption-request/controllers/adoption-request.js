'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

/**
 * Résout un champ de relation qui peut arriver dans deux formats :
 *   - Strapi v4 / format connect : { connect: [{ documentId: "xxx" }] }
 *   - Strapi v5 / format direct  : "xxx"
 * Retourne toujours un documentId string, ou null.
 */
function resolveRelationId(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (Array.isArray(value?.connect) && value.connect.length > 0) {
    return value.connect[0]?.documentId ?? value.connect[0]?.id ?? null;
  }
  return null;
}

module.exports = createCoreController('api::adoption-request.adoption-request', ({ strapi }) => ({

  async create(ctx) {
    const raw = ctx.request.body?.data || {};

    // Résolution des documentId (format connect ou string direct)
    const adoptantDocId = resolveRelationId(raw.adoptant);
    const listingDocId = resolveRelationId(raw.adoptionListing);

    // Résolution des IDs entiers internes (requis par strapi.db.query)
    // Le sanitizer Strapi v5 bloque le format connect/set avant d'atteindre
    // le controller pour les relations manyToOne sans inversedBy.
    // strapi.db.query opère au niveau Knex et contourne cette validation.
    const [adoptantRecord, listingRecord] = await Promise.all([
      adoptantDocId
        ? strapi.db.query('api::adoptant.adoptant').findOne({
            where: { documentId: adoptantDocId },
            select: ['id'],
          })
        : null,
      listingDocId
        ? strapi.db.query('api::adoption-listing.adoption-listing').findOne({
            where: { documentId: listingDocId },
            select: ['id'],
          })
        : null,
    ]);

    // Contrainte unique composite : un adoptant ne peut soumettre
    // qu'une seule demande par annonce.
    if (adoptantRecord && listingRecord) {
      const existing = await strapi.db.query('api::adoption-request.adoption-request').findMany({
        where: {
          adoptant: adoptantRecord.id,
          adoptionListing: listingRecord.id,
        },
        limit: 1,
      });

      if (existing.length > 0) {
        return ctx.badRequest("Une demande d'adoption existe déjà pour cette annonce.");
      }
    }

    const record = await strapi.db.query('api::adoption-request.adoption-request').create({
      data: {
        status: raw.status || 'en_attente',
        ...(adoptantRecord && { adoptant: adoptantRecord.id }),
        ...(listingRecord && { adoptionListing: listingRecord.id }),
      },
      populate: ['adoptant', 'adoptionListing'],
    });

    // On recharge via Document Service pour obtenir le documentId et le
    // format de réponse standard de l'API Strapi (data + meta).
    const document = await strapi.documents('api::adoption-request.adoption-request').findOne({
      documentId: record.documentId,
    });

    const sanitizedEntity = await this.sanitizeOutput(document, ctx);
    return this.transformResponse(sanitizedEntity);
  },

}));
