'use strict';

/**
 * adoptant service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::adoptant.adoptant');
