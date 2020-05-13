import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../../store/index';
import { Meeting } from '../../store/meetings/actions';
import { MeetingPreview as Component } from '../../components/meetings/MeetingPreview';

const mapStateToProps = (state: IAppState, props: { meeting: Meeting }) => {
  return {
  };
};

export const MeetingPreview = compose(
  connect(
    mapStateToProps
  )
)(Component);