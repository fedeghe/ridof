var Ridof = (function () {
    "use strict";
    function _emptyObjFun() { return {}; }

    function _pushState(instance, newState, actionType) {
        var oldState = instance.states[instance.currentIndex];
        instance.listeners.forEach(function (sub) {
            sub(oldState, newState, actionType);
        });
        if (instance.currentIndex < instance.states.length -1 ) {
            instance.states = instance.states.slice(0, instance.currentIndex);
        }
        instance.states[++instance.currentIndex] = newState;
    }

    function Store(reducer, state) {
        this.reducer = reducer || _emptyObjFun;
        this.state = state || this.reducer();
        if (typeof reducer() !== 'object') { throw new Error('Reducer should return an object'); }
        this.states = [this.state];
        this.currentIndex = 0;
        this.listeners = [];
    }

    Store.prototype.getState = function () {
        return this.states[this.currentIndex];
    };

    Store.prototype.dispatch = function (action) {
        if (!('type' in action)) { throw new Error('Actions needs a type'); }
        var actionType = action.type,
            oldState = this.states[this.currentIndex],
            newState = this.reducer(oldState, actionType, action),
            i;
        // force type removal
        delete newState.type;
        for (i in action) {
            if (i !== "type") {
                newState[i] = action[i];
            }
        }
        _pushState(this, newState, actionType);
        return this;
    };

    Store.prototype.subscribe = function (s) {
        var self = this,
            p;
        this.listeners.push(s);
        p = this.listeners.length - 1;
        //
        // return the unsubcriber
        return function () {
            self.listeners = self.listeners.slice(0, p).concat(self.listeners.slice(p + 1));
        };
    };
    Store.prototype.reset = function () {
        var s0 = this.states[0];
        this.states = [s0];
        this.currentIndex = 0;
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
            sub(oldState, self.getState(), {type: 'TIMETRAVEL_' + versus});
        });
        return this;
    };
    return {
        getStore: function (reducer, initState) {
            return new Store(reducer, initState);
        },
        isStore: function (s) {
            return s instanceof Store;
        }
    };
})();

(typeof exports === 'object') && (module.exports = Ridof);
