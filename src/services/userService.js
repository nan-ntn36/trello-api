/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes';
import { userModel } from '~/models/userModel';
import ApiError from '~/utils/ApiError';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { pickUser } from '~/utils/formatters';
import { WEBSITE_DOMAIN } from '~/utils/constants';
import { BrevoProvider } from '~/providers/BrevoProvider';
import { env } from '~/config/environment';
import { JwtProvider } from '~/providers/JwtProvider';
import { CloudinaryProvider } from '~/providers/CloudinaryProvider';

const createNew = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email);
    if (existUser)
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exist');
    // nếu email là trungnghia@gmail.com thì lấy được trungnghia
    const nameFromEmail = reqBody.email.split('@')[0];
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8),
      username: nameFromEmail,
      displayname: nameFromEmail,
      verifyToken: uuidv4(),
    };
    const createUser = await userModel.createNew(newUser);
    const getNewUser = await userModel.findOneById(createUser.insertedId);

    // gửi mail xát thực cho người dùng

    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`;
    const custumSubject = 'Please verify you email before using our service';
    const htmlContent = `
       <h3>Hello,</h3>
            <p>Thank you for signing up with TrungNghia-Trello. To complete your registration, please verify your email address by clicking the button below:</p>
            <p>${verificationLink}</p>
            <p>If you did not sign up for an account, please ignore this email.</p>
            <p>Best regards,<br>The TrungNghia-Trello Team</p>
    `;
    //Gọi tới Provider gửi mail
    await BrevoProvider.sendEmail(getNewUser.email, custumSubject, htmlContent);
    return pickUser(getNewUser);
  } catch (error) {
    throw error;
  }
};

const verifyAccount = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email);
    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found');
    if (existUser.isActive)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'You account is already active'
      );
    if (reqBody.token !== existUser.verifyToken)
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid');

    const updateData = { isActive: true, verifyToken: null };
    const updateUser = await userModel.update(existUser._id, updateData);
    return pickUser(updateUser);
  } catch (error) {
    throw error;
  }
};

const login = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email);
    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found');
    if (!existUser.isActive)
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You account not active');
    // kiểm tra mật khẩu
    if (!bcryptjs.compareSync(reqBody.password, existUser.password))
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'You email or password is incorrect '
      );

    // Đăng nhập tạo token trả cho FE
    const userInfor = {
      _id: existUser._id,
      email: existUser.email,
    };
    // JWT gồm _id và email
    // tạo ra 2 loại accessToken và refreshToken
    const accessToken = await JwtProvider.generateToken(
      userInfor,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    );

    const refreshToken = await JwtProvider.generateToken(
      userInfor,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    );
    return { accessToken, refreshToken, ...pickUser(existUser) };
  } catch (error) {
    throw error;
  }
};

const refreshToken = async (clientRefreshToken) => {
  try {
    // giải mã cái refresh token này xem có hợp lệ không
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    );

    // đoạn này vì chúng ta  chỉ lưu những thông tin unique  và cố định user trong token rồi
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email,
    };

    // tạo accesstoken mới
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    );
    return { accessToken };
  } catch (error) {
    throw error;
  }
};

const update = async (userId, reqBody, userAvatarFile) => {
  try {
    const existUser = await userModel.findOneById(userId);
    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found');
    if (!existUser.isActive)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Your account is not active'
      );

    let updateUser = {};
    if (reqBody.current_password && reqBody.new_password) {
      if (!bcryptjs.compareSync(reqBody.current_password, existUser.password))
        throw new ApiError(
          StatusCodes.NOT_ACCEPTABLE,
          'You email or password is incorrect '
        );
      updateUser = await userModel.update(existUser._id, {
        password: bcryptjs.hashSync(reqBody.new_password, 8),
      });
    } else if (userAvatarFile) {
      // upload file lên cloudary
      const uploadResult = await CloudinaryProvider.streamUpload(
        userAvatarFile.buffer,
        'users'
      );
      // lưu lại url (secure_url) trong file ảnh
      updateUser = await userModel.update(existUser._id, {
        avatar: uploadResult.secure_url,
      });
    } else {
      updateUser = await userModel.update(existUser._id, reqBody);
    }

    return pickUser(updateUser);
  } catch (error) {
    throw error;
  }
};

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update,
};
