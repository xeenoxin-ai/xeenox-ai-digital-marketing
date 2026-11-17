import{F as lr,t as N,u as dn,v as cr,w as Qt,x as hr,n as dr,e as fn,y as fr,L as mr,k as pr,z as Ee,g as _r,j as gr,C as yr,r as $e,S as Er}from"./index.esm-CtpscmOZ.js";import{I as Ir}from"./bloom_blob_es2018-BgEMCAT0.js";/**
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
 */class b{constructor(t){this.uid=t}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(t){return t.uid===this.uid}}b.UNAUTHENTICATED=new b(null),b.GOOGLE_CREDENTIALS=new b("google-credentials-uid"),b.FIRST_PARTY=new b("first-party-uid"),b.MOCK_USER=new b("mock-user");/**
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
 */let dt="12.19.0";function Tr(n){dt=n}/**
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
 */const X=new mr("@firebase/firestore");function Ui(n){X.setLogLevel(n)}function Z(n,...t){if(X.logLevel<=Ee.DEBUG){const e=t.map(Ie);X.debug(`Firestore (${dt}): ${n}`,...e)}}function Ht(n,...t){if(X.logLevel<=Ee.ERROR){const e=t.map(Ie);X.error(`Firestore (${dt}): ${n}`,...e)}}function mn(n,...t){if(X.logLevel<=Ee.WARN){const e=t.map(Ie);X.warn(`Firestore (${dt}): ${n}`,...e)}}function Ie(n){if(typeof n=="string")return n;try{return function(e){return JSON.stringify(e)}(n)}catch{return n}}/**
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
 */function _(n,t,e){let r="Unexpected state";typeof t=="string"?r=t:e=t,pn(n,r,e)}function pn(n,t,e){let r=`FIRESTORE (${dt}) INTERNAL ASSERTION FAILED: ${t} (ID: ${n.toString(16)})`;if(e!==void 0)try{r+=" CONTEXT: "+JSON.stringify(e)}catch{r+=" CONTEXT: "+e}throw Ht(r),new Error(r)}function F(n,t,e,r){let i="Unexpected state";typeof e=="string"?i=e:r=e,n||pn(t,i,r)}function tt(n,t){return n}/**
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
 */const l={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class d extends lr{constructor(t,e){super(t,e),this.code=t,this.message=e,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */class _n{constructor(t,e){this.user=e,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${t}`)}}class Ar{getToken(){return Promise.resolve(null)}invalidateToken(){}start(t,e){t.enqueueRetryable(()=>e(b.UNAUTHENTICATED))}shutdown(){}}class wr{constructor(t){this.token=t,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(t,e){this.changeListener=e,t.enqueueRetryable(()=>e(this.token.user))}shutdown(){this.changeListener=null}}class Vr{constructor(t){this.auth=null,t.onInit(e=>{this.auth=e})}getToken(){return this.auth?this.auth.getToken().then(t=>t?(F(typeof t.accessToken=="string",42297,{Z:t}),new _n(t.accessToken,new b(this.auth.getUid()))):null):Promise.resolve(null)}invalidateToken(){}start(t,e){}shutdown(){}}class vr{constructor(t,e,r){this.ee=t,this.te=e,this.re=r,this.type="FirstParty",this.user=b.FIRST_PARTY,this.ne=new Map}ie(){return this.re?this.re():null}get headers(){this.ne.set("X-Goog-AuthUser",this.ee);const t=this.ie();return t&&this.ne.set("Authorization",t),this.te&&this.ne.set("X-Goog-Iam-Authorization-Token",this.te),this.ne}}class Nr{constructor(t,e,r){this.ee=t,this.te=e,this.re=r}getToken(){return Promise.resolve(new vr(this.ee,this.te,this.re))}start(t,e){t.enqueueRetryable(()=>e(b.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Ge{constructor(t){this.value=t,this.type="AppCheck",this.headers=new Map,t&&t.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Rr{constructor(t,e){this.se=e,this.appCheck=null,this.oe=null,_r(t)&&t.settings.appCheckToken&&(this.oe=t.settings.appCheckToken),e.onInit(r=>{this.appCheck=r})}getToken(){return this.oe?Promise.resolve(new Ge(this.oe)):this.appCheck?this.appCheck.getToken().then(t=>t?(F(typeof t.token=="string",3470,{tokenResult:t}),new Ge(t.token)):null):Promise.resolve(null)}invalidateToken(){}start(t,e){}shutdown(){}}/**
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
 */class Pr{constructor(t,e,r,i,s,o,a,u,c,h,f,m,g){this.databaseId=t,this.appId=e,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=o,this.autoDetectLongPolling=a,this.longPollingOptions=u,this.useFetchStreams=c,this.isUsingEmulator=h,this.apiKey=f,this._customHeaders=m,this.grpcFlowControlWindow=g}}const xt="(default)";class It{constructor(t,e){this.projectId=t,this.database=e||xt}static empty(){return new It("","")}get isDefaultDatabase(){return this.database===xt}isEqual(t){return t instanceof It&&t.projectId===this.projectId&&t.database===this.database}}function Sr(n,t){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new d(l.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new It(n.options.projectId,t)}/**
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
 */function br(n){const t=typeof self<"u"&&(self.crypto||self.msCrypto),e=new Uint8Array(n);if(t&&typeof t.getRandomValues=="function")t.getRandomValues(e);else for(let r=0;r<n;r++)e[r]=Math.floor(256*Math.random());return e}/**
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
 */class Dr{static newId(){const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",e=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const i=br(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<e&&(r+=t.charAt(i[s]%62))}return r}}function w(n,t){return n<t?-1:n>t?1:0}function de(n,t){const e=Math.min(n.length,t.length);for(let r=0;r<e;r++){const i=n.charAt(r),s=t.charAt(r);if(i!==s)return ue(i)===ue(s)?w(i,s):ue(i)?1:-1}return w(n.length,t.length)}const Fr=55296,kr=57343;function ue(n){const t=n.charCodeAt(0);return t>=Fr&&t<=kr}function Te(n,t,e){return n.length===t.length&&n.every((r,i)=>e(r,t[i]))}/**
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
 */const fe="__name__";class ${constructor(t,e,r){e===void 0?e=0:e>t.length&&_(637,{offset:e,range:t.length}),r===void 0?r=t.length-e:r>t.length-e&&_(1746,{length:r,range:t.length-e}),this.segments=t,this.offset=e,this.len=r}get length(){return this.len}isEqual(t){return $.comparator(this,t)===0}child(t){const e=this.segments.slice(this.offset,this.limit());return t instanceof $?t.forEach(r=>{e.push(r)}):e.push(t),this.construct(e)}limit(){return this.offset+this.length}popFirst(t){return t=t===void 0?1:t,this.construct(this.segments,this.offset+t,this.length-t)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(t){return this.segments[this.offset+t]}isEmpty(){return this.length===0}isPrefixOf(t){if(t.length<this.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}isImmediateParentOf(t){if(this.length+1!==t.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}forEach(t){for(let e=this.offset,r=this.limit();e<r;e++)t(this.segments[e])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(t,e){const r=Math.min(t.length,e.length);for(let i=0;i<r;i++){const s=$.compareSegments(t.get(i),e.get(i));if(s!==0)return s}return w(t.length,e.length)}static compareSegments(t,e){const r=$.isNumericId(t),i=$.isNumericId(e);return r&&!i?-1:!r&&i?1:r&&i?$.extractNumericId(t).compare($.extractNumericId(e)):de(t,e)}static isNumericId(t){return t.startsWith("__id")&&t.endsWith("__")}static extractNumericId(t){return Ir.fromString(t.substring(4,t.length-2))}}class I extends ${construct(t,e,r){return new I(t,e,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...t){const e=[];for(const r of t){if(r.indexOf("//")>=0)throw new d(l.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);e.push(...r.split("/").filter(i=>i.length>0))}return new I(e)}static emptyPath(){return new I([])}}const Or=/^[_a-zA-Z][_a-zA-Z0-9]*$/;let H=class ct extends ${construct(t,e,r){return new ct(t,e,r)}static isValidIdentifier(t){return Or.test(t)}canonicalString(){return this.toArray().map(t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),ct.isValidIdentifier(t)||(t="`"+t+"`"),t)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===fe}static keyField(){return new ct([fe])}static fromServerFormat(t){const e=[];let r="",i=0;const s=()=>{if(r.length===0)throw new d(l.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);e.push(r),r=""};let o=!1;for(;i<t.length;){const a=t[i];if(a==="\\"){if(i+1===t.length)throw new d(l.INVALID_ARGUMENT,"Path has trailing escape character: "+t);const u=t[i+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new d(l.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);r+=u,i+=2}else a==="`"?(o=!o,i++):a!=="."||o?(r+=a,i++):(s(),i++)}if(s(),o)throw new d(l.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new ct(e)}static emptyPath(){return new ct([])}};/**
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
 */class T{constructor(t){this.path=t}static fromPath(t){return new T(I.fromString(t))}static fromName(t){return new T(I.fromString(t).popFirst(5))}static empty(){return new T(I.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(t){return this.path.length>=2&&this.path.get(this.path.length-2)===t}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(t){return t!==null&&I.comparator(this.path,t.path)===0}toString(){return this.path.toString()}static comparator(t,e){return I.comparator(t.path,e.path)}static isDocumentKey(t){return t.length%2==0}static fromSegments(t){return new T(new I(t.slice()))}}/**
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
 */function Ae(n,t,e){if(!e)throw new d(l.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${t}.`)}function je(n){if(!T.isDocumentKey(n))throw new d(l.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function Be(n){if(T.isDocumentKey(n))throw new d(l.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function gn(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function Jt(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const t=function(r){return r.constructor?r.constructor.name:null}(n);return t?`a custom ${t} object`:"an object"}}return typeof n=="function"?"a function":_(12329,{type:typeof n})}function x(n,t){if("_delegate"in n&&(n=n._delegate),!(n instanceof t)){if(t.name===n.constructor.name)throw new d(l.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const e=Jt(n);throw new d(l.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${e}`)}}return n}function yn(n,t){if(t<=0)throw new d(l.INVALID_ARGUMENT,`Function ${n}() requires a positive number, but it was: ${t}.`)}/**
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
 */function En(n){const t={};return n.timeoutSeconds!==void 0&&(t.timeoutSeconds=n.timeoutSeconds),t}/**
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
 */let Ot=null;function Cr(){return Ot===null?Ot=function(){return 268435456+Math.round(2147483648*Math.random())}():Ot++,"0x"+Ot.toString(16)}/**
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
 */function In(n){return n==null}function Mt(n){return n===0&&1/n==-1/0}/**
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
 */const le="RestConnection",Lr={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class Ur{get ae(){return!1}constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const e=t.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.ue=e+"://"+t.host,this._e=`projects/${r}/databases/${i}`,this.ce=this.databaseId.database===xt?`project_id=${r}`:`project_id=${r}&database_id=${i}`}le(t,e,r,i,s){const o=Cr(),a=this.he(t,e.toUriEncodedString());Z(le,`Sending RPC '${t}' ${o}:`,a,r);const u={"google-cloud-resource-prefix":this._e,"x-goog-request-params":this.ce};this.fe(u,i,s);const{host:c}=new URL(a),h=dn(c);return this.me(t,a,u,r,h).then(f=>(Z(le,`Received RPC '${t}' ${o}: `,f),f),f=>{throw mn(le,`RPC '${t}' ${o} failed with error: `,f,"url: ",a,"request:",r),f})}de(t,e,r,i,s,o){return this.le(t,e,r,i,s)}fe(t,e,r){if(t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+dt}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),e&&e.headers.forEach((i,s)=>t[s]=i),r&&r.headers.forEach((i,s)=>t[s]=i),this.databaseInfo._customHeaders)for(const i of Object.keys(this.databaseInfo._customHeaders))t[i]=this.databaseInfo._customHeaders[i]}he(t,e){const r=Lr[t];let i=`${this.ue}/v1/${e}:${r}`;return this.databaseInfo.apiKey&&(i=`${i}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),i}terminate(){}}/**
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
 */var ze,p;function xr(n){switch(n){case l.OK:return _(64938);case l.CANCELLED:case l.UNKNOWN:case l.DEADLINE_EXCEEDED:case l.RESOURCE_EXHAUSTED:case l.INTERNAL:case l.UNAVAILABLE:case l.UNAUTHENTICATED:return!1;case l.INVALID_ARGUMENT:case l.NOT_FOUND:case l.ALREADY_EXISTS:case l.PERMISSION_DENIED:case l.FAILED_PRECONDITION:case l.ABORTED:case l.OUT_OF_RANGE:case l.UNIMPLEMENTED:case l.DATA_LOSS:return!0;default:return _(15467,{code:n})}}function We(n){if(n===void 0)return Ht("RPC_ERROR","HTTP error has no status"),l.UNKNOWN;switch(n){case 200:return l.OK;case 400:return l.FAILED_PRECONDITION;case 401:return l.UNAUTHENTICATED;case 403:return l.PERMISSION_DENIED;case 404:return l.NOT_FOUND;case 409:return l.ABORTED;case 416:return l.OUT_OF_RANGE;case 429:return l.RESOURCE_EXHAUSTED;case 499:return l.CANCELLED;case 500:return l.UNKNOWN;case 501:return l.UNIMPLEMENTED;case 503:return l.UNAVAILABLE;case 504:return l.DEADLINE_EXCEEDED;default:return n>=200&&n<300?l.OK:n>=400&&n<500?l.FAILED_PRECONDITION:n>=500&&n<600?l.INTERNAL:l.UNKNOWN}}/**
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
 */(p=ze||(ze={}))[p.OK=0]="OK",p[p.CANCELLED=1]="CANCELLED",p[p.UNKNOWN=2]="UNKNOWN",p[p.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",p[p.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",p[p.NOT_FOUND=5]="NOT_FOUND",p[p.ALREADY_EXISTS=6]="ALREADY_EXISTS",p[p.PERMISSION_DENIED=7]="PERMISSION_DENIED",p[p.UNAUTHENTICATED=16]="UNAUTHENTICATED",p[p.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",p[p.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",p[p.ABORTED=10]="ABORTED",p[p.OUT_OF_RANGE=11]="OUT_OF_RANGE",p[p.UNIMPLEMENTED=12]="UNIMPLEMENTED",p[p.INTERNAL=13]="INTERNAL",p[p.UNAVAILABLE=14]="UNAVAILABLE",p[p.DATA_LOSS=15]="DATA_LOSS";class Mr extends Ur{Ee(t,e){throw new Error("Not supported by FetchConnection")}async me(t,e,r,i,s){var u;const o=JSON.stringify(i);let a;try{const c={method:"POST",headers:r,body:o};s&&(c.credentials="include"),a=await fetch(e,c)}catch(c){const h=c,f=h==null?void 0:h.message,m=h!=null&&h.cause?String(h.cause):void 0,g=(f&&m?`${f} (${m})`:f??m)??(h==null?void 0:h.statusText)??String(c);throw new d(We(h==null?void 0:h.status),`Request failed with error: ${g}`)}if(!a.ok){let c=await a.json();Array.isArray(c)&&(c=c[0]);const h=(u=c==null?void 0:c.error)==null?void 0:u.message;throw new d(We(a.status),`Request failed with error: ${h??a.statusText}`)}return a.json()}}/**
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
 */function Ke(n){let t=0;for(const e in n)Object.prototype.hasOwnProperty.call(n,e)&&t++;return t}function Nt(n,t){for(const e in n)Object.prototype.hasOwnProperty.call(n,e)&&t(e,n[e])}function qr(n,t){const e=[];for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.push(t(n[r],r,n));return e}/**
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
 */class $r extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */class B{constructor(t){this.binaryString=t}static fromBase64String(t){const e=function(i){try{return atob(i)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new $r("Invalid base64 string: "+s):s}}(t);return new B(e)}static fromUint8Array(t){const e=function(i){let s="";for(let o=0;o<i.length;++o)s+=String.fromCharCode(i[o]);return s}(t);return new B(e)}[Symbol.iterator](){let t=0;return{next:()=>t<this.binaryString.length?{value:this.binaryString.charCodeAt(t++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(e){return btoa(e)}(this.binaryString)}toUint8Array(){return function(e){const r=new Uint8Array(e.length);for(let i=0;i<e.length;i++)r[i]=e.charCodeAt(i);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(t){return w(this.binaryString,t.binaryString)}isEqual(t){return this.binaryString===t.binaryString}}B.EMPTY_BYTE_STRING=new B("");const Gr=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function et(n){if(F(!!n,39018),typeof n=="string"){let t=0;const e=Gr.exec(n);if(F(!!e,46558,{timestamp:n}),e[1]){let i=e[1];i=(i+"000000000").substr(0,9),t=Number(i)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:t}}return{seconds:V(n.seconds),nanos:V(n.nanos)}}function V(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Tt(n){return typeof n=="string"?B.fromBase64String(n):B.fromUint8Array(n)}/**
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
 */function L(n,t){const e={typeString:n};return t&&(e.value=t),e}function Rt(n,t){if(!gn(n))throw new d(l.INVALID_ARGUMENT,"JSON must be an object");let e;for(const r in t)if(t[r]){const i=t[r].typeString,s="value"in t[r]?{value:t[r].value}:void 0;if(!(r in n)){e=`JSON missing required field: '${r}'`;break}const o=n[r];if(i&&typeof o!==i){e=`JSON field '${r}' must be a ${i}.`;break}if(s!==void 0&&o!==s.value){e=`Expected '${r}' field to equal '${s.value}'`;break}}if(e)throw new d(l.INVALID_ARGUMENT,e);return!0}/**
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
 */const Qe=-62135596800,He=1e6;class E{static now(){return E.fromMillis(Date.now())}static fromDate(t){return E.fromMillis(t.getTime())}static fromMillis(t){const e=Math.floor(t/1e3),r=Math.floor((t-1e3*e)*He);return new E(e,r)}static fromInstant(t){if(!t||typeof t.Te!="bigint")throw new d(l.INVALID_ARGUMENT,"Invalid Temporal.Instant object provided.");return E._fromEpochNanoseconds(t.Te)}static _fromEpochNanoseconds(t){let e,r;if(t>=0n)e=Number(t/1000000000n),r=Number(t%1000000000n);else{const i=t%1000000000n;i===0n?(e=Number(t/1000000000n),r=0):(e=Number(t/1000000000n-1n),r=Number(i+1000000000n))}return new E(e,r)}constructor(t,e){if(this.seconds=t,this.nanoseconds=e,e<0)throw new d(l.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(e>=1e9)throw new d(l.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(t<Qe)throw new d(l.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t);if(t>=253402300800)throw new d(l.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/He}toInstant(){if(typeof Temporal>"u"||!Temporal.Instant)throw new d(l.FAILED_PRECONDITION,"The Temporal object is not available in the current environment.");const t=1000000000n*BigInt(this.seconds)+BigInt(this.nanoseconds);return Temporal.Instant.__PRIVATE_fromEpochNanoseconds(t)}_compareTo(t){return this.seconds===t.seconds?w(this.nanoseconds,t.nanoseconds):w(this.seconds,t.seconds)}isEqual(t){return t.seconds===this.seconds&&t.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:E._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(t){if(Rt(t,E._jsonSchema))return new E(t.seconds,t.nanoseconds)}valueOf(){const t=this.seconds-Qe;return String(t).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}E._jsonSchemaVersion="firestore/timestamp/1.0",E._jsonSchema={type:L("string",E._jsonSchemaVersion),seconds:L("number"),nanoseconds:L("number")};function we(n){var e,r;return((r=(((e=n==null?void 0:n.mapValue)==null?void 0:e.fields)||{}).__type__)==null?void 0:r.stringValue)==="server_timestamp"}function Tn(n){const t=n.mapValue.fields.__previous_value__;return we(t)?Tn(t):t}function At(n){const t=et(n.mapValue.fields.__local_write_time__.timestampValue);return new E(t.seconds,t.nanos)}/**
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
 */const An="__type__",jr="__max__",Ct={},wn="__vector__",qt="value";function nt(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?we(n)?4:function(e){return(((e.mapValue||{}).fields||{}).__type__||{}).stringValue===jr}(n)?9007199254740991:function(e){var i,s;return((s=(((i=e==null?void 0:e.mapValue)==null?void 0:i.fields)||{})[An])==null?void 0:s.stringValue)===wn}(n)?10:11:_(28295,{value:n})}function ht(n,t,e){if(n===t)return!0;const r=nt(n);if(r!==nt(t))return!1;switch(r){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===t.booleanValue;case 4:return At(n).isEqual(At(t));case 3:return function(s,o){if(typeof s.timestampValue=="string"&&typeof o.timestampValue=="string"&&s.timestampValue.length===o.timestampValue.length)return s.timestampValue===o.timestampValue;const a=et(s.timestampValue),u=et(o.timestampValue);return a.seconds===u.seconds&&a.nanos===u.nanos}(n,t);case 5:return n.stringValue===t.stringValue;case 6:return function(s,o){return Tt(s.bytesValue).isEqual(Tt(o.bytesValue))}(n,t);case 7:return n.referenceValue===t.referenceValue;case 8:return function(s,o){return V(s.geoPointValue.latitude)===V(o.geoPointValue.latitude)&&V(s.geoPointValue.longitude)===V(o.geoPointValue.longitude)}(n,t);case 2:return function(s,o,a){if("integerValue"in s&&"integerValue"in o)return V(s.integerValue)===V(o.integerValue);let u,c;return!("doubleValue"in s)||!("doubleValue"in o)?!1:(u=V(s.doubleValue),c=V(o.doubleValue),u===c?Mt(u)===Mt(c):!!(a===void 0||a.Pe)&&isNaN(u)&&isNaN(c))}(n,t,e);case 9:return Te(n.arrayValue.values||[],t.arrayValue.values||[],(i,s)=>ht(i,s,e));case 10:case 11:return function(s,o,a){const u=s.mapValue.fields||{},c=o.mapValue.fields||{};if(Ke(u)!==Ke(c))return!1;for(const h in u)if(u.hasOwnProperty(h)&&(c[h]===void 0||!ht(u[h],c[h],a)))return!1;return!0}(n,t,e);default:return _(52216,{left:n})}}function wt(n,t){return(n.values||[]).find(e=>ht(e,t))!==void 0}function $t(n,t){if(n===t)return 0;const e=nt(n),r=nt(t);if(e!==r)return w(e,r);switch(e){case 0:case 9007199254740991:return 0;case 1:return w(n.booleanValue,t.booleanValue);case 2:return function(s,o){const a=V(s.integerValue||s.doubleValue),u=V(o.integerValue||o.doubleValue);return a<u?-1:a>u?1:a===u?0:isNaN(a)?isNaN(u)?0:-1:1}(n,t);case 3:return Je(n.timestampValue,t.timestampValue);case 4:return Je(At(n),At(t));case 5:return de(n.stringValue,t.stringValue);case 6:return function(s,o){const a=Tt(s),u=Tt(o);return a.compareTo(u)}(n.bytesValue,t.bytesValue);case 7:return function(s,o){const a=s.split("/"),u=o.split("/");for(let c=0;c<a.length&&c<u.length;c++){const h=w(a[c],u[c]);if(h!==0)return h}return w(a.length,u.length)}(n.referenceValue,t.referenceValue);case 8:return function(s,o){const a=w(V(s.latitude),V(o.latitude));return a!==0?a:w(V(s.longitude),V(o.longitude))}(n.geoPointValue,t.geoPointValue);case 9:return Ye(n.arrayValue,t.arrayValue);case 10:return function(s,o){var m,g,v,P;const a=s.fields||{},u=o.fields||{},c=(m=a[qt])==null?void 0:m.arrayValue,h=(g=u[qt])==null?void 0:g.arrayValue,f=w(((v=c==null?void 0:c.values)==null?void 0:v.length)||0,((P=h==null?void 0:h.values)==null?void 0:P.length)||0);return f!==0?f:Ye(c,h)}(n.mapValue,t.mapValue);case 11:return function(s,o){if(s===Ct&&o===Ct)return 0;if(s===Ct)return 1;if(o===Ct)return-1;const a=s.fields||{},u=Object.keys(a),c=o.fields||{},h=Object.keys(c);u.sort(),h.sort();for(let f=0;f<u.length&&f<h.length;++f){const m=de(u[f],h[f]);if(m!==0)return m;const g=$t(a[u[f]],c[h[f]]);if(g!==0)return g}return w(u.length,h.length)}(n.mapValue,t.mapValue);default:throw _(23264,{Re:e})}}function Je(n,t){if(typeof n=="string"&&typeof t=="string"&&n.length===t.length)return w(n,t);const e=et(n),r=et(t),i=w(e.seconds,r.seconds);return i!==0?i:w(e.nanos,r.nanos)}function Ye(n,t){const e=n.values||[],r=t.values||[];for(let i=0;i<e.length&&i<r.length;++i){const s=$t(e[i],r[i]);if(s!==void 0&&s!==0)return s}return w(e.length,r.length)}function Gt(n,t){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${t.path.canonicalString()}`}}function Vn(n){return!!n&&"arrayValue"in n}function Xe(n){return!!n&&"nullValue"in n}function Ze(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function ce(n){return!!n&&"mapValue"in n}function gt(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const t={mapValue:{fields:{}}};return Nt(n.mapValue.fields,(e,r)=>t.mapValue.fields[e]=gt(r)),t}if(n.arrayValue){const t={arrayValue:{values:[]}};for(let e=0;e<(n.arrayValue.values||[]).length;++e)t.arrayValue.values[e]=gt(n.arrayValue.values[e]);return t}return{...n}}class jt{constructor(t,e){this.position=t,this.inclusive=e}}function tn(n,t){if(n===null)return t===null;if(t===null||n.inclusive!==t.inclusive||n.position.length!==t.position.length)return!1;for(let e=0;e<n.position.length;e++)if(!ht(n.position[e],t.position[e]))return!1;return!0}/**
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
 */class vn{}class k extends vn{constructor(t,e,r){super(),this.field=t,this.op=e,this.value=r}static create(t,e,r){return t.isKeyField()?e==="in"||e==="not-in"?this.createKeyFieldInFilter(t,e,r):new Br(t,e,r):e==="array-contains"?new Kr(t,r):e==="in"?new Qr(t,r):e==="not-in"?new Hr(t,r):e==="array-contains-any"?new Jr(t,r):new k(t,e,r)}static createKeyFieldInFilter(t,e,r){return e==="in"?new zr(t,r):new Wr(t,r)}matches(t){const e=t.data.field(this.field);return this.op==="!="?e!==null&&e.nullValue===void 0&&this.matchesComparison($t(e,this.value)):e!==null&&nt(this.value)===nt(e)&&this.matchesComparison($t(e,this.value))}matchesComparison(t){switch(this.op){case"<":return t<0;case"<=":return t<=0;case"==":return t===0;case"!=":return t!==0;case">":return t>0;case">=":return t>=0;default:return _(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class rt extends vn{constructor(t,e){super(),this.filters=t,this.op=e,this.Ae=null}static create(t,e){return new rt(t,e)}matches(t){return function(r){return r.op==="and"}(this)?this.filters.find(e=>!e.matches(t))===void 0:this.filters.find(e=>e.matches(t))!==void 0}getFlattenedFilters(){return this.Ae!==null||(this.Ae=this.filters.reduce((t,e)=>t.concat(e.getFlattenedFilters()),[])),this.Ae}getFilters(){return Object.assign([],this.filters)}}function Nn(n,t){return n instanceof k?function(r,i){return i instanceof k&&r.op===i.op&&r.field.isEqual(i.field)&&ht(r.value,i.value)}(n,t):n instanceof rt?function(r,i){return i instanceof rt&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce((s,o,a)=>s&&Nn(o,i.filters[a]),!0):!1}(n,t):void _(19439)}class Br extends k{constructor(t,e,r){super(t,e,r),this.key=T.fromName(r.referenceValue)}matches(t){const e=T.comparator(t.key,this.key);return this.matchesComparison(e)}}class zr extends k{constructor(t,e){super(t,"in",e),this.keys=Rn("in",e)}matches(t){return this.keys.some(e=>e.isEqual(t.key))}}class Wr extends k{constructor(t,e){super(t,"not-in",e),this.keys=Rn("not-in",e)}matches(t){return!this.keys.some(e=>e.isEqual(t.key))}}function Rn(n,t){var e;return(((e=t.arrayValue)==null?void 0:e.values)||[]).map(r=>T.fromName(r.referenceValue))}class Kr extends k{constructor(t,e){super(t,"array-contains",e)}matches(t){const e=t.data.field(this.field);return Vn(e)&&wt(e.arrayValue,this.value)}}class Qr extends k{constructor(t,e){super(t,"in",e)}matches(t){const e=t.data.field(this.field);return e!==null&&wt(this.value.arrayValue,e)}}class Hr extends k{constructor(t,e){super(t,"not-in",e)}matches(t){if(wt(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const e=t.data.field(this.field);return e!==null&&e.nullValue===void 0&&!wt(this.value.arrayValue,e)}}class Jr extends k{constructor(t,e){super(t,"array-contains-any",e)}matches(t){const e=t.data.field(this.field);return!(!Vn(e)||!e.arrayValue.values)&&e.arrayValue.values.some(r=>wt(this.value.arrayValue,r))}}/**
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
 */class Bt{constructor(t,e="asc"){this.field=t,this.dir=e}}function Yr(n,t){return n.dir===t.dir&&n.field.isEqual(t.field)}/**
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
 */class A{static fromTimestamp(t){return new A(t)}static min(){return new A(new E(0,0))}static max(){return new A(new E(253402300799,999999999))}constructor(t){this.timestamp=t}compareTo(t){return this.timestamp._compareTo(t.timestamp)}isEqual(t){return this.timestamp.isEqual(t.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
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
 */class zt{constructor(t,e){this.comparator=t,this.root=e||R.EMPTY}insert(t,e){return new zt(this.comparator,this.root.insert(t,e,this.comparator).copy(null,null,R.BLACK,null,null))}remove(t){return new zt(this.comparator,this.root.remove(t,this.comparator).copy(null,null,R.BLACK,null,null))}get(t){let e=this.root;for(;!e.isEmpty();){const r=this.comparator(t,e.key);if(r===0)return e.value;r<0?e=e.left:r>0&&(e=e.right)}return null}indexOf(t){let e=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(t,r.key);if(i===0)return e+r.left.size;i<0?r=r.left:(e+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(t){return this.root.inorderTraversal(t)}forEach(t){this.inorderTraversal((e,r)=>(t(e,r),!1))}toString(){const t=[];return this.inorderTraversal((e,r)=>(t.push(`${e}:${r}`),!1)),`{${t.join(", ")}}`}reverseTraversal(t){return this.root.reverseTraversal(t)}getIterator(){return new Lt(this.root,null,this.comparator,!1)}getIteratorFrom(t){return new Lt(this.root,t,this.comparator,!1)}getReverseIterator(){return new Lt(this.root,null,this.comparator,!0)}getReverseIteratorFrom(t){return new Lt(this.root,t,this.comparator,!0)}}class Lt{constructor(t,e,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!t.isEmpty();)if(s=e?r(t.key,e):1,e&&i&&(s*=-1),s<0)t=this.isReverse?t.left:t.right;else{if(s===0){this.nodeStack.push(t);break}this.nodeStack.push(t),t=this.isReverse?t.right:t.left}}getNext(){let t=this.nodeStack.pop();const e={key:t.key,value:t.value};if(this.isReverse)for(t=t.left;!t.isEmpty();)this.nodeStack.push(t),t=t.right;else for(t=t.right;!t.isEmpty();)this.nodeStack.push(t),t=t.left;return e}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const t=this.nodeStack[this.nodeStack.length-1];return{key:t.key,value:t.value}}}class R{constructor(t,e,r,i,s){this.key=t,this.value=e,this.color=r??R.RED,this.left=i??R.EMPTY,this.right=s??R.EMPTY,this.size=this.left.size+1+this.right.size}copy(t,e,r,i,s){return new R(t??this.key,e??this.value,r??this.color,i??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(t){return this.left.inorderTraversal(t)||t(this.key,this.value)||this.right.inorderTraversal(t)}reverseTraversal(t){return this.right.reverseTraversal(t)||t(this.key,this.value)||this.left.reverseTraversal(t)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(t,e,r){let i=this;const s=r(t,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(t,e,r),null):s===0?i.copy(null,e,null,null,null):i.copy(null,null,null,null,i.right.insert(t,e,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return R.EMPTY;let t=this;return t.left.isRed()||t.left.left.isRed()||(t=t.moveRedLeft()),t=t.copy(null,null,null,t.left.removeMin(),null),t.fixUp()}remove(t,e){let r,i=this;if(e(t,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(t,e),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),e(t,i.key)===0){if(i.right.isEmpty())return R.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(t,e))}return i.fixUp()}isRed(){return this.color}fixUp(){let t=this;return t.right.isRed()&&!t.left.isRed()&&(t=t.rotateLeft()),t.left.isRed()&&t.left.left.isRed()&&(t=t.rotateRight()),t.left.isRed()&&t.right.isRed()&&(t=t.colorFlip()),t}moveRedLeft(){let t=this.colorFlip();return t.right.left.isRed()&&(t=t.copy(null,null,null,null,t.right.rotateRight()),t=t.rotateLeft(),t=t.colorFlip()),t}moveRedRight(){let t=this.colorFlip();return t.left.left.isRed()&&(t=t.rotateRight(),t=t.colorFlip()),t}rotateLeft(){const t=this.copy(null,null,R.RED,null,this.right.left);return this.right.copy(null,null,this.color,t,null)}rotateRight(){const t=this.copy(null,null,R.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,t)}colorFlip(){const t=this.left.copy(null,null,!this.left.color,null,null),e=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,t,e)}checkMaxDepth(){const t=this.check();return Math.pow(2,t)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw _(43730,{key:this.key,value:this.value});if(this.right.isRed())throw _(14113,{key:this.key,value:this.value});const t=this.left.check();if(t!==this.right.check())throw _(27949);return t+(this.isRed()?0:1)}}R.EMPTY=null,R.RED=!0,R.BLACK=!1;R.EMPTY=new class{constructor(){this.size=0}get key(){throw _(57766)}get value(){throw _(16141)}get color(){throw _(16727)}get left(){throw _(29726)}get right(){throw _(36894)}copy(t,e,r,i,s){return this}insert(t,e,r){return new R(t,e)}remove(t,e){return this}isEmpty(){return!0}inorderTraversal(t){return!1}reverseTraversal(t){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class Vt{constructor(t){this.comparator=t,this.data=new zt(this.comparator)}has(t){return this.data.get(t)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(t){return this.data.indexOf(t)}forEach(t){this.data.inorderTraversal((e,r)=>(t(e),!1))}forEachInRange(t,e){const r=this.data.getIteratorFrom(t[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,t[1])>=0)return;e(i.key)}}forEachWhile(t,e){let r;for(r=e!==void 0?this.data.getIteratorFrom(e):this.data.getIterator();r.hasNext();)if(!t(r.getNext().key))return}firstAfterOrEqual(t){const e=this.data.getIteratorFrom(t);return e.hasNext()?e.getNext().key:null}getIterator(){return new en(this.data.getIterator())}getIteratorFrom(t){return new en(this.data.getIteratorFrom(t))}add(t){return this.copy(this.data.remove(t).insert(t,!0))}delete(t){return this.has(t)?this.copy(this.data.remove(t)):this}isEmpty(){return this.data.isEmpty()}unionWith(t){let e=this;return e.size<t.size&&(e=t,t=this),t.forEach(r=>{e=e.add(r)}),e}isEqual(t){if(!(t instanceof Vt)||this.size!==t.size)return!1;const e=this.data.getIterator(),r=t.data.getIterator();for(;e.hasNext();){const i=e.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const t=[];return this.forEach(e=>{t.push(e)}),t}toString(){const t=[];return this.forEach(e=>t.push(e)),"SortedSet("+t.toString()+")"}copy(t){const e=new Vt(this.comparator);return e.data=t,e}}class en{constructor(t){this.iter=t}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
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
 */class it{constructor(t){this.fields=t,t.sort(H.comparator)}static empty(){return new it([])}unionWith(t){let e=new Vt(H.comparator);for(const r of this.fields)e=e.add(r);for(const r of t)e=e.add(r);return new it(e.toArray())}covers(t){for(const e of this.fields)if(e.isPrefixOf(t))return!0;return!1}isEqual(t){return Te(this.fields,t.fields,(e,r)=>e.isEqual(r))}}/**
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
 */class D{constructor(t){this.value=t}static empty(){return new D({mapValue:{}})}field(t){if(t.isEmpty())return this.value;{let e=this.value;for(let r=0;r<t.length-1;++r)if(e=(e.mapValue.fields||{})[t.get(r)],!ce(e))return null;return e=(e.mapValue.fields||{})[t.lastSegment()],e||null}}set(t,e){this.getFieldsMap(t.popLast())[t.lastSegment()]=gt(e)}setAll(t){let e=H.emptyPath(),r={},i=[];t.forEach((o,a)=>{if(!e.isImmediateParentOf(a)){const u=this.getFieldsMap(e);this.applyChanges(u,r,i),r={},i=[],e=a.popLast()}o?r[a.lastSegment()]=gt(o):i.push(a.lastSegment())});const s=this.getFieldsMap(e);this.applyChanges(s,r,i)}delete(t){const e=this.field(t.popLast());ce(e)&&e.mapValue.fields&&delete e.mapValue.fields[t.lastSegment()]}isEqual(t){return ht(this.value,t.value)}getFieldsMap(t){let e=this.value;e.mapValue.fields||(e.mapValue={fields:{}});for(let r=0;r<t.length;++r){let i=e.mapValue.fields[t.get(r)];ce(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},e.mapValue.fields[t.get(r)]=i),e=i}return e.mapValue.fields}applyChanges(t,e,r){Nt(e,(i,s)=>t[i]=s);for(const i of r)delete t[i]}clone(){return new D(gt(this.value))}}/**
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
 */class G{constructor(t,e,r,i,s,o,a){this.key=t,this.documentType=e,this.version=r,this.readTime=i,this.createTime=s,this.data=o,this.documentState=a}static newInvalidDocument(t){return new G(t,0,A.min(),A.min(),A.min(),D.empty(),0)}static newFoundDocument(t,e,r,i){return new G(t,1,e,A.min(),r,i,0)}static newNoDocument(t,e){return new G(t,2,e,A.min(),A.min(),D.empty(),0)}static newUnknownDocument(t,e){return new G(t,3,e,A.min(),A.min(),D.empty(),2)}convertToFoundDocument(t,e){return!this.createTime.isEqual(A.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=t),this.version=t,this.documentType=1,this.data=e,this.documentState=0,this}convertToNoDocument(t){return this.version=t,this.documentType=2,this.data=D.empty(),this.documentState=0,this}convertToUnknownDocument(t){return this.version=t,this.documentType=3,this.data=D.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=A.min(),this}setReadTime(t){return this.readTime=t,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(t){return t instanceof G&&this.key.isEqual(t.key)&&this.version.isEqual(t.version)&&this.documentType===t.documentType&&this.documentState===t.documentState&&this.data.isEqual(t.data)}mutableCopy(){return new G(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */class Xr{constructor(t,e=null,r=[],i=[],s=null,o=null,a=null){this.path=t,this.collectionGroup=e,this.orderBy=r,this.filters=i,this.limit=s,this.startAt=o,this.endAt=a,this.Ie=null}}function nn(n,t=null,e=[],r=[],i=null,s=null,o=null){return new Xr(n,t,e,r,i,s,o)}/**
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
 */class ot{constructor(t,e=null,r=[],i=[],s=null,o="F",a=null,u=null){this.path=t,this.collectionGroup=e,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=o,this.startAt=a,this.endAt=u,this.pe=null,this.ye=null,this.we=null,this.startAt,this.endAt}}function Pn(n){return n.collectionGroup!==null}function Sn(n){const t=tt(n);if(t.pe===null){t.pe=[];const e=new Set;for(const s of t.explicitOrderBy)t.pe.push(s),e.add(s.field.canonicalString());const r=t.explicitOrderBy.length>0?t.explicitOrderBy[t.explicitOrderBy.length-1].dir:"asc";(function(o){let a=new Vt(H.comparator);return o.filters.forEach(u=>{u.getFlattenedFilters().forEach(c=>{c.isInequality()&&(a=a.add(c.field))})}),a})(t).forEach(s=>{e.has(s.canonicalString())||s.isKeyField()||t.pe.push(new Bt(s,r))}),e.has(H.keyField().canonicalString())||t.pe.push(new Bt(H.keyField(),r))}return t.pe}function me(n){const t=tt(n);return t.ye||(t.ye=bn(t,Sn(n))),t.ye}function bn(n,t){if(n.limitType==="F")return nn(n.path,n.collectionGroup,t,n.filters,n.limit,n.startAt,n.endAt);{t=t.map(i=>{const s=i.dir==="desc"?"asc":"desc";return new Bt(i.field,s)});const e=n.endAt?new jt(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new jt(n.startAt.position,n.startAt.inclusive):null;return nn(n.path,n.collectionGroup,t,n.filters,n.limit,e,r)}}function pe(n,t){const e=n.filters.concat([t]);return new ot(n.path,n.collectionGroup,n.explicitOrderBy.slice(),e,n.limit,n.limitType,n.startAt,n.endAt)}function Zr(n,t){return function(r,i){if(r.limit!==i.limit||r.orderBy.length!==i.orderBy.length)return!1;for(let s=0;s<r.orderBy.length;s++)if(!Yr(r.orderBy[s],i.orderBy[s]))return!1;if(r.filters.length!==i.filters.length)return!1;for(let s=0;s<r.filters.length;s++)if(!Nn(r.filters[s],i.filters[s]))return!1;return r.collectionGroup===i.collectionGroup&&!!r.path.isEqual(i.path)&&!!tn(r.startAt,i.startAt)&&tn(r.endAt,i.endAt)}(me(n),me(t))&&n.limitType===t.limitType}/**
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
 */function Dn(n,t){if(n.useProto3Json){if(isNaN(t))return{doubleValue:"NaN"};if(t===1/0)return{doubleValue:"Infinity"};if(t===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Mt(t)?"-0":t}}function Yt(n,t,e){return function(i){return typeof i=="number"&&Number.isInteger(i)&&!Mt(i)&&i<=Number.MAX_SAFE_INTEGER&&i>=Number.MIN_SAFE_INTEGER}(t)?function(i){return{integerValue:""+i}}(t):Dn(n,t)}/**
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
 */class Xt{constructor(){this._=void 0}}class Fn extends Xt{}class kn extends Xt{constructor(t){super(),this.elements=t}}class On extends Xt{constructor(t){super(),this.elements=t}}class Ve extends Xt{constructor(t,e){super(),this.serializer=t,this.ge=e}}class Cn extends Ve{}class Ln extends Ve{}class Un extends Ve{}/**
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
 */class ft{constructor(t,e){this.field=t,this.transform=e}}class S{constructor(t,e){this.updateTime=t,this.exists=e}static none(){return new S}static exists(t){return new S(void 0,t)}static updateTime(t){return new S(t)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(t){return this.exists===t.exists&&(this.updateTime?!!t.updateTime&&this.updateTime.isEqual(t.updateTime):!t.updateTime)}}class Zt{}class xn extends Zt{constructor(t,e,r,i=[]){super(),this.key=t,this.value=e,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class ve extends Zt{constructor(t,e,r,i,s=[]){super(),this.key=t,this.data=e,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}class te extends Zt{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Mn extends Zt{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */const ti={asc:"ASCENDING",desc:"DESCENDING"},ei={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},ni={and:"AND",or:"OR"};class ri{constructor(t,e){this.databaseId=t,this.useProto3Json=e}}function Ut(n,t){return n.useProto3Json?`${new Date(1e3*t.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+t.nanoseconds).slice(-9)}Z`:{seconds:""+t.seconds,nanos:t.nanoseconds}}function ii(n,t){return n.useProto3Json?t.toBase64():t.toUint8Array()}function si(n,t){return Ut(n,t.toTimestamp())}function yt(n){return F(!!n,49232),A.fromTimestamp(function(e){const r=et(e);return new E(r.seconds,r.nanos)}(n))}function Ne(n,t){return _e(n,t).canonicalString()}function _e(n,t){const e=function(i){return new I(["projects",i.projectId,"databases",i.database])}(n).child("documents");return t===void 0?e:e.child(t)}function Wt(n,t){return Ne(n.databaseId,t.path)}function ge(n,t){const e=function(i){const s=I.fromString(i);return F(Gn(s),10190,{key:s.toString()}),s}(t);if(e.get(1)!==n.databaseId.projectId)throw new d(l.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+e.get(1)+" vs "+n.databaseId.projectId);if(e.get(3)!==n.databaseId.database)throw new d(l.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+e.get(3)+" vs "+n.databaseId.database);return new T(function(i){return F(i.length>4&&i.get(4)==="documents",29091,{key:i.toString()}),i.popFirst(5)}(e))}function rn(n,t,e){return{name:Wt(n,t),fields:e.value.mapValue.fields}}function oi(n,t){return"found"in t?function(r,i){F(!!i.found,43571),i.found.name,i.found.updateTime;const s=ge(r,i.found.name),o=yt(i.found.updateTime),a=i.found.createTime?yt(i.found.createTime):A.min(),u=new D({mapValue:{fields:i.found.fields}});return G.newFoundDocument(s,o,a,u)}(n,t):"missing"in t?function(r,i){F(!!i.missing,3894),F(!!i.readTime,22933);const s=ge(r,i.missing),o=yt(i.readTime);return G.newNoDocument(s,o)}(n,t):_(7234,{result:t})}function ai(n,t){let e;if(t instanceof xn)e={update:rn(n,t.key,t.value)};else if(t instanceof te)e={delete:Wt(n,t.key)};else if(t instanceof ve)e={update:rn(n,t.key,t.data),updateMask:hi(t.fieldMask)};else{if(!(t instanceof Mn))return _(16599,{Fe:t.type});e={verify:Wt(n,t.key)}}return t.fieldTransforms.length>0&&(e.updateTransforms=t.fieldTransforms.map(r=>function(s,o){const a=o.transform;if(a instanceof Fn)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(a instanceof kn)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:a.elements}};if(a instanceof On)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:a.elements}};if(a instanceof Cn)return{fieldPath:o.field.canonicalString(),increment:a.ge};if(a instanceof Ln)return{fieldPath:o.field.canonicalString(),minimum:a.ge};if(a instanceof Un)return{fieldPath:o.field.canonicalString(),maximum:a.ge};throw _(20930,{transform:o.transform})}(0,r))),t.precondition.isNone||(e.currentDocument=function(i,s){return s.updateTime!==void 0?{updateTime:si(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:_(27497)}(n,t.precondition)),e}function qn(n,t){const e={structuredQuery:{}},r=t.path;let i;t.collectionGroup!==null?(i=r,e.structuredQuery.from=[{collectionId:t.collectionGroup,allDescendants:!0}]):(i=r.popLast(),e.structuredQuery.from=[{collectionId:r.lastSegment()}]),e.parent=function(c,h){return Ne(c.databaseId,h)}(n,i);const s=function(c){if(c.length!==0)return $n(rt.create(c,"and"))}(t.filters);s&&(e.structuredQuery.where=s);const o=function(c){if(c.length!==0)return c.map(h=>function(m){return{field:Q(m.field),direction:ui(m.dir)}}(h))}(t.orderBy);o&&(e.structuredQuery.orderBy=o);const a=function(c,h){return c.useProto3Json||In(h)?h:{value:h}}(n,t.limit);return a!==null&&(e.structuredQuery.limit=a),t.startAt&&(e.structuredQuery.startAt=function(c){return{before:c.inclusive,values:c.position}}(t.startAt)),t.endAt&&(e.structuredQuery.endAt=function(c){return{before:!c.inclusive,values:c.position}}(t.endAt)),{ve:e,parent:i}}function ui(n){return ti[n]}function li(n){return ei[n]}function ci(n){return ni[n]}function Q(n){return{fieldPath:n.canonicalString()}}function $n(n){return n instanceof k?function(e){if(e.op==="=="){if(Ze(e.value))return{unaryFilter:{field:Q(e.field),op:"IS_NAN"}};if(Xe(e.value))return{unaryFilter:{field:Q(e.field),op:"IS_NULL"}}}else if(e.op==="!="){if(Ze(e.value))return{unaryFilter:{field:Q(e.field),op:"IS_NOT_NAN"}};if(Xe(e.value))return{unaryFilter:{field:Q(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Q(e.field),op:li(e.op),value:e.value}}}(n):n instanceof rt?function(e){const r=e.getFilters().map(i=>$n(i));return r.length===1?r[0]:{compositeFilter:{op:ci(e.op),filters:r}}}(n):_(54877,{filter:n})}function hi(n){const t=[];return n.fields.forEach(e=>t.push(e.canonicalString())),{fieldPaths:t}}function Gn(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function jn(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}/**
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
 */function Re(n){return new ri(n,!0)}/**
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
 */class di{}class fi extends di{constructor(t,e,r,i){super(),this.authCredentials=t,this.appCheckCredentials=e,this.connection=r,this.serializer=i,this.be=!1}De(){if(this.be)throw new d(l.FAILED_PRECONDITION,"The client has already been terminated.")}le(t,e,r,i){return this.De(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,o])=>this.connection.le(t,_e(e,r),i,s,o)).catch(s=>{throw s.name==="FirebaseError"?(s.code===l.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new d(l.UNKNOWN,s.toString())})}de(t,e,r,i,s){return this.De(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,a])=>this.connection.de(t,_e(e,r),i,o,a,s)).catch(o=>{throw o.name==="FirebaseError"?(o.code===l.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new d(l.UNKNOWN,o.toString())})}terminate(){this.be=!0,this.connection.terminate()}}async function mt(n,t){const e=tt(n),r={writes:t.map(i=>ai(e.serializer,i))};await e.le("Commit",e.serializer.databaseId,I.emptyPath(),r)}async function Bn(n,t){const e=tt(n),r={documents:t.map(a=>Wt(e.serializer,a))},i=await e.de("BatchGetDocuments",e.serializer.databaseId,I.emptyPath(),r,t.length),s=new Map;i.forEach(a=>{const u=oi(e.serializer,a);s.set(u.key.toString(),u)});const o=[];return t.forEach(a=>{const u=s.get(a.toString());F(!!u,55234,{key:a}),o.push(u)}),o}async function mi(n,t){const e=tt(n),{ve:r,parent:i}=qn(e.serializer,me(t));return(await e.de("RunQuery",e.serializer.databaseId,i,{structuredQuery:r.structuredQuery})).filter(s=>!!s.document).map(s=>function(a,u,c){const h=ge(a,u.name),f=yt(u.updateTime),m=u.createTime?yt(u.createTime):A.min(),g=new D({mapValue:{fields:u.fields}}),v=G.newFoundDocument(h,f,m,g);return c?v.setHasCommittedMutations():v}(e.serializer,s.document,void 0))}async function pi(n,t,e){var c;const r=tt(n),{request:i,Ne:s,parent:o}=function(f,m,g,v){const{ve:P,parent:q}=qn(f,m),Dt={},Ft=[];let ur=0;return g.forEach(lt=>{const kt="aggregate_"+ur++;Dt[kt]=lt.alias,lt.aggregateType==="count"?Ft.push({alias:kt,count:{}}):lt.aggregateType==="avg"?Ft.push({alias:kt,avg:{field:Q(lt.fieldPath)}}):lt.aggregateType==="sum"&&Ft.push({alias:kt,sum:{field:Q(lt.fieldPath)}})}),{request:{structuredAggregationQuery:{aggregations:Ft,structuredQuery:P.structuredQuery},parent:P.parent},Ne:Dt,parent:q}}(r.serializer,function(f){const m=tt(f);return m.we||(m.we=bn(m,f.explicitOrderBy)),m.we}(t),e);r.connection.ae||delete i.parent;const a=(await r.de("RunAggregationQuery",r.serializer.databaseId,o,i,1)).filter(h=>!!h.result);F(a.length===1,64727);const u=(c=a[0].result)==null?void 0:c.aggregateFields;return Object.keys(u).reduce((h,f)=>(h[s[f]]=u[f],h),{})}/**
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
 */const zn="ComponentProvider",Et=new Map;function z(n){if(n._terminated)throw new d(l.FAILED_PRECONDITION,"The client has already been terminated.");if(!Et.has(n)){Z(zn,"Initializing Datastore");const t=function(s){return new Mr(s)}(function(s,o,a,u,c){return new Pr(s,o,a,c.host,c.ssl,c.experimentalForceLongPolling,c.experimentalAutoDetectLongPolling,En(c.experimentalLongPollingOptions),c.useFetchStreams,c.isUsingEmulator,u,c._customHeaders,c.grpcFlowControlWindow)}(n._databaseId,n.app.options.appId||"",n._persistenceKey,n.app.options.apiKey,n._freezeSettings())),e=Re(n._databaseId),r=function(s,o,a,u){return new fi(s,o,a,u)}(n._authCredentials,n._appCheckCredentials,t,e);Et.set(n,r)}return Et.get(n)}const _i=1048576,Wn="firestore.googleapis.com",sn=!0;class on{constructor(t){if(t.host===void 0){if(t.ssl!==void 0)throw new d(l.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Wn,this.ssl=sn}else this.host=t.host,this.ssl=t.ssl??sn;if(this.isUsingEmulator=t.emulatorOptions!==void 0,this.credentials=t.credentials,this.ignoreUndefinedProperties=!!t.ignoreUndefinedProperties,this.localCache=t.localCache,t._customHeaders&&(this._customHeaders={...t._customHeaders}),t.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(t.cacheSizeBytes!==-1&&t.cacheSizeBytes<_i)throw new d(l.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=t.cacheSizeBytes}if(function(r,i,s,o){if(i===!0&&o===!0)throw new d(l.INVALID_ARGUMENT,`${r} and ${s} cannot be used together.`)}("experimentalForceLongPolling",t.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",t.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!t.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:t.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!t.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=En(t.experimentalLongPollingOptions??{}),function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new d(l.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new d(l.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new d(l.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!t.useFetchStreams,t.grpcFlowControlWindow!==void 0){if(typeof t.grpcFlowControlWindow!="number"||t.grpcFlowControlWindow<=0||t.grpcFlowControlWindow>2147483647||!Number.isInteger(t.grpcFlowControlWindow))throw new d(l.INVALID_ARGUMENT,"grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");this.grpcFlowControlWindow=t.grpcFlowControlWindow}}isEqual(t){return this.host===t.host&&this.ssl===t.ssl&&this.credentials===t.credentials&&this.cacheSizeBytes===t.cacheSizeBytes&&this.experimentalForceLongPolling===t.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===t.experimentalAutoDetectLongPolling&&function(r,i){return r.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,t.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===t.ignoreUndefinedProperties&&this.useFetchStreams===t.useFetchStreams&&this.grpcFlowControlWindow===t.grpcFlowControlWindow&&function(r,i){if(r===i)return!0;if(!r||!i)return!1;const s=Object.keys(r),o=Object.keys(i);if(s.length!==o.length)return!1;for(const a of s)if(r[a]!==i[a])return!1;return!0}(this._customHeaders,t._customHeaders)}}class W{constructor(t,e,r,i){this._authCredentials=t,this._appCheckCredentials=e,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new on({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new d(l.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(t){if(this._settingsFrozen)throw new d(l.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new on(t),this._emulatorOptions=t.emulatorOptions||{},t.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new Ar;switch(r.type){case"firstParty":return new Nr(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new d(l.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(t.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){const r=Et.get(e);r&&(Z(zn,"Removing Datastore"),Et.delete(e),r.terminate())}(this),Promise.resolve()}}function Mi(n,t,e){e||(e=xt);const r=fn(n,"firestore/lite");if(r.isInitialized(e))throw new d(l.FAILED_PRECONDITION,"Firestore can only be initialized once per app.");return r.initialize({options:t,instanceIdentifier:e})}function qi(n,t){const e=typeof n=="object"?n:dr(),r=typeof n=="string"?n:t||"(default)",i=fn(e,"firestore/lite").getImmediate({identifier:r});if(!i._initialized){const s=fr("firestore");s&&gi(i,...s)}return i}function gi(n,t,e,r={}){var c;n=x(n,W);const i=dn(t),s=n._getSettings(),o={...s,emulatorOptions:n._getEmulatorOptions()},a=`${t}:${e}`;i&&cr(`https://${a}`),s.host!==Wn&&s.host!==a&&mn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const u={...s,host:a,ssl:i,emulatorOptions:r};if(!Qt(u,o)&&(n._setSettings(u),r.mockUserToken)){let h,f;if(typeof r.mockUserToken=="string")h=r.mockUserToken,f=b.MOCK_USER;else{h=hr(r.mockUserToken,(c=n._app)==null?void 0:c.options.projectId);const m=r.mockUserToken.sub||r.mockUserToken.user_id;if(!m)throw new d(l.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");f=new b(m)}n._authCredentials=new wr(new _n(h,f))}}function $i(n){return n=x(n,W),pr(n.app,"firestore/lite"),n._delete()}/**
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
 */class O{constructor(t,e,r){this.converter=e,this._query=r,this.type="query",this.firestore=t}withConverter(t){return new O(this.firestore,t,this._query)}}class y{constructor(t,e,r){this.converter=e,this._key=r,this.type="document",this.firestore=t}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new M(this.firestore,this.converter,this._key.path.popLast())}withConverter(t){return new y(this.firestore,t,this._key)}toJSON(){return{type:y._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(t,e,r){if(Rt(e,y._jsonSchema))return new y(t,r||null,new T(I.fromString(e.referencePath)))}}y._jsonSchemaVersion="firestore/documentReference/1.0",y._jsonSchema={type:L("string",y._jsonSchemaVersion),referencePath:L("string")};class M extends O{constructor(t,e,r){super(t,e,function(s){return new ot(s)}(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const t=this._path.popLast();return t.isEmpty()?null:new y(this.firestore,null,new T(t))}withConverter(t){return new M(this.firestore,t,this._path)}}function Gi(n,t,...e){if(n=N(n),Ae("collection","path",t),n instanceof W){const r=I.fromString(t,...e);return Be(r),new M(n,null,r)}{if(!(n instanceof y||n instanceof M))throw new d(l.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(I.fromString(t,...e));return Be(r),new M(n.firestore,null,r)}}function ji(n,t){if(n=x(n,W),Ae("collectionGroup","collection id",t),t.indexOf("/")>=0)throw new d(l.INVALID_ARGUMENT,`Invalid collection ID '${t}' passed to function collectionGroup(). Collection IDs must not contain '/'.`);return new O(n,null,function(r){return new ot(I.emptyPath(),r)}(t))}function yi(n,t,...e){if(n=N(n),arguments.length===1&&(t=Dr.newId()),Ae("doc","path",t),n instanceof W){const r=I.fromString(t,...e);return je(r),new y(n,null,new T(r))}{if(!(n instanceof y||n instanceof M))throw new d(l.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(I.fromString(t,...e));return je(r),new y(n.firestore,n instanceof M?n.converter:null,new T(r))}}function Bi(n,t){return n=N(n),t=N(t),(n instanceof y||n instanceof M)&&(t instanceof y||t instanceof M)&&n.firestore===t.firestore&&n.path===t.path&&n.converter===t.converter}function Kn(n,t){return n=N(n),t=N(t),n instanceof O&&t instanceof O&&n.firestore===t.firestore&&Zr(n._query,t._query)&&n.converter===t.converter}/**
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
 */class C{constructor(t){this._byteString=t}static fromBase64String(t){try{return new C(B.fromBase64String(t))}catch(e){throw new d(l.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+e)}}static fromUint8Array(t){return new C(B.fromUint8Array(t))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(t){return this._byteString.isEqual(t._byteString)}toJSON(){return{type:C._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(t){if(Rt(t,C._jsonSchema))return C.fromBase64String(t.bytes)}}C._jsonSchemaVersion="firestore/bytes/1.0",C._jsonSchema={type:L("string",C._jsonSchemaVersion),bytes:L("string")};/**
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
 */class pt{constructor(...t){for(let e=0;e<t.length;++e)if(t[e].length===0)throw new d(l.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new H(t)}isEqual(t){return this._internalPath.isEqual(t._internalPath)}}function zi(){return new pt(fe)}/**
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
 */class K{constructor(t){this._methodName=t}}/**
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
 */class j{constructor(t,e){if(!isFinite(t)||t<-90||t>90)throw new d(l.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+t);if(!isFinite(e)||e<-180||e>180)throw new d(l.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+e);this._lat=t,this._long=e}get latitude(){return this._lat}get longitude(){return this._long}isEqual(t){return this._lat===t._lat&&this._long===t._long}_compareTo(t){return w(this._lat,t._lat)||w(this._long,t._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:j._jsonSchemaVersion}}static fromJSON(t){if(Rt(t,j._jsonSchema))return new j(t.latitude,t.longitude)}}j._jsonSchemaVersion="firestore/geoPoint/1.0",j._jsonSchema={type:L("string",j._jsonSchemaVersion),latitude:L("number"),longitude:L("number")};/**
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
 */class U{constructor(t){this._values=(t||[]).map(e=>e)}toArray(){return this._values.map(t=>t)}isEqual(t){/**
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
*/return function(r,i){if(r.length!==i.length)return!1;for(let s=0;s<r.length;++s)if(r[s]!==i[s])return!1;return!0}(this._values,t._values)}toJSON(){return{type:U._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(t){if(Rt(t,U._jsonSchema)){if(Array.isArray(t.vectorValues)&&t.vectorValues.every(e=>typeof e=="number"))return new U(t.vectorValues);throw new d(l.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}U._jsonSchemaVersion="firestore/vectorValue/1.0",U._jsonSchema={type:L("string",U._jsonSchemaVersion),vectorValues:L("object")};/**
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
 */const Ei=/^__.*__$/;class Ii{constructor(t,e,r){this.data=t,this.fieldMask=e,this.fieldTransforms=r}toMutation(t,e){return this.fieldMask!==null?new ve(t,this.data,this.fieldMask,e,this.fieldTransforms):new xn(t,this.data,e,this.fieldTransforms)}}class Qn{constructor(t,e,r){this.data=t,this.fieldMask=e,this.fieldTransforms=r}toMutation(t,e){return new ve(t,this.data,this.fieldMask,e,this.fieldTransforms)}}function Hn(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw _(40011,{dataSource:n})}}class ee{constructor(t,e,r,i,s,o){this.settings=t,this.databaseId=e,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.validatePath(),this.fieldTransforms=s||[],this.fieldMask=o||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(t){return new ee({...this.settings,...t},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(t){var i;const e=(i=this.path)==null?void 0:i.child(t),r=this.contextWith({path:e,arrayElement:!1});return r.validatePathSegment(t),r}childContextForFieldPath(t){var i;const e=(i=this.path)==null?void 0:i.child(t),r=this.contextWith({path:e,arrayElement:!1});return r.validatePath(),r}childContextForArray(t){return this.contextWith({path:void 0,arrayElement:!0})}createError(t){return Kt(t,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(t){return this.fieldMask.find(e=>t.isPrefixOf(e))!==void 0||this.fieldTransforms.find(e=>t.isPrefixOf(e.field))!==void 0}validatePath(){if(this.path)for(let t=0;t<this.path.length;t++)this.validatePathSegment(this.path.get(t))}validatePathSegment(t){if(t.length===0)throw this.createError("Document fields must not be empty");if(Hn(this.dataSource)&&Ei.test(t))throw this.createError('Document fields cannot begin and end with "__"')}}class Ti{constructor(t,e,r){this.databaseId=t,this.ignoreUndefinedProperties=e,this.serializer=r||Re(t)}createContext(t,e,r,i=!1){return new ee({dataSource:t,methodName:e,targetDoc:r,path:H.emptyPath(),arrayElement:!1,hasConverter:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function at(n){const t=n._freezeSettings(),e=Re(n._databaseId);return new Ti(n._databaseId,!!t.ignoreUndefinedProperties,e)}function ne(n,t,e,r,i,s={}){const o=n.createContext(s.merge||s.mergeFields?2:0,t,e,i);Le("Data must be an object, but it was:",o,r);const a=Xn(r,o);let u,c;if(s.merge)u=new it(o.fieldMask),c=o.fieldTransforms;else if(s.mergeFields){const h=[];for(const f of s.mergeFields){const m=J(t,f,e);if(!o.contains(m))throw new d(l.INVALID_ARGUMENT,`Field '${m}' is specified in your field mask but missing from your input data.`);nr(h,m)||h.push(m)}u=new it(h),c=o.fieldTransforms.filter(f=>u.covers(f.field))}else u=null,c=o.fieldTransforms;return new Ii(new D(a),u,c)}class Pt extends K{_toFieldTransform(t){if(t.dataSource!==2)throw t.dataSource===1?t.createError(`${this._methodName}() can only appear at the top level of your update data`):t.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return t.fieldMask.push(t.path),null}isEqual(t){return t instanceof Pt}}function Jn(n,t,e){return new ee({dataSource:3,targetDoc:t.settings.targetDoc,methodName:n._methodName,arrayElement:e},t.databaseId,t.serializer,t.ignoreUndefinedProperties)}class Pe extends K{_toFieldTransform(t){return new ft(t.path,new Fn)}isEqual(t){return t instanceof Pe}}class Se extends K{constructor(t,e){super(t),this.Se=e}_toFieldTransform(t){const e=Jn(this,t,!0),r=this.Se.map(s=>ut(s,e)),i=new kn(r);return new ft(t.path,i)}isEqual(t){return t instanceof Se&&Qt(this.Se,t.Se)}}class be extends K{constructor(t,e){super(t),this.Se=e}_toFieldTransform(t){const e=Jn(this,t,!0),r=this.Se.map(s=>ut(s,e)),i=new On(r);return new ft(t.path,i)}isEqual(t){return t instanceof be&&Qt(this.Se,t.Se)}}class De extends K{constructor(t,e){super(t),this.Ce=e}_toFieldTransform(t){const e=new Cn(t.serializer,Yt(t.serializer,this.Ce));return new ft(t.path,e)}isEqual(t){return t instanceof De&&(this.Ce===t.Ce||Number.isNaN(this.Ce)&&Number.isNaN(t.Ce))}}class Fe extends K{constructor(t,e){super(t),this.Ce=e}_toFieldTransform(t){const e=new Ln(t.serializer,Yt(t.serializer,this.Ce));return new ft(t.path,e)}isEqual(t){return t instanceof Fe&&(this.Ce===t.Ce||Number.isNaN(this.Ce)&&Number.isNaN(t.Ce))}}class ke extends K{constructor(t,e){super(t),this.Ce=e}_toFieldTransform(t){const e=new Un(t.serializer,Yt(t.serializer,this.Ce));return new ft(t.path,e)}isEqual(t){return t instanceof ke&&(this.Ce===t.Ce||Number.isNaN(this.Ce)&&Number.isNaN(t.Ce))}}function Oe(n,t,e,r){const i=n.createContext(1,t,e);Le("Data must be an object, but it was:",i,r);const s=[],o=D.empty();Nt(r,(u,c)=>{const h=er(t,u,e);c=N(c);const f=i.childContextForFieldPath(h);if(c instanceof Pt)s.push(h);else{const m=ut(c,f);m!=null&&(s.push(h),o.set(h,m))}});const a=new it(s);return new Qn(o,a,i.fieldTransforms)}function Ce(n,t,e,r,i,s){const o=n.createContext(1,t,e),a=[J(t,r,e)],u=[i];if(s.length%2!=0)throw new d(l.INVALID_ARGUMENT,`Function ${t}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let m=0;m<s.length;m+=2)a.push(J(t,s[m])),u.push(s[m+1]);const c=[],h=D.empty();for(let m=a.length-1;m>=0;--m)if(!nr(c,a[m])){const g=a[m];let v=u[m];v=N(v);const P=o.childContextForFieldPath(g);if(v instanceof Pt)c.push(g);else{const q=ut(v,P);q!=null&&(c.push(g),h.set(g,q))}}const f=new it(c);return new Qn(h,f,o.fieldTransforms)}function Yn(n,t,e,r=!1){return ut(e,n.createContext(r?4:3,t))}function ut(n,t,e){if(tr(n=N(n)))return Le("Unsupported field value:",t,n),Xn(n,t);if(n instanceof K)return function(i,s){if(!Hn(s.dataSource))throw s.createError(`${i._methodName}() can only be used with update() and set()`);if(!s.path)throw s.createError(`${i._methodName}() is not currently supported inside arrays`);const o=i._toFieldTransform(s);o&&s.fieldTransforms.push(o)}(n,t),null;if(n===void 0&&t.ignoreUndefinedProperties)return null;if(t.path&&t.fieldMask.push(t.path),n instanceof Array){if(t.settings.arrayElement&&t.dataSource!==4)throw t.createError("Nested arrays are not supported");return function(i,s){const o=[];let a=0;for(const u of i){let c=ut(u,s.childContextForArray(a));c==null&&(c={nullValue:"NULL_VALUE"}),o.push(c),a++}return{arrayValue:{values:o}}}(n,t)}return function(i,s,o){if((i=N(i))===null)return{nullValue:"NULL_VALUE"};if(typeof i=="number")return Yt(s.serializer,i);if(typeof i=="boolean")return{booleanValue:i};if(typeof i=="string")return{stringValue:i};if(i instanceof Date){const a=E.fromDate(i);return{timestampValue:Ut(s.serializer,a)}}if(i instanceof E){const a=new E(i.seconds,1e3*Math.floor(i.nanoseconds/1e3));return{timestampValue:Ut(s.serializer,a)}}if(Zn(i)){const a=E.fromInstant(i),u=new E(a.seconds,1e3*Math.floor(a.nanoseconds/1e3));return{timestampValue:Ut(s.serializer,u)}}if(i instanceof j)return{geoPointValue:{latitude:i.latitude,longitude:i.longitude}};if(i instanceof C)return{bytesValue:ii(s.serializer,i._byteString)};if(i instanceof y){const a=s.databaseId,u=i.firestore._databaseId;if(!u.isEqual(a))throw s.createError(`Document reference is for database ${u.projectId}/${u.database} but should be for database ${a.projectId}/${a.database}`);return{referenceValue:Ne(i.firestore._databaseId||s.databaseId,i._key.path)}}if(i instanceof U)return function(u,c){const h=u instanceof U?u.toArray():u;return{mapValue:{fields:{[An]:{stringValue:wn},[qt]:{arrayValue:{values:h.map(m=>{if(typeof m!="number")throw c.createError("VectorValues must only contain numeric values.");return Dn(c.serializer,m)})}}}}}}(i,s);if(jn(i))return i._toProto(s.serializer);throw s.createError(`Unsupported field value: ${Jt(i)}`)}(n,t)}function Xn(n,t){const e={};return function(i){for(const s in i)if(Object.prototype.hasOwnProperty.call(i,s))return!1;return!0}(n)?t.path&&t.path.length>0&&t.fieldMask.push(t.path):Nt(n,(r,i)=>{const s=ut(i,t.childContextForField(r));s!=null&&(e[r]=s)}),{mapValue:{fields:e}}}function Zn(n){if(typeof n!="object"||n===null)return!1;if(typeof Temporal<"u"&&typeof Temporal.Instant=="function"&&n instanceof Temporal.Instant)return!0;const t=n;return t[Symbol.toStringTag]==="Temporal.Instant"&&typeof t.Te=="bigint"}function tr(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof E||n instanceof j||n instanceof C||n instanceof y||n instanceof K||n instanceof U||Zn(n)||jn(n))}function Le(n,t,e){if(!tr(e)||!gn(e)){const r=Jt(e);throw r==="an object"?t.createError(n+" a custom object"):t.createError(n+" "+r)}}function J(n,t,e){if((t=N(t))instanceof pt)return t._internalPath;if(typeof t=="string")return er(n,t);throw Kt("Field path arguments must be of type string or ",n,!1,void 0,e)}const Ai=new RegExp("[~\\*/\\[\\]]");function er(n,t,e){if(t.search(Ai)>=0)throw Kt(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,e);try{return new pt(...t.split("."))._internalPath}catch{throw Kt(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,e)}}function Kt(n,t,e,r,i){const s=r&&!r.isEmpty(),o=i!==void 0;let a=`Function ${t}() called with invalid data`;e&&(a+=" (via `toFirestore()`)"),a+=". ";let u="";return(s||o)&&(u+=" (found",s&&(u+=` in field ${r}`),o&&(u+=` in document ${i}`),u+=")"),new d(l.INVALID_ARGUMENT,a+n+u)}function nr(n,t){return n.some(e=>e.isEqual(t))}/**
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
 */class st{constructor(t,e,r,i,s){this._firestore=t,this._userDataWriter=e,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new y(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const t=new rr(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(t)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var t;return((t=this._document)==null?void 0:t.data.clone().value.mapValue.fields)??void 0}get(t){if(this._document){const e=this._document.data.field(J("DocumentSnapshot.get",t));if(e!==null)return this._userDataWriter.convertValue(e)}}}class rr extends st{data(){return super.data()}}class ye{constructor(t,e){this._docs=e,this.query=t}get docs(){return[...this._docs]}get size(){return this.docs.length}get empty(){return this.docs.length===0}forEach(t,e){this._docs.forEach(t,e)}}function wi(n,t){return n=N(n),t=N(t),n instanceof st&&t instanceof st?n._firestore===t._firestore&&n._key.isEqual(t._key)&&(n._document===null?t._document===null:n._document.isEqual(t._document))&&n._converter===t._converter:n instanceof ye&&t instanceof ye&&Kn(n.query,t.query)&&Te(n.docs,t.docs,wi)}/**
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
 */class Ue{}class St extends Ue{}function Wi(n,t,...e){let r=[];t instanceof Ue&&r.push(t),r=r.concat(e),function(s){const o=s.filter(u=>u instanceof _t).length,a=s.filter(u=>u instanceof bt).length;if(o>1||o>0&&a>0)throw new d(l.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const i of r)n=i._apply(n);return n}class bt extends St{constructor(t,e,r){super(),this._field=t,this._op=e,this._value=r,this.type="where"}static _create(t,e,r){return new bt(t,e,r)}_apply(t){const e=this._parse(t);return sr(t._query,e),new O(t.firestore,t.converter,pe(t._query,e))}_parse(t){const e=at(t.firestore);return function(s,o,a,u,c,h,f){let m;if(c.isKeyField()){if(h==="array-contains"||h==="array-contains-any")throw new d(l.INVALID_ARGUMENT,`Invalid Query. You can't perform '${h}' queries on documentId().`);if(h==="in"||h==="not-in"){un(f,h);const v=[];for(const P of f)v.push(an(u,s,P));m={arrayValue:{values:v}}}else m=an(u,s,f)}else h!=="in"&&h!=="not-in"&&h!=="array-contains-any"||un(f,h),m=Yn(a,o,f,h==="in"||h==="not-in");return k.create(c,h,m)}(t._query,"where",e,t.firestore._databaseId,this._field,this._op,this._value)}}function Ki(n,t,e){const r=t,i=J("where",n);return bt._create(i,r,e)}class _t extends Ue{constructor(t,e){super(),this.type=t,this._queryConstraints=e}static _create(t,e){return new _t(t,e)}_parse(t){const e=this._queryConstraints.map(r=>r._parse(t)).filter(r=>r.getFilters().length>0);return e.length===1?e[0]:rt.create(e,this._getOperator())}_apply(t){const e=this._parse(t);return e.getFilters().length===0?t:(function(i,s){let o=i;const a=s.getFlattenedFilters();for(const u of a)sr(o,u),o=pe(o,u)}(t._query,e),new O(t.firestore,t.converter,pe(t._query,e)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}function Qi(...n){return n.forEach(t=>or("or",t)),_t._create("or",n)}function Hi(...n){return n.forEach(t=>or("and",t)),_t._create("and",n)}class xe extends St{constructor(t,e){super(),this._field=t,this._direction=e,this.type="orderBy"}static _create(t,e){return new xe(t,e)}_apply(t){const e=function(i,s,o){if(i.startAt!==null)throw new d(l.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(i.endAt!==null)throw new d(l.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Bt(s,o)}(t._query,this._field,this._direction);return new O(t.firestore,t.converter,function(i,s){const o=i.explicitOrderBy.concat([s]);return new ot(i.path,i.collectionGroup,o,i.filters.slice(),i.limit,i.limitType,i.startAt,i.endAt)}(t._query,e))}}function Ji(n,t="asc"){const e=t,r=J("orderBy",n);return xe._create(r,e)}class re extends St{constructor(t,e,r){super(),this.type=t,this._limit=e,this._limitType=r}static _create(t,e,r){return new re(t,e,r)}_apply(t){return new O(t.firestore,t.converter,function(r,i,s){return new ot(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),i,s,r.startAt,r.endAt)}(t._query,this._limit,this._limitType))}}function Yi(n){return yn("limit",n),re._create("limit",n,"F")}function Xi(n){return yn("limitToLast",n),re._create("limitToLast",n,"L")}class ie extends St{constructor(t,e,r){super(),this.type=t,this._docOrFields=e,this._inclusive=r}static _create(t,e,r){return new ie(t,e,r)}_apply(t){const e=ir(t,this.type,this._docOrFields,this._inclusive);return new O(t.firestore,t.converter,function(i,s){return new ot(i.path,i.collectionGroup,i.explicitOrderBy.slice(),i.filters.slice(),i.limit,i.limitType,s,i.endAt)}(t._query,e))}}function Zi(...n){return ie._create("startAt",n,!0)}function ts(...n){return ie._create("startAfter",n,!1)}class se extends St{constructor(t,e,r){super(),this.type=t,this._docOrFields=e,this._inclusive=r}static _create(t,e,r){return new se(t,e,r)}_apply(t){const e=ir(t,this.type,this._docOrFields,this._inclusive);return new O(t.firestore,t.converter,function(i,s){return new ot(i.path,i.collectionGroup,i.explicitOrderBy.slice(),i.filters.slice(),i.limit,i.limitType,i.startAt,s)}(t._query,e))}}function es(...n){return se._create("endBefore",n,!1)}function ns(...n){return se._create("endAt",n,!0)}function ir(n,t,e,r){if(e[0]=N(e[0]),e[0]instanceof st)return function(s,o,a,u,c){if(!u)throw new d(l.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${a}().`);const h=[];for(const f of Sn(s))if(f.field.isKeyField())h.push(Gt(o,u.key));else{const m=u.data.field(f.field);if(we(m))throw new d(l.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+f.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(m===null){const g=f.field.canonicalString();throw new d(l.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${g}' (used as the orderBy) does not exist.`)}h.push(m)}return new jt(h,c)}(n._query,n.firestore._databaseId,t,e[0]._document,r);{const i=at(n.firestore);return function(o,a,u,c,h,f){const m=o.explicitOrderBy;if(h.length>m.length)throw new d(l.INVALID_ARGUMENT,`Too many arguments provided to ${c}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);const g=[];for(let v=0;v<h.length;v++){const P=h[v];if(m[v].field.isKeyField()){if(typeof P!="string")throw new d(l.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${c}(), but got a ${typeof P}`);if(!Pn(o)&&P.indexOf("/")!==-1)throw new d(l.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${c}() must be a plain document ID, but '${P}' contains a slash.`);const q=o.path.child(I.fromString(P));if(!T.isDocumentKey(q))throw new d(l.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${c}() must result in a valid document path, but '${q}' is not because it contains an odd number of segments.`);const Dt=new T(q);g.push(Gt(a,Dt))}else{const q=Yn(u,c,P);g.push(q)}}return new jt(g,f)}(n._query,n.firestore._databaseId,i,t,e,r)}}function an(n,t,e){if(typeof(e=N(e))=="string"){if(e==="")throw new d(l.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Pn(t)&&e.indexOf("/")!==-1)throw new d(l.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${e}' contains a '/' character.`);const r=t.path.child(I.fromString(e));if(!T.isDocumentKey(r))throw new d(l.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Gt(n,new T(r))}if(e instanceof y)return Gt(n,e._key);throw new d(l.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Jt(e)}.`)}function un(n,t){if(!Array.isArray(n)||n.length===0)throw new d(l.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${t.toString()}' filters.`)}function sr(n,t){const e=function(i,s){for(const o of i)for(const a of o.getFlattenedFilters())if(s.indexOf(a.op)>=0)return a.op;return null}(n.filters,function(i){switch(i){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(t.op));if(e!==null)throw e===t.op?new d(l.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${t.op.toString()}' filter.`):new d(l.INVALID_ARGUMENT,`Invalid query. You cannot use '${t.op.toString()}' filters with '${e.toString()}' filters.`)}function or(n,t){if(!(t instanceof bt||t instanceof _t))throw new d(l.INVALID_ARGUMENT,`Function ${n}() requires AppliableConstraints created with a call to 'where(...)', 'or(...)', or 'and(...)'.`)}class Vi{convertValue(t,e="none"){switch(nt(t)){case 0:return null;case 1:return t.booleanValue;case 2:return V(t.integerValue||t.doubleValue);case 3:return this.convertTimestamp(t.timestampValue);case 4:return this.convertServerTimestamp(t,e);case 5:return t.stringValue;case 6:return this.convertBytes(Tt(t.bytesValue));case 7:return this.convertReference(t.referenceValue);case 8:return this.convertGeoPoint(t.geoPointValue);case 9:return this.convertArray(t.arrayValue,e);case 11:return this.convertObject(t.mapValue,e);case 10:return this.convertVectorValue(t.mapValue);default:throw _(62114,{value:t})}}convertObject(t,e){return this.convertObjectMap(t.fields,e)}convertObjectMap(t,e="none"){const r={};return Nt(t,(i,s)=>{r[i]=this.convertValue(s,e)}),r}convertVectorValue(t){var r,i,s;const e=(s=(i=(r=t.fields)==null?void 0:r[qt].arrayValue)==null?void 0:i.values)==null?void 0:s.map(o=>V(o.doubleValue));return new U(e)}convertGeoPoint(t){return new j(V(t.latitude),V(t.longitude))}convertArray(t,e){return(t.values||[]).map(r=>this.convertValue(r,e))}convertServerTimestamp(t,e){switch(e){case"previous":const r=Tn(t);return r==null?null:this.convertValue(r,e);case"estimate":return this.convertTimestamp(At(t));default:return null}}convertTimestamp(t){const e=et(t);return new E(e.seconds,e.nanos)}convertDocumentKey(t,e){const r=I.fromString(t);F(Gn(r),9688,{name:t});const i=new It(r.get(1),r.get(3)),s=new T(r.popFirst(5));return i.isEqual(e)||Ht(`A document reference to ${s} refers to a different database (${i.projectId}/${i.database}), which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`),s}}/**
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
 */function oe(n,t,e){let r;return r=n?e&&(e.merge||e.mergeFields)?n.toFirestore(t,e):n.toFirestore(t):t,r}class ae extends Vi{constructor(t){super(),this.firestore=t}convertBytes(t){return new C(t)}convertReference(t){const e=this.convertDocumentKey(t,this.firestore._databaseId);return new y(this.firestore,null,e)}}function rs(n){const t=z((n=x(n,y)).firestore),e=new ae(n.firestore);return Bn(t,[n._key]).then(r=>{F(r.length===1,15618);const i=r[0];return new st(n.firestore,e,n._key,i.isFoundDocument()?i:null,n.converter)})}function is(n){(function(i){if(i.limitType==="L"&&i.explicitOrderBy.length===0)throw new d(l.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")})((n=x(n,O))._query);const t=z(n.firestore),e=new ae(n.firestore);return mi(t,n._query).then(r=>{const i=r.map(s=>new rr(n.firestore,e,s.key,s,n.converter));return n._query.limitType==="L"&&i.reverse(),new ye(n,i)})}function ss(n,t,e){const r=oe((n=x(n,y)).converter,t,e),i=ne(at(n.firestore),"setDoc",n._key,r,n.converter!==null,e);return mt(z(n.firestore),[i.toMutation(n._key,S.none())])}function os(n,t,e,...r){const i=at((n=x(n,y)).firestore);let s;return s=typeof(t=N(t))=="string"||t instanceof pt?Ce(i,"updateDoc",n._key,t,e,r):Oe(i,"updateDoc",n._key,t),mt(z(n.firestore),[s.toMutation(n._key,S.exists(!0))])}function as(n){return mt(z((n=x(n,y)).firestore),[new te(n._key,S.none())])}function us(n,t){const e=yi(n=x(n,M)),r=oe(n.converter,t),i=ne(at(n.firestore),"addDoc",e._key,r,e.converter!==null,{});return mt(z(n.firestore),[i.toMutation(e._key,S.exists(!1))]).then(()=>e)}/**
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
 */function ls(){return new Pt("deleteField")}function cs(){return new Pe("serverTimestamp")}function hs(...n){return new Se("arrayUnion",n)}function ds(...n){return new be("arrayRemove",n)}function fs(n){return new De("increment",n)}function ms(n){return new Fe("minimum",n)}function ps(n){return new ke("maximum",n)}function _s(n){return new U(n)}const ln="4.17.2";/**
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
 */class Me{constructor(){this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}}/**
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
 */class vi{constructor(t,e,r){this.alias=t,this.aggregateType=e,this.fieldPath=r}}/**
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
 */class ar{constructor(t,e,r=1e3,i=1.5,s=6e4){this.t=t,this.timerId=e,this.i=r,this.o=i,this.h=s,this.u=0,this.l=null,this._=Date.now(),this.reset()}reset(){this.u=0}m(){this.u=this.h}A(t){this.cancel();const e=Math.floor(this.u+this.p()),r=Math.max(0,Date.now()-this._),i=Math.max(0,e-r);i>0&&Z("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.u} ms, delay with jitter: ${e} ms, last attempt: ${r} ms ago)`),this.l=this.t.enqueueAfterDelay(this.timerId,i,()=>(this._=Date.now(),t())),this.u*=this.o,this.u<this.i&&(this.u=this.i),this.u>this.h&&(this.u=this.h)}T(){this.l!==null&&(this.l.skipDelay(),this.l=null)}cancel(){this.l!==null&&(this.l.cancel(),this.l=null)}p(){return(Math.random()-.5)*this.u}}/**
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
 */class vt{constructor(t="count",e){this._internalFieldPath=e,this.type="AggregateField",this.aggregateType=t}}class Ni{constructor(t,e,r){this._userDataWriter=e,this._data=r,this.type="AggregateQuerySnapshot",this.query=t}data(){return this._userDataWriter.convertObjectMap(this._data)}_fieldsProto(){return new D({mapValue:{fields:this._data}}).clone().value.mapValue.fields}}/**
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
 */function gs(n){return Ri(n,{count:Pi()})}function Ri(n,t){const e=x(n.firestore,W),r=z(e),i=qr(t,(s,o)=>new vi(o,s.aggregateType,s._internalFieldPath));return pi(r,n._query,i).then(s=>function(a,u,c){const h=new ae(a);return new Ni(u,h,c)}(e,n,s))}function ys(n){return new vt("sum",J("sum",n))}function Es(n){return new vt("avg",J("average",n))}function Pi(){return new vt("count")}function Is(n,t){var e,r;return n instanceof vt&&t instanceof vt&&n.aggregateType===t.aggregateType&&((e=n._internalFieldPath)==null?void 0:e.canonicalString())===((r=t._internalFieldPath)==null?void 0:r.canonicalString())}function Ts(n,t){return Kn(n.query,t.query)&&Qt(n.data(),t.data())}/**
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
 */class Si{constructor(t,e){this._firestore=t,this._commitHandler=e,this._mutations=[],this._committed=!1,this._dataReader=at(t)}set(t,e,r){this._verifyNotCommitted();const i=Y(t,this._firestore),s=oe(i.converter,e,r),o=ne(this._dataReader,"WriteBatch.set",i._key,s,i.converter!==null,r);return this._mutations.push(o.toMutation(i._key,S.none())),this}update(t,e,r,...i){this._verifyNotCommitted();const s=Y(t,this._firestore);let o;return o=typeof(e=N(e))=="string"||e instanceof pt?Ce(this._dataReader,"WriteBatch.update",s._key,e,r,i):Oe(this._dataReader,"WriteBatch.update",s._key,e),this._mutations.push(o.toMutation(s._key,S.exists(!0))),this}delete(t){this._verifyNotCommitted();const e=Y(t,this._firestore);return this._mutations=this._mutations.concat(new te(e._key,S.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new d(l.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function Y(n,t){if((n=N(n)).firestore!==t)throw new d(l.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}function As(n){n=x(n,W);const t=z(n);return new Si(n,e=>mt(t,e))}/**
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
 */let bi=class{constructor(t){this.datastore=t,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(t){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new d(l.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const e=await Bn(this.datastore,t);return e.forEach(r=>this.recordVersion(r)),e}set(t,e){this.write(e.toMutation(t,this.precondition(t))),this.writtenDocs.add(t.toString())}update(t,e){try{this.write(e.toMutation(t,this.preconditionForUpdate(t)))}catch(r){this.lastTransactionError=r}this.writtenDocs.add(t.toString())}delete(t){this.write(new te(t,this.precondition(t))),this.writtenDocs.add(t.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const t=this.readVersions;this.mutations.forEach(e=>{t.delete(e.key.toString())}),t.forEach((e,r)=>{const i=T.fromPath(r);this.mutations.push(new Mn(i,this.precondition(i)))}),await mt(this.datastore,this.mutations),this.committed=!0}recordVersion(t){let e;if(t.isFoundDocument())e=t.version;else{if(!t.isNoDocument())throw _(50498,{R:t.constructor.name});e=A.min()}const r=this.readVersions.get(t.key.toString());if(r){if(!e.isEqual(r))throw new d(l.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(t.key.toString(),e)}precondition(t){const e=this.readVersions.get(t.toString());return!this.writtenDocs.has(t.toString())&&e?e.isEqual(A.min())?S.exists(!1):S.updateTime(e):S.none()}preconditionForUpdate(t){const e=this.readVersions.get(t.toString());if(!this.writtenDocs.has(t.toString())&&e){if(e.isEqual(A.min()))throw new d(l.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return S.updateTime(e)}return S.exists(!0)}write(t){this.ensureCommitNotCalled(),this.mutations.push(t)}ensureCommitNotCalled(){}};/**
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
 */const Di={maxAttempts:5};/**
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
 */class Fi{constructor(t,e,r,i,s){this.asyncQueue=t,this.datastore=e,this.options=r,this.updateFunction=i,this.deferred=s,this.I=r.maxAttempts,this.P=new ar(this.asyncQueue,"transaction_retry")}V(){this.I-=1,this.D()}D(){this.P.A(async()=>{const t=new bi(this.datastore),e=this.v(t);e&&e.then(r=>{this.asyncQueue.enqueueAndForget(()=>t.commit().then(()=>{this.deferred.resolve(r)}).catch(i=>{this.F(i)}))}).catch(r=>{this.F(r)})})}v(t){try{const e=this.updateFunction(t);return!In(e)&&e.catch&&e.then?e:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(e){return this.deferred.reject(e),null}}F(t){this.I>0&&this.B(t)?(this.I-=1,this.asyncQueue.enqueueAndForget(()=>(this.D(),Promise.resolve()))):this.deferred.reject(t)}B(t){if((t==null?void 0:t.name)==="FirebaseError"){const e=t.code;return e==="aborted"||e==="failed-precondition"||e==="already-exists"||!xr(e)}return!1}}/**
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
 */function he(){return typeof document<"u"?document:null}/**
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
 */class qe{constructor(t,e,r,i,s){this.asyncQueue=t,this.timerId=e,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new Me,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(t,e,r,i,s){const o=Date.now()+r,a=new qe(t,e,o,i,s);return a.start(r),a}start(t){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),t)}skipDelay(){return this.handleDelayElapsed()}cancel(t){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new d(l.CANCELLED,"Operation cancelled"+(t?": "+t:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(t=>this.deferred.resolve(t))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}/**
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
 */const cn="AsyncQueue";class ki{constructor(t=Promise.resolve()){this.k=[],this.O=!1,this.S=[],this.q=null,this.C=!1,this.M=!1,this.N=[],this.P=new ar(this,"async_queue_retry"),this.L=()=>{const r=he();r&&Z(cn,"Visibility state changed to "+r.visibilityState),this.P.T()},this.W=t;const e=he();e&&typeof e.addEventListener=="function"&&e.addEventListener("visibilitychange",this.L)}get isShuttingDown(){return this.O}enqueueAndForget(t){this.enqueue(t)}enqueueAndForgetEvenWhileRestricted(t){this.U(),this.j(t)}enterRestrictedMode(t){if(!this.O){this.O=!0,this.M=t||!1;const e=he();e&&typeof e.removeEventListener=="function"&&e.removeEventListener("visibilitychange",this.L)}}enqueue(t){if(this.U(),this.O)return new Promise(()=>{});const e=new Me;return this.j(()=>this.O&&this.M?Promise.resolve():(t().then(e.resolve,e.reject),e.promise)).then(()=>e.promise)}enqueueRetryable(t){this.enqueueAndForget(()=>(this.k.push(t),this.$()))}async $(){if(this.k.length!==0){try{await this.k[0](),this.k.shift(),this.P.reset()}catch(t){if(!function(r){return r.name==="IndexedDbTransactionError"}(t))throw t;Z(cn,"Operation failed with retryable error: "+t)}this.k.length>0&&this.P.A(()=>this.$())}}j(t){const e=this.W.then(()=>(this.C=!0,t().catch(r=>{this.q=r,this.C=!1;const i=hn(r);throw Ht("INTERNAL UNHANDLED ERROR: ",i),r}).then(r=>(this.C=!1,r))));return this.W=e,e}enqueueAfterDelay(t,e,r){this.U(),this.N.indexOf(t)>-1&&(e=0);const i=qe.createAndSchedule(this,t,e,r,s=>this.G(s));return this.S.push(i),i}U(){this.q&&_(47125,{H:hn(this.q)})}verifyOperationInProgress(){}async J(){let t;do t=this.W,await t;while(t!==this.W)}K(t){for(const e of this.S)if(e.timerId===t)return!0;return!1}X(t){return this.J().then(()=>{this.S.sort((e,r)=>e.targetTimeMs-r.targetTimeMs);for(const e of this.S)if(e.skipDelay(),t!=="all"&&e.timerId===t)break;return this.J()})}Y(t){this.N.push(t)}G(t){const e=this.S.indexOf(t);this.S.splice(e,1)}}function hn(n){let t=n.message||"";return n.stack&&(t=n.stack.includes(n.message)?n.stack:n.message+`
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
 */class Oi{constructor(t,e){this._firestore=t,this._transaction=e,this._dataReader=at(t)}get(t){const e=Y(t,this._firestore),r=new ae(this._firestore);return this._transaction.lookup([e._key]).then(i=>{if(!i||i.length!==1)return _(24041);const s=i[0];if(s.isFoundDocument())return new st(this._firestore,r,s.key,s,e.converter);if(s.isNoDocument())return new st(this._firestore,r,e._key,null,e.converter);throw _(18433,{doc:s})})}set(t,e,r){const i=Y(t,this._firestore),s=oe(i.converter,e,r),o=ne(this._dataReader,"Transaction.set",i._key,s,i.converter!==null,r);return this._transaction.set(i._key,o),this}update(t,e,r,...i){const s=Y(t,this._firestore);let o;return o=typeof(e=N(e))=="string"||e instanceof pt?Ce(this._dataReader,"Transaction.update",s._key,e,r,i):Oe(this._dataReader,"Transaction.update",s._key,e),this._transaction.update(s._key,o),this}delete(t){const e=Y(t,this._firestore);return this._transaction.delete(e._key),this}}function Vs(n,t,e){n=x(n,W);const r=z(n),i={...Di,...e};(function(a){if(a.maxAttempts<1)throw new d(l.INVALID_ARGUMENT,"Max attempts must be at least 1")})(i);const s=new Me;return new Fi(function(){return new ki}(),r,i,o=>t(new Oi(n,o)),s).V(),s.promise}/**
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
 */(function(){Tr(`${Er}_lite`),gr(new yr("firestore/lite",(t,{instanceIdentifier:e,options:r})=>{const i=t.getProvider("app").getImmediate(),s=new W(new Vr(t.getProvider("auth-internal")),new Rr(i,t.getProvider("app-check-internal")),Sr(i,e),i);return r&&s._setSettings(r),s},"PUBLIC").setMultipleInstances(!0)),$e("firestore-lite",ln,""),$e("firestore-lite",ln,"esm2020")})();export{vt as AggregateField,Ni as AggregateQuerySnapshot,C as Bytes,M as CollectionReference,y as DocumentReference,st as DocumentSnapshot,pt as FieldPath,K as FieldValue,W as Firestore,d as FirestoreError,j as GeoPoint,O as Query,_t as QueryCompositeFilterConstraint,St as QueryConstraint,rr as QueryDocumentSnapshot,se as QueryEndAtConstraint,bt as QueryFieldFilterConstraint,re as QueryLimitConstraint,xe as QueryOrderByConstraint,ye as QuerySnapshot,ie as QueryStartAtConstraint,E as Timestamp,Oi as Transaction,U as VectorValue,Si as WriteBatch,us as addDoc,Is as aggregateFieldEqual,Ts as aggregateQuerySnapshotEqual,Hi as and,ds as arrayRemove,hs as arrayUnion,Es as average,Gi as collection,ji as collectionGroup,gi as connectFirestoreEmulator,Pi as count,as as deleteDoc,ls as deleteField,yi as doc,zi as documentId,ns as endAt,es as endBefore,Ri as getAggregate,gs as getCount,rs as getDoc,is as getDocs,qi as getFirestore,fs as increment,Mi as initializeFirestore,Yi as limit,Xi as limitToLast,ps as maximum,ms as minimum,Qi as or,Ji as orderBy,Wi as query,Kn as queryEqual,Bi as refEqual,Vs as runTransaction,cs as serverTimestamp,ss as setDoc,Ui as setLogLevel,wi as snapshotEqual,ts as startAfter,Zi as startAt,ys as sum,$i as terminate,os as updateDoc,_s as vector,Ki as where,As as writeBatch};
