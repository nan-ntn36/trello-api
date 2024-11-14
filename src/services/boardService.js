/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatters';
import { boardModel } from '~/models/boardModel';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { cloneDeep, parseInt } from 'lodash';
import { columnModel } from '~/models/columnModel';
import { cardModel } from '~/models/cardModel';
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants';

const createNew = async (userId, reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title),
    };
    const createBoard = await boardModel.createNew(userId, newBoard);
    // trong service luôn phải có return
    const getNewBoard = await boardModel.findOneById(createBoard.insertedId);

    return getNewBoard;
  } catch (error) {
    throw error;
  }
};

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    if (!page) page = DEFAULT_PAGE;
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE;
    const results = await boardModel.getBoards(
      userId,
      parseInt(page, 10),
      parseInt(itemsPerPage, 10)
    );
    return results;
  } catch (error) {
    throw error;
  }
};

const getDetails = async (userId, boardId) => {
  try {
    // trong service luôn phải có return
    const board = await boardModel.getDetails(userId, boardId);
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

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    //1. Cập nhật mảng cardOrderIds của column ban đầu chứa nó (hiểu bản chát là xóa cái _id của card ra khỏi mảng)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now(),
    });
    //2. Cập nhât mảng cardOrderIds của column tiếp theo (hiểu bản chát là thêm cái _id của card vào mảng)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now(),
    });
    //3. Cập nhât lại trường columnId mới của card đã kéo
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId,
    });

    return { updateResult: 'success' };
  } catch (error) {
    throw error;
  }
};
export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards,
};
