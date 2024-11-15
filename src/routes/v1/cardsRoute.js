import express from 'express';
import { cardsValidation } from '~/validations/cardsValidation';
import { cardController } from '~/controllers/cardsController';
import { authMiddleware } from '~/middlewares/authMiddleware';
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware';
const Router = express.Router();

Router.route('/').post(
  authMiddleware.isAuthorize,
  cardsValidation.createNew,
  cardController.createNew
);

Router.route('/:id')
  .put(
    authMiddleware.isAuthorize,
    multerUploadMiddleware.upload.single('cardCover'),
    cardsValidation.update,
    cardController.update
  )
export const cardsRoute = Router;
