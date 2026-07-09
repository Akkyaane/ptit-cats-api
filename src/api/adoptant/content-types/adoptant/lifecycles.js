'use strict';

/**
 * Lifecycles de la collection Adoptant.
 *
 * beforeCreate  : normalise l'email en minuscules.
 * beforeUpdate  : normalise l'email en minuscules.
 *
 * La vérification d'unicité email est aussi gérée au niveau du contrôleur
 * pour renvoyer un message d'erreur explicite avant que la DB ne lève une
 * contrainte.
 */
module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    if (data.email) {
      data.email = data.email.toLowerCase().trim();
    }
  },

  async beforeUpdate(event) {
    const { data } = event.params;
    if (data.email) {
      data.email = data.email.toLowerCase().trim();
    }
  },
};
