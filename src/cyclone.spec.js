const assert = require('power-assert');
import sinon from 'sinon';
import { createStore, none, reducer, combine } from './cyclone.js';

describe('cyclone', function() {
  describe('reducer()', () => {
    context('arguments has not dependencies', () => {
      it('should return no dependencies update config', () => {
        const stateName = 'count';
        const update = (s, a) => [s, none()];
        const c = reducer(stateName, update);
        assert(c.stateName === stateName);
        assert(c.update === update);
        assert(c.dependencies.length === 0);
      });
    });
    context('arguments has dependencies', () => {
      it('should return update config', () => {
        const stateName = 'count';
        const update = (s, a) => [s, none()];
        const dependencies = ['a', 'b'];
        const c = reducer(stateName, dependencies, update);
        assert(c.stateName === stateName);
        assert(c.update === update);
        assert(c.dependencies.length === dependencies.length);
        assert(c.dependencies[0] === dependencies[0]);
        assert(c.dependencies[1] === dependencies[1]);
      });
    });
  });
  describe('combine()', () => {
    const initState = () => ({
      a: 0,
      b: 1,
      c: 2
    });
    const next = async () => {
      return { type: 'next' };
    };
    it('should return composed update', () => {
      const update = combine(
        reducer('a', (s, a) => [s, none()]),
        reducer('b', (s, a) => [s, next()]),
        reducer('c', ['b'], (s, a, b) => [s, none()])
      );

      const [state, nextActions] = update(initState(), { type: 'add' });
      assert(state.a === 0);
      assert(state.b === 1);
      assert(state.c === 2);
      assert(nextActions.length === 1);
    });
  });
  describe('createStore()', () => {
    context('simple usage', () => {
      let s;
      const update = (s, a) => {
        switch (a.type) {
          case 'add': {
            return [{ count: s.count + 1 }, none()];
          }
          default: {
            return [s, none()];
          }
        }
      };

      const add = async () => {
        return { type: 'add' };
      };
      beforeEach(() => {
        s = createStore({ count: 0 }, update);
      });
      describe('getState()', () => {
        it('should return store state', () => {
          assert(s.getState().count === 0);
        });
      });
      describe('dispatch()', () => {
        it('should update store', async () => {
          await s.dispatch(add());
          assert(s.getState().count === 1);
          await s.dispatch({ type: 'add' });
          assert(s.getState().count === 2);
          await s.dispatch(() => ({ type: 'add' }));
          assert(s.getState().count === 3);
          await s.dispatch(() => add());
          assert(s.getState().count === 4);
        });
        it('should return Promise<void>', async () => {
          assert((await s.dispatch(add())) === undefined);
          assert((await s.dispatch({ type: 'add' })) === undefined);
          assert((await s.dispatch(() => ({ type: 'add' }))) === undefined);
          assert((await s.dispatch(() => add())) === undefined);
        });
      });
      describe('subscribe()', () => {
        it('should subscribe for store changed', async () => {
          const spy = sinon.spy();
          s.subscribe(spy);
          await s.dispatch(add());
          assert(spy.calledOnce);
        });
        it('should return unsubscriber', async () => {
          const spy = sinon.spy();
          const unsubscriber = s.subscribe(spy);
          assert(unsubscriber != null);
        });
        describe('unsubscriber', () => {
          it('should unsubscribe for store', async () => {
            const spy = sinon.spy();
            const unsubscriber = s.subscribe(spy);
            await s.dispatch(add());
            assert(spy.calledOnce);
            unsubscriber();
            await s.dispatch(add());
            assert(spy.calledOnce);
          });
        });
      });
      describe('unsubscribe()', () => {
        it('should unsubscribe for store', async () => {
          const spy = sinon.spy();
          s.subscribe(spy);
          s.unsubscribe(spy);
          await s.dispatch(add());
          assert(spy.notCalled);
        });
      });
      describe('extra argument', () => {
        const action = () => extra => {
          extra();
          return { type: 'do' };
        };
        const update = (s, a) => {
          return [s, none()];
        };
        it('should be passed to update', async () => {
          const extra = sinon.spy();
          const s = createStore({ a: 0 }, update, extra);
          await s.dispatch(action());
          assert(extra.calledOnce);
        });
      });
    });
    context('combined usage', () => {
      let s;
      const initState = () => ({
        a: 0,
        b: 1,
        c: 2
      });
      const next = () => {
        return { type: 'next' };
      };
      const update = combine(
        reducer('a', (s, a) => {
          switch (a.type) {
            case 'next': {
              return [s + 1, none()];
            }
            default: {
              return [s, none()];
            }
          }
        }),
        reducer('b', (s, a) => {
          switch (a.type) {
            case 'add': {
              return [s + 1, next()];
            }
            default: {
              return [s, none()];
            }
          }
        }),
        reducer('c', ['b'], (s, a, b) => {
          return [s + b, none()];
        })
      );
      const add = async () => {
        return { type: 'add' };
      };
      beforeEach(() => {
        s = createStore(initState(), update);
      });
      describe('dispatch()', () => {
        it('should update store', async () => {
          await s.dispatch(add());
          const { a, b, c } = s.getState();
          assert(a === 1);
          assert(b === 2);
          assert(c === 6);
        });
      });
      describe('extra argument', () => {
        const action1 = () => extra => {
          extra();
          return { type: 'do' };
        };
        const action2 = () => extra => {
          extra();
          return { type: 'done' };
        };
        const update = combine(
          reducer('b', (s, a) => {
            return [s, none()];
          }),
          reducer('c', ['b'], (s, a, b) => {
            switch (a.type) {
              case 'do': {
                return [s, action2()];
              }
              default: {
                return [s, none()];
              }
            }
          })
        );
        it('should be passed to update', async () => {
          const extra = sinon.spy();
          const s = createStore({ b: 0, c: 0 }, update, extra);
          await s.dispatch(action1());
          assert(extra.calledTwice);
        });
      });
    });
  });
});
