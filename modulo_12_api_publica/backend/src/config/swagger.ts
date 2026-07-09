import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ZENDA 4.8 - API Pública',
      version: '1.0.0',
      description: 'Documentación de la API Pública de ZENDA 4.8',
      contact: {
        name: 'ZENDA Team',
        email: 'admin@zenda.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8093/api/v1',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/ports/http/*.ts', './src/ports/http/routes.ts']
};

export const specs = swaggerJsdoc(options);
