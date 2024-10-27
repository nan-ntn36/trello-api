/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatters';
import { boardModel } from '~/models/boardModel';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';

const createNew = async (reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title),
    };
    const createBoard = await boardModel.createNew(newBoard);
    // trong service luôn phải có return
    const getNewBoard = await boardModel.findOneById(createBoard.insertedId);

    return getNewBoard;
  } catch (error) {
    throw error;
  }
};

const getDetails = async (boardId) => {
  try {
    // trong service luôn phải có return
    const board = await boardModel.getDetails(boardId);
    if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!');

    return board;
  } catch (error) {
    throw error;
  }
};

export const boarService = { createNew, getDetails };
