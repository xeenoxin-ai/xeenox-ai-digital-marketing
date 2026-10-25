import{F as Tr,t as C,u as Vn,v as Ar,w as ie,x as wr,m as Vr,e as vn,y as vr,L as Nr,j as Rr,z as Se,g as Pr,i as Sr,C as br,r as Xe,S as Dr}from"./index.esm-DsWZINRN.js";var Ze=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Nn;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function t(c,o){function l(){}l.prototype=o.prototype,c.F=o.prototype,c.prototype=new l,c.prototype.constructor=c,c.D=function(f,h,m){for(var a=Array(arguments.length-2),lt=2;lt<arguments.length;lt++)a[lt-2]=arguments[lt];return o.prototype[h].apply(f,a)}}function e(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}t(r,e),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(c,o,l){l||(l=0);const f=Array(16);if(typeof o=="string")for(var h=0;h<16;++h)f[h]=o.charCodeAt(l++)|o.charCodeAt(l++)<<8|o.charCodeAt(l++)<<16|o.charCodeAt(l++)<<24;else for(h=0;h<16;++h)f[h]=o[l++]|o[l++]<<8|o[l++]<<16|o[l++]<<24;o=c.g[0],l=c.g[1],h=c.g[2];let m=c.g[3],a;a=o+(m^l&(h^m))+f[0]+3614090360&4294967295,o=l+(a<<7&4294967295|a>>>25),a=m+(h^o&(l^h))+f[1]+3905402710&4294967295,m=o+(a<<12&4294967295|a>>>20),a=h+(l^m&(o^l))+f[2]+606105819&4294967295,h=m+(a<<17&4294967295|a>>>15),a=l+(o^h&(m^o))+f[3]+3250441966&4294967295,l=h+(a<<22&4294967295|a>>>10),a=o+(m^l&(h^m))+f[4]+4118548399&4294967295,o=l+(a<<7&4294967295|a>>>25),a=m+(h^o&(l^h))+f[5]+1200080426&4294967295,m=o+(a<<12&4294967295|a>>>20),a=h+(l^m&(o^l))+f[6]+2821735955&4294967295,h=m+(a<<17&4294967295|a>>>15),a=l+(o^h&(m^o))+f[7]+4249261313&4294967295,l=h+(a<<22&4294967295|a>>>10),a=o+(m^l&(h^m))+f[8]+1770035416&4294967295,o=l+(a<<7&4294967295|a>>>25),a=m+(h^o&(l^h))+f[9]+2336552879&4294967295,m=o+(a<<12&4294967295|a>>>20),a=h+(l^m&(o^l))+f[10]+4294925233&4294967295,h=m+(a<<17&4294967295|a>>>15),a=l+(o^h&(m^o))+f[11]+2304563134&4294967295,l=h+(a<<22&4294967295|a>>>10),a=o+(m^l&(h^m))+f[12]+1804603682&4294967295,o=l+(a<<7&4294967295|a>>>25),a=m+(h^o&(l^h))+f[13]+4254626195&4294967295,m=o+(a<<12&4294967295|a>>>20),a=h+(l^m&(o^l))+f[14]+2792965006&4294967295,h=m+(a<<17&4294967295|a>>>15),a=l+(o^h&(m^o))+f[15]+1236535329&4294967295,l=h+(a<<22&4294967295|a>>>10),a=o+(h^m&(l^h))+f[1]+4129170786&4294967295,o=l+(a<<5&4294967295|a>>>27),a=m+(l^h&(o^l))+f[6]+3225465664&4294967295,m=o+(a<<9&4294967295|a>>>23),a=h+(o^l&(m^o))+f[11]+643717713&4294967295,h=m+(a<<14&4294967295|a>>>18),a=l+(m^o&(h^m))+f[0]+3921069994&4294967295,l=h+(a<<20&4294967295|a>>>12),a=o+(h^m&(l^h))+f[5]+3593408605&4294967295,o=l+(a<<5&4294967295|a>>>27),a=m+(l^h&(o^l))+f[10]+38016083&4294967295,m=o+(a<<9&4294967295|a>>>23),a=h+(o^l&(m^o))+f[15]+3634488961&4294967295,h=m+(a<<14&4294967295|a>>>18),a=l+(m^o&(h^m))+f[4]+3889429448&4294967295,l=h+(a<<20&4294967295|a>>>12),a=o+(h^m&(l^h))+f[9]+568446438&4294967295,o=l+(a<<5&4294967295|a>>>27),a=m+(l^h&(o^l))+f[14]+3275163606&4294967295,m=o+(a<<9&4294967295|a>>>23),a=h+(o^l&(m^o))+f[3]+4107603335&4294967295,h=m+(a<<14&4294967295|a>>>18),a=l+(m^o&(h^m))+f[8]+1163531501&4294967295,l=h+(a<<20&4294967295|a>>>12),a=o+(h^m&(l^h))+f[13]+2850285829&4294967295,o=l+(a<<5&4294967295|a>>>27),a=m+(l^h&(o^l))+f[2]+4243563512&4294967295,m=o+(a<<9&4294967295|a>>>23),a=h+(o^l&(m^o))+f[7]+1735328473&4294967295,h=m+(a<<14&4294967295|a>>>18),a=l+(m^o&(h^m))+f[12]+2368359562&4294967295,l=h+(a<<20&4294967295|a>>>12),a=o+(l^h^m)+f[5]+4294588738&4294967295,o=l+(a<<4&4294967295|a>>>28),a=m+(o^l^h)+f[8]+2272392833&4294967295,m=o+(a<<11&4294967295|a>>>21),a=h+(m^o^l)+f[11]+1839030562&4294967295,h=m+(a<<16&4294967295|a>>>16),a=l+(h^m^o)+f[14]+4259657740&4294967295,l=h+(a<<23&4294967295|a>>>9),a=o+(l^h^m)+f[1]+2763975236&4294967295,o=l+(a<<4&4294967295|a>>>28),a=m+(o^l^h)+f[4]+1272893353&4294967295,m=o+(a<<11&4294967295|a>>>21),a=h+(m^o^l)+f[7]+4139469664&4294967295,h=m+(a<<16&4294967295|a>>>16),a=l+(h^m^o)+f[10]+3200236656&4294967295,l=h+(a<<23&4294967295|a>>>9),a=o+(l^h^m)+f[13]+681279174&4294967295,o=l+(a<<4&4294967295|a>>>28),a=m+(o^l^h)+f[0]+3936430074&4294967295,m=o+(a<<11&4294967295|a>>>21),a=h+(m^o^l)+f[3]+3572445317&4294967295,h=m+(a<<16&4294967295|a>>>16),a=l+(h^m^o)+f[6]+76029189&4294967295,l=h+(a<<23&4294967295|a>>>9),a=o+(l^h^m)+f[9]+3654602809&4294967295,o=l+(a<<4&4294967295|a>>>28),a=m+(o^l^h)+f[12]+3873151461&4294967295,m=o+(a<<11&4294967295|a>>>21),a=h+(m^o^l)+f[15]+530742520&4294967295,h=m+(a<<16&4294967295|a>>>16),a=l+(h^m^o)+f[2]+3299628645&4294967295,l=h+(a<<23&4294967295|a>>>9),a=o+(h^(l|~m))+f[0]+4096336452&4294967295,o=l+(a<<6&4294967295|a>>>26),a=m+(l^(o|~h))+f[7]+1126891415&4294967295,m=o+(a<<10&4294967295|a>>>22),a=h+(o^(m|~l))+f[14]+2878612391&4294967295,h=m+(a<<15&4294967295|a>>>17),a=l+(m^(h|~o))+f[5]+4237533241&4294967295,l=h+(a<<21&4294967295|a>>>11),a=o+(h^(l|~m))+f[12]+1700485571&4294967295,o=l+(a<<6&4294967295|a>>>26),a=m+(l^(o|~h))+f[3]+2399980690&4294967295,m=o+(a<<10&4294967295|a>>>22),a=h+(o^(m|~l))+f[10]+4293915773&4294967295,h=m+(a<<15&4294967295|a>>>17),a=l+(m^(h|~o))+f[1]+2240044497&4294967295,l=h+(a<<21&4294967295|a>>>11),a=o+(h^(l|~m))+f[8]+1873313359&4294967295,o=l+(a<<6&4294967295|a>>>26),a=m+(l^(o|~h))+f[15]+4264355552&4294967295,m=o+(a<<10&4294967295|a>>>22),a=h+(o^(m|~l))+f[6]+2734768916&4294967295,h=m+(a<<15&4294967295|a>>>17),a=l+(m^(h|~o))+f[13]+1309151649&4294967295,l=h+(a<<21&4294967295|a>>>11),a=o+(h^(l|~m))+f[4]+4149444226&4294967295,o=l+(a<<6&4294967295|a>>>26),a=m+(l^(o|~h))+f[11]+3174756917&4294967295,m=o+(a<<10&4294967295|a>>>22),a=h+(o^(m|~l))+f[2]+718787259&4294967295,h=m+(a<<15&4294967295|a>>>17),a=l+(m^(h|~o))+f[9]+3951481745&4294967295,c.g[0]=c.g[0]+o&4294967295,c.g[1]=c.g[1]+(h+(a<<21&4294967295|a>>>11))&4294967295,c.g[2]=c.g[2]+h&4294967295,c.g[3]=c.g[3]+m&4294967295}r.prototype.v=function(c,o){o===void 0&&(o=c.length);const l=o-this.blockSize,f=this.C;let h=this.h,m=0;for(;m<o;){if(h==0)for(;m<=l;)i(this,c,m),m+=this.blockSize;if(typeof c=="string"){for(;m<o;)if(f[h++]=c.charCodeAt(m++),h==this.blockSize){i(this,f),h=0;break}}else for(;m<o;)if(f[h++]=c[m++],h==this.blockSize){i(this,f),h=0;break}}this.h=h,this.o+=o},r.prototype.A=function(){var c=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);c[0]=128;for(var o=1;o<c.length-8;++o)c[o]=0;o=this.o*8;for(var l=c.length-8;l<c.length;++l)c[l]=o&255,o/=256;for(this.v(c),c=Array(16),o=0,l=0;l<4;++l)for(let f=0;f<32;f+=8)c[o++]=this.g[l]>>>f&255;return c};function s(c,o){var l=d;return Object.prototype.hasOwnProperty.call(l,c)?l[c]:l[c]=o(c)}function u(c,o){this.h=o;const l=[];let f=!0;for(let h=c.length-1;h>=0;h--){const m=c[h]|0;f&&m==o||(l[h]=m,f=!1)}this.g=l}var d={};function p(c){return-128<=c&&c<128?s(c,function(o){return new u([o|0],o<0?-1:0)}):new u([c|0],c<0?-1:0)}function _(c){if(isNaN(c)||!isFinite(c))return I;if(c<0)return R(_(-c));const o=[];let l=1;for(let f=0;c>=l;f++)o[f]=c/l|0,l*=4294967296;return new u(o,0)}function y(c,o){if(c.length==0)throw Error("number format error: empty string");if(o=o||10,o<2||36<o)throw Error("radix out of range: "+o);if(c.charAt(0)=="-")return R(y(c.substring(1),o));if(c.indexOf("-")>=0)throw Error('number format error: interior "-" character');const l=_(Math.pow(o,8));let f=I;for(let m=0;m<c.length;m+=8){var h=Math.min(8,c.length-m);const a=parseInt(c.substring(m,m+h),o);h<8?(h=_(Math.pow(o,h)),f=f.j(h).add(_(a))):(f=f.j(l),f=f.add(_(a)))}return f}var I=p(0),T=p(1),N=p(16777216);n=u.prototype,n.m=function(){if(V(this))return-R(this).m();let c=0,o=1;for(let l=0;l<this.g.length;l++){const f=this.i(l);c+=(f>=0?f:4294967296+f)*o,o*=4294967296}return c},n.toString=function(c){if(c=c||10,c<2||36<c)throw Error("radix out of range: "+c);if(w(this))return"0";if(V(this))return"-"+R(this).toString(c);const o=_(Math.pow(c,6));var l=this;let f="";for(;;){const h=K(l,o).g;l=X(l,h.j(o));let m=((l.g.length>0?l.g[0]:l.h)>>>0).toString(c);if(l=h,w(l))return m+f;for(;m.length<6;)m="0"+m;f=m+f}},n.i=function(c){return c<0?0:c<this.g.length?this.g[c]:this.h};function w(c){if(c.h!=0)return!1;for(let o=0;o<c.g.length;o++)if(c.g[o]!=0)return!1;return!0}function V(c){return c.h==-1}n.l=function(c){return c=X(this,c),V(c)?-1:w(c)?0:1};function R(c){const o=c.g.length,l=[];for(let f=0;f<o;f++)l[f]=~c.g[f];return new u(l,~c.h).add(T)}n.abs=function(){return V(this)?R(this):this},n.add=function(c){const o=Math.max(this.g.length,c.g.length),l=[];let f=0;for(let h=0;h<=o;h++){let m=f+(this.i(h)&65535)+(c.i(h)&65535),a=(m>>>16)+(this.i(h)>>>16)+(c.i(h)>>>16);f=a>>>16,m&=65535,a&=65535,l[h]=a<<16|m}return new u(l,l[l.length-1]&-2147483648?-1:0)};function X(c,o){return c.add(R(o))}n.j=function(c){if(w(this)||w(c))return I;if(V(this))return V(c)?R(this).j(R(c)):R(R(this).j(c));if(V(c))return R(this.j(R(c)));if(this.l(N)<0&&c.l(N)<0)return _(this.m()*c.m());const o=this.g.length+c.g.length,l=[];for(var f=0;f<2*o;f++)l[f]=0;for(f=0;f<this.g.length;f++)for(let h=0;h<c.g.length;h++){const m=this.i(f)>>>16,a=this.i(f)&65535,lt=c.i(h)>>>16,Ye=c.i(h)&65535;l[2*f+2*h]+=a*Ye,Z(l,2*f+2*h),l[2*f+2*h+1]+=m*Ye,Z(l,2*f+2*h+1),l[2*f+2*h+1]+=a*lt,Z(l,2*f+2*h+1),l[2*f+2*h+2]+=m*lt,Z(l,2*f+2*h+2)}for(c=0;c<o;c++)l[c]=l[2*c+1]<<16|l[2*c];for(c=o;c<2*o;c++)l[c]=0;return new u(l,0)};function Z(c,o){for(;(c[o]&65535)!=c[o];)c[o+1]+=c[o]>>>16,c[o]&=65535,o++}function at(c,o){this.g=c,this.h=o}function K(c,o){if(w(o))throw Error("division by zero");if(w(c))return new at(I,I);if(V(c))return o=K(R(c),o),new at(R(o.g),R(o.h));if(V(o))return o=K(c,R(o)),new at(R(o.g),o.h);if(c.g.length>30){if(V(c)||V(o))throw Error("slowDivide_ only works with positive integers.");for(var l=T,f=o;f.l(c)<=0;)l=ut(l),f=ut(f);var h=At(l,1),m=At(f,1);for(f=At(f,2),l=At(l,2);!w(f);){var a=m.add(f);a.l(c)<=0&&(h=h.add(l),m=a),f=At(f,1),l=At(l,1)}return o=X(c,h.j(o)),new at(h,o)}for(h=I;c.l(o)>=0;){for(l=Math.max(1,Math.floor(c.m()/o.m())),f=Math.ceil(Math.log(l)/Math.LN2),f=f<=48?1:Math.pow(2,f-48),m=_(l),a=m.j(o);V(a)||a.l(c)>0;)l-=f,m=_(l),a=m.j(o);w(m)&&(m=T),h=h.add(m),c=X(c,a)}return new at(h,c)}n.B=function(c){return K(this,c).h},n.and=function(c){const o=Math.max(this.g.length,c.g.length),l=[];for(let f=0;f<o;f++)l[f]=this.i(f)&c.i(f);return new u(l,this.h&c.h)},n.or=function(c){const o=Math.max(this.g.length,c.g.length),l=[];for(let f=0;f<o;f++)l[f]=this.i(f)|c.i(f);return new u(l,this.h|c.h)},n.xor=function(c){const o=Math.max(this.g.length,c.g.length),l=[];for(let f=0;f<o;f++)l[f]=this.i(f)^c.i(f);return new u(l,this.h^c.h)};function ut(c){const o=c.g.length+1,l=[];for(let f=0;f<o;f++)l[f]=c.i(f)<<1|c.i(f-1)>>>31;return new u(l,c.h)}function At(c,o){const l=o>>5;o%=32;const f=c.g.length-l,h=[];for(let m=0;m<f;m++)h[m]=o>0?c.i(m+l)>>>o|c.i(m+l+1)<<32-o:c.i(m+l);return new u(h,c.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,u.prototype.add=u.prototype.add,u.prototype.multiply=u.prototype.j,u.prototype.modulo=u.prototype.B,u.prototype.compare=u.prototype.l,u.prototype.toNumber=u.prototype.m,u.prototype.toString=u.prototype.toString,u.prototype.getBits=u.prototype.i,u.fromNumber=_,u.fromString=y,Nn=u}).apply(typeof Ze<"u"?Ze:typeof self<"u"?self:typeof window<"u"?window:{});/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class U{constructor(t){this.uid=t}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(t){return t.uid===this.uid}}U.UNAUTHENTICATED=new U(null),U.GOOGLE_CREDENTIALS=new U("google-credentials-uid"),U.FIRST_PARTY=new U("first-party-uid"),U.MOCK_USER=new U("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let vt="12.19.0";function Fr(n){vt=n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ht=new Nr("@firebase/firestore");function Ki(n){ht.setLogLevel(n)}function ft(n,...t){if(ht.logLevel<=Se.DEBUG){const e=t.map(be);ht.debug(`Firestore (${vt}): ${n}`,...e)}}function se(n,...t){if(ht.logLevel<=Se.ERROR){const e=t.map(be);ht.error(`Firestore (${vt}): ${n}`,...e)}}function Rn(n,...t){if(ht.logLevel<=Se.WARN){const e=t.map(be);ht.warn(`Firestore (${vt}): ${n}`,...e)}}function be(n){if(typeof n=="string")return n;try{return function(e){return JSON.stringify(e)}(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function v(n,t,e){let r="Unexpected state";typeof t=="string"?r=t:e=t,Pn(n,r,e)}function Pn(n,t,e){let r=`FIRESTORE (${vt}) INTERNAL ASSERTION FAILED: ${t} (ID: ${n.toString(16)})`;if(e!==void 0)try{r+=" CONTEXT: "+JSON.stringify(e)}catch{r+=" CONTEXT: "+e}throw se(r),new Error(r)}function q(n,t,e,r){let i="Unexpected state";typeof e=="string"?i=e:r=e,n||Pn(t,i,r)}function dt(n,t){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const g={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class E extends Tr{constructor(t,e){super(t,e),this.code=t,this.message=e,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sn{constructor(t,e){this.user=e,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${t}`)}}class kr{getToken(){return Promise.resolve(null)}invalidateToken(){}start(t,e){t.enqueueRetryable(()=>e(U.UNAUTHENTICATED))}shutdown(){}}class Or{constructor(t){this.token=t,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(t,e){this.changeListener=e,t.enqueueRetryable(()=>e(this.token.user))}shutdown(){this.changeListener=null}}class Cr{constructor(t){this.auth=null,t.onInit(e=>{this.auth=e})}getToken(){return this.auth?this.auth.getToken().then(t=>t?(q(typeof t.accessToken=="string",42297,{Z:t}),new Sn(t.accessToken,new U(this.auth.getUid()))):null):Promise.resolve(null)}invalidateToken(){}start(t,e){}shutdown(){}}class Lr{constructor(t,e,r){this.ee=t,this.te=e,this.re=r,this.type="FirstParty",this.user=U.FIRST_PARTY,this.ne=new Map}ie(){return this.re?this.re():null}get headers(){this.ne.set("X-Goog-AuthUser",this.ee);const t=this.ie();return t&&this.ne.set("Authorization",t),this.te&&this.ne.set("X-Goog-Iam-Authorization-Token",this.te),this.ne}}class xr{constructor(t,e,r){this.ee=t,this.te=e,this.re=r}getToken(){return Promise.resolve(new Lr(this.ee,this.te,this.re))}start(t,e){t.enqueueRetryable(()=>e(U.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class tn{constructor(t){this.value=t,this.type="AppCheck",this.headers=new Map,t&&t.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Ur{constructor(t,e){this.se=e,this.appCheck=null,this.oe=null,Pr(t)&&t.settings.appCheckToken&&(this.oe=t.settings.appCheckToken),e.onInit(r=>{this.appCheck=r})}getToken(){return this.oe?Promise.resolve(new tn(this.oe)):this.appCheck?this.appCheck.getToken().then(t=>t?(q(typeof t.token=="string",3470,{tokenResult:t}),new tn(t.token)):null):Promise.resolve(null)}invalidateToken(){}start(t,e){}shutdown(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mr{constructor(t,e,r,i,s,u,d,p,_,y,I,T,N){this.databaseId=t,this.appId=e,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=u,this.autoDetectLongPolling=d,this.longPollingOptions=p,this.useFetchStreams=_,this.isUsingEmulator=y,this.apiKey=I,this._customHeaders=T,this.grpcFlowControlWindow=N}}const Qt="(default)";class kt{constructor(t,e){this.projectId=t,this.database=e||Qt}static empty(){return new kt("","")}get isDefaultDatabase(){return this.database===Qt}isEqual(t){return t instanceof kt&&t.projectId===this.projectId&&t.database===this.database}}function qr(n,t){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new E(g.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new kt(n.options.projectId,t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $r(n){const t=typeof self<"u"&&(self.crypto||self.msCrypto),e=new Uint8Array(n);if(t&&typeof t.getRandomValues=="function")t.getRandomValues(e);else for(let r=0;r<n;r++)e[r]=Math.floor(256*Math.random());return e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jr{static newId(){const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",e=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const i=$r(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<e&&(r+=t.charAt(i[s]%62))}return r}}function k(n,t){return n<t?-1:n>t?1:0}function Ae(n,t){const e=Math.min(n.length,t.length);for(let r=0;r<e;r++){const i=n.charAt(r),s=t.charAt(r);if(i!==s)return ye(i)===ye(s)?k(i,s):ye(i)?1:-1}return k(n.length,t.length)}const Gr=55296,zr=57343;function ye(n){const t=n.charCodeAt(0);return t>=Gr&&t<=zr}function De(n,t,e){return n.length===t.length&&n.every((r,i)=>e(r,t[i]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const we="__name__";class H{constructor(t,e,r){e===void 0?e=0:e>t.length&&v(637,{offset:e,range:t.length}),r===void 0?r=t.length-e:r>t.length-e&&v(1746,{length:r,range:t.length-e}),this.segments=t,this.offset=e,this.len=r}get length(){return this.len}isEqual(t){return H.comparator(this,t)===0}child(t){const e=this.segments.slice(this.offset,this.limit());return t instanceof H?t.forEach(r=>{e.push(r)}):e.push(t),this.construct(e)}limit(){return this.offset+this.length}popFirst(t){return t=t===void 0?1:t,this.construct(this.segments,this.offset+t,this.length-t)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(t){return this.segments[this.offset+t]}isEmpty(){return this.length===0}isPrefixOf(t){if(t.length<this.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}isImmediateParentOf(t){if(this.length+1!==t.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}forEach(t){for(let e=this.offset,r=this.limit();e<r;e++)t(this.segments[e])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(t,e){const r=Math.min(t.length,e.length);for(let i=0;i<r;i++){const s=H.compareSegments(t.get(i),e.get(i));if(s!==0)return s}return k(t.length,e.length)}static compareSegments(t,e){const r=H.isNumericId(t),i=H.isNumericId(e);return r&&!i?-1:!r&&i?1:r&&i?H.extractNumericId(t).compare(H.extractNumericId(e)):Ae(t,e)}static isNumericId(t){return t.startsWith("__id")&&t.endsWith("__")}static extractNumericId(t){return Nn.fromString(t.substring(4,t.length-2))}}class b extends H{construct(t,e,r){return new b(t,e,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...t){const e=[];for(const r of t){if(r.indexOf("//")>=0)throw new E(g.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);e.push(...r.split("/").filter(i=>i.length>0))}return new b(e)}static emptyPath(){return new b([])}}const Br=/^[_a-zA-Z][_a-zA-Z0-9]*$/;let st=class wt extends H{construct(t,e,r){return new wt(t,e,r)}static isValidIdentifier(t){return Br.test(t)}canonicalString(){return this.toArray().map(t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),wt.isValidIdentifier(t)||(t="`"+t+"`"),t)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===we}static keyField(){return new wt([we])}static fromServerFormat(t){const e=[];let r="",i=0;const s=()=>{if(r.length===0)throw new E(g.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);e.push(r),r=""};let u=!1;for(;i<t.length;){const d=t[i];if(d==="\\"){if(i+1===t.length)throw new E(g.INVALID_ARGUMENT,"Path has trailing escape character: "+t);const p=t[i+1];if(p!=="\\"&&p!=="."&&p!=="`")throw new E(g.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);r+=p,i+=2}else d==="`"?(u=!u,i++):d!=="."||u?(r+=d,i++):(s(),i++)}if(s(),u)throw new E(g.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new wt(e)}static emptyPath(){return new wt([])}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class D{constructor(t){this.path=t}static fromPath(t){return new D(b.fromString(t))}static fromName(t){return new D(b.fromString(t).popFirst(5))}static empty(){return new D(b.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(t){return this.path.length>=2&&this.path.get(this.path.length-2)===t}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(t){return t!==null&&b.comparator(this.path,t.path)===0}toString(){return this.path.toString()}static comparator(t,e){return b.comparator(t.path,e.path)}static isDocumentKey(t){return t.length%2==0}static fromSegments(t){return new D(new b(t.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fe(n,t,e){if(!e)throw new E(g.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${t}.`)}function en(n){if(!D.isDocumentKey(n))throw new E(g.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function nn(n){if(D.isDocumentKey(n))throw new E(g.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function bn(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function oe(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const t=function(r){return r.constructor?r.constructor.name:null}(n);return t?`a custom ${t} object`:"an object"}}return typeof n=="function"?"a function":v(12329,{type:typeof n})}function W(n,t){if("_delegate"in n&&(n=n._delegate),!(n instanceof t)){if(t.name===n.constructor.name)throw new E(g.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const e=oe(n);throw new E(g.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${e}`)}}return n}function Dn(n,t){if(t<=0)throw new E(g.INVALID_ARGUMENT,`Function ${n}() requires a positive number, but it was: ${t}.`)}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fn(n){const t={};return n.timeoutSeconds!==void 0&&(t.timeoutSeconds=n.timeoutSeconds),t}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let zt=null;function Wr(){return zt===null?zt=function(){return 268435456+Math.round(2147483648*Math.random())}():zt++,"0x"+zt.toString(16)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kn(n){return n==null}function Ht(n){return n===0&&1/n==-1/0}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ee="RestConnection",Kr={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class Qr{get ae(){return!1}constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const e=t.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.ue=e+"://"+t.host,this._e=`projects/${r}/databases/${i}`,this.ce=this.databaseId.database===Qt?`project_id=${r}`:`project_id=${r}&database_id=${i}`}le(t,e,r,i,s){const u=Wr(),d=this.he(t,e.toUriEncodedString());ft(Ee,`Sending RPC '${t}' ${u}:`,d,r);const p={"google-cloud-resource-prefix":this._e,"x-goog-request-params":this.ce};this.fe(p,i,s);const{host:_}=new URL(d),y=Vn(_);return this.me(t,d,p,r,y).then(I=>(ft(Ee,`Received RPC '${t}' ${u}: `,I),I),I=>{throw Rn(Ee,`RPC '${t}' ${u} failed with error: `,I,"url: ",d,"request:",r),I})}de(t,e,r,i,s,u){return this.le(t,e,r,i,s)}fe(t,e,r){if(t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+vt}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),e&&e.headers.forEach((i,s)=>t[s]=i),r&&r.headers.forEach((i,s)=>t[s]=i),this.databaseInfo._customHeaders)for(const i of Object.keys(this.databaseInfo._customHeaders))t[i]=this.databaseInfo._customHeaders[i]}he(t,e){const r=Kr[t];let i=`${this.ue}/v1/${e}:${r}`;return this.databaseInfo.apiKey&&(i=`${i}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),i}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var rn,A;function Hr(n){switch(n){case g.OK:return v(64938);case g.CANCELLED:case g.UNKNOWN:case g.DEADLINE_EXCEEDED:case g.RESOURCE_EXHAUSTED:case g.INTERNAL:case g.UNAVAILABLE:case g.UNAUTHENTICATED:return!1;case g.INVALID_ARGUMENT:case g.NOT_FOUND:case g.ALREADY_EXISTS:case g.PERMISSION_DENIED:case g.FAILED_PRECONDITION:case g.ABORTED:case g.OUT_OF_RANGE:case g.UNIMPLEMENTED:case g.DATA_LOSS:return!0;default:return v(15467,{code:n})}}function sn(n){if(n===void 0)return se("RPC_ERROR","HTTP error has no status"),g.UNKNOWN;switch(n){case 200:return g.OK;case 400:return g.FAILED_PRECONDITION;case 401:return g.UNAUTHENTICATED;case 403:return g.PERMISSION_DENIED;case 404:return g.NOT_FOUND;case 409:return g.ABORTED;case 416:return g.OUT_OF_RANGE;case 429:return g.RESOURCE_EXHAUSTED;case 499:return g.CANCELLED;case 500:return g.UNKNOWN;case 501:return g.UNIMPLEMENTED;case 503:return g.UNAVAILABLE;case 504:return g.DEADLINE_EXCEEDED;default:return n>=200&&n<300?g.OK:n>=400&&n<500?g.FAILED_PRECONDITION:n>=500&&n<600?g.INTERNAL:g.UNKNOWN}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(A=rn||(rn={}))[A.OK=0]="OK",A[A.CANCELLED=1]="CANCELLED",A[A.UNKNOWN=2]="UNKNOWN",A[A.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",A[A.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",A[A.NOT_FOUND=5]="NOT_FOUND",A[A.ALREADY_EXISTS=6]="ALREADY_EXISTS",A[A.PERMISSION_DENIED=7]="PERMISSION_DENIED",A[A.UNAUTHENTICATED=16]="UNAUTHENTICATED",A[A.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",A[A.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",A[A.ABORTED=10]="ABORTED",A[A.OUT_OF_RANGE=11]="OUT_OF_RANGE",A[A.UNIMPLEMENTED=12]="UNIMPLEMENTED",A[A.INTERNAL=13]="INTERNAL",A[A.UNAVAILABLE=14]="UNAVAILABLE",A[A.DATA_LOSS=15]="DATA_LOSS";class Jr extends Qr{Ee(t,e){throw new Error("Not supported by FetchConnection")}async me(t,e,r,i,s){var p;const u=JSON.stringify(i);let d;try{const _={method:"POST",headers:r,body:u};s&&(_.credentials="include"),d=await fetch(e,_)}catch(_){const y=_,I=y==null?void 0:y.message,T=y!=null&&y.cause?String(y.cause):void 0,N=(I&&T?`${I} (${T})`:I??T)??(y==null?void 0:y.statusText)??String(_);throw new E(sn(y==null?void 0:y.status),`Request failed with error: ${N}`)}if(!d.ok){let _=await d.json();Array.isArray(_)&&(_=_[0]);const y=(p=_==null?void 0:_.error)==null?void 0:p.message;throw new E(sn(d.status),`Request failed with error: ${y??d.statusText}`)}return d.json()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function on(n){let t=0;for(const e in n)Object.prototype.hasOwnProperty.call(n,e)&&t++;return t}function Mt(n,t){for(const e in n)Object.prototype.hasOwnProperty.call(n,e)&&t(e,n[e])}function Yr(n,t){const e=[];for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.push(t(n[r],r,n));return e}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xr extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tt{constructor(t){this.binaryString=t}static fromBase64String(t){const e=function(i){try{return atob(i)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new Xr("Invalid base64 string: "+s):s}}(t);return new tt(e)}static fromUint8Array(t){const e=function(i){let s="";for(let u=0;u<i.length;++u)s+=String.fromCharCode(i[u]);return s}(t);return new tt(e)}[Symbol.iterator](){let t=0;return{next:()=>t<this.binaryString.length?{value:this.binaryString.charCodeAt(t++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(e){return btoa(e)}(this.binaryString)}toUint8Array(){return function(e){const r=new Uint8Array(e.length);for(let i=0;i<e.length;i++)r[i]=e.charCodeAt(i);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(t){return k(this.binaryString,t.binaryString)}isEqual(t){return this.binaryString===t.binaryString}}tt.EMPTY_BYTE_STRING=new tt("");const Zr=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function mt(n){if(q(!!n,39018),typeof n=="string"){let t=0;const e=Zr.exec(n);if(q(!!e,46558,{timestamp:n}),e[1]){let i=e[1];i=(i+"000000000").substr(0,9),t=Number(i)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:t}}return{seconds:O(n.seconds),nanos:O(n.nanos)}}function O(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Ot(n){return typeof n=="string"?tt.fromBase64String(n):tt.fromUint8Array(n)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function z(n,t){const e={typeString:n};return t&&(e.value=t),e}function qt(n,t){if(!bn(n))throw new E(g.INVALID_ARGUMENT,"JSON must be an object");let e;for(const r in t)if(t[r]){const i=t[r].typeString,s="value"in t[r]?{value:t[r].value}:void 0;if(!(r in n)){e=`JSON missing required field: '${r}'`;break}const u=n[r];if(i&&typeof u!==i){e=`JSON field '${r}' must be a ${i}.`;break}if(s!==void 0&&u!==s.value){e=`Expected '${r}' field to equal '${s.value}'`;break}}if(e)throw new E(g.INVALID_ARGUMENT,e);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const an=-62135596800,un=1e6;class S{static now(){return S.fromMillis(Date.now())}static fromDate(t){return S.fromMillis(t.getTime())}static fromMillis(t){const e=Math.floor(t/1e3),r=Math.floor((t-1e3*e)*un);return new S(e,r)}static fromInstant(t){if(!t||typeof t.Te!="bigint")throw new E(g.INVALID_ARGUMENT,"Invalid Temporal.Instant object provided.");return S._fromEpochNanoseconds(t.Te)}static _fromEpochNanoseconds(t){let e,r;if(t>=0n)e=Number(t/1000000000n),r=Number(t%1000000000n);else{const i=t%1000000000n;i===0n?(e=Number(t/1000000000n),r=0):(e=Number(t/1000000000n-1n),r=Number(i+1000000000n))}return new S(e,r)}constructor(t,e){if(this.seconds=t,this.nanoseconds=e,e<0)throw new E(g.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(e>=1e9)throw new E(g.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(t<an)throw new E(g.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t);if(t>=253402300800)throw new E(g.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/un}toInstant(){if(typeof Temporal>"u"||!Temporal.Instant)throw new E(g.FAILED_PRECONDITION,"The Temporal object is not available in the current environment.");const t=1000000000n*BigInt(this.seconds)+BigInt(this.nanoseconds);return Temporal.Instant.__PRIVATE_fromEpochNanoseconds(t)}_compareTo(t){return this.seconds===t.seconds?k(this.nanoseconds,t.nanoseconds):k(this.seconds,t.seconds)}isEqual(t){return t.seconds===this.seconds&&t.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:S._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(t){if(qt(t,S._jsonSchema))return new S(t.seconds,t.nanoseconds)}valueOf(){const t=this.seconds-an;return String(t).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}S._jsonSchemaVersion="firestore/timestamp/1.0",S._jsonSchema={type:z("string",S._jsonSchemaVersion),seconds:z("number"),nanoseconds:z("number")};function ke(n){var e,r;return((r=(((e=n==null?void 0:n.mapValue)==null?void 0:e.fields)||{}).__type__)==null?void 0:r.stringValue)==="server_timestamp"}function On(n){const t=n.mapValue.fields.__previous_value__;return ke(t)?On(t):t}function Ct(n){const t=mt(n.mapValue.fields.__local_write_time__.timestampValue);return new S(t.seconds,t.nanos)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cn="__type__",ti="__max__",Bt={},Ln="__vector__",Jt="value";function pt(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?ke(n)?4:function(e){return(((e.mapValue||{}).fields||{}).__type__||{}).stringValue===ti}(n)?9007199254740991:function(e){var i,s;return((s=(((i=e==null?void 0:e.mapValue)==null?void 0:i.fields)||{})[Cn])==null?void 0:s.stringValue)===Ln}(n)?10:11:v(28295,{value:n})}function Vt(n,t,e){if(n===t)return!0;const r=pt(n);if(r!==pt(t))return!1;switch(r){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===t.booleanValue;case 4:return Ct(n).isEqual(Ct(t));case 3:return function(s,u){if(typeof s.timestampValue=="string"&&typeof u.timestampValue=="string"&&s.timestampValue.length===u.timestampValue.length)return s.timestampValue===u.timestampValue;const d=mt(s.timestampValue),p=mt(u.timestampValue);return d.seconds===p.seconds&&d.nanos===p.nanos}(n,t);case 5:return n.stringValue===t.stringValue;case 6:return function(s,u){return Ot(s.bytesValue).isEqual(Ot(u.bytesValue))}(n,t);case 7:return n.referenceValue===t.referenceValue;case 8:return function(s,u){return O(s.geoPointValue.latitude)===O(u.geoPointValue.latitude)&&O(s.geoPointValue.longitude)===O(u.geoPointValue.longitude)}(n,t);case 2:return function(s,u,d){if("integerValue"in s&&"integerValue"in u)return O(s.integerValue)===O(u.integerValue);let p,_;return!("doubleValue"in s)||!("doubleValue"in u)?!1:(p=O(s.doubleValue),_=O(u.doubleValue),p===_?Ht(p)===Ht(_):!!(d===void 0||d.Pe)&&isNaN(p)&&isNaN(_))}(n,t,e);case 9:return De(n.arrayValue.values||[],t.arrayValue.values||[],(i,s)=>Vt(i,s,e));case 10:case 11:return function(s,u,d){const p=s.mapValue.fields||{},_=u.mapValue.fields||{};if(on(p)!==on(_))return!1;for(const y in p)if(p.hasOwnProperty(y)&&(_[y]===void 0||!Vt(p[y],_[y],d)))return!1;return!0}(n,t,e);default:return v(52216,{left:n})}}function Lt(n,t){return(n.values||[]).find(e=>Vt(e,t))!==void 0}function Yt(n,t){if(n===t)return 0;const e=pt(n),r=pt(t);if(e!==r)return k(e,r);switch(e){case 0:case 9007199254740991:return 0;case 1:return k(n.booleanValue,t.booleanValue);case 2:return function(s,u){const d=O(s.integerValue||s.doubleValue),p=O(u.integerValue||u.doubleValue);return d<p?-1:d>p?1:d===p?0:isNaN(d)?isNaN(p)?0:-1:1}(n,t);case 3:return ln(n.timestampValue,t.timestampValue);case 4:return ln(Ct(n),Ct(t));case 5:return Ae(n.stringValue,t.stringValue);case 6:return function(s,u){const d=Ot(s),p=Ot(u);return d.compareTo(p)}(n.bytesValue,t.bytesValue);case 7:return function(s,u){const d=s.split("/"),p=u.split("/");for(let _=0;_<d.length&&_<p.length;_++){const y=k(d[_],p[_]);if(y!==0)return y}return k(d.length,p.length)}(n.referenceValue,t.referenceValue);case 8:return function(s,u){const d=k(O(s.latitude),O(u.latitude));return d!==0?d:k(O(s.longitude),O(u.longitude))}(n.geoPointValue,t.geoPointValue);case 9:return cn(n.arrayValue,t.arrayValue);case 10:return function(s,u){var T,N,w,V;const d=s.fields||{},p=u.fields||{},_=(T=d[Jt])==null?void 0:T.arrayValue,y=(N=p[Jt])==null?void 0:N.arrayValue,I=k(((w=_==null?void 0:_.values)==null?void 0:w.length)||0,((V=y==null?void 0:y.values)==null?void 0:V.length)||0);return I!==0?I:cn(_,y)}(n.mapValue,t.mapValue);case 11:return function(s,u){if(s===Bt&&u===Bt)return 0;if(s===Bt)return 1;if(u===Bt)return-1;const d=s.fields||{},p=Object.keys(d),_=u.fields||{},y=Object.keys(_);p.sort(),y.sort();for(let I=0;I<p.length&&I<y.length;++I){const T=Ae(p[I],y[I]);if(T!==0)return T;const N=Yt(d[p[I]],_[y[I]]);if(N!==0)return N}return k(p.length,y.length)}(n.mapValue,t.mapValue);default:throw v(23264,{Re:e})}}function ln(n,t){if(typeof n=="string"&&typeof t=="string"&&n.length===t.length)return k(n,t);const e=mt(n),r=mt(t),i=k(e.seconds,r.seconds);return i!==0?i:k(e.nanos,r.nanos)}function cn(n,t){const e=n.values||[],r=t.values||[];for(let i=0;i<e.length&&i<r.length;++i){const s=Yt(e[i],r[i]);if(s!==void 0&&s!==0)return s}return k(e.length,r.length)}function Xt(n,t){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${t.path.canonicalString()}`}}function xn(n){return!!n&&"arrayValue"in n}function hn(n){return!!n&&"nullValue"in n}function fn(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Ie(n){return!!n&&"mapValue"in n}function bt(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const t={mapValue:{fields:{}}};return Mt(n.mapValue.fields,(e,r)=>t.mapValue.fields[e]=bt(r)),t}if(n.arrayValue){const t={arrayValue:{values:[]}};for(let e=0;e<(n.arrayValue.values||[]).length;++e)t.arrayValue.values[e]=bt(n.arrayValue.values[e]);return t}return{...n}}class Zt{constructor(t,e){this.position=t,this.inclusive=e}}function dn(n,t){if(n===null)return t===null;if(t===null||n.inclusive!==t.inclusive||n.position.length!==t.position.length)return!1;for(let e=0;e<n.position.length;e++)if(!Vt(n.position[e],t.position[e]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Un{}class $ extends Un{constructor(t,e,r){super(),this.field=t,this.op=e,this.value=r}static create(t,e,r){return t.isKeyField()?e==="in"||e==="not-in"?this.createKeyFieldInFilter(t,e,r):new ei(t,e,r):e==="array-contains"?new ii(t,r):e==="in"?new si(t,r):e==="not-in"?new oi(t,r):e==="array-contains-any"?new ai(t,r):new $(t,e,r)}static createKeyFieldInFilter(t,e,r){return e==="in"?new ni(t,r):new ri(t,r)}matches(t){const e=t.data.field(this.field);return this.op==="!="?e!==null&&e.nullValue===void 0&&this.matchesComparison(Yt(e,this.value)):e!==null&&pt(this.value)===pt(e)&&this.matchesComparison(Yt(e,this.value))}matchesComparison(t){switch(this.op){case"<":return t<0;case"<=":return t<=0;case"==":return t===0;case"!=":return t!==0;case">":return t>0;case">=":return t>=0;default:return v(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class _t extends Un{constructor(t,e){super(),this.filters=t,this.op=e,this.Ae=null}static create(t,e){return new _t(t,e)}matches(t){return function(r){return r.op==="and"}(this)?this.filters.find(e=>!e.matches(t))===void 0:this.filters.find(e=>e.matches(t))!==void 0}getFlattenedFilters(){return this.Ae!==null||(this.Ae=this.filters.reduce((t,e)=>t.concat(e.getFlattenedFilters()),[])),this.Ae}getFilters(){return Object.assign([],this.filters)}}function Mn(n,t){return n instanceof $?function(r,i){return i instanceof $&&r.op===i.op&&r.field.isEqual(i.field)&&Vt(r.value,i.value)}(n,t):n instanceof _t?function(r,i){return i instanceof _t&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce((s,u,d)=>s&&Mn(u,i.filters[d]),!0):!1}(n,t):void v(19439)}class ei extends ${constructor(t,e,r){super(t,e,r),this.key=D.fromName(r.referenceValue)}matches(t){const e=D.comparator(t.key,this.key);return this.matchesComparison(e)}}class ni extends ${constructor(t,e){super(t,"in",e),this.keys=qn("in",e)}matches(t){return this.keys.some(e=>e.isEqual(t.key))}}class ri extends ${constructor(t,e){super(t,"not-in",e),this.keys=qn("not-in",e)}matches(t){return!this.keys.some(e=>e.isEqual(t.key))}}function qn(n,t){var e;return(((e=t.arrayValue)==null?void 0:e.values)||[]).map(r=>D.fromName(r.referenceValue))}class ii extends ${constructor(t,e){super(t,"array-contains",e)}matches(t){const e=t.data.field(this.field);return xn(e)&&Lt(e.arrayValue,this.value)}}class si extends ${constructor(t,e){super(t,"in",e)}matches(t){const e=t.data.field(this.field);return e!==null&&Lt(this.value.arrayValue,e)}}class oi extends ${constructor(t,e){super(t,"not-in",e)}matches(t){if(Lt(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const e=t.data.field(this.field);return e!==null&&e.nullValue===void 0&&!Lt(this.value.arrayValue,e)}}class ai extends ${constructor(t,e){super(t,"array-contains-any",e)}matches(t){const e=t.data.field(this.field);return!(!xn(e)||!e.arrayValue.values)&&e.arrayValue.values.some(r=>Lt(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class te{constructor(t,e="asc"){this.field=t,this.dir=e}}function ui(n,t){return n.dir===t.dir&&n.field.isEqual(t.field)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class F{static fromTimestamp(t){return new F(t)}static min(){return new F(new S(0,0))}static max(){return new F(new S(253402300799,999999999))}constructor(t){this.timestamp=t}compareTo(t){return this.timestamp._compareTo(t.timestamp)}isEqual(t){return this.timestamp.isEqual(t.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ee{constructor(t,e){this.comparator=t,this.root=e||L.EMPTY}insert(t,e){return new ee(this.comparator,this.root.insert(t,e,this.comparator).copy(null,null,L.BLACK,null,null))}remove(t){return new ee(this.comparator,this.root.remove(t,this.comparator).copy(null,null,L.BLACK,null,null))}get(t){let e=this.root;for(;!e.isEmpty();){const r=this.comparator(t,e.key);if(r===0)return e.value;r<0?e=e.left:r>0&&(e=e.right)}return null}indexOf(t){let e=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(t,r.key);if(i===0)return e+r.left.size;i<0?r=r.left:(e+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(t){return this.root.inorderTraversal(t)}forEach(t){this.inorderTraversal((e,r)=>(t(e,r),!1))}toString(){const t=[];return this.inorderTraversal((e,r)=>(t.push(`${e}:${r}`),!1)),`{${t.join(", ")}}`}reverseTraversal(t){return this.root.reverseTraversal(t)}getIterator(){return new Wt(this.root,null,this.comparator,!1)}getIteratorFrom(t){return new Wt(this.root,t,this.comparator,!1)}getReverseIterator(){return new Wt(this.root,null,this.comparator,!0)}getReverseIteratorFrom(t){return new Wt(this.root,t,this.comparator,!0)}}class Wt{constructor(t,e,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!t.isEmpty();)if(s=e?r(t.key,e):1,e&&i&&(s*=-1),s<0)t=this.isReverse?t.left:t.right;else{if(s===0){this.nodeStack.push(t);break}this.nodeStack.push(t),t=this.isReverse?t.right:t.left}}getNext(){let t=this.nodeStack.pop();const e={key:t.key,value:t.value};if(this.isReverse)for(t=t.left;!t.isEmpty();)this.nodeStack.push(t),t=t.right;else for(t=t.right;!t.isEmpty();)this.nodeStack.push(t),t=t.left;return e}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const t=this.nodeStack[this.nodeStack.length-1];return{key:t.key,value:t.value}}}class L{constructor(t,e,r,i,s){this.key=t,this.value=e,this.color=r??L.RED,this.left=i??L.EMPTY,this.right=s??L.EMPTY,this.size=this.left.size+1+this.right.size}copy(t,e,r,i,s){return new L(t??this.key,e??this.value,r??this.color,i??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(t){return this.left.inorderTraversal(t)||t(this.key,this.value)||this.right.inorderTraversal(t)}reverseTraversal(t){return this.right.reverseTraversal(t)||t(this.key,this.value)||this.left.reverseTraversal(t)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(t,e,r){let i=this;const s=r(t,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(t,e,r),null):s===0?i.copy(null,e,null,null,null):i.copy(null,null,null,null,i.right.insert(t,e,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return L.EMPTY;let t=this;return t.left.isRed()||t.left.left.isRed()||(t=t.moveRedLeft()),t=t.copy(null,null,null,t.left.removeMin(),null),t.fixUp()}remove(t,e){let r,i=this;if(e(t,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(t,e),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),e(t,i.key)===0){if(i.right.isEmpty())return L.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(t,e))}return i.fixUp()}isRed(){return this.color}fixUp(){let t=this;return t.right.isRed()&&!t.left.isRed()&&(t=t.rotateLeft()),t.left.isRed()&&t.left.left.isRed()&&(t=t.rotateRight()),t.left.isRed()&&t.right.isRed()&&(t=t.colorFlip()),t}moveRedLeft(){let t=this.colorFlip();return t.right.left.isRed()&&(t=t.copy(null,null,null,null,t.right.rotateRight()),t=t.rotateLeft(),t=t.colorFlip()),t}moveRedRight(){let t=this.colorFlip();return t.left.left.isRed()&&(t=t.rotateRight(),t=t.colorFlip()),t}rotateLeft(){const t=this.copy(null,null,L.RED,null,this.right.left);return this.right.copy(null,null,this.color,t,null)}rotateRight(){const t=this.copy(null,null,L.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,t)}colorFlip(){const t=this.left.copy(null,null,!this.left.color,null,null),e=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,t,e)}checkMaxDepth(){const t=this.check();return Math.pow(2,t)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw v(43730,{key:this.key,value:this.value});if(this.right.isRed())throw v(14113,{key:this.key,value:this.value});const t=this.left.check();if(t!==this.right.check())throw v(27949);return t+(this.isRed()?0:1)}}L.EMPTY=null,L.RED=!0,L.BLACK=!1;L.EMPTY=new class{constructor(){this.size=0}get key(){throw v(57766)}get value(){throw v(16141)}get color(){throw v(16727)}get left(){throw v(29726)}get right(){throw v(36894)}copy(t,e,r,i,s){return this}insert(t,e,r){return new L(t,e)}remove(t,e){return this}isEmpty(){return!0}inorderTraversal(t){return!1}reverseTraversal(t){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xt{constructor(t){this.comparator=t,this.data=new ee(this.comparator)}has(t){return this.data.get(t)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(t){return this.data.indexOf(t)}forEach(t){this.data.inorderTraversal((e,r)=>(t(e),!1))}forEachInRange(t,e){const r=this.data.getIteratorFrom(t[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,t[1])>=0)return;e(i.key)}}forEachWhile(t,e){let r;for(r=e!==void 0?this.data.getIteratorFrom(e):this.data.getIterator();r.hasNext();)if(!t(r.getNext().key))return}firstAfterOrEqual(t){const e=this.data.getIteratorFrom(t);return e.hasNext()?e.getNext().key:null}getIterator(){return new mn(this.data.getIterator())}getIteratorFrom(t){return new mn(this.data.getIteratorFrom(t))}add(t){return this.copy(this.data.remove(t).insert(t,!0))}delete(t){return this.has(t)?this.copy(this.data.remove(t)):this}isEmpty(){return this.data.isEmpty()}unionWith(t){let e=this;return e.size<t.size&&(e=t,t=this),t.forEach(r=>{e=e.add(r)}),e}isEqual(t){if(!(t instanceof xt)||this.size!==t.size)return!1;const e=this.data.getIterator(),r=t.data.getIterator();for(;e.hasNext();){const i=e.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const t=[];return this.forEach(e=>{t.push(e)}),t}toString(){const t=[];return this.forEach(e=>t.push(e)),"SortedSet("+t.toString()+")"}copy(t){const e=new xt(this.comparator);return e.data=t,e}}class mn{constructor(t){this.iter=t}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gt{constructor(t){this.fields=t,t.sort(st.comparator)}static empty(){return new gt([])}unionWith(t){let e=new xt(st.comparator);for(const r of this.fields)e=e.add(r);for(const r of t)e=e.add(r);return new gt(e.toArray())}covers(t){for(const e of this.fields)if(e.isPrefixOf(t))return!0;return!1}isEqual(t){return De(this.fields,t.fields,(e,r)=>e.isEqual(r))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class M{constructor(t){this.value=t}static empty(){return new M({mapValue:{}})}field(t){if(t.isEmpty())return this.value;{let e=this.value;for(let r=0;r<t.length-1;++r)if(e=(e.mapValue.fields||{})[t.get(r)],!Ie(e))return null;return e=(e.mapValue.fields||{})[t.lastSegment()],e||null}}set(t,e){this.getFieldsMap(t.popLast())[t.lastSegment()]=bt(e)}setAll(t){let e=st.emptyPath(),r={},i=[];t.forEach((u,d)=>{if(!e.isImmediateParentOf(d)){const p=this.getFieldsMap(e);this.applyChanges(p,r,i),r={},i=[],e=d.popLast()}u?r[d.lastSegment()]=bt(u):i.push(d.lastSegment())});const s=this.getFieldsMap(e);this.applyChanges(s,r,i)}delete(t){const e=this.field(t.popLast());Ie(e)&&e.mapValue.fields&&delete e.mapValue.fields[t.lastSegment()]}isEqual(t){return Vt(this.value,t.value)}getFieldsMap(t){let e=this.value;e.mapValue.fields||(e.mapValue={fields:{}});for(let r=0;r<t.length;++r){let i=e.mapValue.fields[t.get(r)];Ie(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},e.mapValue.fields[t.get(r)]=i),e=i}return e.mapValue.fields}applyChanges(t,e,r){Mt(e,(i,s)=>t[i]=s);for(const i of r)delete t[i]}clone(){return new M(bt(this.value))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class J{constructor(t,e,r,i,s,u,d){this.key=t,this.documentType=e,this.version=r,this.readTime=i,this.createTime=s,this.data=u,this.documentState=d}static newInvalidDocument(t){return new J(t,0,F.min(),F.min(),F.min(),M.empty(),0)}static newFoundDocument(t,e,r,i){return new J(t,1,e,F.min(),r,i,0)}static newNoDocument(t,e){return new J(t,2,e,F.min(),F.min(),M.empty(),0)}static newUnknownDocument(t,e){return new J(t,3,e,F.min(),F.min(),M.empty(),2)}convertToFoundDocument(t,e){return!this.createTime.isEqual(F.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=t),this.version=t,this.documentType=1,this.data=e,this.documentState=0,this}convertToNoDocument(t){return this.version=t,this.documentType=2,this.data=M.empty(),this.documentState=0,this}convertToUnknownDocument(t){return this.version=t,this.documentType=3,this.data=M.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=F.min(),this}setReadTime(t){return this.readTime=t,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(t){return t instanceof J&&this.key.isEqual(t.key)&&this.version.isEqual(t.version)&&this.documentType===t.documentType&&this.documentState===t.documentState&&this.data.isEqual(t.data)}mutableCopy(){return new J(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class li{constructor(t,e=null,r=[],i=[],s=null,u=null,d=null){this.path=t,this.collectionGroup=e,this.orderBy=r,this.filters=i,this.limit=s,this.startAt=u,this.endAt=d,this.Ie=null}}function pn(n,t=null,e=[],r=[],i=null,s=null,u=null){return new li(n,t,e,r,i,s,u)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Et{constructor(t,e=null,r=[],i=[],s=null,u="F",d=null,p=null){this.path=t,this.collectionGroup=e,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=u,this.startAt=d,this.endAt=p,this.pe=null,this.ye=null,this.we=null,this.startAt,this.endAt}}function $n(n){return n.collectionGroup!==null}function jn(n){const t=dt(n);if(t.pe===null){t.pe=[];const e=new Set;for(const s of t.explicitOrderBy)t.pe.push(s),e.add(s.field.canonicalString());const r=t.explicitOrderBy.length>0?t.explicitOrderBy[t.explicitOrderBy.length-1].dir:"asc";(function(u){let d=new xt(st.comparator);return u.filters.forEach(p=>{p.getFlattenedFilters().forEach(_=>{_.isInequality()&&(d=d.add(_.field))})}),d})(t).forEach(s=>{e.has(s.canonicalString())||s.isKeyField()||t.pe.push(new te(s,r))}),e.has(st.keyField().canonicalString())||t.pe.push(new te(st.keyField(),r))}return t.pe}function Ve(n){const t=dt(n);return t.ye||(t.ye=Gn(t,jn(n))),t.ye}function Gn(n,t){if(n.limitType==="F")return pn(n.path,n.collectionGroup,t,n.filters,n.limit,n.startAt,n.endAt);{t=t.map(i=>{const s=i.dir==="desc"?"asc":"desc";return new te(i.field,s)});const e=n.endAt?new Zt(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new Zt(n.startAt.position,n.startAt.inclusive):null;return pn(n.path,n.collectionGroup,t,n.filters,n.limit,e,r)}}function ve(n,t){const e=n.filters.concat([t]);return new Et(n.path,n.collectionGroup,n.explicitOrderBy.slice(),e,n.limit,n.limitType,n.startAt,n.endAt)}function ci(n,t){return function(r,i){if(r.limit!==i.limit||r.orderBy.length!==i.orderBy.length)return!1;for(let s=0;s<r.orderBy.length;s++)if(!ui(r.orderBy[s],i.orderBy[s]))return!1;if(r.filters.length!==i.filters.length)return!1;for(let s=0;s<r.filters.length;s++)if(!Mn(r.filters[s],i.filters[s]))return!1;return r.collectionGroup===i.collectionGroup&&!!r.path.isEqual(i.path)&&!!dn(r.startAt,i.startAt)&&dn(r.endAt,i.endAt)}(Ve(n),Ve(t))&&n.limitType===t.limitType}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zn(n,t){if(n.useProto3Json){if(isNaN(t))return{doubleValue:"NaN"};if(t===1/0)return{doubleValue:"Infinity"};if(t===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Ht(t)?"-0":t}}function ae(n,t,e){return function(i){return typeof i=="number"&&Number.isInteger(i)&&!Ht(i)&&i<=Number.MAX_SAFE_INTEGER&&i>=Number.MIN_SAFE_INTEGER}(t)?function(i){return{integerValue:""+i}}(t):zn(n,t)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ue{constructor(){this._=void 0}}class Bn extends ue{}class Wn extends ue{constructor(t){super(),this.elements=t}}class Kn extends ue{constructor(t){super(),this.elements=t}}class Oe extends ue{constructor(t,e){super(),this.serializer=t,this.ge=e}}class Qn extends Oe{}class Hn extends Oe{}class Jn extends Oe{}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nt{constructor(t,e){this.field=t,this.transform=e}}class x{constructor(t,e){this.updateTime=t,this.exists=e}static none(){return new x}static exists(t){return new x(void 0,t)}static updateTime(t){return new x(t)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(t){return this.exists===t.exists&&(this.updateTime?!!t.updateTime&&this.updateTime.isEqual(t.updateTime):!t.updateTime)}}class le{}class Yn extends le{constructor(t,e,r,i=[]){super(),this.key=t,this.value=e,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class Ce extends le{constructor(t,e,r,i,s=[]){super(),this.key=t,this.data=e,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}class ce extends le{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Xn extends le{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hi={asc:"ASCENDING",desc:"DESCENDING"},fi={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},di={and:"AND",or:"OR"};class mi{constructor(t,e){this.databaseId=t,this.useProto3Json=e}}function Kt(n,t){return n.useProto3Json?`${new Date(1e3*t.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+t.nanoseconds).slice(-9)}Z`:{seconds:""+t.seconds,nanos:t.nanoseconds}}function pi(n,t){return n.useProto3Json?t.toBase64():t.toUint8Array()}function _i(n,t){return Kt(n,t.toTimestamp())}function Dt(n){return q(!!n,49232),F.fromTimestamp(function(e){const r=mt(e);return new S(r.seconds,r.nanos)}(n))}function Le(n,t){return Ne(n,t).canonicalString()}function Ne(n,t){const e=function(i){return new b(["projects",i.projectId,"databases",i.database])}(n).child("documents");return t===void 0?e:e.child(t)}function ne(n,t){return Le(n.databaseId,t.path)}function Re(n,t){const e=function(i){const s=b.fromString(i);return q(er(s),10190,{key:s.toString()}),s}(t);if(e.get(1)!==n.databaseId.projectId)throw new E(g.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+e.get(1)+" vs "+n.databaseId.projectId);if(e.get(3)!==n.databaseId.database)throw new E(g.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+e.get(3)+" vs "+n.databaseId.database);return new D(function(i){return q(i.length>4&&i.get(4)==="documents",29091,{key:i.toString()}),i.popFirst(5)}(e))}function _n(n,t,e){return{name:ne(n,t),fields:e.value.mapValue.fields}}function gi(n,t){return"found"in t?function(r,i){q(!!i.found,43571),i.found.name,i.found.updateTime;const s=Re(r,i.found.name),u=Dt(i.found.updateTime),d=i.found.createTime?Dt(i.found.createTime):F.min(),p=new M({mapValue:{fields:i.found.fields}});return J.newFoundDocument(s,u,d,p)}(n,t):"missing"in t?function(r,i){q(!!i.missing,3894),q(!!i.readTime,22933);const s=Re(r,i.missing),u=Dt(i.readTime);return J.newNoDocument(s,u)}(n,t):v(7234,{result:t})}function yi(n,t){let e;if(t instanceof Yn)e={update:_n(n,t.key,t.value)};else if(t instanceof ce)e={delete:ne(n,t.key)};else if(t instanceof Ce)e={update:_n(n,t.key,t.data),updateMask:Ai(t.fieldMask)};else{if(!(t instanceof Xn))return v(16599,{Fe:t.type});e={verify:ne(n,t.key)}}return t.fieldTransforms.length>0&&(e.updateTransforms=t.fieldTransforms.map(r=>function(s,u){const d=u.transform;if(d instanceof Bn)return{fieldPath:u.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(d instanceof Wn)return{fieldPath:u.field.canonicalString(),appendMissingElements:{values:d.elements}};if(d instanceof Kn)return{fieldPath:u.field.canonicalString(),removeAllFromArray:{values:d.elements}};if(d instanceof Qn)return{fieldPath:u.field.canonicalString(),increment:d.ge};if(d instanceof Hn)return{fieldPath:u.field.canonicalString(),minimum:d.ge};if(d instanceof Jn)return{fieldPath:u.field.canonicalString(),maximum:d.ge};throw v(20930,{transform:u.transform})}(0,r))),t.precondition.isNone||(e.currentDocument=function(i,s){return s.updateTime!==void 0?{updateTime:_i(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:v(27497)}(n,t.precondition)),e}function Zn(n,t){const e={structuredQuery:{}},r=t.path;let i;t.collectionGroup!==null?(i=r,e.structuredQuery.from=[{collectionId:t.collectionGroup,allDescendants:!0}]):(i=r.popLast(),e.structuredQuery.from=[{collectionId:r.lastSegment()}]),e.parent=function(_,y){return Le(_.databaseId,y)}(n,i);const s=function(_){if(_.length!==0)return tr(_t.create(_,"and"))}(t.filters);s&&(e.structuredQuery.where=s);const u=function(_){if(_.length!==0)return _.map(y=>function(T){return{field:it(T.field),direction:Ei(T.dir)}}(y))}(t.orderBy);u&&(e.structuredQuery.orderBy=u);const d=function(_,y){return _.useProto3Json||kn(y)?y:{value:y}}(n,t.limit);return d!==null&&(e.structuredQuery.limit=d),t.startAt&&(e.structuredQuery.startAt=function(_){return{before:_.inclusive,values:_.position}}(t.startAt)),t.endAt&&(e.structuredQuery.endAt=function(_){return{before:!_.inclusive,values:_.position}}(t.endAt)),{ve:e,parent:i}}function Ei(n){return hi[n]}function Ii(n){return fi[n]}function Ti(n){return di[n]}function it(n){return{fieldPath:n.canonicalString()}}function tr(n){return n instanceof $?function(e){if(e.op==="=="){if(fn(e.value))return{unaryFilter:{field:it(e.field),op:"IS_NAN"}};if(hn(e.value))return{unaryFilter:{field:it(e.field),op:"IS_NULL"}}}else if(e.op==="!="){if(fn(e.value))return{unaryFilter:{field:it(e.field),op:"IS_NOT_NAN"}};if(hn(e.value))return{unaryFilter:{field:it(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:it(e.field),op:Ii(e.op),value:e.value}}}(n):n instanceof _t?function(e){const r=e.getFilters().map(i=>tr(i));return r.length===1?r[0]:{compositeFilter:{op:Ti(e.op),filters:r}}}(n):v(54877,{filter:n})}function Ai(n){const t=[];return n.fields.forEach(e=>t.push(e.canonicalString())),{fieldPaths:t}}function er(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function nr(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xe(n){return new mi(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wi{}class Vi extends wi{constructor(t,e,r,i){super(),this.authCredentials=t,this.appCheckCredentials=e,this.connection=r,this.serializer=i,this.be=!1}De(){if(this.be)throw new E(g.FAILED_PRECONDITION,"The client has already been terminated.")}le(t,e,r,i){return this.De(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,u])=>this.connection.le(t,Ne(e,r),i,s,u)).catch(s=>{throw s.name==="FirebaseError"?(s.code===g.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new E(g.UNKNOWN,s.toString())})}de(t,e,r,i,s){return this.De(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([u,d])=>this.connection.de(t,Ne(e,r),i,u,d,s)).catch(u=>{throw u.name==="FirebaseError"?(u.code===g.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),u):new E(g.UNKNOWN,u.toString())})}terminate(){this.be=!0,this.connection.terminate()}}async function Rt(n,t){const e=dt(n),r={writes:t.map(i=>yi(e.serializer,i))};await e.le("Commit",e.serializer.databaseId,b.emptyPath(),r)}async function rr(n,t){const e=dt(n),r={documents:t.map(d=>ne(e.serializer,d))},i=await e.de("BatchGetDocuments",e.serializer.databaseId,b.emptyPath(),r,t.length),s=new Map;i.forEach(d=>{const p=gi(e.serializer,d);s.set(p.key.toString(),p)});const u=[];return t.forEach(d=>{const p=s.get(d.toString());q(!!p,55234,{key:d}),u.push(p)}),u}async function vi(n,t){const e=dt(n),{ve:r,parent:i}=Zn(e.serializer,Ve(t));return(await e.de("RunQuery",e.serializer.databaseId,i,{structuredQuery:r.structuredQuery})).filter(s=>!!s.document).map(s=>function(d,p,_){const y=Re(d,p.name),I=Dt(p.updateTime),T=p.createTime?Dt(p.createTime):F.min(),N=new M({mapValue:{fields:p.fields}}),w=J.newFoundDocument(y,I,T,N);return _?w.setHasCommittedMutations():w}(e.serializer,s.document,void 0))}async function Ni(n,t,e){var _;const r=dt(n),{request:i,Ne:s,parent:u}=function(I,T,N,w){const{ve:V,parent:R}=Zn(I,T),X={},Z=[];let at=0;return N.forEach(K=>{const ut="aggregate_"+at++;X[ut]=K.alias,K.aggregateType==="count"?Z.push({alias:ut,count:{}}):K.aggregateType==="avg"?Z.push({alias:ut,avg:{field:it(K.fieldPath)}}):K.aggregateType==="sum"&&Z.push({alias:ut,sum:{field:it(K.fieldPath)}})}),{request:{structuredAggregationQuery:{aggregations:Z,structuredQuery:V.structuredQuery},parent:V.parent},Ne:X,parent:R}}(r.serializer,function(I){const T=dt(I);return T.we||(T.we=Gn(T,I.explicitOrderBy)),T.we}(t),e);r.connection.ae||delete i.parent;const d=(await r.de("RunAggregationQuery",r.serializer.databaseId,u,i,1)).filter(y=>!!y.result);q(d.length===1,64727);const p=(_=d[0].result)==null?void 0:_.aggregateFields;return Object.keys(p).reduce((y,I)=>(y[s[I]]=p[I],y),{})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ir="ComponentProvider",Ft=new Map;function et(n){if(n._terminated)throw new E(g.FAILED_PRECONDITION,"The client has already been terminated.");if(!Ft.has(n)){ft(ir,"Initializing Datastore");const t=function(s){return new Jr(s)}(function(s,u,d,p,_){return new Mr(s,u,d,_.host,_.ssl,_.experimentalForceLongPolling,_.experimentalAutoDetectLongPolling,Fn(_.experimentalLongPollingOptions),_.useFetchStreams,_.isUsingEmulator,p,_._customHeaders,_.grpcFlowControlWindow)}(n._databaseId,n.app.options.appId||"",n._persistenceKey,n.app.options.apiKey,n._freezeSettings())),e=xe(n._databaseId),r=function(s,u,d,p){return new Vi(s,u,d,p)}(n._authCredentials,n._appCheckCredentials,t,e);Ft.set(n,r)}return Ft.get(n)}const Ri=1048576,sr="firestore.googleapis.com",gn=!0;class yn{constructor(t){if(t.host===void 0){if(t.ssl!==void 0)throw new E(g.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=sr,this.ssl=gn}else this.host=t.host,this.ssl=t.ssl??gn;if(this.isUsingEmulator=t.emulatorOptions!==void 0,this.credentials=t.credentials,this.ignoreUndefinedProperties=!!t.ignoreUndefinedProperties,this.localCache=t.localCache,t._customHeaders&&(this._customHeaders={...t._customHeaders}),t.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(t.cacheSizeBytes!==-1&&t.cacheSizeBytes<Ri)throw new E(g.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=t.cacheSizeBytes}if(function(r,i,s,u){if(i===!0&&u===!0)throw new E(g.INVALID_ARGUMENT,`${r} and ${s} cannot be used together.`)}("experimentalForceLongPolling",t.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",t.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!t.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:t.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!t.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Fn(t.experimentalLongPollingOptions??{}),function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new E(g.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new E(g.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new E(g.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!t.useFetchStreams,t.grpcFlowControlWindow!==void 0){if(typeof t.grpcFlowControlWindow!="number"||t.grpcFlowControlWindow<=0||t.grpcFlowControlWindow>2147483647||!Number.isInteger(t.grpcFlowControlWindow))throw new E(g.INVALID_ARGUMENT,"grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");this.grpcFlowControlWindow=t.grpcFlowControlWindow}}isEqual(t){return this.host===t.host&&this.ssl===t.ssl&&this.credentials===t.credentials&&this.cacheSizeBytes===t.cacheSizeBytes&&this.experimentalForceLongPolling===t.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===t.experimentalAutoDetectLongPolling&&function(r,i){return r.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,t.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===t.ignoreUndefinedProperties&&this.useFetchStreams===t.useFetchStreams&&this.grpcFlowControlWindow===t.grpcFlowControlWindow&&function(r,i){if(r===i)return!0;if(!r||!i)return!1;const s=Object.keys(r),u=Object.keys(i);if(s.length!==u.length)return!1;for(const d of s)if(r[d]!==i[d])return!1;return!0}(this._customHeaders,t._customHeaders)}}class nt{constructor(t,e,r,i){this._authCredentials=t,this._appCheckCredentials=e,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new yn({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new E(g.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(t){if(this._settingsFrozen)throw new E(g.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new yn(t),this._emulatorOptions=t.emulatorOptions||{},t.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new kr;switch(r.type){case"firstParty":return new xr(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new E(g.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(t.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){const r=Ft.get(e);r&&(ft(ir,"Removing Datastore"),Ft.delete(e),r.terminate())}(this),Promise.resolve()}}function Hi(n,t,e){e||(e=Qt);const r=vn(n,"firestore/lite");if(r.isInitialized(e))throw new E(g.FAILED_PRECONDITION,"Firestore can only be initialized once per app.");return r.initialize({options:t,instanceIdentifier:e})}function Ji(n,t){const e=typeof n=="object"?n:Vr(),r=typeof n=="string"?n:t||"(default)",i=vn(e,"firestore/lite").getImmediate({identifier:r});if(!i._initialized){const s=vr("firestore");s&&Pi(i,...s)}return i}function Pi(n,t,e,r={}){var _;n=W(n,nt);const i=Vn(t),s=n._getSettings(),u={...s,emulatorOptions:n._getEmulatorOptions()},d=`${t}:${e}`;i&&Ar(`https://${d}`),s.host!==sr&&s.host!==d&&Rn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const p={...s,host:d,ssl:i,emulatorOptions:r};if(!ie(p,u)&&(n._setSettings(p),r.mockUserToken)){let y,I;if(typeof r.mockUserToken=="string")y=r.mockUserToken,I=U.MOCK_USER;else{y=wr(r.mockUserToken,(_=n._app)==null?void 0:_.options.projectId);const T=r.mockUserToken.sub||r.mockUserToken.user_id;if(!T)throw new E(g.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");I=new U(T)}n._authCredentials=new Or(new Sn(y,I))}}function Yi(n){return n=W(n,nt),Rr(n.app,"firestore/lite"),n._delete()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class j{constructor(t,e,r){this.converter=e,this._query=r,this.type="query",this.firestore=t}withConverter(t){return new j(this.firestore,t,this._query)}}class P{constructor(t,e,r){this.converter=e,this._key=r,this.type="document",this.firestore=t}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Q(this.firestore,this.converter,this._key.path.popLast())}withConverter(t){return new P(this.firestore,t,this._key)}toJSON(){return{type:P._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(t,e,r){if(qt(e,P._jsonSchema))return new P(t,r||null,new D(b.fromString(e.referencePath)))}}P._jsonSchemaVersion="firestore/documentReference/1.0",P._jsonSchema={type:z("string",P._jsonSchemaVersion),referencePath:z("string")};class Q extends j{constructor(t,e,r){super(t,e,function(s){return new Et(s)}(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const t=this._path.popLast();return t.isEmpty()?null:new P(this.firestore,null,new D(t))}withConverter(t){return new Q(this.firestore,t,this._path)}}function Xi(n,t,...e){if(n=C(n),Fe("collection","path",t),n instanceof nt){const r=b.fromString(t,...e);return nn(r),new Q(n,null,r)}{if(!(n instanceof P||n instanceof Q))throw new E(g.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(b.fromString(t,...e));return nn(r),new Q(n.firestore,null,r)}}function Zi(n,t){if(n=W(n,nt),Fe("collectionGroup","collection id",t),t.indexOf("/")>=0)throw new E(g.INVALID_ARGUMENT,`Invalid collection ID '${t}' passed to function collectionGroup(). Collection IDs must not contain '/'.`);return new j(n,null,function(r){return new Et(b.emptyPath(),r)}(t))}function Si(n,t,...e){if(n=C(n),arguments.length===1&&(t=jr.newId()),Fe("doc","path",t),n instanceof nt){const r=b.fromString(t,...e);return en(r),new P(n,null,new D(r))}{if(!(n instanceof P||n instanceof Q))throw new E(g.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(b.fromString(t,...e));return en(r),new P(n.firestore,n instanceof Q?n.converter:null,new D(r))}}function ts(n,t){return n=C(n),t=C(t),(n instanceof P||n instanceof Q)&&(t instanceof P||t instanceof Q)&&n.firestore===t.firestore&&n.path===t.path&&n.converter===t.converter}function or(n,t){return n=C(n),t=C(t),n instanceof j&&t instanceof j&&n.firestore===t.firestore&&ci(n._query,t._query)&&n.converter===t.converter}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class G{constructor(t){this._byteString=t}static fromBase64String(t){try{return new G(tt.fromBase64String(t))}catch(e){throw new E(g.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+e)}}static fromUint8Array(t){return new G(tt.fromUint8Array(t))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(t){return this._byteString.isEqual(t._byteString)}toJSON(){return{type:G._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(t){if(qt(t,G._jsonSchema))return G.fromBase64String(t.bytes)}}G._jsonSchemaVersion="firestore/bytes/1.0",G._jsonSchema={type:z("string",G._jsonSchemaVersion),bytes:z("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pt{constructor(...t){for(let e=0;e<t.length;++e)if(t[e].length===0)throw new E(g.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new st(t)}isEqual(t){return this._internalPath.isEqual(t._internalPath)}}function es(){return new Pt(we)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rt{constructor(t){this._methodName=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Y{constructor(t,e){if(!isFinite(t)||t<-90||t>90)throw new E(g.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+t);if(!isFinite(e)||e<-180||e>180)throw new E(g.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+e);this._lat=t,this._long=e}get latitude(){return this._lat}get longitude(){return this._long}isEqual(t){return this._lat===t._lat&&this._long===t._long}_compareTo(t){return k(this._lat,t._lat)||k(this._long,t._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Y._jsonSchemaVersion}}static fromJSON(t){if(qt(t,Y._jsonSchema))return new Y(t.latitude,t.longitude)}}Y._jsonSchemaVersion="firestore/geoPoint/1.0",Y._jsonSchema={type:z("string",Y._jsonSchemaVersion),latitude:z("number"),longitude:z("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class B{constructor(t){this._values=(t||[]).map(e=>e)}toArray(){return this._values.map(t=>t)}isEqual(t){/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(r,i){if(r.length!==i.length)return!1;for(let s=0;s<r.length;++s)if(r[s]!==i[s])return!1;return!0}(this._values,t._values)}toJSON(){return{type:B._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(t){if(qt(t,B._jsonSchema)){if(Array.isArray(t.vectorValues)&&t.vectorValues.every(e=>typeof e=="number"))return new B(t.vectorValues);throw new E(g.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}B._jsonSchemaVersion="firestore/vectorValue/1.0",B._jsonSchema={type:z("string",B._jsonSchemaVersion),vectorValues:z("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bi=/^__.*__$/;class Di{constructor(t,e,r){this.data=t,this.fieldMask=e,this.fieldTransforms=r}toMutation(t,e){return this.fieldMask!==null?new Ce(t,this.data,this.fieldMask,e,this.fieldTransforms):new Yn(t,this.data,e,this.fieldTransforms)}}class ar{constructor(t,e,r){this.data=t,this.fieldMask=e,this.fieldTransforms=r}toMutation(t,e){return new Ce(t,this.data,this.fieldMask,e,this.fieldTransforms)}}function ur(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw v(40011,{dataSource:n})}}class he{constructor(t,e,r,i,s,u){this.settings=t,this.databaseId=e,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.validatePath(),this.fieldTransforms=s||[],this.fieldMask=u||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(t){return new he({...this.settings,...t},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(t){var i;const e=(i=this.path)==null?void 0:i.child(t),r=this.contextWith({path:e,arrayElement:!1});return r.validatePathSegment(t),r}childContextForFieldPath(t){var i;const e=(i=this.path)==null?void 0:i.child(t),r=this.contextWith({path:e,arrayElement:!1});return r.validatePath(),r}childContextForArray(t){return this.contextWith({path:void 0,arrayElement:!0})}createError(t){return re(t,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(t){return this.fieldMask.find(e=>t.isPrefixOf(e))!==void 0||this.fieldTransforms.find(e=>t.isPrefixOf(e.field))!==void 0}validatePath(){if(this.path)for(let t=0;t<this.path.length;t++)this.validatePathSegment(this.path.get(t))}validatePathSegment(t){if(t.length===0)throw this.createError("Document fields must not be empty");if(ur(this.dataSource)&&bi.test(t))throw this.createError('Document fields cannot begin and end with "__"')}}class Fi{constructor(t,e,r){this.databaseId=t,this.ignoreUndefinedProperties=e,this.serializer=r||xe(t)}createContext(t,e,r,i=!1){return new he({dataSource:t,methodName:e,targetDoc:r,path:st.emptyPath(),arrayElement:!1,hasConverter:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function It(n){const t=n._freezeSettings(),e=xe(n._databaseId);return new Fi(n._databaseId,!!t.ignoreUndefinedProperties,e)}function fe(n,t,e,r,i,s={}){const u=n.createContext(s.merge||s.mergeFields?2:0,t,e,i);We("Data must be an object, but it was:",u,r);const d=hr(r,u);let p,_;if(s.merge)p=new gt(u.fieldMask),_=u.fieldTransforms;else if(s.mergeFields){const y=[];for(const I of s.mergeFields){const T=ot(t,I,e);if(!u.contains(T))throw new E(g.INVALID_ARGUMENT,`Field '${T}' is specified in your field mask but missing from your input data.`);pr(y,T)||y.push(T)}p=new gt(y),_=u.fieldTransforms.filter(I=>p.covers(I.field))}else p=null,_=u.fieldTransforms;return new Di(new M(d),p,_)}class $t extends rt{_toFieldTransform(t){if(t.dataSource!==2)throw t.dataSource===1?t.createError(`${this._methodName}() can only appear at the top level of your update data`):t.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return t.fieldMask.push(t.path),null}isEqual(t){return t instanceof $t}}function lr(n,t,e){return new he({dataSource:3,targetDoc:t.settings.targetDoc,methodName:n._methodName,arrayElement:e},t.databaseId,t.serializer,t.ignoreUndefinedProperties)}class Ue extends rt{_toFieldTransform(t){return new Nt(t.path,new Bn)}isEqual(t){return t instanceof Ue}}class Me extends rt{constructor(t,e){super(t),this.Se=e}_toFieldTransform(t){const e=lr(this,t,!0),r=this.Se.map(s=>Tt(s,e)),i=new Wn(r);return new Nt(t.path,i)}isEqual(t){return t instanceof Me&&ie(this.Se,t.Se)}}class qe extends rt{constructor(t,e){super(t),this.Se=e}_toFieldTransform(t){const e=lr(this,t,!0),r=this.Se.map(s=>Tt(s,e)),i=new Kn(r);return new Nt(t.path,i)}isEqual(t){return t instanceof qe&&ie(this.Se,t.Se)}}class $e extends rt{constructor(t,e){super(t),this.Ce=e}_toFieldTransform(t){const e=new Qn(t.serializer,ae(t.serializer,this.Ce));return new Nt(t.path,e)}isEqual(t){return t instanceof $e&&(this.Ce===t.Ce||Number.isNaN(this.Ce)&&Number.isNaN(t.Ce))}}class je extends rt{constructor(t,e){super(t),this.Ce=e}_toFieldTransform(t){const e=new Hn(t.serializer,ae(t.serializer,this.Ce));return new Nt(t.path,e)}isEqual(t){return t instanceof je&&(this.Ce===t.Ce||Number.isNaN(this.Ce)&&Number.isNaN(t.Ce))}}class Ge extends rt{constructor(t,e){super(t),this.Ce=e}_toFieldTransform(t){const e=new Jn(t.serializer,ae(t.serializer,this.Ce));return new Nt(t.path,e)}isEqual(t){return t instanceof Ge&&(this.Ce===t.Ce||Number.isNaN(this.Ce)&&Number.isNaN(t.Ce))}}function ze(n,t,e,r){const i=n.createContext(1,t,e);We("Data must be an object, but it was:",i,r);const s=[],u=M.empty();Mt(r,(p,_)=>{const y=mr(t,p,e);_=C(_);const I=i.childContextForFieldPath(y);if(_ instanceof $t)s.push(y);else{const T=Tt(_,I);T!=null&&(s.push(y),u.set(y,T))}});const d=new gt(s);return new ar(u,d,i.fieldTransforms)}function Be(n,t,e,r,i,s){const u=n.createContext(1,t,e),d=[ot(t,r,e)],p=[i];if(s.length%2!=0)throw new E(g.INVALID_ARGUMENT,`Function ${t}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let T=0;T<s.length;T+=2)d.push(ot(t,s[T])),p.push(s[T+1]);const _=[],y=M.empty();for(let T=d.length-1;T>=0;--T)if(!pr(_,d[T])){const N=d[T];let w=p[T];w=C(w);const V=u.childContextForFieldPath(N);if(w instanceof $t)_.push(N);else{const R=Tt(w,V);R!=null&&(_.push(N),y.set(N,R))}}const I=new gt(_);return new ar(y,I,u.fieldTransforms)}function cr(n,t,e,r=!1){return Tt(e,n.createContext(r?4:3,t))}function Tt(n,t,e){if(dr(n=C(n)))return We("Unsupported field value:",t,n),hr(n,t);if(n instanceof rt)return function(i,s){if(!ur(s.dataSource))throw s.createError(`${i._methodName}() can only be used with update() and set()`);if(!s.path)throw s.createError(`${i._methodName}() is not currently supported inside arrays`);const u=i._toFieldTransform(s);u&&s.fieldTransforms.push(u)}(n,t),null;if(n===void 0&&t.ignoreUndefinedProperties)return null;if(t.path&&t.fieldMask.push(t.path),n instanceof Array){if(t.settings.arrayElement&&t.dataSource!==4)throw t.createError("Nested arrays are not supported");return function(i,s){const u=[];let d=0;for(const p of i){let _=Tt(p,s.childContextForArray(d));_==null&&(_={nullValue:"NULL_VALUE"}),u.push(_),d++}return{arrayValue:{values:u}}}(n,t)}return function(i,s,u){if((i=C(i))===null)return{nullValue:"NULL_VALUE"};if(typeof i=="number")return ae(s.serializer,i);if(typeof i=="boolean")return{booleanValue:i};if(typeof i=="string")return{stringValue:i};if(i instanceof Date){const d=S.fromDate(i);return{timestampValue:Kt(s.serializer,d)}}if(i instanceof S){const d=new S(i.seconds,1e3*Math.floor(i.nanoseconds/1e3));return{timestampValue:Kt(s.serializer,d)}}if(fr(i)){const d=S.fromInstant(i),p=new S(d.seconds,1e3*Math.floor(d.nanoseconds/1e3));return{timestampValue:Kt(s.serializer,p)}}if(i instanceof Y)return{geoPointValue:{latitude:i.latitude,longitude:i.longitude}};if(i instanceof G)return{bytesValue:pi(s.serializer,i._byteString)};if(i instanceof P){const d=s.databaseId,p=i.firestore._databaseId;if(!p.isEqual(d))throw s.createError(`Document reference is for database ${p.projectId}/${p.database} but should be for database ${d.projectId}/${d.database}`);return{referenceValue:Le(i.firestore._databaseId||s.databaseId,i._key.path)}}if(i instanceof B)return function(p,_){const y=p instanceof B?p.toArray():p;return{mapValue:{fields:{[Cn]:{stringValue:Ln},[Jt]:{arrayValue:{values:y.map(T=>{if(typeof T!="number")throw _.createError("VectorValues must only contain numeric values.");return zn(_.serializer,T)})}}}}}}(i,s);if(nr(i))return i._toProto(s.serializer);throw s.createError(`Unsupported field value: ${oe(i)}`)}(n,t)}function hr(n,t){const e={};return function(i){for(const s in i)if(Object.prototype.hasOwnProperty.call(i,s))return!1;return!0}(n)?t.path&&t.path.length>0&&t.fieldMask.push(t.path):Mt(n,(r,i)=>{const s=Tt(i,t.childContextForField(r));s!=null&&(e[r]=s)}),{mapValue:{fields:e}}}function fr(n){if(typeof n!="object"||n===null)return!1;if(typeof Temporal<"u"&&typeof Temporal.Instant=="function"&&n instanceof Temporal.Instant)return!0;const t=n;return t[Symbol.toStringTag]==="Temporal.Instant"&&typeof t.Te=="bigint"}function dr(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof S||n instanceof Y||n instanceof G||n instanceof P||n instanceof rt||n instanceof B||fr(n)||nr(n))}function We(n,t,e){if(!dr(e)||!bn(e)){const r=oe(e);throw r==="an object"?t.createError(n+" a custom object"):t.createError(n+" "+r)}}function ot(n,t,e){if((t=C(t))instanceof Pt)return t._internalPath;if(typeof t=="string")return mr(n,t);throw re("Field path arguments must be of type string or ",n,!1,void 0,e)}const ki=new RegExp("[~\\*/\\[\\]]");function mr(n,t,e){if(t.search(ki)>=0)throw re(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,e);try{return new Pt(...t.split("."))._internalPath}catch{throw re(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,e)}}function re(n,t,e,r,i){const s=r&&!r.isEmpty(),u=i!==void 0;let d=`Function ${t}() called with invalid data`;e&&(d+=" (via `toFirestore()`)"),d+=". ";let p="";return(s||u)&&(p+=" (found",s&&(p+=` in field ${r}`),u&&(p+=` in document ${i}`),p+=")"),new E(g.INVALID_ARGUMENT,d+n+p)}function pr(n,t){return n.some(e=>e.isEqual(t))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yt{constructor(t,e,r,i,s){this._firestore=t,this._userDataWriter=e,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new P(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const t=new _r(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(t)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var t;return((t=this._document)==null?void 0:t.data.clone().value.mapValue.fields)??void 0}get(t){if(this._document){const e=this._document.data.field(ot("DocumentSnapshot.get",t));if(e!==null)return this._userDataWriter.convertValue(e)}}}class _r extends yt{data(){return super.data()}}class Pe{constructor(t,e){this._docs=e,this.query=t}get docs(){return[...this._docs]}get size(){return this.docs.length}get empty(){return this.docs.length===0}forEach(t,e){this._docs.forEach(t,e)}}function Oi(n,t){return n=C(n),t=C(t),n instanceof yt&&t instanceof yt?n._firestore===t._firestore&&n._key.isEqual(t._key)&&(n._document===null?t._document===null:n._document.isEqual(t._document))&&n._converter===t._converter:n instanceof Pe&&t instanceof Pe&&or(n.query,t.query)&&De(n.docs,t.docs,Oi)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ke{}class jt extends Ke{}function ns(n,t,...e){let r=[];t instanceof Ke&&r.push(t),r=r.concat(e),function(s){const u=s.filter(p=>p instanceof St).length,d=s.filter(p=>p instanceof Gt).length;if(u>1||u>0&&d>0)throw new E(g.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const i of r)n=i._apply(n);return n}class Gt extends jt{constructor(t,e,r){super(),this._field=t,this._op=e,this._value=r,this.type="where"}static _create(t,e,r){return new Gt(t,e,r)}_apply(t){const e=this._parse(t);return yr(t._query,e),new j(t.firestore,t.converter,ve(t._query,e))}_parse(t){const e=It(t.firestore);return function(s,u,d,p,_,y,I){let T;if(_.isKeyField()){if(y==="array-contains"||y==="array-contains-any")throw new E(g.INVALID_ARGUMENT,`Invalid Query. You can't perform '${y}' queries on documentId().`);if(y==="in"||y==="not-in"){In(I,y);const w=[];for(const V of I)w.push(En(p,s,V));T={arrayValue:{values:w}}}else T=En(p,s,I)}else y!=="in"&&y!=="not-in"&&y!=="array-contains-any"||In(I,y),T=cr(d,u,I,y==="in"||y==="not-in");return $.create(_,y,T)}(t._query,"where",e,t.firestore._databaseId,this._field,this._op,this._value)}}function rs(n,t,e){const r=t,i=ot("where",n);return Gt._create(i,r,e)}class St extends Ke{constructor(t,e){super(),this.type=t,this._queryConstraints=e}static _create(t,e){return new St(t,e)}_parse(t){const e=this._queryConstraints.map(r=>r._parse(t)).filter(r=>r.getFilters().length>0);return e.length===1?e[0]:_t.create(e,this._getOperator())}_apply(t){const e=this._parse(t);return e.getFilters().length===0?t:(function(i,s){let u=i;const d=s.getFlattenedFilters();for(const p of d)yr(u,p),u=ve(u,p)}(t._query,e),new j(t.firestore,t.converter,ve(t._query,e)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}function is(...n){return n.forEach(t=>Er("or",t)),St._create("or",n)}function ss(...n){return n.forEach(t=>Er("and",t)),St._create("and",n)}class Qe extends jt{constructor(t,e){super(),this._field=t,this._direction=e,this.type="orderBy"}static _create(t,e){return new Qe(t,e)}_apply(t){const e=function(i,s,u){if(i.startAt!==null)throw new E(g.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(i.endAt!==null)throw new E(g.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new te(s,u)}(t._query,this._field,this._direction);return new j(t.firestore,t.converter,function(i,s){const u=i.explicitOrderBy.concat([s]);return new Et(i.path,i.collectionGroup,u,i.filters.slice(),i.limit,i.limitType,i.startAt,i.endAt)}(t._query,e))}}function os(n,t="asc"){const e=t,r=ot("orderBy",n);return Qe._create(r,e)}class de extends jt{constructor(t,e,r){super(),this.type=t,this._limit=e,this._limitType=r}static _create(t,e,r){return new de(t,e,r)}_apply(t){return new j(t.firestore,t.converter,function(r,i,s){return new Et(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),i,s,r.startAt,r.endAt)}(t._query,this._limit,this._limitType))}}function as(n){return Dn("limit",n),de._create("limit",n,"F")}function us(n){return Dn("limitToLast",n),de._create("limitToLast",n,"L")}class me extends jt{constructor(t,e,r){super(),this.type=t,this._docOrFields=e,this._inclusive=r}static _create(t,e,r){return new me(t,e,r)}_apply(t){const e=gr(t,this.type,this._docOrFields,this._inclusive);return new j(t.firestore,t.converter,function(i,s){return new Et(i.path,i.collectionGroup,i.explicitOrderBy.slice(),i.filters.slice(),i.limit,i.limitType,s,i.endAt)}(t._query,e))}}function ls(...n){return me._create("startAt",n,!0)}function cs(...n){return me._create("startAfter",n,!1)}class pe extends jt{constructor(t,e,r){super(),this.type=t,this._docOrFields=e,this._inclusive=r}static _create(t,e,r){return new pe(t,e,r)}_apply(t){const e=gr(t,this.type,this._docOrFields,this._inclusive);return new j(t.firestore,t.converter,function(i,s){return new Et(i.path,i.collectionGroup,i.explicitOrderBy.slice(),i.filters.slice(),i.limit,i.limitType,i.startAt,s)}(t._query,e))}}function hs(...n){return pe._create("endBefore",n,!1)}function fs(...n){return pe._create("endAt",n,!0)}function gr(n,t,e,r){if(e[0]=C(e[0]),e[0]instanceof yt)return function(s,u,d,p,_){if(!p)throw new E(g.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${d}().`);const y=[];for(const I of jn(s))if(I.field.isKeyField())y.push(Xt(u,p.key));else{const T=p.data.field(I.field);if(ke(T))throw new E(g.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+I.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(T===null){const N=I.field.canonicalString();throw new E(g.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${N}' (used as the orderBy) does not exist.`)}y.push(T)}return new Zt(y,_)}(n._query,n.firestore._databaseId,t,e[0]._document,r);{const i=It(n.firestore);return function(u,d,p,_,y,I){const T=u.explicitOrderBy;if(y.length>T.length)throw new E(g.INVALID_ARGUMENT,`Too many arguments provided to ${_}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);const N=[];for(let w=0;w<y.length;w++){const V=y[w];if(T[w].field.isKeyField()){if(typeof V!="string")throw new E(g.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${_}(), but got a ${typeof V}`);if(!$n(u)&&V.indexOf("/")!==-1)throw new E(g.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${_}() must be a plain document ID, but '${V}' contains a slash.`);const R=u.path.child(b.fromString(V));if(!D.isDocumentKey(R))throw new E(g.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${_}() must result in a valid document path, but '${R}' is not because it contains an odd number of segments.`);const X=new D(R);N.push(Xt(d,X))}else{const R=cr(p,_,V);N.push(R)}}return new Zt(N,I)}(n._query,n.firestore._databaseId,i,t,e,r)}}function En(n,t,e){if(typeof(e=C(e))=="string"){if(e==="")throw new E(g.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!$n(t)&&e.indexOf("/")!==-1)throw new E(g.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${e}' contains a '/' character.`);const r=t.path.child(b.fromString(e));if(!D.isDocumentKey(r))throw new E(g.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Xt(n,new D(r))}if(e instanceof P)return Xt(n,e._key);throw new E(g.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${oe(e)}.`)}function In(n,t){if(!Array.isArray(n)||n.length===0)throw new E(g.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${t.toString()}' filters.`)}function yr(n,t){const e=function(i,s){for(const u of i)for(const d of u.getFlattenedFilters())if(s.indexOf(d.op)>=0)return d.op;return null}(n.filters,function(i){switch(i){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(t.op));if(e!==null)throw e===t.op?new E(g.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${t.op.toString()}' filter.`):new E(g.INVALID_ARGUMENT,`Invalid query. You cannot use '${t.op.toString()}' filters with '${e.toString()}' filters.`)}function Er(n,t){if(!(t instanceof Gt||t instanceof St))throw new E(g.INVALID_ARGUMENT,`Function ${n}() requires AppliableConstraints created with a call to 'where(...)', 'or(...)', or 'and(...)'.`)}class Ci{convertValue(t,e="none"){switch(pt(t)){case 0:return null;case 1:return t.booleanValue;case 2:return O(t.integerValue||t.doubleValue);case 3:return this.convertTimestamp(t.timestampValue);case 4:return this.convertServerTimestamp(t,e);case 5:return t.stringValue;case 6:return this.convertBytes(Ot(t.bytesValue));case 7:return this.convertReference(t.referenceValue);case 8:return this.convertGeoPoint(t.geoPointValue);case 9:return this.convertArray(t.arrayValue,e);case 11:return this.convertObject(t.mapValue,e);case 10:return this.convertVectorValue(t.mapValue);default:throw v(62114,{value:t})}}convertObject(t,e){return this.convertObjectMap(t.fields,e)}convertObjectMap(t,e="none"){const r={};return Mt(t,(i,s)=>{r[i]=this.convertValue(s,e)}),r}convertVectorValue(t){var r,i,s;const e=(s=(i=(r=t.fields)==null?void 0:r[Jt].arrayValue)==null?void 0:i.values)==null?void 0:s.map(u=>O(u.doubleValue));return new B(e)}convertGeoPoint(t){return new Y(O(t.latitude),O(t.longitude))}convertArray(t,e){return(t.values||[]).map(r=>this.convertValue(r,e))}convertServerTimestamp(t,e){switch(e){case"previous":const r=On(t);return r==null?null:this.convertValue(r,e);case"estimate":return this.convertTimestamp(Ct(t));default:return null}}convertTimestamp(t){const e=mt(t);return new S(e.seconds,e.nanos)}convertDocumentKey(t,e){const r=b.fromString(t);q(er(r),9688,{name:t});const i=new kt(r.get(1),r.get(3)),s=new D(r.popFirst(5));return i.isEqual(e)||se(`A document reference to ${s} refers to a different database (${i.projectId}/${i.database}), which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _e(n,t,e){let r;return r=n?e&&(e.merge||e.mergeFields)?n.toFirestore(t,e):n.toFirestore(t):t,r}class ge extends Ci{constructor(t){super(),this.firestore=t}convertBytes(t){return new G(t)}convertReference(t){const e=this.convertDocumentKey(t,this.firestore._databaseId);return new P(this.firestore,null,e)}}function ds(n){const t=et((n=W(n,P)).firestore),e=new ge(n.firestore);return rr(t,[n._key]).then(r=>{q(r.length===1,15618);const i=r[0];return new yt(n.firestore,e,n._key,i.isFoundDocument()?i:null,n.converter)})}function ms(n){(function(i){if(i.limitType==="L"&&i.explicitOrderBy.length===0)throw new E(g.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")})((n=W(n,j))._query);const t=et(n.firestore),e=new ge(n.firestore);return vi(t,n._query).then(r=>{const i=r.map(s=>new _r(n.firestore,e,s.key,s,n.converter));return n._query.limitType==="L"&&i.reverse(),new Pe(n,i)})}function ps(n,t,e){const r=_e((n=W(n,P)).converter,t,e),i=fe(It(n.firestore),"setDoc",n._key,r,n.converter!==null,e);return Rt(et(n.firestore),[i.toMutation(n._key,x.none())])}function _s(n,t,e,...r){const i=It((n=W(n,P)).firestore);let s;return s=typeof(t=C(t))=="string"||t instanceof Pt?Be(i,"updateDoc",n._key,t,e,r):ze(i,"updateDoc",n._key,t),Rt(et(n.firestore),[s.toMutation(n._key,x.exists(!0))])}function gs(n){return Rt(et((n=W(n,P)).firestore),[new ce(n._key,x.none())])}function ys(n,t){const e=Si(n=W(n,Q)),r=_e(n.converter,t),i=fe(It(n.firestore),"addDoc",e._key,r,e.converter!==null,{});return Rt(et(n.firestore),[i.toMutation(e._key,x.exists(!1))]).then(()=>e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Es(){return new $t("deleteField")}function Is(){return new Ue("serverTimestamp")}function Ts(...n){return new Me("arrayUnion",n)}function As(...n){return new qe("arrayRemove",n)}function ws(n){return new $e("increment",n)}function Vs(n){return new je("minimum",n)}function vs(n){return new Ge("maximum",n)}function Ns(n){return new B(n)}const Tn="4.17.2";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class He{constructor(){this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Li{constructor(t,e,r){this.alias=t,this.aggregateType=e,this.fieldPath=r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ir{constructor(t,e,r=1e3,i=1.5,s=6e4){this.t=t,this.timerId=e,this.i=r,this.o=i,this.h=s,this.u=0,this.l=null,this._=Date.now(),this.reset()}reset(){this.u=0}m(){this.u=this.h}A(t){this.cancel();const e=Math.floor(this.u+this.p()),r=Math.max(0,Date.now()-this._),i=Math.max(0,e-r);i>0&&ft("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.u} ms, delay with jitter: ${e} ms, last attempt: ${r} ms ago)`),this.l=this.t.enqueueAfterDelay(this.timerId,i,()=>(this._=Date.now(),t())),this.u*=this.o,this.u<this.i&&(this.u=this.i),this.u>this.h&&(this.u=this.h)}T(){this.l!==null&&(this.l.skipDelay(),this.l=null)}cancel(){this.l!==null&&(this.l.cancel(),this.l=null)}p(){return(Math.random()-.5)*this.u}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ut{constructor(t="count",e){this._internalFieldPath=e,this.type="AggregateField",this.aggregateType=t}}class xi{constructor(t,e,r){this._userDataWriter=e,this._data=r,this.type="AggregateQuerySnapshot",this.query=t}data(){return this._userDataWriter.convertObjectMap(this._data)}_fieldsProto(){return new M({mapValue:{fields:this._data}}).clone().value.mapValue.fields}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rs(n){return Ui(n,{count:Mi()})}function Ui(n,t){const e=W(n.firestore,nt),r=et(e),i=Yr(t,(s,u)=>new Li(u,s.aggregateType,s._internalFieldPath));return Ni(r,n._query,i).then(s=>function(d,p,_){const y=new ge(d);return new xi(p,y,_)}(e,n,s))}function Ps(n){return new Ut("sum",ot("sum",n))}function Ss(n){return new Ut("avg",ot("average",n))}function Mi(){return new Ut("count")}function bs(n,t){var e,r;return n instanceof Ut&&t instanceof Ut&&n.aggregateType===t.aggregateType&&((e=n._internalFieldPath)==null?void 0:e.canonicalString())===((r=t._internalFieldPath)==null?void 0:r.canonicalString())}function Ds(n,t){return or(n.query,t.query)&&ie(n.data(),t.data())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qi{constructor(t,e){this._firestore=t,this._commitHandler=e,this._mutations=[],this._committed=!1,this._dataReader=It(t)}set(t,e,r){this._verifyNotCommitted();const i=ct(t,this._firestore),s=_e(i.converter,e,r),u=fe(this._dataReader,"WriteBatch.set",i._key,s,i.converter!==null,r);return this._mutations.push(u.toMutation(i._key,x.none())),this}update(t,e,r,...i){this._verifyNotCommitted();const s=ct(t,this._firestore);let u;return u=typeof(e=C(e))=="string"||e instanceof Pt?Be(this._dataReader,"WriteBatch.update",s._key,e,r,i):ze(this._dataReader,"WriteBatch.update",s._key,e),this._mutations.push(u.toMutation(s._key,x.exists(!0))),this}delete(t){this._verifyNotCommitted();const e=ct(t,this._firestore);return this._mutations=this._mutations.concat(new ce(e._key,x.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new E(g.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function ct(n,t){if((n=C(n)).firestore!==t)throw new E(g.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}function Fs(n){n=W(n,nt);const t=et(n);return new qi(n,e=>Rt(t,e))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let $i=class{constructor(t){this.datastore=t,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(t){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new E(g.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const e=await rr(this.datastore,t);return e.forEach(r=>this.recordVersion(r)),e}set(t,e){this.write(e.toMutation(t,this.precondition(t))),this.writtenDocs.add(t.toString())}update(t,e){try{this.write(e.toMutation(t,this.preconditionForUpdate(t)))}catch(r){this.lastTransactionError=r}this.writtenDocs.add(t.toString())}delete(t){this.write(new ce(t,this.precondition(t))),this.writtenDocs.add(t.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const t=this.readVersions;this.mutations.forEach(e=>{t.delete(e.key.toString())}),t.forEach((e,r)=>{const i=D.fromPath(r);this.mutations.push(new Xn(i,this.precondition(i)))}),await Rt(this.datastore,this.mutations),this.committed=!0}recordVersion(t){let e;if(t.isFoundDocument())e=t.version;else{if(!t.isNoDocument())throw v(50498,{R:t.constructor.name});e=F.min()}const r=this.readVersions.get(t.key.toString());if(r){if(!e.isEqual(r))throw new E(g.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(t.key.toString(),e)}precondition(t){const e=this.readVersions.get(t.toString());return!this.writtenDocs.has(t.toString())&&e?e.isEqual(F.min())?x.exists(!1):x.updateTime(e):x.none()}preconditionForUpdate(t){const e=this.readVersions.get(t.toString());if(!this.writtenDocs.has(t.toString())&&e){if(e.isEqual(F.min()))throw new E(g.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return x.updateTime(e)}return x.exists(!0)}write(t){this.ensureCommitNotCalled(),this.mutations.push(t)}ensureCommitNotCalled(){}};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ji={maxAttempts:5};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gi{constructor(t,e,r,i,s){this.asyncQueue=t,this.datastore=e,this.options=r,this.updateFunction=i,this.deferred=s,this.I=r.maxAttempts,this.P=new Ir(this.asyncQueue,"transaction_retry")}V(){this.I-=1,this.D()}D(){this.P.A(async()=>{const t=new $i(this.datastore),e=this.v(t);e&&e.then(r=>{this.asyncQueue.enqueueAndForget(()=>t.commit().then(()=>{this.deferred.resolve(r)}).catch(i=>{this.F(i)}))}).catch(r=>{this.F(r)})})}v(t){try{const e=this.updateFunction(t);return!kn(e)&&e.catch&&e.then?e:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(e){return this.deferred.reject(e),null}}F(t){this.I>0&&this.B(t)?(this.I-=1,this.asyncQueue.enqueueAndForget(()=>(this.D(),Promise.resolve()))):this.deferred.reject(t)}B(t){if((t==null?void 0:t.name)==="FirebaseError"){const e=t.code;return e==="aborted"||e==="failed-precondition"||e==="already-exists"||!Hr(e)}return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Te(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Je{constructor(t,e,r,i,s){this.asyncQueue=t,this.timerId=e,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new He,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(u=>{})}get promise(){return this.deferred.promise}static createAndSchedule(t,e,r,i,s){const u=Date.now()+r,d=new Je(t,e,u,i,s);return d.start(r),d}start(t){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),t)}skipDelay(){return this.handleDelayElapsed()}cancel(t){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new E(g.CANCELLED,"Operation cancelled"+(t?": "+t:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(t=>this.deferred.resolve(t))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const An="AsyncQueue";class zi{constructor(t=Promise.resolve()){this.k=[],this.O=!1,this.S=[],this.q=null,this.C=!1,this.M=!1,this.N=[],this.P=new Ir(this,"async_queue_retry"),this.L=()=>{const r=Te();r&&ft(An,"Visibility state changed to "+r.visibilityState),this.P.T()},this.W=t;const e=Te();e&&typeof e.addEventListener=="function"&&e.addEventListener("visibilitychange",this.L)}get isShuttingDown(){return this.O}enqueueAndForget(t){this.enqueue(t)}enqueueAndForgetEvenWhileRestricted(t){this.U(),this.j(t)}enterRestrictedMode(t){if(!this.O){this.O=!0,this.M=t||!1;const e=Te();e&&typeof e.removeEventListener=="function"&&e.removeEventListener("visibilitychange",this.L)}}enqueue(t){if(this.U(),this.O)return new Promise(()=>{});const e=new He;return this.j(()=>this.O&&this.M?Promise.resolve():(t().then(e.resolve,e.reject),e.promise)).then(()=>e.promise)}enqueueRetryable(t){this.enqueueAndForget(()=>(this.k.push(t),this.$()))}async $(){if(this.k.length!==0){try{await this.k[0](),this.k.shift(),this.P.reset()}catch(t){if(!function(r){return r.name==="IndexedDbTransactionError"}(t))throw t;ft(An,"Operation failed with retryable error: "+t)}this.k.length>0&&this.P.A(()=>this.$())}}j(t){const e=this.W.then(()=>(this.C=!0,t().catch(r=>{this.q=r,this.C=!1;const i=wn(r);throw se("INTERNAL UNHANDLED ERROR: ",i),r}).then(r=>(this.C=!1,r))));return this.W=e,e}enqueueAfterDelay(t,e,r){this.U(),this.N.indexOf(t)>-1&&(e=0);const i=Je.createAndSchedule(this,t,e,r,s=>this.G(s));return this.S.push(i),i}U(){this.q&&v(47125,{H:wn(this.q)})}verifyOperationInProgress(){}async J(){let t;do t=this.W,await t;while(t!==this.W)}K(t){for(const e of this.S)if(e.timerId===t)return!0;return!1}X(t){return this.J().then(()=>{this.S.sort((e,r)=>e.targetTimeMs-r.targetTimeMs);for(const e of this.S)if(e.skipDelay(),t!=="all"&&e.timerId===t)break;return this.J()})}Y(t){this.N.push(t)}G(t){const e=this.S.indexOf(t);this.S.splice(e,1)}}function wn(n){let t=n.message||"";return n.stack&&(t=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bi{constructor(t,e){this._firestore=t,this._transaction=e,this._dataReader=It(t)}get(t){const e=ct(t,this._firestore),r=new ge(this._firestore);return this._transaction.lookup([e._key]).then(i=>{if(!i||i.length!==1)return v(24041);const s=i[0];if(s.isFoundDocument())return new yt(this._firestore,r,s.key,s,e.converter);if(s.isNoDocument())return new yt(this._firestore,r,e._key,null,e.converter);throw v(18433,{doc:s})})}set(t,e,r){const i=ct(t,this._firestore),s=_e(i.converter,e,r),u=fe(this._dataReader,"Transaction.set",i._key,s,i.converter!==null,r);return this._transaction.set(i._key,u),this}update(t,e,r,...i){const s=ct(t,this._firestore);let u;return u=typeof(e=C(e))=="string"||e instanceof Pt?Be(this._dataReader,"Transaction.update",s._key,e,r,i):ze(this._dataReader,"Transaction.update",s._key,e),this._transaction.update(s._key,u),this}delete(t){const e=ct(t,this._firestore);return this._transaction.delete(e._key),this}}function Os(n,t,e){n=W(n,nt);const r=et(n),i={...ji,...e};(function(d){if(d.maxAttempts<1)throw new E(g.INVALID_ARGUMENT,"Max attempts must be at least 1")})(i);const s=new He;return new Gi(function(){return new zi}(),r,i,u=>t(new Bi(n,u)),s).V(),s.promise}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(function(){Fr(`${Dr}_lite`),Sr(new br("firestore/lite",(t,{instanceIdentifier:e,options:r})=>{const i=t.getProvider("app").getImmediate(),s=new nt(new Cr(t.getProvider("auth-internal")),new Ur(i,t.getProvider("app-check-internal")),qr(i,e),i);return r&&s._setSettings(r),s},"PUBLIC").setMultipleInstances(!0)),Xe("firestore-lite",Tn,""),Xe("firestore-lite",Tn,"esm2020")})();export{Ut as AggregateField,xi as AggregateQuerySnapshot,G as Bytes,Q as CollectionReference,P as DocumentReference,yt as DocumentSnapshot,Pt as FieldPath,rt as FieldValue,nt as Firestore,E as FirestoreError,Y as GeoPoint,j as Query,St as QueryCompositeFilterConstraint,jt as QueryConstraint,_r as QueryDocumentSnapshot,pe as QueryEndAtConstraint,Gt as QueryFieldFilterConstraint,de as QueryLimitConstraint,Qe as QueryOrderByConstraint,Pe as QuerySnapshot,me as QueryStartAtConstraint,S as Timestamp,Bi as Transaction,B as VectorValue,qi as WriteBatch,ys as addDoc,bs as aggregateFieldEqual,Ds as aggregateQuerySnapshotEqual,ss as and,As as arrayRemove,Ts as arrayUnion,Ss as average,Xi as collection,Zi as collectionGroup,Pi as connectFirestoreEmulator,Mi as count,gs as deleteDoc,Es as deleteField,Si as doc,es as documentId,fs as endAt,hs as endBefore,Ui as getAggregate,Rs as getCount,ds as getDoc,ms as getDocs,Ji as getFirestore,ws as increment,Hi as initializeFirestore,as as limit,us as limitToLast,vs as maximum,Vs as minimum,is as or,os as orderBy,ns as query,or as queryEqual,ts as refEqual,Os as runTransaction,Is as serverTimestamp,ps as setDoc,Ki as setLogLevel,Oi as snapshotEqual,cs as startAfter,ls as startAt,Ps as sum,Yi as terminate,_s as updateDoc,Ns as vector,rs as where,Fs as writeBatch};
