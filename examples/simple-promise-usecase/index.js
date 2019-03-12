require('@babel/polyfill');
const { createStore, none } = require('@ushiboy/cyclone');

const store = createStore({ count: 0 }, (state, action) => {
  switch (action.type) {
    case 'increment': {
      return [{ count: state.count + 1 }, none()];
    }
    case 'decrement': {
      return [{ count: state.count - 1 }, none()];
    }
    default: {
      return [state, none()];
    }
  }
});

const increment = async () => ({ type: 'increment' });
const decrement = async () => ({ type: 'decrement' });

store.subscribe(() => {
  console.log(store.getState());
});

store.dispatch(increment());
store.dispatch(increment());
store.dispatch(decrement());
