import { ViewEvent as Component } from '../components/ViewEvent';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../store/index';

const mapStateToProps = (state: IAppState, props: any) => {
  // TODO: transition to event id's / deployed smart contract addresses
  return { event:
    state.app.events.filter((event) => event.name.includes(props.match.params.name))[0]
  };
};

export const ViewEvent = compose(
  connect(
    mapStateToProps
  )
)(Component);