import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import ApiError from '~/utils/ApiError';
import {
  ALLOW_COMMON_FILE_TYPES,
  LIMIT_COMMON_FILE_SIZE,
} from '~/utils/validators';

// đếu có trong https://www.npmjs.com/package/multer

const custumFileFilter = (req, file, callback) => {
  // đối với thằng multer, kiểm tra kiểu file thì sử dụng mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid. Only accept jpg, jpeg and png';
    return callback(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage),
      null
    );
  }
  // nếu như kiểu file hợp lệ
  return callback(null, true);
};

//tạo function upload bởi thằng multer
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: custumFileFilter,
});

export const multerUploadMiddleware = { upload };
