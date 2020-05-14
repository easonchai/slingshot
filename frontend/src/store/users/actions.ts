import actionCreatorFactory from 'typescript-fsa';
import { AppActions } from '../constants';

export interface User {
  ethereumAddress: string;
}

const actionCreator = actionCreatorFactory();

export const UpdateUserEthereumAddress = actionCreator<User>(AppActions.UPDATE_USER_ETHEREUM_ADDRESS);

export const actions = {
  UpdateUserEthereumAddress,
};
