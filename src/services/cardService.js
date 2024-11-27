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

const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    const updateData = { ...reqBody, updatedAt: Date.now() };
    let updatedCard = {};
    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(
        cardCoverFile.buffer,
        'card-covers'
      );
      // lưu lại url (secure_url) trong file ảnh
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url,
      });
    } else if (updateData.commentToAdd) {
      // tạo dữ liệu để thêm vào database
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email,
      };
      updatedCard = await cardModel.unshiftNewComment(cardId, commentData);
    } else if (updateData.incomingMemberinfo) {
      // add hoặc remove ra khỏi card
      updatedCard = await cardModel.updateMembers(
        cardId,
        updateData.incomingMemberinfo
      );
    } else {
      updatedCard = await cardModel.update(cardId, updateData);
    }

    return updatedCard;
  } catch (error) {
    throw error;
  }
};
export const cardService = { createNew, update };
