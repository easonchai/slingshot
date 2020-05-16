import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../../store/index';
import { UsersList as Component } from '../../components/users/UsersList';

const mapStateToProps = (state: IAppState) => {
  return {
    cachedMeeting: state.meetingsReducer.cachedMeeting,
    userWallet: state.userReducer.user._id,
    loading: state.loadingReducer.loading,
  };
};

export const UsersList = compose(
  connect(
    mapStateToProps
  )
)(Component);