const Ridof = require('../ridof');

describe('readme sample', () => {
    it('should work', (done) => {

        const initialState = {
            num: 1,
            name: 'Federico'
        }
        // The reducer function
        // params holds all the values passed to dispatch but the type
        const reducer = (oldState, action, params) => {
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
        }

        // initialState is optional, default is {}
        const Store = Ridof.getStore(reducer, initialState);
        Store.subscribe((oldState, newState, action) => {
            console.log(newState);
        })
        Store.dispatch({ type: 'INCREMENT' }); // -> {num: 2, name: 'Federico'}
        Store.dispatch({ type: 'INCREMENT' }); // -> {num: 3, name: 'Federico'}
        Store.dispatch({ type: 'POW' }); // -> {num: 9, name: 'Federico'}
        Store.dispatch({ type: 'DECREMENT' }); // -> {num: 8, name: 'Federico'}
        Store.dispatch({ type: 'POW' }); // -> {num: 64, name: 'Federico'}
        Store.dispatch({ type: 'INCREMENT' }); // -> {num: 65, name: 'Federico'}
        Store.dispatch({ type: 'POW' }); // -> {num: 4225, name: 'Federico'}
        Store.dispatch({ type: 'RENAME' }); // -> {num: 4225, name: 'no name given'}
        Store.dispatch({ type: 'RENAME', name: 'Foo' });
        done(); 
    });
});