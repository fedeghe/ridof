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

