[![Coverage Status](https://coveralls.io/repos/github/fedeghe/ridof/badge.svg?branch=master)](https://coveralls.io/github/fedeghe/ridof?branch=master)
[![Build Status](https://travis-ci.org/fedeghe/ridof.svg?branch=master)](https://travis-ci.org/fedeghe/ridof)

# Ridof

Simple state manager


## install it

    > npm i ridof

## use it

Create a store
``` js
const Ridof = require('ridof');

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
Store.dispatch({type: 'RENAME', name: 'Foo'}) // -> {num: 4225, name: 'Foo'}
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
- **state**: the current state
- **action**: the action label
- **params**: all passed to disatch but the type 

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
    all: 'others',
    params: 'follows'
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
var reducer = Ridof.combineReducers({
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
});
var store = Ridof.getStore(combined);
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
store.dispatch({ type: 'ADDPLUGIN', name: 'myplugin' });
store.dispatch({ type: 'ADDMOD', name: 'mymod1' });
store.dispatch({ type: 'ADDMOD', name: 'mymod2' });
store.dispatch({ type: 'END' });
```
-----

