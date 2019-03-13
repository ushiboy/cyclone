# Cyclone


[![Build Status](https://travis-ci.org/ushiboy/cyclone.svg?branch=master)](https://travis-ci.org/ushiboy/cyclone)

Cyclone is an application state management library.

## Quick Sample

Here is a simple counter.

```javascript
import { createStore, none } from '@ushiboy/cyclone';

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

```javascript
type State = {
  [stateName: string]: any;
};
```

### Action

The objects with `type` property.

```javascript
type Action = {
  type: string
};
```

### Update

The function that takes `State` and `Action` as arguments and returns updated `State` and next `Action`.

```javascript
type Update<S, A> = (state: S, action: A) => [S, A | Promise<A> | Array<A | Prmise<A>>];
```

### Store

Notify of change of `State` by `Action`.

```javascript
type Store<S, A> = {
  dispatch(action: A | Promise<A>): Promise<void>,
  getState(): S,
  subscribe(listener: () => void): void,
  unsubscribe(listener: () => void): void
};
```

## API

### createStore

It create and return a `Store` from the initial state and `Update` function.

```javascript
createStore<S, A>(initialState: S, update: Update<S, A>): Store<S, A>
```

### reducer

It define `Update` which is responsible for specific elements in `State`.
It is used in combination with `combine`.

```javascript
reducer<RS, A>(stateName: string, update: ReducerUpdate<RS, A>): ReducerConfig<RS, A>
reducer<RS, A>(stateName: string, dependencies: string[], update: ReducerUpdate<RS, A>): ReducerConfig<RS, A>
```

It returns a `ReducerConfig` object.
If you specify a list of depending `State` element names on the 2nd argument, it can be received after the 3rd argument of the `ReducerUpdate` function.

```javascript
type ReducerConfig<RS, A> = {
  stateName: string,
  update: ReducerUpdate<RS, A>,
  dependencies: string[]
};

type ReducerUpdate<RS, A> = (state: RS, action: A, ...dependencyState: any[]) => [RS, A | Promise<A>];
```

### combine

It receives multiple `ReducerConfig` objects, creates and returns a single `Update` function.

```javascript
combine<S, A>(...partialConfig: ReducerConfig): Update<S, A>;
```

### none

It is used when there is no next `Action` after `Update` processing.

```javascript
none(): Action
```

### Store

`Store` instance methods.

#### dispatch

It execute `Action` against `Store`.

```javascript
dispatch(a: A | Promise<A>): Promise<void>
```

#### getState

It returns the current `State` of `Store`.

```javascript
getState(): S
```

#### subscribe

It subscribes to the `Store` change notification.

```javascript
subscribe(listener: () => void): void
```

#### unsubscribe

It unsubscribes to the `Store` change notification.

```javascript
unsubscribe(listener: () => void): void
```

## Usage

### Reduce State Case

An example where three states are processed individually and one depends on the other two.

```javascript
import { createStore, combine, reducer, none } from '@ushiboy/cyclone';

const store = createStore({ a: 0, b: 0, c: '' }, combine(
  reducer('a', (state, action) => {
    switch (action.type) {
      case 'a$set': {
        return [action.payload, none()];
      }
      default: {
        return [state, none()];
      }
    }
  }),
  reducer('b', (state, action) => {
    switch (action.type) {
      case 'b$set': {
        return [action.payload, none()];
      }
      default: {
        return [state, none()];
      }
    }
  }),
  // depends on 'a' and 'b'
  reducer('c', ['a', 'b'], (state, action, a, b) => {
    switch (action.type) {
      case 'sum': {
        return [`${a + b}`, none()];
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

store.dispatch({ type: 'a$set', payload: 1 }); // { a: 1, b: 0, c: '' }
store.dispatch({ type: 'b$set', payload: 2 }); // { a: 1, b: 2, c: '' }
store.dispatch({ type: 'sum' });               // { a: 1, b: 2, c: '3' }
```

### Action Chain Case

An example of waiting for 1 second and erasing the message after displaying the message.

```javascript
import { createStore, none } from '@ushiboy/cyclone';

const showMessage = () => ({ type: 'show' });

const waitAndClearMessage = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ type: 'clear' });
    }, 1000);
  });
};

const store = createStore({ msg: '' }, (state, action) => {
  switch (action.type) {
    case 'show': {
      return [{ msg: 'hello' }, waitAndClearMessage()]; // chain action
    }
    case 'clear': {
      return [{ msg: '' }, none()];
    }
    default: {
      return [state, none()];
    }
  }
});

store.subscribe(() => {
  console.log(store.getState());
});

store.dispatch(showMessage());
```

## Advanced Usage

### Extra Argument

**(This feature is experimental. It may change in the future.)**

If there is a parameter you want to inject into the action, set it to the 3rd argument of the `createStore` method.

```javascript
const store = createStore(initialState, update, { webApi: {...} });
```

The action can use it by returning a function that receives the injected parameter.

```javascript
const fetchAction = () => async ({ webApi }) => {
  const data = await webApi.fetch();
  return {
    type: 'fetch',
    payload: {
      data
    }
  };
};

store.dispatch(fetchAction());
```

## License

MIT
