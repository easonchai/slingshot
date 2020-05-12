import { AppActions } from './constants';

// Higher-order function to srongly type check return types.
// Source: https://www.youtube.com/watch?v=3d9XqFmCmQw
export const makeAction = <T extends AppActions, P>(type: T) => (payload: P) => {
    return {
        type,
        payload
    };
};

// Generic interfaces that will help us with strong type checks during compilation.
// Source: https://www.youtube.com/watch?v=3d9XqFmCmQw
interface IStringMap<T> {
    [key: string]: T
} 
type IAnyFunction = (...args: any[]) => any;
export type IActionUnion<A extends IStringMap<IAnyFunction>> = ReturnType<A[keyof A]>;
