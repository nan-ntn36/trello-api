import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';
import { GET_DB } from '~/config/mongodb';
import { BOARD_TYPES } from '~/utils/constants';
import { columnModel } from './columnModel';
import { cardModel } from './cardModel';
import { pagingSkipValue } from '~/utils/algorithms';
import { userModel } from './userModel';

// Define collectin schema

const BOARD_COLLECTION_NAME = 'boards';
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
  columnOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  //chủ board
  ownerIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  // Thành viên của board
  memberIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
});
// không cho phép cập nhật
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt'];

const validateBeforCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

const createNew = async (userId, data) => {
  try {
    const validData = await validateBeforCreate(data);
    const newBoardToAdd = { ...validData,
      ownerIds: [new ObjectId(userId)]
    }
    const createBoard = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .insertOne(newBoardToAdd);
    return createBoard;
  } catch (error) {
    throw new Error(error);
  }
};

const findOneById = async (id) => {
  try {
    // trả bản dữ liệu về
    return await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id),
      });
  } catch (error) {
    throw new Error(error);
  }
};

// getBoard
const getDetails = async (userId, boardId) => {
  try {
    // trả bản dữ liệu về
    // const result = await GET_DB()
    //   .collection(BOARD_COLLECTION_NAME)
    //   .findOne({
    //     _id: new ObjectId(id),
    //   });
    const queryConditions = [
      { _id: new ObjectId(boardId) },
      { _destroy: false },
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } },
        ],
      },
    ];
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        { $match: { $and: queryConditions } },
        {
          $lookup: {
            from: columnModel.COLUMN_COLLECTION_NAME,
            localField: '_id', //là giá trị mà ở bảng hiện hiện tại được đặt làm khóa ngoại ở bảng bên kia
            foreignField: 'boardId', // khóa ngoại bên bảng columns
            as: 'columns',
          },
        },
        {
          $lookup: {
            from: cardModel.CARD_COLLECTION_NAME,
            localField: '_id', //là giá trị mà ở bảng hiện hiện tại được đặt làm khóa ngoại ở bảng bên kia
            foreignField: 'boardId', // khóa ngoại bên bảng columns
            as: 'cards',
          },
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'ownerIds', //là giá trị mà ở bảng hiện hiện tại được đặt làm khóa ngoại ở bảng bên kia
            foreignField: '_id', // khóa ngoại bên bảng columns
            as: 'owners',
            //pipeline trong lookup là để xử lý môt hoặc nhiều luồng cần thiết
            //$project để chỉ định vài field không muốn lấy về bằng cách gán nó giá trị 0
            pipeline:[{ $project: { 'password': 0, 'verifyToken': 0 } }]
          },
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'memberIds', //là giá trị mà ở bảng hiện hiện tại được đặt làm khóa ngoại ở bảng bên kia
            foreignField: '_id', // khóa ngoại bên bảng columns
            as: 'members',
            pipeline:[{ $project: { 'password': 0, 'verifyToken': 0 } }]
          },
        },
      ])
      .toArray();
    return result[0] || null;
  } catch (error) {
    throw new Error(error);
  }
};

// push giá trị columnId vào cuối mảng columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(column.boardId),
        },
        {
          // thêm dữ liệu vào columnOrderIds
          $push: { columnOrderIds: new ObjectId(column._id) },
        },
        {
          // trả bản ghi mới nhất khi cập nhật
          returnDocument: 'after',
        }
      );

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

// push giá trị userId vào cuối mảng memberIds
const pushMemberIds = async (boarId, userId) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(boarId),
        },
        {
          // thêm dữ liệu vào memberIds
          $push: { memberIds: new ObjectId(userId) },
        },
        {
          // trả bản ghi mới nhất khi cập nhật
          returnDocument: 'after',
        }
      );

    return result;
  } catch (error) {
    throw new Error(error);
  }
};
// lấy 1 phần tử columnId ra khỏi mảng columnsOrderIds
// dùng $pull trong mongodbở trường hợp này để lấy một phần tử ra khỏi mảng r xóa nó đi
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(column.boardId),
        },
        {
          // thêm dữ liệu vào columnOrderIds
          $pull: { columnOrderIds: new ObjectId(column._id) },
        },
        {
          // trả bản ghi mới nhất khi cập nhật
          returnDocument: 'after',
        }
      );

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (boardId, updateData) => {
  // lọc những field mà ta k cho cập nhật linh tinh
  Object.keys(updateData).forEach((fieldName) => {
    if (INVALID_UPDATE_FIELDS.includes(fieldName)) delete updateData[fieldName];
  });

  if (updateData.columnOrderIds) {
    updateData.columnOrderIds = updateData.columnOrderIds.map(
      (_id) => new ObjectId(_id)
    );
  }
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(boardId),
        },
        {
          // thêm dữ liệu vào columnOrderIds
          $set: updateData,
        },
        {
          // trả bản ghi mới nhất khi cập nhật
          returnDocument: 'after',
        }
      );

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const queryConditions = [
      //Điều kiện 1 board chưa xóa
      { _destroy: false },
      // DK 2 cái thằng userId gửi request có phải thuộc vào trong 2 mảng ownerIds và memberIds, sử dụng toán tử $all của mongodb
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } },
        ],
      },
    ];
    const query = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        { $match: { $and: queryConditions } },
        //sort title của board theo A- Z (mặc định sẽ bị chữ B đứng trước  chữ a thường theo chuẩn ASCII)
        { $sort: { title: 1 } },
        // $facet để xử lý nhiều luồn trong 1 query
        {
          $facet: {
            // luốn thứ 1 là Query boards
            'queryBoards': [
              { $skip: pagingSkipValue(page, itemsPerPage) }, // bỏ qua số lượng bản ghi của những page trước đó
              { $limit: itemsPerPage }], //giới hạn tối đa số lượng bản ghi trả về trên 1 page
            // Luồn thứ 2 query đến tổng số lượng bản ghi boards
            'queryTotalBoards': [{ $count: 'countedAllBoards' }],
          },
        },
      ],
      {
        // khai báo thuộc tính collation locale 'en' để fix vụ chữ B hoa và chữ a thường ở trên
        collation: { locale : 'en' }
      }
      ).toArray();
    const res = query[0];
    return {
      boards:res.queryBoards || [],
      toltalBoards:res.queryTotalBoards[0]?.countedAllBoards || 0
    }
  } catch (error) {
    throw new Error(error);
  }
};
export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds,
  getBoards,
  pushMemberIds
};
