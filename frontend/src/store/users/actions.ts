import { AppActions } from '../constants';
import { IActionUnion, makeAction } from '../types';

export interface User {
  ethereumAddress: string;
}

export const UpdateUserEthereumAddress = makeAction<AppActions, User>(AppActions.UPDATE_USER_ETHEREUM_ADDRESS);

export const actions = {
  UpdateUserEthereumAddress,
};

export type IAction = IActionUnion<typeof actions>;
