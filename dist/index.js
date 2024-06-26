'use strict';
/*
           d8,      d8b            ,d8888b
          `8P       88P            88P'
                   d88          d888888P
  88bd88b  88b d888888   d8888b   ?88'
  88P'  `  88Pd8P' ?88  d8P' ?88  88P
 d88      d88 88b  ,88b 88b  d88 d88
d88'     d88' `?88P'`88b`?8888P'd88'

                                    v. 1.3.3

Size: ~3KB
*/
var Ridof=function(){"use strict";function t(t,e){if("function"!=typeof t)throw new Error(e)}function e(t,e){if(void 0===t)throw new Error(e)}function s(t,e){this.activeCheck=!!e,this.config=e,
this.tags=[t],this.index=0}function i(e,i,r){t(e,n.REDUCERS_FUNCTION),this.reducer=e,this.state=void 0!==i?i:this.reducer(),this.states=[this.state],this.config=r,
this.tagsManager=new s("INITIAL",this.config),this.currentIndex=0,this.subscribers=[]}function r(t){const e={};var s;for(s in t)e[s]=t[s]();return function(i,r,n){i=i||e;var o=Object.assign({},i)
;for(s in t)o[s]=t[s](o[s],r,n);return o}}const n={REDUCERS_FUNCTION:"[ERROR] Reducer must be a function!",REDUCERS_RETURN:"[ERROR] Reducer should return something!",
SUBSCRIBERS_FUNCTION:"[ERROR] Subscribers must be a functions!",ACTION_TYPE:"[ERROR] Actions needs a type",UNAUTHORIZED_STATECHANGE:"[ERROR] State transition not allowed"}
;return s.prototype.getCurrent=function(){return this.tags[this.index]},s.prototype.canMoveTo=function(t,e,s){var i=this.getCurrent();return!this.activeCheck||this.config(i,t,e,s)},
s.prototype.save=function(t,e){this.index=e,this.tags=this.tags.slice(0,e),this.tags[this.index]=t},s.prototype.reset=function(t){this.tags=t?this.tags.slice(0,t):[]},
i.prototype.pushState=function(t,e){var s=this.states[this.currentIndex];JSON.stringify(s)!==JSON.stringify(t)&&(this.subscribers.forEach(function(i){i(s,t,e)}),
this.currentIndex<this.states.length-1&&(this.states=this.states.slice(0,this.currentIndex),this.tagsManager.reset(this.currentIndex+1)),++this.currentIndex,this.tagsManager.save(e,this.currentIndex),
this.states[this.currentIndex]=t)},i.prototype.getState=function(){return this.states[this.currentIndex]},i.prototype.dispatch=function(t,s){if(!("type"in t))throw new Error(n.ACTION_TYPE)
;if(!this.tagsManager.canMoveTo(t.type,this.state,t))throw new Error(n.UNAUTHORIZED_STATECHANGE);var i,r=t.type,o=this.reducer({oldState:this.states[this.currentIndex],action:r,payload:t})
;if(e(o,n.REDUCERS_RETURN),delete o.type,s)for(i in t)"type"===i||i in o||(o[i]=t[i]);return this.pushState(o,r),this},i.prototype.subscribe=function(e){t(e,n.SUBSCRIBERS_FUNCTION);var s,i=this
;return this.subscribers.push(e),s=this.subscribers.length-1,function(){i.subscribers=i.subscribers.slice(0,s).concat(i.subscribers.slice(s+1))}},i.prototype.replaceReducer=function(e){
t(e,n.REDUCERS_FUNCTION),this.reducer=e},i.prototype.reset=function(){var t=this.states[0];this.states=[t],this.currentIndex=0,this.tagsManager.reset(),this.subscribers=[]},
i.prototype.move=function(t){if(0===t)return this;var e=this,s=this.currentIndex+t,i=this.getState(),r=t>0?"FORWARD":"BACKWARD",n=s>-1&&s<this.states.length
;return this.currentIndex=n?s:this.currentIndex,n&&this.subscribers.forEach(function(t){t(i,e.getState(),{type:["TIMETRAVEL_",r].join("")})}),this},{combine:r,getStore:function(t,e,s){
return new i(t,e,s)},isStore:function(t){return t instanceof i},ERRORS:n}}();"object"==typeof exports&&(module.exports=Ridof);