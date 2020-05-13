import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAppState } from '../store/index';
import { App as Component } from '../components/App';

const mapStateToProps = (state: IAppState) => {
  return {
  };
};

export const App = compose(
  connect(
    mapStateToProps
  )
)(Component);