/*
           d8,      d8b            ,d8888b
          `8P       88P            88P'
                   d88          d888888P
  88bd88b  88b d888888   d8888b   ?88'
  88P'  `  88Pd8P' ?88  d8P' ?88  88P
 d88      d88 88b  ,88b 88b  d88 d88
d88'     d88' `?88P'`88b`?8888P'd88'

                                      v. 1.0.1

Date: 15/12/2018
Size: ~1KB
*/
var Ridof=function(){"use strict";function t(){return{}}function e(t,e,s){var r=t.states[t.currentIndex];t.listeners.forEach(function(t){t(r,e,s)}),t.currentIndex<t.states.length-1&&(t.states=t.states.slice(0,t.currentIndex)),t.states[++t.currentIndex]=e}function s(e,s){if(this.reducer=e||t,this.state=s||this.reducer(),"object"!=typeof e())throw new Error("Reducer should return an object");this.states=[this.state],this.currentIndex=0,this.listeners=[]}return s.prototype.getState=function(){return this.states[this.currentIndex]},s.prototype.dispatch=function(t){if(!("type"in t))throw new Error("Actions needs a type");var s,r=t.type,n=this.states[this.currentIndex],i=this.reducer(n,r,t);delete i.type;for(s in t)"type"!==s&&(i[s]=t[s]);return e(this,i,r),this},s.prototype.subscribe=function(t){var e,s=this;return this.listeners.push(t),e=this.listeners.length-1,function(){s.listeners=s.listeners.slice(0,e).concat(s.listeners.slice(e+1))}},s.prototype.reset=function(){var t=this.states[0];this.states=[t],this.currentIndex=0,this.listeners=[]},s.prototype.move=function(t){if(0===t)return this;var e=this,s=this.currentIndex+t,r=this.getState(),n=t>0?"FORWARD":"BACKWARD",i=s>-1&&s<this.states.length;return this.currentIndex=i?s:this.currentIndex,i&&this.listeners.forEach(function(t){t(r,e.getState(),{type:"TIMETRAVEL_"+n})}),this},{getStore:function(t,e){return new s(t,e)},isStore:function(t){return t instanceof s}}}();"object"==typeof exports&&(module.exports=Ridof);