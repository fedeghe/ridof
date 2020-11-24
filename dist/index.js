'use strict';
/*
           d8,      d8b            ,d8888b
          `8P       88P            88P'
                   d88          d888888P
  88bd88b  88b d888888   d8888b   ?88'
  88P'  `  88Pd8P' ?88  d8P' ?88  88P
 d88      d88 88b  ,88b 88b  d88 d88
d88'     d88' `?88P'`88b`?8888P'd88'

                                    v. 1.2.12

Size: ~3KB
*/
var Ridof=function(){"use strict";function t(t,e){if("function"!=typeof t)throw new Error(e)}function e(t,e){if(void 0===t)throw new Error(e)}function s(t,e){this.activeCheck=!!e,this.config=e,
this.tags=[t],this.index=0}function n(e,n,i){t(e,r.REDUCERS_FUNCTION),this.reducer=e,this.state=void 0!==n?n:this.reducer(),this.states=[this.state],this.config=i,
this.tagsManager=new s("INITIAL",this.config),this.currentIndex=0,this.listeners=[]}function i(t){const e={};var s;for(s in t)e[s]=t[s]();return function(n,i,r){n=n||e;var o=Object.assign({},n)
;for(s in t)o[s]=t[s](o[s],i,r);return o}}const r={REDUCERS_FUNCTION:"[ERROR] Reducer must be a function!",REDUCERS_RETURN:"[ERROR] Reducer should return something!",
SUBSCRIBERS_FUNCTION:"[ERROR] Subscribers must be a functions!",ACTION_TYPE:"[ERROR] Actions needs a type",UNAUTHORIZED_STATECHANGE:"[ERROR] State transition not allowed"}
;return s.prototype.getCurrent=function(){return this.tags[this.index]},s.prototype.canMoveTo=function(t,e){var s=this.getCurrent();return!this.activeCheck||this.config(s,t,e)},
s.prototype.add=function(t,e){this.index=e,this.tags[this.index]=t},s.prototype.reset=function(t){this.tags=t?this.tags.slice(0,t):[]},n.prototype.pushState=function(t,e){
var s=this.states[this.currentIndex];this.listeners.forEach(function(n){n(s,t,e)}),this.currentIndex<this.states.length-1&&(this.states=this.states.slice(0,this.currentIndex),
this.tagsManager.reset(this.currentIndex+1)),++this.currentIndex,this.tagsManager.add(e,this.currentIndex),this.states[this.currentIndex]=t},n.prototype.getState=function(){
return this.states[this.currentIndex]},n.prototype.dispatch=function(t,s){if(!("type"in t))throw new Error(r.ACTION_TYPE)
;if(!this.tagsManager.canMoveTo(t.type,this.state))throw new Error(r.UNAUTHORIZED_STATECHANGE);var n,i=t.type,o=this.reducer(this.states[this.currentIndex],i,t);if(e(o,r.REDUCERS_RETURN),
delete o.type,s)for(n in t)"type"===n||n in o||(o[n]=t[n]);return this.pushState(o,i),this},n.prototype.subscribe=function(e){t(e,r.SUBSCRIBERS_FUNCTION);var s,n=this;return this.listeners.push(e),
s=this.listeners.length-1,function(){n.listeners=n.listeners.slice(0,s).concat(n.listeners.slice(s+1))}},n.prototype.replaceReducer=function(e){t(e,r.REDUCERS_FUNCTION),this.reducer=e},
n.prototype.reset=function(){var t=this.states[0];this.states=[t],this.currentIndex=0,this.tagsManager.reset(),this.listeners=[]},n.prototype.move=function(t){if(0===t)return this
;var e=this,s=this.currentIndex+t,n=this.getState(),i=t>0?"FORWARD":"BACKWARD",r=s>-1&&s<this.states.length;return this.currentIndex=r?s:this.currentIndex,r&&this.listeners.forEach(function(t){
t(n,e.getState(),{type:["TIMETRAVEL_",i].join("")})}),this},{combine:i,getStore:function(t,e,s){return new n(t,e,s)},isStore:function(t){return t instanceof n},ERRORS:r}}()
;"object"==typeof exports&&(module.exports=Ridof);