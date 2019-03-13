require('@babel/polyfill');
const { createStore, none } = require('@ushiboy/cyclone');

const greet = () => async ({ sleep }) => {
  await sleep(1000);
  return { type: 'greet', payload: { msg: 'hello' } };
};

const store = createStore(
  { word: '', waiting: false },
  (state, action) => {
    switch (action.type) {
      case 'ready': {
        return [{ ...state, waiting: true }, greet()];
      }
      case 'greet': {
        const { msg } = action.payload;
        return [{ word: msg, waiting: false }, none()];
      }
      default: {
        return [state, none()];
      }
    }
  },
  {
    sleep(time) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, time);
      });
    }
  }
);

store.subscribe(() => {
  console.log(store.getState());
});

store.dispatch({ type: 'ready' });
