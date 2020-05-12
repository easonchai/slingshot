import { ViewEvent as Component } from '../components/ViewEvent';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../store/index';

const mapStateToProps = (state: IAppState, props: any) => {
  // TODO: transition to event id's / deployed smart contract addresses
  return {
    event: state.app.events.find(
      (event) =>
        props.isContractAddress
        ? event.meetingAddress === props.match.params.address
        : event.txHash === props.match.params.hash
    )
  };
};

export const ViewEvent = compose(
  connect(
    mapStateToProps
  )
)(Component);