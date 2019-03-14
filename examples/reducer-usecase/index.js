const { createStore, combine, reducer, none } = require('@ushiboy/cyclone');

const store = createStore({ a: 0, b: 0, c: '' }, combine(
  reducer('a', (state, action) => {
    switch (action.type) {
      case 'increment': {
        return [state + 1, none()];
      }
      case 'decrement': {
        return [state - 1, none()];
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
      case 'decrement': {
        return [state - 2, none()];
      }
      default: {
        return [state, none()];
      }
    }
  }),
  reducer('c', [ 'a', 'b' ], (state, action, a, b) => {
    switch (action.type) {
      case 'increment': {
        return [`${a + b}`, none()];
      }
      case 'decrement': {
        return [`${a - b}`, none()];
      }
      default: {
        return [state, none()];
      }
    }
  })
));

store.subscribe(() => {
  console.log(store.getState());
});

store.dispatch({ type: 'increment' });
store.dispatch({ type: 'increment' });
store.dispatch({ type: 'decrement' });
