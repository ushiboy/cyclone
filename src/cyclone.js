const NONE_ACTION = 'cyclone$none';

export function createStore(initState, update, extra = null) {
  let state = { ...initState };
  const listeners = new Set();

  function dispatch(action) {
    if (typeof action === 'function') {
      action = action(extra);
    }

    if (action instanceof Promise) {
      return action.then(processAction);
    } else {
      return Promise.resolve(processAction(action));
    }
  }

  function processAction(a) {
    if (isNoneAction(a)) {
      return;
    }
    let [nextState, nextActions] = update(state, a);
    if (nextActions == null) {
      nextActions = [];
    } else if (!Array.isArray(nextActions)) {
      nextActions = [nextActions];
    }
    if (nextState !== state) {
      state = { ...state, ...nextState };
      listeners.forEach(fn => {
        fn();
      });
    }
    nextActions.forEach(na => {
      dispatch(na);
    });
  }

  function subscribe(listener) {
    listeners.add(listener);
  }

  function unsubscribe(listener) {
    listeners.delete(listener);
  }

  function getState() {
    return state;
  }

  return {
    dispatch,
    subscribe,
    unsubscribe,
    getState
  };
}

export function combine(...reducerConfigs) {
  return (state, action) => {
    let hasChanged = false;
    const nextActions = [];
    const nextState = { ...state };
    reducerConfigs.forEach(({ stateName, update, dependencies }) => {
      const partialState = nextState[stateName];
      const dependenciesState = dependencies.map(k => {
        return nextState[k];
      });
      const [nextPartialState, nextAction] = update(
        partialState,
        action,
        ...dependenciesState
      );
      if (isNotNoneAction(nextAction)) {
        nextActions.push(nextAction);
      }
      const hasChangedPartial = partialState !== nextPartialState;
      hasChanged = hasChanged || hasChangedPartial;
      if (hasChangedPartial) {
        nextState[stateName] = nextPartialState;
      }
    });
    if (hasChanged) {
      return [nextState, nextActions];
    }
    return [state, nextActions];
  };
}

export function reducer(...args) {
  if (args.length === 2) {
    return reducerConfig(args[0], [], args[1]);
  }
  return reducerConfig(args[0], args[1], args[2]);
}

function reducerConfig(stateName, dependencies, update) {
  return {
    stateName,
    update,
    dependencies
  };
}

export function none() {
  return { type: NONE_ACTION };
}

function isNotNoneAction(action) {
  return action instanceof Promise || action.type !== NONE_ACTION;
}

function isNoneAction(action) {
  return !isNotNoneAction(action);
}
