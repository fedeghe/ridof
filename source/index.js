/* eslint-disable no-undef */
var Ridof = (function () {
    'use strict';

    // eslint-disable-next-line semi
    maltaF('errors.js')
    // eslint-disable-next-line semi
    maltaF('utils.js')
    // eslint-disable-next-line semi
    maltaF('tagsManager.js')
    // eslint-disable-next-line semi
    maltaF('store.js')

    function combine (reducers) {
        const initState = {};
        var red;
        for (red in reducers) {
            initState[red] = reducers[red]();
        }
        return function (state, action, params) {
            state = state || initState;
            var newState = Object.assign({}, state);
            for (red in reducers) {
                newState[red] = reducers[red](newState[red], action, params);
            }
            return newState;
        };
    }

    return {
        combine: combine,
        getStore: function (reducer, initState, config) {
            return new Store(reducer, initState, config);
        },
        isStore: function (s) {
            return s instanceof Store;
        },
        ERRORS: ERRORS
    };
})();

(typeof exports === 'object') && (module.exports = Ridof);
