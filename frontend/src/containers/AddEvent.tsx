import { AddEvent as Component } from '../components/AddEvent';
import { Dispatch } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { IAction as IActionEvent, actions as eventsActions, Event, GroupHashAndAddress } from '../store/events/actions';
import { IAction as IActionUser, actions as usersActions, User } from '../store/users/actions';
import { IAppState } from '../store/index';

const mapStateToProps = (state: IAppState) => {
  return {
    user: state.userReducer.user
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IActionEvent | IActionUser>) => {
  return {
    dispatchCreateFirstMeeting: (payload: Event) => dispatch(eventsActions.CreateFirstMeeting(payload)),
    dispatchUpdateMeetingContractAddress: (payload: GroupHashAndAddress) => dispatch(eventsActions.UpdateMeetingContractAddress(payload)),
    dispatchUpdateUserEthereumAddress: (payload: User) => dispatch(usersActions.UpdateUserEthereumAddress(payload)),
  };
};

export const AddEvent = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Component);