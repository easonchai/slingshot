import actionCreatorFactory from 'typescript-fsa';
import { AppActions } from '../constants';
import { AlertProps } from '@material-ui/lab';


export interface Notification {
  message: string;
  variant: AlertProps['variant'];
  severity: AlertProps['severity'];
  display: boolean;
}

const actionCreator = actionCreatorFactory();

export const AddNotification = actionCreator<Notification>(AppActions.ADD_NOTIFICATION);
export const RemoveNotification = actionCreator<number>(AppActions.REMOVE_NOTIFICATION);

export const actions = {
  AddNotification,
  RemoveNotification,
};
