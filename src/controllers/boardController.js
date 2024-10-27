/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes';
import { boarService } from '~/services/boardService';

const createNew = async (req, res, next) => {
  try {
    // điều hướng dữ liệu sang services để xữ lý logic
    const createBoard = await boarService.createNew(req.body);
    console.log(createBoard);
    //Có kết quả thì trả về phía client
    res.status(StatusCodes.CREATED).json(createBoard);
  } catch (error) {
    next(error); // chuyển lỗi đến middleware
  }
};

// query tổng hợp (aggregate)

const getDetails = async (req, res, next) => {
  try {
    const boardId = req.params.id;
    const board = await boarService.getDetails(boardId);

    res.status(StatusCodes.OK).json(board);
  } catch (error) {
    next(error);
  }
};

export const boardController = { createNew, getDetails };
