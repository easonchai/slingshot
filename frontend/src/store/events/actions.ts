import { AppActions } from '../constants';

// Higher-order function to srongly type check return types.
// Source: https://www.youtube.com/watch?v=3d9XqFmCmQw
const makeAction = <T extends AppActions, P>(type: T) => (payload: P) => {
  return {
    type,
    payload
  };
};

export interface Event {
  name: string;
  stake: number;
  maxParticipants: number;
  startDate: any;
  startTime: any;
  location: string;
  description: string;
  isEnded: boolean;
  address: string;
}

export const SetEvent= makeAction<AppActions.SET_EVENT, Event>(AppActions.SET_EVENT);

const actions = {
  SetEvent
}

// Generic interfaces that will help us with strong type checks during compilation.
// Source: https://www.youtube.com/watch?v=3d9XqFmCmQw
interface IStringMap<T> {
  [key: string]: T
} 
type IAnyFunction = (...args: any[]) => any;
type IActionUnion<A extends IStringMap<IAnyFunction>> = ReturnType<A[keyof A]>;
export type IAction = IActionUnion<typeof actions>;
