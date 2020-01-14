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
