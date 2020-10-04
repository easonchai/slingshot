import axios from 'axios';
import { Dispatch } from 'react';
import { Action, compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../../store/index';
import { UsersList as Component } from '../../components/users/UsersList';
import { actions as loadingActions } from '../../store/loading/actions';
import { actions as meetingActions } from '../../store/meetings/actions';
import { actions as notificationActions, Notification } from '../../store/notifications/actions';

const mapStateToProps = (state: IAppState) => {
  return {
    cachedMeeting: state.meetingsReducer.cachedMeeting,
    userWallet: state.userReducer.user._id,
    loading: state.loadingReducer.loading,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    dispatchHandleMarkAttendanceConfirmationLoading: (status: boolean) => {
      dispatch(loadingActions.UpdateMarkAttendanceConfirmationLoading(status));
    },

    dispatchHandleMarkAttendance: (meetingAddress: string, participantAddress: string) => {
      dispatch(loadingActions.UpdateMarkAttendanceConfirmationLoading(true));

      const payload = {
        meetingAddress: meetingAddress,
        userAddress: participantAddress
      };

      axios
        .put('/api/meeting/attendance', payload)
        .then(res => {
          dispatch(meetingActions.UpdateHandleAttendance(payload));
          dispatch(loadingActions.UpdateMarkAttendanceConfirmationLoading(false));
        });
    },

    dispatchHandleMarkAbsence: (meetingAddress: string, participantAddress: string) => {
      dispatch(loadingActions.UpdateMarkAbsenceConfirmationLoading(true));

      const payload = {
        meetingAddress: meetingAddress,
        userAddress: participantAddress
      };

      axios
        .put('/api/meeting/absence', payload)
        .then(res => {
          dispatch(meetingActions.UpdateHandleAbsence(payload));
          dispatch(loadingActions.UpdateMarkAbsenceConfirmationLoading(false));
        });
    },

    dispatchHandleWithdraw: (meetingAddress: string, participantAddress: string) => {
      const payload = {
        meetingAddress: meetingAddress,
        userAddress: participantAddress
      };

      axios
        .put('/api/meeting/withdraw', payload)
        .then(res => {
          dispatch(meetingActions.UpdateUserWithdraw(payload));
        });
      // axios
      //   .delete('/api/meeting/attend', payload)
      //   .then(res => {
      //     dispatch(meetingActions.UpdateUserWithdraw(payload));
      //   });
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
};

export const UsersList = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Component);