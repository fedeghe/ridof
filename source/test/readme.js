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
