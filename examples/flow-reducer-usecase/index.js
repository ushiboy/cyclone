// @flow
const { createStore, combine, reducer, none } = require('cyclone');

type State = {
  a: number,
  b: number,
  c: string,
  d: {
    word: string,
    waiting: boolean
  }
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
  { a: 0, b: 0, c: '', d: { word: '', waiting: false } },
  combine(
    reducer('a', (state, action) => {
      switch (action.type) {
        case 'increment': {
          return [state + 1, none()];
        }
        default: {
          return [state, none()];
        }
      }
    }),
    reducer('b', (state, action) => {
      switch (action.type) {
        case 'increment': {
          return [state + 2, none()];
        }
        default: {
          return [state, none()];
        }
      }
    }),
    reducer('c', ['a', 'b'], (state, action, a, b) => {
      switch (action.type) {
        case 'increment': {
          return [`${a + b}`, none()];
        }
        default: {
          return [state, none()];
        }
      }
    }),
    reducer('d', (state, action) => {
      switch (action.type) {
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
    })
  )
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
