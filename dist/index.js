'use strict';
/*
           d8,      d8b            ,d8888b
          `8P       88P            88P'
                   d88          d888888P
  88bd88b  88b d888888   d8888b   ?88'
  88P'  `  88Pd8P' ?88  d8P' ?88  88P
 d88      d88 88b  ,88b 88b  d88 d88
d88'     d88' `?88P'`88b`?8888P'd88'

                                    v. 1.2.10

Size: ~3KB
*/
var Ridof=function(){"use strict";function t(t,e){if("function"!=typeof t)throw new Error(e)}function e(t,e){if(void 0===t)throw new Error(e)}function s(t,e,s){var n=t.states[t.currentIndex]
;t.listeners.forEach(function(t){t(n,e,s)}),t.currentIndex<t.states.length-1&&(t.states=t.states.slice(0,t.currentIndex),t.tagsManager.reset(t.currentIndex+1)),t.tagsManager.add(s),
t.states[++t.currentIndex]=e}function n(t,e){this.activeCheck=!!e,this.config=e||{},this.tags=[t],this.size=1}function r(e,s,r){t(e,o.REDUCERS_FUCTION),this.reducer=e,
this.state=void 0!==s?s:this.reducer(),this.states=[this.state],this.tagsManager=new n("INITIAL",r),this.currentIndex=0,this.listeners=[]}function i(t){const e={};var s;for(s in t)e[s]=t[s]()
;return function(n,r,i){n=n||e;var o=Object.assign({},n);for(s in t)o[s]=t[s](o[s],r,i);return o}}const o={REDUCERS_FUCTION:"[ERROR] Reducer must be a function!",
REDUCERS_RETURN:"[ERROR] Reducer should return something!",SUBSCRIBERS_FUNCTION:"[ERROR] Subscribers must be a functions!",ACTION_TYPE:"[ERROR] Actions needs a type",
UNAUTHORIZED_STATECHANGE:"[ERROR] State transition not allowed"};return n.prototype.getCurrent=function(){return this.tags[this.size-1]},n.prototype.canMoveTo=function(t){if(this.activeCheck){
var e=Object.keys(this.config),s=this.tags[this.size-1],n=~~e.indexOf(t);return n>=0&&this.config[s].includes(n)}return!0},n.prototype.add=function(t){this.size++,this.tags.push(t)},
n.prototype.reset=function(t){this.tags=t?this.tags.slice(0,t):[],this.size=t?this.tags.length:1},r.prototype.getState=function(){return this.states[this.currentIndex]},
r.prototype.dispatch=function(t,n){if(!("type"in t))throw new Error(o.ACTION_TYPE);if(!this.tagsManager.canMoveTo(t.type))throw new Error(o.UNAUTHORIZED_STATECHANGE)
;var r,i=t.type,c=this.reducer(this.states[this.currentIndex],i,t);if(e(c,o.REDUCERS_RETURN),delete c.type,n)for(r in t)"type"===r||r in c||(c[r]=t[r]);return s(this,c,i),this},
r.prototype.subscribe=function(e){t(e,o.SUBSCRIBERS_FUNCTION);var s,n=this;return this.listeners.push(e),s=this.listeners.length-1,function(){
n.listeners=n.listeners.slice(0,s).concat(n.listeners.slice(s+1))}},r.prototype.replaceReducer=function(e){t(e,o.REDUCERS_FUCTION),this.reducer=e},r.prototype.reset=function(){var t=this.states[0]
;this.states=[t],this.currentIndex=0,this.tagsManager.reset(),this.listeners=[]},r.prototype.move=function(t){if(0===t)return this
;var e=this,s=this.currentIndex+t,n=this.getState(),r=t>0?"FORWARD":"BACKWARD",i=s>-1&&s<this.states.length;return this.currentIndex=i?s:this.currentIndex,i&&this.listeners.forEach(function(t){
t(n,e.getState(),{type:["TIMETRAVEL_",r].join("")})}),this},{combine:i,getStore:function(t,e,s){return new r(t,e,s)},isStore:function(t){return t instanceof r},ERRORS:o}}()
;"object"==typeof exports&&(module.exports=Ridof);