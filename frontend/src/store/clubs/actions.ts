import actionCreatorFactory from 'typescript-fsa';
import { AppActions } from '../constants';
import { User } from '../users/actions';

// TODO refactor duplicate
export const ModelType = {
  USER: 'user',
  PENDING: 'pending',
  MEETING: 'meeting',
  CLUB: 'club',
};

// TODO: refactor duplicate interfaces
export interface Proposal {
  created: number;
  id: number;
  newAdmin: string[];
  oldAdmin: string[];
  voted: number;
  state: string;
}

export interface Club {
  _id: string;
  type: string;
  admins: ReadonlyArray<string>;
  proposals: ReadonlyArray<Proposal>;

  data: {
    name: string;

    deployerContractAddress: string;
    organizerAddress: string;
  },
};

const actionCreator = actionCreatorFactory();

export const ReadAllClubs = actionCreator<Array<Club>>(AppActions.READ_ALL_CLUBS);
export const CreateClub = actionCreator<Club>(AppActions.CREATE_CLUB);

export const actions = {
  ReadAllClubs,
  CreateClub,
};
