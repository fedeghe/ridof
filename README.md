[![Coverage Status](https://coveralls.io/repos/github/fedeghe/ridof/badge.svg?branch=master)](https://coveralls.io/github/fedeghe/ridof?branch=master)
[![Build Status](https://travis-ci.org/fedeghe/ridof.svg?branch=master)](https://travis-ci.org/fedeghe/ridof)

# Ridof

Simple state manager

## install dev-deps, build and test

    > npm i
    > npm run build
    > npm test

## Then, in case, use it

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
Store.move(number);
```
----
Reset state to the initialState, clears history and subscribers
``` js
Store.reset();
```
-----
