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

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body);
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);

    // xữ lý http only cookie cho phía trình duyệt
    console.log(result);

    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};
export const userController = { createNew, verifyAccount, login };
