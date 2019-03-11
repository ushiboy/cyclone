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

## Main Concept

* State: the state of your application.
* Action: the instructions for changing state.
* Update: the processing function that receives State and Action and returns the next State and Action.
* Store: it is initialized with State and Update, receives Action and updates State and notifies.

### State

The objects with keys and values.

```
type State = {
  [stateName: string]: any;
};
```

### Action

The objects with `type` property.

```
type Action = {
  type: string
};
```

### Update

The function that takes `State` and` Action` as arguments and returns updated `State` and next ` Action`.

```
type Update<S, A> = (state: S, action: A) => [S, A];
```

### Store

Notify of change of `State` by `Action`.

```
type Store<S, A> = {
  dispatch(action: A | Promise<A>): Promise<void>,
  getState(): S,
  subscribe(listener: () => void): void,
  unsubscribe(listener: () => void): void
};
```

## API

### createStore

Create and return a `Store` from the initial state and `Update` function.

```
createStore<S, A>(initialState: S, update: Update<S, A>): Store<S, A>
```
