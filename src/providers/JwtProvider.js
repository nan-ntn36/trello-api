import JWT from 'jsonwebtoken';

// func tạo mới token- cần 3 tham số đầu vào
/**
 * userInfo: Những thông tin muốn đính kèm vào token
 * secretSignature:Chữ ký bí mật (dạng 1 chuỗi string ngẩu nhiên) trên docs thì để là privateKey
 * tokeLife: thời gian sống của token
 */
const generateToken = async (userInfor, secretSignature, tokenLife) => {
  try {
    return JWT.sign(userInfor, secretSignature, {
      algorithm: 'HS256',
      expiresIn: tokenLife,
    });
  } catch (error) {
    throw new Error(error);
  }
};

// Kiểm tra token có đúng với chữ ký secretSignature không
const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature);
  } catch (error) {
    throw new Error(error);
  }
};

export const JwtProvider = {
  generateToken,
  verifyToken,
};
