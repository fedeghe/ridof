/*
           d8,      d8b            ,d8888b
          `8P       88P            88P'
                   d88          d888888P
  88bd88b  88b d888888   d8888b   ?88'
  88P'  `  88Pd8P' ?88  d8P' ?88  88P
 d88      d88 88b  ,88b 88b  d88 d88
d88'     d88' `?88P'`88b`?8888P'd88'

                                      v. $PACKAGE.version$

Size: ~6KB
*/
/* eslint-disable no-undef */
var Ridof = (function () {
    'use strict';

    /*
    [Malta] errors.js
    */
    /* eslint-disable no-unused-vars */
    const ERRORS = {
        REDUCERS_FUCTION: '[ERROR] Reducer must be a function!',
        REDUCERS_RETURN: '[ERROR] Reducer should return something!',
        SUBSCRIBERS_FUNCTION: '[ERROR] Subscribers must be a functions!',
        ACTION_TYPE: '[ERROR] Actions needs a type',
        UNAUTHORIZED_STATECHANGE: '[ERROR] State transition not allowed'
    };
    ;
    /*
    [Malta] utils.js
    */
    /* eslint-disable no-unused-vars */
    function _isFunction (o, msg) {
        if (typeof o !== 'function') { throw new Error(msg); }
    }
    
    function _isDefined (o, msg) {
        if (typeof o === 'undefined') { throw new Error(msg); }
    }
    
    function _pushState (inst, newState, actionType) {
        var oldState = inst.states[inst.currentIndex];
        inst.listeners.forEach(function (sub) {
            sub(oldState, newState, actionType);
        });
        if (inst.currentIndex < inst.states.length - 1) {
            inst.states = inst.states.slice(0, inst.currentIndex);
            inst.tagsManager.reset(inst.currentIndex + 1);
        }
        inst.tagsManager.add(actionType);
        inst.states[++inst.currentIndex] = newState;
    }
    
    ;
    /*
    [Malta] tagsManager.js
    */
    function TagsManager (init, config) {
        this.activeCheck = !!config;
        this.config = config || {};
        this.tags = [init];
        this.size = 1;
    }
    TagsManager.prototype.getCurrent = function () {
        return this.tags[this.size - 1];
    };
    TagsManager.prototype.canMoveTo = function (tag) {
        if (this.activeCheck) {
            // tag in this.config
            var keys = Object.keys(this.config),
                currentKey = this.tags[this.size - 1],
                key = ~~(keys.indexOf(tag));
            return key >= 0
                ? this.config[currentKey].includes(key)
                : false;
        }
        return true;
    };
    TagsManager.prototype.add = function (tag) {
        this.size++;
        this.tags.push(tag);
    };
    TagsManager.prototype.reset = function (to) {
        this.tags = to ? this.tags.slice(0, to) : [];
        this.size = to ? this.tags.length : 1;
    };
    ;
    /*
    [Malta] store.js
    */
    /* eslint-disable no-undef */
    function Store (reducer, state, config) {
        _isFunction(reducer, ERRORS.REDUCERS_FUCTION);
        this.reducer = reducer;
        this.state = typeof state !== 'undefined' ? state : this.reducer();
        this.states = [this.state];
        this.tagsManager = new TagsManager('INITIAL', config);
        this.currentIndex = 0;
        this.listeners = [];
    }
    
    Store.prototype.getState = function () {
        return this.states[this.currentIndex];
    };
    
    // eslint-disable-next-line complexity
    Store.prototype.dispatch = function (action, add) {
        if (!('type' in action)) {
            throw new Error(ERRORS.ACTION_TYPE);
        }
        if (!this.tagsManager.canMoveTo(action.type)) {
            throw new Error(ERRORS.UNAUTHORIZED_STATECHANGE);
        }
    
        // eslint-disable-next-line one-var
        var actionType = action.type,
            newState = this.reducer(
                this.states[this.currentIndex], // old state      */
                actionType,
                action),
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
        this.tagsManager.reset();
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
    ;

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
