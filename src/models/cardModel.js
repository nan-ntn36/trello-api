import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { GET_DB } from '~/config/mongodb';
import { CARD_MEMBER_ACTION } from '~/utils/constants';
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE,
} from '~/utils/validators';

// Define Collection (name & schema)

const CARD_COLLECTION_NAME = 'cards';
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  cover: Joi.string().default(null),
  memberIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  // dữ liệu comment
  comments: Joi.array()
    .items({
      userId: Joi.string()
        .pattern(OBJECT_ID_RULE)
        .message(OBJECT_ID_RULE_MESSAGE),
      userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
      userAvatar: Joi.string(),
      userDisplayName: Joi.string(),
      content: Joi.string(),
      commentedAt: Joi.date().timestamp(),
    })
    .default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
});
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'boardId'];
const validateBeforCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

const createNew = async (data) => {
  try {
    const validData = await validateBeforCreate(data);
    const newCardToAdd = {
      ...validData,
      boardId: new ObjectId(validData.boardId),
      columnId: new ObjectId(validData.columnId),
    };
    const createCard = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .insertOne(newCardToAdd);
    return createCard;
  } catch (error) {
    throw new Error(error);
  }
};

const findOneById = async (id) => {
  try {
    // trả bản dữ liệu về
    return await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id),
      });
  } catch (error) {
    throw new Error(error);
  }
};
const deleteManyByColumnId = async (columnId) => {
  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .deleteMany({ columnId: new ObjectId(columnId) });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (cardId, updateData) => {
  // lọc những field mà ta k cho cập nhật linh tinh
  Object.keys(updateData).forEach((fieldName) => {
    if (INVALID_UPDATE_FIELDS.includes(fieldName)) delete updateData[fieldName];
  });
  // biến đổi object ID
  if (updateData.columnId)
    updateData.columnId = new ObjectId(updateData.columnId);
  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(cardId),
        },
        {
          $set: updateData,
        },
        {
          // trả bản ghi mới nhất khi cập nhật
          returnDocument: 'after',
        }
      );

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

// ta sử dụng  $push: {  } và bọc các phần tử vào comments : { $each: [commentData], $position: 0 } dê thêm vào đâu mảng
const unshiftNewComment = async (cardId, commentData) => {
  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(cardId),
        },
        {
          $push: { comments: { $each: [commentData], $position: 0 } },
        },
        {
          returnDocument: 'after',
        }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const updateMembers = async (cardId, incomingMemberinfo) => {
  try {
    let updateCondition = {};
    if (incomingMemberinfo.action === CARD_MEMBER_ACTION.ADD) {
      updateCondition = {
        $push: { memberIds: new ObjectId(incomingMemberinfo.userId) },
      };
    }

    if (incomingMemberinfo.action === CARD_MEMBER_ACTION.REMOVE) {
      updateCondition = {
        $pull: { memberIds: new ObjectId(incomingMemberinfo.userId) },
      };
    }
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(cardId),
        },
        updateCondition,
        {
          returnDocument: 'after',
        }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  update,
  deleteManyByColumnId,
  unshiftNewComment,
  updateMembers,
};
