import axios from 'axios';
import { Dispatch } from 'react';
import { compose, Action } from 'redux';
import { connect } from 'react-redux';
import { History } from 'history';
import { actions as meetingActions, Meeting, GroupHashAndAddress } from '../../store/meetings/actions';
import { actions as loadingActions } from '../../store/loading/actions';
import { actions as userActions, User } from '../../store/users/actions';
import { IAppState } from '../../store/index';
import { MeetingAdd as Component } from '../../components/meetings/MeetingAdd';
import { actions as notificationActions, Notification } from '../../store/notifications/actions';

const mapStateToProps = (state: IAppState) => {
  return {
    user: state.userReducer.user,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    dispatchCreateFirstMeeting: (history: History, payload: Meeting) => {
      dispatch(loadingActions.UpdateMeetingDeploymentLoading(true));

      axios
        .post('/api/meeting/create', payload)
        .then(res => {
          dispatch(meetingActions.CreateFirstMeeting(payload));
          history.push('/meeting/' + payload._id);
        });
    },

    dispatchUpdateMeetingContractAddress: (history: History, payload: GroupHashAndAddress) => {
      axios
        .put('/api/meeting/update', payload)
        .then(res => {
          dispatch(meetingActions.UpdateMeetingContractAddress(payload));
          dispatch(loadingActions.UpdateMeetingDeploymentLoading(false));

          history.push('/meeting/' + payload.meetingAddress);
        });
    },

    dispatchUpdateOrganiserEthereumAddress: (organiserAddress: string) => {
      dispatch(meetingActions.UpdateOrganiserEthereumAddress(organiserAddress));
    },

    dispatchAddNotification: (notification: Notification) => {
      dispatch(notificationActions.AddNotification(notification));
    },

    dispatchAddErrorNotification: (message: string) => {
      const notification: Notification = {
        message: message,
        variant: 'filled',
        severity: 'error',
        display: true
      };

      dispatch(notificationActions.AddNotification(notification));
    }
  };
}

export const MeetingAdd = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Component);