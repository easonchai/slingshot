import { EventList as Component } from '../components/EventList';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../store/index';

const mapStateToProps = (state: IAppState, props: { isEnded: boolean }) => {
  return { events: 
    state.app.events.filter((event) => {
      return event.isEnded === props.isEnded;
    })
  };
};

export const EventList = compose(
  connect(
    mapStateToProps
  )
)(Component);