import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'AetherMonitor API',
        version: '1.0.0',
        description: 'SaaS-grade Observability Platform API Documentation',
      },
      security: [],
    },
  });
  return spec;
};
