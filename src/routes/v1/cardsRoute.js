import express from 'express';
import { cardsValidation } from '~/validations/cardsValidation';
import { cardController } from '~/controllers/cardsController';
const Router = express.Router();

Router.route('/').post(cardsValidation.createNew, cardController.createNew);

export const cardsRoute = Router;
