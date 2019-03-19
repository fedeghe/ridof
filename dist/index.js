/*
           d8,      d8b            ,d8888b
          `8P       88P            88P'
                   d88          d888888P
  88bd88b  88b d888888   d8888b   ?88'
  88P'  `  88Pd8P' ?88  d8P' ?88  88P
 d88      d88 88b  ,88b 88b  d88 d88
d88'     d88' `?88P'`88b`?8888P'd88'

                                      v. 1.1.2

Date: 19/3/2019
Size: ~2KB
*/
var Ridof=function(){"use strict";function t(){return{}}function e(t,e){if("function"!=typeof t)throw new Error(e)}function n(t,e){if(void 0===t)throw new Error(e)}function r(t,e,n){
var r=t.states[t.currentIndex];t.listeners.forEach(function(t){t(r,e,n)}),t.currentIndex<t.states.length-1&&(t.states=t.states.slice(0,t.currentIndex)),t.states[++t.currentIndex]=e}function s(n,r){
this.reducer=n||t(),e(n,o.REDUCERS_FUCTION),this.state=void 0!==r?r:this.reducer(),this.states=[this.state],this.currentIndex=0,this.listeners=[]}function i(t){const e={};var n;for(n in t)e[n]=t[n]()
;return function(n,r,s){n=n||e;var i,o=Object.assign({},n);for(i in t)o[i]=t[i](o[i],r,s);return o}}const o={REDUCERS_FUCTION:"[ERROR] Reducer must be a function!",
REDUCERS_RETURN:"[ERROR] Reducer should return something!",SUBSCRIBERS_FUNCTION:"[ERROR] Subscribers must be a functions!",ACTION_TYPE:"[ERROR] Actions needs a type"}
;return s.prototype.getState=function(){return this.states[this.currentIndex]},s.prototype.dispatch=function(t){if(!("type"in t))throw new Error(o.ACTION_TYPE)
;var e=t.type,s=this.states[this.currentIndex],i=this.reducer(s,e,t);return n(i,o.REDUCERS_RETURN),delete i.type,r(this,i,e),this},s.prototype.subscribe=function(t){e(t,o.SUBSCRIBERS_FUNCTION)
;var n,r=this;return this.listeners.push(t),n=this.listeners.length-1,function(){r.listeners=r.listeners.slice(0,n).concat(r.listeners.slice(n+1))}},s.prototype.replaceReducer=function(t){
e(t,o.REDUCERS_FUCTION),this.reducer=t},s.prototype.reset=function(){var t=this.states[0];this.states=[t],this.currentIndex=0,this.listeners=[]},s.prototype.move=function(t){if(0===t)return this
;var e=this,n=this.currentIndex+t,r=this.getState(),s=t>0?"FORWARD":"BACKWARD",i=n>-1&&n<this.states.length;return this.currentIndex=i?n:this.currentIndex,i&&this.listeners.forEach(function(t){
t(r,e.getState(),{type:["TIMETRAVEL_",s].join("")})}),this},{combine:i,getStore:function(t,e){return new s(t,e)},isStore:function(t){return t instanceof s},ERRORS:o}}()
;"object"==typeof exports&&(module.exports=Ridof);