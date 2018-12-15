var assert = require('assert'),
    Ridof = require('../ridof.js');

describe('readme sample', () => {
    it('should work', () => {

        let index = 0;

        const initialState = {
                num: 1,
                name: 'Federico'
            },
            // The reducer function
            // params holds all the values passed to dispatch but the type
            reducer = (oldState, action, params) => {
                const newState = Object.assign({}, oldState)
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
                        newState.name = params.name || 'no name given';
                        break;
                }
                return newState
            },

            // initialState is optional, default is {}
            Store = Ridof.getStore(reducer, initialState),
            expected = [
                {num: 1, name: 'Federico' },
                {num: 2, name: 'Federico' },
                {num: 3, name: 'Federico'},
                {num: 9, name: 'Federico'},
                {num: 8, name: 'Federico'},
                {num: 64, name: 'Federico'},
                {num: 65, name: 'Federico'},
                {num: 4225, name: 'Federico'},
                {num: 4225, name: 'no name given'},
                {num: 4225, name: 'Foo'}
            ];
        
        Store.subscribe((oldState, newState, action) => {
            assert.equal(JSON.stringify(oldState), JSON.stringify(expected[index++]));
            assert.equal(JSON.stringify(newState), JSON.stringify(expected[index]));
        });

        Store.dispatch({ type: 'INCREMENT' });
        Store.dispatch({ type: 'INCREMENT' });
        Store.dispatch({ type: 'POW' });
        Store.dispatch({ type: 'DECREMENT' });
        Store.dispatch({ type: 'POW' });
        Store.dispatch({ type: 'INCREMENT' });
        Store.dispatch({ type: 'POW' });
        Store.dispatch({ type: 'RENAME' });
        Store.dispatch({ type: 'RENAME', name: 'Foo' });
    });
});
