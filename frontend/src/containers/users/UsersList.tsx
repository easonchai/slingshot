import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../../store/index';
import { UsersList as Component } from '../../components/users/UsersList';

const mapStateToProps = (state: IAppState) => {
  return {
    cachedMeeting: state.meetingsReducer.cachedMeeting
  };
};

export const UsersList = compose(
  connect(
    mapStateToProps
  )
)(Component);