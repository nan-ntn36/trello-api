import { env } from 'process';
import swaggerJsDoc from 'swagger-jsdoc';
import YAML from 'yaml';
import fs from 'fs';
import path from 'path';


const file = fs.readFileSync(path.resolve('swagger.yaml'), 'utf-8');
const swaggerYamlSpec = YAML.parse(file);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Documentation for your API using Swagger',
    },
    servers: [
      {
        url: `http://${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}`, // Thay bằng URL của bạn
      },
    ],
  },
  apis: ['./src/routes/**/*.js'], // Đường dẫn tới các file định nghĩa API
};
const swaggerJsSpec = swaggerJsDoc(options);
const mergedSwafferSpec = {
  ...swaggerYamlSpec,
  ...swaggerJsSpec,
  paths: {
    ...swaggerYamlSpec.paths,
    ...swaggerJsSpec.paths,
  },
  components: {
    ...swaggerYamlSpec.components,
    ...swaggerJsSpec.components,
  },
};
export default mergedSwafferSpec;
