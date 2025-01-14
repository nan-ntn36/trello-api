/* eslint-disable no-console */
import express from 'express';
import exitsHook from 'async-exit-hook';
import cors from 'cors';

import { CONECT_DB, CLOSE_DB } from '~/config/mongodb';
import { env } from '~/config/environment';
import { APIs_V1 } from '~/routes/v1';
import { corsOptions } from './config/cors';
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware';
import cookieParser from 'cookie-parser';
import socketIo from 'socket.io';
import http from 'http';
import swaggerUi from 'swagger-ui-express';
import mergedSwafferSpec from '~/config/swaggerOptions'


const START_SERVER = () => {
  const app = express();
  // Fix cache from dick của express
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  // cấu hình cookie
  app.use(cookieParser());

  app.use(cors(corsOptions));
  //bật request json body data
  app.use(express.json());
  // swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(mergedSwafferSpec));
  // sử dụng api v1
  app.use('/v1', APIs_V1);

  //middleware xữ lý lỗi tập trung
  app.use(errorHandlingMiddleware);
  // Tạo server mới bọc thằng app của express để làm real time của socketIO
  const server = http.createServer(app);
  //khỏi tạo biến IO với sever và cors
  const io = socketIo(server, { cors: corsOptions });
  // eslint-disable-next-line no-unused-vars
  io.on('connection', (socket) => {
    console.log('a user connected');
    // lắng nghe sự kiện FE gửi lên
    socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
      //cách làm nhanh nhát : emit ngược lại một sự kiện về cho phía client khác (ngoại trừ cái chính thằng gửi request lên)
      socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation);
    });
  });
  // dùng server.listen thay cho app.listen
  //  môi trường production đang support
  if (env.BUILD_MODE === 'production') {
    server.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(` Production ,I am running at ${process.env.PORT}/ `);
    });
  } else {
    // mt local dev
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      // eslint-disable-next-line no-console
      console.log(
        `Hello ${env.AUTHOR}, I am running at ${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}/ `
      );
    });
  }

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
