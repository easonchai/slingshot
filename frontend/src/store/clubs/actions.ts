import actionCreatorFactory from 'typescript-fsa';
import { AppActions } from '../constants';
import { Club } from '../interfaces';


const actionCreator = actionCreatorFactory();

export const ReadAllClubs = actionCreator<Array<Club>>(AppActions.READ_ALL_CLUBS);
export const CreateClub = actionCreator<Club>(AppActions.CREATE_CLUB);

export const actions = {
  ReadAllClubs,
  CreateClub,
};
