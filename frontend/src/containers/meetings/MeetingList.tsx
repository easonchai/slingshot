import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../../store/index';
import { MeetingList as Component } from '../../components/meetings/MeetingList';

const mapStateToProps = (state: IAppState, props: { isEnded: boolean }) => {
  return {
      meetings: 
          state.meetingsReducer.meetings.filter((meeting) => {
            return meeting.data.isEnded === props.isEnded;
          })
  };
};

export const MeetingList = compose(
  connect(
    mapStateToProps
  )
)(Component);