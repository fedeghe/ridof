var assert = require('assert'),
    Ridof = require('../dist/index.js'),
    initState = { number: 0, valid: true },
    ERRORS = Ridof.ERRORS,
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

describe('config restrictions', () => {
    var store;
    beforeEach(() => {
        store = Ridof.getStore(reducer, initState, {
            'INITIAL': ['INCREMENT', 'DECREMENT'],
            'INCREMENT': ['INCREMENT', 'DECREMENT', 'INVALIDATE', 'VALIDATE', 'RESET'],
            'DECREMENT': ['INCREMENT', 'DECREMENT', 'INVALIDATE', 'VALIDATE', 'RESET']
        });
    });
    it('should throw an error when trying to invalidate', () => {
        try {
            store.dispatch({ type: 'INVALIDATE' });
        } catch (e) {
            assert.strictEqual(e instanceof Error, true);
            assert.strictEqual(e.message, ERRORS.UNAUTHORIZED_STATECHANGE);
        }
        store.reset();
    });
    it('should change state as expected', () => {
        store.dispatch({ type: 'INCREMENT' });
        store.subscribe((oldState, newState, action) => {
            assert.strictEqual(JSON.stringify(oldState), JSON.stringify({ number: 1, valid: true }));
            assert.strictEqual(JSON.stringify(newState), JSON.stringify({ number: 1, valid: false }));
        });
        store.dispatch({ type: 'INVALIDATE' });
        store.reset();
    });
});