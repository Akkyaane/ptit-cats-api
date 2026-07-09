'use strict';

/**
 * Lifecycles de la collection AdoptionRequest.
 *
 * Strapi v5 ne supporte pas nativement les contraintes uniques composites
 * multi-colonnes via le schema JSON. Ce lifecycle assure qu'aucun doublon
 * (adoptant + adoptionListing) ne peut être inséré, en complément de la
 * vérification applicative dans le contrôleur.
 */
module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    const adoptantId = data.adoptant;
    const listingId = data.adoptionListing;

    if (!adoptantId || !listingId) return;

    const existing = await strapi.documents('api::adoption-request.adoption-request').findMany({
      filters: {
        adoptant: { documentId: { $eq: adoptantId } },
        adoptionListing: { documentId: { $eq: listingId } },
      },
      limit: 1,
    });

    if (existing.length > 0) {
      throw new Error('Une demande d\'adoption existe déjà pour cette annonce.');
    }
  },
};
