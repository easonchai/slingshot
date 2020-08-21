import axios from 'axios';
import { Dispatch } from 'react';
import { compose, Action } from 'redux';
import { connect } from 'react-redux';
import { History } from 'history';
import { actions as meetingActions, Meeting, GroupHashAndAddress } from '../../store/meetings/actions';
import { User } from '../../store/users/actions';
import { actions as loadingActions } from '../../store/loading/actions';
import { IAppState } from '../../store/index';
import { MeetingAdd as Component } from '../../components/meetings/MeetingAdd';
import { actions as notificationActions, Notification } from '../../store/notifications/actions';

const mapStateToProps = (state: IAppState, props: any) => {
  return {
    parent: props.match.params.parent,
    user: state.userReducer.user,
    cachedMeeting: state.meetingsReducer.cachedMeeting,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    dispatchUpdateCachedMeeting: (meeting: Meeting) => {
      dispatch(meetingActions.ReadCachedMeeting(meeting));
    },

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
          console.log(res, payload);
          dispatch(meetingActions.UpdateMeetingContractAddress(payload));
          dispatch(loadingActions.UpdateMeetingDeploymentLoading(false));

          history.push('/meeting/' + payload.meetingAddress);
        });
    },

    dispatchUpdateOrganiserEthereumAddress: (user: User) => {
      dispatch(meetingActions.UpdateOrganiserEthereumAddress(user));
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
    },

    dispatchAddSuccessNotification: (message: string) => {
      const notification: Notification = {
        message: message,
        variant: 'filled',
        severity: 'info',
        display: true
      };

      dispatch(notificationActions.AddNotification(notification));
    },

    dispatchCreateNextMeeting: (history: History, meeting: Meeting) => {
      dispatch(loadingActions.UpdateMeetingDeploymentLoading(true));
      // TODO: update parent / child links
      axios
        .post('/api/meeting/create', meeting)
        .then(res => {
          dispatch(meetingActions.CreateNextMeeting(meeting));
          history.push('/meeting/' + meeting._id);
        });
    },

    dispatchIsClubNameUnique: (name: string) => {
      return axios.get('/api/club/names')
        .then(names => {
            return names.data.indexOf(name) === -1;
          }
        );
    }
  };
}

export const MeetingAdd = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Component);