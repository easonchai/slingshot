import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../../store/index';
import { MeetingView as Component } from '../../components/meetings/MeetingView';

const mapStateToProps = (state: IAppState, props: any) => {
  return {
      meeting:
          state.allMeetingsReducer.meetings.find(
              (meeting) =>
                  props.isContractAddress
                  ? meeting.meetingAddress === props.match.params.address
                  : meeting.txHash === props.match.params.hash
          )
  };
};

export const MeetingView = compose(
  connect(
    mapStateToProps
  )
)(Component);