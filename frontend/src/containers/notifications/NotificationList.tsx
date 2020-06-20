import { Dispatch } from 'react';
import { compose, Action } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../../store/index';
import { actions as notificationActions } from '../../store/notifications/actions';
import { NotificationList as Component } from '../../components/notifications/NotificationList';

const mapStateToProps = (state: IAppState) => {
  return {
    notifications: state.notificationReducer.notifications.slice()
  };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    dispatchRemoveNotification: (index: number) => {
      dispatch(notificationActions.RemoveNotification(index));
    }

  };
};

export const NotificationList = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Component);