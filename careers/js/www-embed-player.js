(function(){/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
'use strict';var m;function aa(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}}
var ba="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){if(a==Array.prototype||a==Object.prototype)return a;a[b]=c.value;return a};
function ca(a){a=["object"==typeof globalThis&&globalThis,a,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global];for(var b=0;b<a.length;++b){var c=a[b];if(c&&c.Math==Math)return c}throw Error("Cannot find global object");}
var da=ca(this);function t(a,b){if(b)a:{var c=da;a=a.split(".");for(var d=0;d<a.length-1;d++){var e=a[d];if(!(e in c))break a;c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&ba(c,a,{configurable:!0,writable:!0,value:b})}}
t("Symbol",function(a){function b(f){if(this instanceof b)throw new TypeError("Symbol is not a constructor");return new c(d+(f||"")+"_"+e++,f)}
function c(f,g){this.h=f;ba(this,"description",{configurable:!0,writable:!0,value:g})}
if(a)return a;c.prototype.toString=function(){return this.h};
var d="jscomp_symbol_"+(1E9*Math.random()>>>0)+"_",e=0;return b});
t("Symbol.iterator",function(a){if(a)return a;a=Symbol("Symbol.iterator");for(var b="Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "),c=0;c<b.length;c++){var d=da[b[c]];"function"===typeof d&&"function"!=typeof d.prototype[a]&&ba(d.prototype,a,{configurable:!0,writable:!0,value:function(){return ea(aa(this))}})}return a});
function ea(a){a={next:a};a[Symbol.iterator]=function(){return this};
return a}
function u(a){var b="undefined"!=typeof Symbol&&Symbol.iterator&&a[Symbol.iterator];return b?b.call(a):{next:aa(a)}}
function fa(a){if(!(a instanceof Array)){a=u(a);for(var b,c=[];!(b=a.next()).done;)c.push(b.value);a=c}return a}
var ia="function"==typeof Object.create?Object.create:function(a){function b(){}
b.prototype=a;return new b},ja=function(){function a(){function c(){}
new c;Reflect.construct(c,[],function(){});
return new c instanceof c}
if("undefined"!=typeof Reflect&&Reflect.construct){if(a())return Reflect.construct;var b=Reflect.construct;return function(c,d,e){c=b(c,d);e&&Reflect.setPrototypeOf(c,e.prototype);return c}}return function(c,d,e){void 0===e&&(e=c);
e=ia(e.prototype||Object.prototype);return Function.prototype.apply.call(c,e,d)||e}}(),ka;
if("function"==typeof Object.setPrototypeOf)ka=Object.setPrototypeOf;else{var la;a:{var ma={a:!0},na={};try{na.__proto__=ma;la=na.a;break a}catch(a){}la=!1}ka=la?function(a,b){a.__proto__=b;if(a.__proto__!==b)throw new TypeError(a+" is not extensible");return a}:null}var oa=ka;
function v(a,b){a.prototype=ia(b.prototype);a.prototype.constructor=a;if(oa)oa(a,b);else for(var c in b)if("prototype"!=c)if(Object.defineProperties){var d=Object.getOwnPropertyDescriptor(b,c);d&&Object.defineProperty(a,c,d)}else a[c]=b[c];a.R=b.prototype}
function pa(){this.o=!1;this.l=null;this.i=void 0;this.h=1;this.A=this.m=0;this.C=this.j=null}
function qa(a){if(a.o)throw new TypeError("Generator is already running");a.o=!0}
pa.prototype.B=function(a){this.i=a};
function ra(a,b){a.j={eb:b,gb:!0};a.h=a.m||a.A}
pa.prototype.return=function(a){this.j={return:a};this.h=this.A};
function w(a,b,c){a.h=c;return{value:b}}
pa.prototype.u=function(a){this.h=a};
function sa(a,b,c){a.m=b;void 0!=c&&(a.A=c)}
function ta(a){a.m=0;var b=a.j.eb;a.j=null;return b}
function ua(a){a.C=[a.j];a.m=0;a.A=0}
function va(a){var b=a.C.splice(0)[0];(b=a.j=a.j||b)?b.gb?a.h=a.m||a.A:void 0!=b.u&&a.A<b.u?(a.h=b.u,a.j=null):a.h=a.A:a.h=0}
function wa(a){this.h=new pa;this.i=a}
function xa(a,b){qa(a.h);var c=a.h.l;if(c)return ya(a,"return"in c?c["return"]:function(d){return{value:d,done:!0}},b,a.h.return);
a.h.return(b);return za(a)}
function ya(a,b,c,d){try{var e=b.call(a.h.l,c);if(!(e instanceof Object))throw new TypeError("Iterator result "+e+" is not an object");if(!e.done)return a.h.o=!1,e;var f=e.value}catch(g){return a.h.l=null,ra(a.h,g),za(a)}a.h.l=null;d.call(a.h,f);return za(a)}
function za(a){for(;a.h.h;)try{var b=a.i(a.h);if(b)return a.h.o=!1,{value:b.value,done:!1}}catch(c){a.h.i=void 0,ra(a.h,c)}a.h.o=!1;if(a.h.j){b=a.h.j;a.h.j=null;if(b.gb)throw b.eb;return{value:b.return,done:!0}}return{value:void 0,done:!0}}
function Aa(a){this.next=function(b){qa(a.h);a.h.l?b=ya(a,a.h.l.next,b,a.h.B):(a.h.B(b),b=za(a));return b};
this.throw=function(b){qa(a.h);a.h.l?b=ya(a,a.h.l["throw"],b,a.h.B):(ra(a.h,b),b=za(a));return b};
this.return=function(b){return xa(a,b)};
this[Symbol.iterator]=function(){return this}}
function x(a,b){b=new Aa(new wa(b));oa&&a.prototype&&oa(b,a.prototype);return b}
t("Reflect",function(a){return a?a:{}});
t("Reflect.construct",function(){return ja});
t("Reflect.setPrototypeOf",function(a){return a?a:oa?function(b,c){try{return oa(b,c),!0}catch(d){return!1}}:null});
function Ca(a,b){return Object.prototype.hasOwnProperty.call(a,b)}
t("WeakMap",function(a){function b(k){this.h=(h+=Math.random()+1).toString();if(k){k=u(k);for(var l;!(l=k.next()).done;)l=l.value,this.set(l[0],l[1])}}
function c(){}
function d(k){var l=typeof k;return"object"===l&&null!==k||"function"===l}
function e(k){if(!Ca(k,g)){var l=new c;ba(k,g,{value:l})}}
function f(k){var l=Object[k];l&&(Object[k]=function(n){if(n instanceof c)return n;Object.isExtensible(n)&&e(n);return l(n)})}
if(function(){if(!a||!Object.seal)return!1;try{var k=Object.seal({}),l=Object.seal({}),n=new a([[k,2],[l,3]]);if(2!=n.get(k)||3!=n.get(l))return!1;n.delete(k);n.set(l,4);return!n.has(k)&&4==n.get(l)}catch(p){return!1}}())return a;
var g="$jscomp_hidden_"+Math.random();f("freeze");f("preventExtensions");f("seal");var h=0;b.prototype.set=function(k,l){if(!d(k))throw Error("Invalid WeakMap key");e(k);if(!Ca(k,g))throw Error("WeakMap key fail: "+k);k[g][this.h]=l;return this};
b.prototype.get=function(k){return d(k)&&Ca(k,g)?k[g][this.h]:void 0};
b.prototype.has=function(k){return d(k)&&Ca(k,g)&&Ca(k[g],this.h)};
b.prototype.delete=function(k){return d(k)&&Ca(k,g)&&Ca(k[g],this.h)?delete k[g][this.h]:!1};
return b});
t("Map",function(a){function b(){var h={};return h.previous=h.next=h.head=h}
function c(h,k){var l=h.h;return ea(function(){if(l){for(;l.head!=h.h;)l=l.previous;for(;l.next!=l.head;)return l=l.next,{done:!1,value:k(l)};l=null}return{done:!0,value:void 0}})}
function d(h,k){var l=k&&typeof k;"object"==l||"function"==l?f.has(k)?l=f.get(k):(l=""+ ++g,f.set(k,l)):l="p_"+k;var n=h.data_[l];if(n&&Ca(h.data_,l))for(h=0;h<n.length;h++){var p=n[h];if(k!==k&&p.key!==p.key||k===p.key)return{id:l,list:n,index:h,entry:p}}return{id:l,list:n,index:-1,entry:void 0}}
function e(h){this.data_={};this.h=b();this.size=0;if(h){h=u(h);for(var k;!(k=h.next()).done;)k=k.value,this.set(k[0],k[1])}}
if(function(){if(!a||"function"!=typeof a||!a.prototype.entries||"function"!=typeof Object.seal)return!1;try{var h=Object.seal({x:4}),k=new a(u([[h,"s"]]));if("s"!=k.get(h)||1!=k.size||k.get({x:4})||k.set({x:4},"t")!=k||2!=k.size)return!1;var l=k.entries(),n=l.next();if(n.done||n.value[0]!=h||"s"!=n.value[1])return!1;n=l.next();return n.done||4!=n.value[0].x||"t"!=n.value[1]||!l.next().done?!1:!0}catch(p){return!1}}())return a;
var f=new WeakMap;e.prototype.set=function(h,k){h=0===h?0:h;var l=d(this,h);l.list||(l.list=this.data_[l.id]=[]);l.entry?l.entry.value=k:(l.entry={next:this.h,previous:this.h.previous,head:this.h,key:h,value:k},l.list.push(l.entry),this.h.previous.next=l.entry,this.h.previous=l.entry,this.size++);return this};
e.prototype.delete=function(h){h=d(this,h);return h.entry&&h.list?(h.list.splice(h.index,1),h.list.length||delete this.data_[h.id],h.entry.previous.next=h.entry.next,h.entry.next.previous=h.entry.previous,h.entry.head=null,this.size--,!0):!1};
e.prototype.clear=function(){this.data_={};this.h=this.h.previous=b();this.size=0};
e.prototype.has=function(h){return!!d(this,h).entry};
e.prototype.get=function(h){return(h=d(this,h).entry)&&h.value};
e.prototype.entries=function(){return c(this,function(h){return[h.key,h.value]})};
e.prototype.keys=function(){return c(this,function(h){return h.key})};
e.prototype.values=function(){return c(this,function(h){return h.value})};
e.prototype.forEach=function(h,k){for(var l=this.entries(),n;!(n=l.next()).done;)n=n.value,h.call(k,n[1],n[0],this)};
e.prototype[Symbol.iterator]=e.prototype.entries;var g=0;return e});
function Ea(a,b,c){if(null==a)throw new TypeError("The 'this' value for String.prototype."+c+" must not be null or undefined");if(b instanceof RegExp)throw new TypeError("First argument to String.prototype."+c+" must not be a regular expression");return a+""}
t("String.prototype.endsWith",function(a){return a?a:function(b,c){var d=Ea(this,b,"endsWith");b+="";void 0===c&&(c=d.length);c=Math.max(0,Math.min(c|0,d.length));for(var e=b.length;0<e&&0<c;)if(d[--c]!=b[--e])return!1;return 0>=e}});
t("Array.prototype.find",function(a){return a?a:function(b,c){a:{var d=this;d instanceof String&&(d=String(d));for(var e=d.length,f=0;f<e;f++){var g=d[f];if(b.call(c,g,f,d)){b=g;break a}}b=void 0}return b}});
t("String.prototype.startsWith",function(a){return a?a:function(b,c){var d=Ea(this,b,"startsWith");b+="";var e=d.length,f=b.length;c=Math.max(0,Math.min(c|0,d.length));for(var g=0;g<f&&c<e;)if(d[c++]!=b[g++])return!1;return g>=f}});
t("Object.setPrototypeOf",function(a){return a||oa});
var Fa="function"==typeof Object.assign?Object.assign:function(a,b){for(var c=1;c<arguments.length;c++){var d=arguments[c];if(d)for(var e in d)Ca(d,e)&&(a[e]=d[e])}return a};
t("Object.assign",function(a){return a||Fa});
t("Promise",function(a){function b(g){this.h=0;this.j=void 0;this.i=[];this.o=!1;var h=this.l();try{g(h.resolve,h.reject)}catch(k){h.reject(k)}}
function c(){this.h=null}
function d(g){return g instanceof b?g:new b(function(h){h(g)})}
if(a)return a;c.prototype.i=function(g){if(null==this.h){this.h=[];var h=this;this.j(function(){h.A()})}this.h.push(g)};
var e=da.setTimeout;c.prototype.j=function(g){e(g,0)};
c.prototype.A=function(){for(;this.h&&this.h.length;){var g=this.h;this.h=[];for(var h=0;h<g.length;++h){var k=g[h];g[h]=null;try{k()}catch(l){this.l(l)}}}this.h=null};
c.prototype.l=function(g){this.j(function(){throw g;})};
b.prototype.l=function(){function g(l){return function(n){k||(k=!0,l.call(h,n))}}
var h=this,k=!1;return{resolve:g(this.P),reject:g(this.A)}};
b.prototype.P=function(g){if(g===this)this.A(new TypeError("A Promise cannot resolve to itself"));else if(g instanceof b)this.ja(g);else{a:switch(typeof g){case "object":var h=null!=g;break a;case "function":h=!0;break a;default:h=!1}h?this.M(g):this.m(g)}};
b.prototype.M=function(g){var h=void 0;try{h=g.then}catch(k){this.A(k);return}"function"==typeof h?this.ka(h,g):this.m(g)};
b.prototype.A=function(g){this.B(2,g)};
b.prototype.m=function(g){this.B(1,g)};
b.prototype.B=function(g,h){if(0!=this.h)throw Error("Cannot settle("+g+", "+h+"): Promise already settled in state"+this.h);this.h=g;this.j=h;2===this.h&&this.X();this.C()};
b.prototype.X=function(){var g=this;e(function(){if(g.G()){var h=da.console;"undefined"!==typeof h&&h.error(g.j)}},1)};
b.prototype.G=function(){if(this.o)return!1;var g=da.CustomEvent,h=da.Event,k=da.dispatchEvent;if("undefined"===typeof k)return!0;"function"===typeof g?g=new g("unhandledrejection",{cancelable:!0}):"function"===typeof h?g=new h("unhandledrejection",{cancelable:!0}):(g=da.document.createEvent("CustomEvent"),g.initCustomEvent("unhandledrejection",!1,!0,g));g.promise=this;g.reason=this.j;return k(g)};
b.prototype.C=function(){if(null!=this.i){for(var g=0;g<this.i.length;++g)f.i(this.i[g]);this.i=null}};
var f=new c;b.prototype.ja=function(g){var h=this.l();g.va(h.resolve,h.reject)};
b.prototype.ka=function(g,h){var k=this.l();try{g.call(h,k.resolve,k.reject)}catch(l){k.reject(l)}};
b.prototype.then=function(g,h){function k(r,q){return"function"==typeof r?function(z){try{l(r(z))}catch(B){n(B)}}:q}
var l,n,p=new b(function(r,q){l=r;n=q});
this.va(k(g,l),k(h,n));return p};
b.prototype.catch=function(g){return this.then(void 0,g)};
b.prototype.va=function(g,h){function k(){switch(l.h){case 1:g(l.j);break;case 2:h(l.j);break;default:throw Error("Unexpected state: "+l.h);}}
var l=this;null==this.i?f.i(k):this.i.push(k);this.o=!0};
b.resolve=d;b.reject=function(g){return new b(function(h,k){k(g)})};
b.race=function(g){return new b(function(h,k){for(var l=u(g),n=l.next();!n.done;n=l.next())d(n.value).va(h,k)})};
b.all=function(g){var h=u(g),k=h.next();return k.done?d([]):new b(function(l,n){function p(z){return function(B){r[z]=B;q--;0==q&&l(r)}}
var r=[],q=0;do r.push(void 0),q++,d(k.value).va(p(r.length-1),n),k=h.next();while(!k.done)})};
return b});
function Ga(a,b){a instanceof String&&(a+="");var c=0,d=!1,e={next:function(){if(!d&&c<a.length){var f=c++;return{value:b(f,a[f]),done:!1}}d=!0;return{done:!0,value:void 0}}};
e[Symbol.iterator]=function(){return e};
return e}
t("Array.prototype.entries",function(a){return a?a:function(){return Ga(this,function(b,c){return[b,c]})}});
t("Set",function(a){function b(c){this.h=new Map;if(c){c=u(c);for(var d;!(d=c.next()).done;)this.add(d.value)}this.size=this.h.size}
if(function(){if(!a||"function"!=typeof a||!a.prototype.entries||"function"!=typeof Object.seal)return!1;try{var c=Object.seal({x:4}),d=new a(u([c]));if(!d.has(c)||1!=d.size||d.add(c)!=d||1!=d.size||d.add({x:4})!=d||2!=d.size)return!1;var e=d.entries(),f=e.next();if(f.done||f.value[0]!=c||f.value[1]!=c)return!1;f=e.next();return f.done||f.value[0]==c||4!=f.value[0].x||f.value[1]!=f.value[0]?!1:e.next().done}catch(g){return!1}}())return a;
b.prototype.add=function(c){c=0===c?0:c;this.h.set(c,c);this.size=this.h.size;return this};
b.prototype.delete=function(c){c=this.h.delete(c);this.size=this.h.size;return c};
b.prototype.clear=function(){this.h.clear();this.size=0};
b.prototype.has=function(c){return this.h.has(c)};
b.prototype.entries=function(){return this.h.entries()};
b.prototype.values=function(){return this.h.values()};
b.prototype.keys=b.prototype.values;b.prototype[Symbol.iterator]=b.prototype.values;b.prototype.forEach=function(c,d){var e=this;this.h.forEach(function(f){return c.call(d,f,f,e)})};
return b});
t("Object.entries",function(a){return a?a:function(b){var c=[],d;for(d in b)Ca(b,d)&&c.push([d,b[d]]);return c}});
t("Array.prototype.keys",function(a){return a?a:function(){return Ga(this,function(b){return b})}});
t("Array.prototype.values",function(a){return a?a:function(){return Ga(this,function(b,c){return c})}});
t("Object.is",function(a){return a?a:function(b,c){return b===c?0!==b||1/b===1/c:b!==b&&c!==c}});
t("Array.prototype.includes",function(a){return a?a:function(b,c){var d=this;d instanceof String&&(d=String(d));var e=d.length;c=c||0;for(0>c&&(c=Math.max(c+e,0));c<e;c++){var f=d[c];if(f===b||Object.is(f,b))return!0}return!1}});
t("String.prototype.includes",function(a){return a?a:function(b,c){return-1!==Ea(this,b,"includes").indexOf(b,c||0)}});
t("Array.from",function(a){return a?a:function(b,c,d){c=null!=c?c:function(h){return h};
var e=[],f="undefined"!=typeof Symbol&&Symbol.iterator&&b[Symbol.iterator];if("function"==typeof f){b=f.call(b);for(var g=0;!(f=b.next()).done;)e.push(c.call(d,f.value,g++))}else for(f=b.length,g=0;g<f;g++)e.push(c.call(d,b[g],g));return e}});
t("Number.isNaN",function(a){return a?a:function(b){return"number"===typeof b&&isNaN(b)}});
t("Number.MAX_SAFE_INTEGER",function(){return 9007199254740991});
t("Object.values",function(a){return a?a:function(b){var c=[],d;for(d in b)Ca(b,d)&&c.push(b[d]);return c}});
var y=this||self;function A(a,b,c){a=a.split(".");c=c||y;a[0]in c||"undefined"==typeof c.execScript||c.execScript("var "+a[0]);for(var d;a.length&&(d=a.shift());)a.length||void 0===b?c[d]&&c[d]!==Object.prototype[d]?c=c[d]:c=c[d]={}:c[d]=b}
function C(a,b){a=a.split(".");b=b||y;for(var c=0;c<a.length;c++)if(b=b[a[c]],null==b)return null;return b}
function Ha(){}
function Ia(a){a.Na=void 0;a.getInstance=function(){return a.Na?a.Na:a.Na=new a}}
function Ja(a){var b=typeof a;return"object"!=b?b:a?Array.isArray(a)?"array":b:"null"}
function Ka(a){var b=Ja(a);return"array"==b||"object"==b&&"number"==typeof a.length}
function La(a){var b=typeof a;return"object"==b&&null!=a||"function"==b}
function Ma(a){return Object.prototype.hasOwnProperty.call(a,Na)&&a[Na]||(a[Na]=++Pa)}
var Na="closure_uid_"+(1E9*Math.random()>>>0),Pa=0;function Qa(a,b,c){return a.call.apply(a.bind,arguments)}
function Ra(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var e=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(e,d);return a.apply(b,e)}}return function(){return a.apply(b,arguments)}}
function Sa(a,b,c){Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?Sa=Qa:Sa=Ra;return Sa.apply(null,arguments)}
function Ta(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var d=c.slice();d.push.apply(d,arguments);return a.apply(this,d)}}
function Ua(a,b){A(a,b,void 0)}
function D(a,b){function c(){}
c.prototype=b.prototype;a.R=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.Jm=function(d,e,f){for(var g=Array(arguments.length-2),h=2;h<arguments.length;h++)g[h-2]=arguments[h];return b.prototype[e].apply(d,g)}}
function Va(a){return a}
;function Wa(a,b){if(Error.captureStackTrace)Error.captureStackTrace(this,Wa);else{var c=Error().stack;c&&(this.stack=c)}a&&(this.message=String(a));void 0!==b&&(this.tb=b)}
D(Wa,Error);Wa.prototype.name="CustomError";function Xa(a){a=a.url;var b=/[?&]dsh=1(&|$)/.test(a);this.j=!b&&/[?&]ae=1(&|$)/.test(a);this.l=!b&&/[?&]ae=2(&|$)/.test(a);if((this.h=/[?&]adurl=([^&]*)/.exec(a))&&this.h[1]){try{var c=decodeURIComponent(this.h[1])}catch(d){c=null}this.i=c}}
;function Ya(a){var b=!1,c;return function(){b||(c=a(),b=!0);return c}}
;var Za=Array.prototype.indexOf?function(a,b){return Array.prototype.indexOf.call(a,b,void 0)}:function(a,b){if("string"===typeof a)return"string"!==typeof b||1!=b.length?-1:a.indexOf(b,0);
for(var c=0;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},E=Array.prototype.forEach?function(a,b,c){Array.prototype.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e="string"===typeof a?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},$a=Array.prototype.filter?function(a,b){return Array.prototype.filter.call(a,b,void 0)}:function(a,b){for(var c=a.length,d=[],e=0,f="string"===typeof a?a.split(""):a,g=0;g<c;g++)if(g in f){var h=f[g];
b.call(void 0,h,g,a)&&(d[e++]=h)}return d},ab=Array.prototype.map?function(a,b){return Array.prototype.map.call(a,b,void 0)}:function(a,b){for(var c=a.length,d=Array(c),e="string"===typeof a?a.split(""):a,f=0;f<c;f++)f in e&&(d[f]=b.call(void 0,e[f],f,a));
return d},bb=Array.prototype.reduce?function(a,b,c){return Array.prototype.reduce.call(a,b,c)}:function(a,b,c){var d=c;
E(a,function(e,f){d=b.call(void 0,d,e,f,a)});
return d};
function cb(a,b){a:{for(var c=a.length,d="string"===typeof a?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a)){b=e;break a}b=-1}return 0>b?null:"string"===typeof a?a.charAt(b):a[b]}
function db(a,b){b=Za(a,b);var c;(c=0<=b)&&Array.prototype.splice.call(a,b,1);return c}
function eb(a){var b=a.length;if(0<b){for(var c=Array(b),d=0;d<b;d++)c[d]=a[d];return c}return[]}
function fb(a,b){for(var c=1;c<arguments.length;c++){var d=arguments[c];if(Ka(d)){var e=a.length||0,f=d.length||0;a.length=e+f;for(var g=0;g<f;g++)a[e+g]=d[g]}else a.push(d)}}
;function gb(a,b){for(var c in a)b.call(void 0,a[c],c,a)}
function hb(a){var b=ib,c;for(c in b)if(a.call(void 0,b[c],c,b))return c}
function jb(a){for(var b in a)return!1;return!0}
function kb(a,b){if(null!==a&&b in a)throw Error('The object already contains the key "'+b+'"');a[b]=!0}
function lb(){var a=F("PLAYER_VARS",{});return null!==a&&"privembed"in a?a.privembed:!1}
function mb(a,b){for(var c in a)if(!(c in b)||a[c]!==b[c])return!1;for(var d in b)if(!(d in a))return!1;return!0}
function nb(a){var b={},c;for(c in a)b[c]=a[c];return b}
function ob(a){if(!a||"object"!==typeof a)return a;if("function"===typeof a.clone)return a.clone();if("undefined"!==typeof Map&&a instanceof Map)return new Map(a);if("undefined"!==typeof Set&&a instanceof Set)return new Set(a);var b=Array.isArray(a)?[]:"function"!==typeof ArrayBuffer||"function"!==typeof ArrayBuffer.isView||!ArrayBuffer.isView(a)||a instanceof DataView?{}:new a.constructor(a.length),c;for(c in a)b[c]=ob(a[c]);return b}
var pb="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function qb(a,b){for(var c,d,e=1;e<arguments.length;e++){d=arguments[e];for(c in d)a[c]=d[c];for(var f=0;f<pb.length;f++)c=pb[f],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c])}}
;var rb;function sb(){if(void 0===rb){var a=null,b=y.trustedTypes;if(b&&b.createPolicy){try{a=b.createPolicy("goog#html",{createHTML:Va,createScript:Va,createScriptURL:Va})}catch(c){y.console&&y.console.error(c.message)}rb=a}else rb=a}return rb}
;function tb(a,b){this.h=a===ub&&b||""}
tb.prototype.ba=!0;tb.prototype.aa=function(){return this.h};
function vb(a){return new tb(ub,a)}
var ub={};vb("");var wb={};function xb(a){this.h=wb===wb?a:"";this.ba=!0}
xb.prototype.aa=function(){return this.h.toString()};
xb.prototype.toString=function(){return this.h.toString()};function yb(a,b){this.h=b===zb?a:""}
m=yb.prototype;m.ba=!0;m.aa=function(){return this.h.toString()};
m.Ma=!0;m.Ia=function(){return 1};
m.toString=function(){return this.h+""};
function Ab(a){if(a instanceof yb&&a.constructor===yb)return a.h;Ja(a);return"type_error:TrustedResourceUrl"}
var zb={};function Bb(a){var b=sb();a=b?b.createScriptURL(a):a;return new yb(a,zb)}
;var Cb=String.prototype.trim?function(a){return a.trim()}:function(a){return/^[\s\xa0]*([\s\S]*?)[\s\xa0]*$/.exec(a)[1]},Db=/&/g,Eb=/</g,Fb=/>/g,Gb=/"/g,Hb=/'/g,Ib=/\x00/g,Jb=/[\x00&<>"']/;function Kb(a,b){this.h=b===Lb?a:""}
m=Kb.prototype;m.ba=!0;m.aa=function(){return this.h.toString()};
m.Ma=!0;m.Ia=function(){return 1};
m.toString=function(){return this.h.toString()};
function Mb(a){if(a instanceof Kb&&a.constructor===Kb)return a.h;Ja(a);return"type_error:SafeUrl"}
var Ob=RegExp('^(?:audio/(?:3gpp2|3gpp|aac|L16|midi|mp3|mp4|mpeg|oga|ogg|opus|x-m4a|x-matroska|x-wav|wav|webm)|font/\\w+|image/(?:bmp|gif|jpeg|jpg|png|tiff|webp|x-icon)|video/(?:mpeg|mp4|ogg|webm|quicktime|x-matroska))(?:;\\w+=(?:\\w+|"[\\w;,= ]+"))*$',"i"),Pb=/^data:(.*);base64,[a-z0-9+\/]+=*$/i,Qb=/^(?:(?:https?|mailto|ftp):|[^:/?#]*(?:[/?#]|$))/i,Lb={},Rb=new Kb("about:invalid#zClosurez",Lb);var Sb;a:{var Tb=y.navigator;if(Tb){var Ub=Tb.userAgent;if(Ub){Sb=Ub;break a}}Sb=""}function H(a){return-1!=Sb.indexOf(a)}
;function Vb(){return(H("Chrome")||H("CriOS"))&&!H("Edge")}
;var Wb={};function Xb(a,b,c){this.h=c===Wb?a:"";this.i=b;this.ba=this.Ma=!0}
Xb.prototype.Ia=function(){return this.i};
Xb.prototype.aa=function(){return this.h.toString()};
Xb.prototype.toString=function(){return this.h.toString()};
function Yb(a,b){var c=sb();a=c?c.createHTML(a):a;return new Xb(a,b,Wb)}
;function Zb(a,b){b instanceof Kb||b instanceof Kb||(b="object"==typeof b&&b.ba?b.aa():String(b),Qb.test(b)||(b="about:invalid#zClosurez"),b=new Kb(b,Lb));a.href=Mb(b)}
function $b(a,b){a.rel="stylesheet";a.href=Ab(b).toString();(b=ac('style[nonce],link[rel="stylesheet"][nonce]',a.ownerDocument&&a.ownerDocument.defaultView))&&a.setAttribute("nonce",b)}
function bc(){return ac("script[nonce]",void 0)}
var cc=/^[\w+/_-]+[=]{0,2}$/;function ac(a,b){b=(b||y).document;return b.querySelector?(a=b.querySelector(a))&&(a=a.nonce||a.getAttribute("nonce"))&&cc.test(a)?a:"":""}
;function dc(a){for(var b=0,c=0;c<a.length;++c)b=31*b+a.charCodeAt(c)>>>0;return b}
;var ec=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function fc(a){return a?decodeURI(a):a}
function gc(a){return fc(a.match(ec)[3]||null)}
function hc(a,b,c){if(Array.isArray(b))for(var d=0;d<b.length;d++)hc(a,String(b[d]),c);else null!=b&&c.push(a+(""===b?"":"="+encodeURIComponent(String(b))))}
function ic(a){var b=[],c;for(c in a)hc(c,a[c],b);return b.join("&")}
function jc(a,b){b=ic(b);if(b){var c=a.indexOf("#");0>c&&(c=a.length);var d=a.indexOf("?");if(0>d||d>c){d=c;var e=""}else e=a.substring(d+1,c);a=[a.substr(0,d),e,a.substr(c)];c=a[1];a[1]=b?c?c+"&"+b:b:c;b=a[0]+(a[1]?"?"+a[1]:"")+a[2]}else b=a;return b}
var kc=/#|$/;function I(a,b){var c=void 0;return new (c||(c=Promise))(function(d,e){function f(k){try{h(b.next(k))}catch(l){e(l)}}
function g(k){try{h(b["throw"](k))}catch(l){e(l)}}
function h(k){k.done?d(k.value):(new c(function(l){l(k.value)})).then(f,g)}
h((b=b.apply(a,void 0)).next())})}
;function lc(a){y.setTimeout(function(){throw a;},0)}
;function mc(){return H("iPhone")&&!H("iPod")&&!H("iPad")}
;function nc(a){nc[" "](a);return a}
nc[" "]=Ha;var oc=H("Opera"),pc=H("Trident")||H("MSIE"),qc=H("Edge"),rc=H("Gecko")&&!(-1!=Sb.toLowerCase().indexOf("webkit")&&!H("Edge"))&&!(H("Trident")||H("MSIE"))&&!H("Edge"),sc=-1!=Sb.toLowerCase().indexOf("webkit")&&!H("Edge"),tc=H("Android");function uc(){var a=y.document;return a?a.documentMode:void 0}
var vc;a:{var wc="",xc=function(){var a=Sb;if(rc)return/rv:([^\);]+)(\)|;)/.exec(a);if(qc)return/Edge\/([\d\.]+)/.exec(a);if(pc)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(sc)return/WebKit\/(\S+)/.exec(a);if(oc)return/(?:Version)[ \/]?(\S+)/.exec(a)}();
xc&&(wc=xc?xc[1]:"");if(pc){var yc=uc();if(null!=yc&&yc>parseFloat(wc)){vc=String(yc);break a}}vc=wc}var zc=vc,Ac;if(y.document&&pc){var Bc=uc();Ac=Bc?Bc:parseInt(zc,10)||void 0}else Ac=void 0;var Cc=Ac;var Dc=mc()||H("iPod"),Ec=H("iPad");!H("Android")||Vb();Vb();var Fc=H("Safari")&&!(Vb()||H("Coast")||H("Opera")||H("Edge")||H("Edg/")||H("OPR")||H("Firefox")||H("FxiOS")||H("Silk")||H("Android"))&&!(mc()||H("iPad")||H("iPod"));var Gc={},Hc=null;
function Ic(a,b){Ka(a);void 0===b&&(b=0);if(!Hc){Hc={};for(var c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""),d=["+/=","+/","-_=","-_.","-_"],e=0;5>e;e++){var f=c.concat(d[e].split(""));Gc[e]=f;for(var g=0;g<f.length;g++){var h=f[g];void 0===Hc[h]&&(Hc[h]=g)}}}b=Gc[b];c=Array(Math.floor(a.length/3));d=b[64]||"";for(e=f=0;f<a.length-2;f+=3){var k=a[f],l=a[f+1];h=a[f+2];g=b[k>>2];k=b[(k&3)<<4|l>>4];l=b[(l&15)<<2|h>>6];h=b[h&63];c[e++]=""+g+k+l+h}g=0;h=d;switch(a.length-
f){case 2:g=a[f+1],h=b[(g&15)<<2]||d;case 1:a=a[f],c[e]=""+b[a>>2]+b[(a&3)<<4|g>>4]+h+d}return c.join("")}
;var Jc="function"===typeof Uint8Array;function Kc(a){return null!==a&&"object"==typeof a&&!Array.isArray(a)&&!Lc(a)}
function Mc(a,b){if(null!=a)return Array.isArray(a)||Kc(a)?Nc(a,b):b(a)}
function Nc(a,b){if(Array.isArray(a)){for(var c=Array(a.length),d=0;d<a.length;d++)c[d]=Mc(a[d],b);Array.isArray(a)&&a.Hb&&Oc(c);return c}c={};for(d in a)c[d]=Mc(a[d],b);return c}
function Pc(a){switch(typeof a){case "number":return isFinite(a)?a:String(a);case "object":return Lc(a)?Ic(a):a;default:return a}}
function Qc(a){return Lc(a)?new Uint8Array(a):a}
var Rc={Hb:{value:!0,configurable:!0}};function Oc(a){Array.isArray(a)&&!Object.isFrozen(a)&&Object.defineProperties(a,Rc);return a}
function Lc(a){return Jc&&null!=a&&a instanceof Uint8Array}
;function Sc(a,b){this.h=a;this.i=b;this.map={};this.j=!0;if(0<this.h.length){for(a=0;a<this.h.length;a++){b=this.h[a];var c=b[0];this.map[c.toString()]=new Tc(c,b[1])}this.j=!0}}
m=Sc.prototype;m.isFrozen=function(){return!1};
m.toJSON=function(){var a=this.S(!1);return Nc(a,Pc)};
m.S=function(a){if(this.j){if(this.i){var b=this.map,c;for(c in b)if(Object.prototype.hasOwnProperty.call(b,c)){var d=b[c].h;d&&d.S(a)}}}else{this.h.length=0;b=Uc(this);b.sort();for(c=0;c<b.length;c++){d=this.map[b[c]];var e=d.h;e&&e.S(a);this.h.push([d.key,d.value])}this.j=!0}return this.h};
m.clear=function(){this.map={};this.j=!1};
m.entries=function(){var a=[],b=Uc(this);b.sort();for(var c=0;c<b.length;c++){var d=this.map[b[c]];a.push([d.key,Vc(this,d)])}return new Wc(a)};
m.keys=function(){var a=[],b=Uc(this);b.sort();for(var c=0;c<b.length;c++)a.push(this.map[b[c]].key);return new Wc(a)};
m.values=function(){var a=[],b=Uc(this);b.sort();for(var c=0;c<b.length;c++)a.push(Vc(this,this.map[b[c]]));return new Wc(a)};
m.forEach=function(a,b){var c=Uc(this);c.sort();for(var d=0;d<c.length;d++){var e=this.map[c[d]];a.call(b,Vc(this,e),e.key,this)}};
m.set=function(a,b){var c=new Tc(a);this.i?(c.h=b,c.value=b.S(!1)):c.value=b;this.map[a.toString()]=c;this.j=!1;return this};
function Vc(a,b){return a.i?(b.h||(b.h=new a.i(b.value),a.isFrozen()&&null(b.h)),b.h):b.value}
m.get=function(a){if(a=this.map[a.toString()])return Vc(this,a)};
m.has=function(a){return a.toString()in this.map};
function Uc(a){a=a.map;var b=[],c;for(c in a)Object.prototype.hasOwnProperty.call(a,c)&&b.push(c);return b}
Sc.prototype[Symbol.iterator]=function(){return this.entries()};
function Tc(a,b){this.key=a;this.value=b;this.h=void 0}
function Wc(a){this.i=0;this.h=a}
Wc.prototype.next=function(){return this.i<this.h.length?{done:!1,value:this.h[this.i++]}:{done:!0,value:void 0}};
Wc.prototype[Symbol.iterator]=function(){return this};var Xc;function Yc(a,b,c){var d=Xc;Xc=null;a||(a=d);d=this.constructor.Nm;a||(a=d?[d]:[]);this.l=d?0:-1;this.h=null;this.i=a;a:{d=this.i.length;a=d-1;if(d&&(d=this.i[a],Kc(d))){this.A=a-this.l;this.j=d;break a}void 0!==b&&-1<b?(this.A=Math.max(b,a+1-this.l),this.j=null):this.A=Number.MAX_VALUE}if(c)for(b=0;b<c.length;b++)a=c[b],a<this.A?(a+=this.l,(d=this.i[a])?Oc(d):this.i[a]=Zc):($c(this),(d=this.j[a])?Oc(d):this.j[a]=Zc)}
var Zc=Object.freeze(Oc([]));function $c(a){var b=a.A+a.l;a.i[b]||(a.j=a.i[b]={})}
function ad(a,b,c){return-1===b?null:(void 0===c?0:c)||b>=a.A?a.j?a.j[b]:void 0:a.i[b+a.l]}
function bd(a,b,c){a.h||(a.h={});if(b in a.h)return a.h[b];var d=ad(a,b);d||(d=Oc([]),cd(a,b,d));c=new Sc(d,c);return a.h[b]=c}
function cd(a,b,c,d){(void 0===d?0:d)||b>=a.A?($c(a),a.j[b]=c):a.i[b+a.l]=c}
function dd(a,b,c,d){if(-1===c)return null;a.h||(a.h={});a.h[c]||(d=ad(a,c,void 0===d?!1:d))&&(a.h[c]=new b(d));return a.h[c]}
function ed(a,b,c){a.h||(a.h={});var d=a.h[c];if(!d){var e=void 0===e?!1:e;d=ad(a,c,e);null==d&&(d=Zc);d===Zc&&(d=Oc([]),cd(a,c,d,e));e=d;d=[];for(var f=0;f<e.length;f++)d[f]=new b(e[f]);a.h[c]=d}return d}
Yc.prototype.toJSON=function(){var a=this.S(!1);return Nc(a,Pc)};
Yc.prototype.S=function(a){if(this.h)for(var b in this.h){var c=this.h[b];if(Array.isArray(c))for(var d=0;d<c.length;d++)c[d]&&c[d].S(a);else c&&c.S(a)}return this.i};
Yc.prototype.toString=function(){return this.S(!1).toString()};
Yc.prototype.clone=function(){var a=this.constructor,b=Nc(this.S(!1),Qc);Xc=b;a=new a(b);Xc=null;fd(a,this);return a};
function fd(a,b){b.m&&(a.m=b.m.slice());var c=b.h;if(c){b=b.j;var d={},e;for(e in c){var f=c[e];if(f){var g=!(!b||!b[e]),h=+e;if(Array.isArray(f)){if(f.length)for(g=ed(a,f[0].constructor,h),h=0;h<Math.min(g.length,f.length);h++)fd(g[h],f[h])}else f instanceof Sc?f.i&&(d.Ea=bd(a,h,f.i),f.forEach(function(k){return function(l,n){return fd(k.Ea.get(n),l)}}(d))):(g=dd(a,f.constructor,h,g))&&fd(g,f)}d={Ea:d.Ea}}}}
;var gd=window;vb("csi.gstatic.com");vb("googleads.g.doubleclick.net");vb("pagead2.googlesyndication.com");vb("partner.googleadservices.com");vb("pubads.g.doubleclick.net");vb("securepubads.g.doubleclick.net");vb("tpc.googlesyndication.com");/*

 SPDX-License-Identifier: Apache-2.0
*/
var hd={};function id(){}
function jd(a){this.h=a}
v(jd,id);jd.prototype.toString=function(){return this.h};
var kd=new jd("about:invalid#zTSz",hd);function ld(a){this.isValid=a}
function md(a){return new ld(function(b){return b.substr(0,a.length+1).toLowerCase()===a+":"})}
var nd=[md("data"),md("http"),md("https"),md("mailto"),md("ftp"),new ld(function(a){return/^[^:]*([/?#]|$)/.test(a)})];function od(a){if(a instanceof id)if(a instanceof jd)a=a.h;else throw Error("");else a=Mb(a);return a}
;function pd(a,b){a.src=Ab(b);var c;b=(a.ownerDocument&&a.ownerDocument.defaultView||window).document;var d=null===(c=b.querySelector)||void 0===c?void 0:c.call(b,"script[nonce]");(c=d?d.nonce||d.getAttribute("nonce")||"":"")&&a.setAttribute("nonce",c)}
;function qd(a,b){this.x=void 0!==a?a:0;this.y=void 0!==b?b:0}
m=qd.prototype;m.clone=function(){return new qd(this.x,this.y)};
m.equals=function(a){return a instanceof qd&&(this==a?!0:this&&a?this.x==a.x&&this.y==a.y:!1)};
m.ceil=function(){this.x=Math.ceil(this.x);this.y=Math.ceil(this.y);return this};
m.floor=function(){this.x=Math.floor(this.x);this.y=Math.floor(this.y);return this};
m.round=function(){this.x=Math.round(this.x);this.y=Math.round(this.y);return this};
m.scale=function(a,b){this.x*=a;this.y*="number"===typeof b?b:a;return this};function rd(a,b){this.width=a;this.height=b}
m=rd.prototype;m.clone=function(){return new rd(this.width,this.height)};
m.aspectRatio=function(){return this.width/this.height};
m.isEmpty=function(){return!(this.width*this.height)};
m.ceil=function(){this.width=Math.ceil(this.width);this.height=Math.ceil(this.height);return this};
m.floor=function(){this.width=Math.floor(this.width);this.height=Math.floor(this.height);return this};
m.round=function(){this.width=Math.round(this.width);this.height=Math.round(this.height);return this};
m.scale=function(a,b){this.width*=a;this.height*="number"===typeof b?b:a;return this};function sd(a){var b=document;return"string"===typeof a?b.getElementById(a):a}
function td(a,b){gb(b,function(c,d){c&&"object"==typeof c&&c.ba&&(c=c.aa());"style"==d?a.style.cssText=c:"class"==d?a.className=c:"for"==d?a.htmlFor=c:ud.hasOwnProperty(d)?a.setAttribute(ud[d],c):0==d.lastIndexOf("aria-",0)||0==d.lastIndexOf("data-",0)?a.setAttribute(d,c):a[d]=c})}
var ud={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",frameborder:"frameBorder",height:"height",maxlength:"maxLength",nonce:"nonce",role:"role",rowspan:"rowSpan",type:"type",usemap:"useMap",valign:"vAlign",width:"width"};function vd(a,b,c){var d=arguments,e=document,f=d[1],g=wd(e,String(d[0]));f&&("string"===typeof f?g.className=f:Array.isArray(f)?g.className=f.join(" "):td(g,f));2<d.length&&xd(e,g,d);return g}
function xd(a,b,c){function d(h){h&&b.appendChild("string"===typeof h?a.createTextNode(h):h)}
for(var e=2;e<c.length;e++){var f=c[e];if(!Ka(f)||La(f)&&0<f.nodeType)d(f);else{a:{if(f&&"number"==typeof f.length){if(La(f)){var g="function"==typeof f.item||"string"==typeof f.item;break a}if("function"===typeof f){g="function"==typeof f.item;break a}}g=!1}E(g?eb(f):f,d)}}}
function wd(a,b){b=String(b);"application/xhtml+xml"===a.contentType&&(b=b.toLowerCase());return a.createElement(b)}
function yd(a,b){for(var c=0;a;){if(b(a))return a;a=a.parentNode;c++}return null}
;function zd(a){var b=Ad;if(b)for(var c in b)Object.prototype.hasOwnProperty.call(b,c)&&a.call(void 0,b[c],c,b)}
function Bd(){var a=[];zd(function(b){a.push(b)});
return a}
var Ad={nc:"allow-forms",oc:"allow-modals",pc:"allow-orientation-lock",qc:"allow-pointer-lock",sc:"allow-popups",tc:"allow-popups-to-escape-sandbox",uc:"allow-presentation",wc:"allow-same-origin",xc:"allow-scripts",yc:"allow-top-navigation",zc:"allow-top-navigation-by-user-activation"},Cd=Ya(function(){return Bd()});
function Dd(){var a=Ed(),b={};E(Cd(),function(c){a.sandbox&&a.sandbox.supports&&a.sandbox.supports(c)&&(b[c]=!0)});
return b}
function Ed(){var a=void 0===a?document:a;var b="IFRAME";"application/xhtml+xml"===(null==a?void 0:a.contentType)&&(b=b.toLowerCase());return a.createElement(b)}
;function Fd(a){"number"==typeof a&&(a=Math.round(a)+"px");return a}
;var Gd=(new Date).getTime();function Hd(a){if(!a)return"";a=a.split("#")[0].split("?")[0];a=a.toLowerCase();0==a.indexOf("//")&&(a=window.location.protocol+a);/^[\w\-]*:\/\//.test(a)||(a=window.location.href);var b=a.substring(a.indexOf("://")+3),c=b.indexOf("/");-1!=c&&(b=b.substring(0,c));c=a.substring(0,a.indexOf("://"));if(!c)throw Error("URI is missing protocol: "+a);if("http"!==c&&"https"!==c&&"chrome-extension"!==c&&"moz-extension"!==c&&"file"!==c&&"android-app"!==c&&"chrome-search"!==c&&"chrome-untrusted"!==c&&"chrome"!==
c&&"app"!==c&&"devtools"!==c)throw Error("Invalid URI scheme in origin: "+c);a="";var d=b.indexOf(":");if(-1!=d){var e=b.substring(d+1);b=b.substring(0,d);if("http"===c&&"80"!==e||"https"===c&&"443"!==e)a=":"+e}return c+"://"+b+a}
;function Id(){function a(){e[0]=1732584193;e[1]=4023233417;e[2]=2562383102;e[3]=271733878;e[4]=3285377520;n=l=0}
function b(p){for(var r=g,q=0;64>q;q+=4)r[q/4]=p[q]<<24|p[q+1]<<16|p[q+2]<<8|p[q+3];for(q=16;80>q;q++)p=r[q-3]^r[q-8]^r[q-14]^r[q-16],r[q]=(p<<1|p>>>31)&4294967295;p=e[0];var z=e[1],B=e[2],G=e[3],R=e[4];for(q=0;80>q;q++){if(40>q)if(20>q){var P=G^z&(B^G);var K=1518500249}else P=z^B^G,K=1859775393;else 60>q?(P=z&B|G&(z|B),K=2400959708):(P=z^B^G,K=3395469782);P=((p<<5|p>>>27)&4294967295)+P+R+K+r[q]&4294967295;R=G;G=B;B=(z<<30|z>>>2)&4294967295;z=p;p=P}e[0]=e[0]+p&4294967295;e[1]=e[1]+z&4294967295;e[2]=
e[2]+B&4294967295;e[3]=e[3]+G&4294967295;e[4]=e[4]+R&4294967295}
function c(p,r){if("string"===typeof p){p=unescape(encodeURIComponent(p));for(var q=[],z=0,B=p.length;z<B;++z)q.push(p.charCodeAt(z));p=q}r||(r=p.length);q=0;if(0==l)for(;q+64<r;)b(p.slice(q,q+64)),q+=64,n+=64;for(;q<r;)if(f[l++]=p[q++],n++,64==l)for(l=0,b(f);q+64<r;)b(p.slice(q,q+64)),q+=64,n+=64}
function d(){var p=[],r=8*n;56>l?c(h,56-l):c(h,64-(l-56));for(var q=63;56<=q;q--)f[q]=r&255,r>>>=8;b(f);for(q=r=0;5>q;q++)for(var z=24;0<=z;z-=8)p[r++]=e[q]>>z&255;return p}
for(var e=[],f=[],g=[],h=[128],k=1;64>k;++k)h[k]=0;var l,n;a();return{reset:a,update:c,digest:d,vb:function(){for(var p=d(),r="",q=0;q<p.length;q++)r+="0123456789ABCDEF".charAt(Math.floor(p[q]/16))+"0123456789ABCDEF".charAt(p[q]%16);return r}}}
;function Jd(a,b,c){var d=String(y.location.href);return d&&a&&b?[b,Kd(Hd(d),a,c||null)].join(" "):null}
function Kd(a,b,c){var d=[],e=[];if(1==(Array.isArray(c)?2:1))return e=[b,a],E(d,function(h){e.push(h)}),Ld(e.join(" "));
var f=[],g=[];E(c,function(h){g.push(h.key);f.push(h.value)});
c=Math.floor((new Date).getTime()/1E3);e=0==f.length?[c,b,a]:[f.join(":"),c,b,a];E(d,function(h){e.push(h)});
a=Ld(e.join(" "));a=[c,a];0==g.length||a.push(g.join(""));return a.join("_")}
function Ld(a){var b=Id();b.update(a);return b.vb().toLowerCase()}
;var Md={};function Nd(a){this.h=a||{cookie:""}}
m=Nd.prototype;m.isEnabled=function(){if(!y.navigator.cookieEnabled)return!1;if(!this.isEmpty())return!0;this.set("TESTCOOKIESENABLED","1",{Pa:60});if("1"!==this.get("TESTCOOKIESENABLED"))return!1;this.remove("TESTCOOKIESENABLED");return!0};
m.set=function(a,b,c){var d=!1;if("object"===typeof c){var e=c.Sm;d=c.secure||!1;var f=c.domain||void 0;var g=c.path||void 0;var h=c.Pa}if(/[;=\s]/.test(a))throw Error('Invalid cookie name "'+a+'"');if(/[;\r\n]/.test(b))throw Error('Invalid cookie value "'+b+'"');void 0===h&&(h=-1);c=f?";domain="+f:"";g=g?";path="+g:"";d=d?";secure":"";h=0>h?"":0==h?";expires="+(new Date(1970,1,1)).toUTCString():";expires="+(new Date(Date.now()+1E3*h)).toUTCString();this.h.cookie=a+"="+b+c+g+h+d+(null!=e?";samesite="+
e:"")};
m.get=function(a,b){for(var c=a+"=",d=(this.h.cookie||"").split(";"),e=0,f;e<d.length;e++){f=Cb(d[e]);if(0==f.lastIndexOf(c,0))return f.substr(c.length);if(f==a)return""}return b};
m.remove=function(a,b,c){var d=void 0!==this.get(a);this.set(a,"",{Pa:0,path:b,domain:c});return d};
m.isEmpty=function(){return!this.h.cookie};
m.clear=function(){for(var a=(this.h.cookie||"").split(";"),b=[],c=[],d,e,f=0;f<a.length;f++)e=Cb(a[f]),d=e.indexOf("="),-1==d?(b.push(""),c.push(e)):(b.push(e.substring(0,d)),c.push(e.substring(d+1)));for(a=b.length-1;0<=a;a--)this.remove(b[a])};
var Od=new Nd("undefined"==typeof document?null:document);function Pd(a){return!!Md.FPA_SAMESITE_PHASE2_MOD||!(void 0===a||!a)}
function Qd(a){a=void 0===a?!1:a;var b=y.__SAPISID||y.__APISID||y.__3PSAPISID||y.__OVERRIDE_SID;Pd(a)&&(b=b||y.__1PSAPISID);if(b)return!0;var c=new Nd(document);b=c.get("SAPISID")||c.get("APISID")||c.get("__Secure-3PAPISID")||c.get("SID");Pd(a)&&(b=b||c.get("__Secure-1PAPISID"));return!!b}
function Rd(a,b,c,d){(a=y[a])||(a=(new Nd(document)).get(b));return a?Jd(a,c,d):null}
function Sd(a){var b=void 0===b?!1:b;var c=Hd(String(y.location.href)),d=[];if(Qd(b)){c=0==c.indexOf("https:")||0==c.indexOf("chrome-extension:")||0==c.indexOf("moz-extension:");var e=c?y.__SAPISID:y.__APISID;e||(e=new Nd(document),e=e.get(c?"SAPISID":"APISID")||e.get("__Secure-3PAPISID"));(e=e?Jd(e,c?"SAPISIDHASH":"APISIDHASH",a):null)&&d.push(e);c&&Pd(b)&&((b=Rd("__1PSAPISID","__Secure-1PAPISID","SAPISID1PHASH",a))&&d.push(b),(a=Rd("__3PSAPISID","__Secure-3PAPISID","SAPISID3PHASH",a))&&d.push(a))}return 0==
d.length?null:d.join(" ")}
;function Td(a){a&&"function"==typeof a.dispose&&a.dispose()}
;function Ud(a){for(var b=0,c=arguments.length;b<c;++b){var d=arguments[b];Ka(d)?Ud.apply(null,d):Td(d)}}
;function J(){this.h=this.h;this.A=this.A}
J.prototype.h=!1;J.prototype.dispose=function(){this.h||(this.h=!0,this.D())};
function Vd(a,b){a.h?b():(a.A||(a.A=[]),a.A.push(b))}
J.prototype.D=function(){if(this.A)for(;this.A.length;)this.A.shift()()};function Wd(a,b){this.type=a;this.h=this.target=b;this.defaultPrevented=this.j=!1}
Wd.prototype.stopPropagation=function(){this.j=!0};
Wd.prototype.preventDefault=function(){this.defaultPrevented=!0};function Xd(a){var b=C("window.location.href");null==a&&(a='Unknown Error of type "null/undefined"');if("string"===typeof a)return{message:a,name:"Unknown error",lineNumber:"Not available",fileName:b,stack:"Not available"};var c=!1;try{var d=a.lineNumber||a.line||"Not available"}catch(g){d="Not available",c=!0}try{var e=a.fileName||a.filename||a.sourceURL||y.$googDebugFname||b}catch(g){e="Not available",c=!0}b=Yd(a);if(!(!c&&a.lineNumber&&a.fileName&&a.stack&&a.message&&a.name)){c=a.message;if(null==
c){if(a.constructor&&a.constructor instanceof Function){if(a.constructor.name)c=a.constructor.name;else if(c=a.constructor,Zd[c])c=Zd[c];else{c=String(c);if(!Zd[c]){var f=/function\s+([^\(]+)/m.exec(c);Zd[c]=f?f[1]:"[Anonymous]"}c=Zd[c]}c='Unknown Error of type "'+c+'"'}else c="Unknown Error of unknown type";"function"===typeof a.toString&&Object.prototype.toString!==a.toString&&(c+=": "+a.toString())}return{message:c,name:a.name||"UnknownError",lineNumber:d,fileName:e,stack:b||"Not available"}}a.stack=
b;return{message:a.message,name:a.name,lineNumber:a.lineNumber,fileName:a.fileName,stack:a.stack}}
function Yd(a,b){b||(b={});b[$d(a)]=!0;var c=a.stack||"";(a=a.tb)&&!b[$d(a)]&&(c+="\nCaused by: ",a.stack&&0==a.stack.indexOf(a.toString())||(c+="string"===typeof a?a:a.message+"\n"),c+=Yd(a,b));return c}
function $d(a){var b="";"function"===typeof a.toString&&(b=""+a);return b+a.stack}
var Zd={};var ae=function(){if(!y.addEventListener||!Object.defineProperty)return!1;var a=!1,b=Object.defineProperty({},"passive",{get:function(){a=!0}});
try{y.addEventListener("test",Ha,b),y.removeEventListener("test",Ha,b)}catch(c){}return a}();function be(a,b){Wd.call(this,a?a.type:"");this.relatedTarget=this.h=this.target=null;this.button=this.screenY=this.screenX=this.clientY=this.clientX=0;this.key="";this.charCode=this.keyCode=0;this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1;this.state=null;this.pointerId=0;this.pointerType="";this.i=null;a&&this.init(a,b)}
D(be,Wd);var ce={2:"touch",3:"pen",4:"mouse"};
be.prototype.init=function(a,b){var c=this.type=a.type,d=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement;this.h=b;if(b=a.relatedTarget){if(rc){a:{try{nc(b.nodeName);var e=!0;break a}catch(f){}e=!1}e||(b=null)}}else"mouseover"==c?b=a.fromElement:"mouseout"==c&&(b=a.toElement);this.relatedTarget=b;d?(this.clientX=void 0!==d.clientX?d.clientX:d.pageX,this.clientY=void 0!==d.clientY?d.clientY:d.pageY,this.screenX=d.screenX||0,this.screenY=d.screenY||
0):(this.clientX=void 0!==a.clientX?a.clientX:a.pageX,this.clientY=void 0!==a.clientY?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0);this.button=a.button;this.keyCode=a.keyCode||0;this.key=a.key||"";this.charCode=a.charCode||("keypress"==c?a.keyCode:0);this.ctrlKey=a.ctrlKey;this.altKey=a.altKey;this.shiftKey=a.shiftKey;this.metaKey=a.metaKey;this.pointerId=a.pointerId||0;this.pointerType="string"===typeof a.pointerType?a.pointerType:ce[a.pointerType]||"";this.state=a.state;
this.i=a;a.defaultPrevented&&be.R.preventDefault.call(this)};
be.prototype.stopPropagation=function(){be.R.stopPropagation.call(this);this.i.stopPropagation?this.i.stopPropagation():this.i.cancelBubble=!0};
be.prototype.preventDefault=function(){be.R.preventDefault.call(this);var a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var de="closure_listenable_"+(1E6*Math.random()|0);var ee=0;function fe(a,b,c,d,e){this.listener=a;this.proxy=null;this.src=b;this.type=c;this.capture=!!d;this.za=e;this.key=++ee;this.oa=this.ta=!1}
function ge(a){a.oa=!0;a.listener=null;a.proxy=null;a.src=null;a.za=null}
;function he(a){this.src=a;this.listeners={};this.h=0}
he.prototype.add=function(a,b,c,d,e){var f=a.toString();a=this.listeners[f];a||(a=this.listeners[f]=[],this.h++);var g=ie(a,b,d,e);-1<g?(b=a[g],c||(b.ta=!1)):(b=new fe(b,this.src,f,!!d,e),b.ta=c,a.push(b));return b};
he.prototype.remove=function(a,b,c,d){a=a.toString();if(!(a in this.listeners))return!1;var e=this.listeners[a];b=ie(e,b,c,d);return-1<b?(ge(e[b]),Array.prototype.splice.call(e,b,1),0==e.length&&(delete this.listeners[a],this.h--),!0):!1};
function je(a,b){var c=b.type;c in a.listeners&&db(a.listeners[c],b)&&(ge(b),0==a.listeners[c].length&&(delete a.listeners[c],a.h--))}
function ie(a,b,c,d){for(var e=0;e<a.length;++e){var f=a[e];if(!f.oa&&f.listener==b&&f.capture==!!c&&f.za==d)return e}return-1}
;var ke="closure_lm_"+(1E6*Math.random()|0),le={},me=0;function ne(a,b,c,d,e){if(d&&d.once)oe(a,b,c,d,e);else if(Array.isArray(b))for(var f=0;f<b.length;f++)ne(a,b[f],c,d,e);else c=pe(c),a&&a[de]?a.T(b,c,La(d)?!!d.capture:!!d,e):qe(a,b,c,!1,d,e)}
function qe(a,b,c,d,e,f){if(!b)throw Error("Invalid event type");var g=La(e)?!!e.capture:!!e,h=re(a);h||(a[ke]=h=new he(a));c=h.add(b,c,d,g,f);if(!c.proxy){d=se();c.proxy=d;d.src=a;d.listener=c;if(a.addEventListener)ae||(e=g),void 0===e&&(e=!1),a.addEventListener(b.toString(),d,e);else if(a.attachEvent)a.attachEvent(te(b.toString()),d);else if(a.addListener&&a.removeListener)a.addListener(d);else throw Error("addEventListener and attachEvent are unavailable.");me++}}
function se(){function a(c){return b.call(a.src,a.listener,c)}
var b=ue;return a}
function oe(a,b,c,d,e){if(Array.isArray(b))for(var f=0;f<b.length;f++)oe(a,b[f],c,d,e);else c=pe(c),a&&a[de]?a.i.add(String(b),c,!0,La(d)?!!d.capture:!!d,e):qe(a,b,c,!0,d,e)}
function ve(a,b,c,d,e){if(Array.isArray(b))for(var f=0;f<b.length;f++)ve(a,b[f],c,d,e);else(d=La(d)?!!d.capture:!!d,c=pe(c),a&&a[de])?a.i.remove(String(b),c,d,e):a&&(a=re(a))&&(b=a.listeners[b.toString()],a=-1,b&&(a=ie(b,c,d,e)),(c=-1<a?b[a]:null)&&we(c))}
function we(a){if("number"!==typeof a&&a&&!a.oa){var b=a.src;if(b&&b[de])je(b.i,a);else{var c=a.type,d=a.proxy;b.removeEventListener?b.removeEventListener(c,d,a.capture):b.detachEvent?b.detachEvent(te(c),d):b.addListener&&b.removeListener&&b.removeListener(d);me--;(c=re(b))?(je(c,a),0==c.h&&(c.src=null,b[ke]=null)):ge(a)}}}
function te(a){return a in le?le[a]:le[a]="on"+a}
function ue(a,b){if(a.oa)a=!0;else{b=new be(b,this);var c=a.listener,d=a.za||a.src;a.ta&&we(a);a=c.call(d,b)}return a}
function re(a){a=a[ke];return a instanceof he?a:null}
var xe="__closure_events_fn_"+(1E9*Math.random()>>>0);function pe(a){if("function"===typeof a)return a;a[xe]||(a[xe]=function(b){return a.handleEvent(b)});
return a[xe]}
;function ye(){J.call(this);this.i=new he(this);this.P=this;this.C=null}
D(ye,J);ye.prototype[de]=!0;ye.prototype.addEventListener=function(a,b,c,d){ne(this,a,b,c,d)};
ye.prototype.removeEventListener=function(a,b,c,d){ve(this,a,b,c,d)};
function ze(a,b){var c=a.C;if(c){var d=[];for(var e=1;c;c=c.C)d.push(c),++e}a=a.P;c=b.type||b;"string"===typeof b?b=new Wd(b,a):b instanceof Wd?b.target=b.target||a:(e=b,b=new Wd(c,a),qb(b,e));e=!0;if(d)for(var f=d.length-1;!b.j&&0<=f;f--){var g=b.h=d[f];e=Ae(g,c,!0,b)&&e}b.j||(g=b.h=a,e=Ae(g,c,!0,b)&&e,b.j||(e=Ae(g,c,!1,b)&&e));if(d)for(f=0;!b.j&&f<d.length;f++)g=b.h=d[f],e=Ae(g,c,!1,b)&&e}
ye.prototype.D=function(){ye.R.D.call(this);if(this.i){var a=this.i,b=0,c;for(c in a.listeners){for(var d=a.listeners[c],e=0;e<d.length;e++)++b,ge(d[e]);delete a.listeners[c];a.h--}}this.C=null};
ye.prototype.T=function(a,b,c,d){return this.i.add(String(a),b,!1,c,d)};
function Ae(a,b,c,d){b=a.i.listeners[String(b)];if(!b)return!0;b=b.concat();for(var e=!0,f=0;f<b.length;++f){var g=b[f];if(g&&!g.oa&&g.capture==c){var h=g.listener,k=g.za||g.src;g.ta&&je(a.i,g);e=!1!==h.call(k,d)&&e}}return e&&!d.defaultPrevented}
;function Be(a){var b,c;ye.call(this);var d=this;this.B=this.l=0;this.O=null!==a&&void 0!==a?a:{K:function(e,f){return setTimeout(e,f)},
Z:clearTimeout};this.j=null!==(c=null===(b=window.navigator)||void 0===b?void 0:b.onLine)&&void 0!==c?c:!0;this.m=function(){return I(d,function f(){var g=this;return x(f,function(h){return w(h,Ce(g),0)})})};
window.addEventListener("offline",this.m);window.addEventListener("online",this.m);this.B||De(this)}
v(Be,ye);Be.prototype.dispose=function(){window.removeEventListener("offline",this.m);window.removeEventListener("online",this.m);this.O.Z(this.B);delete Be.h};
Be.prototype.H=function(){return this.j};
function De(a){a.B=a.O.K(function(){return I(a,function c(){var d,e=this;return x(c,function(f){if(1==f.h)return e.j?(null===(d=window.navigator)||void 0===d?0:d.onLine)?f.u(3):w(f,Ce(e),3):w(f,Ce(e),3);De(e);f.h=0})})},3E4)}
function Ce(a,b){return a.o?a.o:a.o=new Promise(function(c){return I(a,function e(){var f,g,h,k=this;return x(e,function(l){switch(l.h){case 1:return f=window.AbortController?new window.AbortController:void 0,g=null===f||void 0===f?void 0:f.signal,h=!1,sa(l,2,3),f&&(k.l=k.O.K(function(){f.abort()},b||2E4)),w(l,fetch("/generate_204",{method:"HEAD",
signal:g}),5);case 5:h=!0;case 3:ua(l);k.o=void 0;k.l&&(k.O.Z(k.l),k.l=0);h!==k.j&&(k.j=h,k.j?ze(k,"networkstatus-online"):ze(k,"networkstatus-offline"));c(h);va(l);break;case 2:ta(l),h=!1,l.u(3)}})})})}
;function Ee(){this.data_=[];this.h=-1}
Ee.prototype.set=function(a,b){b=void 0===b?!0:b;0<=a&&52>a&&0===a%1&&this.data_[a]!=b&&(this.data_[a]=b,this.h=-1)};
Ee.prototype.get=function(a){return!!this.data_[a]};
function Fe(a){-1==a.h&&(a.h=bb(a.data_,function(b,c,d){return c?b+Math.pow(2,d):b},0));
return a.h}
;function Ge(a,b){this.j=a;this.l=b;this.i=0;this.h=null}
Ge.prototype.get=function(){if(0<this.i){this.i--;var a=this.h;this.h=a.next;a.next=null}else a=this.j();return a};
function He(a,b){a.l(b);100>a.i&&(a.i++,b.next=a.h,a.h=b)}
;var Ie;
function Je(){var a=y.MessageChannel;"undefined"===typeof a&&"undefined"!==typeof window&&window.postMessage&&window.addEventListener&&!H("Presto")&&(a=function(){var e=wd(document,"IFRAME");e.style.display="none";document.documentElement.appendChild(e);var f=e.contentWindow;e=f.document;e.open();e.close();var g="callImmediate"+Math.random(),h="file:"==f.location.protocol?"*":f.location.protocol+"//"+f.location.host;e=Sa(function(k){if(("*"==h||k.origin==h)&&k.data==g)this.port1.onmessage()},this);
f.addEventListener("message",e,!1);this.port1={};this.port2={postMessage:function(){f.postMessage(g,h)}}});
if("undefined"!==typeof a&&!H("Trident")&&!H("MSIE")){var b=new a,c={},d=c;b.port1.onmessage=function(){if(void 0!==c.next){c=c.next;var e=c.Za;c.Za=null;e()}};
return function(e){d.next={Za:e};d=d.next;b.port2.postMessage(0)}}return function(e){y.setTimeout(e,0)}}
;function Ke(){this.i=this.h=null}
Ke.prototype.add=function(a,b){var c=Le.get();c.set(a,b);this.i?this.i.next=c:this.h=c;this.i=c};
Ke.prototype.remove=function(){var a=null;this.h&&(a=this.h,this.h=this.h.next,this.h||(this.i=null),a.next=null);return a};
var Le=new Ge(function(){return new Me},function(a){return a.reset()});
function Me(){this.next=this.scope=this.h=null}
Me.prototype.set=function(a,b){this.h=a;this.scope=b;this.next=null};
Me.prototype.reset=function(){this.next=this.scope=this.h=null};function Ne(a,b){Oe||Pe();Qe||(Oe(),Qe=!0);Re.add(a,b)}
var Oe;function Pe(){if(y.Promise&&y.Promise.resolve){var a=y.Promise.resolve(void 0);Oe=function(){a.then(Se)}}else Oe=function(){var b=Se;
"function"!==typeof y.setImmediate||y.Window&&y.Window.prototype&&!H("Edge")&&y.Window.prototype.setImmediate==y.setImmediate?(Ie||(Ie=Je()),Ie(b)):y.setImmediate(b)}}
var Qe=!1,Re=new Ke;function Se(){for(var a;a=Re.remove();){try{a.h.call(a.scope)}catch(b){lc(b)}He(Le,a)}Qe=!1}
;function Te(a,b){this.h=a[y.Symbol.iterator]();this.i=b;this.j=0}
Te.prototype[Symbol.iterator]=function(){return this};
Te.prototype.next=function(){var a=this.h.next();return{value:a.done?void 0:this.i.call(void 0,a.value,this.j++),done:a.done}};
function Ue(a,b){return new Te(a,b)}
;function Ve(){this.blockSize=-1}
;function We(){this.blockSize=-1;this.blockSize=64;this.h=[];this.A=[];this.m=[];this.j=[];this.j[0]=128;for(var a=1;a<this.blockSize;++a)this.j[a]=0;this.l=this.i=0;this.reset()}
D(We,Ve);We.prototype.reset=function(){this.h[0]=1732584193;this.h[1]=4023233417;this.h[2]=2562383102;this.h[3]=271733878;this.h[4]=3285377520;this.l=this.i=0};
function Xe(a,b,c){c||(c=0);var d=a.m;if("string"===typeof b)for(var e=0;16>e;e++)d[e]=b.charCodeAt(c)<<24|b.charCodeAt(c+1)<<16|b.charCodeAt(c+2)<<8|b.charCodeAt(c+3),c+=4;else for(e=0;16>e;e++)d[e]=b[c]<<24|b[c+1]<<16|b[c+2]<<8|b[c+3],c+=4;for(e=16;80>e;e++){var f=d[e-3]^d[e-8]^d[e-14]^d[e-16];d[e]=(f<<1|f>>>31)&4294967295}b=a.h[0];c=a.h[1];var g=a.h[2],h=a.h[3],k=a.h[4];for(e=0;80>e;e++){if(40>e)if(20>e){f=h^c&(g^h);var l=1518500249}else f=c^g^h,l=1859775393;else 60>e?(f=c&g|h&(c|g),l=2400959708):
(f=c^g^h,l=3395469782);f=(b<<5|b>>>27)+f+k+l+d[e]&4294967295;k=h;h=g;g=(c<<30|c>>>2)&4294967295;c=b;b=f}a.h[0]=a.h[0]+b&4294967295;a.h[1]=a.h[1]+c&4294967295;a.h[2]=a.h[2]+g&4294967295;a.h[3]=a.h[3]+h&4294967295;a.h[4]=a.h[4]+k&4294967295}
We.prototype.update=function(a,b){if(null!=a){void 0===b&&(b=a.length);for(var c=b-this.blockSize,d=0,e=this.A,f=this.i;d<b;){if(0==f)for(;d<=c;)Xe(this,a,d),d+=this.blockSize;if("string"===typeof a)for(;d<b;){if(e[f]=a.charCodeAt(d),++f,++d,f==this.blockSize){Xe(this,e);f=0;break}}else for(;d<b;)if(e[f]=a[d],++f,++d,f==this.blockSize){Xe(this,e);f=0;break}}this.i=f;this.l+=b}};
We.prototype.digest=function(){var a=[],b=8*this.l;56>this.i?this.update(this.j,56-this.i):this.update(this.j,this.blockSize-(this.i-56));for(var c=this.blockSize-1;56<=c;c--)this.A[c]=b&255,b/=256;Xe(this,this.A);for(c=b=0;5>c;c++)for(var d=24;0<=d;d-=8)a[b]=this.h[c]>>d&255,++b;return a};function Ye(a){return"string"==typeof a.className?a.className:a.getAttribute&&a.getAttribute("class")||""}
function Ze(a,b){"string"==typeof a.className?a.className=b:a.setAttribute&&a.setAttribute("class",b)}
function $e(a,b){a.classList?b=a.classList.contains(b):(a=a.classList?a.classList:Ye(a).match(/\S+/g)||[],b=0<=Za(a,b));return b}
function af(){var a=document.body;a.classList?a.classList.remove("inverted-hdpi"):$e(a,"inverted-hdpi")&&Ze(a,Array.prototype.filter.call(a.classList?a.classList:Ye(a).match(/\S+/g)||[],function(b){return"inverted-hdpi"!=b}).join(" "))}
;var bf="StopIteration"in y?y.StopIteration:{message:"StopIteration",stack:""};function cf(){}
cf.prototype.U=function(){throw bf;};
cf.prototype.next=function(){return df};
var df={done:!0,value:void 0};cf.prototype.N=function(){return this};function ef(a){if(a instanceof ff||a instanceof gf||a instanceof hf)return a;if("function"==typeof a.U)return new ff(function(){return jf(a)});
if("function"==typeof a[Symbol.iterator])return new ff(function(){return a[Symbol.iterator]()});
if("function"==typeof a.N)return new ff(function(){return jf(a.N())});
throw Error("Not an iterator or iterable.");}
function jf(a){if(!(a instanceof cf))return a;var b=!1;return{next:function(){for(var c;!b;)try{c=a.U();break}catch(d){if(d!==bf)throw d;b=!0}return{value:c,done:b}}}}
function ff(a){this.i=a}
ff.prototype.N=function(){return new gf(this.i())};
ff.prototype[Symbol.iterator]=function(){return new hf(this.i())};
ff.prototype.h=function(){return new hf(this.i())};
function gf(a){this.i=a}
v(gf,cf);gf.prototype.U=function(){var a=this.i.next();if(a.done)throw bf;return a.value};
gf.prototype[Symbol.iterator]=function(){return new hf(this.i)};
gf.prototype.h=function(){return new hf(this.i)};
function hf(a){ff.call(this,function(){return a});
this.j=a}
v(hf,ff);hf.prototype.next=function(){return this.j.next()};function kf(a,b){this.i={};this.h=[];this.fa=this.size=0;var c=arguments.length;if(1<c){if(c%2)throw Error("Uneven number of arguments");for(var d=0;d<c;d+=2)this.set(arguments[d],arguments[d+1])}else if(a)if(a instanceof kf)for(c=lf(a),d=0;d<c.length;d++)this.set(c[d],a.get(c[d]));else for(d in a)this.set(d,a[d])}
function lf(a){mf(a);return a.h.concat()}
m=kf.prototype;m.has=function(a){return nf(this.i,a)};
m.equals=function(a,b){if(this===a)return!0;if(this.size!=a.size)return!1;b=b||of;mf(this);for(var c,d=0;c=this.h[d];d++)if(!b(this.get(c),a.get(c)))return!1;return!0};
function of(a,b){return a===b}
m.isEmpty=function(){return 0==this.size};
m.clear=function(){this.i={};this.fa=this.size=this.h.length=0};
m.remove=function(a){return this.delete(a)};
m.delete=function(a){return nf(this.i,a)?(delete this.i[a],--this.size,this.fa++,this.h.length>2*this.size&&mf(this),!0):!1};
function mf(a){if(a.size!=a.h.length){for(var b=0,c=0;b<a.h.length;){var d=a.h[b];nf(a.i,d)&&(a.h[c++]=d);b++}a.h.length=c}if(a.size!=a.h.length){var e={};for(c=b=0;b<a.h.length;)d=a.h[b],nf(e,d)||(a.h[c++]=d,e[d]=1),b++;a.h.length=c}}
m.get=function(a,b){return nf(this.i,a)?this.i[a]:b};
m.set=function(a,b){nf(this.i,a)||(this.size+=1,this.h.push(a),this.fa++);this.i[a]=b};
m.forEach=function(a,b){for(var c=lf(this),d=0;d<c.length;d++){var e=c[d],f=this.get(e);a.call(b,f,e,this)}};
m.clone=function(){return new kf(this)};
m.keys=function(){return ef(this.N(!0)).h()};
m.values=function(){return ef(this.N(!1)).h()};
m.entries=function(){var a=this;return Ue(this.keys(),function(b){return[b,a.get(b)]})};
m.N=function(a){mf(this);var b=0,c=this.fa,d=this,e=new cf;e.U=function(){if(c!=d.fa)throw Error("The map has changed since the iterator was created");if(b>=d.h.length)throw bf;var f=d.h[b++];return a?f:d.i[f]};
return e};
function nf(a,b){return Object.prototype.hasOwnProperty.call(a,b)}
;function pf(a){qf();return Bb(a)}
var qf=Ha;function rf(a){var b=[];sf(new tf,a,b);return b.join("")}
function tf(){}
function sf(a,b,c){if(null==b)c.push("null");else{if("object"==typeof b){if(Array.isArray(b)){var d=b;b=d.length;c.push("[");for(var e="",f=0;f<b;f++)c.push(e),sf(a,d[f],c),e=",";c.push("]");return}if(b instanceof String||b instanceof Number||b instanceof Boolean)b=b.valueOf();else{c.push("{");e="";for(d in b)Object.prototype.hasOwnProperty.call(b,d)&&(f=b[d],"function"!=typeof f&&(c.push(e),uf(d,c),c.push(":"),sf(a,f,c),e=","));c.push("}");return}}switch(typeof b){case "string":uf(b,c);break;case "number":c.push(isFinite(b)&&
!isNaN(b)?String(b):"null");break;case "boolean":c.push(String(b));break;case "function":c.push("null");break;default:throw Error("Unknown type: "+typeof b);}}}
var vf={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},wf=/\uffff/.test("\uffff")?/[\\"\x00-\x1f\x7f-\uffff]/g:/[\\"\x00-\x1f\x7f-\xff]/g;function uf(a,b){b.push('"',a.replace(wf,function(c){var d=vf[c];d||(d="\\u"+(c.charCodeAt(0)|65536).toString(16).substr(1),vf[c]=d);return d}),'"')}
;function xf(a){if(!a)return!1;try{return!!a.$goog_Thenable}catch(b){return!1}}
;function yf(a){this.h=0;this.o=void 0;this.l=this.i=this.j=null;this.A=this.m=!1;if(a!=Ha)try{var b=this;a.call(void 0,function(c){zf(b,2,c)},function(c){zf(b,3,c)})}catch(c){zf(this,3,c)}}
function Af(){this.next=this.context=this.onRejected=this.i=this.h=null;this.j=!1}
Af.prototype.reset=function(){this.context=this.onRejected=this.i=this.h=null;this.j=!1};
var Bf=new Ge(function(){return new Af},function(a){a.reset()});
function Cf(a,b,c){var d=Bf.get();d.i=a;d.onRejected=b;d.context=c;return d}
function Df(a){return new yf(function(b,c){c(a)})}
yf.prototype.then=function(a,b,c){return Ff(this,"function"===typeof a?a:null,"function"===typeof b?b:null,c)};
yf.prototype.$goog_Thenable=!0;function Gf(a,b){return Ff(a,null,b,void 0)}
yf.prototype.cancel=function(a){if(0==this.h){var b=new Hf(a);Ne(function(){If(this,b)},this)}};
function If(a,b){if(0==a.h)if(a.j){var c=a.j;if(c.i){for(var d=0,e=null,f=null,g=c.i;g&&(g.j||(d++,g.h==a&&(e=g),!(e&&1<d)));g=g.next)e||(f=g);e&&(0==c.h&&1==d?If(c,b):(f?(d=f,d.next==c.l&&(c.l=d),d.next=d.next.next):Jf(c),Kf(c,e,3,b)))}a.j=null}else zf(a,3,b)}
function Lf(a,b){a.i||2!=a.h&&3!=a.h||Mf(a);a.l?a.l.next=b:a.i=b;a.l=b}
function Ff(a,b,c,d){var e=Cf(null,null,null);e.h=new yf(function(f,g){e.i=b?function(h){try{var k=b.call(d,h);f(k)}catch(l){g(l)}}:f;
e.onRejected=c?function(h){try{var k=c.call(d,h);void 0===k&&h instanceof Hf?g(h):f(k)}catch(l){g(l)}}:g});
e.h.j=a;Lf(a,e);return e.h}
yf.prototype.C=function(a){this.h=0;zf(this,2,a)};
yf.prototype.G=function(a){this.h=0;zf(this,3,a)};
function zf(a,b,c){if(0==a.h){a===c&&(b=3,c=new TypeError("Promise cannot resolve to itself"));a.h=1;a:{var d=c,e=a.C,f=a.G;if(d instanceof yf){Lf(d,Cf(e||Ha,f||null,a));var g=!0}else if(xf(d))d.then(e,f,a),g=!0;else{if(La(d))try{var h=d.then;if("function"===typeof h){Nf(d,h,e,f,a);g=!0;break a}}catch(k){f.call(a,k);g=!0;break a}g=!1}}g||(a.o=c,a.h=b,a.j=null,Mf(a),3!=b||c instanceof Hf||Of(a,c))}}
function Nf(a,b,c,d,e){function f(k){h||(h=!0,d.call(e,k))}
function g(k){h||(h=!0,c.call(e,k))}
var h=!1;try{b.call(a,g,f)}catch(k){f(k)}}
function Mf(a){a.m||(a.m=!0,Ne(a.B,a))}
function Jf(a){var b=null;a.i&&(b=a.i,a.i=b.next,b.next=null);a.i||(a.l=null);return b}
yf.prototype.B=function(){for(var a;a=Jf(this);)Kf(this,a,this.h,this.o);this.m=!1};
function Kf(a,b,c,d){if(3==c&&b.onRejected&&!b.j)for(;a&&a.A;a=a.j)a.A=!1;if(b.h)b.h.j=null,Pf(b,c,d);else try{b.j?b.i.call(b.context):Pf(b,c,d)}catch(e){Qf.call(null,e)}He(Bf,b)}
function Pf(a,b,c){2==b?a.i.call(a.context,c):a.onRejected&&a.onRejected.call(a.context,c)}
function Of(a,b){a.A=!0;Ne(function(){a.A&&Qf.call(null,b)})}
var Qf=lc;function Hf(a){Wa.call(this,a)}
D(Hf,Wa);Hf.prototype.name="cancel";function L(a){J.call(this);this.o=1;this.l=[];this.m=0;this.i=[];this.j={};this.B=!!a}
D(L,J);m=L.prototype;m.subscribe=function(a,b,c){var d=this.j[a];d||(d=this.j[a]=[]);var e=this.o;this.i[e]=a;this.i[e+1]=b;this.i[e+2]=c;this.o=e+3;d.push(e);return e};
function Rf(a,b,c,d){if(b=a.j[b]){var e=a.i;(b=b.find(function(f){return e[f+1]==c&&e[f+2]==d}))&&a.na(b)}}
m.na=function(a){var b=this.i[a];if(b){var c=this.j[b];0!=this.m?(this.l.push(a),this.i[a+1]=Ha):(c&&db(c,a),delete this.i[a],delete this.i[a+1],delete this.i[a+2])}return!!b};
m.ga=function(a,b){var c=this.j[a];if(c){for(var d=Array(arguments.length-1),e=1,f=arguments.length;e<f;e++)d[e-1]=arguments[e];if(this.B)for(e=0;e<c.length;e++){var g=c[e];Sf(this.i[g+1],this.i[g+2],d)}else{this.m++;try{for(e=0,f=c.length;e<f&&!this.h;e++)g=c[e],this.i[g+1].apply(this.i[g+2],d)}finally{if(this.m--,0<this.l.length&&0==this.m)for(;c=this.l.pop();)this.na(c)}}return 0!=e}return!1};
function Sf(a,b,c){Ne(function(){a.apply(b,c)})}
m.clear=function(a){if(a){var b=this.j[a];b&&(b.forEach(this.na,this),delete this.j[a])}else this.i.length=0,this.j={}};
m.D=function(){L.R.D.call(this);this.clear();this.l.length=0};function Tf(a){this.h=a}
Tf.prototype.set=function(a,b){void 0===b?this.h.remove(a):this.h.set(a,rf(b))};
Tf.prototype.get=function(a){try{var b=this.h.get(a)}catch(c){return}if(null!==b)try{return JSON.parse(b)}catch(c){throw"Storage: Invalid value was encountered";}};
Tf.prototype.remove=function(a){this.h.remove(a)};function Uf(a){this.h=a}
D(Uf,Tf);function Vf(a){this.data=a}
function Wf(a){return void 0===a||a instanceof Vf?a:new Vf(a)}
Uf.prototype.set=function(a,b){Uf.R.set.call(this,a,Wf(b))};
Uf.prototype.i=function(a){a=Uf.R.get.call(this,a);if(void 0===a||a instanceof Object)return a;throw"Storage: Invalid value was encountered";};
Uf.prototype.get=function(a){if(a=this.i(a)){if(a=a.data,void 0===a)throw"Storage: Invalid value was encountered";}else a=void 0;return a};function Xf(a){this.h=a}
D(Xf,Uf);Xf.prototype.set=function(a,b,c){if(b=Wf(b)){if(c){if(c<Date.now()){Xf.prototype.remove.call(this,a);return}b.expiration=c}b.creation=Date.now()}Xf.R.set.call(this,a,b)};
Xf.prototype.i=function(a){var b=Xf.R.i.call(this,a);if(b){var c=b.creation,d=b.expiration;if(d&&d<Date.now()||c&&c>Date.now())Xf.prototype.remove.call(this,a);else return b}};function Yf(){}
;function Zf(){}
D(Zf,Yf);Zf.prototype[Symbol.iterator]=function(){return ef(this.N(!0)).h()};
Zf.prototype.clear=function(){var a=Array.from(this);a=u(a);for(var b=a.next();!b.done;b=a.next())this.remove(b.value)};function $f(a){this.h=a}
D($f,Zf);m=$f.prototype;m.isAvailable=function(){if(!this.h)return!1;try{return this.h.setItem("__sak","1"),this.h.removeItem("__sak"),!0}catch(a){return!1}};
m.set=function(a,b){try{this.h.setItem(a,b)}catch(c){if(0==this.h.length)throw"Storage mechanism: Storage disabled";throw"Storage mechanism: Quota exceeded";}};
m.get=function(a){a=this.h.getItem(a);if("string"!==typeof a&&null!==a)throw"Storage mechanism: Invalid value was encountered";return a};
m.remove=function(a){this.h.removeItem(a)};
m.N=function(a){var b=0,c=this.h,d=new cf;d.U=function(){if(b>=c.length)throw bf;var e=c.key(b++);if(a)return e;e=c.getItem(e);if("string"!==typeof e)throw"Storage mechanism: Invalid value was encountered";return e};
return d};
m.clear=function(){this.h.clear()};
m.key=function(a){return this.h.key(a)};function ag(){var a=null;try{a=window.localStorage||null}catch(b){}this.h=a}
D(ag,$f);function bg(a,b){this.i=a;this.h=null;var c;if(c=pc)c=!(9<=Number(Cc));if(c){cg||(cg=new kf);this.h=cg.get(a);this.h||(b?this.h=document.getElementById(b):(this.h=document.createElement("userdata"),this.h.addBehavior("#default#userData"),document.body.appendChild(this.h)),cg.set(a,this.h));try{this.h.load(this.i)}catch(d){this.h=null}}}
D(bg,Zf);var dg={".":".2E","!":".21","~":".7E","*":".2A","'":".27","(":".28",")":".29","%":"."},cg=null;function eg(a){return"_"+encodeURIComponent(a).replace(/[.!~*'()%]/g,function(b){return dg[b]})}
m=bg.prototype;m.isAvailable=function(){return!!this.h};
m.set=function(a,b){this.h.setAttribute(eg(a),b);fg(this)};
m.get=function(a){a=this.h.getAttribute(eg(a));if("string"!==typeof a&&null!==a)throw"Storage mechanism: Invalid value was encountered";return a};
m.remove=function(a){this.h.removeAttribute(eg(a));fg(this)};
m.N=function(a){var b=0,c=this.h.XMLDocument.documentElement.attributes,d=new cf;d.U=function(){if(b>=c.length)throw bf;var e=c[b++];if(a)return decodeURIComponent(e.nodeName.replace(/\./g,"%")).substr(1);e=e.nodeValue;if("string"!==typeof e)throw"Storage mechanism: Invalid value was encountered";return e};
return d};
m.clear=function(){for(var a=this.h.XMLDocument.documentElement,b=a.attributes.length;0<b;b--)a.removeAttribute(a.attributes[b-1].nodeName);fg(this)};
function fg(a){try{a.h.save(a.i)}catch(b){throw"Storage mechanism: Quota exceeded";}}
;function gg(a,b){this.i=a;this.h=b+"::"}
D(gg,Zf);gg.prototype.set=function(a,b){this.i.set(this.h+a,b)};
gg.prototype.get=function(a){return this.i.get(this.h+a)};
gg.prototype.remove=function(a){this.i.remove(this.h+a)};
gg.prototype.N=function(a){var b=this.i.N(!0),c=this,d=new cf;d.U=function(){for(var e=b.U();e.substr(0,c.h.length)!=c.h;)e=b.U();return a?e.substr(c.h.length):c.i.get(e)};
return d};function hg(a,b){1<b.length?a[b[0]]=b[1]:1===b.length&&Object.assign(a,b[0])}
;function ig(a){Yc.call(this,a)}
v(ig,Yc);var jg,kg,lg,mg=y.window,ng=(null===(jg=null===mg||void 0===mg?void 0:mg.yt)||void 0===jg?void 0:jg.config_)||(null===(kg=null===mg||void 0===mg?void 0:mg.ytcfg)||void 0===kg?void 0:kg.data_)||{},og=(null===(lg=null===mg||void 0===mg?void 0:mg.ytcfg)||void 0===lg?void 0:lg.obfuscatedData_)||[];new ig(og);A("yt.config_",ng,void 0);A("yt.configJspb_",og,void 0);function M(a){for(var b=0;b<arguments.length;++b);hg(ng,arguments)}
function F(a,b){return a in ng?ng[a]:b}
;var pg=[];function qg(a){pg.forEach(function(b){return b(a)})}
function rg(a){return a&&window.yterr?function(){try{return a.apply(this,arguments)}catch(b){sg(b)}}:a}
function sg(a,b,c,d){var e=C("yt.logging.errors.log");e?e(a,"ERROR",b,c,d):(e=F("ERRORS",[]),e.push([a,"ERROR",b,c,d]),M("ERRORS",e));qg(a)}
function tg(a,b,c,d){var e=C("yt.logging.errors.log");e?e(a,"WARNING",b,c,d):(e=F("ERRORS",[]),e.push([a,"WARNING",b,c,d]),M("ERRORS",e))}
;var ug=window.yt&&window.yt.msgs_||window.ytcfg&&window.ytcfg.msgs||{};A("yt.msgs_",ug,void 0);function vg(a){hg(ug,arguments)}
;function N(a){a=wg(a);return"string"===typeof a&&"false"===a?!1:!!a}
function xg(a,b){a=wg(a);return void 0===a&&void 0!==b?b:Number(a||0)}
function wg(a){var b=F("EXPERIMENTS_FORCED_FLAGS",{});return void 0!==b[a]?b[a]:F("EXPERIMENT_FLAGS",{})[a]}
;var yg={appSettingsCaptured:!0,foregroundHeartbeat:!0,foregroundHeartbeatScreenAssociated:!0,screenCreated:!0,visualElementAttached:!0,visualElementGestured:!0,visualElementHidden:!0,visualElementShown:!0,flowEvent:!0,visualElementStateChanged:!0,playbackAssociated:!0,youThere:!0,accountStateChangeSignedIn:!0,accountStateChangeSignedOut:!0},zg={latencyActionBaselined:!0,latencyActionInfo:!0,latencyActionTicked:!0,bedrockRepetitiveActionTimed:!0,adsClientStateChange:!0,streamzIncremented:!0,mdxDialAdditionalDataUpdateEvent:!0,
tvhtml5WatchKeyEvent:!0,tvhtml5VideoSeek:!0,tokenRefreshEvent:!0,adNotify:!0,adNotifyFilled:!0,tvhtml5LaunchUrlComponentChanged:!0,bedrockResourceConsumptionSnapshot:!0,deviceStartupMetrics:!0,mdxSignIn:!0,tvhtml5KeyboardLogging:!0,tvhtml5StartupSoundEvent:!0,tvhtml5LiveChatStatus:!0,tvhtml5DeviceStorageStatus:!0,tvhtml5LocalStorage:!0,directSignInEvent:!0,finalPayload:!0,tvhtml5SearchCompleted:!0,tvhtml5KeyboardPerformance:!0,adNotifyFailure:!0,latencyActionSpan:!0,tvhtml5AccountDialogOpened:!0,
tvhtml5ApiTest:!0};var Ag=0,Bg=sc?"webkit":rc?"moz":pc?"ms":oc?"o":"";A("ytDomDomGetNextId",C("ytDomDomGetNextId")||function(){return++Ag},void 0);var Cg={stopImmediatePropagation:1,stopPropagation:1,preventMouseEvent:1,preventManipulation:1,preventDefault:1,layerX:1,layerY:1,screenX:1,screenY:1,scale:1,rotation:1,webkitMovementX:1,webkitMovementY:1};
function Dg(a){this.type="";this.state=this.source=this.data=this.currentTarget=this.relatedTarget=this.target=null;this.charCode=this.keyCode=0;this.metaKey=this.shiftKey=this.ctrlKey=this.altKey=!1;this.rotation=this.clientY=this.clientX=0;this.scale=1;this.changedTouches=this.touches=null;try{if(a=a||window.event){this.event=a;for(var b in a)b in Cg||(this[b]=a[b]);this.scale=a.scale;this.rotation=a.rotation;var c=a.target||a.srcElement;c&&3==c.nodeType&&(c=c.parentNode);this.target=c;var d=a.relatedTarget;
if(d)try{d=d.nodeName?d:null}catch(e){d=null}else"mouseover"==this.type?d=a.fromElement:"mouseout"==this.type&&(d=a.toElement);this.relatedTarget=d;this.clientX=void 0!=a.clientX?a.clientX:a.pageX;this.clientY=void 0!=a.clientY?a.clientY:a.pageY;this.keyCode=a.keyCode?a.keyCode:a.which;this.charCode=a.charCode||("keypress"==this.type?this.keyCode:0);this.altKey=a.altKey;this.ctrlKey=a.ctrlKey;this.shiftKey=a.shiftKey;this.metaKey=a.metaKey;this.h=a.pageX;this.i=a.pageY}}catch(e){}}
function Eg(a){if(document.body&&document.documentElement){var b=document.body.scrollTop+document.documentElement.scrollTop;a.h=a.clientX+(document.body.scrollLeft+document.documentElement.scrollLeft);a.i=a.clientY+b}}
Dg.prototype.preventDefault=function(){this.event&&(this.event.returnValue=!1,this.event.preventDefault&&this.event.preventDefault())};
Dg.prototype.stopPropagation=function(){this.event&&(this.event.cancelBubble=!0,this.event.stopPropagation&&this.event.stopPropagation())};
Dg.prototype.stopImmediatePropagation=function(){this.event&&(this.event.cancelBubble=!0,this.event.stopImmediatePropagation&&this.event.stopImmediatePropagation())};var ib=y.ytEventsEventsListeners||{};A("ytEventsEventsListeners",ib,void 0);var Fg=y.ytEventsEventsCounter||{count:0};A("ytEventsEventsCounter",Fg,void 0);
function Gg(a,b,c,d){d=void 0===d?{}:d;a.addEventListener&&("mouseenter"!=b||"onmouseenter"in document?"mouseleave"!=b||"onmouseenter"in document?"mousewheel"==b&&"MozBoxSizing"in document.documentElement.style&&(b="MozMousePixelScroll"):b="mouseout":b="mouseover");return hb(function(e){var f="boolean"===typeof e[4]&&e[4]==!!d,g=La(e[4])&&La(d)&&mb(e[4],d);return!!e.length&&e[0]==a&&e[1]==b&&e[2]==c&&(f||g)})}
var Hg=Ya(function(){var a=!1;try{var b=Object.defineProperty({},"capture",{get:function(){a=!0}});
window.addEventListener("test",null,b)}catch(c){}return a});
function Ig(a,b,c,d){d=void 0===d?{}:d;if(!a||!a.addEventListener&&!a.attachEvent)return"";var e=Gg(a,b,c,d);if(e)return e;e=++Fg.count+"";var f=!("mouseenter"!=b&&"mouseleave"!=b||!a.addEventListener||"onmouseenter"in document);var g=f?function(h){h=new Dg(h);if(!yd(h.relatedTarget,function(k){return k==a}))return h.currentTarget=a,h.type=b,c.call(a,h)}:function(h){h=new Dg(h);
h.currentTarget=a;return c.call(a,h)};
g=rg(g);a.addEventListener?("mouseenter"==b&&f?b="mouseover":"mouseleave"==b&&f?b="mouseout":"mousewheel"==b&&"MozBoxSizing"in document.documentElement.style&&(b="MozMousePixelScroll"),Hg()||"boolean"===typeof d?a.addEventListener(b,g,d):a.addEventListener(b,g,!!d.capture)):a.attachEvent("on"+b,g);ib[e]=[a,b,c,g,d];return e}
function Jg(a){a&&("string"==typeof a&&(a=[a]),E(a,function(b){if(b in ib){var c=ib[b],d=c[0],e=c[1],f=c[3];c=c[4];d.removeEventListener?Hg()||"boolean"===typeof c?d.removeEventListener(e,f,c):d.removeEventListener(e,f,!!c.capture):d.detachEvent&&d.detachEvent("on"+e,f);delete ib[b]}}))}
;var Kg=window.ytcsi&&window.ytcsi.now?window.ytcsi.now:window.performance&&window.performance.timing&&window.performance.now&&window.performance.timing.navigationStart?function(){return window.performance.timing.navigationStart+window.performance.now()}:function(){return(new Date).getTime()};function Lg(a,b){"function"===typeof a&&(a=rg(a));return window.setTimeout(a,b)}
function Mg(a){window.clearTimeout(a)}
;function Ng(a){this.C=a;this.i=null;this.m=0;this.B=null;this.o=0;this.j=[];for(a=0;4>a;a++)this.j.push(0);this.l=0;this.M=Ig(window,"mousemove",Sa(this.P,this));a=Sa(this.G,this);"function"===typeof a&&(a=rg(a));this.X=window.setInterval(a,25)}
D(Ng,J);Ng.prototype.P=function(a){void 0===a.h&&Eg(a);var b=a.h;void 0===a.i&&Eg(a);this.i=new qd(b,a.i)};
Ng.prototype.G=function(){if(this.i){var a=Kg();if(0!=this.m){var b=this.B,c=this.i,d=b.x-c.x;b=b.y-c.y;d=Math.sqrt(d*d+b*b)/(a-this.m);this.j[this.l]=.5<Math.abs((d-this.o)/this.o)?1:0;for(c=b=0;4>c;c++)b+=this.j[c]||0;3<=b&&this.C();this.o=d}this.m=a;this.B=this.i;this.l=(this.l+1)%4}};
Ng.prototype.D=function(){window.clearInterval(this.X);Jg(this.M)};function Og(){}
function Pg(a,b){return Qg(a,0,b)}
Og.prototype.K=function(a,b){return Qg(a,1,b)};function Rg(){Og.apply(this,arguments)}
v(Rg,Og);function Sg(){Rg.h||(Rg.h=new Rg);return Rg.h}
function Qg(a,b,c){void 0!==c&&Number.isNaN(Number(c))&&(c=void 0);var d=C("yt.scheduler.instance.addJob");return d?d(a,b,c):void 0===c?(a(),NaN):Lg(a,c||0)}
Rg.prototype.Z=function(a){if(void 0===a||!Number.isNaN(Number(a))){var b=C("yt.scheduler.instance.cancelJob");b?b(a):Mg(a)}};
Rg.prototype.start=function(){var a=C("yt.scheduler.instance.start");a&&a()};
Rg.prototype.pause=function(){var a=C("yt.scheduler.instance.pause");a&&a()};var Tg=Sg();var Ug={};
function Vg(a){var b=void 0===a?{}:a;a=void 0===b.Nb?!1:b.Nb;b=void 0===b.xb?!0:b.xb;if(null==C("_lact",window)){var c=parseInt(F("LACT"),10);c=isFinite(c)?Date.now()-Math.max(c,0):-1;A("_lact",c,window);A("_fact",c,window);-1==c&&Wg();Ig(document,"keydown",Wg);Ig(document,"keyup",Wg);Ig(document,"mousedown",Wg);Ig(document,"mouseup",Wg);a?Ig(window,"touchmove",function(){Xg("touchmove",200)},{passive:!0}):(Ig(window,"resize",function(){Xg("resize",200)}),b&&Ig(window,"scroll",function(){Xg("scroll",200)}));
new Ng(function(){Xg("mouse",100)});
Ig(document,"touchstart",Wg,{passive:!0});Ig(document,"touchend",Wg,{passive:!0})}}
function Xg(a,b){Ug[a]||(Ug[a]=!0,Tg.K(function(){Wg();Ug[a]=!1},b))}
function Wg(){null==C("_lact",window)&&Vg();var a=Date.now();A("_lact",a,window);-1==C("_fact",window)&&A("_fact",a,window);(a=C("ytglobal.ytUtilActivityCallback_"))&&a()}
function Yg(){var a=C("_lact",window);return null==a?-1:Math.max(Date.now()-a,0)}
;function Zg(){var a=$g;C("yt.ads.biscotti.getId_")||A("yt.ads.biscotti.getId_",a,void 0)}
function ah(a){A("yt.ads.biscotti.lastId_",a,void 0)}
;var bh=/^[\w.]*$/,ch={q:!0,search_query:!0};function dh(a,b){b=a.split(b);for(var c={},d=0,e=b.length;d<e;d++){var f=b[d].split("=");if(1==f.length&&f[0]||2==f.length)try{var g=eh(f[0]||""),h=eh(f[1]||"");g in c?Array.isArray(c[g])?fb(c[g],h):c[g]=[c[g],h]:c[g]=h}catch(p){var k=p,l=f[0],n=String(dh);k.args=[{key:l,value:f[1],query:a,method:fh==n?"unchanged":n}];ch.hasOwnProperty(l)||tg(k)}}return c}
var fh=String(dh);function gh(a){var b=[];gb(a,function(c,d){var e=encodeURIComponent(String(d)),f;Array.isArray(c)?f=c:f=[c];E(f,function(g){""==g?b.push(e):b.push(e+"="+encodeURIComponent(String(g)))})});
return b.join("&")}
function hh(a){"?"==a.charAt(0)&&(a=a.substr(1));return dh(a,"&")}
function ih(){var a=window.location.href;return-1!=a.indexOf("?")?(a=(a||"").split("#")[0],a=a.split("?",2),hh(1<a.length?a[1]:a[0])):{}}
function jh(a,b,c){var d=a.split("#",2);a=d[0];d=1<d.length?"#"+d[1]:"";var e=a.split("?",2);a=e[0];e=hh(e[1]||"");for(var f in b)!c&&null!==e&&f in e||(e[f]=b[f]);return jc(a,e)+d}
function kh(a){if(!b)var b=window.location.href;var c=a.match(ec)[1]||null,d=gc(a);c&&d?(a=a.match(ec),b=b.match(ec),a=a[3]==b[3]&&a[1]==b[1]&&a[4]==b[4]):a=d?gc(b)==d&&(Number(b.match(ec)[4]||null)||null)==(Number(a.match(ec)[4]||null)||null):!0;return a}
function eh(a){return a&&a.match(bh)?a:decodeURIComponent(a.replace(/\+/g," "))}
;function lh(a){var b=mh;a=void 0===a?C("yt.ads.biscotti.lastId_")||"":a;var c=Object,d=c.assign,e={};e.dt=Gd;e.flash="0";a:{try{var f=b.h.top.location.href}catch(Oa){f=2;break a}f=f?f===b.i.location.href?0:1:2}e=(e.frm=f,e);try{e.u_tz=-(new Date).getTimezoneOffset();var g=void 0===g?gd:g;try{var h=g.history.length}catch(Oa){h=0}e.u_his=h;var k;e.u_h=null==(k=gd.screen)?void 0:k.height;var l;e.u_w=null==(l=gd.screen)?void 0:l.width;var n;e.u_ah=null==(n=gd.screen)?void 0:n.availHeight;var p;e.u_aw=
null==(p=gd.screen)?void 0:p.availWidth;var r;e.u_cd=null==(r=gd.screen)?void 0:r.colorDepth}catch(Oa){}h=b.h;try{var q=h.screenX;var z=h.screenY}catch(Oa){}try{var B=h.outerWidth;var G=h.outerHeight}catch(Oa){}try{var R=h.innerWidth;var P=h.innerHeight}catch(Oa){}try{var K=h.screenLeft;var ha=h.screenTop}catch(Oa){}try{R=h.innerWidth,P=h.innerHeight}catch(Oa){}try{var Ef=h.screen.availWidth;var hn=h.screen.availTop}catch(Oa){}q=[K,ha,q,z,Ef,hn,B,G,R,P];z=b.h.top;try{var Nb=(z||window).document,Ba=
"CSS1Compat"==Nb.compatMode?Nb.documentElement:Nb.body;var Da=(new rd(Ba.clientWidth,Ba.clientHeight)).round()}catch(Oa){Da=new rd(-12245933,-12245933)}Nb=Da;Da={};Ba=new Ee;y.SVGElement&&y.document.createElementNS&&Ba.set(0);z=Dd();z["allow-top-navigation-by-user-activation"]&&Ba.set(1);z["allow-popups-to-escape-sandbox"]&&Ba.set(2);y.crypto&&y.crypto.subtle&&Ba.set(3);y.TextDecoder&&y.TextEncoder&&Ba.set(4);Ba=Fe(Ba);Da.bc=Ba;Da.bih=Nb.height;Da.biw=Nb.width;Da.brdim=q.join();b=b.i;b=(Da.vis={visible:1,
hidden:2,prerender:3,preview:4,unloaded:5}[b.visibilityState||b.webkitVisibilityState||b.mozVisibilityState||""]||0,Da.wgl=!!gd.WebGLRenderingContext,Da);c=d.call(c,e,b);c.ca_type="image";a&&(c.bid=a);return c}
var mh=new function(){var a=window.document;this.h=window;this.i=a};
A("yt.ads_.signals_.getAdSignalsString",function(a){return gh(lh(a))},void 0);Date.now();var nh="XMLHttpRequest"in y?function(){return new XMLHttpRequest}:null;
function oh(){if(!nh)return null;var a=nh();return"open"in a?a:null}
function ph(a){switch(a&&"status"in a?a.status:-1){case 200:case 201:case 202:case 203:case 204:case 205:case 206:case 304:return!0;default:return!1}}
;var qh={Authorization:"AUTHORIZATION","X-Goog-Visitor-Id":"SANDBOXED_VISITOR_ID","X-Youtube-Domain-Admin-State":"DOMAIN_ADMIN_STATE","X-Youtube-Chrome-Connected":"CHROME_CONNECTED_HEADER","X-YouTube-Client-Name":"INNERTUBE_CONTEXT_CLIENT_NAME","X-YouTube-Client-Version":"INNERTUBE_CONTEXT_CLIENT_VERSION","X-YouTube-Delegation-Context":"INNERTUBE_CONTEXT_SERIALIZED_DELEGATION_CONTEXT","X-YouTube-Device":"DEVICE","X-Youtube-Identity-Token":"ID_TOKEN","X-YouTube-Page-CL":"PAGE_CL","X-YouTube-Page-Label":"PAGE_BUILD_LABEL",
"X-YouTube-Variants-Checksum":"VARIANTS_CHECKSUM"},rh="app debugcss debugjs expflag force_ad_params force_ad_encrypted force_viral_ad_response_params forced_experiments innertube_snapshots innertube_goldens internalcountrycode internalipoverride absolute_experiments conditional_experiments sbb sr_bns_address".split(" ").concat(fa("client_dev_mss_url client_dev_regex_map client_dev_root_url expflag jsfeat jsmode client_rollout_override".split(" "))),sh=!1;
function th(a,b){b=void 0===b?{}:b;var c=kh(a),d=N("web_ajax_ignore_global_headers_if_set"),e;for(e in qh){var f=F(qh[e]);!f||!c&&gc(a)||d&&void 0!==b[e]||(b[e]=f)}if(c||!gc(a))b["X-YouTube-Utc-Offset"]=String(-(new Date).getTimezoneOffset());if(c||!gc(a)){try{var g=(new Intl.DateTimeFormat).resolvedOptions().timeZone}catch(h){}g&&(b["X-YouTube-Time-Zone"]=g)}if(c||!gc(a))b["X-YouTube-Ad-Signals"]=gh(lh(void 0));return b}
function uh(a){var b=window.location.search,c=gc(a);N("debug_handle_relative_url_for_query_forward_killswitch")||c||!kh(a)||(c=document.location.hostname);var d=fc(a.match(ec)[5]||null);d=(c=c&&(c.endsWith("youtube.com")||c.endsWith("youtube-nocookie.com")))&&d&&d.startsWith("/api/");if(!c||d)return a;var e=hh(b),f={};E(rh,function(g){e[g]&&(f[g]=e[g])});
return jh(a,f||{},!1)}
function vh(a,b){var c=b.format||"JSON";a=wh(a,b);var d=xh(a,b),e=!1,f=yh(a,function(k){if(!e){e=!0;h&&Mg(h);var l=ph(k),n=null,p=400<=k.status&&500>k.status,r=500<=k.status&&600>k.status;if(l||p||r)n=zh(a,c,k,b.convertToSafeHtml);if(l)a:if(k&&204==k.status)l=!0;else{switch(c){case "XML":l=0==parseInt(n&&n.return_code,10);break a;case "RAW":l=!0;break a}l=!!n}n=n||{};p=b.context||y;l?b.onSuccess&&b.onSuccess.call(p,k,n):b.onError&&b.onError.call(p,k,n);b.onFinish&&b.onFinish.call(p,k,n)}},b.method,
d,b.headers,b.responseType,b.withCredentials);
if(b.onTimeout&&0<b.timeout){var g=b.onTimeout;var h=Lg(function(){e||(e=!0,f.abort(),Mg(h),g.call(b.context||y,f))},b.timeout)}return f}
function wh(a,b){b.includeDomain&&(a=document.location.protocol+"//"+document.location.hostname+(document.location.port?":"+document.location.port:"")+a);var c=F("XSRF_FIELD_NAME",void 0);if(b=b.urlParams)b[c]&&delete b[c],a=jh(a,b||{},!0);return a}
function xh(a,b){var c=F("XSRF_FIELD_NAME",void 0),d=F("XSRF_TOKEN",void 0),e=b.postBody||"",f=b.postParams,g=F("XSRF_FIELD_NAME",void 0),h;b.headers&&(h=b.headers["Content-Type"]);b.excludeXsrf||gc(a)&&!b.withCredentials&&gc(a)!=document.location.hostname||"POST"!=b.method||h&&"application/x-www-form-urlencoded"!=h||b.postParams&&b.postParams[g]||(f||(f={}),f[c]=d);f&&"string"===typeof e&&(e=hh(e),qb(e,f),e=b.postBodyFormat&&"JSON"==b.postBodyFormat?JSON.stringify(e):ic(e));f=e||f&&!jb(f);!sh&&f&&
"POST"!=b.method&&(sh=!0,sg(Error("AJAX request with postData should use POST")));return e}
function zh(a,b,c,d){var e=null;switch(b){case "JSON":try{var f=c.responseText}catch(g){throw d=Error("Error reading responseText"),d.params=a,tg(d),g;}a=c.getResponseHeader("Content-Type")||"";f&&0<=a.indexOf("json")&&(")]}'\n"===f.substring(0,5)&&(f=f.substring(5)),e=JSON.parse(f));break;case "XML":if(a=(a=c.responseXML)?Ah(a):null)e={},E(a.getElementsByTagName("*"),function(g){e[g.tagName]=Bh(g)})}d&&Ch(e);
return e}
function Ch(a){if(La(a))for(var b in a){var c;(c="html_content"==b)||(c=b.length-5,c=0<=c&&b.indexOf("_html",c)==c);if(c){c=b;vb("HTML that is escaped and sanitized server-side and passed through yt.net.ajax");var d=Yb(a[b],null);a[c]=d}else Ch(a[b])}}
function Ah(a){return a?(a=("responseXML"in a?a.responseXML:a).getElementsByTagName("root"))&&0<a.length?a[0]:null:null}
function Bh(a){var b="";E(a.childNodes,function(c){b+=c.nodeValue});
return b}
function yh(a,b,c,d,e,f,g){function h(){4==(k&&"readyState"in k?k.readyState:0)&&b&&rg(b)(k)}
c=void 0===c?"GET":c;d=void 0===d?"":d;var k=oh();if(!k)return null;"onloadend"in k?k.addEventListener("loadend",h,!1):k.onreadystatechange=h;N("debug_forward_web_query_parameters")&&(a=uh(a));k.open(c,a,!0);f&&(k.responseType=f);g&&(k.withCredentials=!0);c="POST"==c&&(void 0===window.FormData||!(d instanceof FormData));if(e=th(a,e))for(var l in e)k.setRequestHeader(l,e[l]),"content-type"==l.toLowerCase()&&(c=!1);c&&k.setRequestHeader("Content-Type","application/x-www-form-urlencoded");k.send(d);
return k}
;var Dh=Dc||Ec;function Eh(a){var b=Sb;return b?0<=b.toLowerCase().indexOf(a):!1}
;var Fh={},Gh=0;
function Hh(a,b,c,d,e){e=void 0===e?"":e;if(a)if(c&&!Eh("cobalt")){if(a){a instanceof Kb||(a="object"==typeof a&&a.ba?a.aa():String(a),Qb.test(a)?a=new Kb(a,Lb):(a=String(a),a=a.replace(/(%0A|%0D)/g,""),a=(b=a.match(Pb))&&Ob.test(b[1])?new Kb(a,Lb):null));b=Mb(a||Rb);if("about:invalid#zClosurez"===b||b.startsWith("data"))a="";else{if(b instanceof Xb)a=b;else{var f="object"==typeof b;a=null;f&&b.Ma&&(a=b.Ia());b=f&&b.ba?b.aa():String(b);Jb.test(b)&&(-1!=b.indexOf("&")&&(b=b.replace(Db,"&amp;")),-1!=
b.indexOf("<")&&(b=b.replace(Eb,"&lt;")),-1!=b.indexOf(">")&&(b=b.replace(Fb,"&gt;")),-1!=b.indexOf('"')&&(b=b.replace(Gb,"&quot;")),-1!=b.indexOf("'")&&(b=b.replace(Hb,"&#39;")),-1!=b.indexOf("\x00")&&(b=b.replace(Ib,"&#0;")));a=Yb(b,a)}a instanceof Xb&&a.constructor===Xb?a=a.h:(Ja(a),a="type_error:SafeHtml");a=encodeURIComponent(String(rf(a.toString())))}/^[\s\xa0]*$/.test(a)||(a=vd("IFRAME",{src:'javascript:"<body><img src=\\""+'+a+'+"\\"></body>"',style:"display:none"}),(9==a.nodeType?a:a.ownerDocument||
a.document).body.appendChild(a))}}else if(e)yh(a,b,"POST",e,d);else if(F("USE_NET_AJAX_FOR_PING_TRANSPORT",!1)||d)yh(a,b,"GET","",d);else{b:{try{var g=new Xa({url:a});if(g.j&&g.i||g.l){var h=fc(a.match(ec)[5]||null),k;if(!(k=!h||!h.endsWith("/aclk"))){var l=a.search(kc);d:{for(c=0;0<=(c=a.indexOf("ri",c))&&c<l;){var n=a.charCodeAt(c-1);if(38==n||63==n){var p=a.charCodeAt(c+2);if(!p||61==p||38==p||35==p){var r=c;break d}}c+=3}r=-1}if(0>r)var q=null;else{var z=a.indexOf("&",r);if(0>z||z>l)z=l;r+=3;
q=decodeURIComponent(a.substr(r,z-r).replace(/\+/g," "))}k="1"!==q}f=!k;break b}}catch(B){}f=!1}f?Ih(a)?(b&&b(),f=!0):f=!1:f=!1;f||Jh(a,b)}}
function Kh(a,b,c){c=void 0===c?"":c;Ih(a,c)?b&&b():Hh(a,b,void 0,void 0,c)}
function Ih(a,b){try{if(window.navigator&&window.navigator.sendBeacon&&window.navigator.sendBeacon(a,void 0===b?"":b))return!0}catch(c){}return!1}
function Jh(a,b){var c=new Image,d=""+Gh++;Fh[d]=c;c.onload=c.onerror=function(){b&&Fh[d]&&b();delete Fh[d]};
c.src=a}
;var Lh=y.ytPubsubPubsubInstance||new L,Mh=y.ytPubsubPubsubSubscribedKeys||{},Nh=y.ytPubsubPubsubTopicToKeys||{},Oh=y.ytPubsubPubsubIsSynchronous||{};function Ph(a,b){var c=Qh();if(c&&b){var d=c.subscribe(a,function(){var e=arguments;var f=function(){Mh[d]&&b.apply&&"function"==typeof b.apply&&b.apply(window,e)};
try{Oh[a]?f():Lg(f,0)}catch(g){sg(g)}},void 0);
Mh[d]=!0;Nh[a]||(Nh[a]=[]);Nh[a].push(d);return d}return 0}
function Rh(a){var b=Qh();b&&("number"===typeof a?a=[a]:"string"===typeof a&&(a=[parseInt(a,10)]),E(a,function(c){b.unsubscribeByKey(c);delete Mh[c]}))}
function Sh(a,b){var c=Qh();c&&c.publish.apply(c,arguments)}
function Th(a){var b=Qh();if(b)if(b.clear(a),a)Uh(a);else for(var c in Nh)Uh(c)}
function Qh(){return y.ytPubsubPubsubInstance}
function Uh(a){Nh[a]&&(a=Nh[a],E(a,function(b){Mh[b]&&delete Mh[b]}),a.length=0)}
L.prototype.subscribe=L.prototype.subscribe;L.prototype.unsubscribeByKey=L.prototype.na;L.prototype.publish=L.prototype.ga;L.prototype.clear=L.prototype.clear;A("ytPubsubPubsubInstance",Lh,void 0);A("ytPubsubPubsubTopicToKeys",Nh,void 0);A("ytPubsubPubsubIsSynchronous",Oh,void 0);A("ytPubsubPubsubSubscribedKeys",Mh,void 0);var Vh=window,O=Vh.ytcsi&&Vh.ytcsi.now?Vh.ytcsi.now:Vh.performance&&Vh.performance.timing&&Vh.performance.now&&Vh.performance.timing.navigationStart?function(){return Vh.performance.timing.navigationStart+Vh.performance.now()}:function(){return(new Date).getTime()};var Wh=xg("initial_gel_batch_timeout",2E3),Xh=Math.pow(2,16)-1,Yh=void 0,Zh=0,$h=0,ai=0,bi=!0,ci=y.ytLoggingTransportGELQueue_||new Map;A("ytLoggingTransportGELQueue_",ci,void 0);var di=y.ytLoggingTransportTokensToCttTargetIds_||{};A("ytLoggingTransportTokensToCttTargetIds_",di,void 0);
function ei(a,b){if("log_event"===a.endpoint){var c="";a.xa?c="visitorOnlyApprovedKey":a.cttAuthInfo&&(di[a.cttAuthInfo.token]=fi(a.cttAuthInfo),c=a.cttAuthInfo.token);var d=ci.get(c)||[];ci.set(c,d);d.push(a.payload);b&&(Yh=new b);a=xg("tvhtml5_logging_max_batch")||xg("web_logging_max_batch")||100;b=O();d.length>=a?gi({writeThenSend:!0},N("flush_only_full_queue")?c:void 0):10<=b-ai&&(hi(),ai=b)}}
function ii(a,b){if("log_event"===a.endpoint){var c="";a.xa?c="visitorOnlyApprovedKey":a.cttAuthInfo&&(di[a.cttAuthInfo.token]=fi(a.cttAuthInfo),c=a.cttAuthInfo.token);var d=new Map;d.set(c,[a.payload]);b&&(Yh=new b);return new yf(function(e){Yh&&Yh.isReady()?ji(d,e,{bypassNetworkless:!0},!0):e()})}}
function gi(a,b){a=void 0===a?{}:a;new yf(function(c){Mg(Zh);Mg($h);$h=0;if(Yh&&Yh.isReady())if(void 0!==b){var d=new Map,e=ci.get(b)||[];d.set(b,e);ji(d,c,a);ci.delete(b)}else ji(ci,c,a),ci.clear();else hi(),c()})}
function hi(){N("web_gel_timeout_cap")&&!$h&&($h=Lg(function(){gi({writeThenSend:!0})},6E4));
Mg(Zh);var a=F("LOGGING_BATCH_TIMEOUT",xg("web_gel_debounce_ms",1E4));N("shorten_initial_gel_batch_timeout")&&bi&&(a=Wh);Zh=Lg(function(){gi({writeThenSend:!0})},a)}
function ji(a,b,c,d){var e=Yh;c=void 0===c?{}:c;var f=Math.round(O()),g=a.size;a=u(a);for(var h=a.next();!h.done;h=a.next()){var k=u(h.value);h=k.next().value;var l=k=k.next().value;k=ob({context:ki(e.config_||li())});k.events=l;(l=di[h])&&mi(k,h,l);delete di[h];h="visitorOnlyApprovedKey"===h;ni(k,f,h);N("always_send_and_write")&&(c.writeThenSend=!1);N("send_beacon_before_gel")&&window.navigator&&window.navigator.sendBeacon&&!c.writeThenSend&&Kh("/generate_204");oi(e,"log_event",k,{retry:!0,onSuccess:function(){g--;
g||b()},
onError:function(){g--;g||b()},
ib:c,xa:h,Km:!!d});bi=!1}}
function ni(a,b,c){a.requestTimeMs=String(b);N("unsplit_gel_payloads_in_logs")&&(a.unsplitGelPayloadsInLogs=!0);!c&&(b=F("EVENT_ID",void 0))&&((c=F("BATCH_CLIENT_COUNTER",void 0)||0)||(c=Math.floor(Math.random()*Xh/2)),c++,c>Xh&&(c=1),M("BATCH_CLIENT_COUNTER",c),a.serializedClientEventId={serializedEventId:b,clientCounter:String(c)})}
function mi(a,b,c){if(c.videoId)var d="VIDEO";else if(c.playlistId)d="PLAYLIST";else return;a.credentialTransferTokenTargetId=c;a.context=a.context||{};a.context.user=a.context.user||{};a.context.user.credentialTransferTokens=[{token:b,scope:d}]}
function fi(a){var b={};a.videoId?b.videoId=a.videoId:a.playlistId&&(b.playlistId=a.playlistId);return b}
;var pi=y.ytLoggingGelSequenceIdObj_||{};A("ytLoggingGelSequenceIdObj_",pi,void 0);
function qi(a,b,c,d){d=void 0===d?{}:d;if(N("lr_drop_other_and_business_payloads")){if(zg[a]||yg[a])return}else if(N("lr_drop_other_payloads")&&zg[a])return;var e={},f=Math.round(d.timestamp||O());e.eventTimeMs=f<Number.MAX_SAFE_INTEGER?f:0;e[a]=b;a=Yg();e.context={lastActivityMs:String(d.timestamp||!isFinite(a)?-1:a)};N("log_sequence_info_on_gel_web")&&d.ea&&(a=e.context,b=d.ea,pi[b]=b in pi?pi[b]+1:0,a.sequence={index:pi[b],groupKey:b},d.yb&&delete pi[d.ea]);(d.Tm?ii:ei)({endpoint:"log_event",payload:e,
cttAuthInfo:d.cttAuthInfo,xa:d.xa},c)}
;function ri(){if(!y.matchMedia)return"WEB_DISPLAY_MODE_UNKNOWN";try{return y.matchMedia("(display-mode: standalone)").matches?"WEB_DISPLAY_MODE_STANDALONE":y.matchMedia("(display-mode: minimal-ui)").matches?"WEB_DISPLAY_MODE_MINIMAL_UI":y.matchMedia("(display-mode: fullscreen)").matches?"WEB_DISPLAY_MODE_FULLSCREEN":y.matchMedia("(display-mode: browser)").matches?"WEB_DISPLAY_MODE_BROWSER":"WEB_DISPLAY_MODE_UNKNOWN"}catch(a){return"WEB_DISPLAY_MODE_UNKNOWN"}}
;function si(a,b,c,d,e){Od.set(""+a,b,{Pa:c,path:"/",domain:void 0===d?"youtube.com":d,secure:void 0===e?!1:e})}
;var ti=C("ytglobal.prefsUserPrefsPrefs_")||{};A("ytglobal.prefsUserPrefsPrefs_",ti,void 0);function ui(){this.h=F("ALT_PREF_COOKIE_NAME","PREF");this.i=F("ALT_PREF_COOKIE_DOMAIN","youtube.com");var a=Od.get(""+this.h,void 0);if(a){a=decodeURIComponent(a).split("&");for(var b=0;b<a.length;b++){var c=a[b].split("="),d=c[0];(c=c[1])&&(ti[d]=c.toString())}}}
ui.prototype.get=function(a,b){vi(a);wi(a);a=void 0!==ti[a]?ti[a].toString():null;return null!=a?a:b?b:""};
ui.prototype.set=function(a,b){vi(a);wi(a);if(null==b)throw Error("ExpectedNotNull");ti[a]=b.toString()};
ui.prototype.remove=function(a){vi(a);wi(a);delete ti[a]};
ui.prototype.clear=function(){for(var a in ti)delete ti[a]};
function wi(a){if(/^f([1-9][0-9]*)$/.test(a))throw Error("ExpectedRegexMatch: "+a);}
function vi(a){if(!/^\w+$/.test(a))throw Error("ExpectedRegexMismatch: "+a);}
function xi(a){a=void 0!==ti[a]?ti[a].toString():null;return null!=a&&/^[A-Fa-f0-9]+$/.test(a)?parseInt(a,16):null}
Ia(ui);var yi={bluetooth:"CONN_DISCO",cellular:"CONN_CELLULAR_UNKNOWN",ethernet:"CONN_WIFI",none:"CONN_NONE",wifi:"CONN_WIFI",wimax:"CONN_CELLULAR_4G",other:"CONN_UNKNOWN",unknown:"CONN_UNKNOWN","slow-2g":"CONN_CELLULAR_2G","2g":"CONN_CELLULAR_2G","3g":"CONN_CELLULAR_3G","4g":"CONN_CELLULAR_4G"},zi={"slow-2g":"EFFECTIVE_CONNECTION_TYPE_SLOW_2G","2g":"EFFECTIVE_CONNECTION_TYPE_2G","3g":"EFFECTIVE_CONNECTION_TYPE_3G","4g":"EFFECTIVE_CONNECTION_TYPE_4G"};
function Ai(){var a=y.navigator;return a?a.connection:void 0}
;function Bi(){return"INNERTUBE_API_KEY"in ng&&"INNERTUBE_API_VERSION"in ng}
function li(){return{innertubeApiKey:F("INNERTUBE_API_KEY",void 0),innertubeApiVersion:F("INNERTUBE_API_VERSION",void 0),Ab:F("INNERTUBE_CONTEXT_CLIENT_CONFIG_INFO"),Bb:F("INNERTUBE_CONTEXT_CLIENT_NAME","WEB"),innertubeContextClientVersion:F("INNERTUBE_CONTEXT_CLIENT_VERSION",void 0),Db:F("INNERTUBE_CONTEXT_HL",void 0),Cb:F("INNERTUBE_CONTEXT_GL",void 0),Eb:F("INNERTUBE_HOST_OVERRIDE",void 0)||"",Gb:!!F("INNERTUBE_USE_THIRD_PARTY_AUTH",!1),Fb:!!F("INNERTUBE_OMIT_API_KEY_WHEN_AUTH_HEADER_IS_PRESENT",
!1),appInstallData:F("SERIALIZED_CLIENT_CONFIG_DATA",void 0)}}
function ki(a){var b={client:{hl:a.Db,gl:a.Cb,clientName:a.Bb,clientVersion:a.innertubeContextClientVersion,configInfo:a.Ab}};navigator.userAgent&&(b.client.userAgent=String(navigator.userAgent));var c=y.devicePixelRatio;c&&1!=c&&(b.client.screenDensityFloat=String(c));c=F("EXPERIMENTS_TOKEN","");""!==c&&(b.client.experimentsToken=c);c=[];var d=F("EXPERIMENTS_FORCED_FLAGS",{});for(e in d)c.push({key:e,value:String(d[e])});var e=F("EXPERIMENT_FLAGS",{});for(var f in e)f.startsWith("force_")&&void 0===
d[f]&&c.push({key:f,value:String(e[f])});0<c.length&&(b.request={internalExperimentFlags:c});f=b.client.clientName;if("WEB"===f||"MWEB"===f||1===f||2===f){var g;b.client.mainAppWebInfo=null!=(g=b.client.mainAppWebInfo)?g:{};b.client.mainAppWebInfo.webDisplayMode=ri()}else if(g=b.client.clientName,("WEB_REMIX"===g||76===g)&&!N("music_web_display_mode_killswitch")){var h;b.client.hb=null!=(h=b.client.hb)?h:{};b.client.hb.webDisplayMode=ri()}a.appInstallData&&(b.client.configInfo=b.client.configInfo||
{},b.client.configInfo.appInstallData=a.appInstallData);F("DELEGATED_SESSION_ID")&&!N("pageid_as_header_web")&&(b.user={onBehalfOfUser:F("DELEGATED_SESSION_ID")});a:{if(h=Ai()){a=yi[h.type||"unknown"]||"CONN_UNKNOWN";h=yi[h.effectiveType||"unknown"]||"CONN_UNKNOWN";"CONN_CELLULAR_UNKNOWN"===a&&"CONN_UNKNOWN"!==h&&(a=h);if("CONN_UNKNOWN"!==a)break a;if("CONN_UNKNOWN"!==h){a=h;break a}}a=void 0}a&&(b.client.connectionType=a);N("web_log_effective_connection_type")&&(a=Ai(),a=null!==a&&void 0!==a&&a.effectiveType?
zi.hasOwnProperty(a.effectiveType)?zi[a.effectiveType]:"EFFECTIVE_CONNECTION_TYPE_UNKNOWN":void 0,a&&(b.client.effectiveConnectionType=a));a=Object;h=a.assign;g=b.client;f={};e=u(Object.entries(hh(F("DEVICE",""))));for(c=e.next();!c.done;c=e.next())d=u(c.value),c=d.next().value,d=d.next().value,"cbrand"===c?f.deviceMake=d:"cmodel"===c?f.deviceModel=d:"cbr"===c?f.browserName=d:"cbrver"===c?f.browserVersion=d:"cos"===c?f.osName=d:"cosver"===c?f.osVersion=d:"cplatform"===c&&(f.platform=d);b.client=h.call(a,
g,f);return b}
function Ci(a,b,c){c=void 0===c?{}:c;var d={"X-Goog-Visitor-Id":c.visitorData||F("VISITOR_DATA","")};if(b&&b.includes("www.youtube-nocookie.com"))return d;(b=c.Im||F("AUTHORIZATION"))||(a?b="Bearer "+C("gapi.auth.getToken")().Hm:b=Sd([]));b&&(d.Authorization=b,d["X-Goog-AuthUser"]=F("SESSION_INDEX",0),N("pageid_as_header_web")&&(d["X-Goog-PageId"]=F("DELEGATED_SESSION_ID")));return d}
;function Di(a){a=Object.assign({},a);delete a.Authorization;var b=Sd();if(b){var c=new We;c.update(F("INNERTUBE_API_KEY",void 0));c.update(b);a.hash=Ic(c.digest(),3)}return a}
;function Ei(a){var b=new ag;(b=b.isAvailable()?a?new gg(b,a):b:null)||(a=new bg(a||"UserDataSharedStore"),b=a.isAvailable()?a:null);this.h=(a=b)?new Xf(a):null;this.i=document.domain||window.location.hostname}
Ei.prototype.set=function(a,b,c,d){c=c||31104E3;this.remove(a);if(this.h)try{this.h.set(a,b,Date.now()+1E3*c);return}catch(f){}var e="";if(d)try{e=escape(rf(b))}catch(f){return}else e=escape(b);si(a,e,c,this.i)};
Ei.prototype.get=function(a,b){var c=void 0,d=!this.h;if(!d)try{c=this.h.get(a)}catch(e){d=!0}if(d&&(c=Od.get(""+a,void 0))&&(c=unescape(c),b))try{c=JSON.parse(c)}catch(e){this.remove(a),c=void 0}return c};
Ei.prototype.remove=function(a){this.h&&this.h.remove(a);var b=this.i;Od.remove(""+a,"/",void 0===b?"youtube.com":b)};var Fi;function Gi(){Fi||(Fi=new Ei("yt.innertube"));return Fi}
function Hi(a,b,c,d){if(d)return null;d=Gi().get("nextId",!0)||1;var e=Gi().get("requests",!0)||{};e[d]={method:a,request:b,authState:Di(c),requestTime:Math.round(O())};Gi().set("nextId",d+1,86400,!0);Gi().set("requests",e,86400,!0);return d}
function Ii(a){var b=Gi().get("requests",!0)||{};delete b[a];Gi().set("requests",b,86400,!0)}
function Ji(a){var b=Gi().get("requests",!0);if(b){for(var c in b){var d=b[c];if(!(6E4>Math.round(O())-d.requestTime)){var e=d.authState,f=Di(Ci(!1));mb(e,f)&&(e=d.request,"requestTimeMs"in e&&(e.requestTimeMs=Math.round(O())),oi(a,d.method,e,{}));delete b[c]}}Gi().set("requests",b,86400,!0)}}
;var Ki=function(){var a;return function(){a||(a=new Ei("ytidb"));return a}}();
function Li(){var a;return null===(a=Ki())||void 0===a?void 0:a.get("LAST_RESULT_ENTRY_KEY",!0)}
;var Mi=[],Ni=!1;function Oi(a){Ni||(Mi.push({type:"ERROR",payload:a}),10<Mi.length&&Mi.shift())}
function Pi(a,b){Ni||(Mi.push({type:"EVENT",eventType:a,payload:b}),10<Mi.length&&Mi.shift())}
;function Qi(a,b){for(var c=[],d=1;d<arguments.length;++d)c[d-1]=arguments[d];d=Error.call(this,a);this.message=d.message;"stack"in d&&(this.stack=d.stack);this.args=[].concat(fa(c))}
v(Qi,Error);function Ri(){try{return Si(),!0}catch(a){return!1}}
function Si(){if(void 0!==F("DATASYNC_ID",void 0))return F("DATASYNC_ID",void 0);throw new Qi("Datasync ID not set","unknown");}
;function Ti(a){if(0<=a.indexOf(":"))throw Error("Database name cannot contain ':'");}
function Ui(a){return a.substr(0,a.indexOf(":"))||a}
;var Vi={},Wi=(Vi.AUTH_INVALID="No user identifier specified.",Vi.EXPLICIT_ABORT="Transaction was explicitly aborted.",Vi.IDB_NOT_SUPPORTED="IndexedDB is not supported.",Vi.MISSING_INDEX="Index not created.",Vi.MISSING_OBJECT_STORE="Object store not created.",Vi.DB_DELETED_BY_MISSING_OBJECT_STORE="Database is deleted because an expected object store was not created.",Vi.UNKNOWN_ABORT="Transaction was aborted for unknown reasons.",Vi.QUOTA_EXCEEDED="The current transaction exceeded its quota limitations.",
Vi.QUOTA_MAYBE_EXCEEDED="The current transaction may have failed because of exceeding quota limitations.",Vi.EXECUTE_TRANSACTION_ON_CLOSED_DB="Can't start a transaction on a closed database",Vi.INCOMPATIBLE_DB_VERSION="The binary is incompatible with the database version",Vi),Xi={},Yi=(Xi.AUTH_INVALID="ERROR",Xi.EXECUTE_TRANSACTION_ON_CLOSED_DB="WARNING",Xi.EXPLICIT_ABORT="IGNORED",Xi.IDB_NOT_SUPPORTED="ERROR",Xi.MISSING_INDEX="WARNING",Xi.MISSING_OBJECT_STORE="ERROR",Xi.DB_DELETED_BY_MISSING_OBJECT_STORE=
"WARNING",Xi.QUOTA_EXCEEDED="WARNING",Xi.QUOTA_MAYBE_EXCEEDED="WARNING",Xi.UNKNOWN_ABORT="WARNING",Xi.INCOMPATIBLE_DB_VERSION="WARNING",Xi),Zi={},$i=(Zi.AUTH_INVALID=!1,Zi.EXECUTE_TRANSACTION_ON_CLOSED_DB=!1,Zi.EXPLICIT_ABORT=!1,Zi.IDB_NOT_SUPPORTED=!1,Zi.MISSING_INDEX=!1,Zi.MISSING_OBJECT_STORE=!1,Zi.DB_DELETED_BY_MISSING_OBJECT_STORE=!1,Zi.QUOTA_EXCEEDED=!1,Zi.QUOTA_MAYBE_EXCEEDED=!0,Zi.UNKNOWN_ABORT=!0,Zi.INCOMPATIBLE_DB_VERSION=!1,Zi);
function Q(a,b,c,d,e){b=void 0===b?{}:b;c=void 0===c?Wi[a]:c;d=void 0===d?Yi[a]:d;e=void 0===e?$i[a]:e;Qi.call(this,c,Object.assign({name:"YtIdbKnownError",isSw:void 0===self.document,isIframe:self!==self.top,type:a},b));this.type=a;this.message=c;this.level=d;this.h=e;Object.setPrototypeOf(this,Q.prototype)}
v(Q,Qi);function aj(a){Q.call(this,"MISSING_OBJECT_STORE",{Jb:a},Wi.MISSING_OBJECT_STORE);Object.setPrototypeOf(this,aj.prototype)}
v(aj,Q);function bj(a,b){var c=Error.call(this);this.message=c.message;"stack"in c&&(this.stack=c.stack);this.index=a;this.objectStore=b;Object.setPrototypeOf(this,bj.prototype)}
v(bj,Error);var cj=["The database connection is closing","Can't start a transaction on a closed database","A mutation operation was attempted on a database that did not allow mutations"];
function dj(a,b,c,d){b=Ui(b);var e=a instanceof Error?a:Error("Unexpected error: "+a);if(e instanceof Q)return e;a={objectStoreNames:c,dbName:b,dbVersion:d};if("QuotaExceededError"===e.name)return new Q("QUOTA_EXCEEDED",a);if(Fc&&"UnknownError"===e.name)return new Q("QUOTA_MAYBE_EXCEEDED",a);if(e instanceof bj)return new Q("MISSING_INDEX",Object.assign(Object.assign({},a),{objectStore:e.objectStore,index:e.index}));if("InvalidStateError"===e.name&&cj.some(function(f){return e.message.includes(f)}))return new Q("EXECUTE_TRANSACTION_ON_CLOSED_DB",
a);
if("AbortError"===e.name)return new Q("UNKNOWN_ABORT",a,e.message);e.args=[Object.assign(Object.assign({},a),{name:"IdbError",Pm:e.name})];e.level="WARNING";return e}
function ej(a,b,c){var d=Li();return new Q("IDB_NOT_SUPPORTED",{context:{caller:a,publicName:b,version:c,hasSucceededOnce:null===d||void 0===d?void 0:d.hasSucceededOnce}})}
;function fj(a){if(!a)throw Error();throw a;}
function gj(a){return a}
function hj(a){this.h=a}
function S(a){function b(e){if("PENDING"===d.state.status){d.state={status:"REJECTED",reason:e};e=u(d.onRejected);for(var f=e.next();!f.done;f=e.next())f=f.value,f()}}
function c(e){if("PENDING"===d.state.status){d.state={status:"FULFILLED",value:e};e=u(d.h);for(var f=e.next();!f.done;f=e.next())f=f.value,f()}}
var d=this;this.state={status:"PENDING"};this.h=[];this.onRejected=[];a=a.h;try{a(c,b)}catch(e){b(e)}}
S.all=function(a){return new S(new hj(function(b,c){var d=[],e=a.length;0===e&&b(d);for(var f={ia:0};f.ia<a.length;f={ia:f.ia},++f.ia)ij(S.resolve(a[f.ia]).then(function(g){return function(h){d[g.ia]=h;e--;0===e&&b(d)}}(f)),function(g){c(g)})}))};
S.resolve=function(a){return new S(new hj(function(b,c){a instanceof S?a.then(b,c):b(a)}))};
S.reject=function(a){return new S(new hj(function(b,c){c(a)}))};
S.prototype.then=function(a,b){var c=this,d=null!==a&&void 0!==a?a:gj,e=null!==b&&void 0!==b?b:fj;return new S(new hj(function(f,g){"PENDING"===c.state.status?(c.h.push(function(){jj(c,c,d,f,g)}),c.onRejected.push(function(){kj(c,c,e,f,g)})):"FULFILLED"===c.state.status?jj(c,c,d,f,g):"REJECTED"===c.state.status&&kj(c,c,e,f,g)}))};
function ij(a,b){a.then(void 0,b)}
function jj(a,b,c,d,e){try{if("FULFILLED"!==a.state.status)throw Error("calling handleResolve before the promise is fulfilled.");var f=c(a.state.value);f instanceof S?lj(a,b,f,d,e):d(f)}catch(g){e(g)}}
function kj(a,b,c,d,e){try{if("REJECTED"!==a.state.status)throw Error("calling handleReject before the promise is rejected.");var f=c(a.state.reason);f instanceof S?lj(a,b,f,d,e):d(f)}catch(g){e(g)}}
function lj(a,b,c,d,e){b===c?e(new TypeError("Circular promise chain detected.")):c.then(function(f){f instanceof S?lj(a,b,f,d,e):d(f)},function(f){e(f)})}
;function mj(a,b,c){function d(){c(a.error);f()}
function e(){b(a.result);f()}
function f(){try{a.removeEventListener("success",e),a.removeEventListener("error",d)}catch(g){}}
a.addEventListener("success",e);a.addEventListener("error",d)}
function nj(a){return new Promise(function(b,c){mj(a,b,c)})}
function T(a){return new S(new hj(function(b,c){mj(a,b,c)}))}
;function oj(a,b){return new S(new hj(function(c,d){function e(){var f=a?b(a):null;f?f.then(function(g){a=g;e()},d):c()}
e()}))}
;function pj(a,b){this.h=a;this.options=b;this.transactionCount=0;this.j=Math.round(O());this.i=!1}
m=pj.prototype;m.add=function(a,b,c){return qj(this,[a],{mode:"readwrite",L:!0},function(d){return d.objectStore(a).add(b,c)})};
m.clear=function(a){return qj(this,[a],{mode:"readwrite",L:!0},function(b){return b.objectStore(a).clear()})};
m.close=function(){var a;this.h.close();(null===(a=this.options)||void 0===a?0:a.closed)&&this.options.closed()};
m.count=function(a,b){return qj(this,[a],{mode:"readonly",L:!0},function(c){return c.objectStore(a).count(b)})};
function rj(a,b,c){a=a.h.createObjectStore(b,c);return new sj(a)}
m.delete=function(a,b){return qj(this,[a],{mode:"readwrite",L:!0},function(c){return c.objectStore(a).delete(b)})};
m.get=function(a,b){return qj(this,[a],{mode:"readonly",L:!0},function(c){return c.objectStore(a).get(b)})};
function tj(a,b){return qj(a,["LogsRequestsStore"],{mode:"readwrite",L:!0},function(c){c=c.objectStore("LogsRequestsStore");return T(c.h.put(b,void 0))})}
m.objectStoreNames=function(){return Array.from(this.h.objectStoreNames)};
function qj(a,b,c,d){return I(a,function f(){var g=this,h,k,l,n,p,r,q,z,B,G,R,P;return x(f,function(K){switch(K.h){case 1:var ha={mode:"readonly",L:!1,tag:"IDB_TRANSACTION_TAG_UNKNOWN"};"string"===typeof c?ha.mode=c:Object.assign(ha,c);h=ha;g.transactionCount++;k=h.L?3:1;l=0;case 2:if(n){K.u(3);break}l++;p=Math.round(O());sa(K,4);r=g.h.transaction(b,h.mode);ha=new uj(r);ha=vj(ha,d);return w(K,ha,6);case 6:return q=K.i,z=Math.round(O()),wj(g,p,z,l,void 0,b.join(),h),K.return(q);case 4:B=ta(K);G=Math.round(O());
R=dj(B,g.h.name,b.join(),g.h.version);if((P=R instanceof Q&&!R.h)||l>=k)wj(g,p,G,l,R,b.join(),h),n=R;K.u(2);break;case 3:return K.return(Promise.reject(n))}})})}
function wj(a,b,c,d,e,f,g){b=c-b;e?(e instanceof Q&&("QUOTA_EXCEEDED"===e.type||"QUOTA_MAYBE_EXCEEDED"===e.type)&&Pi("QUOTA_EXCEEDED",{dbName:Ui(a.h.name),objectStoreNames:f,transactionCount:a.transactionCount,transactionMode:g.mode}),e instanceof Q&&"UNKNOWN_ABORT"===e.type&&(c-=a.j,0>c&&c>=Math.pow(2,31)&&(c=0),Pi("TRANSACTION_UNEXPECTEDLY_ABORTED",{objectStoreNames:f,transactionDuration:b,transactionCount:a.transactionCount,dbDuration:c}),a.i=!0),xj(a,!1,d,f,b,g.tag),Oi(e)):xj(a,!0,d,f,b,g.tag)}
function xj(a,b,c,d,e,f){Pi("TRANSACTION_ENDED",{objectStoreNames:d,connectionHasUnknownAbortedTransaction:a.i,duration:e,isSuccessful:b,tryCount:c,tag:void 0===f?"IDB_TRANSACTION_TAG_UNKNOWN":f})}
m.getName=function(){return this.h.name};
function sj(a){this.h=a}
m=sj.prototype;m.add=function(a,b){return T(this.h.add(a,b))};
m.autoIncrement=function(){return this.h.autoIncrement};
m.clear=function(){return T(this.h.clear()).then(function(){})};
m.count=function(a){return T(this.h.count(a))};
function yj(a,b){return zj(a,{query:b},function(c){return c.delete().then(function(){return c.continue()})}).then(function(){})}
m.delete=function(a){return a instanceof IDBKeyRange?yj(this,a):T(this.h.delete(a))};
m.get=function(a){return T(this.h.get(a))};
m.index=function(a){try{return new Aj(this.h.index(a))}catch(b){if(b instanceof Error&&"NotFoundError"===b.name)throw new bj(a,this.h.name);throw b;}};
m.getName=function(){return this.h.name};
m.keyPath=function(){return this.h.keyPath};
function zj(a,b,c){a=a.h.openCursor(b.query,b.direction);return Bj(a).then(function(d){return oj(d,c)})}
function uj(a){var b=this;this.h=a;this.j=new Map;this.i=!1;this.done=new Promise(function(c,d){b.h.addEventListener("complete",function(){c()});
b.h.addEventListener("error",function(e){e.currentTarget===e.target&&d(b.h.error)});
b.h.addEventListener("abort",function(){var e=b.h.error;if(e)d(e);else if(!b.i){e=Q;for(var f=b.h.objectStoreNames,g=[],h=0;h<f.length;h++){var k=f.item(h);if(null===k)throw Error("Invariant: item in DOMStringList is null");g.push(k)}e=new e("UNKNOWN_ABORT",{objectStoreNames:g.join(),dbName:b.h.db.name,mode:b.h.mode});d(e)}})})}
function vj(a,b){var c=new Promise(function(d,e){try{ij(b(a).then(function(f){d(f)}),e)}catch(f){e(f),a.abort()}});
return Promise.all([c,a.done]).then(function(d){return u(d).next().value})}
uj.prototype.abort=function(){this.h.abort();this.i=!0;throw new Q("EXPLICIT_ABORT");};
uj.prototype.objectStore=function(a){a=this.h.objectStore(a);var b=this.j.get(a);b||(b=new sj(a),this.j.set(a,b));return b};
function Aj(a){this.h=a}
m=Aj.prototype;m.count=function(a){return T(this.h.count(a))};
m.delete=function(a){return Cj(this,{query:a},function(b){return b.delete().then(function(){return b.continue()})})};
m.get=function(a){return T(this.h.get(a))};
m.getKey=function(a){return T(this.h.getKey(a))};
m.keyPath=function(){return this.h.keyPath};
m.unique=function(){return this.h.unique};
function Cj(a,b,c){a=a.h.openCursor(void 0===b.query?null:b.query,void 0===b.direction?"next":b.direction);return Bj(a).then(function(d){return oj(d,c)})}
function Dj(a,b){this.request=a;this.cursor=b}
function Bj(a){return T(a).then(function(b){return b?new Dj(a,b):null})}
m=Dj.prototype;m.advance=function(a){this.cursor.advance(a);return Bj(this.request)};
m.continue=function(a){this.cursor.continue(a);return Bj(this.request)};
m.delete=function(){return T(this.cursor.delete()).then(function(){})};
m.getKey=function(){return this.cursor.key};
m.getValue=function(){return this.cursor.value};
m.update=function(a){return T(this.cursor.update(a))};function Ej(a,b,c){return new Promise(function(d,e){function f(){r||(r=new pj(g.result,{closed:p}));return r}
var g=void 0!==b?self.indexedDB.open(a,b):self.indexedDB.open(a);var h=c.blocked,k=c.blocking,l=c.Yb,n=c.upgrade,p=c.closed,r;g.addEventListener("upgradeneeded",function(q){try{if(null===q.newVersion)throw Error("Invariant: newVersion on IDbVersionChangeEvent is null");if(null===g.transaction)throw Error("Invariant: transaction on IDbOpenDbRequest is null");q.dataLoss&&"none"!==q.dataLoss&&Pi("IDB_DATA_CORRUPTED",{reason:q.dataLossMessage||"unknown reason",dbName:Ui(a)});var z=f(),B=new uj(g.transaction);
n&&n(z,function(G){return q.oldVersion<G&&q.newVersion>=G},B);
B.done.catch(function(G){e(G)})}catch(G){e(G)}});
g.addEventListener("success",function(){var q=g.result;k&&q.addEventListener("versionchange",function(){k(f())});
q.addEventListener("close",function(){Pi("IDB_UNEXPECTEDLY_CLOSED",{dbName:Ui(a),dbVersion:q.version});l&&l()});
d(f())});
g.addEventListener("error",function(){e(g.error)});
h&&g.addEventListener("blocked",function(){h()})})}
function Fj(a,b,c){c=void 0===c?{}:c;return Ej(a,b,c)}
function Gj(a,b){b=void 0===b?{}:b;return I(this,function d(){var e,f,g;return x(d,function(h){e=self.indexedDB.deleteDatabase(a);f=b;(g=f.blocked)&&e.addEventListener("blocked",function(){g()});
return w(h,nj(e),0)})})}
;function Hj(a,b){this.name=a;this.options=b;this.l=!0;this.j=!1}
Hj.prototype.i=function(a,b,c){c=void 0===c?{}:c;return Fj(a,b,c)};
Hj.prototype.delete=function(a){a=void 0===a?{}:a;return Gj(this.name,a)};
function Ij(a,b){return new Q("INCOMPATIBLE_DB_VERSION",{dbName:a.name,oldVersion:a.options.version,newVersion:b})}
function Jj(a,b){if(!b)throw ej("openWithToken",Ui(a.name));return a.open()}
Hj.prototype.open=function(){function a(){return I(c,function g(){var h,k,l,n=this,p,r,q,z,B;return x(g,function(G){switch(G.h){case 1:return l=null!==(h=Error().stack)&&void 0!==h?h:"",sa(G,2),w(G,n.i(n.name,n.options.version,e),4);case 4:p=G.i;a:{var R=n.options;for(var P=u(Object.keys(R.Aa)),K=P.next();!K.done;K=P.next()){K=K.value;var ha=R.Aa[K],Ef=void 0===ha.Pb?Number.MAX_VALUE:ha.Pb;if(p.h.version>=ha.Ha&&!(p.h.version>=Ef)&&!p.h.objectStoreNames.contains(K)){R=K;break a}}R=void 0}r=R;if(void 0===
r){G.u(5);break}if(n.j){G.u(6);break}n.j=!0;return w(G,n.delete(),7);case 7:return Oi(new Q("DB_DELETED_BY_MISSING_OBJECT_STORE",{dbName:n.name,Jb:r})),G.return(a());case 6:throw new aj(r);case 5:return G.return(p);case 2:q=ta(G);if(q instanceof DOMException?"VersionError"!==q.name:"DOMError"in self&&q instanceof DOMError?"VersionError"!==q.name:!(q instanceof Object&&"message"in q)||"An attempt was made to open a database using a lower version than the existing version."!==q.message){G.u(8);break}return w(G,
n.i(n.name,void 0,Object.assign(Object.assign({},e),{upgrade:void 0})),9);case 9:z=G.i;B=z.h.version;if(void 0!==n.options.version&&B>n.options.version+1)throw z.close(),n.l=!1,Ij(n,B);return G.return(z);case 8:throw b(),q instanceof Error&&!N("ytidb_async_stack_killswitch")&&(q.stack=q.stack+"\n"+l.substring(l.indexOf("\n")+1)),dj(q,n.name,"",null!==(k=n.options.version)&&void 0!==k?k:-1);}})})}
function b(){c.h===d&&(c.h=void 0)}
var c=this;if(!this.l)throw Ij(this);if(this.h)return this.h;var d,e={blocking:function(f){f.close()},
closed:b,Yb:b,upgrade:this.options.upgrade};return this.h=d=a()};var Kj=new Hj("YtIdbMeta",{Aa:{databases:{Ha:1}},upgrade:function(a,b){b(1)&&rj(a,"databases",{keyPath:"actualName"})}});
function Lj(a,b){return I(this,function d(){var e;return x(d,function(f){if(1==f.h)return w(f,Jj(Kj,b),2);e=f.i;return f.return(qj(e,["databases"],{L:!0,mode:"readwrite"},function(g){var h=g.objectStore("databases");return h.get(a.actualName).then(function(k){if(k?a.actualName!==k.actualName||a.publicName!==k.publicName||a.userIdentifier!==k.userIdentifier:1)return T(h.h.put(a,void 0)).then(function(){})})}))})})}
function Mj(a,b){return I(this,function d(){var e;return x(d,function(f){if(1==f.h)return a?w(f,Jj(Kj,b),2):f.return();e=f.i;return f.return(e.delete("databases",a))})})}
function Nj(a,b){return I(this,function d(){var e,f;return x(d,function(g){return 1==g.h?(e=[],w(g,Jj(Kj,b),2)):3!=g.h?(f=g.i,w(g,qj(f,["databases"],{L:!0,mode:"readonly"},function(h){e.length=0;return zj(h.objectStore("databases"),{},function(k){a(k.getValue())&&e.push(k.getValue());return k.continue()})}),3)):g.return(e)})})}
function Oj(a){return Nj(function(b){return"LogsDatabaseV2"===b.publicName&&void 0!==b.userIdentifier},a)}
;var Pj,Qj=new function(){}(new function(){});
function Rj(){return I(this,function b(){var c,d,e;return x(b,function(f){switch(f.h){case 1:c=Li();if(null===c||void 0===c?0:c.hasSucceededOnce)return f.return(!0);var g;if(g=Dh)g=/WebKit\/([0-9]+)/.exec(Sb),g=!!(g&&600<=parseInt(g[1],10));g&&(g=/WebKit\/([0-9]+)/.exec(Sb),g=!(g&&602<=parseInt(g[1],10)));if(g||qc)return f.return(!1);try{if(d=self,!(d.indexedDB&&d.IDBIndex&&d.IDBKeyRange&&d.IDBObjectStore))return f.return(!1)}catch(h){return f.return(!1)}if(!("IDBTransaction"in self&&"objectStoreNames"in
IDBTransaction.prototype))return f.return(!1);sa(f,2);e={actualName:"yt-idb-test-do-not-use",publicName:"yt-idb-test-do-not-use",userIdentifier:void 0};return w(f,Lj(e,Qj),4);case 4:return w(f,Mj("yt-idb-test-do-not-use",Qj),5);case 5:return f.return(!0);case 2:return ta(f),f.return(!1)}})})}
function Sj(){if(void 0!==Pj)return Pj;Ni=!0;return Pj=Rj().then(function(a){Ni=!1;var b,c;null!==(b=Ki())&&void 0!==b&&b.h&&(b=Li(),b={hasSucceededOnce:(null===b||void 0===b?void 0:b.hasSucceededOnce)||a},null===(c=Ki())||void 0===c?void 0:c.set("LAST_RESULT_ENTRY_KEY",b,2592E3,!0));return a})}
function Tj(){return Sj().then(function(a){return a?Qj:void 0})}
;new function(){var a=this;this.promise=new Promise(function(b,c){a.resolve=b;a.reject=c})};function Uj(a){if(!Ri())throw a=new Q("AUTH_INVALID",{dbName:a}),Oi(a),a;var b=Si();return{actualName:a+":"+b,publicName:a,userIdentifier:b}}
function Vj(a,b,c,d){var e;return I(this,function g(){var h,k,l,n,p;return x(g,function(r){switch(r.h){case 1:return h=null!==(e=Error().stack)&&void 0!==e?e:"",w(r,Tj(),2);case 2:k=r.i;if(!k)throw l=ej("openDbImpl",a,b),N("ytidb_async_stack_killswitch")||(l.stack=l.stack+"\n"+h.substring(h.indexOf("\n")+1)),Oi(l),l;Ti(a);n=c?{actualName:a,publicName:a,userIdentifier:void 0}:Uj(a);sa(r,3);return w(r,Lj(n,k),5);case 5:return w(r,Fj(n.actualName,b,d),6);case 6:return r.return(r.i);case 3:return p=ta(r),
sa(r,7),w(r,Mj(n.actualName,k),9);case 9:r.h=8;r.m=0;break;case 7:ta(r);case 8:throw p;}})})}
function Wj(a,b,c){c=void 0===c?{}:c;return Vj(a,b,!1,c)}
function Xj(a,b,c){c=void 0===c?{}:c;return Vj(a,b,!0,c)}
function Yj(a,b){b=void 0===b?{}:b;return I(this,function d(){var e,f;return x(d,function(g){if(1==g.h)return w(g,Tj(),2);if(3!=g.h){e=g.i;if(!e)return g.return();Ti(a);f=Uj(a);return w(g,Gj(f.actualName,b),3)}return w(g,Mj(f.actualName,e),0)})})}
function Zj(a,b,c){var d=this;a=a.map(function(e){return I(d,function g(){return x(g,function(h){return 1==h.h?w(h,Gj(e.actualName,b),2):w(h,Mj(e.actualName,c),0)})})});
return Promise.all(a).then(function(){})}
function ak(){var a=void 0===a?{}:a;return I(this,function c(){var d,e;return x(c,function(f){if(1==f.h)return w(f,Tj(),2);if(3!=f.h){d=f.i;if(!d)return f.return();Ti("LogsDatabaseV2");return w(f,Oj(d),3)}e=f.i;return w(f,Zj(e,a,d),0)})})}
function bk(a,b){b=void 0===b?{}:b;return I(this,function d(){var e;return x(d,function(f){if(1==f.h)return w(f,Tj(),2);if(3!=f.h){e=f.i;if(!e)return f.return();Ti(a);return w(f,Gj(a,b),3)}return w(f,Mj(a,e),0)})})}
;function ck(a){var b,c,d,e,f,g,h,k;this.h=!1;this.potentialEsfErrorCounter=this.i=0;this.handleError=function(){};
this.ma=function(){};
this.now=Date.now;this.pb=null!==(b=a.pb)&&void 0!==b?b:100;this.nb=null!==(c=a.nb)&&void 0!==c?c:1;this.lb=null!==(d=a.lb)&&void 0!==d?d:2592E6;this.jb=null!==(e=a.jb)&&void 0!==e?e:12E4;this.mb=null!==(f=a.mb)&&void 0!==f?f:5E3;this.databaseToken=null!==(g=a.databaseToken)&&void 0!==g?g:void 0;this.ya=!!a.ya;this.wa=null!==(h=a.wa)&&void 0!==h?h:.1;this.Ca=null!==(k=a.Ca)&&void 0!==k?k:10;a.handleError&&(this.handleError=a.handleError);a.ma&&(this.ma=a.ma);this.F=a.F;this.O=a.O;this.I=a.I;this.J=
a.J;this.V=a.V;this.Sa=a.Sa;this.Ra=a.Ra;this.databaseToken&&(!this.F||this.F("networkless_logging"))&&dk(this)}
function dk(a){I(a,function c(){var d=this;return x(c,function(e){if(!d.databaseToken)return e.return();ek(d);d.J.H()&&d.qa();d.J.T(d.Sa,d.qa.bind(d));d.J.T(d.Ra,d.Ya.bind(d));d.h=!0;return d.ya&&Math.random()<=d.wa?w(e,d.I.ub(d.databaseToken),0):e.u(0)})})}
m=ck.prototype;m.writeThenSend=function(a,b){var c=this;b=void 0===b?{}:b;if(this.databaseToken&&this.h){var d={url:a,options:b,timestamp:this.now(),status:"NEW",sendCount:0};this.I.set(d,this.databaseToken).then(function(e){d.id=e;c.J.H()&&fk(c,d)}).catch(function(e){fk(c,d);
gk(c,e)})}else this.V(a,b)};
m.sendThenWrite=function(a,b,c){var d=this;b=void 0===b?{}:b;if(this.databaseToken&&this.h){var e={url:a,options:b,timestamp:this.now(),status:"NEW",sendCount:0};this.F&&this.F("nwl_skip_retry")&&(e.skipRetry=c);if(this.J.H()){if(!e.skipRetry){var f=b.onError?b.onError:function(){};
b.onError=function(g,h){return I(d,function l(){var n=this,p;return x(l,function(r){if(1==r.h)return p=n,w(r,n.I.set(e,n.databaseToken).catch(function(q){gk(p,q)}),2);
f(g,h);r.h=0})})}}this.V(a,b,e.skipRetry)}else this.I.set(e,this.databaseToken).catch(function(g){d.V(a,b,e.skipRetry);
gk(d,g)})}else this.V(a,b,this.F&&this.F("nwl_skip_retry")&&c)};
m.sendAndWrite=function(a,b){var c=this;b=void 0===b?{}:b;if(this.databaseToken&&this.h){var d={url:a,options:b,timestamp:this.now(),status:"NEW",sendCount:0},e=!1,f=b.onSuccess?b.onSuccess:function(){};
d.options.onSuccess=function(g,h){void 0!==d.id?c.I.la(d.id,c.databaseToken):e=!0;c.J.da&&c.F&&c.F("vss_network_hint")&&c.J.da(!0);f(g,h)};
this.V(d.url,d.options);this.I.set(d,this.databaseToken).then(function(g){d.id=g;e&&c.I.la(d.id,c.databaseToken)}).catch(function(g){gk(c,g)})}else this.V(a,b)};
m.qa=function(){var a=this;if(!this.databaseToken)throw ej("throttleSend");this.i||(this.i=this.O.K(function(){return I(a,function c(){var d=this,e;return x(c,function(f){if(1==f.h)return w(f,d.I.fb("NEW",d.databaseToken),2);if(3!=f.h)return e=f.i,e?w(f,fk(d,e),3):(d.Ya(),f.return());d.i&&(d.i=0,d.qa());f.h=0})})},this.pb))};
m.Ya=function(){this.O.Z(this.i);this.i=0};
function fk(a,b){return I(a,function d(){var e=this,f,g;return x(d,function(h){switch(h.h){case 1:if(!e.databaseToken)throw f=ej("immediateSend"),f;if(void 0===b.id){h.u(2);break}return w(h,e.I.Ib(b.id,e.databaseToken),3);case 3:(g=h.i)?b=g:e.ma(Error("The request cannot be found in the database."));case 2:if(hk(e,b,e.lb)){h.u(4);break}e.ma(Error("Networkless Logging: Stored logs request expired age limit"));if(void 0===b.id){h.u(5);break}return w(h,e.I.la(b.id,e.databaseToken),5);case 5:return h.return();
case 4:b.skipRetry||(b=ik(e,b));if(!b){h.u(0);break}if(!b.skipRetry||void 0===b.id){h.u(8);break}return w(h,e.I.la(b.id,e.databaseToken),8);case 8:e.V(b.url,b.options,!!b.skipRetry),h.h=0}})})}
function ik(a,b){if(!a.databaseToken)throw ej("updateRequestHandlers");var c=b.options.onError?b.options.onError:function(){};
b.options.onError=function(e,f){return I(a,function h(){var k=this,l,n;return x(h,function(p){switch(p.h){case 1:l=k;n=jk(f);if(!(k.F&&k.F("nwl_consider_error_code")&&n||k.F&&!k.F("nwl_consider_error_code")&&k.potentialEsfErrorCounter<=k.Ca)){p.u(2);break}if(!k.J.W){p.u(3);break}return w(p,k.J.W(),3);case 3:if(k.J.H()){p.u(2);break}c(e,f);if(!k.F||!k.F("nwl_consider_error_code")||void 0===(null===b||void 0===b?void 0:b.id)){p.u(6);break}return w(p,k.I.Ta(b.id,k.databaseToken,!1),6);case 6:return p.return();
case 2:if(k.F&&k.F("nwl_consider_error_code")&&!n&&k.potentialEsfErrorCounter>k.Ca)return p.return();k.potentialEsfErrorCounter++;if(void 0===(null===b||void 0===b?void 0:b.id)){p.u(8);break}return b.sendCount<k.nb?w(p,k.I.Ta(b.id,k.databaseToken),12):w(p,k.I.la(b.id,k.databaseToken),8);case 12:k.O.K(function(){l.J.H()&&l.qa()},k.mb);
case 8:c(e,f),p.h=0}})})};
var d=b.options.onSuccess?b.options.onSuccess:function(){};
b.options.onSuccess=function(e,f){return I(a,function h(){var k=this;return x(h,function(l){if(1==l.h)return void 0===(null===b||void 0===b?void 0:b.id)?l.u(2):w(l,k.I.la(b.id,k.databaseToken),2);k.J.da&&k.F&&k.F("vss_network_hint")&&k.J.da(!0);d(e,f);l.h=0})})};
return b}
function hk(a,b,c){b=b.timestamp;return a.now()-b>=c?!1:!0}
function ek(a){if(!a.databaseToken)throw ej("retryQueuedRequests");a.I.fb("QUEUED",a.databaseToken).then(function(b){b&&!hk(a,b,a.jb)?a.O.K(function(){return I(a,function d(){var e=this;return x(d,function(f){if(1==f.h)return void 0===b.id?f.u(2):w(f,e.I.Ta(b.id,e.databaseToken),2);ek(e);f.h=0})})}):a.J.H()&&a.qa()})}
function gk(a,b){a.qb&&!a.J.H()?a.qb(b):a.handleError(b)}
function jk(a){var b;return(a=null===(b=null===a||void 0===a?void 0:a.error)||void 0===b?void 0:b.code)&&400<=a&&599>=a?!1:!0}
;function kk(a,b){this.version=a;this.args=b}
;function lk(a,b){this.topic=a;this.h=b}
lk.prototype.toString=function(){return this.topic};var mk=C("ytPubsub2Pubsub2Instance")||new L;L.prototype.subscribe=L.prototype.subscribe;L.prototype.unsubscribeByKey=L.prototype.na;L.prototype.publish=L.prototype.ga;L.prototype.clear=L.prototype.clear;A("ytPubsub2Pubsub2Instance",mk,void 0);var nk=C("ytPubsub2Pubsub2SubscribedKeys")||{};A("ytPubsub2Pubsub2SubscribedKeys",nk,void 0);var ok=C("ytPubsub2Pubsub2TopicToKeys")||{};A("ytPubsub2Pubsub2TopicToKeys",ok,void 0);var pk=C("ytPubsub2Pubsub2IsAsync")||{};A("ytPubsub2Pubsub2IsAsync",pk,void 0);
A("ytPubsub2Pubsub2SkipSubKey",null,void 0);function qk(a,b){var c=rk();c&&c.publish.call(c,a.toString(),a,b)}
function sk(a){var b=tk,c=rk();if(!c)return 0;var d=c.subscribe(b.toString(),function(e,f){var g=C("ytPubsub2Pubsub2SkipSubKey");g&&g==d||(g=function(){if(nk[d])try{if(f&&b instanceof lk&&b!=e)try{var h=b.h,k=f;if(!k.args||!k.version)throw Error("yt.pubsub2.Data.deserialize(): serializedData is incomplete.");try{if(!h.fa){var l=new h;h.fa=l.version}var n=h.fa}catch(p){}if(!n||k.version!=n)throw Error("yt.pubsub2.Data.deserialize(): serializedData version is incompatible.");try{f=Reflect.construct(h,
eb(k.args))}catch(p){throw p.message="yt.pubsub2.Data.deserialize(): "+p.message,p;}}catch(p){throw p.message="yt.pubsub2.pubsub2 cross-binary conversion error for "+b.toString()+": "+p.message,p;}a.call(window,f)}catch(p){sg(p)}},pk[b.toString()]?C("yt.scheduler.instance")?Tg.K(g):Lg(g,0):g())});
nk[d]=!0;ok[b.toString()]||(ok[b.toString()]=[]);ok[b.toString()].push(d);return d}
function uk(){var a=vk,b=sk(function(c){a.apply(void 0,arguments);wk(b)});
return b}
function wk(a){var b=rk();b&&("number"===typeof a&&(a=[a]),E(a,function(c){b.unsubscribeByKey(c);delete nk[c]}))}
function rk(){return C("ytPubsub2Pubsub2Instance")}
;function xk(a,b){Hj.call(this,a,b);this.options=b;Ti(a)}
v(xk,Hj);function yk(a,b){var c;return function(){c||(c=new xk(a,b));return c}}
xk.prototype.i=function(a,b,c){c=void 0===c?{}:c;return(this.options.Ua?Xj:Wj)(a,b,Object.assign({},c))};
xk.prototype.delete=function(a){a=void 0===a?{}:a;return(this.options.Ua?bk:Yj)(this.name,a)};
function zk(a,b){return yk(a,b)}
;var Ak;
function Bk(){if(Ak)return Ak();var a={};Ak=zk("LogsDatabaseV2",{Aa:(a.LogsRequestsStore={Ha:2},a),Ua:!1,upgrade:function(b,c,d){c(2)&&rj(b,"LogsRequestsStore",{keyPath:"id",autoIncrement:!0});c(3);c(5)&&(d=d.objectStore("LogsRequestsStore"),d.h.indexNames.contains("newRequest")&&d.h.deleteIndex("newRequest"),d.h.createIndex("newRequestV2",["status","interface","timestamp"],{unique:!1}));c(7)&&b.h.objectStoreNames.contains("sapisid")&&b.h.deleteObjectStore("sapisid");c(9)&&b.h.objectStoreNames.contains("SWHealthLog")&&b.h.deleteObjectStore("SWHealthLog")},
version:9});return Ak()}
;function Ck(a){return Jj(Bk(),a)}
function Dk(a,b){return I(this,function d(){var e,f,g,h;return x(d,function(k){if(1==k.h)return e={startTime:O(),transactionType:"YT_IDB_TRANSACTION_TYPE_WRITE"},w(k,Ck(b),2);if(3!=k.h)return f=k.i,g=Object.assign(Object.assign({},a),{options:JSON.parse(JSON.stringify(a.options)),interface:F("INNERTUBE_CONTEXT_CLIENT_NAME",0)}),w(k,tj(f,g),3);h=k.i;e.Zb=O();Ek(e);return k.return(h)})})}
function Fk(a,b){return I(this,function d(){var e,f,g,h,k,l,n;return x(d,function(p){if(1==p.h)return e={startTime:O(),transactionType:"YT_IDB_TRANSACTION_TYPE_READ"},w(p,Ck(b),2);if(3!=p.h)return f=p.i,g=F("INNERTUBE_CONTEXT_CLIENT_NAME",0),h=[a,g,0],k=[a,g,O()],l=IDBKeyRange.bound(h,k),n=void 0,w(p,qj(f,["LogsRequestsStore"],{mode:"readwrite",L:!0},function(r){return Cj(r.objectStore("LogsRequestsStore").index("newRequestV2"),{query:l,direction:"prev"},function(q){q.getValue()&&(n=q.getValue(),
"NEW"===a&&(n.status="QUEUED",q.update(n)))})}),3);
e.Zb=O();Ek(e);return p.return(n)})})}
function Gk(a,b){return I(this,function d(){var e;return x(d,function(f){if(1==f.h)return w(f,Ck(b),2);e=f.i;return f.return(qj(e,["LogsRequestsStore"],{mode:"readwrite",L:!0},function(g){var h=g.objectStore("LogsRequestsStore");return h.get(a).then(function(k){if(k)return k.status="QUEUED",T(h.h.put(k,void 0)).then(function(){return k})})}))})})}
function Hk(a,b,c){c=void 0===c?!0:c;return I(this,function e(){var f;return x(e,function(g){if(1==g.h)return w(g,Ck(b),2);f=g.i;return g.return(qj(f,["LogsRequestsStore"],{mode:"readwrite",L:!0},function(h){var k=h.objectStore("LogsRequestsStore");return k.get(a).then(function(l){return l?(l.status="NEW",c&&(l.sendCount+=1),T(k.h.put(l,void 0)).then(function(){return l})):S.resolve(void 0)})}))})})}
function Ik(a,b){return I(this,function d(){var e;return x(d,function(f){if(1==f.h)return w(f,Ck(b),2);e=f.i;return f.return(e.delete("LogsRequestsStore",a))})})}
function Jk(a){return I(this,function c(){var d,e;return x(c,function(f){if(1==f.h)return w(f,Ck(a),2);d=f.i;e=O()-2592E6;return w(f,qj(d,["LogsRequestsStore"],{mode:"readwrite",L:!0},function(g){return zj(g.objectStore("LogsRequestsStore"),{},function(h){if(h.getValue().timestamp<=e)return h.delete().then(function(){return h.continue()})})}),0)})})}
function Kk(){return I(this,function b(){return x(b,function(c){return w(c,ak(),0)})})}
function Ek(a){N("nwl_csi_killswitch")||.01>=Math.random()&&qk("nwl_transaction_latency_payload",a)}
;var Lk={},Mk=zk("ServiceWorkerLogsDatabase",{Aa:(Lk.SWHealthLog={Ha:1},Lk),Ua:!0,upgrade:function(a,b){b(1)&&rj(a,"SWHealthLog",{keyPath:"id",autoIncrement:!0}).h.createIndex("swHealthNewRequest",["interface","timestamp"],{unique:!1})},
version:1});function Nk(a){return Jj(Mk(),a)}
function Ok(a){return I(this,function c(){var d,e;return x(c,function(f){if(1==f.h)return N("web_clean_sw_logs_store")?w(f,Nk(a),3):f.u(0);d=f.i;e=O()-2592E6;return w(f,qj(d,["SWHealthLog"],{mode:"readwrite",L:!0},function(g){return zj(g.objectStore("SWHealthLog"),{},function(h){if(h.getValue().timestamp<=e)return h.delete().then(function(){return h.continue()})})}),0)})})}
function Pk(a){return I(this,function c(){var d;return x(c,function(e){if(1==e.h)return w(e,Nk(a),2);d=e.i;return w(e,d.clear("SWHealthLog"),0)})})}
;var Qk;function Rk(){Qk||(Qk=new Ei("yt.offline"));return Qk}
function Sk(a){if(N("offline_error_handling")){var b=Rk().get("errors",!0)||{};b[a.message]={name:a.name,stack:a.stack};a.level&&(b[a.message].level=a.level);Rk().set("errors",b,2592E3,!0)}}
function Tk(){if(N("offline_error_handling")){var a=Rk().get("errors",!0);if(a){for(var b in a)if(a[b]){var c=new Qi(b,"sent via offline_errors");c.name=a[b].name;c.stack=a[b].stack;c.level=a[b].level;sg(c)}Rk().set("errors",{},2592E3,!0)}}}
;var Uk=xg("network_polling_interval",3E4);function U(){ye.call(this);this.G=0;this.M=this.m=!1;this.l=this.La();N("use_shared_nsm")?(Be.h||(Be.h=new Be(Tg)),this.j=Be.h):(Vk(this),Wk(this))}
v(U,ye);function Xk(){if(!U.h){var a=C("yt.networkStatusManager.instance")||new U;A("yt.networkStatusManager.instance",a,void 0);U.h=a}return U.h}
m=U.prototype;m.H=function(){var a;return N("use_shared_nsm")&&this.j?null===(a=this.j)||void 0===a?void 0:a.H():this.l};
m.da=function(a){var b;N("use_shared_nsm")&&this.j?null===(b=this.j)||void 0===b?void 0:b.j=a:a!==this.l&&(this.l=a)};
m.Kb=function(a){!N("use_shared_nsm")&&(this.m=!0,void 0===a?0:a)&&(this.G||Yk(this))};
m.La=function(){var a=window.navigator.onLine;return void 0===a?!0:a};
m.wb=function(){this.M=!0};
m.T=function(a,b){return N("use_shared_nsm")&&this.j?this.j.T(a,b):ye.prototype.T.call(this,a,b)};
function Wk(a){window.addEventListener("online",function(){return I(a,function c(){var d=this;return x(c,function(e){if(1==e.h)return w(e,d.W(),2);d.M&&Tk();e.h=0})})})}
function Vk(a){window.addEventListener("offline",function(){return I(a,function c(){var d=this;return x(c,function(e){return w(e,d.W(),0)})})})}
function Yk(a){a.G=Pg(function(){return I(a,function c(){var d=this;return x(c,function(e){if(1==e.h)return d.l?d.La()||!d.m?e.u(3):w(e,d.W(),3):w(e,d.W(),3);Yk(d);e.h=0})})},Uk)}
m.W=function(a){var b=this;return N("use_shared_nsm")&&this.j?Ce(this.j,a):this.o?this.o:this.o=new Promise(function(c){return I(b,function e(){var f,g,h,k=this;return x(e,function(l){switch(l.h){case 1:return f=window.AbortController?new window.AbortController:void 0,g=null===f||void 0===f?void 0:f.signal,h=!1,sa(l,2,3),f&&(k.B=Tg.K(function(){f.abort()},a||2E4)),w(l,fetch("/generate_204",{method:"HEAD",
signal:g}),5);case 5:h=!0;case 3:ua(l);k.o=void 0;k.B&&Tg.Z(k.B);h!==k.l&&(k.l=h,k.l&&k.m?ze(k,"ytnetworkstatus-online"):k.m&&ze(k,"ytnetworkstatus-offline"));c(h);va(l);break;case 2:ta(l),h=!1,l.u(3)}})})})};
U.prototype.sendNetworkCheckRequest=U.prototype.W;U.prototype.listen=U.prototype.T;U.prototype.enableErrorFlushing=U.prototype.wb;U.prototype.getWindowStatus=U.prototype.La;U.prototype.monitorNetworkStatusChange=U.prototype.Kb;U.prototype.networkStatusHint=U.prototype.da;U.prototype.isNetworkAvailable=U.prototype.H;U.getInstance=Xk;function Zk(a){a=void 0===a?{}:a;ye.call(this);var b=this;this.l=this.G=0;this.m="ytnetworkstatus-offline";this.o="ytnetworkstatus-online";N("use_shared_nsm")&&(this.m="networkstatus-offline",this.o="networkstatus-online");this.j=Xk();var c=C("yt.networkStatusManager.instance.monitorNetworkStatusChange").bind(this.j);c&&c(a.cb);a.Oa&&!N("use_shared_nsm")&&(c=C("yt.networkStatusManager.instance.enableErrorFlushing").bind(this.j))&&c();if(c=C("yt.networkStatusManager.instance.listen").bind(this.j))a.Da?
(this.Da=a.Da,c(this.o,function(){$k(b,"publicytnetworkstatus-online");N("use_shared_nsm")&&a.Oa&&Tk()}),c(this.m,function(){$k(b,"publicytnetworkstatus-offline")})):(c(this.o,function(){ze(b,"publicytnetworkstatus-online")}),c(this.m,function(){ze(b,"publicytnetworkstatus-offline")}))}
v(Zk,ye);Zk.prototype.H=function(){var a=C("yt.networkStatusManager.instance.isNetworkAvailable").bind(this.j);return a?a():!0};
Zk.prototype.da=function(a){var b=C("yt.networkStatusManager.instance.networkStatusHint").bind(this.j);b&&b(a)};
Zk.prototype.W=function(a){return I(this,function c(){var d=this,e;return x(c,function(f){return(e=C("yt.networkStatusManager.instance.sendNetworkCheckRequest").bind(d.j))?f.return(e(a)):f.return(!0)})})};
function $k(a,b){a.Da?a.l?(Tg.Z(a.G),a.G=Tg.K(function(){a.B!==b&&(ze(a,b),a.B=b,a.l=O())},a.Da-(O()-a.l))):(ze(a,b),a.B=b,a.l=O()):ze(a,b)}
;var al=!1,bl,cl=0,dl=0,el,fl=y.ytNetworklessLoggingInitializationOptions||{isNwlInitialized:al,databaseToken:bl,potentialEsfErrorCounter:dl,isIdbSupported:!!bl};A("ytNetworklessLoggingInitializationOptions",fl,void 0);
function gl(){I(this,function b(){return x(b,function(c){switch(c.h){case 1:return w(c,Tj(),2);case 2:bl=c.i;if(!bl||!Ri()&&!N("nwl_init_require_datasync_id_killswitch")){c.u(0);break}al=!0;fl.isNwlInitialized=al;fl.databaseToken=bl;fl.isIdbSupported=!!bl;return w(c,bk("LogsDatabaseV2"),4);case 4:if(!(.1>=Math.random())){c.u(5);break}return w(c,Jk(bl),6);case 6:return w(c,Ok(bl),5);case 5:hl();il().H()&&jl();il().T("publicytnetworkstatus-online",jl);il().T("publicytnetworkstatus-offline",kl);if(!N("networkless_immediately_drop_sw_health_store")){c.u(8);
break}return w(c,ll(),8);case 8:if(N("networkless_immediately_drop_all_requests"))return w(c,Kk(),0);c.u(0)}})})}
function ml(a,b){function c(d){var e=il().H();if(!nl()||!d||e&&N("vss_networkless_bypass_write"))ol(a,b);else{var f={url:a,options:b,timestamp:O(),status:"NEW",sendCount:0};Dk(f,d).then(function(g){f.id=g;il().H()&&pl(f)}).catch(function(g){pl(f);
il().H()?sg(g):Sk(g)})}}
b=void 0===b?{}:b;N("skip_is_supported_killswitch")?Tj().then(function(d){c(d)}):c(ql())}
function rl(a,b){function c(d){if(nl()&&d){var e={url:a,options:b,timestamp:O(),status:"NEW",sendCount:0},f=!1,g=b.onSuccess?b.onSuccess:function(){};
e.options.onSuccess=function(h,k){void 0!==e.id?Ik(e.id,d):f=!0;N("vss_network_hint")&&il().da(!0);g(h,k)};
ol(e.url,e.options);Dk(e,d).then(function(h){e.id=h;f&&Ik(e.id,d)}).catch(function(h){il().H()?sg(h):Sk(h)})}else ol(a,b)}
b=void 0===b?{}:b;N("skip_is_supported_killswitch")?Tj().then(function(d){c(d)}):c(ql())}
function jl(){var a=this,b=ql();if(!b)throw ej("throttleSend");cl||(cl=Tg.K(function(){return I(a,function d(){var e;return x(d,function(f){if(1==f.h)return w(f,Fk("NEW",b),2);if(3!=f.h)return e=f.i,e?w(f,pl(e),3):(kl(),f.return());cl&&(cl=0,jl());f.h=0})})},100))}
function kl(){Tg.Z(cl);cl=0}
function pl(a){return I(this,function c(){var d,e,f;return x(c,function(g){switch(g.h){case 1:d=ql();if(!d)throw e=ej("immediateSend"),e;if(void 0===a.id){g.u(2);break}return w(g,Gk(a.id,d),3);case 3:(f=g.i)?a=f:tg(Error("The request cannot be found in the database."));case 2:if(sl(a,2592E6)){g.u(4);break}tg(Error("Networkless Logging: Stored logs request expired age limit"));if(void 0===a.id){g.u(5);break}return w(g,Ik(a.id,d),5);case 5:return g.return();case 4:a.skipRetry||(a=tl(a));var h=a,k,l;
if(null===(l=null===(k=null===h||void 0===h?void 0:h.options)||void 0===k?void 0:k.postParams)||void 0===l?0:l.requestTimeMs)h.options.postParams.requestTimeMs=Math.round(O());a=h;if(!a){g.u(0);break}if(!a.skipRetry||void 0===a.id){g.u(8);break}return w(g,Ik(a.id,d),8);case 8:ol(a.url,a.options,!!a.skipRetry),g.h=0}})})}
function tl(a){var b=this,c=ql();if(!c)throw ej("updateRequestHandlers");var d=a.options.onError?a.options.onError:function(){};
a.options.onError=function(f,g){return I(b,function k(){var l;return x(k,function(n){switch(n.h){case 1:l=jk(g);if(!(N("nwl_consider_error_code")&&l||!N("nwl_consider_error_code")&&ul()<=xg("potential_esf_error_limit",10))){n.u(2);break}return w(n,il().W(),3);case 3:if(il().H()){n.u(2);break}d(f,g);if(!N("nwl_consider_error_code")||void 0===(null===a||void 0===a?void 0:a.id)){n.u(5);break}return w(n,Hk(a.id,c,!1),5);case 5:return n.return();case 2:if(N("nwl_consider_error_code")&&!l&&ul()>xg("potential_esf_error_limit",
10))return n.return();C("ytNetworklessLoggingInitializationOptions")&&fl.potentialEsfErrorCounter++;dl++;if(void 0===(null===a||void 0===a?void 0:a.id)){n.u(7);break}return 1>a.sendCount?w(n,Hk(a.id,c),11):w(n,Ik(a.id,c),7);case 11:Tg.K(function(){il().H()&&jl()},5E3);
case 7:d(f,g),n.h=0}})})};
var e=a.options.onSuccess?a.options.onSuccess:function(){};
a.options.onSuccess=function(f,g){return I(b,function k(){return x(k,function(l){if(1==l.h)return void 0===(null===a||void 0===a?void 0:a.id)?l.u(2):w(l,Ik(a.id,c),2);N("vss_network_hint")&&il().da(!0);e(f,g);l.h=0})})};
return a}
function sl(a,b){a=a.timestamp;return O()-a>=b?!1:!0}
function hl(){var a=this,b=ql();if(!b)throw ej("retryQueuedRequests");Fk("QUEUED",b).then(function(c){c&&!sl(c,12E4)?Tg.K(function(){return I(a,function e(){return x(e,function(f){if(1==f.h)return void 0===c.id?f.u(2):w(f,Hk(c.id,b),2);hl();f.h=0})})}):il().H()&&jl()})}
function ll(){return I(this,function b(){var c,d;return x(b,function(e){c=ql();if(!c)throw d=ej("clearSWHealthLogsDb"),d;return e.return(Pk(c).catch(function(f){sg(f)}))})})}
function il(){el||(el=new Zk({Oa:!0,cb:!0}));return el}
function ol(a,b,c){if(N("networkless_with_beacon")){var d=["method","postBody"];if(Object.keys(b).length>d.length)c=!0;else{c=0;d=u(d);for(var e=d.next();!e.done;e=d.next())b.hasOwnProperty(e.value)&&c++;c=Object.keys(b).length!==c}c?vh(a,b):Kh(a,void 0,b.postBody)}else c&&0===Object.keys(b).length?Hh(a):vh(a,b)}
function nl(){return C("ytNetworklessLoggingInitializationOptions")?fl.isNwlInitialized:al}
function ql(){return C("ytNetworklessLoggingInitializationOptions")?fl.databaseToken:bl}
function ul(){return C("ytNetworklessLoggingInitializationOptions")?fl.potentialEsfErrorCounter:dl}
;function vl(){ck.call(this,{I:{ub:Jk,la:Ik,fb:Fk,Ib:Gk,Ta:Hk,set:Dk},J:new Zk({Oa:!0,cb:!0}),handleError:sg,ma:tg,V:wl,now:O,qb:Sk,O:Sg(),Sa:"publicytnetworkstatus-online",Ra:"publicytnetworkstatus-offline",ya:!0,wa:.1,Ca:xg("potential_esf_error_limit",10),F:N});this.ya&&Math.random()<=this.wa&&this.databaseToken&&Ok(this.databaseToken);N("networkless_immediately_drop_sw_health_store")&&xl(this);N("networkless_immediately_drop_all_requests")&&Kk();bk("LogsDatabaseV2")}
v(vl,ck);function yl(){var a=C("yt.networklessRequestController.instance");a||(a=new vl,A("yt.networklessRequestController.instance",a,void 0),N("networkless_logging")&&Tj().then(function(b){a.databaseToken=b;dk(a)}));
return a}
vl.prototype.writeThenSend=function(a,b){b||(b={});Ri()||(this.h=!1);ck.prototype.writeThenSend.call(this,a,b)};
vl.prototype.sendThenWrite=function(a,b,c){b||(b={});Ri()||(this.h=!1);ck.prototype.sendThenWrite.call(this,a,b,c)};
vl.prototype.sendAndWrite=function(a,b){b||(b={});Ri()||(this.h=!1);ck.prototype.sendAndWrite.call(this,a,b)};
function xl(a){I(a,function c(){var d=this,e,f;return x(c,function(g){e=d;if(!d.databaseToken)throw f=ej("clearSWHealthLogsDb"),f;return g.return(Pk(d.databaseToken).catch(function(h){e.handleError(h)}))})})}
function wl(a,b,c){var d;if(null===(d=b.postParams)||void 0===d?0:d.requestTimeMs)b.postParams.requestTimeMs=Math.round(O());if(N("networkless_with_beacon")){c=b;var e=["method","postBody"];if(Object.keys(c).length>e.length)c=!0;else{d=0;e=u(e);for(var f=e.next();!f.done;f=e.next())c.hasOwnProperty(f.value)&&d++;c=Object.keys(c).length!==d}c?vh(a,b):Kh(a,void 0,b.postBody)}else c&&0===Object.keys(b).length?Hh(a):vh(a,b)}
;function zl(a){var b=this;this.config_=null;a?this.config_=a:Bi()&&(this.config_=li());Pg(function(){Ji(b)},5E3)}
zl.prototype.isReady=function(){!this.config_&&Bi()&&(this.config_=li());return!!this.config_};
function oi(a,b,c,d){function e(z){z=void 0===z?!1:z;var B;if(d.retry&&"www.youtube-nocookie.com"!=h&&(z||N("skip_ls_gel_retry")||(B=Hi(b,c,l,k)),B)){var G=g.onSuccess,R=g.onFetchSuccess;g.onSuccess=function(P,K){Ii(B);G(P,K)};
c.onFetchSuccess=function(P,K){Ii(B);R(P,K)}}try{z&&d.retry&&!d.ib.bypassNetworkless?(g.method="POST",d.ib.writeThenSend?N("use_new_nwl")?yl().writeThenSend(q,g):ml(q,g):N("use_new_nwl")?yl().sendAndWrite(q,g):rl(q,g)):(g.method="POST",g.postParams||(g.postParams={}),vh(q,g))}catch(P){if("InvalidAccessError"==P.name)B&&(Ii(B),B=0),tg(Error("An extension is blocking network request."));
else throw P;}B&&Pg(function(){Ji(a)},5E3)}
!F("VISITOR_DATA")&&"visitor_id"!==b&&.01>Math.random()&&tg(new Qi("Missing VISITOR_DATA when sending innertube request.",b,c,d));if(!a.isReady()){var f=new Qi("innertube xhrclient not ready",b,c,d);sg(f);throw f;}var g={headers:{"Content-Type":"application/json"},method:"POST",postParams:c,postBodyFormat:"JSON",onTimeout:function(){d.onTimeout()},
onFetchTimeout:d.onTimeout,onSuccess:function(z,B){if(d.onSuccess)d.onSuccess(B)},
onFetchSuccess:function(z){if(d.onSuccess)d.onSuccess(z)},
onError:function(z,B){if(d.onError)d.onError(B)},
onFetchError:function(z){if(d.onError)d.onError(z)},
timeout:d.timeout,withCredentials:!0},h="";(f=a.config_.Eb)&&(h=f);var k=a.config_.Gb||!1,l=Ci(k,h,d);Object.assign(g.headers,l);(f=g.headers.Authorization)&&!h&&(g.headers["x-origin"]=window.location.origin);var n="/youtubei/"+a.config_.innertubeApiVersion+"/"+b,p={alt:"json"},r=a.config_.Fb&&f;N("omit_innertube_api_key_for_bearer_auth_header")&&(r=r&&f.startsWith("Bearer"));r||(p.key=a.config_.innertubeApiKey);var q=jh(""+h+n,p||{},!0);N("use_new_nwl")||nl()?Sj().then(function(z){e(z)}):e(!1)}
;function V(a,b,c){c=void 0===c?{}:c;var d=zl;F("ytLoggingEventsDefaultDisabled",!1)&&zl==zl&&(d=null);qi(a,b,d,c)}
;var Al=[{Qa:function(a){return"Cannot read property '"+a.key+"'"},
Ba:{Error:[{regexp:/(Permission denied) to access property "([^']+)"/,groups:["reason","key"]}],TypeError:[{regexp:/Cannot read property '([^']+)' of (null|undefined)/,groups:["key","value"]},{regexp:/\u65e0\u6cd5\u83b7\u53d6\u672a\u5b9a\u4e49\u6216 (null|undefined) \u5f15\u7528\u7684\u5c5e\u6027\u201c([^\u201d]+)\u201d/,groups:["value","key"]},{regexp:/\uc815\uc758\ub418\uc9c0 \uc54a\uc74c \ub610\ub294 (null|undefined) \ucc38\uc870\uc778 '([^']+)' \uc18d\uc131\uc744 \uac00\uc838\uc62c \uc218 \uc5c6\uc2b5\ub2c8\ub2e4./,
groups:["value","key"]},{regexp:/No se puede obtener la propiedad '([^']+)' de referencia nula o sin definir/,groups:["key"]},{regexp:/Unable to get property '([^']+)' of (undefined or null) reference/,groups:["key","value"]},{regexp:/(null) is not an object \(evaluating '(?:([^.]+)\.)?([^']+)'\)/,groups:["value","base","key"]}]}},{Qa:function(a){return"Cannot call '"+a.key+"'"},
Ba:{TypeError:[{regexp:/(?:([^ ]+)?\.)?([^ ]+) is not a function/,groups:["base","key"]},{regexp:/([^ ]+) called on (null or undefined)/,groups:["key","value"]},{regexp:/Object (.*) has no method '([^ ]+)'/,groups:["base","key"]},{regexp:/Object doesn't support property or method '([^ ]+)'/,groups:["key"]},{regexp:/\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u306f '([^']+)' \u30d7\u30ed\u30d1\u30c6\u30a3\u307e\u305f\u306f\u30e1\u30bd\u30c3\u30c9\u3092\u30b5\u30dd\u30fc\u30c8\u3057\u3066\u3044\u307e\u305b\u3093/,
groups:["key"]},{regexp:/\uac1c\uccb4\uac00 '([^']+)' \uc18d\uc131\uc774\ub098 \uba54\uc11c\ub4dc\ub97c \uc9c0\uc6d0\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4./,groups:["key"]}]}},{Qa:function(a){return a.key+" is not defined"},
Ba:{ReferenceError:[{regexp:/(.*) is not defined/,groups:["key"]},{regexp:/Can't find variable: (.*)/,groups:["key"]}]}}];var Cl={ca:[],Y:[{Xa:Bl,weight:500}]};function Bl(a){if("JavaException"===a.name)return!0;a=a.stack;return a.includes("chrome://")||a.includes("chrome-extension://")||a.includes("moz-extension://")}
;function Dl(){this.Y=[];this.ca=[]}
var El;function Fl(){if(!El){var a=El=new Dl;a.ca.length=0;a.Y.length=0;Cl.ca&&a.ca.push.apply(a.ca,Cl.ca);Cl.Y&&a.Y.push.apply(a.Y,Cl.Y)}return El}
;var Gl=new L;function Hl(a){function b(){return a.charCodeAt(d++)}
var c=a.length,d=0;do{var e=Il(b);if(Infinity===e)break;var f=e>>3;switch(e&7){case 0:e=Il(b);if(2===f)return e;break;case 1:if(2===f)return;d+=8;break;case 2:e=Il(b);if(2===f)return a.substr(d,e);d+=e;break;case 5:if(2===f)return;d+=4;break;default:return}}while(d<c)}
function Il(a){var b=a(),c=b&127;if(128>b)return c;b=a();c|=(b&127)<<7;if(128>b)return c;b=a();c|=(b&127)<<14;if(128>b)return c;b=a();return 128>b?c|(b&127)<<21:Infinity}
;function Jl(a,b,c,d){if(a)if(Array.isArray(a)){var e=d;for(d=0;d<a.length&&!(a[d]&&(e+=Kl(d,a[d],b,c),500<e));d++);d=e}else if("object"===typeof a)for(e in a){if(a[e]){var f=a[e];var g=b;var h=c;g="string"!==typeof f||"clickTrackingParams"!==e&&"trackingParams"!==e?0:(f=Hl(atob(f.replace(/-/g,"+").replace(/_/g,"/"))))?Kl(e+".ve",f,g,h):0;d+=g;d+=Kl(e,a[e],b,c);if(500<d)break}}else c[b]=Ll(a),d+=c[b].length;else c[b]=Ll(a),d+=c[b].length;return d}
function Kl(a,b,c,d){c+="."+a;a=Ll(b);d[c]=a;return c.length+a.length}
function Ll(a){try{return("string"===typeof a?a:String(JSON.stringify(a))).substr(0,500)}catch(b){return"unable to serialize "+typeof a+" ("+b.message+")"}}
;var Ml=new Set,Nl=0,Ol=0,Pl=0,Ql=[],Rl=["PhantomJS","Googlebot","TO STOP THIS SECURITY SCAN go/scan"];function Sl(a){Tl(a,"WARNING")}
function Tl(a,b,c,d,e,f){f=void 0===f?{}:f;f.name=c||F("INNERTUBE_CONTEXT_CLIENT_NAME",1);f.version=d||F("INNERTUBE_CONTEXT_CLIENT_VERSION",void 0);c=f||{};b=void 0===b?"ERROR":b;b=void 0===b?"ERROR":b;if(a&&(a.hasOwnProperty("level")&&a.level&&(b=a.level),N("console_log_js_exceptions")&&(d=[],d.push("Name: "+a.name),d.push("Message: "+a.message),a.hasOwnProperty("params")&&d.push("Error Params: "+JSON.stringify(a.params)),a.hasOwnProperty("args")&&d.push("Error args: "+JSON.stringify(a.args)),d.push("File name: "+
a.fileName),d.push("Stacktrace: "+a.stack),window.console.log(d.join("\n"),a)),!(5<=Nl))){var g=Xd(a);d=g.message||"Unknown Error";e=g.name||"UnknownError";var h=g.stack||a.i||"Not available";h.startsWith(e+": "+d)&&(f=h.split("\n"),f.shift(),h=f.join("\n"));f=g.lineNumber||"Not available";g=g.fileName||"Not available";var k=0;if(a.hasOwnProperty("args")&&a.args&&a.args.length)for(var l=0;l<a.args.length&&!(k=Jl(a.args[l],"params."+l,c,k),500<=k);l++);else if(a.hasOwnProperty("params")&&a.params){var n=
a.params;if("object"===typeof a.params)for(l in n){if(n[l]){var p="params."+l,r=Ll(n[l]);c[p]=r;k+=p.length+r.length;if(500<k)break}}else c.params=Ll(n)}if(Ql.length)for(l=0;l<Ql.length&&!(k=Jl(Ql[l],"params.context."+l,c,k),500<=k);l++);navigator.vendor&&!c.hasOwnProperty("vendor")&&(c["device.vendor"]=navigator.vendor);l={message:d,name:e,lineNumber:f,fileName:g,stack:h,params:c,sampleWeight:1};c=Number(a.columnNumber);isNaN(c)||(l.lineNumber=l.lineNumber+":"+c);if("IGNORED"===a.level)a=0;else a:{a=
Fl();c=u(a.ca);for(d=c.next();!d.done;d=c.next())if(d=d.value,l.message&&l.message.match(d.Om)){a=d.weight;break a}a=u(a.Y);for(c=a.next();!c.done;c=a.next())if(c=c.value,c.Xa(l)){a=c.weight;break a}a=1}l.sampleWeight=a;a=u(Al);for(c=a.next();!c.done;c=a.next())if(c=c.value,c.Ba[l.name])for(e=u(c.Ba[l.name]),d=e.next();!d.done;d=e.next())if(f=d.value,d=l.message.match(f.regexp)){l.params["params.error.original"]=d[0];e=f.groups;f={};for(g=0;g<e.length;g++)f[e[g]]=d[g+1],l.params["params.error."+e[g]]=
d[g+1];l.message=c.Qa(f);break}l.params||(l.params={});a=Fl();l.params["params.errorServiceSignature"]="msg="+a.ca.length+"&cb="+a.Y.length;l.params["params.serviceWorker"]="false";y.document&&y.document.querySelectorAll&&(l.params["params.fscripts"]=String(document.querySelectorAll("script:not([nonce])").length));vb("sample").constructor!==tb&&(l.params["params.fconst"]="true");window.yterr&&"function"===typeof window.yterr&&window.yterr(l);if(0!==l.sampleWeight&&!Ml.has(l.message)){"ERROR"===b?
(Gl.ga("handleError",l),N("record_app_crashed_web")&&0===Pl&&1===l.sampleWeight&&(Pl++,V("appCrashed",{appCrashType:"APP_CRASH_TYPE_BREAKPAD"})),Ol++):"WARNING"===b&&Gl.ga("handleWarning",l);if(N("kevlar_gel_error_routing")){a=b;b:{c=u(Rl);for(d=c.next();!d.done;d=c.next())if(Eh(d.value.toLowerCase())){c=!0;break b}c=!1}if(c)c=void 0;else{d={stackTrace:l.stack};l.fileName&&(d.filename=l.fileName);c=l.lineNumber&&l.lineNumber.split?l.lineNumber.split(":"):[];0!==c.length&&(1!==c.length||isNaN(Number(c[0]))?
2!==c.length||isNaN(Number(c[0]))||isNaN(Number(c[1]))||(d.lineNumber=Number(c[0]),d.columnNumber=Number(c[1])):d.lineNumber=Number(c[0]));c={level:"ERROR_LEVEL_UNKNOWN",message:l.message,errorClassName:l.name,sampleWeight:l.sampleWeight};"ERROR"===a?c.level="ERROR_LEVEL_ERROR":"WARNING"===a&&(c.level="ERROR_LEVEL_WARNNING");d={isObfuscated:!0,browserStackInfo:d};e={pageUrl:window.location.href,kvPairs:[]};F("FEXP_EXPERIMENTS")&&(e.experimentIds=F("FEXP_EXPERIMENTS"));f=F("LATEST_ECATCHER_SERVICE_TRACKING_PARAMS",
void 0);g=ng.EXPERIMENT_FLAGS;if((!g||!g.web_disable_gel_stp_ecatcher_killswitch)&&f)for(h=u(Object.keys(f)),g=h.next();!g.done;g=h.next())g=g.value,e.kvPairs.push({key:g,value:String(f[g])});if(f=l.params)for(h=u(Object.keys(f)),g=h.next();!g.done;g=h.next())g=g.value,e.kvPairs.push({key:"client."+g,value:String(f[g])});f=F("SERVER_NAME",void 0);g=F("SERVER_VERSION",void 0);f&&g&&(e.kvPairs.push({key:"server.name",value:f}),e.kvPairs.push({key:"server.version",value:g}));c={errorMetadata:e,stackTrace:d,
logMessage:c}}c&&(V("clientError",c),("ERROR"===a||N("errors_flush_gel_always_killswitch"))&&gi())}if(!N("suppress_error_204_logging")){a=l.params||{};b={urlParams:{a:"logerror",t:"jserror",type:l.name,msg:l.message.substr(0,250),line:l.lineNumber,level:b,"client.name":a.name},postParams:{url:F("PAGE_NAME",window.location.href),file:l.fileName},method:"POST"};a.version&&(b["client.version"]=a.version);if(b.postParams){l.stack&&(b.postParams.stack=l.stack);c=u(Object.keys(a));for(d=c.next();!d.done;d=
c.next())d=d.value,b.postParams["client."+d]=a[d];if(a=F("LATEST_ECATCHER_SERVICE_TRACKING_PARAMS",void 0))for(c=u(Object.keys(a)),d=c.next();!d.done;d=c.next())d=d.value,b.postParams[d]=a[d];a=F("SERVER_NAME",void 0);c=F("SERVER_VERSION",void 0);a&&c&&(b.postParams["server.name"]=a,b.postParams["server.version"]=c)}vh(F("ECATCHER_REPORT_HOST","")+"/error_204",b)}try{Ml.add(l.message)}catch(q){}Nl++}}}
function Ul(a,b){for(var c=[],d=1;d<arguments.length;++d)c[d-1]=arguments[d];a.args||(a.args=[]);a.args.push.apply(a.args,fa(c))}
;var Vl={Nc:3611,ac:27686,cc:85013,dc:23462,fc:42016,hc:62407,ic:26926,ec:43781,jc:51236,kc:79148,lc:50160,mc:77504,Ac:87907,Bc:18630,Cc:54445,Dc:80935,Ec:105675,Fc:37521,Gc:47786,Hc:98349,Ic:123695,Jc:6827,Kc:29434,Lc:7282,Mc:124448,Qc:32276,Pc:76278,Rc:93911,Sc:106531,Tc:27259,Uc:27262,Vc:27263,Xc:21759,Yc:27107,Zc:62936,bd:49568,cd:38408,dd:80637,ed:68727,fd:68728,gd:80353,hd:80356,jd:74610,kd:45707,ld:83962,md:83970,nd:46713,od:89711,pd:74612,qd:93265,rd:74611,sd:131380,ud:128979,vd:128978,td:131391,
wd:105350,yd:134800,xd:131392,Ad:113533,Bd:93252,Cd:99357,Ed:94521,Fd:114252,Gd:113532,Hd:94522,Dd:94583,Id:88E3,Jd:93253,Kd:93254,Ld:94387,Md:94388,Nd:93255,Od:97424,zd:72502,Pd:110111,Qd:76019,Sd:117092,Td:117093,Rd:89431,Ud:110466,Vd:77240,Wd:60508,Xd:137401,Yd:137402,Zd:137046,ae:73393,be:113534,ce:92098,de:131381,ee:84517,ge:83759,he:80357,ie:86113,je:72598,ke:72733,le:107349,me:124275,ne:118203,oe:133275,pe:133274,qe:133272,re:133273,se:133276,ue:117431,te:133797,we:128572,xe:133405,ye:117429,
ze:117430,Ae:117432,Be:120080,Ce:117259,De:121692,Ee:132972,Fe:133051,Ge:133658,He:132971,Ie:97615,Je:31402,Le:133624,Me:133623,Ne:133622,Ke:133621,Oe:84774,Pe:95117,Qe:98930,Re:98931,Se:98932,Te:43347,Ue:129889,Ve:45474,We:100352,Xe:84758,Ye:98443,Ze:117985,af:74613,bf:74614,cf:64502,df:136032,ef:74615,ff:74616,gf:122224,hf:74617,jf:77820,kf:74618,lf:93278,mf:93274,nf:93275,pf:93276,qf:22110,rf:29433,sf:133798,tf:132295,vf:120541,xf:82047,yf:113550,zf:75836,Af:75837,Bf:42352,Cf:84512,Df:76065,Ef:75989,
Ff:16623,Gf:32594,Hf:27240,If:32633,Jf:74858,Lf:3945,Kf:16989,Mf:45520,Nf:25488,Of:25492,Pf:25494,Qf:55760,Rf:14057,Sf:18451,Tf:57204,Uf:57203,Vf:17897,Wf:57205,Xf:18198,Yf:17898,Zf:17909,ag:43980,cg:46220,dg:11721,eg:49954,fg:96369,gg:3854,hg:56251,ig:25624,jg:16906,kg:99999,lg:68172,mg:27068,ng:47973,og:72773,pg:26970,qg:26971,rg:96805,sg:17752,tg:73233,ug:109512,vg:22256,wg:14115,xg:22696,yg:89278,zg:89277,Ag:109513,Bg:43278,Cg:43459,Dg:43464,Eg:89279,Fg:43717,Gg:55764,Hg:22255,Ig:89281,Jg:40963,
Kg:43277,Lg:43442,Mg:91824,Ng:120137,Og:96367,Pg:36850,Qg:72694,Rg:37414,Sg:36851,Ug:124863,Tg:121343,Vg:73491,Wg:54473,Xg:43375,Yg:46674,Zg:32473,ah:72901,bh:72906,dh:50947,eh:50612,fh:50613,gh:50942,hh:84938,ih:84943,jh:84939,kh:84941,lh:84944,mh:84940,nh:84942,oh:35585,ph:51926,qh:79983,rh:63238,sh:18921,th:63241,uh:57893,vh:41182,wh:135732,xh:33424,yh:22207,zh:42993,Ah:36229,Bh:22206,Ch:22205,Dh:18993,Eh:19001,Fh:18990,Gh:18991,Hh:18997,Ih:18725,Jh:19003,Kh:36874,Lh:44763,Mh:33427,Nh:67793,Oh:22182,
Ph:37091,Qh:34650,Rh:50617,Sh:47261,Th:22287,Uh:25144,Vh:97917,Wh:62397,Xh:125598,Yh:137935,Zh:36961,ai:108035,bi:27426,ci:27857,di:27846,fi:27854,gi:69692,hi:61411,ii:39299,ji:38696,ki:62520,li:36382,mi:108701,ni:50663,oi:36387,ri:14908,si:37533,ti:105443,vi:61635,wi:62274,xi:133818,yi:65702,zi:65703,Ai:65701,Bi:76256,Ci:37671,Di:49953,Fi:36216,Gi:28237,Hi:39553,Ii:29222,Ji:26107,Ki:38050,Li:26108,Ni:120745,Mi:26109,Oi:26110,Pi:66881,Qi:28236,Ri:14586,Si:57929,Ti:74723,Ui:44098,Vi:44099,Yi:23528,
Zi:61699,Wi:134104,Xi:134103,aj:59149,bj:101951,cj:97346,dj:118051,ej:95102,fj:64882,gj:119505,hj:63595,ij:63349,jj:95101,kj:75240,lj:27039,mj:68823,nj:21537,oj:83464,pj:75707,qj:83113,rj:101952,sj:101953,uj:79610,vj:125755,wj:24402,xj:24400,yj:32925,zj:57173,Aj:122502,Bj:138480,Cj:64423,Dj:64424,Ej:33986,Fj:100828,Gj:129089,Hj:21409,Lj:135155,Mj:135156,Nj:135157,Oj:135158,Pj:135159,Qj:135160,Rj:135161,Sj:135162,Tj:135163,Uj:135164,Vj:135165,Wj:135166,Ij:11070,Jj:11074,Kj:17880,Xj:14001,Zj:30709,
ak:30707,bk:30711,ck:30710,dk:30708,Yj:26984,ek:63648,fk:63649,gk:51879,hk:111059,ik:5754,jk:20445,lk:130975,kk:130976,mk:110386,nk:113746,pk:66557,qk:17310,rk:28631,sk:21589,tk:68012,uk:60480,vk:31571,wk:76980,xk:41577,yk:45469,zk:38669,Ak:13768,Bk:13777,Ck:62985,Dk:4724,Ek:59369,Fk:43927,Gk:43928,Hk:12924,Ik:100355,Lk:56219,Mk:27669,Nk:10337,Kk:47896,Ok:122629,Pk:121258,Qk:107598,Rk:127991,Sk:96639,Tk:107536,Uk:130169,Vk:96661,Wk:96658,Xk:116646,Yk:121122,Zk:96660,al:127738,bl:127083,dl:104443,
fl:96659,il:106442,jl:134840,kl:63667,ll:63668,ml:63669,nl:130686,ol:78314,pl:55761,ql:127098,rl:134841,sl:96368,ul:67374,vl:48992,wl:49956,xl:31961,yl:26388,zl:23811,Al:5E4,Bl:126250,Cl:96370,Dl:47355,El:47356,Fl:37935,Gl:45521,Hl:21760,Il:83769,Jl:49977,Kl:49974,Ll:93497,Ml:93498,Nl:34325,Ol:115803,Pl:123707,Ql:100081,Rl:35309,Sl:68314,Tl:25602,Ul:100339,Vl:59018,Wl:18248,Xl:50625,Yl:9729,Zl:37168,am:37169,bm:21667,cm:16749,dm:18635,em:39305,fm:18046,gm:53969,hm:8213,im:93926,jm:102852,km:110099,
lm:22678,mm:69076,nm:137575,pm:100856,qm:17736,rm:3832,sm:55759,tm:64031,um:93044,vm:93045,wm:34388,xm:17657,ym:17655,zm:39579,Am:39578,Bm:77448,Cm:8196,Dm:11357,Em:69877,Fm:8197,Gm:82039};function Wl(){var a=nb(Xl),b;return Gf(new yf(function(c,d){a.onSuccess=function(e){ph(e)?c(new Yl(e)):d(new Zl("Request failed, status="+(e&&"status"in e?e.status:-1),"net.badstatus",e))};
a.onError=function(e){d(new Zl("Unknown request error","net.unknown",e))};
a.onTimeout=function(e){d(new Zl("Request timed out","net.timeout",e))};
b=vh("//googleads.g.doubleclick.net/pagead/id",a)}),function(c){c instanceof Hf&&b.abort();
return Df(c)})}
function Zl(a,b,c){Wa.call(this,a+", errorCode="+b);this.errorCode=b;this.xhr=c;this.name="PromiseAjaxError"}
v(Zl,Wa);function Yl(a){this.xhr=a}
;function $l(){this.i=0;this.h=null}
$l.prototype.then=function(a,b,c){return 1===this.i&&a?(a=a.call(c,this.h),xf(a)?a:am(a)):2===this.i&&b?(a=b.call(c,this.h),xf(a)?a:bm(a)):this};
$l.prototype.getValue=function(){return this.h};
$l.prototype.$goog_Thenable=!0;function bm(a){var b=new $l;a=void 0===a?null:a;b.i=2;b.h=void 0===a?null:a;return b}
function am(a){var b=new $l;a=void 0===a?null:a;b.i=1;b.h=void 0===a?null:a;return b}
;function cm(){if(Qd())return!0;var a=F("INNERTUBE_CLIENT_NAME");return!a||"WEB"!==a&&"MWEB"!==a||Dh&&Eh("applewebkit")&&!Eh("version")&&(!Eh("safari")||Eh("gsa/"))||tc&&Eh("version/")?!0:(a=Od.get("CONSENT",void 0))?a.startsWith("YES+"):!0}
;function dm(a){Wa.call(this,a.message||a.description||a.name);this.isMissing=a instanceof em;this.isTimeout=a instanceof Zl&&"net.timeout"==a.errorCode;this.isCanceled=a instanceof Hf}
v(dm,Wa);dm.prototype.name="BiscottiError";function em(){Wa.call(this,"Biscotti ID is missing from server")}
v(em,Wa);em.prototype.name="BiscottiMissingError";var Xl={format:"RAW",method:"GET",timeout:5E3,withCredentials:!0},fm=null;function $g(){if(N("disable_biscotti_fetch_entirely_for_all_web_clients"))return Df(Error("Biscotti id fetching has been disabled entirely."));if(!cm())return Df(Error("User has not consented - not fetching biscotti id."));if("1"==lb())return Df(Error("Biscotti ID is not available in private embed mode"));fm||(fm=Gf(Wl().then(gm),function(a){return hm(2,a)}));
return fm}
function gm(a){a=a.xhr.responseText;if(0!=a.lastIndexOf(")]}'",0))throw new em;a=JSON.parse(a.substr(4));if(1<(a.type||1))throw new em;a=a.id;ah(a);fm=am(a);im(18E5,2);return a}
function hm(a,b){b=new dm(b);ah("");fm=bm(b);0<a&&im(12E4,a-1);throw b;}
function im(a,b){Lg(function(){Gf(Wl().then(gm,function(c){return hm(b,c)}),Ha)},a)}
function jm(){try{var a=C("yt.ads.biscotti.getId_");return a?a():$g()}catch(b){return Df(b)}}
;function km(a){if("1"!=lb()){a&&Zg();try{jm().then(function(){},function(){}),Lg(km,18E5)}catch(b){sg(b)}}}
;var lm=Date.now().toString();
function mm(){a:{if(window.crypto&&window.crypto.getRandomValues)try{var a=Array(16),b=new Uint8Array(16);window.crypto.getRandomValues(b);for(var c=0;c<a.length;c++)a[c]=b[c];var d=a;break a}catch(e){}d=Array(16);for(a=0;16>a;a++){b=Date.now();for(c=0;c<b%23;c++)d[a]=Math.random();d[a]=Math.floor(256*Math.random())}if(lm)for(a=1,b=0;b<lm.length;b++)d[a%16]=d[a%16]^d[(a-1)%16]/4^lm.charCodeAt(b),a++}a=[];for(b=0;b<d.length;b++)a.push("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".charAt(d[b]&63));
return a.join("")}
;var nm,om=y.ytLoggingDocDocumentNonce_;om||(om=mm(),Ua("ytLoggingDocDocumentNonce_",om));nm=om;var pm={uf:0,Oc:1,Wc:2,Ei:3,wf:4,om:5,tj:6,Jk:7,0:"DEFAULT",1:"CHAT",2:"CONVERSATIONS",3:"MINIPLAYER",4:"DIALOG",5:"VOZ",6:"MUSIC_WATCH_TABS",7:"SHARE"};function qm(a){this.h=a}
function rm(a){return new qm({trackingParams:a})}
qm.prototype.getAsJson=function(){var a={};void 0!==this.h.trackingParams?a.trackingParams=this.h.trackingParams:(a.veType=this.h.veType,void 0!==this.h.veCounter&&(a.veCounter=this.h.veCounter),void 0!==this.h.elementIndex&&(a.elementIndex=this.h.elementIndex));void 0!==this.h.dataElement&&(a.dataElement=this.h.dataElement.getAsJson());void 0!==this.h.youtubeData&&(a.youtubeData=this.h.youtubeData);return a};
qm.prototype.toString=function(){return JSON.stringify(this.getAsJson())};
qm.prototype.isClientVe=function(){return!this.h.trackingParams&&!!this.h.veType};function sm(a){a=void 0===a?0:a;return 0==a?"client-screen-nonce":"client-screen-nonce."+a}
function tm(a){a=void 0===a?0:a;return 0==a?"ROOT_VE_TYPE":"ROOT_VE_TYPE."+a}
function um(a){return F(tm(void 0===a?0:a),void 0)}
A("yt_logging_screen.getRootVeType",um,void 0);function vm(a){return(a=um(void 0===a?0:a))?new qm({veType:a,youtubeData:void 0}):null}
function wm(){var a=F("csn-to-ctt-auth-info");a||(a={},M("csn-to-ctt-auth-info",a));return a}
function xm(a){a=void 0===a?0:a;var b=F(sm(a));if(!b&&!F("USE_CSN_FALLBACK",!0))return null;b||!N("use_undefined_csn_any_layer")&&0!=a||(b="UNDEFINED_CSN");return b?b:null}
A("yt_logging_screen.getCurrentCsn",xm,void 0);function ym(a,b,c){var d=wm();(c=xm(c))&&delete d[c];b&&(d[a]=b)}
function zm(a){return wm()[a]}
A("yt_logging_screen.getCttAuthInfo",zm,void 0);function Am(a,b,c,d){c=void 0===c?0:c;if(a!==F(sm(c))||b!==F(tm(c)))ym(a,d,c),M(sm(c),a),M(tm(c),b),b=function(){setTimeout(function(){a&&qi("foregroundHeartbeatScreenAssociated",{clientDocumentNonce:nm,clientScreenNonce:a},zl)},0)},"requestAnimationFrame"in window?window.requestAnimationFrame(b):b()}
A("yt_logging_screen.setCurrentScreen",Am,void 0);function Bm(a){kk.call(this,1,arguments);this.csn=a}
v(Bm,kk);var tk=new lk("screen-created",Bm),Cm=[],Em=Dm,Fm=0;function Gm(a,b,c,d){var e=d.filter(function(f){f.csn!==b?(f.csn=b,f=!0):f=!1;return f});
c={csn:b,parentVe:c.getAsJson(),childVes:ab(e,function(f){return f.getAsJson()})};
d=u(d);for(e=d.next();!e.done;e=d.next())e=e.value.getAsJson(),(jb(e)||!e.trackingParams&&!e.veType)&&Sl(Error("Child VE logged with no data"));d={cttAuthInfo:zm(b),ea:b};"UNDEFINED_CSN"==b?Hm("visualElementAttached",c,d):a?qi("visualElementAttached",c,a,d):V("visualElementAttached",c,d)}
function Dm(){for(var a=Math.random()+"",b=[],c=0,d=0;d<a.length;d++){var e=a.charCodeAt(d);255<e&&(b[c++]=e&255,e>>=8);b[c++]=e}return Ic(b,3)}
function Hm(a,b,c){Cm.push({payloadName:a,payload:b,options:c});Fm||(Fm=uk())}
function vk(a){if(Cm){for(var b=u(Cm),c=b.next();!c.done;c=b.next())c=c.value,c.payload&&(c.payload.csn=a.csn,qi(c.payloadName,c.payload,null,c.options));Cm.length=0}Fm=0}
;function Im(){this.i=new Set;this.h=new Set;this.j=new Map}
Im.prototype.clear=function(){this.i.clear();this.h.clear();this.j.clear()};
Ia(Im);function Jm(a,b){for(var c=[],d=1;d<arguments.length;++d)c[d-1]=arguments[d];if(!Km(a)||c.some(function(e){return!Km(e)}))throw Error("Only objects may be merged.");
c=u(c);for(d=c.next();!d.done;d=c.next())Lm(a,d.value);return a}
function Lm(a,b){for(var c in b)if(Km(b[c])){if(c in a&&!Km(a[c]))throw Error("Cannot merge an object into a non-object.");c in a||(a[c]={});Lm(a[c],b[c])}else if(Mm(b[c])){if(c in a&&!Mm(a[c]))throw Error("Cannot merge an array into a non-array.");c in a||(a[c]=[]);Nm(a[c],b[c])}else a[c]=b[c];return a}
function Nm(a,b){b=u(b);for(var c=b.next();!c.done;c=b.next())c=c.value,Km(c)?a.push(Lm({},c)):Mm(c)?a.push(Nm([],c)):a.push(c);return a}
function Km(a){return"object"===typeof a&&!Array.isArray(a)}
function Mm(a){return"object"===typeof a&&Array.isArray(a)}
;function Om(a,b){kk.call(this,1,arguments)}
v(Om,kk);function Pm(a,b){kk.call(this,1,arguments)}
v(Pm,kk);var Qm=new lk("aft-recorded",Om),Rm=new lk("timing-sent",Pm);var Sm=window;function Tm(){this.timing={};this.clearResourceTimings=function(){};
this.webkitClearResourceTimings=function(){};
this.mozClearResourceTimings=function(){};
this.msClearResourceTimings=function(){};
this.oClearResourceTimings=function(){}}
var W=Sm.performance||Sm.mozPerformance||Sm.msPerformance||Sm.webkitPerformance||new Tm;var Um=!1,Vm={'script[name="scheduler/scheduler"]':"sj",'script[name="player/base"]':"pj",'link[rel="stylesheet"][name="www-player"]':"pc",'link[rel="stylesheet"][name="player/www-player"]':"pc",'script[name="desktop_polymer/desktop_polymer"]':"dpj",'link[rel="import"][name="desktop_polymer"]':"dph",'script[name="mobile-c3"]':"mcj",'link[rel="stylesheet"][name="mobile-c3"]':"mcc",'script[name="player-plasma-ias-phone/base"]':"mcppj",'script[name="player-plasma-ias-tablet/base"]':"mcptj",'link[rel="stylesheet"][name="mobile-polymer-player-ias"]':"mcpc",
'link[rel="stylesheet"][name="mobile-polymer-player-svg-ias"]':"mcpsc",'script[name="mobile_blazer_core_mod"]':"mbcj",'link[rel="stylesheet"][name="mobile_blazer_css"]':"mbc",'script[name="mobile_blazer_logged_in_users_mod"]':"mbliuj",'script[name="mobile_blazer_logged_out_users_mod"]':"mblouj",'script[name="mobile_blazer_noncore_mod"]':"mbnj","#player_css":"mbpc",'script[name="mobile_blazer_desktopplayer_mod"]':"mbpj",'link[rel="stylesheet"][name="mobile_blazer_tablet_css"]':"mbtc",'script[name="mobile_blazer_watch_mod"]':"mbwj"};
Sa(W.clearResourceTimings||W.webkitClearResourceTimings||W.mozClearResourceTimings||W.msClearResourceTimings||W.oClearResourceTimings||Ha,W);function Wm(a){var b=Xm(a);if(b.aft)return b.aft;a=F((a||"")+"TIMING_AFT_KEYS",["ol"]);for(var c=a.length,d=0;d<c;d++){var e=b[a[d]];if(e)return e}return NaN}
function Ym(){var a;if(N("csi_use_performance_navigation_timing")){var b,c,d,e=null===(d=null===(c=null===(b=null===(a=null===W||void 0===W?void 0:W.getEntriesByType)||void 0===a?void 0:a.call(W,"navigation"))||void 0===b?void 0:b[0])||void 0===c?void 0:c.toJSON)||void 0===d?void 0:d.call(c);e?(e.requestStart=Zm(e.requestStart),e.responseEnd=Zm(e.responseEnd),e.redirectStart=Zm(e.redirectStart),e.redirectEnd=Zm(e.redirectEnd),e.domainLookupEnd=Zm(e.domainLookupEnd),e.connectStart=Zm(e.connectStart),
e.connectEnd=Zm(e.connectEnd),e.responseStart=Zm(e.responseStart),e.secureConnectionStart=Zm(e.secureConnectionStart),e.domainLookupStart=Zm(e.domainLookupStart),e.isPerformanceNavigationTiming=!0,a=e):a=W.timing}else a=W.timing;return a}
function $m(){return N("csi_use_time_origin")&&W.timeOrigin?Math.floor(W.timeOrigin):W.timing.navigationStart}
function Zm(a){return Math.round($m()+a)}
function an(a){var b;(b=C("ytcsi."+(a||"")+"data_"))||(b={tick:{},info:{}},Ua("ytcsi."+(a||"")+"data_",b));return b}
function bn(a){a=an(a);a.info||(a.info={});return a.info}
function Xm(a){a=an(a);a.tick||(a.tick={});return a.tick}
function cn(a){var b=an(a).nonce;b||(b=mm(),an(a).nonce=b);return b}
function dn(a){var b=Xm(a||""),c=Wm(a);c&&!Um&&(qk(Qm,new Om(Math.round(c-b._start),a)),Um=!0)}
;function en(){if(W.getEntriesByType){var a=W.getEntriesByType("paint");if(a=cb(a,function(b){return"first-paint"===b.name}))return Zm(a.startTime)}a=W.timing;
return a.Lb?Math.max(0,a.Lb):0}
;function fn(){var a=C("ytcsi.debug");a||(a=[],A("ytcsi.debug",a,void 0),A("ytcsi.reference",{},void 0));return a}
function gn(a){a=a||"";var b=C("ytcsi.reference");b||(fn(),b=C("ytcsi.reference"));if(b[a])return b[a];var c=fn(),d={timerName:a,info:{},tick:{},span:{}};c.push(d);return b[a]=d}
;var jn=y.ytLoggingLatencyUsageStats_||{};A("ytLoggingLatencyUsageStats_",jn,void 0);function kn(){this.h=0}
function ln(){kn.h||(kn.h=new kn);return kn.h}
kn.prototype.tick=function(a,b,c,d){mn(this,"tick_"+a+"_"+b)||V("latencyActionTicked",{tickName:a,clientActionNonce:b},{timestamp:c,cttAuthInfo:d})};
kn.prototype.info=function(a,b,c){var d=Object.keys(a).join("");mn(this,"info_"+d+"_"+b)||(a=Object.assign({},a),a.clientActionNonce=b,V("latencyActionInfo",a,{cttAuthInfo:c}))};
kn.prototype.span=function(a,b,c){var d=Object.keys(a).join("");mn(this,"span_"+d+"_"+b)||(a.clientActionNonce=b,V("latencyActionSpan",a,{cttAuthInfo:c}))};
function mn(a,b){jn[b]=jn[b]||{count:0};var c=jn[b];c.count++;c.time=O();a.h||(a.h=Pg(function(){var d=O(),e;for(e in jn)jn[e]&&6E4<d-jn[e].time&&delete jn[e];a&&(a.h=0)},5E3));
return 5<c.count?(6===c.count&&1>1E5*Math.random()&&(c=new Qi("CSI data exceeded logging limit with key",b.split("_")),0<=b.indexOf("plev")||Sl(c)),!0):!1}
;var X={},nn=(X.auto_search="LATENCY_ACTION_AUTO_SEARCH",X.ad_to_ad="LATENCY_ACTION_AD_TO_AD",X.ad_to_video="LATENCY_ACTION_AD_TO_VIDEO",X["analytics.explore"]="LATENCY_ACTION_CREATOR_ANALYTICS_EXPLORE",X.app_startup="LATENCY_ACTION_APP_STARTUP",X["artist.analytics"]="LATENCY_ACTION_CREATOR_ARTIST_ANALYTICS",X["artist.events"]="LATENCY_ACTION_CREATOR_ARTIST_CONCERTS",X["artist.presskit"]="LATENCY_ACTION_CREATOR_ARTIST_PROFILE",X.browse="LATENCY_ACTION_BROWSE",X.channels="LATENCY_ACTION_CHANNELS",X.creator_channel_dashboard=
"LATENCY_ACTION_CREATOR_CHANNEL_DASHBOARD",X["channel.analytics"]="LATENCY_ACTION_CREATOR_CHANNEL_ANALYTICS",X["channel.comments"]="LATENCY_ACTION_CREATOR_CHANNEL_COMMENTS",X["channel.content"]="LATENCY_ACTION_CREATOR_POST_LIST",X["channel.copyright"]="LATENCY_ACTION_CREATOR_CHANNEL_COPYRIGHT",X["channel.editing"]="LATENCY_ACTION_CREATOR_CHANNEL_EDITING",X["channel.monetization"]="LATENCY_ACTION_CREATOR_CHANNEL_MONETIZATION",X["channel.music"]="LATENCY_ACTION_CREATOR_CHANNEL_MUSIC",X["channel.playlists"]=
"LATENCY_ACTION_CREATOR_CHANNEL_PLAYLISTS",X["channel.translations"]="LATENCY_ACTION_CREATOR_CHANNEL_TRANSLATIONS",X["channel.videos"]="LATENCY_ACTION_CREATOR_CHANNEL_VIDEOS",X["channel.live_streaming"]="LATENCY_ACTION_CREATOR_LIVE_STREAMING",X.chips="LATENCY_ACTION_CHIPS",X["dialog.copyright_strikes"]="LATENCY_ACTION_CREATOR_DIALOG_COPYRIGHT_STRIKES",X["dialog.uploads"]="LATENCY_ACTION_CREATOR_DIALOG_UPLOADS",X.direct_playback="LATENCY_ACTION_DIRECT_PLAYBACK",X.embed="LATENCY_ACTION_EMBED",X.entity_key_serialization_perf=
"LATENCY_ACTION_ENTITY_KEY_SERIALIZATION_PERF",X.entity_key_deserialization_perf="LATENCY_ACTION_ENTITY_KEY_DESERIALIZATION_PERF",X.explore="LATENCY_ACTION_EXPLORE",X.home="LATENCY_ACTION_HOME",X.library="LATENCY_ACTION_LIBRARY",X.live="LATENCY_ACTION_LIVE",X.live_pagination="LATENCY_ACTION_LIVE_PAGINATION",X.onboarding="LATENCY_ACTION_ONBOARDING",X.parent_profile_settings="LATENCY_ACTION_KIDS_PARENT_PROFILE_SETTINGS",X.parent_tools_collection="LATENCY_ACTION_PARENT_TOOLS_COLLECTION",X.parent_tools_dashboard=
"LATENCY_ACTION_PARENT_TOOLS_DASHBOARD",X.player_att="LATENCY_ACTION_PLAYER_ATTESTATION",X["post.comments"]="LATENCY_ACTION_CREATOR_POST_COMMENTS",X["post.edit"]="LATENCY_ACTION_CREATOR_POST_EDIT",X.prebuffer="LATENCY_ACTION_PREBUFFER",X.prefetch="LATENCY_ACTION_PREFETCH",X.profile_settings="LATENCY_ACTION_KIDS_PROFILE_SETTINGS",X.profile_switcher="LATENCY_ACTION_LOGIN",X.reel_watch="LATENCY_ACTION_REEL_WATCH",X.results="LATENCY_ACTION_RESULTS",X.search_ui="LATENCY_ACTION_SEARCH_UI",X.search_suggest=
"LATENCY_ACTION_SUGGEST",X.search_zero_state="LATENCY_ACTION_SEARCH_ZERO_STATE",X.secret_code="LATENCY_ACTION_KIDS_SECRET_CODE",X.seek="LATENCY_ACTION_PLAYER_SEEK",X.settings="LATENCY_ACTION_SETTINGS",X.tenx="LATENCY_ACTION_TENX",X.video_to_ad="LATENCY_ACTION_VIDEO_TO_AD",X.watch="LATENCY_ACTION_WATCH",X.watch_it_again="LATENCY_ACTION_KIDS_WATCH_IT_AGAIN",X["watch,watch7"]="LATENCY_ACTION_WATCH",X["watch,watch7_html5"]="LATENCY_ACTION_WATCH",X["watch,watch7ad"]="LATENCY_ACTION_WATCH",X["watch,watch7ad_html5"]=
"LATENCY_ACTION_WATCH",X.wn_comments="LATENCY_ACTION_LOAD_COMMENTS",X.ww_rqs="LATENCY_ACTION_WHO_IS_WATCHING",X["video.analytics"]="LATENCY_ACTION_CREATOR_VIDEO_ANALYTICS",X["video.comments"]="LATENCY_ACTION_CREATOR_VIDEO_COMMENTS",X["video.edit"]="LATENCY_ACTION_CREATOR_VIDEO_EDIT",X["video.editor"]="LATENCY_ACTION_CREATOR_VIDEO_VIDEO_EDITOR",X["video.editor_async"]="LATENCY_ACTION_CREATOR_VIDEO_VIDEO_EDITOR_ASYNC",X["video.live_settings"]="LATENCY_ACTION_CREATOR_VIDEO_LIVE_SETTINGS",X["video.live_streaming"]=
"LATENCY_ACTION_CREATOR_VIDEO_LIVE_STREAMING",X["video.monetization"]="LATENCY_ACTION_CREATOR_VIDEO_MONETIZATION",X["video.translations"]="LATENCY_ACTION_CREATOR_VIDEO_TRANSLATIONS",X.voice_assistant="LATENCY_ACTION_VOICE_ASSISTANT",X.cast_load_by_entity_to_watch="LATENCY_ACTION_CAST_LOAD_BY_ENTITY_TO_WATCH",X.networkless_performance="LATENCY_ACTION_NETWORKLESS_PERFORMANCE",X),Y={},on=(Y.ad_allowed="adTypesAllowed",Y.yt_abt="adBreakType",Y.ad_cpn="adClientPlaybackNonce",Y.ad_docid="adVideoId",Y.yt_ad_an=
"adNetworks",Y.ad_at="adType",Y.aida="appInstallDataAgeMs",Y.browse_id="browseId",Y.p="httpProtocol",Y.t="transportProtocol",Y.cs="commandSource",Y.cpn="clientPlaybackNonce",Y.ccs="creatorInfo.creatorCanaryState",Y.ctop="creatorInfo.topEntityType",Y.csn="clientScreenNonce",Y.docid="videoId",Y.GetHome_rid="requestIds",Y.GetSearch_rid="requestIds",Y.GetPlayer_rid="requestIds",Y.GetWatchNext_rid="requestIds",Y.GetBrowse_rid="requestIds",Y.GetLibrary_rid="requestIds",Y.is_continuation="isContinuation",
Y.is_nav="isNavigation",Y.b_p="kabukiInfo.browseParams",Y.is_prefetch="kabukiInfo.isPrefetch",Y.is_secondary_nav="kabukiInfo.isSecondaryNav",Y.nav_type="kabukiInfo.navigationType",Y.prev_browse_id="kabukiInfo.prevBrowseId",Y.query_source="kabukiInfo.querySource",Y.voz_type="kabukiInfo.vozType",Y.yt_lt="loadType",Y.mver="creatorInfo.measurementVersion",Y.yt_ad="isMonetized",Y.nr="webInfo.navigationReason",Y.nrsu="navigationRequestedSameUrl",Y.ncnp="webInfo.nonPreloadedNodeCount",Y.pnt="performanceNavigationTiming",
Y.prt="playbackRequiresTap",Y.plt="playerInfo.playbackType",Y.pis="playerInfo.playerInitializedState",Y.paused="playerInfo.isPausedOnLoad",Y.yt_pt="playerType",Y.fmt="playerInfo.itag",Y.yt_pl="watchInfo.isPlaylist",Y.yt_pre="playerInfo.preloadType",Y.yt_ad_pr="prerollAllowed",Y.pa="previousAction",Y.yt_red="isRedSubscriber",Y.rce="mwebInfo.responseContentEncoding",Y.rc="resourceInfo.resourceCache",Y.scrh="screenHeight",Y.scrw="screenWidth",Y.st="serverTimeMs",Y.ssdm="shellStartupDurationMs",Y.br_trs=
"tvInfo.bedrockTriggerState",Y.kebqat="kabukiInfo.earlyBrowseRequestInfo.abandonmentType",Y.kebqa="kabukiInfo.earlyBrowseRequestInfo.adopted",Y.label="tvInfo.label",Y.is_mdx="tvInfo.isMdx",Y.preloaded="tvInfo.isPreloaded",Y.aac_type="tvInfo.authAccessCredentialType",Y.upg_player_vis="playerInfo.visibilityState",Y.query="unpluggedInfo.query",Y.upg_chip_ids_string="unpluggedInfo.upgChipIdsString",Y.yt_vst="videoStreamType",Y.vph="viewportHeight",Y.vpw="viewportWidth",Y.yt_vis="isVisible",Y.rcl="mwebInfo.responseContentLength",
Y.GetSettings_rid="requestIds",Y.GetTrending_rid="requestIds",Y.GetMusicSearchSuggestions_rid="requestIds",Y.REQUEST_ID="requestIds",Y),pn="isContinuation isNavigation kabukiInfo.earlyBrowseRequestInfo.adopted kabukiInfo.isPrefetch kabukiInfo.isSecondaryNav isMonetized navigationRequestedSameUrl performanceNavigationTiming playerInfo.isPausedOnLoad prerollAllowed isRedSubscriber tvInfo.isMdx tvInfo.isPreloaded isVisible watchInfo.isPlaylist playbackRequiresTap".split(" "),qn={},rn=(qn.ccs="CANARY_STATE_",
qn.mver="MEASUREMENT_VERSION_",qn.pis="PLAYER_INITIALIZED_STATE_",qn.yt_pt="LATENCY_PLAYER_",qn.pa="LATENCY_ACTION_",qn.ctop="TOP_ENTITY_TYPE_",qn.yt_vst="VIDEO_STREAM_TYPE_",qn),sn="all_vc ap aq c cbr cbrand cbrver cmodel cos cosver cplatform ctheme cver ei l_an l_mm plid srt yt_fss yt_li vpst vpni2 vpil2 icrc icrt pa GetAccountOverview_rid GetHistory_rid cmt d_vpct d_vpnfi d_vpni nsru pc pfa pfeh pftr pnc prerender psc rc start tcrt tcrc ssr vpr vps yt_abt yt_fn yt_fs yt_pft yt_pre yt_pt yt_pvis ytu_pvis yt_ref yt_sts tds".split(" ");
function tn(a){return!!F("FORCE_CSI_ON_GEL",!1)||N("csi_on_gel")||N("enable_csi_on_gel")||N("unplugged_tvhtml5_csi_on_gel")||!!an(a).useGel}
function un(a,b,c){var d=vn(c);d.gelTicks&&(d.gelTicks["tick_"+a]=!0);c||b||O();if(tn(c)){gn(c||"").tick[a]=b||O();d=cn(c);var e=an(c).cttAuthInfo;"_start"===a?(a=ln(),mn(a,"baseline_"+d)||V("latencyActionBaselined",{clientActionNonce:d},{timestamp:b,cttAuthInfo:e})):ln().tick(a,d,b,e);dn(c);return!0}return!1}
function wn(a,b,c){c=vn(c);if(c.gelInfos)c.gelInfos["info_"+a]=!0;else{var d={};c.gelInfos=(d["info_"+a]=!0,d)}if(a.match("_rid")){var e=a.split("_rid")[0];a="REQUEST_ID"}if(a in on){c=on[a];0<=Za(pn,c)&&(b=!!b);a in rn&&"string"===typeof b&&(b=rn[a]+b.toUpperCase());a=b;b=c.split(".");for(var f=d={},g=0;g<b.length-1;g++){var h=b[g];f[h]={};f=f[h]}f[b[b.length-1]]="requestIds"===c?[{id:a,endpoint:e}]:a;return Jm({},d)}0<=Za(sn,a)||Sl(new Qi("Unknown label logged with GEL CSI",a))}
function vn(a){a=an(a);if(a.gel){var b=a.gel;b.gelInfos||(b.gelInfos={});b.gelTicks||(b.gelTicks={})}else a.gel={gelTicks:{},gelInfos:{}};return a.gel}
function xn(a){a=vn(a);a.gelInfos||(a.gelInfos={});return a.gelInfos}
;function yn(a,b,c){null!==b&&(bn(c)[a]=b,tn(c)?(a=wn(a,b,c))&&tn(c)&&(b=gn(c||""),Jm(b.info,a),Jm(xn(c),a),b=cn(c),c=an(c).cttAuthInfo,ln().info(a,b,c)):gn(c||"").info[a]=b)}
function Z(a,b,c){var d=Xm(c);if(!b&&"_"!==a[0]){var e=a;W.mark&&(0==e.lastIndexOf("mark_",0)||(e="mark_"+e),c&&(e+=" ("+c+")"),W.mark(e))}e=b||O();d[a]=e;un(a,b,c)||c||(zn(),gn("").tick[a]=b||O());return d[a]}
function An(){var a=cn(void 0);requestAnimationFrame(function(){setTimeout(function(){a===cn(void 0)&&Z("ol",void 0,void 0)},0)})}
function zn(){if(!C("yt.timing.pingSent_")){var a=F("TIMING_ACTION",void 0),b=Xm();if(a=!!C("ytglobal.timingready_")&&a)a="_start"in Xm(void 0);if(a&&Wm()){dn();a=!0;var c=F("TIMING_WAIT",[]);if(c.length)for(var d=0,e=c.length;d<e;++d)if(!(c[d]in b)){a=!1;break}if(a&&!tn()){c=Xm();d=bn();e=c._start;var f=F("CSI_SERVICE_NAME","youtube");a={v:2,s:f,action:F("TIMING_ACTION",void 0)};b=d.srt;void 0!==c.srt&&delete d.srt;c.aft=Wm();var g=Xm(void 0),h=g.pbr,k=g.vc;g=g.pbs;h&&k&&g&&h<k&&k<g&&bn(void 0).yt_pvis&&
"youtube"===f&&(yn("yt_lt","hot_bg"),f=c.vc,h=c.pbs,delete c.aft,d.aft=Math.round(h-f));for(var l in d)"_"!==l.charAt(0)&&(a[l]=d[l]);c.ps=O();l={};f=[];for(var n in c)"_"!==n.charAt(0)&&(h=Math.round(c[n]-e),l[n]=h,f.push(n+"."+h));a.rt=f.join(",");n=!!d.ap;c="";for(var p in a)a.hasOwnProperty(p)&&(c+="&"+p+"="+a[p]);p="/csi_204?"+c.substring(1);window.navigator&&n?Kh(p):Hh(p);A("yt.timing.pingSent_",!0,void 0);qk(Rm,new Pm(l.aft+(Number(b)||0)))}}}}
function Bn(){var a=document;if("visibilityState"in a)a=a.visibilityState;else{var b=Bg+"VisibilityState";a=b in a?a[b]:void 0}switch(a){case "hidden":return 0;case "visible":return 1;case "prerender":return 2;case "unloaded":return 3;default:return-1}}
function Cn(a,b){a=document.querySelector(a);if(!a)return!1;var c="",d=a.nodeName;"SCRIPT"===d?(c=a.src,c||(c=a.getAttribute("data-timing-href"))&&(c=window.location.protocol+c)):"LINK"===d&&(c=a.href);bc()&&a.setAttribute("nonce",bc());return c?(a=W.getEntriesByName(c))&&a[0]&&(a=a[0],c=$m(),Z("rsf_"+b,c+Math.round(a.fetchStart)),Z("rse_"+b,c+Math.round(a.responseEnd)),void 0!==a.transferSize&&0===a.transferSize)?!0:!1:!1}
function Dn(){var a=window.location.protocol,b=W.getEntriesByType("resource");b=$a(b,function(c){return 0===c.name.indexOf(a+"//fonts.gstatic.com/s/")});
(b=bb(b,function(c,d){return d.duration>c.duration?d:c},{duration:0}))&&0<b.startTime&&0<b.responseEnd&&(Z("wffs",Zm(b.startTime)),Z("wffe",Zm(b.responseEnd)))}
var En=window;En.ytcsi&&(En.ytcsi.info=yn,En.ytcsi.tick=Z);function Fn(){this.A=[];this.o=[];this.h=[];this.l=[];this.m=[];this.i=new Set;this.B=new Map}
function Gn(a,b,c){c=void 0===c?0:c;b.then(function(d){var e,f;a.i.has(c)&&a.j&&a.j();var g=xm(c),h=vm(c);g&&h&&((null===(e=d.response)||void 0===e?0:e.trackingParams)&&Gm(a.client,g,h,[rm(d.response.trackingParams)]),(null===(f=d.playerResponse)||void 0===f?0:f.trackingParams)&&Gm(a.client,g,h,[rm(d.playerResponse.trackingParams)]))})}
function Hn(a,b,c,d){d=void 0===d?0:d;if(a.i.has(d))a.A.push([b,c]);else{var e=xm(d);c=c||vm(d);e&&c&&Gm(a.client,e,c,[b])}}
Fn.prototype.clickCommand=function(a,b,c){a=a.clickTrackingParams;c=void 0===c?0:c;if(a)if(c=xm(void 0===c?0:c)){var d=this.client;var e="INTERACTION_LOGGING_GESTURE_TYPE_GENERIC_CLICK";a={csn:c,ve:rm(a).getAsJson(),gestureType:e};b&&(a.clientData=b);b={cttAuthInfo:zm(c),ea:c};"UNDEFINED_CSN"==c?Hm("visualElementGestured",a,b):d?qi("visualElementGestured",a,d,b):V("visualElementGestured",a,b);b=!0}else b=!1;else b=!1;return b};
function In(a,b,c){c=void 0===c?{}:c;a.i.add(c.layer||0);a.j=function(){Jn(a,b,c);var f=vm(c.layer);if(f){for(var g=u(a.A),h=g.next();!h.done;h=g.next())h=h.value,Hn(a,h[0],h[1]||f,c.layer);f=u(a.o);for(g=f.next();!g.done;g=f.next()){var k=g.value;g=void 0;g=void 0===g?0:g;h=xm(g);var l=k[0]||vm(g);h&&l&&(g=a.client,k=k[1],k={csn:h,ve:l.getAsJson(),clientData:k},l={cttAuthInfo:zm(h),ea:h},"UNDEFINED_CSN"==h?Hm("visualElementStateChanged",k,l):g?qi("visualElementStateChanged",k,g,l):V("visualElementStateChanged",
k,l))}}};
xm(c.layer)||a.j();if(c.bb)for(var d=u(c.bb),e=d.next();!e.done;e=d.next())Gn(a,e.value,c.layer);else Tl(Error("Delayed screen needs a data promise."))}
function Jn(a,b,c){c=void 0===c?{}:c;c.layer||(c.layer=0);var d=void 0!==c.Mb?c.Mb:c.layer;var e=xm(d);d=vm(d);var f;d&&(void 0!==c.parentCsn?f={clientScreenNonce:c.parentCsn,visualElement:d}:e&&"UNDEFINED_CSN"!==e&&(f={clientScreenNonce:e,visualElement:d}));var g,h=F("EVENT_ID");"UNDEFINED_CSN"===e&&h&&(g={servletData:{serializedServletEventId:h}});try{var k=a.client;h=f;var l=c.ab,n=c.cttAuthInfo,p=c.Mm,r=Em(),q={csn:r,pageVe:(new qm({veType:b,youtubeData:g})).getAsJson()};h&&h.visualElement?(q.implicitGesture=
{parentCsn:h.clientScreenNonce,gesturedVe:h.visualElement.getAsJson()},p&&(q.implicitGesture.gestureType=p)):h&&Sl(new Qi("newScreen() parent element does not have a VE - rootVe",b));l&&(q.cloneCsn=l);l={cttAuthInfo:n,ea:r};k?qi("screenCreated",q,k,l):V("screenCreated",q,l);qk(tk,new Bm(r));var z=r}catch(B){Ul(B,{Rm:b,rootVe:d,parentVisualElement:void 0,Lm:e,Qm:f,ab:c.ab});Tl(B);return}Am(z,b,c.layer,c.cttAuthInfo);if((b=e&&"UNDEFINED_CSN"!==e&&d)&&!(b=N("screen_manager_skip_hide_killswitch"))){a:{b=
u(Object.values(pm));for(f=b.next();!f.done;f=b.next())if(xm(f.value)==e){b=!0;break a}b=!1}b=!b}b&&(b=a.client,f=!0,k=(f=void 0===f?!1:f)?16:8,d={csn:e,ve:d.getAsJson(),eventType:k},f={cttAuthInfo:zm(e),ea:e,yb:f},"UNDEFINED_CSN"==e?Hm("visualElementHidden",d,f):b?qi("visualElementHidden",d,b,f):V("visualElementHidden",d,f));a.h[a.h.length-1]&&!a.h[a.h.length-1].csn&&(a.h[a.h.length-1].csn=z||"");yn("csn",z);Im.getInstance().clear();d=vm(c.layer);e&&"UNDEFINED_CSN"!==e&&d&&(N("web_mark_root_visible")||
N("music_web_mark_root_visible"))&&(e=z,z={csn:e,ve:d.getAsJson(),eventType:1},b={cttAuthInfo:zm(e),ea:e},"UNDEFINED_CSN"==e?Hm("visualElementShown",z,b):V("visualElementShown",z,b));a.i.delete(c.layer||0);a.j=void 0;e=u(a.B);for(z=e.next();!z.done;z=e.next())b=u(z.value),z=b.next().value,b=b.next().value,b.has(c.layer)&&d&&Hn(a,z,d,c.layer);for(c=0;c<a.l.length;c++){e=a.l[c];try{e()}catch(B){Tl(B)}}for(c=a.l.length=0;c<a.m.length;c++){e=a.m[c];try{e()}catch(B){Tl(B)}}}
;function Kn(a){a&&(a.dataset?a.dataset[Ln("loaded")]="true":a.setAttribute("data-loaded","true"))}
function Mn(a,b){return a?a.dataset?a.dataset[Ln(b)]:a.getAttribute("data-"+b):null}
var Nn={};function Ln(a){return Nn[a]||(Nn[a]=String(a).replace(/\-([a-z])/g,function(b,c){return c.toUpperCase()}))}
;var On=/\.vflset|-vfl[a-zA-Z0-9_+=-]+/,Pn=/-[a-zA-Z]{2,3}_[a-zA-Z]{2,3}(?=(\/|$))/;function Qn(a,b,c){c=void 0===c?null:c;if(window.spf&&spf.script){c="";if(a){var d=a.indexOf("jsbin/"),e=a.lastIndexOf(".js"),f=d+6;-1<d&&-1<e&&e>f&&(c=a.substring(f,e),c=c.replace(On,""),c=c.replace(Pn,""),c=c.replace("debug-",""),c=c.replace("tracing-",""))}spf.script.load(a,c,b)}else Rn(a,b,c)}
function Rn(a,b,c){c=void 0===c?null:c;var d=Sn(a),e=document.getElementById(d),f=e&&Mn(e,"loaded"),g=e&&!f;f?b&&b():(b&&(f=Ph(d,b),b=""+Ma(b),Tn[b]=f),g||(e=Un(a,d,function(){Mn(e,"loaded")||(Kn(e),Sh(d),Lg(Ta(Th,d),0))},c)))}
function Un(a,b,c,d){d=void 0===d?null:d;var e=wd(document,"SCRIPT");e.id=b;e.onload=function(){c&&setTimeout(c,0)};
e.onreadystatechange=function(){switch(e.readyState){case "loaded":case "complete":e.onload()}};
d&&e.setAttribute("nonce",d);pd(e,pf(a));a=document.getElementsByTagName("head")[0]||document.body;a.insertBefore(e,a.firstChild);return e}
function Vn(a){a=Sn(a);var b=document.getElementById(a);b&&(Th(a),b.parentNode.removeChild(b))}
function Wn(a,b){a&&b&&(a=""+Ma(b),(a=Tn[a])&&Rh(a))}
function Sn(a){var b=document.createElement("a");Zb(b,a);a=b.href.replace(/^[a-zA-Z]+:\/\//,"//");return"js-"+dc(a)}
var Tn={};var Xn=[],Yn=!1;function Zn(){if(!N("disable_biscotti_fetch_for_ad_blocker_detection")&&!N("disable_biscotti_fetch_entirely_for_all_web_clients")&&cm()&&"1"!=lb()){var a=function(){Yn=!0;"google_ad_status"in window?M("DCLKSTAT",1):M("DCLKSTAT",2)};
try{Qn("//static.doubleclick.net/instream/ad_status.js",a)}catch(b){}Xn.push(Tg.K(function(){if(!(Yn||"google_ad_status"in window)){try{Wn("//static.doubleclick.net/instream/ad_status.js",a)}catch(b){}Yn=!0;M("DCLKSTAT",3)}},5E3))}}
function $n(){var a=Number(F("DCLKSTAT",0));return isNaN(a)?0:a}
;function ao(){this.i=!1;this.h=null}
ao.prototype.initialize=function(a,b,c,d){d=void 0===d?!1:d;var e,f;if(a.program){var g=null!==(e=a.interpreterScript)&&void 0!==e?e:null,h=null!==(f=a.interpreterUrl)&&void 0!==f?f:null;if(a.interpreterSafeScript){g=a.interpreterSafeScript;vb("From proto message. b/166824318");g=g.privateDoNotAccessOrElseSafeScriptWrappedValue||"";var k=sb();g=k?k.createScript(g):g;g=(new xb(g)).toString()}a.interpreterSafeUrl&&(h=a.interpreterSafeUrl,vb("From proto message. b/166824318"),h=Bb(h.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue||
"").toString());bo(this,g,h,a.program,b,c,d)}else Sl(Error("Cannot initialize botguard without program"))};
function bo(a,b,c,d,e,f,g){g=void 0===g?!1:g;c?(a.i=!0,Qn(c,function(){a.i=!1;var h=0<=c.indexOf("/th/");(h?window.trayride:window.botguard)?co(a,d,!!g,h,e):(Vn(c),Sl(new Qi("Unable to load Botguard","from "+c)))},f)):b&&(f=wd(document,"SCRIPT"),f.textContent=b,f.nonce=bc(),document.head.appendChild(f),document.head.removeChild(f),((b=b.includes("trayride"))?window.trayride:window.botguard)?co(a,d,!!g,b,e):Sl(Error("Unable to load Botguard from JS")))}
function co(a,b,c,d,e){var f,g;if(d=d?null===(f=window.trayride)||void 0===f?void 0:f.ad:null===(g=window.botguard)||void 0===g?void 0:g.bg)if(c)try{eo(a,new d(b,e?function(){return e(b)}:Ha))}catch(h){h instanceof Error&&Sl(h)}else{try{eo(a,new d(b))}catch(h){h instanceof Error&&Sl(h)}e&&e(b)}else Sl(Error("Failed to finish initializing VM"))}
ao.prototype.invoke=function(a){a=void 0===a?{}:a;return this.h?this.h.hasOwnProperty("hot")?this.h.hot(void 0,void 0,a):this.h.invoke(void 0,void 0,a):null};
ao.prototype.dispose=function(){this.h=null};
function eo(a,b){a.h=b}
;var fo=new ao;function go(){return!!fo.h}
function ho(a){a=void 0===a?{}:a;return fo.invoke(a)}
;var io=window,jo=/[A-Za-z]+\/[0-9.]+/g;function ko(a,b){if(a.replace(jo,"")!==b.replace(jo,""))return!1;a=a.match(jo);b=b.match(jo);if(a.length!==b.length)return!1;for(var c=0;c<a.length;c++){var d=a[c],e=b[c];if(!d.startsWith(e)&&!e.startsWith(d))return!1}return!0}
function lo(){var a=io.uaChPolyfill.state;if(0===a.type)V("clientHintsPolyfillEvent",{clientHintsSupported:!1});else{var b=navigator.userAgent,c=void 0!==a.syntheticUa&&ko(a.syntheticUa,b),d={clientHintsSupported:!0,uaAccessedBeforePolyfill:a.didAccessUaBeforePolyfillAvailable,syntheticUaMatches:c};a.didAccessUaBeforePolyfillAvailable&&(d.uaAccessBeforePolyfillCount=a.uaAccessBeforePolyfillCount,a.firstAccessUaError&&(d.firstUaAccessStack=String(a.firstAccessUaError.stack).replace(/\n/g,""),Tl(a.firstAccessUaError)),
d.polyfillAvailabilityDelayMs=a.polyfillAvailabilityDelay);V("clientHintsPolyfillEvent",d);c||(b={syntheticUa:a.syntheticUa,ua:b},b.brand=a.data.brands.map(function(e){return'"'+e.brand+'"; v="'+e.version+'"'}),b.mobileness=a.data.mobile,a=a.data.values,a.architecture&&(b.platformArchitecture=a.architecture),a.model&&(b.model=a.model),a.platform&&(b.platformBrand=a.platform),a.platformVersion&&(b.platformVersion=a.platformVersion),a.uaFullVersion&&(b.fullVersion=a.uaFullVersion),V("clientHintsPolyfillDiagnostics",
b))}}
var mo=!1;function no(){var a;1===(null===(a=io.uaChPolyfill)||void 0===a?void 0:a.state.type)?mo||(io.uaChPolyfill.onReady=no,mo=!0):io.uaChPolyfill&&lo()}
;function oo(a,b,c){J.call(this);var d=this;c=c||F("POST_MESSAGE_ORIGIN",void 0)||window.document.location.protocol+"//"+window.document.location.hostname;this.j=b||null;this.C="*";this.l=c;this.sessionId=null;this.channel="widget";this.G=!!a;this.B=function(e){a:if(!("*"!=d.l&&e.origin!=d.l||d.j&&e.source!=d.j||"string"!==typeof e.data)){try{var f=JSON.parse(e.data)}catch(g){break a}if(!(null==f||d.G&&(d.sessionId&&d.sessionId!=f.id||d.channel&&d.channel!=f.channel))&&f)switch(f.event){case "listening":"null"!=
e.origin&&(d.l=d.C=e.origin);d.j=e.source;d.sessionId=f.id;d.i&&(d.i(),d.i=null);break;case "command":d.m&&(!d.o||0<=Za(d.o,f.func))&&d.m(f.func,f.args,e.origin)}}};
this.o=this.i=this.m=null;window.addEventListener("message",this.B)}
v(oo,J);oo.prototype.sendMessage=function(a,b){if(b=b||this.j){this.sessionId&&(a.id=this.sessionId);this.channel&&(a.channel=this.channel);try{var c=JSON.stringify(a);b.postMessage(c,this.C)}catch(d){tg(d)}}};
oo.prototype.D=function(){window.removeEventListener("message",this.B);J.prototype.D.call(this)};function po(){this.i=[];this.isReady=!1;this.j={};var a=this.h=new oo(!!F("WIDGET_ID_ENFORCE")),b=this.Ob.bind(this);a.m=b;a.o=null;this.h.channel="widget";if(a=F("WIDGET_ID"))this.h.sessionId=a}
m=po.prototype;m.Ob=function(a,b,c){"addEventListener"===a&&b?(a=b[0],this.j[a]||"onReady"===a||(this.addEventListener(a,qo(this,a)),this.j[a]=!0)):this.Va(a,b,c)};
m.Va=function(){};
function qo(a,b){return function(c){return a.sendMessage(b,c)}}
m.addEventListener=function(){};
m.zb=function(){this.isReady=!0;this.sendMessage("initialDelivery",this.Ka());this.sendMessage("onReady");E(this.i,this.ob,this);this.i=[]};
m.Ka=function(){return null};
function ro(a,b){a.sendMessage("infoDelivery",b)}
m.ob=function(a){this.isReady?this.h.sendMessage(a):this.i.push(a)};
m.sendMessage=function(a,b){this.ob({event:a,info:void 0===b?null:b})};
m.dispose=function(){this.h=null};function so(a){return(0===a.search("cue")||0===a.search("load"))&&"loadModule"!==a}
function to(a,b,c){if("string"===typeof a)return{videoId:a,startSeconds:b,suggestedQuality:c};b=["endSeconds","startSeconds","mediaContentUrl","suggestedQuality","videoId"];c={};for(var d=0;d<b.length;d++){var e=b[d];a[e]&&(c[e]=a[e])}return c}
function uo(a,b,c,d){if(La(a)&&!Array.isArray(a)){b="playlist list listType index startSeconds suggestedQuality".split(" ");c={};for(d=0;d<b.length;d++){var e=b[d];a[e]&&(c[e]=a[e])}return c}b={index:b,startSeconds:c,suggestedQuality:d};"string"===typeof a&&16===a.length?b.list="PL"+a:b.playlist=a;return b}
;function vo(a){po.call(this);this.listeners=[];this.api=a;this.addEventListener("onReady",this.onReady.bind(this));this.addEventListener("onVideoProgress",this.Vb.bind(this));this.addEventListener("onVolumeChange",this.Wb.bind(this));this.addEventListener("onApiChange",this.Qb.bind(this));this.addEventListener("onPlaybackQualityChange",this.Sb.bind(this));this.addEventListener("onPlaybackRateChange",this.Tb.bind(this));this.addEventListener("onStateChange",this.Ub.bind(this));this.addEventListener("onWebglSettingsChanged",
this.Xb.bind(this))}
v(vo,po);m=vo.prototype;
m.Va=function(a,b,c){if(this.api.isExternalMethodAvailable(a,c)){b=b||[];if(0<b.length&&so(a)){var d=b;if(La(d[0])&&!Array.isArray(d[0]))var e=d[0];else switch(e={},a){case "loadVideoById":case "cueVideoById":e=to(d[0],void 0!==d[1]?Number(d[1]):void 0,d[2]);break;case "loadVideoByUrl":case "cueVideoByUrl":e=d[0];"string"===typeof e&&(e={mediaContentUrl:e,startSeconds:void 0!==d[1]?Number(d[1]):void 0,suggestedQuality:d[2]});b:{if((d=e.mediaContentUrl)&&(d=/\/([ve]|embed)\/([^#?]+)/.exec(d))&&d[2]){d=
d[2];break b}d=null}e.videoId=d;e=to(e);break;case "loadPlaylist":case "cuePlaylist":e=uo(d[0],d[1],d[2],d[3])}b.length=1;b[0]=e}this.api.handleExternalCall(a,b,c);so(a)&&ro(this,this.Ka())}};
m.onReady=function(){var a=this.zb.bind(this);this.h.i=a};
m.addEventListener=function(a,b){this.listeners.push({eventType:a,listener:b});this.api.addEventListener(a,b)};
m.Ka=function(){if(!this.api)return null;var a=this.api.getApiInterface();db(a,"getVideoData");for(var b={apiInterface:a},c=0,d=a.length;c<d;c++){var e=a[c];if(0===e.search("get")||0===e.search("is")){var f=0;0===e.search("get")?f=3:0===e.search("is")&&(f=2);f=e.charAt(f).toLowerCase()+e.substr(f+1);try{var g=this.api[e]();b[f]=g}catch(h){}}}b.videoData=this.api.getVideoData();b.currentTimeLastUpdated_=Date.now()/1E3;return b};
m.Ub=function(a){a={playerState:a,currentTime:this.api.getCurrentTime(),duration:this.api.getDuration(),videoData:this.api.getVideoData(),videoStartBytes:0,videoBytesTotal:this.api.getVideoBytesTotal(),videoLoadedFraction:this.api.getVideoLoadedFraction(),playbackQuality:this.api.getPlaybackQuality(),availableQualityLevels:this.api.getAvailableQualityLevels(),currentTimeLastUpdated_:Date.now()/1E3,playbackRate:this.api.getPlaybackRate(),mediaReferenceTime:this.api.getMediaReferenceTime()};this.api.getVideoUrl&&
(a.videoUrl=this.api.getVideoUrl());this.api.getVideoContentRect&&(a.videoContentRect=this.api.getVideoContentRect());this.api.getProgressState&&(a.progressState=this.api.getProgressState());this.api.getPlaylist&&(a.playlist=this.api.getPlaylist());this.api.getPlaylistIndex&&(a.playlistIndex=this.api.getPlaylistIndex());this.api.getStoryboardFormat&&(a.storyboardFormat=this.api.getStoryboardFormat());ro(this,a)};
m.Sb=function(a){ro(this,{playbackQuality:a})};
m.Tb=function(a){ro(this,{playbackRate:a})};
m.Qb=function(){for(var a=this.api.getOptions(),b={namespaces:a},c=0,d=a.length;c<d;c++){var e=a[c],f=this.api.getOptions(e);b[e]={options:f};for(var g=0,h=f.length;g<h;g++){var k=f[g],l=this.api.getOption(e,k);b[e][k]=l}}this.sendMessage("apiInfoDelivery",b)};
m.Wb=function(){ro(this,{muted:this.api.isMuted(),volume:this.api.getVolume()})};
m.Vb=function(a){a={currentTime:a,videoBytesLoaded:this.api.getVideoBytesLoaded(),videoLoadedFraction:this.api.getVideoLoadedFraction(),currentTimeLastUpdated_:Date.now()/1E3,playbackRate:this.api.getPlaybackRate(),mediaReferenceTime:this.api.getMediaReferenceTime()};this.api.getProgressState&&(a.progressState=this.api.getProgressState());ro(this,a)};
m.Xb=function(){var a={sphericalProperties:this.api.getSphericalProperties()};ro(this,a)};
m.dispose=function(){po.prototype.dispose.call(this);for(var a=0;a<this.listeners.length;a++){var b=this.listeners[a];this.api.removeEventListener(b.eventType,b.listener)}this.listeners=[]};function wo(a){J.call(this);this.i={};this.started=!1;this.connection=a;this.connection.subscribe("command",this.kb,this)}
v(wo,J);m=wo.prototype;m.start=function(){this.started||this.h||(this.started=!0,this.connection.ha("RECEIVING"))};
m.ha=function(a,b){this.started&&!this.h&&this.connection.ha(a,b)};
m.kb=function(a,b,c){if(this.started&&!this.h){var d=b||{};switch(a){case "addEventListener":"string"===typeof d.event&&this.addListener(d.event);break;case "removeEventListener":"string"===typeof d.event&&this.removeListener(d.event);break;default:this.api.isReady()&&this.api.isExternalMethodAvailable(a,c||null)&&(b=xo(a,b||{}),c=this.api.handleExternalCall(a,b,c||null),(c=yo(a,c))&&this.ha(a,c))}}};
m.addListener=function(a){if(!(a in this.i)){var b=this.Rb.bind(this,a);this.i[a]=b;this.addEventListener(a,b)}};
m.Rb=function(a,b){this.started&&!this.h&&this.connection.ha(a,this.Ja(a,b))};
m.Ja=function(a,b){if(null!=b)return{value:b}};
m.removeListener=function(a){a in this.i&&(this.removeEventListener(a,this.i[a]),delete this.i[a])};
m.D=function(){var a=this.connection;a.h||Rf(a.i,"command",this.kb,this);this.connection=null;for(var b in this.i)this.i.hasOwnProperty(b)&&this.removeListener(b);J.prototype.D.call(this)};function zo(a,b){wo.call(this,b);this.api=a;this.start()}
v(zo,wo);zo.prototype.addEventListener=function(a,b){this.api.addEventListener(a,b)};
zo.prototype.removeEventListener=function(a,b){this.api.removeEventListener(a,b)};
function xo(a,b){switch(a){case "loadVideoById":return a=to(b),[a];case "cueVideoById":return a=to(b),[a];case "loadVideoByPlayerVars":return[b];case "cueVideoByPlayerVars":return[b];case "loadPlaylist":return a=uo(b),[a];case "cuePlaylist":return a=uo(b),[a];case "seekTo":return[b.seconds,b.allowSeekAhead];case "playVideoAt":return[b.index];case "setVolume":return[b.volume];case "setPlaybackQuality":return[b.suggestedQuality];case "setPlaybackRate":return[b.suggestedRate];case "setLoop":return[b.loopPlaylists];
case "setShuffle":return[b.shufflePlaylist];case "getOptions":return[b.module];case "getOption":return[b.module,b.option];case "setOption":return[b.module,b.option,b.value];case "handleGlobalKeyDown":return[b.keyCode,b.shiftKey,b.ctrlKey,b.altKey,b.metaKey,b.key,b.code]}return[]}
function yo(a,b){switch(a){case "isMuted":return{muted:b};case "getVolume":return{volume:b};case "getPlaybackRate":return{playbackRate:b};case "getAvailablePlaybackRates":return{availablePlaybackRates:b};case "getVideoLoadedFraction":return{videoLoadedFraction:b};case "getPlayerState":return{playerState:b};case "getCurrentTime":return{currentTime:b};case "getPlaybackQuality":return{playbackQuality:b};case "getAvailableQualityLevels":return{availableQualityLevels:b};case "getDuration":return{duration:b};
case "getVideoUrl":return{videoUrl:b};case "getVideoEmbedCode":return{videoEmbedCode:b};case "getPlaylist":return{playlist:b};case "getPlaylistIndex":return{playlistIndex:b};case "getOptions":return{options:b};case "getOption":return{option:b}}}
zo.prototype.Ja=function(a,b){switch(a){case "onReady":return;case "onStateChange":return{playerState:b};case "onPlaybackQualityChange":return{playbackQuality:b};case "onPlaybackRateChange":return{playbackRate:b};case "onError":return{errorCode:b}}return wo.prototype.Ja.call(this,a,b)};
zo.prototype.D=function(){wo.prototype.D.call(this);delete this.api};function Ao(a){a=void 0===a?!1:a;J.call(this);this.i=new L(a);Vd(this,Ta(Td,this.i))}
D(Ao,J);Ao.prototype.subscribe=function(a,b,c){return this.h?0:this.i.subscribe(a,b,c)};
Ao.prototype.l=function(a,b){this.h||this.i.ga.apply(this.i,arguments)};function Bo(a,b,c){Ao.call(this);this.j=a;this.destination=b;this.id=c}
v(Bo,Ao);Bo.prototype.ha=function(a,b){this.h||this.j.ha(this.destination,this.id,a,b)};
Bo.prototype.D=function(){this.destination=this.j=null;Ao.prototype.D.call(this)};function Co(a,b,c){J.call(this);this.destination=a;this.origin=c;this.i=Ig(window,"message",this.j.bind(this));this.connection=new Bo(this,a,b);Vd(this,Ta(Td,this.connection))}
v(Co,J);Co.prototype.ha=function(a,b,c,d){this.h||a!==this.destination||(a={id:b,command:c},d&&(a.data=d),this.destination.postMessage(rf(a),this.origin))};
Co.prototype.j=function(a){var b;if(b=!this.h)if(b=a.origin===this.origin)a:{b=this.destination;do{b:{var c=a.source;do{if(c===b){c=!0;break b}if(c===c.parent)break;c=c.parent}while(null!=c);c=!1}if(c){b=!0;break a}b=b.opener}while(null!=b);b=!1}if(b&&(b=a.data,"string"===typeof b)){try{b=JSON.parse(b)}catch(d){return}b.command&&(c=this.connection,c.h||c.l("command",b.command,b.data,a.origin))}};
Co.prototype.D=function(){Jg(this.i);this.destination=null;J.prototype.D.call(this)};function Do(a){a=a||{};var b={},c={};this.url=a.url||"";this.args=a.args||nb(b);this.assets=a.assets||{};this.attrs=a.attrs||nb(c);this.fallback=a.fallback||null;this.fallbackMessage=a.fallbackMessage||null;this.html5=!!a.html5;this.disable=a.disable||{};this.loaded=!!a.loaded;this.messages=a.messages||{}}
Do.prototype.clone=function(){var a=new Do,b;for(b in this)if(this.hasOwnProperty(b)){var c=this[b];"object"==Ja(c)?a[b]=nb(c):a[b]=c}return a};var Eo=/cssbin\/(?:debug-)?([a-zA-Z0-9_-]+?)(?:-2x|-web|-rtl|-vfl|.css)/;function Fo(a){a=a||"";if(window.spf){var b=a.match(Eo);spf.style.load(a,b?b[1]:"",void 0)}else Go(a)}
function Go(a){var b=Ho(a),c=document.getElementById(b),d=c&&Mn(c,"loaded");d||c&&!d||(c=Io(a,b,function(){Mn(c,"loaded")||(Kn(c),Sh(b),Lg(Ta(Th,b),0))}))}
function Io(a,b,c){var d=document.createElement("link");d.id=b;d.onload=function(){c&&setTimeout(c,0)};
a=pf(a);$b(d,a);(document.getElementsByTagName("head")[0]||document.body).appendChild(d);return d}
function Ho(a){var b=wd(document,"A");vb("This URL is never added to the DOM");Zb(b,new Kb(a,Lb));a=b.href.replace(/^[a-zA-Z]+:\/\//,"//");return"css-"+dc(a)}
;function Jo(){J.call(this);this.i=[]}
v(Jo,J);Jo.prototype.D=function(){for(;this.i.length;){var a=this.i.pop();a.target.removeEventListener(a.name,a.Xa,void 0)}J.prototype.D.call(this)};function Ko(){Jo.apply(this,arguments)}
v(Ko,Jo);function Lo(a,b,c,d){J.call(this);var e=this;this.G=b;this.webPlayerContextConfig=d;this.Fa=!1;this.api={};this.ka=this.o=null;this.M=new L;this.i={};this.X=this.ra=this.elementId=this.Ga=this.config=null;this.P=!1;this.l=this.B=null;this.sa={};this.rb=["onReady"];this.lastError=null;this.Wa=NaN;this.C={};this.sb=new Ko(this);this.ja=0;this.j=this.m=a;Vd(this,Ta(Td,this.M));Mo(this);No(this);Vd(this,Ta(Td,this.sb));c?this.ja=Lg(function(){e.loadNewVideoConfig(c)},0):d&&(Oo(this),Po(this))}
v(Lo,J);m=Lo.prototype;m.getId=function(){return this.G};
m.loadNewVideoConfig=function(a){if(!this.h){this.ja&&(Mg(this.ja),this.ja=0);var b=a||{};b instanceof Do||(b=new Do(b));this.config=b;this.setConfig(a);Po(this);this.isReady()&&Qo(this)}};
function Oo(a){var b,c;a.webPlayerContextConfig?c=a.webPlayerContextConfig.rootElementId:c=a.config.attrs.id;a.elementId=c||a.elementId;"video-player"===a.elementId&&(a.elementId=a.G,a.webPlayerContextConfig?a.webPlayerContextConfig.rootElementId=a.G:a.config.attrs.id=a.G);(null===(b=a.j)||void 0===b?void 0:b.id)===a.elementId&&(a.elementId+="-player",a.webPlayerContextConfig?a.webPlayerContextConfig.rootElementId=a.elementId:a.config.attrs.id=a.elementId)}
m.setConfig=function(a){var b;this.Ga=a;this.config=Ro(a);Oo(this);this.ra||(this.ra=So(this,(null===(b=this.config.args)||void 0===b?void 0:b.jsapicallback)||"onYouTubePlayerReady"));this.config.args?this.config.args.jsapicallback=null:this.config.args={jsapicallback:null};var c;if(null===(c=this.config)||void 0===c?0:c.attrs)a=this.config.attrs,(c=a.width)&&this.j&&(this.j.style.width=Fd(Number(c)||c)),(a=a.height)&&this.j&&(this.j.style.height=Fd(Number(a)||a))};
function Qo(a){var b;a.config&&!0!==a.config.loaded&&(a.config.loaded=!0,!a.config.args||"0"!==a.config.args.autoplay&&0!==a.config.args.autoplay&&!1!==a.config.args.autoplay?a.api.loadVideoByPlayerVars(null!==(b=a.config.args)&&void 0!==b?b:null):a.api.cueVideoByPlayerVars(a.config.args))}
function To(a){var b=!0,c=Uo(a);c&&a.config&&(a=Vo(a),b=Mn(c,"version")===a);return b&&!!C("yt.player.Application.create")}
function Po(a){if(!a.h&&!a.P){var b=To(a);if(b&&"html5"===(Uo(a)?"html5":null))a.X="html5",a.isReady()||Wo(a);else if(Xo(a),a.X="html5",b&&a.l&&a.m)a.m.appendChild(a.l),Wo(a);else{a.config&&(a.config.loaded=!0);var c=!1;a.B=function(){c=!0;var d=Yo(a,"player_bootstrap_method")?C("yt.player.Application.createAlternate")||C("yt.player.Application.create"):C("yt.player.Application.create");var e=a.config?Ro(a.config):void 0;d&&d(a.m,e,a.webPlayerContextConfig);Wo(a)};
a.P=!0;b?a.B():(Qn(Vo(a),a.B),(b=Zo(a))&&Fo(b),$o(a)&&!c&&A("yt.player.Application.create",null,void 0))}}}
function Uo(a){var b=sd(a.elementId);!b&&a.j&&a.j.querySelector&&(b=a.j.querySelector("#"+a.elementId));return b}
function Wo(a){var b;if(!a.h){var c=Uo(a),d=!1;c&&c.getApiInterface&&c.getApiInterface()&&(d=!0);d?(a.P=!1,!Yo(a,"html5_remove_not_servable_check_killswitch")&&(null===c||void 0===c?0:c.isNotServable)&&a.config&&(null===c||void 0===c?0:c.isNotServable(null===(b=a.config.args)||void 0===b?void 0:b.video_id))||ap(a)):a.Wa=Lg(function(){Wo(a)},50)}}
function ap(a){Mo(a);a.Fa=!0;var b=Uo(a);if(b){a.o=bp(a,b,"addEventListener");a.ka=bp(a,b,"removeEventListener");var c=b.getApiInterface();c=c.concat(b.getInternalApiInterface());for(var d=a.api,e=0;e<c.length;e++){var f=c[e];d[f]||(d[f]=bp(a,b,f))}}for(var g in a.i)a.i.hasOwnProperty(g)&&a.o&&a.o(g,a.i[g]);Qo(a);a.ra&&a.ra(a.api);a.M.ga("onReady",a.api)}
function bp(a,b,c){var d=b[c];return function(e){for(var f=[],g=0;g<arguments.length;++g)f[g-0]=arguments[g];try{return a.lastError=null,d.apply(b,f)}catch(h){"sendAbandonmentPing"!==c&&(h.params=c,a.lastError=h,Sl(h))}}}
function Mo(a){a.Fa=!1;if(a.ka)for(var b in a.i)a.i.hasOwnProperty(b)&&a.ka(b,a.i[b]);for(var c in a.C)a.C.hasOwnProperty(c)&&Mg(Number(c));a.C={};a.o=null;a.ka=null;b=a.api;for(var d in b)b.hasOwnProperty(d)&&(b[d]=null);b.addEventListener=function(e,f){a.addEventListener(e,f)};
b.removeEventListener=function(e,f){a.removeEventListener(e,f)};
b.destroy=function(){a.dispose()};
b.getLastError=function(){return a.getLastError()};
b.getPlayerType=function(){return a.getPlayerType()};
b.getCurrentVideoConfig=function(){return a.Ga};
b.loadNewVideoConfig=function(e){a.loadNewVideoConfig(e)};
b.isReady=function(){return a.isReady()}}
m.isReady=function(){return this.Fa};
function No(a){a.addEventListener("WATCH_LATER_VIDEO_ADDED",function(b){Sh("WATCH_LATER_VIDEO_ADDED",b)});
a.addEventListener("WATCH_LATER_VIDEO_REMOVED",function(b){Sh("WATCH_LATER_VIDEO_REMOVED",b)});
a.addEventListener("onAdAnnounce",function(b){Sh("a11y-announce",b)})}
m.addEventListener=function(a,b){var c=this,d=So(this,b);d&&(0<=Za(this.rb,a)||this.i[a]||(b=cp(this,a),this.o&&this.o(a,b)),this.M.subscribe(a,d),"onReady"===a&&this.isReady()&&Lg(function(){d(c.api)},0))};
m.removeEventListener=function(a,b){this.h||(b=So(this,b))&&Rf(this.M,a,b)};
function So(a,b){var c=b;if("string"===typeof b){if(a.sa[b])return a.sa[b];c=function(d){for(var e=[],f=0;f<arguments.length;++f)e[f-0]=arguments[f];if(f=C(b))try{f.apply(y,e)}catch(g){Tl(g)}};
a.sa[b]=c}return c?c:null}
function cp(a,b){var c="ytPlayer"+b+a.G;a.i[b]=c;y[c]=function(d){var e=Lg(function(){if(!a.h){a.M.ga(b,d);var f=a.C,g=String(e);g in f&&delete f[g]}},0);
kb(a.C,String(e))};
return c}
m.getPlayerType=function(){return this.X||(Uo(this)?"html5":null)};
m.getLastError=function(){return this.lastError};
function Xo(a){a.cancel();Mo(a);a.X=null;a.config&&(a.config.loaded=!1);var b=Uo(a);b&&(To(a)||!$o(a)?a.l=b:(b&&b.destroy&&b.destroy(),a.l=null));if(a.m)for(a=a.m;b=a.firstChild;)a.removeChild(b)}
m.cancel=function(){this.B&&Wn(Vo(this),this.B);Mg(this.Wa);this.P=!1};
m.D=function(){Xo(this);if(this.l&&this.config&&this.l.destroy)try{this.l.destroy()}catch(b){Tl(b)}this.sa=null;for(var a in this.i)this.i.hasOwnProperty(a)&&(y[this.i[a]]=null);this.Ga=this.config=this.api=null;delete this.m;delete this.j;J.prototype.D.call(this)};
function $o(a){var b,c;a=null===(c=null===(b=a.config)||void 0===b?void 0:b.args)||void 0===c?void 0:c.fflags;return!!a&&-1!==a.indexOf("player_destroy_old_version=true")}
function Vo(a){return a.webPlayerContextConfig?a.webPlayerContextConfig.jsUrl:(a=a.config.assets)?a.js:""}
function Zo(a){return a.webPlayerContextConfig?a.webPlayerContextConfig.cssUrl:(a=a.config.assets)?a.css:""}
function Yo(a,b){var c;if(a.webPlayerContextConfig)var d=a.webPlayerContextConfig.serializedExperimentFlags;else if(null===(c=a.config)||void 0===c?0:c.args)d=a.config.args.fflags;return"true"===dh(d||"","&")[b]}
function Ro(a){for(var b={},c=u(Object.keys(a)),d=c.next();!d.done;d=c.next()){d=d.value;var e=a[d];b[d]="object"===typeof e?nb(e):e}return b}
;var dp={},ep="player_uid_"+(1E9*Math.random()>>>0);function fp(a,b,c){var d="player";c=void 0===c?!0:c;d="string"===typeof d?sd(d):d;var e=ep+"_"+Ma(d),f=dp[e];if(f&&c)return gp(a,b)?f.api.loadVideoByPlayerVars(a.args||null):f.loadNewVideoConfig(a),f.api;f=new Lo(d,e,a,b);dp[e]=f;Sh("player-added",f.api);Vd(f,function(){delete dp[f.getId()]});
return f.api}
function gp(a,b){return b&&b.serializedExperimentFlags?b.serializedExperimentFlags.includes("web_player_remove_playerproxy=true"):a&&a.args&&a.args.fflags?a.args.fflags.includes("web_player_remove_playerproxy=true"):!1}
;var hp=null,ip=null,jp=null;function kp(){var a=hp.getVideoData(1);a=a.title?a.title+" - YouTube":"YouTube";document.title!==a&&(document.title=a)}
;function lp(a,b,c){a="ST-"+dc(a).toString(36);b=b?ic(b):"";c=c||5;cm()&&si(a,b,c)}
;function mp(a,b,c){b=void 0===b?{}:b;c=void 0===c?!1:c;var d=F("EVENT_ID");d&&(b.ei||(b.ei=d));if(b){d=a;var e=void 0===e?!0:e;var f=F("VALID_SESSION_TEMPDATA_DOMAINS",[]),g=gc(window.location.href);g&&f.push(g);g=gc(d);if(0<=Za(f,g)||!g&&0==d.lastIndexOf("/",0))if(N("autoescape_tempdata_url")&&(f=document.createElement("a"),Zb(f,d),d=f.href),d){g=d.match(ec);d=g[5];f=g[6];g=g[7];var h="";d&&(h+=d);f&&(h+="?"+f);g&&(h+="#"+g);d=h;f=d.indexOf("#");if(d=0>f?d:d.substr(0,f))if(e&&!b.csn&&(b.itct||b.ved)&&
(b=Object.assign({csn:xm()},b)),k){var k=parseInt(k,10);isFinite(k)&&0<k&&lp(d,b,k)}else lp(d,b)}}if(c)return!1;if((window.ytspf||{}).enabled)spf.navigate(a);else{var l=void 0===l?{}:l;var n=void 0===n?"":n;var p=void 0===p?window:p;c=p.location;a=jc(a,l)+n;var r=void 0===r?nd:r;a:{r=void 0===r?nd:r;for(l=0;l<r.length;++l)if(n=r[l],n instanceof ld&&n.isValid(a)){r=new jd(a,hd);break a}r=void 0}c.href=od(r||kd)}return!0}
;A("yt.setConfig",M,void 0);A("yt.config.set",M,void 0);A("yt.setMsg",vg,void 0);A("yt.msgs.set",vg,void 0);A("yt.logging.errors.log",Tl,void 0);
A("writeEmbed",function(){var a=F("PLAYER_CONFIG",void 0);if(!a){var b=F("PLAYER_VARS",void 0);b&&(a={args:b})}km(!0);"gvn"===a.args.ps&&(document.body.style.backgroundColor="transparent");a.attrs||(a.attrs={width:"100%",height:"100%",id:"video-player"});var c=document.referrer;b=F("POST_MESSAGE_ORIGIN");window!==window.top&&c&&c!==document.URL&&(a.args.loaderUrl=c);N("embeds_js_api_set_1p_cookie")&&(c=ih(),c.embedsTokenValue&&(a.args.embedsTokenValue=c.embedsTokenValue));M("FORCE_CSI_ON_GEL",!0);
c=["ol"];gn("").info.actionType="embed";c&&M("TIMING_AFT_KEYS",c);M("TIMING_ACTION","embed");c=F("TIMING_INFO",{});for(var d in c)c.hasOwnProperty(d)&&yn(d,c[d]);yn("is_nav",1);(d=xm())&&yn("csn",d);(d=F("PREVIOUS_ACTION",void 0))&&!tn()&&yn("pa",d);d=bn();c=F("CLIENT_PROTOCOL");var e=F("CLIENT_TRANSPORT");c&&yn("p",c);e&&yn("t",e);yn("yt_vis",Bn());yn("yt_lt","cold");c=Ym();if(e=$m())Z("srt",c.responseStart),1!==d.prerender&&(yn("yt_sts","n",void 0),Z("_start",e,void 0));d=en();0<d&&Z("fpt",d);d=
Ym();d.isPerformanceNavigationTiming&&yn("pnt",1,void 0);Z("nreqs",d.requestStart,void 0);Z("nress",d.responseStart,void 0);Z("nrese",d.responseEnd,void 0);0<d.redirectEnd-d.redirectStart&&(Z("nrs",d.redirectStart,void 0),Z("nre",d.redirectEnd,void 0));0<d.domainLookupEnd-d.domainLookupStart&&(Z("ndnss",d.domainLookupStart,void 0),Z("ndnse",d.domainLookupEnd,void 0));0<d.connectEnd-d.connectStart&&(Z("ntcps",d.connectStart,void 0),Z("ntcpe",d.connectEnd,void 0));d.secureConnectionStart>=$m()&&0<d.connectEnd-
d.secureConnectionStart&&(Z("nstcps",d.secureConnectionStart,void 0),Z("ntcpe",d.connectEnd,void 0));W&&W.getEntriesByType&&Dn();d=[];if(document.querySelector&&W&&W.getEntriesByName)for(var f in Vm)Vm.hasOwnProperty(f)&&(c=Vm[f],Cn(f,c)&&d.push(c));for(f=0;f<d.length;f++)yn("rc",d[f]);if(tn(void 0)){f={actionType:nn[F("TIMING_ACTION",void 0)]||"LATENCY_ACTION_UNKNOWN",previousAction:nn[F("PREVIOUS_ACTION",void 0)]||"LATENCY_ACTION_UNKNOWN"};if(d=xm())f.clientScreenNonce=d;d=cn(void 0);c=an(void 0).cttAuthInfo;
ln().info(f,d,c)}f=bn();c=Xm();if("cold"===f.yt_lt&&(d=vn(),e=d.gelTicks?d.gelTicks:d.gelTicks={},d=d.gelInfos?d.gelInfos:d.gelInfos={},tn())){for(var g in c)"tick_"+g in e||un(g,c[g]);g=xn();c=cn();e=an().cttAuthInfo;var h={},k=!1,l;for(l in f)if(!("info_"+l in d)){var n=wn(l,f[l]);n&&(Jm(g,n),Jm(h,n),k=!0)}k&&ln().info(h,c,e)}A("ytglobal.timingready_",!0,void 0);zn();(l=F("WEB_PLAYER_CONTEXT_CONFIGS",void 0))&&"WEB_PLAYER_CONTEXT_CONFIG_ID_EMBEDDED_PLAYER"in l?(l=l.WEB_PLAYER_CONTEXT_CONFIG_ID_EMBEDDED_PLAYER,
l.serializedForcedExperimentIds||(g=ih(),g.forced_experiments&&(l.serializedForcedExperimentIds=g.forced_experiments)),hp=fp(a,l,!1)):hp=fp(a);hp.addEventListener("onVideoDataChange",kp);a=F("POST_MESSAGE_ID","player");F("ENABLE_JS_API")?jp=new vo(hp):F("ENABLE_POST_API")&&"string"===typeof a&&"string"===typeof b&&(ip=new Co(window.parent,a,b),jp=new zo(hp,ip.connection));Zn();N("networkless_logging_web_embedded")&&(N("embeds_web_enable_new_nwl")?yl():gl());N("embeds_enable_ua_ch_polyfill")&&no()},
void 0);
var np=rg(function(){An();var a=ui.getInstance(),b=!!((xi("f"+(Math.floor(119/31)+1))||0)&67108864),c=1<window.devicePixelRatio;if(document.body&&$e(document.body,"exp-invert-logo"))if(c&&!$e(document.body,"inverted-hdpi")){var d=document.body;if(d.classList)d.classList.add("inverted-hdpi");else if(!$e(d,"inverted-hdpi")){var e=Ye(d);Ze(d,e+(0<e.length?" inverted-hdpi":"inverted-hdpi"))}}else!c&&$e(document.body,"inverted-hdpi")&&af();if(b!=c){b="f"+(Math.floor(119/31)+1);d=xi(b)||0;d=c?d|67108864:
d&-67108865;0==d?delete ti[b]:(c=d.toString(16),ti[b]=c.toString());c=!0;N("web_secure_pref_cookie_killswitch")&&(c=!1);b=a.h;d=[];for(var f in ti)d.push(f+"="+encodeURIComponent(String(ti[f])));si(b,d.join("&"),63072E3,a.i,c)}Fn.h||(Fn.h=new Fn);a=Fn.h;f=16623;var g=void 0===g?{}:g;Object.values(Vl).includes(f)||(Sl(new Qi("createClientScreen() called with a non-page VE",f)),f=83769);g.isHistoryNavigation||a.h.push({rootVe:f,key:g.key||""});a.A=[];a.o=[];g.bb?In(a,f,g):Jn(a,f,g)}),op=rg(function(){hp&&
hp.sendAbandonmentPing&&hp.sendAbandonmentPing();
F("PL_ATT")&&fo.dispose();for(var a=0,b=Xn.length;a<b;a++)Tg.Z(Xn[a]);Xn.length=0;Vn("//static.doubleclick.net/instream/ad_status.js");Yn=!1;M("DCLKSTAT",0);Ud(jp,ip);hp&&(hp.removeEventListener("onVideoDataChange",kp),hp.destroy())});
window.addEventListener?(window.addEventListener("load",np),window.addEventListener("unload",op)):window.attachEvent&&(window.attachEvent("onload",np),window.attachEvent("onunload",op));Ua("yt.abuse.player.botguardInitialized",C("yt.abuse.player.botguardInitialized")||go);Ua("yt.abuse.player.invokeBotguard",C("yt.abuse.player.invokeBotguard")||ho);Ua("yt.abuse.dclkstatus.checkDclkStatus",C("yt.abuse.dclkstatus.checkDclkStatus")||$n);
Ua("yt.player.exports.navigate",C("yt.player.exports.navigate")||mp);Ua("yt.util.activity.init",C("yt.util.activity.init")||Vg);Ua("yt.util.activity.getTimeSinceActive",C("yt.util.activity.getTimeSinceActive")||Yg);Ua("yt.util.activity.setTimestamp",C("yt.util.activity.setTimestamp")||Wg);}).call(this);
