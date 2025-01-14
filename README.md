[![Coverage Status](https://coveralls.io/repos/github/fedeghe/ridof/badge.svg?branch=master)](https://coveralls.io/github/fedeghe/ridof?branch=master)

# Ridof

Simple isomorphic state manager

## Install it

    @ yarn add ridof

## Use it

Create a store
``` js
const Ridof = require('ridof');

const initialState = {
    num: 1,
    name: 'Federico'
}
// The reducer function
// params holds all the values passed to dispatch but the type
const reducer = (oldState, action, payload) => {
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
            newState.name = payload.name || 'no name given';
            break;
    }
    return newState;
}

// initialState is optional, default is {}
const Store = Ridof.getStore(reducer, initialState);
Store.subscribe((oldState, newState, action) => {
    console.log(newState);
})
Store.dispatch({type: 'INCREMENT'}) // -> {num: 2, name: 'Federico'}
Store.dispatch({type: 'INCREMENT'}) // -> {num: 3, name: 'Federico'}
Store.dispatch({type: 'POW'}) // -> {num: 9, name: 'Federico'}
Store.dispatch({type: 'DECREMENT'}) // -> {num: 8, name: 'Federico'}
Store.dispatch({type: 'POW'}) // -> {num: 64, name: 'Federico'}
Store.dispatch({type: 'INCREMENT'}) // -> {num: 65, name: 'Federico'}
Store.dispatch({type: 'POW'}) // -> {num: 4225, name: 'Federico'}
Store.dispatch({type: 'RENAME'}) // -> {num: 4225, name: 'no name given'}
Store.dispatch({type: 'RENAME', payload: {name: 'Foo'}}) // -> {num: 4225, name: 'Foo'}
...
```
## Time travel 
Check the states and time travel. It works exactly like the undo redo of any editor:  
Suppose the state history is `[s0, s1, ... si, ... sn]` where sn is the current state. We can navigate back and forth within that range, and suppose we go back to `si`, if now we dispatch an action that will bring to `sx` then all states from `s(i+1)` to `sn` will be lost and the new history will be `[s0, s1, .... si, sx]`

----

## Store functions

Creates a store given one reducer function 
``` js
const Store = Ridof.getStore(reducer, [initialStatus || {}]);
```
the reducer function will receive the following:
- **oldState**: the current state
- **action**: the action label
- **payload**: the ones passed to ‘dispatch’

Return the current state  
``` js
const currentState = Store.getState();
```
----
Add a subscriber function, will receive the following params:
- **oldState**: the old state
- **newState**: the new state
- **action**: the specific action type dispatched
``` js
Store.subscribe(subscriber);
```
-----

Dispatch an action:

``` js
Store.dispatch({
    type:'INCREMENT', // needs at least a type field
    payload: {}
});
```

-----
Move in the states:
``` js
Store.move(i);
```
The integer passed has to be negative to go back, positive to go forward. So for example we can go back two step calling `Store.move(-2)` then, **if we do NOT dispatch** an action, we could move forward of 1 or 2 steps. In case we target a state that is not indexed in the history array then there will be no effects. 

----
Replace the reducer function
``` js
Store.replaceReducer(newReducer);
```
-----
Reset state to the initialState, clears history and subscribers
``` js
Store.reset();
```
-----
Combine two or more reducers
``` js
var reducer = Ridof.combine({
    mods: (oldState = [], action, payload) => {
        const newState = [...oldState];
        switch (action) {
            case 'ADDMOD': newState.push(payload.name); break;
            default:;
        }
        return newState;
    },
    plugins: (oldState = [], action, payload) => {
        const newState = [...oldState];
        switch (action) {
            case 'ADDPLUGIN': newState.push(payload.name); break;
            default:;
        }
        return newState;
    }
});
var store = Ridof.getStore(reducer);
store.subscribe((oldState, newState, action) => {
    if (action === 'END') {
        console.log(store.getState())
        /*
        {   
            mods: ['mymod1', 'mymod2'],
            plugins: ['myplugin']
        }
        */
    }
});
store.dispatch({
    type: 'ADDPLUGIN',
    payload: { name: 'myplugin' }
});
store.dispatch({
    type: 'ADDMOD',
    payload: {
        name: 'mymod1'
    }
});
store.dispatch({
    type: 'ADDMOD',
    payload: {
        name: 'mymod2'
    }
});
store.dispatch({ type: 'END' });
```
-----

Restrict state transitions  

From version 1.3.0 is possible to restrict the state transitions passing to `getStore` a third config parameter as a function: 

``` js
Ridof.getStore(
    reducer,
    initState,
    (previousAction, currentAction, state, action) => {
        // here tags are corresponds to action types
        // let's say we want forbid a plugins to be added 
        // right after a mod was added
        if (previousAction === 'ADDMOD' && currentAction === 'ADDPLUGIN') return false
        return true
    }
);
```