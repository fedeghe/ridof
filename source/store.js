/* eslint-disable no-undef */
function Store (reducer, state, config) {
    _isFunction(reducer, ERRORS.REDUCERS_FUNCTION);
    this.reducer = reducer;
    this.state = typeof state !== 'undefined' ? state : this.reducer();
    this.states = [this.state];
    this.tagsManager = new TagsManager('INITIAL', config);
    this.currentIndex = 0;
    this.listeners = [];
}

Store.prototype.pushState = function (newState, actionType) {
    var oldState = this.states[this.currentIndex];
    this.listeners.forEach(function (sub) {
        sub(oldState, newState, actionType);
    });
    if (this.currentIndex < this.states.length - 1) {
        this.states = this.states.slice(0, this.currentIndex);
        this.tagsManager.reset(this.currentIndex + 1);
    }
    ++this.currentIndex;
    this.tagsManager.add(actionType, this.currentIndex);
    this.states[this.currentIndex] = newState;
};

Store.prototype.getState = function () {
    return this.states[this.currentIndex];
};

Store.prototype.dispatch = function (action, add) {
    if (!('type' in action)) {
        throw new Error(ERRORS.ACTION_TYPE);
    }
    if (!this.tagsManager.canMoveTo(action.type, this.state)) {
        throw new Error(ERRORS.UNAUTHORIZED_STATECHANGE);
    }
    var actionType = action.type,
        newState = this.reducer(
            this.states[this.currentIndex],
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
    this.pushState(newState, actionType);
    return this;
};

Store.prototype.subscribe = function (subscriber) {
    _isFunction(subscriber, ERRORS.SUBSCRIBERS_FUNCTION);
    var self = this,
        p;
    this.listeners.push(subscriber);
    p = this.listeners.length - 1;

    // unsubcriber
    return function () {
        self.listeners = self.listeners.slice(0, p).concat(self.listeners.slice(p + 1));
    };
};

Store.prototype.replaceReducer = function (reducer) {
    _isFunction(reducer, ERRORS.REDUCERS_FUNCTION);
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

    willChange && this.listeners.forEach(function (sub) {
        sub(oldState, self.getState(), { type: ['TIMETRAVEL_', versus].join('') });
    });
    return this;
};
