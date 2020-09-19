import { compose, Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../../store/index';
import { MeetingPreview as Component } from '../../components/meetings/MeetingPreview';
import { actions as loadingActions } from '../../store/loading/actions';
import { actions as notificationActions, Notification } from '../../store/notifications/actions';
import { actions as meetingActions } from '../../store/meetings/actions';
import { Meeting } from '../../store/interfaces';
import axios from 'axios';


const mapStateToProps = (state: IAppState, props: { meeting: Meeting }) => {
  return {
    user: state.userReducer.user,
    loading: state.loadingReducer.loading,
    cachedMeeting: state.meetingsReducer.cachedMeeting
  };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
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
  }
}

export const MeetingPreview = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Component);