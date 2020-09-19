import actionCreatorFactory from 'typescript-fsa';
import { AppActions } from '../constants';
import { Feedback, User } from '../interfaces';


const actionCreator = actionCreatorFactory();

export const CreateUserFeedback = actionCreator<Feedback>(AppActions.CREATE_USER_FEEDBACK);
export const UpdateUserEthereumAddress = actionCreator<User>(AppActions.UPDATE_USER_ETHEREUM_ADDRESS);
export const UpdateUserENSDomain = actionCreator<string>(AppActions.UPDATE_USER_ENS_DOMAIN);

export const actions = {
  CreateUserFeedback,
  UpdateUserEthereumAddress,
  UpdateUserENSDomain,
};
