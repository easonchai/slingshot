import axios, { AxiosResponse } from 'axios';
import { Dispatch } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../store/index';
import { Home as Component } from '../components/Home';
import { IAction as IActionMeeting, actions as meetingActions } from '../store/meetings/all/actions';
import { Meeting } from '../store/meetings/types';

const mapStateToProps = (state: IAppState) => {
  return {
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

export const Home = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Component);