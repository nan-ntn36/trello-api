import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { boardValidation } from '~/validations/boardValidation';
import { boardController } from '~/controllers/boardController';
import { authMiddleware } from '~/middlewares/authMiddleware';
const Router = express.Router();

Router.route('/')
  .get(authMiddleware.isAuthorize, (req, res) => {
    res.status(StatusCodes.OK).json({ message: 'Note: API get list boards' });
  })
  .post(
    authMiddleware.isAuthorize,
    boardValidation.createNew,
    boardController.createNew
  ); // kêu về tầng validation -> sau đó kêu tầng controller

Router.route('/:id')
  .get(authMiddleware.isAuthorize, boardController.getDetails)
  .put(
    authMiddleware.isAuthorize,
    boardValidation.update,
    boardController.update
  );

// API hổ trợ cho việc duy chuyển card giữa các column khác nhau trong 1 board
Router.route('/suports/moving_card').put(
  authMiddleware.isAuthorize,
  boardValidation.moveCardToDifferentColumn,
  boardController.moveCardToDifferentColumn
);

export const boardRoute = Router;
