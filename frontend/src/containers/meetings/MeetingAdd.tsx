import axios, { AxiosResponse } from 'axios';
import { Dispatch } from 'react';
import { compose, Action } from 'redux';
import { connect } from 'react-redux';
import { actions as meetingActions, Meeting, GroupHashAndAddress } from '../../store/meetings/actions';
import { actions as userActions, User } from '../../store/users/actions';
import { IAppState } from '../../store/index';
import { MeetingAdd as Component } from '../../components/meetings/MeetingAdd';

const mapStateToProps = (state: IAppState) => {
  return {
    user: state.userReducer.user,
    newMeeting: state.meetingsReducer.newMeeting
  };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    dispatchCreateFirstMeeting: (payload: Meeting) => {
        axios
          .post('/api/meeting/create', payload)
          .then(res => dispatch(meetingActions.CreateFirstMeeting(payload)));
    },

    dispatchUpdateMeetingContractAddress: (payload: GroupHashAndAddress) => {
        axios
          .put('/api/meeting/update', payload)
          .then(res => dispatch(meetingActions.UpdateMeetingContractAddress(payload)));
    },

    dispatchUpdateUserEthereumAddress: (payload: User) => {
        dispatch(userActions.UpdateUserEthereumAddress(payload));
    }
  };
};

export const MeetingAdd = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Component);