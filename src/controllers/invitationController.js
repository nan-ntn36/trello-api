import { StatusCodes } from 'http-status-codes';
import { invitationService } from '~/services/invitationService';

const createNewBoardInvitation = async (req, res, next) => {
  try {
    // người đi mời
    const invitedId = req.jwtDecoded._id;
    // điều hướng dữ liệu sang services để xữ lý logic
    const resInvitations = await invitationService.createNewBoardInvitation(
      req.body,
      invitedId
    );
    //Có kết quả thì trả về phía client
    res.status(StatusCodes.CREATED).json(resInvitations);
  } catch (error) {
    next(error); // chuyển lỗi đến middleware
  }
};
const getInvitations = async (req, res, next) => {
  try {
    // người đi mời
    const userId = req.jwtDecoded._id;
    // điều hướng dữ liệu sang services để xữ lý logic
    const resInvitations = await invitationService.getInvitations(userId);
    //Có kết quả thì trả về phía client
    res.status(StatusCodes.CREATED).json(resInvitations);
  } catch (error) {
    next(error); // chuyển lỗi đến middleware
  }
};

const updateBoardInvitationId = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const { invitationId } = req.params;
    const { status } = req.body;
    const updatedInvitation = await invitationService.updateBoardInvitation(
      userId,
      invitationId,
      status
    );

    res.status(StatusCodes.OK).json(updatedInvitation);
  } catch (error) {
    next(error); // chuyển lỗi đến middleware
  }
};
export const invitationController = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitationId,
};
