import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../../store/index';
import { UsersList as Component } from '../../components/users/UsersList';
import { Meeting } from '../../store/meetings/types';

const mapStateToProps = (state: IAppState, props: { meeting: Meeting }) => {
  return {
      meeting: props.meeting
  };
};

export const UsersList = compose(
  connect(
    mapStateToProps
  )
)(Component);