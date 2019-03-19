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

// describe('mod on the state', () => {
//     it('fill the state lately', () => {
//         var reducer2 = function (oldState, action, params) {
//                 // who cares here
//                 return Object.assign({}, params);
//             },
//             store = Ridof.getStore(reducer2);
//         store.subscribe((oldState, newState, action) => {
//             assert.strictEqual(action, 'WHATEVER');
//             assert.strictEqual(
//                 JSON.stringify(newState),
//                 JSON.stringify({
//                     all: 'others',
//                     parameters: 'are included',
//                     number: 9
//                 })
//             );
//         });
//         store.dispatch({
//             type: 'WHATEVER',
//             all: 'others',
//             parameters: 'are included',
//             number: 9
//         });
//     });
// });
