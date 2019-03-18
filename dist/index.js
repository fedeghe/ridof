/*
           d8,      d8b            ,d8888b
          `8P       88P            88P'
                   d88          d888888P
  88bd88b  88b d888888   d8888b   ?88'
  88P'  `  88Pd8P' ?88  d8P' ?88  88P
 d88      d88 88b  ,88b 88b  d88 d88
d88'     d88' `?88P'`88b`?8888P'd88'

                                      v. 1.0.3

Date: 19/3/2019
Size: ~2KB
*/
var Ridof=function(){"use strict";function t(){return{}}function e(t){if("object"!=typeof t())throw new Error("Reducer should return an object")}function r(t,e,r){var n=t.states[t.currentIndex]
;t.listeners.forEach(function(t){t(n,e,r)}),t.currentIndex<t.states.length-1&&(t.states=t.states.slice(0,t.currentIndex)),t.states[++t.currentIndex]=e}function n(r,n){this.reducer=r||t,
this.state=n||this.reducer(),e(r),this.states=[this.state],this.currentIndex=0,this.listeners=[]}function s(t){const e={};var r;for(r in t)e[r]=t[r]();return function(r,n,s){r=r||e
;var i,o=Object.assign({},r);for(i in t)o[i]=t[i](o[i],n,s);return o}}return n.prototype.getState=function(){return this.states[this.currentIndex]},n.prototype.dispatch=function(t){
if(!("type"in t))throw new Error("Actions needs a type");var e=t.type,n=this.states[this.currentIndex],s=this.reducer(n,e,t);return delete s.type,r(this,s,e),this},n.prototype.subscribe=function(t){
var e,r=this;return this.listeners.push(t),e=this.listeners.length-1,function(){r.listeners=r.listeners.slice(0,e).concat(r.listeners.slice(e+1))}},n.prototype.replaceReducer=function(t){e(t),
this.reducer=t},n.prototype.reset=function(){var t=this.states[0];this.states=[t],this.currentIndex=0,this.listeners=[]},n.prototype.move=function(t){if(0===t)return this
;var e=this,r=this.currentIndex+t,n=this.getState(),s=t>0?"FORWARD":"BACKWARD",i=r>-1&&r<this.states.length;return this.currentIndex=i?r:this.currentIndex,i&&this.listeners.forEach(function(t){
t(n,e.getState(),{type:["TIMETRAVEL_",s].join("")})}),this},{combineReducers:s,getStore:function(t,e){return new n(t,e)},isStore:function(t){return t instanceof n}}}()
;"object"==typeof exports&&(module.exports=Ridof);