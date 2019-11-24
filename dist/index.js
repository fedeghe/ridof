/*
           d8,      d8b            ,d8888b
          `8P       88P            88P'
                   d88          d888888P
  88bd88b  88b d888888   d8888b   ?88'
  88P'  `  88Pd8P' ?88  d8P' ?88  88P
 d88      d88 88b  ,88b 88b  d88 d88
d88'     d88' `?88P'`88b`?8888P'd88'

                                      v. 1.1.7

Size: ~5KB
*/
var Ridof = (function () {
    'use strict';
    const ERRORS = {
        REDUCERS_FUCTION: '[ERROR] Reducer must be a function!',
        REDUCERS_RETURN: '[ERROR] Reducer should return something!',
        SUBSCRIBERS_FUNCTION: '[ERROR] Subscribers must be a functions!',
        ACTION_TYPE: '[ERROR] Actions needs a type',
        UNAUTHORIZED_STATECHANGE: '[ERROR] State transition not allowed'
    };

    function _isFunction (o, msg) {
        if (typeof o !== 'function') { throw new Error(msg); }
    }
    function _isDefined (o, msg) {
        if (typeof o === 'undefined') { throw new Error(msg); }
    }
    function _pushState (instance, newState, actionType) {
        var oldState = instance.states[instance.currentIndex];
        instance.listeners.forEach(function (sub) {
            sub(oldState, newState, actionType);
        });
        if (instance.currentIndex < instance.states.length - 1) {
            instance.states = instance.states.slice(0, instance.currentIndex);
        }
        instance.states[++instance.currentIndex] = newState;
    }

    function Store (reducer, state, config) {
        _isFunction(reducer, ERRORS.REDUCERS_FUCTION);
        this.reducer = reducer;
        this.state = typeof state !== 'undefined' ? state : this.reducer();
        this.states = [this.state];
        this.config = config;
        this.currentStateName = 'INITIAL';
        this.currentIndex = 0;
        this.listeners = [];
    }

    Store.prototype.getState = function () {
        return this.states[this.currentIndex];
    };

    // eslint-disable-next-line complexity
    Store.prototype.dispatch = function (action, add) {
        if (!('type' in action)) { throw new Error(ERRORS.ACTION_TYPE); }
        if (this.config
            && action.type
            && this.currentStateName in this.config
            && !(this.config[this.currentStateName].includes(action.type))
        ) {
            throw new Error(ERRORS.UNAUTHORIZED_STATECHANGE);
        }

        var actionType = action.type,
            oldState = this.states[this.currentIndex],
            newState = this.reducer(oldState, actionType, action),
            i;
        _isDefined(newState, ERRORS.REDUCERS_RETURN);
        delete newState.type;
        if (add) {
            for (i in action) {
                if (i !== 'type' && !(i in newState)) {
                    newState[i] = action[i];
                }
            }
        }
        if (this.config) {
            this.currentStateName = actionType;
        }
        _pushState(this, newState, actionType);
        return this;
    };

    Store.prototype.subscribe = function (subscriber) {
        _isFunction(subscriber, ERRORS.SUBSCRIBERS_FUNCTION);
        var self = this,
            p;
        this.listeners.push(subscriber);
        p = this.listeners.length - 1;
        //
        // return the unsubcriber
        return function () {
            self.listeners = self.listeners.slice(0, p).concat(self.listeners.slice(p + 1));
        };
    };

    Store.prototype.replaceReducer = function (reducer) {
        _isFunction(reducer, ERRORS.REDUCERS_FUCTION);
        this.reducer = reducer;
    };

    Store.prototype.reset = function () {
        var s0 = this.states[0];
        this.states = [s0];
        this.currentIndex = 0;
        this.currentStateName = 'INITIAL';
        this.listeners = [];
    };

    Store.prototype.move = function (to) {
        if (to === 0) return this;
        var self = this,
            tmpIndex = this.currentIndex + to,
            oldState = this.getState(),
            versus = to > 0 ? 'FORWARD' : 'BACKWARD',
            willChange = tmpIndex > -1 && tmpIndex < this.states.length;
        this.currentIndex = willChange ? tmpIndex : this.currentIndex;
        //
        willChange && this.listeners.forEach(function (sub) {
            sub(oldState, self.getState(), { type: ['TIMETRAVEL_', versus].join('') });
        });
        return this;
    };

    function combine (reducers) {
        const initState = {};
        var red;
        for (red in reducers) {
            initState[red] = reducers[red]();
        }
        return function (state, action, params) {
            state = state || initState;
            var newState = Object.assign({}, state),
                reducer;
            for (reducer in reducers) {
                newState[reducer] = reducers[reducer](newState[reducer], action, params);
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
