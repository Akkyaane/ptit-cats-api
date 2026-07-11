'use strict';

/**
 * absence service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::absence.absence');
