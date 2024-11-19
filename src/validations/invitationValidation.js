import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';
import ApiError from '~/utils/ApiError';

const createNewBoardInvitation = async (req, res, next) => {
  const correctCodition = Joi.object({
    inviteeEmail: Joi.string().required(),
    boardId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
  });

  try {
    await correctCodition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    );
  }
};

export const invitationValidation = { createNewBoardInvitation };
