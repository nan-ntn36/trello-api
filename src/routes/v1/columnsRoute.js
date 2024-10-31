import express from 'express';
import { columnsValidation } from '~/validations/columnsValidation';
import { columnController } from '~/controllers/columnsController';
const Router = express.Router();

Router.route('/').post(columnsValidation.createNew, columnController.createNew);

Router.route('/:id')
  .put(columnsValidation.update, columnController.update)
  .delete(columnsValidation.deleteItem, columnController.deleteItem);

export const columnsRoute = Router;
