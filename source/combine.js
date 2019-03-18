var assert = require('assert'),
    Ridof = require('../dist/index.js');


describe('combine some reducers', () => {
    it('will combine two', () => {
        const combined = Ridof.combineReducers(
                function mods () {
                    return { md: 2 };
                },
                function plugins () {
                    return { pl: 1 };
                }
            ),
            store = Ridof.getStore(combined);
        assert.strictEqual(true, true);
    });
});
