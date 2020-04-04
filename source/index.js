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
            instance.tagsManager.reset(instance.currentIndex + 1);
        }
        instance.tagsManager.add(actionType);
        instance.states[++instance.currentIndex] = newState;
    }

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

    //
    // Store
    //
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
