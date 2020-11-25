

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
});
