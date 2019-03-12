// @flow
const { createStore, none } = require('@ushiboy/cyclone');

type State = {
  count: number,
  word: string,
  waiting: boolean
};

type Action =
  | { type: 'increment' }
  | { type: 'ready' }
  | { type: 'greet', payload: { msg: string } };

const sleep = time => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const greet = async () => {
  await sleep(1000);
  return { type: 'greet', payload: { msg: 'hello' } };
};

const store = createStore<State, Action>(
  { count: 0, waiting: false, word: '' },
  (state, action) => {
    switch (action.type) {
      case 'increment': {
        return [
          {
            ...state,
            count: state.count + 1
          },
          none()
        ];
      }
      case 'ready': {
        return [{ ...state, waiting: true }, greet()];
      }
      case 'greet': {
        const { msg } = action.payload;
        return [{ ...state, word: msg, waiting: false }, none()];
      }
      default: {
        return [state, none()];
      }
    }
  }
);

const increment = async () => ({ type: 'increment' });
const wrong = async () => ({ type: 'wrong' });

const s1: State = store.getState();
// $ExpectError
const s2: number = store.getState(); // wrong return type

store.dispatch({ type: 'increment' });
// $ExpectError
store.dispatch({ type: 'wrong' }); // wrong action

store.dispatch(increment());
// $ExpectError
store.dispatch(wrong()); // wrong action

store.subscribe(() => {});
// $ExpectError
store.subscribe(() => 'wrong'); // wrong subscriber

store.unsubscribe(() => {});
// $ExpectError
store.unsubscribe(() => 'wrong'); // wrong unsubscriber
