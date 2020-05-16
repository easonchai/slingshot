import actionCreatorFactory from 'typescript-fsa';
import { AppActions } from '../constants';

// TODO refactor duplicate
export const ModelType = {
  USER: 'user',
  MEETING: 'meeting',
  PENDING: 'pending'
};

export interface User {
  _id: string,
  type: string,
  //data: {};

  // list of meeting wallets (smart contract address) linked to this user profile per status
  cancel: ReadonlyArray<string>,
  rsvp: ReadonlyArray<string>,
  attend: ReadonlyArray<string>,
  withdraw: ReadonlyArray<string>
}

const actionCreator = actionCreatorFactory();

export const UpdateUserEthereumAddress = actionCreator<User>(AppActions.UPDATE_USER_ETHEREUM_ADDRESS);

export const actions = {
  UpdateUserEthereumAddress,
};
