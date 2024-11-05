import { StatusCodes } from 'http-status-codes';
import { userService } from '~/services/userService';

const createNew = async (req, res, next) => {
  try {
    const createuser = await userService.createNew(req.body);
    res.status(StatusCodes.CREATED).json(createuser);
  } catch (error) {
    next(error);
  }
};

export const userController = { createNew };
