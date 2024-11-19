import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { boardRoute } from '~/routes/v1/boardRoute';
import { columnsRoute } from '~/routes/v1/columnsRoute';
import { cardsRoute } from '~/routes/v1/cardsRoute';
import { invitationRoute } from '~/routes/v1/invitationRoute';
import { userRoute } from '~/routes/v1/userRoute';
const Router = express.Router();

// Check API v1 status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'API v1 to ready to use' });
});

// User APIs
Router.use('/users', userRoute);
// Board APIs
Router.use('/boards', boardRoute);
// Column APIs
Router.use('/columns', columnsRoute);
// Card APIs
Router.use('/cards', cardsRoute);
// invitations Api
Router.use('/invitations', invitationRoute);
export const APIs_V1 = Router;
