import { AddEvent as Component } from '../components/AddEvent';
import { Dispatch } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAction, SetEvent } from '../store/events/actions'
import { IAppState } from '../store/index';

const mapStateToProps = (state: IAppState) => {
  return {
    events: state.app.events
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IAction>) => {
  return { 
    dispatchAddEvent: (eventName: string) => dispatch(SetEvent({ name: eventName, isEnded: false, address: "0x0000" }))
  };
};

export const AddEvent = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Component);