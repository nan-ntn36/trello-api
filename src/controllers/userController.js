import { StatusCodes } from 'http-status-codes';
import ms from 'ms';
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
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSize: 'none',
      maxAge: ms('14 days'),
    });

    res.cookie('refreshTokens', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSize: 'none',
      maxAge: ms('14 days'),
    });

    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};
export const userController = { createNew, verifyAccount, login };
