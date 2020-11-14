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
            const store = Ridof.getStore(() => ({}));
            store.dispatch({ typo: 'DECREMENT' });
        } catch (e) {
            assert.strictEqual(e instanceof Error, true);
            assert.strictEqual(e.message, ERRORS.ACTION_TYPE);
        }
    });
    it('throws an Error if dispatch an action that is not valid', () => {
        try {
            const store = Ridof.getStore(() => ({}), {}, {});
            store.dispatch({ type: 'XXXDECREMENT' });
        } catch (e) {
            assert.strictEqual(e instanceof Error, true);
            assert.strictEqual(e.message, ERRORS.UNAUTHORIZED_STATECHANGE);
        }
    });
});
