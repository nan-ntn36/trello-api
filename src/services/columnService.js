/* eslint-disable no-useless-catch */
import { columnModel } from '~/models/columnModel';
import { boardModel } from '~/models/boardModel';

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

export const columnService = { createNew };
