import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { GET_DB } from '~/config/mongodb';
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators';

const USER_ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin',
};

// Define Collection (name & schema)
const USER_COLLECTION_NAME = 'users';
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required(),
  username: Joi.string().required().trim().strict(),
  displayname: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(null),
  role: Joi.date()
    .valid(USER_ROLES.CLIENT, USER_ROLES.ADMIN)
    .default(USER_ROLES.CLIENT),

  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
});

const INVALID_UPDATE_FIELDS = ['_id', 'email', 'username', 'createdAt'];

const validateBeforCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

const createNew = async (data) => {
  try {
    const validData = await validateBeforCreate(data);
    const createUser = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .insertOne(validData);
    return createUser;
  } catch (error) {
    throw new Error(error);
  }
};

const findOneById = async (userId) => {
  try {
    // trả bản dữ liệu về
    return await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(userId),
      });
  } catch (error) {
    throw new Error(error);
  }
};
const findOneByEmail = async (emailValue) => {
  try {
    // trả bản dữ liệu về
    return await GET_DB().collection(USER_COLLECTION_NAME).findOne({
      email: emailValue,
    });
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (userId, updateData) => {
  Object.keys(updateData).forEach((fieldName) => {
    if (INVALID_UPDATE_FIELDS.includes(fieldName)) delete updateData[fieldName];
  });

  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(userId),
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

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  USER_ROLES,
  createNew,
  findOneById,
  findOneByEmail,
  update,
};
