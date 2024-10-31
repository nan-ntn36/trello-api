/* eslint-disable no-useless-catch */
import { columnModel } from '~/models/columnModel';
import { boardModel } from '~/models/boardModel';
import { cardModel } from '~/models/cardModel';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';

const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody,
    };
    const createColumn = await columnModel.createNew(newColumn);
    const getNewColumn = await columnModel.findOneById(createColumn.insertedId); // insertedId là id của dữ liệu đã insert vào

    if (getNewColumn) {
      getNewColumn.cards = [];

      // cập nhật mảng columnOrderIds trong collection boards
      await boardModel.pushColumnOrderIds(getNewColumn);
    }

    return getNewColumn;
  } catch (error) {
    throw error;
  }
};

const update = async (columnId, reqBody) => {
  try {
    const updateData = { ...reqBody, updatedAt: Date.now() };
    const updateColumn = await columnModel.update(columnId, updateData);

    return updateColumn;
  } catch (error) {
    throw error;
  }
};
const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId);

    if (!targetColumn)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!');
    await columnModel.deleteOneById(columnId);

    await cardModel.deleteManyByColumnId(columnId);

    await boardModel.pullColumnOrderIds(targetColumn);

    return { deleteResult: 'Column and it Card delete successfully' };
  } catch (error) {
    throw error;
  }
};
export const columnService = { createNew, update, deleteItem };
