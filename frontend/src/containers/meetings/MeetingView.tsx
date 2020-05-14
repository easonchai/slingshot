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
  console.log(props);
  return {
      txHash: props.match.params.hash,
      contractAddress: props.match.params.address,
      user: state.userReducer.user,
      cachedMeeting: state.meetingsReducer.cachedMeeting,
      loading: state.loadingReducer.loading,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    dispatchGetCachedMeetingByTx: (txHash: string) => {
      dispatch(loadingActions.UpdateCachedMeetingLoading(true));

      axios
        .get('/api/meeting/tx/' + txHash)
        .then(res => res.data as Meeting)
        .then(meeting => {
          dispatch(meetingActions.ReadCachedMeeting(meeting));
          dispatch(loadingActions.UpdateCachedMeetingLoading(false));
        });
    },

    dispatchGetCachedMeetingByContractAddress: (address: string) => {
      dispatch(loadingActions.UpdateCachedMeetingLoading(true));

      axios
        .get('/api/meeting/contract/' + address)
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
        userAddress: user.ethereumAddress
      };
      
      axios
        .put('/api/meeting/rsvp', payload)
        .then(res => {
          dispatch(meetingActions.UpdateMeetingRSVPList(user.ethereumAddress));
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