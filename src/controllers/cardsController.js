/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes';
import { cardService } from '~/services/cardService';

const createNew = async (req, res, next) => {
  try {
    const createcard = await cardService.createNew(req.body);
    res.status(StatusCodes.CREATED).json(createcard);
  } catch (error) {
    next(error);
  }
};

export const cardController = { createNew };
