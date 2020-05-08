import { EventPreview as Component } from '../components/EventPreview';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../store/index';
import { Event } from '../store/events/actions';

const mapStateToProps = (state: IAppState, props: { event: Event }) => {
  return { event: props.event };
};

export const EventPreview = compose(
  connect(
    mapStateToProps
  )
)(Component);