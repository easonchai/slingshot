import { EventList as Component } from '../components/EventList';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../store/index';

const mapStateToProps = (state: IAppState) => {
  return {
    events: state.app.events,
  };
};

export const EventList = compose(
  connect(
    mapStateToProps
  )
)(Component);