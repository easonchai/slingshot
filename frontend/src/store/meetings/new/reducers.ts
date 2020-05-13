import { AppActions } from '../../constants';
import { IAction } from './actions';
import { Meeting } from '../types';

export interface IState {
  newlyCreatedMeeting: Meeting;
}

const initState: IState = {
  newlyCreatedMeeting:
    {
      txHash: '',
      meetingAddress: '',
      name: '',
      location: '',
      description: '',
      startDateTime: 0,
      endDateTime: 0,
      stake: 0.0,
      maxParticipants: 0,
      registered: 0,
      prevStake: 0,
      payout: 0,
      attendanceCount: 0,
      isCancelled: false,
      isStarted: false,
      isEnded: false,
      deployerContractAddress: '0x8dF42792C58e7F966cDE976a780B376129632468',
      organizerAddress: ''
    }
};

export const reducer = (state: IState = initState, action: IAction): IState => {
  switch (action.type) {
    case AppActions.CREATE_FIRST_MEETING:
      return Object.assign({}, state, {
          newlyCreatedMeeting: action.payload
        });
    
    case AppActions.UPDATE_MEETING_CONTRACT_ADDRESS:
      return {
        newlyCreatedMeeting: {
          ...state.newlyCreatedMeeting,
          ...action.payload
        }
      }

    default:
      return state;
  }
}
