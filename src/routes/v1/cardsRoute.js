import express from 'express';
import { cardsValidation } from '~/validations/cardsValidation';
import { cardController } from '~/controllers/cardsController';
import { authMiddleware } from '~/middlewares/authMiddleware';
const Router = express.Router();

Router.route('/').post(
  authMiddleware.isAuthorize,
  cardsValidation.createNew,
  cardController.createNew
);

Router.route('/:id')
  .put(
    authMiddleware.isAuthorize,
    cardsValidation.update,
    cardController.update
  )
export const cardsRoute = Router;
