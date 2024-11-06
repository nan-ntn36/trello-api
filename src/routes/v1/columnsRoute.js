import express from 'express';
import { columnsValidation } from '~/validations/columnsValidation';
import { columnController } from '~/controllers/columnsController';
import { authMiddleware } from '~/middlewares/authMiddleware';
const Router = express.Router();

Router.route('/').post(
  authMiddleware.isAuthorize,
  columnsValidation.createNew,
  columnController.createNew
);

Router.route('/:id')
  .put(
    authMiddleware.isAuthorize,
    columnsValidation.update,
    columnController.update
  )
  .delete(
    authMiddleware.isAuthorize,
    columnsValidation.deleteItem,
    columnController.deleteItem
  );

export const columnsRoute = Router;
