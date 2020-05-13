import axios, { AxiosResponse } from 'axios';
import { Dispatch } from 'react';
import { Action, compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../../store/index';
import { MeetingView as Component } from '../../components/meetings/MeetingView';
import { actions as meetingActions, Meeting } from '../../store/meetings/actions';
import { actions as userActions, User } from '../../store/users/actions';

const mapStateToProps = (state: IAppState, props: any) => {
  return {
      user: state.userReducer.user,
      meeting:
          state.meetingsReducer.meetings.find(
              (meeting) =>
                  props.isContractAddress
                  ? meeting.meetingAddress === props.match.params.address
                  : meeting.txHash === props.match.params.hash
          )
  };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    /**
     * TODO: refactor duplicate function.
     * See containers/Home.tsx
     */
    dispatchGetAllMeetings: () => {
        axios
          .get('/api/meeting/all')
          .then(res => res.data as Array<Meeting>)
          .then(meetings => dispatch(meetingActions.ReadAllMeetings(meetings)));
    },

    /**
     * TODO: refactor duplicate function.
     * See containers/MeetingAdd.tsx
     */
    dispatchUpdateUserEthereumAddress: (payload: User) => {
      dispatch(userActions.UpdateUserEthereumAddress(payload));
    },
    
    dispatchUpdateRSVP: (meetingAddress: string, user: User) => {
      const payload = {
        meetingAddress: meetingAddress,
        user: user
      };
      
      axios
        .put('/api/meeting/rsvp', payload)
        .then((res: AxiosResponse<any>) => {
            const rsvpList = res.data as Array<User>;
            console.log(rsvpList);
            return rsvpList;
            
            //this.state.meeting.users = rsvpList;
            //dispatch(rsvpActions.UpdateRSVP(rsvpList));
        })
    }
  };
};

export const MeetingView = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Component);