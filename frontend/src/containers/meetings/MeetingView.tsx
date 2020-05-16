import axios from 'axios';
import { Dispatch } from 'react';
import { Action, compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../../store/index';
import { MeetingView as Component } from '../../components/meetings/MeetingView';
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
    
    dispatchUpdateRSVP: (meetingAddress: string, user: User) => {
      dispatch(loadingActions.UpdateCachedMeetingLoading(true));

      const payload = {
        meetingAddress: meetingAddress,
        userAddress: user._id
      };
      
      axios
        .put('/api/meeting/rsvp', payload)
        .then(res => {
          dispatch(meetingActions.UpdateRSVPList(payload));
          dispatch(loadingActions.UpdateCachedMeetingLoading(false));
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