import { StatusCodes } from 'http-status-codes';
import { userModel } from '~/models/userModel';
import ApiError from '~/utils/ApiError';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { pickUser } from '~/utils/formatters';
import { WEBSITE_DOMAIN } from '~/utils/constants';
import { BrevoProvider } from '~/providers/BrevoProvider';

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    //
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

export const userService = {
  createNew,
};
