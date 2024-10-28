import express from 'express';
import { columnsValidation } from '~/validations/columnsValidation';
import { columnController } from '~/controllers/columnsController';
const Router = express.Router();

Router.route('/').post(columnsValidation.createNew, columnController.createNew);

export const columnsRoute = Router;
