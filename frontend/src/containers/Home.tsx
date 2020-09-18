import axios from 'axios';
import { Dispatch } from 'react';
import { Action, compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../store/index';
import { Home as Component } from '../components/Home';
import { actions as clubActions, Club } from '../store/clubs/actions';
import { actions as meetingActions, Meeting } from '../store/meetings/actions';

const mapStateToProps = (state: IAppState) => {
  return {
  };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    dispatchGetAllClubs: () => {
      axios
        .get('/api/club/all')
        .then(res => res.data as Array<Club>)
        .then(clubs => dispatch(clubActions.ReadAllClubs(clubs)))
    },

    dispatchGetAllMeetings: () => {
        axios
          .get('/api/meeting/all')
          .then(res => res.data as Array<Meeting>)
          .then(meetings => dispatch(meetingActions.ReadAllMeetings(meetings)))
    }
  };
};

export const Home = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Component);