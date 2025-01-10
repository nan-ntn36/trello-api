import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { GET_DB } from '~/config/mongodb';
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';
import { userModel } from './userModel';
import { boardModel } from './boardModel';

// Define Collection (name & schema)
const INVITATION_COLLECTION_NAME = 'invitaions';
const INVITATION_COLLECTION_SCHEMA = Joi.object({
  invitedId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  inviteeId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  type: Joi.string()
    .required()
    .valid(...Object.values(INVITATION_TYPES)),
  boardInvitation: Joi.object({
    boardId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string()
      .required()
      .valid(...Object.values(BOARD_INVITATION_STATUS)),
  }).optional(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
});

const INVALID_UPDATE_FIELDS = [
  '_id',
  'invitedId',
  'inviteeId',
  'createdAt',
  'type',
];
const validateBeforCreate = async (data) => {
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};
const createNewBoardInvitation = async (data) => {
  try {
    const validData = await validateBeforCreate(data);
    let newInvitationToAdd = {
      ...validData,
      invitedId: new ObjectId(validData.invitedId),
      inviteeId: new ObjectId(validData.inviteeId),
    };
    if (validData.boardInvitation) {
      newInvitationToAdd.boardInvitation = {
        ...validData.boardInvitation,
        boardId: new ObjectId(validData.boardInvitation.boardId),
      };
    }
    const createdInvitation = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .insertOne(newInvitationToAdd);
    return createdInvitation;
  } catch (error) {
    throw new Error(error);
  }
};

const findOneById = async (invitaionId) => {
  try {
    const result = GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(invitaionId) });

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (invitationId, updateData) => {
  try {
    Object.keys(updateData).forEach((fileName) => {
      if (INVALID_UPDATE_FIELDS.includes(fileName)) {
        delete updateData[fileName];
      }
    });

    ///biến đổi dự liệu thành Object Id

    if (updateData.boardInvitation) {
      updateData.boardInvitation = {
        ...updateData.boardInvitation,
        boardId: new ObjectId(updateData.boardInvitation.boardId),
      };
    }

    const result = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(invitationId),
        },
        { $set: updateData },
        {
          returnDocument: 'after',
        }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
const findByUser = async (userId) => {
  try {
    const queryConditions = [
      { inviteeId: new ObjectId(userId) }, // tìm theo inviteeId  - người được được mời chính mà người đang thực hiện request này
      { _destroy: false },
    ];
    const results = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .aggregate([
        { $match: { $and: queryConditions } },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'invitedId',
            foreignField: '_id',
            as: 'inviter',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }],
          },
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'inviteeId',
            foreignField: '_id',
            as: 'invitee',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }],
          },
        },
        {
          $lookup: {
            from: boardModel.BOARD_COLLECTION_NAME,
            localField: 'boardInvitation.boardId',
            foreignField: '_id',
            as: 'board',
          },
        },
      ])
      .toArray();
    return results;
  } catch (error) {
    throw new Error(error);
  }
};
export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA,
  findOneById,
  createNewBoardInvitation,
  update,
  findByUser,
};
