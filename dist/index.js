/*
           d8,      d8b            ,d8888b
          `8P       88P            88P'
                   d88          d888888P
  88bd88b  88b d888888   d8888b   ?88'
  88P'  `  88Pd8P' ?88  d8P' ?88  88P
 d88      d88 88b  ,88b 88b  d88 d88
d88'     d88' `?88P'`88b`?8888P'd88'

                                      v. 1.0.3

Date: 3/2/2019
Size: ~1KB
*/
var Ridof=function(){"use strict";function t(){return{}}function e(t){if("object"!=typeof t())throw new Error("Reducer should return an object")}function r(t,e,r){var s=t.states[t.currentIndex]
;t.listeners.forEach(function(t){t(s,e,r)}),t.currentIndex<t.states.length-1&&(t.states=t.states.slice(0,t.currentIndex)),t.states[++t.currentIndex]=e}function s(r,s){this.reducer=r||t,
this.state=s||this.reducer(),e(r),this.states=[this.state],this.currentIndex=0,this.listeners=[]}return s.prototype.getState=function(){return this.states[this.currentIndex]},
s.prototype.dispatch=function(t){if(!("type"in t))throw new Error("Actions needs a type");var e,s=t.type,n=this.states[this.currentIndex],i=this.reducer(n,s,t);delete i.type
;for(e in t)"type"!==e&&(i[e]=t[e]);return r(this,i,s),this},s.prototype.subscribe=function(t){var e,r=this;return this.listeners.push(t),e=this.listeners.length-1,function(){
r.listeners=r.listeners.slice(0,e).concat(r.listeners.slice(e+1))}},s.prototype.replaceReducer=function(t){e(t),this.reducer=t},s.prototype.reset=function(){var t=this.states[0];this.states=[t],
this.currentIndex=0,this.listeners=[]},s.prototype.move=function(t){if(0===t)return this;var e=this,r=this.currentIndex+t,s=this.getState(),n=t>0?"FORWARD":"BACKWARD",i=r>-1&&r<this.states.length
;return this.currentIndex=i?r:this.currentIndex,i&&this.listeners.forEach(function(t){t(s,e.getState(),{type:"TIMETRAVEL_"+n})}),this},{getStore:function(t,e){return new s(t,e)},isStore:function(t){
return t instanceof s}}}();"object"==typeof exports&&(module.exports=Ridof);