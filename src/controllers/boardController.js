/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes';
import { boardService } from '~/services/boardService';

const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    // điều hướng dữ liệu sang services để xữ lý logic
    const createBoard = await boardService.createNew(userId, req.body);
    //Có kết quả thì trả về phía client
    res.status(StatusCodes.CREATED).json(createBoard);
  } catch (error) {
    next(error); // chuyển lỗi đến middleware
  }
};

// query tổng hợp (aggregate)

const getDetails = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const boardId = req.params.id;
    const board = await boardService.getDetails(userId, boardId);

    res.status(StatusCodes.OK).json(board);
  } catch (error) {
    next(error);
  }
};

const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    // page và  itemsPerPage được truyên vào trong query url từ phía FE nên BE sẽ lấy thông qua req.body
    const { page, itemsPerpage } = req.query;
    const board = await boardService.getBoards(userId, page, itemsPerpage);

    res.status(StatusCodes.OK).json(board);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id;
    const updatedBoard = await boardService.update(boardId, req.body);
    res.status(StatusCodes.OK).json(updatedBoard);
  } catch (error) {
    next(error);
  }
};
const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumn(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};
export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards,
};
