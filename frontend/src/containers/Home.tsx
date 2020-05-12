import { Home as Component } from '../components/Home';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../store/index';

const mapStateToProps = (state: IAppState) => {
  return {
  };
};

export const Home = compose(
  connect(
    mapStateToProps
  )
)(Component);