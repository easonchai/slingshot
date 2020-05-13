import axios, { AxiosResponse } from 'axios';
import { Dispatch } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../../store/index';
import { MeetingView as Component } from '../../components/meetings/MeetingView';
import { IAction as IActionMeeting, actions as meetingActions } from '../../store/meetings/all/actions';
import { Meeting } from '../../store/meetings/types';

const mapStateToProps = (state: IAppState, props: any) => {
  return {
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
    }
  };
};

export const MeetingView = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Component);