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

export const invitationService = {
  createNewBoardInvitation,
};
