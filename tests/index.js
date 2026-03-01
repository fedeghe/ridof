/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const assert = require('assert'),
    Ridof = require('../dist/index.js');

/*
[Malta] basic.js
*/
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
    beforeAll(() => {
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
        // has been resetted in 'before' thus change it
        // otherwise the subscribers will not be called
        store.dispatch({type: 'INCREMENT'})
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

;
/*
[Malta] config.js
*/


describe('config restrictions', () => {
    var store,
        initState = { number: 0, valid: true },
        ERRORS = Ridof.ERRORS,
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
        },
        
        store = Ridof.getStore(reducer, initState, (currentTag, nextTag, state) => {
            if (currentTag === 'INITIAL') {
                return  ['INCREMENT', 'DECREMENT'].indexOf(nextTag) >= 0
            }
            if (currentTag === 'INCREMENT' || currentTag === 'DECREMENT') {
                return  ['INCREMENT', 'DECREMENT', 'INVALIDATE', 'VALIDATE', 'RESET'].indexOf(nextTag) >= 0
            }
            if (currentTag === 'VALIDATE') {
                return  nextTag !== 'INVALIDATE'
            }
            return true
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
            assert.strictEqual(JSON.stringify(newState), JSON.stringify({ number: 2, valid: true }));
        });
    });
    it('should not change the state/complain/pub when non existing action is dispatched', () => {
        store = Ridof.getStore(reducer, initState);
        
        //this must mot be called
        store.subscribe((oldState, newState, action) => {
            throw new Error('xxx')
        });

        try {
            store.dispatch({ type: 'INCREMENTSSSS' });
        } catch (e) {
            assert.strictEqual(e instanceof Error, true);
            assert.strictEqual(e.message, 'xxx');
        }

    });
});
;
/*
[Malta] combine.js
*/
describe('combine some reducers', () => {
    it('will combine two', () => {
        const combined = Ridof.combine({
                mods: (state = [], action, params) => {
                    const newState = [...state];
                    switch (action) {
                        case 'ADDMOD': newState.push(params.name); break;
                        default:;
                    }
                    return newState;
                },
                plugins: (state = [], action, params) => {
                    const newState = [...state];
                    switch (action) {
                        case 'ADDPLUGIN': newState.push(params.name); break;
                        default:;
                    }
                    return newState;
                }
            }),
            store = Ridof.getStore(combined);
        store.subscribe((oldState, newState, action) => {
            if (action === 'END') {
                const mocked = JSON.stringify({
                        mods: ['mymod1', 'mymod2'],
                        plugins: ['myplugin']
                    }),
                    nState = JSON.stringify(newState),
                    fromStore = JSON.stringify(store.getState());
                assert.strictEqual(nState, mocked);
                assert.strictEqual(mocked, fromStore);
                assert.strictEqual(fromStore, nState);
            }
        });
        store.dispatch({ type: 'ADDPLUGIN', name: 'myplugin' });
        store.dispatch({ type: 'ADDMOD', name: 'mymod1' });
        store.dispatch({ type: 'ADDMOD', name: 'mymod2' });
        store.dispatch({ type: 'END' });
    });
});
;
/*
[Malta] readme.js
*/
describe('readme sample', () => {
    it('should work', done => {
        let index = 0;
        const initialState = {
                num: 1,
                name: 'Federico'
            },
            // The reducer function
            // params holds all the values passed to dispatch but the type
            reducer = (oldState, action, payload) => {
                const newState = Object.assign({}, oldState);
                switch (action) {
                    case 'INCREMENT':
                        newState.num += 1;
                        break;
                    case 'DECREMENT':
                        newState.num -= 1;
                        break;
                    case 'POW':
                        newState.num *= newState.num;
                        break;
                    case 'RENAME':
                        newState.name = payload.name || 'no name given';
                        break;
                    default: ;
                }
                return newState;
            },

            // initialState is optional, default is {}
            // eslint-disable-next-line no-undef
            Store = Ridof.getStore(reducer, initialState),
            expected = [
                { num: 1, name: 'Federico' },
                { num: 2, name: 'Federico' },
                { num: 3, name: 'Federico' },
                { num: 9, name: 'Federico' },
                { num: 8, name: 'Federico' },
                { num: 64, name: 'Federico' },
                { num: 65, name: 'Federico' },
                { num: 4225, name: 'Federico' },
                { num: 4225, name: 'no name given' },
                { num: 4225, name: 'Foo' }
            ];

        Store.subscribe((oldState, newState, action) => {
            // eslint-disable-next-line no-undef
            assert.strictEqual(JSON.stringify(oldState), JSON.stringify(expected[index]));
            // eslint-disable-next-line no-undef
            assert.strictEqual(JSON.stringify(newState), JSON.stringify(expected[++index]));
            index === expected.length - 1 && done();
        });

        Store.dispatch({ type: 'INCREMENT' });
        Store.dispatch({ type: 'INCREMENT' });
        Store.dispatch({ type: 'POW' });
        Store.dispatch({ type: 'DECREMENT' });
        Store.dispatch({ type: 'POW' });
        Store.dispatch({ type: 'INCREMENT' });
        Store.dispatch({ type: 'POW' });
        Store.dispatch({ type: 'RENAME' });
        Store.dispatch({ type: 'RENAME', payload: {name: 'Foo' }});
    });
});
;
/*
[Malta] tags.js
*/
describe('no transition config', () => {
    var store = Ridof.getStore((state, action, params) => {
        var newState = Object.assign({}, state);
        switch(action) {
            case 'INCREMENT': newState.count++; break;
            case 'DECREMENT': newState.count--; break;
            case 'VALIDATE': newState.valid = true;break;
            default:break;
        }
        return newState;
    }, {count: 0, valid: false});
    it('the tagsManager should be empty', () => {
        assert.strictEqual(store.tagsManager.getCurrent(store), 'INITIAL');
    });
    it('the tagsManager should contain the expected values', () => {
        store.dispatch({
            type: 'INCREMENT'
        });
        store.dispatch({
            type: 'INCREMENT'
        });
        store.dispatch({
            type: 'DECREMENT'
        });
        assert.strictEqual(
            JSON.stringify(store.tagsManager.tags),
            JSON.stringify(['INITIAL', 'INCREMENT', 'INCREMENT', 'DECREMENT'])
        );
        assert.strictEqual(Ridof.isStore(store), true);
    });

    it('after moving the tagsManager should contain the expected values', () => {
        store.move(-2);
        assert.strictEqual(
            JSON.stringify(store.tagsManager.tags),
            JSON.stringify(['INITIAL', 'INCREMENT', 'INCREMENT', 'DECREMENT'])
        );
        assert.strictEqual(store.tagsManager.getCurrent(), 'DECREMENT');
    });

    it('after move the dispatch clean up the following tags', () => {
        store.dispatch({
            type: 'VALIDATE'
        });
        assert.strictEqual(JSON.stringify(store.tagsManager.tags), JSON.stringify(['INITIAL', 'INCREMENT', 'VALIDATE']));
        assert.strictEqual(Ridof.isStore(store), true);
    });
});

describe('with transition config', () => {
    var store = Ridof.getStore(
            (state, action, params) => {
                var newState = Object.assign({}, state);
                switch(action) {
                    case 'INCREMENT': newState.count++; break;
                    case 'DECREMENT': newState.count--; break;
                    case 'VALIDATE': newState.valid = true;break;
                    default:break;
                }
                return newState;
            },
            {count: 0, valid: false},
            (currentTag, nextTag, state) => {
                if (currentTag === 'INITIAL') {
                    return  ['INCREMENT', 'DECREMENT'].indexOf(nextTag) >= 0
                }
                if (currentTag === 'INCREMENT' || currentTag === 'DECREMENT') {
                    return  ['INCREMENT', 'DECREMENT', 'INVALIDATE', 'VALIDATE'].indexOf(nextTag) >= 0
                }
                if (currentTag === 'VALIDATE') {
                    return  nextTag !== 'INVALIDATE'
                }
                return true
            }
        ),
        ERRORS = Ridof.ERRORS;
    it('the tagsManager should contain the expected values', () => {
        store.dispatch({
            type: 'INCREMENT'
        });
        store.dispatch({
            type: 'INCREMENT'
        });
        store.dispatch({
            type: 'DECREMENT'
        });
        assert.strictEqual(
            JSON.stringify(store.tagsManager.tags),
            JSON.stringify(['INITIAL', 'INCREMENT', 'INCREMENT', 'DECREMENT'])
        );
        assert.strictEqual(Ridof.isStore(store), true);
    });

    it('after move the dispatch clean up the following tags', () => {
        store.move(-1);
        store.dispatch({
            type: 'VALIDATE'
        });
        assert.strictEqual(
            JSON.stringify(store.tagsManager.tags),
            JSON.stringify(['INITIAL', 'INCREMENT', 'INCREMENT', 'VALIDATE'])
        );
        assert.strictEqual(Ridof.isStore(store), true);
    });

    // currentTag: 'VALIDATE'
    it('non allowed transition, should throw an error and preserve the tags', () => {
        // this is not in the allowed transitions
        try {
            store.dispatch({
                type: 'INVALIDATE'
            });
        } catch (e) {
            assert.strictEqual(e instanceof Error, true);
            assert.strictEqual(e.message, ERRORS.UNAUTHORIZED_STATECHANGE);
            assert.strictEqual(
                JSON.stringify(store.tagsManager.tags),
                JSON.stringify(['INITIAL', 'INCREMENT', 'INCREMENT', 'VALIDATE'])
            );
        }
    });
});
;
/*
[Malta] timetravel.js
*/
describe('time travel', () => {
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
    
    beforeAll(() => {
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
        store.move(-5);
        assert.strictEqual(JSON.stringify(store.getState()), JSON.stringify({ number: 0, valid: true }));
        assert.strictEqual(count, 9);// 6 + 3 moves
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
        var reducer2 = (oldState, action, params) => Object.assign({}, params),
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
        store.reset();// for listeners

        /**
         * now the state is anyway the original
         */
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

        // change the reducer, which will return alway the same thing that (on the first dispatch) differs from previous empty obj
        store.replaceReducer(() => ({ name: 'static' }));
        store.dispatch({
            type: 'NOT REALLY MATTER'
        });
    });

});
;
/*
[Malta] errors.js
*/
describe('errors', () => {
    const ERRORS = Ridof.ERRORS;
    it('should throw a Error if getStore is called with no params', () => {
        try {
            Ridof.getStore();
        } catch (e) {
            assert.strictEqual(e instanceof Error, true);
            assert.strictEqual(e.message, ERRORS.REDUCERS_FUNCTION);
        }
    });

    it('should throw an Error if the reducer does not returns an object', () => {
        try {
            const store = Ridof.getStore(() => {});
            store.dispatch({ type: 'IRRELEVANT' });
        } catch (e) {
            assert.strictEqual(e instanceof Error, true);
            assert.strictEqual(e.message, ERRORS.REDUCERS_RETURN);
        }
    });

    it('should throw an Error if a subscriber is not a function', () => {
        try {
            const store = Ridof.getStore(() => {});
            store.subscribe(1);
        } catch (e) {
            assert.strictEqual(e instanceof Error, true);
            assert.strictEqual(e.message, ERRORS.SUBSCRIBERS_FUNCTION);
        }
    });

    it('throws an Error if dispatch a obj with no type', () => {
        try {
            const store = Ridof.getStore(() => ({}), {});
            store.dispatch({ typo: 'DECREMENT' });
        } catch (e) {
            assert.strictEqual(e instanceof Error, true);
            assert.strictEqual(e.message, ERRORS.ACTION_TYPE);
        }
    });
    it('throws an Error if dispatch an action that is not valid', () => {
        try {
            const store = Ridof.getStore(() => ({}), {}, () => false);
            store.dispatch({ type: 'XXXDECREMENT' });
        } catch (e) {
            assert.strictEqual(e instanceof Error, true);
            assert.strictEqual(e.message, ERRORS.UNAUTHORIZED_STATECHANGE);
        }
    });
});
;
