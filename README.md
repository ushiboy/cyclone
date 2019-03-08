# Cyclone

Cyclone is an application state management library.

## Quick Sample

Here is a simple counter.

```javascript
import { createStore, none } from 'cyclone';

const initialState = { count: 0 };

const update = (state, action) => {
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
}

const store = createStore(initialState, update);

store.subscribe(() => {
  console.log(store.getState());
});

store.dispatch({ type: 'increment' });
store.dispatch({ type: 'increment' });
store.dispatch({ type: 'decrement' });
```
