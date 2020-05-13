import axios, { AxiosResponse } from 'axios';
import { Dispatch } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../../store/index';
import { MeetingView as Component } from '../../components/meetings/MeetingView';
import { IAction as IActionMeeting, actions as meetingActions } from '../../store/meetings/all/actions';
import { Meeting } from '../../store/meetings/types';
import { User } from '../../store/users/actions';

const mapStateToProps = (state: IAppState, props: any) => {
  return {
      user: state.userReducer.user,
      meeting:
          state.allMeetingsReducer.meetings.find(
              (meeting) =>
                  props.isContractAddress
                  ? meeting.meetingAddress === props.match.params.address
                  : meeting.txHash === props.match.params.hash
          )
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IActionMeeting>) => {
  return {
    dispatchGetAllMeetings: () => {
        axios
          .get('/api/meeting/all')
          .then((res: AxiosResponse<any>) => {
              const meetings = res.data as Array<Meeting>;
              dispatch(meetingActions.ReadAllMeetings(meetings));
          })
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