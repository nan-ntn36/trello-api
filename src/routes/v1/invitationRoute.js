import express from 'express';
import { invitationValidation } from '~/validations/invitationValidation';
import { invitationController } from '~/controllers/invitationController';
import { authMiddleware } from '~/middlewares/authMiddleware';
const Router = express.Router();

Router.route('/board').post(
  authMiddleware.isAuthorize,
  invitationValidation.createNewBoardInvitation,
  invitationController.createNewBoardInvitation
);
// get invitations user
Router.route('/').get(
  authMiddleware.isAuthorize,
  invitationController.getInvitations
);

Router.route('/board/:invitationId').put(
  authMiddleware.isAuthorize,
  invitationController.updateBoardInvitationId
);

export const invitationRoute = Router;
