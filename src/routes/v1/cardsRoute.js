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

export const cardsRoute = Router;
