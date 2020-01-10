[![Coverage Status](https://coveralls.io/repos/github/fedeghe/ridof/badge.svg?branch=master)](https://coveralls.io/github/fedeghe/ridof?branch=master)
[![Build Status](https://travis-ci.org/fedeghe/ridof.svg?branch=master)](https://travis-ci.org/fedeghe/ridof)

# Ridof

Simple isomorphic state manager

## Install it

    @ npm i ridof

## Run the tests coverage

From the `node_modules/ridof` folder run

    @ npm i && npm run cover

## Use it

Load the `dist/index.js` script and then...

Create a store
``` js
const Ridof = require('ridof');

const initialState = {
    swithes: 0,
    lit: false
}
// The reducer function
// params holds all the values passed to dispatch but the type
const reducer = (oldState, action, params) => {
    const newState = Object.assign({}, oldState)
    // can happen that the bulb breaks
    if (Math.random() < 0.01) {
        action = 'BREAK'
    }
    switch (action) {
        case 'TOGGLE':
            newState.lit = !oldState.lit
            newState.switches = oldState.switches + 1
            break;
        case 'BREAK':
            newState.lit = false;
            break;
    }
    return newState;
}

// initialState is optional, default is {}
const Store = Ridof.getStore(reducer, initialState);
Store.subscribe((oldState, newState, action) => {
    console.log(newState);
})
Store.dispatch({type: 'TOGGLE'}) // -> {swithes: 1, lit: true}
Store.dispatch({type: 'TOGGLE'}) // -> {swithes: 2, lit: false}
Store.dispatch({type: 'TOGGLE'}) // -> {swithes: 3, lit: true}
Store.dispatch({type: 'TOGGLE'}) // -> {swithes: 4, lit: false}
Store.dispatch({type: 'TOGGLE'}) // -> {swithes: 5, lit: true}
Store.dispatch({type: 'BREAK'}) // -> {swithes: 6, lit: false}
Store.dispatch({type: 'TOGGLE'}) // Exception
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
- **params**: all passed to ‘dispatch’ but the type 

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
a second `Boolean` parameter is accepted by the `dispatch`; when `true` it allows to add (after reducer action on the state) the parameters passed that are missing on the state:
``` js
// state: { num: 0 }
Store.dispatch({
    type:'INCREMENT', // this action only increments `num`
    all: 'others',
    params: 'follows'
}, true); // it is passed so missing ones will be added
// state: { num: 0, all: 'others', params: 'follows'}
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
store.dispatch({ type: 'ADDPLUGIN', name: 'myplugin' });
store.dispatch({ type: 'ADDMOD', name: 'mymod1' });
store.dispatch({ type: 'ADDMOD', name: 'mymod2' });
store.dispatch({ type: 'END' });
```
-----

Restrict state transitions  

From version 1.2.0 is possible to restrict the state transitions passing to `getStore` a third config parameter: 

``` js
Ridof.getStore(reducer, initState, {
    'INITIAL': [ 1 ],
    'TOGGLE': [
        1, // either toggle
        2   //   "   break
    ],
    'BREAK': [/* go nowhere from here */]
});
```
as You can see this bulb will