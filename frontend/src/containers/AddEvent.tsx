import { AddEvent as Component } from '../components/AddEvent';
import { Dispatch } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { actions, Event, GroupHashAndAddress } from '../store/events/actions';
import { IAction  } from '../store/types';
import { IAppState } from '../store/index';

const mapStateToProps = (state: IAppState) => {
  return {
    events: state.app.events
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IAction>) => {
  return {
    dispatchCreateFirstMeeting: (payload: Event) => dispatch(actions.CreateFirstMeeting(payload)),
    dispatchUpdateMeetingContractAddress: (payload: GroupHashAndAddress) => dispatch(actions.UpdateMeetingContractAddress(payload)),
  };
};

export const AddEvent = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Component);