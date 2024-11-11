import { JwtProvider } from '~/providers/JwtProvider';
import { StatusCodes } from 'http-status-codes';
import { env } from '~/config/environment';
import ApiError from '~/utils/ApiError';

//Xác thực jwt nhận từ FE có hợp lệ hay không
const isAuthorize = async (req, res, next) => {
  // lấy access token nằm trong request tookie phía client thông qua withCredentials trong file authorizeAxios
  const clientAccessToken = req.cookies?.accessToken;
  // nếu như clientAccessToken không tồn tại -> lỗi
  if (!clientAccessToken) {
    next(
      new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized (token not found)')
    );
    return;
  }
  try {
    //1. thực hiện giải mã token xem có hợp lệ hay không
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    );
    //2. nếu token hợp lệ thì lưu thông tin giải mã vào req, jwtDecoded
    req.jwtDecoded = accessTokenDecoded;

    //3. cho phép request đi tiếp
    next();
  } catch (error) {
    // nếu cái accessToken nó bị hết hạn thì trả về mã lỗi cho FE để gọi api refreshToken
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token'));
      return;
    }

    // nếu như cái accessToken nó không hợp lệ thì trả về 401 và gọi api sign_out
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'));
  }
};

export const authMiddleware = { isAuthorize };
