/* eslint-disable no-useless-catch */
import { cardModel } from '~/models/cardModel';
import { columnModel } from '~/models/columnModel';
import { CloudinaryProvider } from '~/providers/CloudinaryProvider';

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

const update = async (cardId, reqBody, cardCoverFile) => {
  try {
    const updateData = { ...reqBody, updatedAt: Date.now() };
    let updatedCard = {}
    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(
        cardCoverFile.buffer,
        'card-covers'
      );
      // lưu lại url (secure_url) trong file ảnh
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url,
      });
    } else {
      updatedCard = await cardModel.update(cardId, updateData);
    }

    return updatedCard;
  } catch (error) {
    throw error;
  }
};
export const cardService = { createNew, update };
