import { App as Component } from '../components/App';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../store/index';

const mapStateToProps = (state: IAppState) => {
  return {
  };
};

export const App = compose(
  connect(
    mapStateToProps
  )
)(Component);