import { AddEvent as Component } from '../components/AddEvent';
import { Dispatch } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAction, SetEvent, Event } from '../store/events/actions'
import { IAppState } from '../store/index';

const mapStateToProps = (state: IAppState) => {
  return {
    events: state.app.events
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IAction>) => {
  return {
    dispatchAddEvent: (event: Event) => dispatch(SetEvent(event))
  };
};

export const AddEvent = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Component);