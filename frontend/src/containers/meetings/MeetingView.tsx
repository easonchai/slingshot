import axios from 'axios';
import { Dispatch } from 'react';
import { Action, compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../../store/index';
import { MeetingView as Component } from '../../components/meetings/MeetingView';
import { actions as notificationActions, Notification } from '../../store/notifications/actions';
import { actions as meetingActions, Meeting } from '../../store/meetings/actions';
import { actions as loadingActions } from '../../store/loading/actions';

const mapStateToProps = (state: IAppState, props: any) => {
  return {
    id: props.match.params.id,
    user: state.userReducer.user,
    cachedMeeting: state.meetingsReducer.cachedMeeting,
    meetings: state.meetingsReducer.meetings,
    loading: state.loadingReducer.loading,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    dispatchGetAllMeetings: () => {
      axios
        .get('/api/meeting/all')
        .then(res => res.data as Array<Meeting>)
        .then(meetings => dispatch(meetingActions.ReadAllMeetings(meetings)))
    },

    dispatchGetCachedMeetingById: (id: string) => {
      dispatch(loadingActions.UpdateCachedMeetingLoading(true));

      axios
        .get('/api/meeting/id/' + id)
        .then(res => res.data as Meeting)
        .then(meeting => {
          dispatch(meetingActions.ReadCachedMeeting(meeting));
          dispatch(loadingActions.UpdateCachedMeetingLoading(false));
        });
    },

    dispatchUpdateRSVP: (meetingAddress: string, userAddress: string) => {
      dispatch(loadingActions.UpdateRsvpConfirmationLoading(true));

      const payload = {
        meetingAddress: meetingAddress,
        userAddress: userAddress
      };

      axios
        .put('/api/meeting/rsvp/add', payload)
        .then(res => {
          dispatch(meetingActions.UpdateRSVPList(payload));
        });
    },

    dispatchUpdateRsvpConfirmationLoading: (status: boolean) => {
      dispatch(loadingActions.UpdateRsvpConfirmationLoading(status));
    },

    dispatchUpdateRsvpCancellation: (meetingAddress: string, userAddress: string) => {
      dispatch(loadingActions.UpdateRsvpCancellationConfirmationLoading(true));

      const payload = {
        meetingAddress: meetingAddress,
        userAddress: userAddress
      };

      axios
        .put('/api/meeting/rsvp/cancel', payload)
        .then(res => {
          dispatch(meetingActions.UpdateRSVPListCancellation(payload));
        });
    },

    dispatchUpdateRsvpCancellationConfirmationLoading: (status: boolean) => {
      dispatch(loadingActions.UpdateRsvpCancellationConfirmationLoading(status));
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

    dispatchUpdateHandleStartMeeting: (meetingAddress: string) => {
      dispatch(loadingActions.UpdateStartMeetingConfirmationLoading(true));

      const payload = {
        meetingAddress: meetingAddress,
      };

      axios
        .put('/api/meeting/start', payload)
        .then(res => {
          dispatch(meetingActions.UpdateStartMeeting(meetingAddress));
        });
    },

    dispatchUpdateHandleStartMeetingConfirmationLoading: (status: boolean) => {
      dispatch(loadingActions.UpdateStartMeetingConfirmationLoading(status));
    },

    dispatchUpdateHandleEndMeeting: (meetingAddress: string) => {
      dispatch(loadingActions.UpdateEndMeetingConfirmationLoading(true));

      const payload = {
        meetingAddress: meetingAddress,
      };

      axios
        .put('/api/meeting/end', payload)
        .then(res => {
          dispatch(meetingActions.UpdateEndMeeting(meetingAddress));
        });
    },

    dispatchUpdateHandleEndMeetingConfirmationLoading: (status: boolean) => {
      dispatch(loadingActions.UpdateEndMeetingConfirmationLoading(status));
    },

    dispatchUpdateHandleCancelMeeting: (meetingAddress: string) => {
      dispatch(loadingActions.UpdateCancelMeetingConfirmationLoading(true));

      const payload = {
        meetingAddress: meetingAddress,
      };

      axios
        .put('/api/meeting/cancel', payload)
        .then(res => {
          dispatch(meetingActions.UpdateCancelMeeting(meetingAddress));
        });
    },

    dispatchUpdateHandleCancelMeetingConfirmationLoading: (status: boolean) => {
      dispatch(loadingActions.UpdateCancelMeetingConfirmationLoading(status));
    },

    dispatchUpdateWithdraw: (meetingAddress: string, userAddress: string) => {
      const payload = {
        meetingAddress: meetingAddress,
        userAddress: userAddress
      };

      axios
        .put('/api/meeting/withdraw', payload)
        .then(res => {
          dispatch(meetingActions.UpdateUserWithdraw(payload));
        });
    }
  };
};

export const MeetingView = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Component);