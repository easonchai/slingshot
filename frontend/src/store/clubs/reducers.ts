import { Action } from 'redux';
import { isType } from 'typescript-fsa';
import { actions } from './actions';
import { Club } from '../interfaces';

export interface IState {
  clubs: ReadonlyArray<Club>;
}

export const initState: IState = {
  clubs: []
};

export const reducer = (state: IState = initState, action: Action): IState => {
  if (isType(action, actions.ReadAllClubs)) {
    return {
      ...state,
      clubs: action.payload
    };
  }
  
  if (isType(action, actions.CreateClub)) {
    return {
      ...state,
      clubs: [...state.clubs, action.payload]
    };
  }

  return state;
}
