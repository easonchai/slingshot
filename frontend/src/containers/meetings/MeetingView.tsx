import axios from 'axios';
import { Dispatch } from 'react';
import { Action, compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../../store/index';
import { MeetingView as Component } from '../../components/meetings/MeetingView';
import { actions as notificationActions, Notification } from '../../store/notifications/actions';
import { actions as meetingActions, Meeting } from '../../store/meetings/actions';
import { actions as userActions, User } from '../../store/users/actions';
import { actions as loadingActions } from '../../store/loading/actions';

const mapStateToProps = (state: IAppState, props: any) => {
  return {
      id: props.match.params.id,
      user: state.userReducer.user,
      cachedMeeting: state.meetingsReducer.cachedMeeting,
      loading: state.loadingReducer.loading,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
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

    /**
     * TODO: refactor duplicate function.
     * See containers/MeetingAdd.tsx
     */
    dispatchUpdateUserEthereumAddress: (payload: User) => {
      dispatch(userActions.UpdateUserEthereumAddress(payload));
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
    }
    
  };
};

export const MeetingView = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Component);