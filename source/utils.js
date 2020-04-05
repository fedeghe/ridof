/* eslint-disable no-unused-vars */
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

