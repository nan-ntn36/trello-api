/* eslint-disable no-useless-catch */
import { pickUser } from '~/utils/formatters';
import { boardModel } from '~/models/boardModel';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { userModel } from '~/models/userModel';
import { invitationModel } from '~/models/invitationModel';
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants';

const createNewBoardInvitation = async (reqBody, invitedId) => {
  try {
    //người đi mời
    const inviter = await userModel.findOneById(invitedId);
    //người được mời
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail);
    // tìm board
    const board = await boardModel.findOneById(reqBody.boardId);

    // console.log(inviter._id);
    // console.log(invitee._id);
    // console.log(board._id);

    if (!invitee || !inviter || !board)
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Inviter, Invitee or board not found'
      );

    const newInvitationData = {
      invitedId,
      inviteeId: invitee._id.toString(),
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING,
      },
    };

    // gọi model lưu db
    const createdInvitation = await invitationModel.createNewBoardInvitation(
      newInvitationData
    );
    const getInvitation = await invitationModel.findOneById(
      createdInvitation.insertedId.toString()
    );

    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
    };
    return resInvitation;
  } catch (error) {
    throw error;
  }
};
const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId);
    //vì các dữ liệu đang ở giá trị mảng 1 phần tử, nên ta biến đổi nó về thành Json object
    const resInvitation = getInvitations.map((i) => ({
      ...i,
      inviter: i.inviter[0] || {},
      invitee: i.invitee[0] || {},
      board: i.board[0] || {},
    }));

    return resInvitation;
  } catch (error) {
    throw error;
  }
};

const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    // tìm bản ghi
    const getInvitations = await invitationModel.findOneById(invitationId);

    if (!getInvitations)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found');
    const boardId = getInvitations.boardInvitation.boardId;
    const getBoard = await boardModel.findOneById(boardId);
    if (!getBoard)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found');

    // kiểm tra khi accept join board thì xem coi đã là owner hay member của board hay chưa

    const boardOwnerAndMemberIds = [
      ...getBoard.ownerIds,
      ...getBoard.memberIds,
    ].toString();

    if (
      status === BOARD_INVITATION_STATUS.ACCEPTED &&
      boardOwnerAndMemberIds.includes(userId)
    ) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'You are already a member of this board.'
      );
    }

    //update ban gi
    const updateData = {
      boardInvitation: {
        ...getInvitations.boardInvitation,
        status: status,
      },
    };

    //cập nhật status bản ghi
    const updatedInvitation = await invitationModel.update(
      invitationId,
      updateData
    );
    // trường hợp accept thành công thì lưu vào board -> memberIds
    if (
      updatedInvitation.boardInvitation.status ===
      BOARD_INVITATION_STATUS.ACCEPTED
    ) {
      await boardModel.pushMemberIds(boardId, userId);
    }

    return updatedInvitation;
  } catch (error) {
    throw error;
  }
};

export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation,
};
