/* eslint-disable no-useless-catch */
import { cardModel } from '~/models/cardModel';
import { columnModel } from '~/models/columnModel';

const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody,
    };
    const createCard = await cardModel.createNew(newCard);
    const getNewCard = await cardModel.findOneById(createCard.insertedId);

    if (getNewCard) {
      // cập nhật mảng cardOrderIds trong collection column
      await columnModel.pushCardOrderIds(getNewCard);
    }
    return getNewCard;
  } catch (error) {
    throw error;
  }
};

const update = async (cardId, reqBody) => {
  try {
    const updateData = { ...reqBody, updatedAt: Date.now() };
    const updateCard = await cardModel.update(cardId, updateData);

    return updateCard;
  } catch (error) {
    throw error;
  }
};
export const cardService = { createNew, update };
