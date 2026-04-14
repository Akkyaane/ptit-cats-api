'use strict';

/**
 * adoptant router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::adoptant.adoptant');
