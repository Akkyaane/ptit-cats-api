'use strict';

/**
 * adopter service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::adopter.adopter');
