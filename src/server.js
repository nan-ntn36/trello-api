/* eslint-disable no-console */
import express from 'express';
import exitsHook from 'async-exit-hook';
import cors from 'cors';

import { CONECT_DB, CLOSE_DB } from '~/config/mongodb';
import { env } from '~/config/environment';
import { APIs_V1 } from '~/routes/v1';
import { corsOptions } from './config/cors';
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware';

const START_SERVER = () => {
  const app = express();
  app.use(cors(corsOptions));
  //bật request json body data
  app.use(express.json());

  // sử dụng api v1
  app.use('/v1', APIs_V1);

  //middleware xữ lý lỗi tập trung
  app.use(errorHandlingMiddleware);

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(
      `Hello ${env.AUTHOR}, I am running at ${env.APP_HOST}:${env.APP_PORT}/ `
    );
  });

  // đóng kết nối, thực hiện các tác vụ cleanup trước khi dừng server
  exitsHook(() => {
    console.log('Disconnect DB');
    CLOSE_DB();
  });
};

(async () => {
  try {
    console.log('1.Connecting to Mongodb');
    await CONECT_DB();
    console.log('2.Connecting to Mongodb');
    // khởi động Server BE sau khi kết nối vs DB
    START_SERVER();
  } catch (error) {
    console.log(error);
    process.exit(0);
  }
})();
