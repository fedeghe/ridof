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
    var store,
        initState = { number: 0, valid: true },
        reducer = (state, action, params) => {
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

    it('all subscribers are notified', () => {
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

describe('should add to the state ', () => {
    it('fill the state lately', () => {
        var reducer2 = (oldState, action, params) => {
                const newState = Object.assign({}, oldState);
                switch (action) {
                    case 'ADD':
                        newState.number += 10;
                        break;
                    default:;
                }
                return newState;
            },
            initState = { number: 0, valid: true },
            store = Ridof.getStore(reducer2, initState);
        store.subscribe((oldState, newState, action) => {
            assert.strictEqual(action, 'ADD');
            assert.strictEqual(
                JSON.stringify(newState),
                JSON.stringify({
                    number: 10,
                    valid: true,
                    all: 'others',
                    parameters: 'are included'
                })
            );
        });
        store.dispatch({
            type: 'ADD',
            number: 9,
            valid: true,
            all: 'others',
            parameters: 'are included'
        }, true);
    });
});
