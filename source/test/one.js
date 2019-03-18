var assert = require('assert'),
    Ridof = require('../dist/index.js'),

    initState = { number: 0, valid: true },
    reducer = function (state, action, params) {
        var newState = Object.assign({}, state);
        switch (action) {
            case 'INCREMENT':
                newState.number++;
                break;
            case 'DECREMENT':
                newState.number--;
                break;
            case 'VALIDATE':
                newState.valid = true;
                break;
            case 'INVALIDATE':
                newState.valid = false;
                break;
            case 'RESET':
                newState = Object.assign({}, initState);
                break;
            default:
                return newState;
        }
        return newState;
    };

describe('basic construction', () => {
    it('should throw a TypeError if called with no params', () => {
        try {
            Ridof.getStore();
        } catch (e) {
            assert.strictEqual(e instanceof TypeError, true);
        }
    });

    it('should throw an Error if the reducer does not returns an object', () => {
        try {
            Ridof.getStore(() => 1);
        } catch (e) {
            assert.strictEqual(e instanceof Error, true);
        }
        try {
            Ridof.getStore(() => {});
        } catch (e) {
            assert.strictEqual(e instanceof Error, true);
        }
        try {
            Ridof.getStore(() => null);
        } catch (e) {
            assert.strictEqual(e instanceof Error, true);
        }
    });

    it('should return a store, with empty initial state', () => {
        var store = Ridof.getStore(() => ({}));
        assert.strictEqual(JSON.stringify(store.getState()), JSON.stringify({}));
        assert.strictEqual(Ridof.isStore(store), true);
    });

    it('should return a store, with non empty initial state', () => {
        var iniState = { name: 'ridof', number: 30 },
            store = Ridof.getStore(() => iniState);
        assert.strictEqual(
            JSON.stringify(store.getState()),
            JSON.stringify(iniState)
        );
        assert.strictEqual(Ridof.isStore(store), true);
    });
});

describe('basic actions', () => {
    var store;
    before(() => {
        store = Ridof.getStore(reducer, initState);
    });
    it('dispatch increment and check the state', () => {
        var unsub = store.subscribe((oldState, newState, action) => {
            assert.strictEqual(newState.number, 1);
            assert.strictEqual(action, 'INCREMENT');
            unsub();
        });
        store.dispatch({ type: 'INCREMENT' });
    });

    it('dispatch decrement action and check the state', () => {
        var unsub = store.subscribe((oldState, newState, action) => {
            assert.strictEqual(newState.number, 0);
            assert.strictEqual(action, 'DECREMENT');
            unsub();
        });
        store.dispatch({ type: 'DECREMENT' });
    });

    it('throws an error if dispatch a non action', (done) => {
        try {
            store.dispatch({ typezzz: 'DECREMENT' });
            store.reset();
        } catch (e) {
            done();
        }
    });

    it('all subscribers are noticed', () => {
        var count = 3;
        store.subscribe((oldState, newState, action) => {
            count *= 5;
        });
        store.subscribe((oldState, newState, action) => {
            count *= 7;
        });
        store.subscribe((oldState, newState, action) => {
            count *= 9;
        });
        store.dispatch({ type: 'RESET' });
        assert.strictEqual(count, 945);
        store.reset();
    });

    it('should store and retrieve all states', () => {
        store.dispatch({ type: 'INCREMENT' });
        store.dispatch({ type: 'INCREMENT' });
        store.dispatch({ type: 'INCREMENT' });
        store.dispatch({ type: 'INVALIDATE' });
        store.dispatch({ type: 'INCREMENT' });
        store.dispatch({ type: 'DECREMENT' });
        var states = store.states,
            expected = { number: 3, valid: false };

        assert.strictEqual(
            JSON.stringify(store.getState()),
            JSON.stringify(expected)
        );
        assert.strictEqual(states.length, 7);
    });
});

describe('time travel', () => {
    var store;
    before(() => {
        store = Ridof.getStore(reducer, initState);
    });
    it('should move between states back and forth', () => {
        var count = 0;
        store.subscribe(() => {
            count++;
        });

        // {number: 0, valid: true} >>>>>>>>>>> -6
        store.dispatch({ type: 'INCREMENT' });
        // {number: 1, valid: true} >>>>>>>>>>> -5
        store.dispatch({ type: 'INCREMENT' });
        // {number: 2, valid: true} >>>>>>>>>>> -4
        store.dispatch({ type: 'INCREMENT' });
        // {number: 3, valid: true} >>>>>>>>>>> -3
        store.dispatch({ type: 'INVALIDATE' });
        // {number: 3, valid: false} >>>>>>>>>>> -2
        store.dispatch({ type: 'INCREMENT' });
        // {number: 4, valid: false} >>>>>>>>>>> -1
        store.dispatch({ type: 'DECREMENT' });
        // {number: 3, valid: false}

        assert.strictEqual(JSON.stringify(store.getState()), JSON.stringify({ number: 3, valid: false }));
        store.move(-3);
        assert.strictEqual(JSON.stringify(store.getState()), JSON.stringify({ number: 3, valid: true }));
        store.move(2);
        assert.strictEqual(JSON.stringify(store.getState()), JSON.stringify({ number: 4, valid: false }));
        assert.strictEqual(count, 8);// 6 + 2 moves
        store.reset();
    });
    it('should slice the forward states when dispatch in the middle', () => {
        var count = 0;
        store.subscribe(() => {
            count++;
        });

        // {number: 0, valid: true} >>>>>>>>>>> -6
        store.dispatch({ type: 'INCREMENT' });
        // {number: 1, valid: true} >>>>>>>>>>> -5
        store.dispatch({ type: 'INCREMENT' });
        // {number: 2, valid: true} >>>>>>>>>>> -4
        store.dispatch({ type: 'INCREMENT' });
        // {number: 3, valid: true} >>>>>>>>>>> -3
        store.dispatch({ type: 'INVALIDATE' });
        // {number: 3, valid: false} >>>>>>>>>>> -2
        store.dispatch({ type: 'INCREMENT' });
        // {number: 4, valid: false} >>>>>>>>>>> -1
        store.dispatch({ type: 'DECREMENT' });
        // {number: 3, valid: false}

        assert.strictEqual(
            JSON.stringify(store.getState()),
            JSON.stringify({ number: 3, valid: false })
        );
        store.move(-4);
        assert.strictEqual(
            JSON.stringify(store.getState()),
            JSON.stringify({ number: 2, valid: true })
        );
        assert.strictEqual(store.states.length, 7);

        // now we are in the middle and if an action is dispatched should destroy all forward history
        store.dispatch({ type: 'DECREMENT' });
        assert.strictEqual(
            JSON.stringify(store.getState()),
            JSON.stringify({ number: 1, valid: true })
        );
        assert.strictEqual(store.states.length, 4);

        assert.strictEqual(count, 8);// 7 + 1 move
        store.reset();
    });
    it('should not move too far', () => {
        var count = 0;
        store.subscribe(() => {
            count++;
        });

        // {number: 0, valid: true} >>>>>>>>>>> -6
        store.dispatch({ type: 'INCREMENT' });
        // {number: 1, valid: true} >>>>>>>>>>> -5
        store.dispatch({ type: 'INCREMENT' });
        // {number: 2, valid: true} >>>>>>>>>>> -4
        store.dispatch({ type: 'INCREMENT' });
        // {number: 3, valid: true} >>>>>>>>>>> -3
        store.dispatch({ type: 'INVALIDATE' });
        // {number: 3, valid: false} >>>>>>>>>>> -2
        store.dispatch({ type: 'INCREMENT' });
        // {number: 4, valid: false} >>>>>>>>>>> -1
        store.dispatch({ type: 'DECREMENT' });
        // {number: 3, valid: false}

        assert.strictEqual(JSON.stringify(store.getState()), JSON.stringify({ number: 3, valid: false }));
        store.move(-7);
        assert.strictEqual(JSON.stringify(store.getState()), JSON.stringify({ number: 3, valid: false }));
        assert.strictEqual(store.states.length, 7);
        assert.strictEqual(count, 6);// the move fails => dont count
        store.reset();
    });
    it('should not move too narrow', () => {
        var count = 0;
        store.subscribe(() => {
            count++;
        });

        // {number: 0, valid: true} >>>>>>>>>>> -6
        store.dispatch({ type: 'INCREMENT' });
        // {number: 1, valid: true} >>>>>>>>>>> -5
        store.dispatch({ type: 'INCREMENT' });
        // {number: 2, valid: true} >>>>>>>>>>> -4
        store.dispatch({ type: 'INCREMENT' });
        // {number: 3, valid: true} >>>>>>>>>>> -3
        store.dispatch({ type: 'INVALIDATE' });
        // {number: 3, valid: false} >>>>>>>>>>> -2
        store.dispatch({ type: 'INCREMENT' });
        // {number: 4, valid: false} >>>>>>>>>>> -1
        store.dispatch({ type: 'DECREMENT' });
        // {number: 3, valid: false}

        assert.strictEqual(JSON.stringify(store.getState()), JSON.stringify({ number: 3, valid: false }));
        store.move(1); // not effective
        assert.strictEqual(JSON.stringify(store.getState()), JSON.stringify({ number: 3, valid: false }));
        // we should go backward
        store.move(-3);
        assert.strictEqual(JSON.stringify(store.getState()), JSON.stringify({ number: 3, valid: true }));

        // and check again that we fail to go too forward
        assert.strictEqual(count, 7);
        store.move(4); // in fact is not effective
        assert.strictEqual(store.states.length, 7);
        assert.strictEqual(count, 7);

        // also .. move 0 is uneffective
        store.move(0);
        assert.strictEqual(count, 7);
    });

    it('should replace the reducer', () => {
        var reducer2 = function (oldState, action, params) {
                // who cares here
                return Object.assign({}, params);
            },
            store = Ridof.getStore(reducer2);
        store.subscribe((oldState, newState, action) => {
            assert.strictEqual(action, 'WHATEVER')
            assert.strictEqual(
                JSON.stringify(newState),
                JSON.stringify({
                    all: 'others',
                    parameters: 'are included',
                    number: 9
                })
            );
        });
        store.dispatch({
            type: 'WHATEVER',
            all: 'others',
            parameters: 'are included',
            number: 9
        });
        store.reset();// for listeners
        store.subscribe((oldState, newState, action) => {
            assert.strictEqual(
                JSON.stringify(oldState),
                JSON.stringify({})
            );
            assert.strictEqual(
                JSON.stringify(newState),
                JSON.stringify({ name: 'static' })
            );
        });
        store.replaceReducer(() => ({ name: 'static' }));
        store.dispatch({
            type: 'NOT REALLY MATTER'
        });
    });
});


describe('mod on the state', () => {
    it('fill the state lately', () => {
        var reducer2 = function (oldState, action, params) {
                // who cares here
                return Object.assign({}, params);
            },
            store = Ridof.getStore(reducer2);
        store.subscribe((oldState, newState, action) => {
            assert.strictEqual(action, 'WHATEVER');
            assert.strictEqual(
                JSON.stringify(newState),
                JSON.stringify({
                    all: 'others',
                    parameters: 'are included',
                    number: 9
                })
            );
        });
        store.dispatch({
            type: 'WHATEVER',
            all: 'others',
            parameters: 'are included',
            number: 9
        });
    });
});
