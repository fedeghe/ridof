/* eslint-disable no-undef */
function Store (reducer, state, config) {
    _isFunction(reducer, ERRORS.REDUCERS_FUNCTION);
    this.reducer = reducer;
    this.state = typeof state !== 'undefined' ? state : this.reducer();
    this.states = [this.state];
    this.config = config;
    this.tagsManager = new TagsManager('INITIAL', this.config);
    this.currentIndex = 0;
    this.subscribers = [];
}

Store.prototype.pushState = function (newState, actionType) {
    var oldState = this.states[this.currentIndex];
    if (JSON.stringify(oldState) !== JSON.stringify(newState)) {
        this.subscribers.forEach(function (subscriber) {
            subscriber(oldState, newState, actionType);
        });
        if (this.currentIndex < this.states.length - 1) {
            this.states = this.states.slice(0, this.currentIndex);
            this.tagsManager.reset(this.currentIndex + 1);
        }
        ++this.currentIndex;
        this.tagsManager.save(actionType, this.currentIndex);
        this.states[this.currentIndex] = newState;
    }
};

Store.prototype.getState = function () {
    return this.states[this.currentIndex];
};

Store.prototype.dispatch = function (action, add) {
    if (!('type' in action)) {
        throw new Error(ERRORS.ACTION_TYPE);
    }
    if (!this.tagsManager.canMoveTo(action.type, this.state, action)) {
        throw new Error(ERRORS.UNAUTHORIZED_STATECHANGE);
    }
    var actionType = action.type,
        newState = this.reducer({
            oldState: this.states[this.currentIndex],
            action: actionType,
            payload: action
        }),
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
    this.subscribers.push(subscriber);
    p = this.subscribers.length - 1;

    // unsubcriber
    return function () {
        self.subscribers = self.subscribers.slice(0, p).concat(self.subscribers.slice(p + 1));
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
    this.subscribers = [];
};

/**
 * changes the currentIndex, and lets the listener know
 * @param {*} to
 */
Store.prototype.move = function (to) {
    if (to === 0) return this;
    var self = this,
        tmpIndex = this.currentIndex + to,
        oldState = this.getState(),
        versus = to > 0 ? 'FORWARD' : 'BACKWARD',
        willChange = tmpIndex > -1 && tmpIndex < this.states.length;
    this.currentIndex = willChange ? tmpIndex : this.currentIndex;

    willChange && this.subscribers.forEach(function (sub) {
        sub(oldState, self.getState(), { type: ['TIMETRAVEL_', versus].join('') });
    });
    return this;
};
