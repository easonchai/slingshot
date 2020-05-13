import { AppActions } from '../../constants';
import { IActionUnion, makeAction } from '../../types';
import { Meeting } from '../types';

export const ReadAllMeetings = makeAction<AppActions, Array<Meeting> >(AppActions.READ_ALL_MEETINGS);

export const actions = {
  ReadAllMeetings,
};

export type IAction = IActionUnion<typeof actions>;
