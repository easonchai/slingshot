import axios, { AxiosResponse } from 'axios';
import { Dispatch } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAction as IActionMeeting, actions as meetingActions } from '../../store/meetings/new/actions';
import { Meeting, GroupHashAndAddress } from '../../store/meetings/types';
import { IAction as IActionUser, actions as userActions, User } from '../../store/users/actions';
import { IAppState } from '../../store/index';
import { MeetingAdd as Component } from '../../components/meetings/MeetingAdd';

const mapStateToProps = (state: IAppState) => {
  return {
    user: state.userReducer.user
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IActionMeeting | IActionUser>) => {
  return {
    dispatchCreateFirstMeeting: (payload: Meeting) => {
        console.log(payload);
        axios
          .post('/api/meeting/create', payload)
          .then((res: AxiosResponse<any>) => {
              dispatch(meetingActions.CreateFirstMeeting(payload));
          })
    },

    dispatchUpdateMeetingContractAddress: (payload: GroupHashAndAddress) => {
        axios
        .put('/api/meeting/update', payload)
        .then((res: AxiosResponse<any>) => {
            dispatch(meetingActions.UpdateMeetingContractAddress(payload))
        })
    },

    dispatchUpdateUserEthereumAddress: (payload: User) => dispatch(userActions.UpdateUserEthereumAddress(payload)),
  };
};

export const MeetingAdd = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Component);