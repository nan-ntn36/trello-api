import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';
import { BOARD_TYPES } from '~/utils/constants';

const createNew = async (req, res, next) => {
  const correctCodition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required (trungnghia) ',
      'string.empty': 'Title is empty (trungnghia) ',
      'string.min': 'Title min 3 chars (trungnghia) ',
      'string.max': 'Title max 50 chars (trungnghia) ',
      'string.trim':
        'Title must not have leading or tranling whitespace (trungnghia) ',
    }),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string()
      .valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE)
      .required(),
  });

  try {
    // set abortEarly: false chỉ định, trường hợp có nhiều lỗi validation thì trả về tất cả lỗi
    await correctCodition.validateAsync(req.body, { abortEarly: false });
    // validate dữ liệu hợp lệ cho request đi tếp đến controller
    next();
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    );
  }
};

const update = async (req, res, next) => {
  const correctCodition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE),
  });

  try {
    // set abortEarly: false chỉ định, trường hợp có nhiều lỗi validation thì trả về tất cả lỗi
    // Đối với 1 số trường hợp update cho phép allowUnknown không cân đẩy 1 số filed lên
    await correctCodition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
    // validate dữ liệu hợp lệ cho request đi tếp đến controller
    next();
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    );
  }
};

export const boardValidation = { createNew, update };
