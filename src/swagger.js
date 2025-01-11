const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Confirm Deliveries API',
      version: '1.0.0',
      description: 'API para gestionar confirmaciones de entregas',
    },
    servers: [
      {
        url: 'https://us-central1-confirm-deliveries.cloudfunctions.net',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsDoc(options);

module.exports = { swaggerUi, specs };
