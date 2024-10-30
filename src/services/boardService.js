/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatters';
import { boardModel } from '~/models/boardModel';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { cloneDeep } from 'lodash';

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

    // clone ra 1 mảng mới không ảnh hưởng đến dữ liệu ban đầu
    const resBoard = cloneDeep(board);
    // đưa cards về đúng column của nó
    resBoard.columns.forEach((column) => {
      // cách 1
      // column.cards = resBoard.cards.filter(
      //   (card) => card.columnId.toString() === column._id.toString()
      // );

      // cách 2: dùng .equals này là bởi vì dữ liệu của ta đều là ObjectId nên là thằng mongoDb có support hàm .equals (mongodb) này.
      column.cards = resBoard.cards.filter((card) =>
        card.columnId.equals(column._id)
      );
    });
    // Xóa đi mảng cards nằm cùng cấp với columns
    delete resBoard.cards;

    // trả dữ liệu mới về
    return resBoard;
  } catch (error) {
    throw error;
  }
};

const update = async (boardId, reqBody) => {
  try {
    const updateData = { ...reqBody, updatedAt: Date.now() };
    const updateBoard = await boardModel.update(boardId, updateData);

    return updateBoard;
  } catch (error) {
    throw error;
  }
};
export const boardService = { createNew, getDetails, update };
