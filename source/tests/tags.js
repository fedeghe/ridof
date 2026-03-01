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
