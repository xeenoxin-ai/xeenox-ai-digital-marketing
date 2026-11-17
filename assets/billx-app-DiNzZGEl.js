const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./subscription-C6P_32iL.js","./plans-DOwXfloS.js","./session-BFvT1bF-.js","./index.esm-CIxl6DF6.js","./index.esm-CtpscmOZ.js","./index.esm-DbjkYzeo.js","./bloom_blob_es2018-BgEMCAT0.js","./firebase-DqiAbLcZ.js","./index.esm-S3lCh42Z.js","./config-BIi44hYM.js","./access-Bs4tIRgd.js","./templates-UjNXZVn3.js","./templates-DdWbgzsA.css","./pay-details-BeCEpv1M.js","./site-DEmB1ocq.js","./ui-eLZoGku3.js","./modulepreload-polyfill-B5Qt9EMX.js","./preload-helper-C1FmrZbK.js","./helpers-DTObPCJx.js","./logo-CtwRhacI.js","./portal-codec-7epzrYuT.js","./invoice-CLLushqy.css","./auth-view-DMhIVki1.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill-B5Qt9EMX.js";import{_ as he}from"./preload-helper-C1FmrZbK.js";import{e as l,I as ie,A as Lt,s as _,B as ee,a as P,y as V,z as te,x as Re,S as qe,C as Se,E as st,h as nt,F as it,G as ot,H as re,i as O,J as $e,K as ae,L as z,M as He,N as ge,O as le,P as Le,T as ke,Q as Ct,R as Ge,U as Tt,w as lt,V as Et,u as qt,q as It,D as Nt,W as Dt,X as Bt,Y as At,Z as We,_ as Pt,$ as jt,a0 as Mt,a1 as Ot,a2 as Ft,a3 as Rt,l as Ht,o as Ut,a4 as _t,a5 as Gt,a6 as Wt,a7 as Vt,t as Yt}from"./templates-UjNXZVn3.js";/* empty css                */import{i as g,b as W,g as fe,f as k,o as H,$,t as I,e as Z,p as ue,m as se,c as ct,S as dt,a as Ce,d as Te,h as Qt,r as rt}from"./ui-eLZoGku3.js";import{c as ut}from"./config-BIi44hYM.js";import{d as de,m as x,c as X,a as pt,b as ce,s as Jt,t as mt}from"./helpers-DTObPCJx.js";import{l as Kt}from"./logo-CtwRhacI.js";import{e as zt,p as Xt}from"./portal-codec-7epzrYuT.js";const bt=[];let Ee=!1,ht=location.hash,Ie=!1;function J(e,n){bt.push({parts:e.split("/").filter(Boolean),view:n})}function Zt(e,n){const s=n.split("/").filter(Boolean),t={};if(s.length>e.length)return null;for(let c=0;c<e.length;c++){const a=e[c],i=s[c];if(a.startsWith(":")){const b=a.endsWith("?"),m=a.slice(1).replace("?","");if(i===void 0){if(!b)return null;t[m]="";continue}t[m]=decodeURIComponent(i)}else if(a!==i)return null}return t}const Q=e=>{Ee=e};function G(e,{replace:n=!1}={}){n?(history.replaceState(null,"",e),ve()):location.hash===e?ve():location.hash=e}function K(e,n=""){document.getElementById("pageTitle").textContent=e,document.getElementById("pageActions").innerHTML=n,document.title=`${e} · BillX`}function ve(){const[e,n]=(location.hash.slice(1)||"/").split("?"),s=new URLSearchParams(n||""),t=document.getElementById("view");for(const c of bt){const a=Zt(c.parts,e);if(a){Ee=!1,ht=location.hash,document.querySelectorAll(".nav a").forEach(i=>{const b=i.getAttribute("href").split("/")[1];i.classList.toggle("on",e.split("/")[1]===b||b==="docs"&&["doc","edit","new"].includes(e.split("/")[1])||b==="clients"&&e.split("/")[1]==="client")}),document.body.classList.remove("nav-open"),document.querySelectorAll("dialog.modal").forEach(i=>i.remove()),t.scrollTop=0,window.scrollTo(0,0);try{c.view(t,a,s)}catch(i){console.error(i),t.innerHTML=`<div class="empty"><p>Something went wrong showing this page.</p><pre class="err">${l(i.message)}</pre><a class="btn" href="#/">Go to dashboard</a></div>`}return}}G("#/",{replace:!0})}function ea(){window.addEventListener("hashchange",()=>{if(Ie){Ie=!1;return}if(Ee&&!confirm("You have unsaved changes. Leave without saving?")){Ie=!0,location.hash=ht;return}ve()}),window.addEventListener("beforeunload",e=>{Ee&&(e.preventDefault(),e.returnValue="")}),ve()}function ft(e,n="industry"){const s=Object.keys(ie).length;return`<div class="sector-picker">
    <div class="search sp-search">${g("search",16)}<input type="search" data-sp-q placeholder="Search ${s} business types: salon, garage, school, jewellery, transport…" aria-label="Search business types"></div>
    ${Lt().map(([t,c])=>`<div class="sp-group">
      <h4>${l(t)}</h4>
      <div class="ind-grid">${c.map(([a,i])=>{const b=[i.name,t,i.clientLabel,i.docTitle,...i.items.map(m=>m[0]),...i.fields.map(m=>m.label),...i.clientFields.map(m=>m.label),...i.itemCols.map(m=>m.label)].join(" ").toLowerCase();return`<label class="ind${a===e?" on":""}" data-s="${l(b)}"><input type="radio" name="${n}" value="${a}" ${a===e?"checked":""}>
        <b>${l(i.name)}</b><small>${l(i.clientLabel)}s · ${l(i.docTitle)}</small></label>`}).join("")}</div></div>`).join("")}
    <p class="muted small sp-none" hidden>No match. Pick <b>Custom (build your own)</b> and add your own fields.</p>
  </div>`}function vt(e,n){const s=e.querySelector("[data-sp-q]");s.addEventListener("input",()=>{const t=s.value.trim().toLowerCase();let c=0;W(".sp-group",e).forEach(a=>{let i=0;W(".ind",a).forEach(b=>{const m=!t||t.split(/\s+/).every(h=>b.dataset.s.includes(h));b.hidden=!m,m&&i++}),a.hidden=!i,c+=i}),e.querySelector(".sp-none").hidden=c>0}),s.addEventListener("keydown",t=>{t.key==="Enter"&&t.preventDefault()}),e.addEventListener("change",t=>{t.target.matches(".ind input")&&(W(".ind",e).forEach(c=>c.classList.toggle("on",c.contains(t.target))),n&&n(t.target.value))})}function ta(e){const n=_();if(!n.onboarded)return aa(e);K("Dashboard",`<a class="btn qb-cta" href="#/pos">${g("zap")} Quick Bill</a>
    <a class="btn" href="#/new/quote">${g("plus")}<span class="hide-sm"> Quote</span></a>
    <a class="btn primary" href="#/new/invoice">${g("plus")} New ${l((n.docTitles.invoice||"Invoice").toLowerCase())}</a>`);const s=ee(),t=s.slice(0,7),c=de(w=>w.status!=="cancelled"&&w.status!=="draft"),a=c.filter(w=>w.d.type==="invoice"),i=a.filter(w=>w.d.date.startsWith(t)),b=(w,A)=>w.reduce((u,y)=>u+A(y),0),m=a.filter(w=>w.status==="overdue"),h=b(a,w=>Math.max(w.t.balance,0)),o=a.reduce((w,A)=>w+(A.d.payments||[]).filter(u=>(u.date||"").startsWith(t)).reduce((u,y)=>u+Number(y.amount||0),0),0),d=c.filter(w=>w.d.type==="quote"&&w.status==="awaiting"),f=[],[C,N]=s.split("-").map(Number);for(let w=5;w>=0;w--){const A=new Date(Date.UTC(C,N-1-w,1));f.push(A.toISOString().slice(0,7))}const T=f.map(w=>({k:w,billed:b(a.filter(A=>A.d.date.startsWith(w)),A=>A.t.total),paid:a.reduce((A,u)=>A+(u.d.payments||[]).filter(y=>(y.date||"").startsWith(w)).reduce((y,p)=>y+Number(p.amount||0),0),0)})),B=Math.max(1,...T.map(w=>Math.max(w.billed,w.paid))),M=560,F=180,q=M/T.length,U=T.map((w,A)=>{const u=w.billed/B*(F-30),y=w.paid/B*(F-30),p=new Date(`${w.k}-01T00:00:00`).toLocaleDateString("en-GB",{month:"short"});return`<g><title>${p}: billed ${x(w.billed)}, received ${x(w.paid)}</title>
      <rect x="${A*q+q*.18}" y="${F-20-u}" width="${q*.3}" height="${u}" rx="3" class="c-billed"/>
      <rect x="${A*q+q*.52}" y="${F-20-y}" width="${q*.3}" height="${y}" rx="3" class="c-paid"/>
      <text x="${A*q+q/2}" y="${F-4}" text-anchor="middle">${p}</text></g>`}).join(""),R=de().slice(0,8),Y=a.filter(w=>["sent","partial","overdue"].includes(w.status)).sort((w,A)=>(w.d.dueDate||"").localeCompare(A.d.dueDate||"")).slice(0,6),ne=!P("docs").length;e.innerHTML=`
    ${ne?`<section class="card hero">
      <h2>Welcome, ${l(n.business.name)}</h2>
      <p>Create your first ${l((n.docTitles.invoice||"invoice").toLowerCase())} in under a minute. Your logo, UPI QR and design are applied automatically.</p>
      <div class="row-gap wrap"><a class="btn primary" href="#/new/invoice">${g("plus")} Create ${l((n.docTitles.invoice||"invoice").toLowerCase())}</a>
      <a class="btn" href="#/settings">${g("settings")} Complete business profile</a><a class="btn" href="#/design">${g("palette")} Choose a design</a></div>
    </section>`:""}
    <div class="kpis">
      <div class="kpi"><span>Billed this month</span><b>${x(b(i,w=>w.t.total))}</b><small>${i.length} ${l(V.invoice.plural.toLowerCase())}</small></div>
      <div class="kpi good"><span>Received this month</span><b>${x(o)}</b></div>
      <div class="kpi warn"><span>Outstanding</span><b>${x(h)}</b><small>${a.filter(w=>w.t.balance>.004).length} unpaid</small></div>
      <a class="kpi bad" href="#/docs/invoice?status=overdue"><span>Overdue</span><b>${x(b(m,w=>w.t.balance))}</b><small>${m.length} invoices</small></a>
      <a class="kpi" href="#/docs/quote?status=awaiting"><span>Open quotes</span><b>${x(b(d,w=>w.t.total))}</b><small>${d.length} waiting</small></a>
    </div>
    <div class="two-col">
      <section class="card">
        <div class="row-between"><h3>Last 6 months</h3><span class="legend"><i></i> Billed <i class="paid"></i> Received</span></div>
        <svg class="chart" viewBox="0 0 ${M} ${F}" role="img" aria-label="Billed and received per month">${U}</svg>
      </section>
      <section class="card">
        <h3>Waiting for payment</h3>
        ${Y.length?Y.map(({d:w,t:A,status:u})=>`<a class="list-row" href="#/doc/${w.id}">
          <span><b>${l(w.client?w.client.name:"—")}</b><small>${l(w.number)} · due ${te(w.dueDate)}</small></span>
          <span class="right">${x(A.balance)}${fe(u)}</span></a>`).join(""):'<p class="muted">Nothing outstanding. 🎉</p>'}
      </section>
    </div>
    <section class="card">
      <div class="row-between"><h3>Recent documents</h3><a href="#/docs/all">See all</a></div>
      ${R.length?`<div class="table-wrap"><table class="table"><thead><tr><th>Number</th><th>${l(X())}</th><th>Date</th><th class="num">Amount</th><th>Status</th></tr></thead>
      <tbody>${R.map(({d:w,t:A,status:u})=>`<tr class="link" data-id="${w.id}"><td><b>${l(w.number)}</b><div class="sub">${l(V[w.type].name)}</div></td>
        <td>${l(w.client?w.client.name:"—")}</td><td>${te(w.date)}</td><td class="num">${x(A.payable)}</td><td>${fe(u)}</td></tr>`).join("")}</tbody></table></div>`:'<p class="muted">No documents yet.</p>'}
    </section>`,W("tr.link",e).forEach(w=>w.addEventListener("click",()=>G(`#/doc/${w.dataset.id}`)))}function Ve(e){const n=ie[e];if(!n)return"";if(n.custom)return"Start blank: add your own bill fields, customer fields and item columns in Settings → Fields on your bills.";const s=[`${n.clientLabel}s`,n.docTitle,n.fields.length?`bill fields: ${n.fields.map(t=>t.label).join(", ")}`:"",n.clientFields.length?`${n.clientLabel.toLowerCase()} fields: ${n.clientFields.map(t=>t.label).join(", ")}`:"",n.itemCols.filter(t=>!t.hidden).length?`item columns: ${n.itemCols.filter(t=>!t.hidden).map(t=>t.label).join(", ")}`:"",`${n.items.length} starter items`,`${n.tax}% tax`].filter(Boolean);return`<b>${l(n.name)}</b> · ${l(s.join(" · "))}. You can change all of it later.`}function aa(e){const n=_(),s=Re().filter(a=>!a.active);K("Set up BillX",""),document.body.classList.add("onboarding"),e.innerHTML=`
  <form class="onboard" id="ob">
    <div class="onboard-head"><img src="${Kt}" alt="" width="48" height="48"><div><h1>${s.length?"Add a business to BillX":"Welcome to BillX"}</h1>
    <p>Billing &amp; invoicing for every kind of business. Pick your type and BillX prepares the fields, labels, tax, starter items and invoice design. Not listed? Choose <b>Custom</b> and build your own.</p></div></div>
    ${ft(n.industry||"general")}
    <p class="sp-info" id="spInfo">${Ve(n.industry||"general")}</p>
    <div class="grid g3">
      ${k("Business name",`<input name="name" placeholder="e.g. Sunrise Traders" value="${n.business.name==="Your Business Name"?"":l(n.business.name)}">`)}
      ${k("State",`<select name="state">${H(qe.map(([a,i])=>[a,i]),n.business.state)}</select>`)}
      ${k("Currency",`<select name="currency">${H(Object.keys(Se).map(a=>[a,`${a} (${Se[a].symbol})`]),n.currency)}</select>`)}
    </div>
    <div class="row-gap wrap end">
      ${s.length?'<button type="button" class="btn ghost" id="obCancel">Cancel</button>':""}
      <button class="btn" value="sample">${g("eye")} Explore with sample data</button>
      <button class="btn primary" value="start">${g("check")} Start billing</button>
    </div>
  </form>`;const t=$("#ob",e);vt(t,a=>{$("#spInfo",t).innerHTML=Ve(a)});const c=$("#obCancel",t);c&&c.addEventListener("click",()=>{st(nt()),document.body.classList.remove("onboarding"),location.hash="#/",location.reload()}),t.addEventListener("submit",a=>{a.preventDefault();const i=new FormData(t),b=i.get("industry")||"general",m=a.submitter&&a.submitter.value==="sample";m?it(b):ot(b),i.get("name")&&(n.business.name=i.get("name").trim()),m||(n.business.state=i.get("state")),n.currency=i.get("currency"),n.currency!=="INR"&&(n.taxMode="simple"),n.onboarded=!0,re(),O(),document.body.classList.remove("onboarding"),location.hash="#/",location.reload()})}function Pe(e){const n=_(),s=$e(n),t=e.extra||{};return`<div class="grid g2">
    ${k("Name *",`<input name="name" required value="${l(e.name||"")}">`)}
    ${k("Company / organisation",`<input name="company" value="${l(e.company||"")}">`)}
    ${k("Phone / WhatsApp",`<input name="phone" type="tel" value="${l(e.phone||"")}">`)}
    ${k("Email",`<input name="email" type="email" value="${l(e.email||"")}">`)}
    ${s.clientFields.map(c=>k(c.label,c.options?`<select name="x_${c.key}">${H(c.options.map(a=>[a,a||"—"]),t[c.key]||"")}</select>`:`<input name="x_${c.key}" value="${l(t[c.key]||"")}">`)).join("")}
    ${n.taxMode!=="none"?k("GSTIN / Tax ID",`<input name="gstin" value="${l(e.gstin||"")}" maxlength="15" style="text-transform:uppercase">`):""}
    ${k("Address",`<textarea name="address" rows="2">${l(e.address||"")}</textarea>`,"span2")}
    ${k("City",`<input name="city" value="${l(e.city||"")}">`)}
    ${k("PIN code",`<input name="pincode" value="${l(e.pincode||"")}">`)}
    ${k("State",`<select name="state">${H(qe.map(([c,a])=>[c,a]),e.state||n.business.state)}</select>`)}
    ${k("Shipping address (if different)",`<textarea name="shipAddress" rows="2">${l(e.shipAddress||"")}</textarea>`)}
    ${k("Private notes",`<textarea name="notes" rows="2">${l(e.notes||"")}</textarea>`,"span2")}
  </div>`}function je(e,n){const s={...n,extra:{...n.extra||{}}};for(const[t,c]of e.entries())t.startsWith("x_")?s.extra[t.slice(2)]=String(c).trim():s[t]=String(c).trim();return s.gstin&&(s.gstin=s.gstin.toUpperCase()),s}function sa(e,n,s){const t=X(),c=(s.get("q")||"").toLowerCase(),a=$e(_()).clientFields[0];K(`${t}s`,`<a class="btn primary" href="#/client/new">${g("plus")} New ${l(t.toLowerCase())}</a>`);const i=P("clients").filter(m=>!c||[m.name,m.company,m.phone,m.email,m.gstin,...Object.values(m.extra||{})].some(h=>String(h||"").toLowerCase().includes(c))).map(m=>({c:m,b:pt(m.id)})).sort((m,h)=>h.b.outstanding-m.b.outstanding||m.c.name.localeCompare(h.c.name));e.innerHTML=`
    <div class="toolbar"><div class="search">${g("search",16)}<input id="q" type="search" placeholder="Search name, phone, ${a?l(a.label):"GSTIN"}" value="${l(c)}"></div></div>
    ${i.length?`<div class="table-wrap"><table class="table">
      <thead><tr><th>Name</th><th>Contact</th><th class="num">Billed</th><th class="num">Outstanding</th></tr></thead>
      <tbody>${i.map(({c:m,b:h})=>`<tr class="link" data-id="${m.id}">
        <td><b>${l(m.name)}</b>${m.company&&m.company!==m.name?`<div class="sub">${l(m.company)}</div>`:""}${a&&m.extra&&m.extra[a.key]?`<div class="sub">${l(a.label)}: ${l(m.extra[a.key])}</div>`:""}</td>
        <td>${l(m.phone||"")}<div class="sub">${l(m.email||"")}</div></td>
        <td class="num">${x(h.billed)}</td>
        <td class="num ${h.outstanding>.5?"due":""}">${x(h.outstanding)}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">${g("users",40)}<p>No ${l(t.toLowerCase())}s yet.</p><a class="btn primary" href="#/client/new">${g("plus")} Add ${l(t.toLowerCase())}</a></div>`}`;let b;$("#q",e).addEventListener("input",m=>{clearTimeout(b),b=setTimeout(()=>{G(`#/clients${m.target.value?`?q=${encodeURIComponent(m.target.value)}`:""}`,{replace:!0});const h=$("#q");h.focus(),h.setSelectionRange(h.value.length,h.value.length)},250)}),W("tr.link",e).forEach(m=>m.addEventListener("click",()=>G(`#/client/${m.dataset.id}`)))}function $t(e,n){const s=X(),t=n.id==="new",c=t?{}:ae("clients",n.id);if(!c){e.innerHTML='<div class="empty"><p>Not found.</p></div>',K("Not found");return}if(t){K(`New ${s.toLowerCase()}`,""),e.innerHTML=`<form class="card narrow" id="cform">${Pe(c)}
      <div class="row-gap end"><a class="btn" href="#/clients">Cancel</a><button class="btn primary">${g("check")} Save</button></div></form>`,$("#cform",e).addEventListener("input",()=>Q(!0)),$("#cform",e).addEventListener("submit",b=>{b.preventDefault();const m=z("clients",je(new FormData(b.target),{}));O(),Q(!1),I(`${s} saved`),G(`#/client/${m.id}`)});return}const a=pt(c.id),i=de(b=>b.clientId===c.id);K(c.name,`
    <a class="btn" href="#/new/invoice?client=${c.id}">${g("plus")}<span class="hide-sm"> Invoice</span></a>
    <a class="btn" href="#/new/quote?client=${c.id}">${g("plus")}<span class="hide-sm"> Quote</span></a>
    <button class="btn primary" id="portalBtn">${g("globe")}<span class="hide-sm"> Client portal</span></button>`),e.innerHTML=`
    <div class="kpis">
      <div class="kpi"><span>Billed</span><b>${x(a.billed)}</b></div>
      <div class="kpi"><span>Received</span><b>${x(a.paid)}</b></div>
      ${a.credit?`<div class="kpi"><span>Credit notes</span><b>${x(a.credit)}</b></div>`:""}
      <div class="kpi ${a.outstanding>.5?"warn":"good"}"><span>Outstanding</span><b>${x(a.outstanding)}</b></div>
    </div>
    <div class="two-col">
      <section class="card">
        <div class="row-between"><h3>Documents</h3><button class="btn ghost" id="printStmt">${g("print")} Print all unpaid</button></div>
        ${i.length?`<div class="table-wrap"><table class="table">
          <thead><tr><th>Number</th><th>Date</th><th class="num">Amount</th><th class="num">Balance</th><th>Status</th></tr></thead>
          <tbody>${i.map(({d:b,t:m,status:h})=>`<tr class="link" data-doc="${b.id}"><td><b>${l(b.number)}</b><div class="sub">${l(V[b.type].name)}</div></td>
            <td>${te(b.date)}</td><td class="num">${x(m.payable)}</td><td class="num">${b.type==="invoice"?x(Math.max(m.balance,0)):"–"}</td><td>${fe(h)}</td></tr>`).join("")}</tbody></table></div>`:'<p class="muted">No documents yet.</p>'}
      </section>
      <form class="card" id="cform"><h3>Details</h3>${Pe(c)}
        <div class="row-gap end"><button type="button" class="btn danger-text" id="delC">${g("trash")} Delete</button><button class="btn primary">${g("check")} Save changes</button></div>
      </form>
    </div>`,W("tr[data-doc]",e).forEach(b=>b.addEventListener("click",()=>G(`#/doc/${b.dataset.doc}`))),$("#cform",e).addEventListener("input",()=>Q(!0)),$("#cform",e).addEventListener("submit",b=>{b.preventDefault(),z("clients",je(new FormData(b.target),c)),O(),Q(!1),I("Saved"),$t(e,n)}),$("#delC",e).addEventListener("click",async()=>{await Z(`Delete ${c.name}?`,`Their documents stay (with the ${s.toLowerCase()} details copied on them).`)&&(He("clients",c.id),O(),Q(!1),G("#/clients"))}),$("#printStmt",e).addEventListener("click",()=>{const b=i.filter(m=>["sent","partial","overdue"].includes(m.status)).map(m=>m.d);if(!b.length)return I("Nothing unpaid","err");ue(b,_())}),$("#portalBtn").addEventListener("click",()=>na(c))}async function na(e){const n=P("docs").filter(b=>b.clientId===e.id&&b.status!=="draft"),s=_(),t=se({title:`Client portal · ${e.name}`,submit:"",cancel:"Close",wide:!0,body:`<p class="muted">One private link with every issued document for ${l(e.name)} (${n.length}): statement, outstanding balance, view & download each bill, pay by UPI, and confirm payment or accept quotes by WhatsApp. The data travels in the link; send a fresh link after you add new bills.</p>
      <div class="share-link"><input id="pUrl" readonly value="Preparing link…"><button type="button" class="btn" id="pCopy">${g("copy")} Copy</button></div>
      <div class="share-btns"><a class="btn whatsapp" id="pWa" target="_blank" rel="noopener">${g("whatsapp")} WhatsApp</a>
      <a class="btn" id="pMail">${g("mail")} Email</a><a class="btn" id="pOpen" target="_blank" rel="noopener">${g("globe")} Open portal</a></div>`});if(!n.length){$("#pUrl",t.el).value="Issue a document first (drafts are not shared).";return}const c=await gt(e,n),a=`Hello ${e.name},

Your account with ${s.business.name}: view all your bills, balance and pay online here:
${c}

Thank you.`,i=String(e.phone||"").replace(/\D/g,"");$("#pUrl",t.el).value=c,$("#pWa",t.el).href=`https://wa.me/${i.length===10?`91${i}`:i}?text=${encodeURIComponent(a)}`,$("#pMail",t.el).href=`mailto:${encodeURIComponent(e.email||"")}?subject=${encodeURIComponent(`Your account - ${s.business.name}`)}&body=${encodeURIComponent(a)}`,$("#pOpen",t.el).href=c,$("#pCopy",t.el).addEventListener("click",async()=>{await ct(c)&&I("Link copied")})}const ia=["all","draft","sent","partial","overdue","paid","awaiting","accepted","cancelled"];function oa(e,n,s){const t=n.type||"all",c=s.get("status")||"all",a=(s.get("q")||"").toLowerCase();K(t==="all"?"All documents":V[t].plural,`
    <a class="btn primary" href="#/new/${t==="all"?"invoice":t}">${g("plus")} New ${t==="all"?"invoice":V[t].name.toLowerCase()}</a>`);const i=de(d=>t==="all"||d.type===t).filter(d=>c==="all"||d.status===c||c==="sent"&&d.status==="sent").filter(d=>!a||[d.d.number,d.d.client&&d.d.client.name,d.d.client&&d.d.client.company,d.d.reference].some(f=>String(f||"").toLowerCase().includes(a))),b=i.reduce((d,f)=>f.status==="cancelled"?d:{total:d.total+f.t.payable,due:d.due+(f.d.type==="invoice"?Math.max(f.t.balance,0):0)},{total:0,due:0}),m=[["all","All"],...Object.entries(V).map(([d,f])=>[d,f.plural])];e.innerHTML=`
    <div class="tabs" role="tablist">${m.map(([d,f])=>`<a role="tab" class="tab${d===t?" on":""}" href="#/docs/${d}">${l(f)}</a>`).join("")}</div>
    <div class="toolbar">
      <div class="search">${g("search",16)}<input id="q" type="search" placeholder="Search number, ${l(X().toLowerCase())}, reference" value="${l(a)}"></div>
      <div class="chips">${ia.map(d=>`<button class="chip${d===c?" on":""}" data-status="${d}">${d==="all"?"All":dt[d]}</button>`).join("")}</div>
    </div>
    <div class="sumline">${i.length} document${i.length===1?"":"s"} · Total <b>${x(b.total)}</b> · Outstanding <b>${x(b.due)}</b></div>
    ${i.length?`<div class="table-wrap"><table class="table">
      <thead><tr><th>Number</th><th>${l(X())}</th><th>Date</th><th>Due</th><th class="num">Amount</th><th class="num">Balance</th><th>Status</th></tr></thead>
      <tbody>${i.map(({d,t:f,status:C})=>`
        <tr class="link" data-id="${d.id}">
          <td><b>${l(d.number)}</b><div class="sub">${l(V[d.type].name)}</div></td>
          <td>${l(d.client&&d.client.name||"—")}${d.client&&d.client.company&&d.client.company!==d.client.name?`<div class="sub">${l(d.client.company)}</div>`:""}</td>
          <td>${te(d.date)}</td><td>${te(d.dueDate)}</td>
          <td class="num">${x(f.payable)}</td>
          <td class="num">${d.type==="invoice"?x(Math.max(f.balance,0)):"–"}</td>
          <td>${fe(C)}</td>
        </tr>`).join("")}</tbody></table></div>`:`<div class="empty">${g("file",40)}<p>No documents here yet.</p><a class="btn primary" href="#/new/${t==="all"?"invoice":t}">${g("plus")} Create one</a></div>`}`;const h=d=>{const f=new URLSearchParams(s);Object.entries(d).forEach(([N,T])=>T&&T!=="all"?f.set(N,T):f.delete(N));const C=f.toString();G(`#/docs/${t}${C?`?${C}`:""}`,{replace:!0})};W(".chip",e).forEach(d=>d.addEventListener("click",()=>h({status:d.dataset.status})));let o;$("#q",e).addEventListener("input",d=>{clearTimeout(o),o=setTimeout(()=>{h({q:d.target.value.trim()});const f=$("#q");f&&(f.focus(),f.setSelectionRange(f.value.length,f.value.length))},250)}),W("tr.link",e).forEach(d=>d.addEventListener("click",()=>G(`#/doc/${d.dataset.id}`)))}let be=null;function Ne(e){be=e,G(`#/new/${e.type}?draft=1`)}const la=(e,n,s)=>{const t=n.split(".");let c=e;t.slice(0,-1).forEach(a=>{c[a]=c[a]||{},c=c[a]}),c[t.at(-1)]=s};function Ye(e){return e==="quote"||e==="proforma"?["draft","sent","accepted","declined","cancelled"]:e==="receipt"||e==="credit"?["draft","issued","cancelled"]:["draft","sent","cancelled"]}const ca={...dt,sent:"Sent / issued"};function Me(e,n,s){const t=_(),c=$e(t);let a;if(n.id){const u=ae("docs",n.id);if(!u){e.innerHTML='<div class="empty"><p>Document not found.</p></div>';return}a=JSON.parse(JSON.stringify(u))}else s.get("draft")&&be?(a=be,be=null):a=Le(n.type||"invoice",s.get("client")||"");const i=!a.id,b=V[a.type].name;K(`${i?"New":"Edit"} ${b.toLowerCase()}`,`
    <button class="btn" id="cancelBtn">Cancel</button>
    <button class="btn" id="printBtn" title="Print or save as PDF">${g("print")}<span class="hide-sm"> Print</span></button>
    <button class="btn primary" id="saveBtn">${g("check")} Save</button>`);const m=u=>c.clientFields[0]&&u.extra?u.extra[c.clientFields[0].key]:"",h=P("items"),o=[...new Set(h.map(u=>u.category).filter(Boolean))],d=t.design.groupByCategory||c.itemCols.some(u=>u.key==="category"),f=c.itemCols.filter(u=>u.key!=="category"),C=t.taxMode!=="none";e.innerHTML=`
  <div class="editor">
    <form class="editor-form" id="docForm" autocomplete="off">
      <section class="card">
        <div class="grid g4">
          ${k("Document",`<select data-f="type">${H(Object.entries(V).map(([u,y])=>[u,y.name]),a.type)}</select>`)}
          ${k("Title on document",`<input data-f="title" value="${l(a.title)}">`)}
          ${k("Number",`<input data-f="number" value="${l(a.number)}" required>`)}
          ${k("Status",`<select data-f="status">${H(Ye(a.type).map(u=>[u,ca[u]]),a.status)}</select>`)}
          ${k("Date",`<input type="date" data-f="date" value="${l(a.date)}">`)}
          ${k(a.type==="quote"?"Valid till":"Due date",`<input type="date" data-f="dueDate" value="${l(a.dueDate)}">`)}
          ${t.taxMode==="gst"?k("Place of supply",`<select data-f="placeOfSupply">${H(qe.map(([u,y])=>[u,`${u} - ${y}`]),a.placeOfSupply)}</select>`):""}
          ${k("Reference / PO",`<input data-f="reference" value="${l(a.reference||"")}">`)}
        </div>
      </section>

      <section class="card">
        <h3>${l(X())}</h3>
        <div class="row-gap">
          <select id="clientSel" class="grow">
            <option value="">— Select ${l(X().toLowerCase())} —</option>
            ${H(P("clients").slice().sort((u,y)=>u.name.localeCompare(y.name)).map(u=>[u.id,`${u.name}${u.company&&u.company!==u.name?` · ${u.company}`:""}${m(u)?` · ${m(u)}`:""}`]),a.clientId)}
          </select>
          <button type="button" class="btn" id="newClientBtn">${g("plus")} New</button>
        </div>
        <div id="clientCard" class="client-card"></div>
      </section>

      ${c.fields.length?`<section class="card"><h3>Bill details</h3><div class="grid g3">
        ${c.fields.map(u=>k(u.label,`<input ${u.type==="date"?'type="date"':""} data-ff="${u.key}" value="${l((a.fields||{})[u.key]||"")}">`)).join("")}
      </div></section>`:""}

      <section class="card">
        <h3>Items</h3>
        <div id="lines"></div>
        <div class="row-gap">
          <button type="button" class="btn" id="addLine">${g("plus")} Add line</button>
          <button type="button" class="btn ghost" id="pickItems">${g("box")} From catalogue</button>
        </div>
        <datalist id="catalog">${h.map(u=>`<option value="${l(u.name)}">${l(u.category||"")} ${x(u.rate)}</option>`).join("")}</datalist>
        <datalist id="cats">${o.map(u=>`<option value="${l(u)}">`).join("")}</datalist>
      </section>

      <section class="card">
        <h3>Charges, discount & payments</h3>
        <div class="grid g4">
          ${k("Discount",`<div class="join"><input type="number" step="any" min="0" data-f="discount.value" data-num value="${l(a.discount.value)}"><select data-f="discount.type">${H([["%","%"],["flat","Flat"]],a.discount.type)}</select></div>`)}
          ${k("Shipping / other charges",`<input type="number" step="any" data-f="shipping" data-num value="${l(a.shipping)}">`)}
          ${k("Adjustment (+/−)",`<input type="number" step="any" data-f="adjustment" data-num value="${l(a.adjustment)}">`)}
          ${k("Advance received",`<input type="number" step="any" min="0" data-f="advance" data-num value="${l(a.advance)}">`)}
          ${c.insurance||a.insurance?k(`${t.design.labels.insurance||"Insurance / third-party share"}`,`<input type="number" step="any" min="0" data-f="insurance" data-num value="${l(a.insurance)}">`):""}
        </div>
        <div id="sumBox" class="sumbox"></div>
      </section>

      <section class="card">
        <h3>Extra fields <small>shown with the document details</small></h3>
        <div id="customFields"></div>
        <button type="button" class="btn ghost" id="addCf">${g("plus")} Add field</button>
      </section>

      <section class="card">
        <div class="grid g2">
          ${k("Notes",`<textarea rows="3" data-f="notes">${l(a.notes)}</textarea>`)}
          ${k("Terms & conditions",`<textarea rows="3" data-f="terms">${l(a.terms)}</textarea>`)}
        </div>
      </section>

      <section class="card">
        <h3>Design for this document</h3>
        <div class="grid g3">
          ${k("Template",`<select data-f="template"><option value="">Default (${l((ke.find(u=>u.id===t.design.template)||ke[0]).name)})</option>${H(ke.map(u=>[u.id,u.name]),a.template)}</select>`)}
          ${k("Accent colour",`<div class="join"><input type="color" data-f="accent" value="${l(a.accent||t.design.accent)}"><button type="button" class="btn ghost" id="resetAccent">Default</button></div>`)}
          <div class="fld"><span>&nbsp;</span><a class="btn ghost" href="#/design">${g("palette")} Full design studio</a></div>
        </div>
      </section>
    </form>
    <aside class="editor-preview">
      <div class="preview-bar"><span>Live preview</span><span id="pvTotal"></span></div>
      <div id="preview"></div>
    </aside>
  </div>`;const N=$("#docForm",e),T=$("#preview",e);let B;const M=u=>{clearTimeout(B);const y=()=>{N.isConnected&&(Ce(T,a,t),ne())};u?y():B=setTimeout(y,120)},F=()=>{Q(!0),M()};function q(){const u=a.client,y=$("#clientCard",e);if(!u||!u.name){y.innerHTML=`<p class="muted">Pick a saved ${l(X().toLowerCase())} or add a new one.</p>`;return}const p=c.clientFields.filter(v=>u.extra&&u.extra[v.key]).map(v=>`${l(v.label)}: ${l(u.extra[v.key])}`);y.innerHTML=`<b>${l(u.name)}</b>${u.company&&u.company!==u.name?` · ${l(u.company)}`:""}
      <div class="muted">${[u.phone,u.email,u.gstin&&`GSTIN ${u.gstin}`,...p].filter(Boolean).map(l).join(" · ")}</div>`}function U(u,y){const p=Ge(u).net;return`<div class="li" data-i="${y}">
      <div class="li-main">
        <input class="li-name" data-k="name" list="catalog" placeholder="Item or service name" value="${l(u.name)}">
        <textarea data-k="description" rows="1" placeholder="Description (optional)">${l(u.description||"")}</textarea>
        ${d||f.length?`<div class="li-extra">
          ${d?`<label><span>Category</span><input data-k="category" list="cats" value="${l(u.category||"")}"></label>`:""}
          ${f.map(v=>`<label><span>${l(v.label)}</span><input data-k="${v.key}" value="${l(u[v.key]||"")}"></label>`).join("")}
        </div>`:""}
      </div>
      <div class="li-nums">
        ${t.design.show.hsn?`<label><span>HSN/SAC</span><input data-k="hsn" value="${l(u.hsn||"")}"></label>`:""}
        <label><span>Qty</span><input type="number" step="any" data-k="qty" data-num value="${l(u.qty)}"></label>
        <label><span>Unit</span><input data-k="unit" value="${l(u.unit||"")}" placeholder="pcs"></label>
        <label><span>Rate</span><input type="number" step="any" data-k="rate" data-num value="${l(u.rate)}"></label>
        <label><span>Disc %</span><input type="number" step="any" min="0" max="100" data-k="discount" data-num value="${l(u.discount||0)}"></label>
        ${C?`<label><span>Tax %</span><input type="number" step="any" min="0" data-k="tax" data-num value="${l(u.tax||0)}" list="taxrates"></label>`:""}
        <div class="li-amt"><span>Amount</span><b>${x(p)}</b></div>
      </div>
      <div class="li-act">
        <button type="button" class="icon-btn" data-act="up" title="Move up" aria-label="Move up">${g("up",16)}</button>
        <button type="button" class="icon-btn" data-act="down" title="Move down" aria-label="Move down">${g("down",16)}</button>
        <button type="button" class="icon-btn" data-act="save" title="Save to catalogue" aria-label="Save to catalogue">${g("star",16)}</button>
        <button type="button" class="icon-btn danger" data-act="del" title="Remove line" aria-label="Remove line">${g("trash",16)}</button>
      </div>
    </div>`}function R(){$("#lines",e).innerHTML=`${a.items.map(U).join("")}
      <datalist id="taxrates">${[0,5,12,18,28].map(u=>`<option value="${u}">`).join("")}</datalist>`}function Y(){$("#customFields",e).innerHTML=(a.customFields||[]).map((u,y)=>`
      <div class="cf" data-j="${y}">
        <input data-cf="label" placeholder="Label (e.g. Vehicle No.)" value="${l(u.label)}">
        <input data-cf="value" placeholder="Value" value="${l(u.value)}">
        <button type="button" class="icon-btn danger" data-cfdel aria-label="Remove">${g("trash",16)}</button>
      </div>`).join("")||'<p class="muted">Add any field you need: vehicle number, PO date, e-way bill, room number…</p>'}function ne(){const u=ce(a,t),y=[["Sub total",u.gross],u.discountTotal&&["Discount",-u.discountTotal],["Tax",u.totalTax],u.shipping&&["Charges",u.shipping],u.adjustment&&["Adjustment",u.adjustment],u.roundOff&&["Round off",u.roundOff]].filter(Boolean);$("#sumBox",e).innerHTML=`${y.map(([p,v])=>`<div><span>${p}</span><span>${x(v)}</span></div>`).join("")}
      <div class="big"><span>Total</span><span>${x(u.total)}</span></div>
      ${u.insurance?`<div><span>Insurance</span><span>−${x(u.insurance)}</span></div><div class="big"><span>Payable</span><span>${x(u.payable)}</span></div>`:""}
      ${u.paid?`<div><span>Paid</span><span>−${x(u.paid)}</span></div><div class="big"><span>Balance</span><span>${x(u.balance)}</span></div>`:""}`,$("#pvTotal",e).textContent=x(u.insurance?u.payable:u.total),W(".li",e).forEach(p=>{const v=a.items[+p.dataset.i];v&&(p.querySelector(".li-amt b").textContent=x(Ge(v).net))})}q(),R(),Y(),M(!0),Q(!1),N.addEventListener("input",u=>{const y=u.target,p=y.dataset.num!==void 0?y.value===""?0:parseFloat(y.value):y.value;if(y.dataset.f){if(y.dataset.f==="type")return;la(a,y.dataset.f,p)}else if(y.dataset.ff)a.fields=a.fields||{},a.fields[y.dataset.ff]=p;else if(y.dataset.k){const v=+y.closest(".li").dataset.i;a.items[v][y.dataset.k]=p}else if(y.dataset.cf){const v=+y.closest(".cf").dataset.j;a.customFields[v][y.dataset.cf]=p}else return;F()}),N.addEventListener("change",u=>{const y=u.target;if(y.dataset.f==="type"){const p=y.value,v=!i;a.type=p,a.title=t.docTitles[p]||V[p].title,v||(a.number=Le(p).number),Ye(p).includes(a.status)||(a.status="draft"),Q(!0),be=a,Me(e,{...n,type:p},new URLSearchParams("draft=1")),Q(!0);return}if(y.dataset.k==="name"){const p=+y.closest(".li").dataset.i,v=h.find(r=>r.name.toLowerCase()===y.value.trim().toLowerCase());if(v){const r=a.items[p];Object.assign(r,{name:v.name,rate:v.rate,tax:C?v.tax:0,hsn:v.hsn||"",unit:v.unit||"",category:v.category||"",description:r.description||v.description||""}),R(),F();const S=$(`.li[data-i="${p}"] [data-k="qty"]`,e);S&&S.focus()}}}),$("#clientSel",e).addEventListener("change",u=>{const y=ae("clients",u.target.value);if(a.clientId=y?y.id:"",a.client=Ct(y),y&&y.state){a.placeOfSupply=y.state;const p=$('[data-f="placeOfSupply"]',e);p&&(p.value=y.state)}q(),F()}),$("#newClientBtn",e).addEventListener("click",()=>{se({title:`New ${X().toLowerCase()}`,body:Pe({}),wide:!0,onSubmit:u=>{const y=je(u,{});if(!y.name)return I("Name is required","err"),!1;z("clients",y);const p=$("#clientSel",e);return p.insertAdjacentHTML("beforeend",`<option value="${y.id}">${l(y.name)}</option>`),p.value=y.id,p.dispatchEvent(new Event("change")),I(`${X()} saved`),!0}})}),$("#lines",e).addEventListener("click",u=>{const y=u.target.closest("[data-act]");if(!y)return;const p=+y.closest(".li").dataset.i,v=a.items;if(y.dataset.act==="del")v.splice(p,1),v.length||v.push(w());else if(y.dataset.act==="up"&&p>0)[v[p-1],v[p]]=[v[p],v[p-1]];else if(y.dataset.act==="down"&&p<v.length-1)[v[p+1],v[p]]=[v[p],v[p+1]];else if(y.dataset.act==="save"){const r=v[p];if(!r.name)return I("Give the line a name first","err");const S=P("items").find(L=>L.name.toLowerCase()===r.name.toLowerCase());return z("items",{...S||{},name:r.name,description:r.description||"",rate:+r.rate||0,tax:+r.tax||0,hsn:r.hsn||"",unit:r.unit||"",category:r.category||""}),I(S?"Catalogue item updated":"Saved to catalogue")}R(),F()});const w=()=>({name:"",description:"",hsn:"",qty:1,unit:"",rate:0,discount:0,tax:C?t.defaultTax:0,category:""});$("#addLine",e).addEventListener("click",()=>{a.items.push(w()),R(),F(),$(`.li[data-i="${a.items.length-1}"] .li-name`,e).focus()}),$("#pickItems",e).addEventListener("click",()=>{const u=P("items");if(!u.length)return I("Your catalogue is empty. Add items in Items.","err");se({title:"Add from catalogue",wide:!0,submit:"Add selected",body:`<div class="search">${g("search",16)}<input id="pickQ" type="search" placeholder="Filter"></div>
        <div class="pick-list">${u.map(y=>`<label class="pick" data-name="${l(`${y.name} ${y.category}`.toLowerCase())}"><input type="checkbox" name="pick" value="${y.id}"><span>${l(y.name)}<small>${l(y.category||"")}</small></span><b>${x(y.rate)}</b></label>`).join("")}</div>`,onSubmit:y=>{const p=y.getAll("pick");a.items.length===1&&!a.items[0].name&&!Number(a.items[0].rate)&&(a.items=[]);for(const v of p){const r=ae("items",v);a.items.push({...w(),name:r.name,description:r.description||"",rate:r.rate,tax:C?r.tax:0,hsn:r.hsn||"",unit:r.unit||"",category:r.category||""})}a.items.length||a.items.push(w()),R(),F()}}),$("#pickQ").addEventListener("input",y=>{const p=y.target.value.toLowerCase();W(".pick").forEach(v=>{v.hidden=!v.dataset.name.includes(p)})})}),$("#addCf",e).addEventListener("click",()=>{a.customFields=a.customFields||[],a.customFields.push({label:"",value:""}),Y(),$(`.cf[data-j="${a.customFields.length-1}"] input`,e).focus()}),$("#customFields",e).addEventListener("click",u=>{u.target.closest("[data-cfdel]")&&(a.customFields.splice(+u.target.closest(".cf").dataset.j,1),Y(),F())}),$("#resetAccent",e).addEventListener("click",()=>{a.accent="",$('[data-f="accent"]',e).value=t.design.accent,F()});const A=()=>{if(!a.number.trim())return I("Number is required","err"),null;if(P("docs").find(p=>p.id!==a.id&&p.type===a.type&&p.number===a.number.trim()))return I(`${a.number} already exists. Change the number.`,"err"),null;if(a.number=a.number.trim(),a.items=a.items.filter(p=>p.name||Number(p.rate)),!a.items.length)return I("Add at least one item","err"),a.items.push(w()),R(),null;const y=le(a);return O(),Q(!1),y};$("#saveBtn").addEventListener("click",()=>{const u=A();u&&(I(`${b} ${u.number} saved`),G(`#/doc/${u.id}`))}),$("#cancelBtn").addEventListener("click",()=>history.length>1?history.back():G("#/docs/all")),$("#printBtn").addEventListener("click",()=>ue([a],t)),N.addEventListener("keydown",u=>{(u.ctrlKey||u.metaKey)&&u.key==="s"&&(u.preventDefault(),$("#saveBtn").click())})}const da=["Cash","UPI","Bank transfer","Card","Cheque","Insurance / TPA","Wallet","Other"];function Oe(e,n){const s=_(),t=ae("docs",n.id);if(!t){e.innerHTML='<div class="empty"><p>Document not found.</p><a class="btn" href="#/docs/all">Back to documents</a></div>',K("Not found");return}const c=ce(t),a=Jt(t,c),i=t.type==="invoice"||t.type==="proforma";K(`${V[t.type].name} ${t.number}`,`
    <a class="btn" href="#/edit/${t.id}">${g("edit")}<span class="hide-sm"> Edit</span></a>
    <button class="btn" data-a="print">${g("print")}<span class="hide-sm"> Print / PDF</span></button>
    <button class="btn primary" data-a="share">${g("share")}<span class="hide-sm"> Share</span></button>`);const b=t.client||{};e.innerHTML=`
  <div class="docpage">
    <div class="docpage-preview"><div id="preview"></div></div>
    <aside class="docpage-side">
      <section class="card">
        <div class="row-between">${fe(a)}<span class="muted">${l(V[t.type].name)}</span></div>
        <div class="bigmoney">${x(c.payable)}</div>
        ${i?`<div class="muted">Paid ${x(c.paid)} · Balance <b>${x(Math.max(c.balance,0))}</b></div>`:""}
        <div class="muted">${l(b.name||"—")}${b.phone?` · ${l(b.phone)}`:""}</div>
        <div class="muted">Dated ${te(t.date)}${t.dueDate?` · ${t.type==="quote"?"valid till":"due"} ${te(t.dueDate)}`:""}</div>
      </section>
      <section class="card actions">
        ${i&&a!=="paid"&&a!=="cancelled"?`<button class="btn primary block" data-a="pay">${g("cash")} Record payment</button>`:""}
        ${t.status==="draft"?`<button class="btn block" data-a="sent">${g("send")} Mark as sent</button>`:""}
        ${t.type==="quote"||t.type==="proforma"?`<button class="btn block" data-a="convert">${g("refresh")} Convert to invoice</button>`:""}
        ${t.type==="quote"&&!["accepted","converted"].includes(a)?`<button class="btn block" data-a="accept">${g("check")} Mark accepted</button>`:""}
        ${t.type==="invoice"?`<button class="btn block" data-a="credit">${g("file")} Create credit note</button>`:""}
        ${t.type==="invoice"&&c.paid?`<button class="btn block" data-a="receipt">${g("file")} Payment receipt</button>`:""}
        <button class="btn block" data-a="dup">${g("copy")} Duplicate</button>
        ${t.status!=="cancelled"?`<button class="btn block" data-a="cancel">${g("x")} Cancel document</button>`:`<button class="btn block" data-a="restore">${g("refresh")} Restore</button>`}
        <button class="btn block danger-text" data-a="delete">${g("trash")} Delete</button>
      </section>
      ${i?`<section class="card">
        <h3>Payments</h3>
        ${t.advance?`<div class="pay-row"><span>Advance</span><b>${x(t.advance)}</b></div>`:""}
        ${(t.payments||[]).map(o=>`<div class="pay-row"><span>${te(o.date)} · ${l(o.method)}${o.ref?` · ${l(o.ref)}`:""}</span><b>${x(o.amount)}</b>
          <button class="icon-btn danger" data-delpay="${o.id}" aria-label="Remove payment">${g("trash",14)}</button></div>`).join("")||(t.advance?"":'<p class="muted">No payments yet.</p>')}
      </section>`:""}
      ${t.convertedFrom||t.convertedTo?`<section class="card muted">
        ${t.convertedFrom&&ae("docs",t.convertedFrom)?`From <a href="#/doc/${t.convertedFrom}">${l(ae("docs",t.convertedFrom).number)}</a>`:""}
        ${t.convertedTo&&ae("docs",t.convertedTo)?`Converted to <a href="#/doc/${t.convertedTo}">${l(ae("docs",t.convertedTo).number)}</a>`:""}
      </section>`:""}
    </aside>
  </div>`,Ce($("#preview",e),t,s);const m=o=>{z("docs",t),O(),o&&I(o),Oe(e,n)},h={print:()=>ue([t],s),share:()=>ua(t,()=>Oe(e,n)),pay:()=>ra(t,c,()=>m("Payment recorded")),sent:()=>{t.status="sent",t.sentAt=new Date().toISOString(),m("Marked as sent")},accept:()=>{t.status="accepted",m("Marked accepted")},convert:()=>{const o=ge(t,"invoice");o.status="draft",o.reference=o.reference||t.number;const d=le(o);t.convertedTo=d.id,t.type==="quote"&&(t.status="accepted"),z("docs",t),O(),I(`Invoice ${d.number} created`),G(`#/edit/${d.id}`)},credit:()=>{const o=ge(t,"credit");o.status="issued",o.reference=t.number,o.dueDate="",o.notes=`Against invoice ${t.number} dated ${te(t.date)}`,Ne(o)},receipt:()=>{const o=ge(t,"receipt");o.items=[{name:`Payment against ${t.number}`,description:(t.payments||[]).map(d=>`${te(d.date)} ${d.method} ${d.ref||""}`).join(`
`),hsn:"",qty:1,unit:"",rate:c.paid,discount:0,tax:0,category:""}],Object.assign(o,{status:"issued",reference:t.number,dueDate:"",discount:{type:"%",value:0},shipping:0,adjustment:0,insurance:0,terms:""}),Ne(o)},dup:()=>Ne(ge(t)),cancel:async()=>{await Z("Cancel document?",`${t.number} stays in your records marked as cancelled.`,"Cancel document")&&(t.status="cancelled",m("Cancelled"))},restore:()=>{t.status="sent",m("Restored")},delete:async()=>{await Z("Delete permanently?",`${t.number} will be removed. This cannot be undone.`)&&(He("docs",t.id),O(),I("Deleted"),G("#/docs/all"))}};document.querySelectorAll("[data-a]").forEach(o=>o.addEventListener("click",()=>h[o.dataset.a]&&h[o.dataset.a]())),W("[data-delpay]",e).forEach(o=>o.addEventListener("click",async()=>{await Z("Remove payment?","This payment will be removed from the document.","Remove")&&(t.payments=t.payments.filter(d=>d.id!==o.dataset.delpay),m("Payment removed"))}))}function ra(e,n,s){const t=Math.max(n.balance,0);se({title:`Record payment · ${e.number}`,body:`<div class="grid g2">
      ${k("Amount",`<input type="number" step="any" min="0" name="amount" value="${t.toFixed(2)}" required>`)}
      ${k("Date",`<input type="date" name="date" value="${ee()}">`)}
      ${k("Method",`<select name="method">${H(da.map(c=>[c,c]),"UPI")}</select>`)}
      ${k("Reference / UTR / cheque no.",'<input name="ref">')}
    </div><p class="muted">Balance due: ${x(t)}</p>`,onSubmit:c=>{const a=parseFloat(c.get("amount"));if(!(a>0))return I("Enter an amount","err"),!1;e.payments=e.payments||[],e.payments.push({id:Date.now().toString(36),date:c.get("date")||ee(),amount:a,method:c.get("method"),ref:c.get("ref")}),e.status==="draft"&&(e.status="sent"),s()}})}async function gt(e,n){const s=await zt(Xt(_(),e,n));return`${new URL("../portal.html",location.href.split("#")[0]).href}#${s}`}function ua(e,n){const s=_(),t=e.client||{},c=ce(e),i=se({title:`Share ${e.number}`,submit:"",cancel:"Close",wide:!0,body:`<p class="muted">Your ${l(X().toLowerCase())} opens a private page where they can view, download and pay. The document travels inside the link itself; nothing is uploaded.</p>
      <div class="share-link"><input id="shareUrl" readonly value="Preparing link…"><button class="btn" id="copyLink" type="button">${g("copy")} Copy</button></div>
      <div class="share-btns">
        <a class="btn whatsapp" id="waBtn" target="_blank" rel="noopener">${g("whatsapp")} WhatsApp</a>
        <a class="btn" id="mailBtn">${g("mail")} Email</a>
        <a class="btn" id="openBtn" target="_blank" rel="noopener">${g("globe")} Open portal</a>
        <button class="btn" id="printShare" type="button">${g("download")} Save PDF</button>
      </div>
      ${e.status==="draft"?'<label class="check"><input type="checkbox" id="markSent" checked> Mark as sent when I share</label>':""}`}).el;gt(t.id&&ae("clients",t.id)||t,[{...e,status:e.status==="draft"?"sent":e.status}]).then(m=>{const h=x(c.insurance?c.payable:c.total),o=`Hello ${t.name||""},

Your ${e.title||V[e.type].title} ${e.number} for ${h} from ${s.business.name} is ready.
View, download & pay: ${m}

Thank you.`,d=String(t.phone||"").replace(/\D/g,""),f=`https://wa.me/${d.length===10?`91${d}`:d}?text=${encodeURIComponent(o)}`;$("#shareUrl",i).value=m,$("#waBtn",i).href=f,$("#mailBtn",i).href=`mailto:${encodeURIComponent(t.email||"")}?subject=${encodeURIComponent(`${e.title||V[e.type].title} ${e.number} - ${s.business.name}`)}&body=${encodeURIComponent(o)}`,$("#openBtn",i).href=m,m.length>7e3&&$("#shareUrl",i).insertAdjacentHTML("afterend",'<p class="muted small">This link is long (a big logo or many lines). It still works when copied; some apps may shorten the preview.</p>')});const b=()=>{const m=$("#markSent",i);m&&m.checked&&e.status==="draft"&&(e.status="sent",e.sentAt=new Date().toISOString(),z("docs",e),O(),n&&n())};$("#copyLink",i).addEventListener("click",async()=>{await ct($("#shareUrl",i).value)&&I("Link copied"),b()}),["#waBtn","#mailBtn","#openBtn"].forEach(m=>$(m,i).addEventListener("click",b)),$("#printShare",i).addEventListener("click",()=>ue([e],s))}const ye=e=>String(e||"").toLowerCase().replace(/\s+/g," ").trim();function yt(e,n,s=60){const t=ye(e);if(!t)return[];const c=[];for(const a of n){const i=ye(a.name),b=ye(a.code);let m=0;b&&b===t?m=100:i===t?m=90:i.startsWith(t)?m=70:i.split(/[\s\-/(]+/).some(h=>h.startsWith(t))?m=50:b&&b.startsWith(t)?m=40:(i.includes(t)||ye(a.category).includes(t))&&(m=20),m&&c.push({it:a,score:m+Math.min(Number(a.sold)||0,999)/1e3})}return c.sort((a,i)=>i.score-a.score||a.it.name.localeCompare(i.it.name)).slice(0,s).map(a=>a.it)}function pa(e,n){const s=String(e||"").trim();if(!s)return null;let t=1,c=s;const a=s.match(/^(\d+(?:\.\d+)?)\s*[x*×]\s*(.+)$/i);if(a)t=parseFloat(a[1]),c=a[2];else{const b=s.match(/^(.+?)\s*[x*×]\s*(\d+(?:\.\d+)?)$/i);b&&(t=parseFloat(b[2]),c=b[1])}const i=yt(c,n,1);return!i.length||!(t>0)?null:{item:i[0],qty:t}}function Qe(e,n,s=1,t=!0){const c=e.findIndex(a=>a.itemId&&a.itemId===n.id);if(c>=0){const a=[...e];return a[c]={...a[c],qty:wt((Number(a[c].qty)||0)+s)},a}return[...e,{itemId:n.id,name:n.name,description:"",hsn:n.hsn||"",qty:s,unit:n.unit||"",rate:Number(n.rate)||0,discount:0,tax:t&&Number(n.tax)||0,category:n.category||""}]}function ma(e,n,s){const t=wt(s);return t>0?e.map((c,a)=>a===n?{...c,qty:t}:c):e.filter((c,a)=>a!==n)}const wt=e=>Math.round((Number(e)||0)*1e3)/1e3;function ba(e){const n=[];for(const s of e)s.category&&!n.includes(s.category)&&n.push(s.category);return n}function Je(e,n){const s=(t,c)=>Ke(t)-Ke(c)||t.name.localeCompare(c.name);return n==="popular"?[...e].sort((t,c)=>(Number(c.sold)||0)-(Number(t.sold)||0)||s(t,c)):n==="all"?[...e].sort(s):e.filter(t=>t.category===n).sort(s)}const Ke=e=>e.code&&/^\d+$/.test(e.code)?Number(e.code):1e9;function ha({number:e,table:n,slotLabel:s="Table",lines:t,note:c="",time:a=new Date}){const i=m=>String(m??"").replace(/[&<>"']/g,h=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[h]),b=a.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});return`<div class="kot">
    <div class="kot-h">KITCHEN ORDER</div>
    <div class="kot-meta"><b>${n?`${i(s)} ${i(n)}`:"Takeaway"}</b><span>${i(e)} · ${b}</span></div>
    <table>${t.map(m=>`<tr><td class="q">${i(m.qty)}</td><td>${i(m.name)}</td></tr>`).join("")}</table>
    ${c?`<div class="kot-note">Note: ${i(c)}</div>`:""}
  </div>`}function ze(e,n){const s=[];let t="",c=!1;for(let a=0;a<e.length;a++){const i=e[a];c?i==='"'&&e[a+1]==='"'?(t+='"',a++):i==='"'?c=!1:t+=i:i==='"'?c=!0:i===n?(s.push(t),t=""):t+=i}return s.push(t),s.map(a=>a.trim())}const me={name:["name","item","item name","product","dish","service","particulars"],rate:["price","rate","amount","mrp","cost","selling price"],category:["category","group","section","type"],tax:["gst","gst %","gst%","tax","tax %","tax%"],code:["code","item code","short code","sku","barcode","no","no.","sl","sl no"],unit:["unit","uom"],hsn:["hsn","sac","hsn/sac","hsn code"]};function Xe(e,{defaultTax:n=0}={}){const s=String(e||"").split(/\r?\n/).map(h=>h.trim()).filter(Boolean);if(!s.length)return{items:[],skipped:0};const t=s[0].includes("	")?"	":s[0].includes(";")&&!s[0].includes(",")?";":",";let c=["name","rate","category","tax","code","unit"];const a=ze(s[0],t).map(h=>h.toLowerCase());let i=0;a.some(h=>me.name.includes(h))&&a.some(h=>[...me.rate,...me.category].includes(h))&&(c=a.map(h=>Object.keys(me).find(o=>me[o].includes(h))||""),i=1);const b=[];let m=0;for(const h of s.slice(i)){let o=ze(h,t);if(o.length===1){const T=h.match(/^(.*?)[\s\-–:=₹]+(?:rs\.?\s*)?(\d+(?:\.\d+)?)\s*$/i);o=T?[T[1],T[2]]:[h]}const d={};c.forEach((T,B)=>{T&&o[B]!==void 0&&(d[T]=o[B])});const f=(d.name||"").replace(/^"|"$/g,"").trim(),C=parseFloat(String(d.rate||"").replace(/[₹,\s]|rs\.?/gi,""));if(!f||!(C>=0)||Number.isNaN(C)){m++;continue}const N=d.tax!==void 0&&d.tax!==""?parseFloat(String(d.tax).replace("%","")):n;b.push({name:f,rate:C,category:(d.category||"").trim(),tax:Number.isFinite(N)?N:n,code:(d.code||"").trim(),unit:(d.unit||"").trim(),hsn:(d.hsn||"").trim(),description:""})}return{items:b,skipped:m}}const Ze=`Code,Name,Price,Category,GST %,Unit
1,Masala Dosa,90,Breakfast,5,plate
2,Ghee Roast,120,Breakfast,5,plate
3,Chicken Biryani,220,Biryani,5,plate
4,Tea,15,Beverages,5,cup`;function fa(e,n,s){const t=_(),c=t.taxMode==="none"?0:t.defaultTax;K("Items & services",`
    <button class="btn" id="addStarter">${g("download")}<span class="hide-sm"> ${l(Tt(t.industry).name)} starter list</span></button>
    <button class="btn" id="importItems">${g("upload")}<span class="hide-sm"> Import</span></button>
    <button class="btn" id="exportItems" title="Export CSV">${g("download")}<span class="hide-sm"> CSV</span></button>
    <button class="btn primary" id="addItem">${g("plus")} New item</button>`);const a=()=>{var d;const b=P("items"),m=[...new Set(b.map(f=>f.category).filter(Boolean))];e.innerHTML=`
      <div class="toolbar"><div class="search">${g("search",16)}<input id="q" type="search" placeholder="Filter items"></div>
      <span class="muted">${b.length} items · edit any cell, changes save automatically · give items a short <b>Code</b> to bill by typing it in <a href="#/pos">Quick Bill</a></span></div>
      ${b.length?`<div class="table-wrap"><table class="table edit-table" id="itemsTable">
        <thead><tr><th>Code</th><th>Name</th><th>Description</th><th>Category</th><th>HSN/SAC</th><th>Unit</th><th class="num">Rate</th><th class="num">Tax %</th><th></th></tr></thead>
        <tbody>${b.map(f=>`<tr data-id="${f.id}" data-s="${l(`${f.code||""} ${f.name} ${f.category} ${f.hsn}`.toLowerCase())}">
          <td><input data-k="code" value="${l(f.code||"")}" size="4" placeholder="—"></td>
          <td><input data-k="name" value="${l(f.name)}"></td>
          <td><input data-k="description" value="${l(f.description||"")}"></td>
          <td><input data-k="category" list="icats" value="${l(f.category||"")}"></td>
          <td><input data-k="hsn" value="${l(f.hsn||"")}" size="8"></td>
          <td><input data-k="unit" value="${l(f.unit||"")}" size="6"></td>
          <td class="num"><input data-k="rate" data-num type="number" step="any" value="${l(f.rate)}"></td>
          <td class="num"><input data-k="tax" data-num type="number" step="any" value="${l(f.tax)}" size="4"></td>
          <td><button class="icon-btn danger" data-del aria-label="Delete">${g("trash",16)}</button></td></tr>`).join("")}</tbody></table></div>
        <datalist id="icats">${m.map(f=>`<option value="${l(f)}">`).join("")}</datalist>`:`<div class="empty">${g("box",40)}<p>Save the products and services you bill often. Picking one on a bill fills rate, tax and HSN.</p>
        <div class="row-gap wrap" style="justify-content:center"><button class="btn primary" data-import>${g("upload")} Import your full menu / price list</button></div></div>`}`;const h=$("#q",e);h.addEventListener("input",()=>W("#itemsTable tbody tr",e).forEach(f=>{f.hidden=!f.dataset.s.includes(h.value.toLowerCase())})),(d=$("[data-import]",e))==null||d.addEventListener("click",i);const o=$("#itemsTable",e);o&&(o.addEventListener("change",f=>{const C=f.target,N=C.closest("tr"),T=P("items").find(M=>M.id===N.dataset.id);if(!T||!C.dataset.k)return;const B=C.dataset.num!==void 0?parseFloat(C.value)||0:C.value.trim();if(C.dataset.k==="code"&&B&&P("items").some(M=>M.id!==T.id&&String(M.code||"").toLowerCase()===B.toLowerCase())){I(`Code ${B} is already used by another item`,"err"),C.value=T.code||"";return}T[C.dataset.k]=B,z("items",T),O(),I(`Saved · ${T.name} ${x(T.rate)}`)}),o.addEventListener("click",async f=>{if(!f.target.closest("[data-del]"))return;const C=f.target.closest("tr");await Z("Delete item?","It will be removed from the catalogue. Bills that used it are not changed.")&&(He("items",C.dataset.id),O(),a())}))};function i(){const b=se({title:"Import items",submit:"Import",wide:!0,body:`<p class="muted">Paste your menu or price list — copied from Excel / Google Sheets, a CSV file, or plain lines like <code>Masala Dosa - 90</code>. Add 100+ items in one go.</p>
        <div class="row-gap wrap" style="margin-bottom:8px">
          <label class="btn">${g("upload")} Choose CSV file<input type="file" id="impFile" accept=".csv,.txt,text/csv,text/plain" hidden></label>
          <button type="button" class="btn" id="impSample">${g("download")} Sample CSV</button>
        </div>
        <textarea name="text" id="impText" rows="9" placeholder="${l(Ze)}" style="width:100%;font-family:ui-monospace,monospace;font-size:13px"></textarea>
        <p class="muted small">Columns: Name, Price, and optionally Category, GST %, Code, Unit, HSN — in any order when the first row has headings. Without headings: name, price, category, GST %, code, unit.</p>
        <label class="check"><input type="checkbox" name="update" checked> Update the price of items that already exist (same name)</label>
        <label class="check"><input type="checkbox" name="codes" checked> Give a number code to items without one (for typing in Quick Bill)</label>
        <div id="impPreview" class="muted small"></div>`,onSubmit:d=>{const{items:f}=Xe(d.get("text"),{defaultTax:c});if(!f.length)return I("Nothing to import — check the text","err"),!1;const C=new Map(P("items").map(q=>[q.name.toLowerCase(),q])),N=new Set(P("items").map(q=>String(q.code||"").toLowerCase()).filter(Boolean));let T=Math.max(0,...P("items").map(q=>/^\d+$/.test(q.code||"")?Number(q.code):0))+1,B=0;const M=[];for(const q of f){const U=C.get(q.name.toLowerCase());if(U){d.has("update")&&(Object.assign(U,{rate:q.rate},q.category?{category:q.category}:{},q.unit?{unit:q.unit}:{},q.hsn?{hsn:q.hsn}:{}),q.code&&!N.has(q.code.toLowerCase())&&(U.code=q.code,N.add(q.code.toLowerCase())),z("items",U),B++);continue}let R=q.code&&!N.has(q.code.toLowerCase())?q.code:"";if(!R&&d.has("codes")){for(;N.has(String(T));)T++;R=String(T++)}R&&N.add(R.toLowerCase());const Y={...q,code:R,unit:q.unit||(t.industry==="restaurant"?"plate":"pcs")};M.push(Y),C.set(Y.name.toLowerCase(),Y)}for(const q of M.reverse())z("items",q);const F=M.length;return O(),I(`Imported: ${F} new${B?`, ${B} updated`:""}`),a(),!0}}),m=$("#impText",b.el),h=$("#impPreview",b.el),o=()=>{const{items:d,skipped:f}=Xe(m.value,{defaultTax:c});h.innerHTML=d.length?`<b>${d.length} items found</b>${f?` · ${f} lines skipped (no price)`:""} · e.g. ${d.slice(0,4).map(C=>`${l(C.name)} ${x(C.rate)}`).join(", ")}${d.length>4?"…":""}`:m.value.trim()?"No items found yet — each line needs a name and a price.":""};m.addEventListener("input",o),$("#impFile",b.el).addEventListener("change",async d=>{const f=d.target.files[0];f&&(m.value=await f.text(),o())}),$("#impSample",b.el).addEventListener("click",()=>Te("billx-items-sample.csv",Ze,"text/csv")),m.focus()}a(),s&&s.get("import")&&i(),$("#importItems").addEventListener("click",i),$("#exportItems").addEventListener("click",()=>{const b=[["Code","Name","Price","Category","GST %","Unit","HSN","Description"],...P("items").map(m=>[m.code||"",m.name,m.rate,m.category||"",m.tax,m.unit||"",m.hsn||"",m.description||""])];Te("billx-items.csv",mt(b),"text/csv")}),$("#addItem").addEventListener("click",()=>{z("items",{name:"New item",description:"",category:"",hsn:"",unit:"pcs",rate:0,tax:c}),O(),a();const b=$('#itemsTable tbody tr input[data-k="name"]',e);b&&(b.focus(),b.select())}),$("#addStarter").addEventListener("click",()=>{const b=new Set(P("items").map(h=>h.name.toLowerCase()));let m=0;for(const h of lt(t.industry))b.has(h.name.toLowerCase())||(z("items",h),m++);O(),I(m?`Added ${m} items`:"Starter items are already in your list"),a()})}const va=`<style>.kot{width:72mm;padding:3mm;font:12pt 'JetBrains Mono',ui-monospace,monospace;color:#000}
.kot-h{text-align:center;font-weight:800;border-bottom:1px dashed #000;padding-bottom:2mm;margin-bottom:2mm}
.kot-meta{display:flex;justify-content:space-between;margin-bottom:2mm}.kot table{width:100%;border-collapse:collapse}
.kot td{padding:1mm 0;vertical-align:top}.kot td.q{width:12mm;font-weight:800;font-size:14pt}.kot-note{border-top:1px dashed #000;margin-top:2mm;padding-top:2mm}</style>`;function et(e=_()){const n=Et(e.industry);return{slot:n.slot,tables:n.tables,autoPrint:!0,receipt:["restaurant","bakery","grocery","retail","pharmacy"].includes(e.industry)?"thermal":"design",showCodes:!0,...e.pos||{}}}const tt=e=>[...String(e||"")].reduce((n,s)=>(n*31+s.charCodeAt(0))%360,210);function $a(e){const n=_();let s=et(n);const t=n.taxMode!=="none";let c=P("items").some(r=>Number(r.sold)>0)?"popular":"all",a="",i=b("");function b(r){const S=Le("invoice");return Object.assign(S,{pos:!0,items:[],terms:"",notes:"",dueDate:S.date,fields:{...r?{table:r}:{}},client:null,clientId:""}),S}const m=()=>P("docs").filter(r=>r.pos&&r.status==="draft"),h=r=>m().find(S=>(S.fields||{}).table===String(r));K("Quick Bill",`
    <button class="btn" id="qbHeld" title="Open orders">${g("pause")}<span class="hide-sm"> Open orders</span> <b id="qbHeldN"></b></button>
    <button class="icon-btn" id="qbSettings" title="Quick Bill settings" aria-label="Quick Bill settings">${g("settings")}</button>`),e.innerHTML=`
  <div class="qb">
    <section class="qb-menu">
      <div class="qb-search">${g("search",18)}<input id="qbq" autocomplete="off" spellcheck="false" placeholder="Type item name or code, press Enter"><kbd>/</kbd></div>
      <div class="qb-tabs" id="qbTabs" role="tablist"></div>
      <div class="qb-grid" id="qbGrid"></div>
    </section>
    <aside class="qb-order" id="qbOrder">
      <div class="qb-order-head">
        <div class="qb-order-title"><b id="qbTitle"></b><small id="qbNumber"></small></div>
        <button class="icon-btn qb-close" id="qbClose" aria-label="Back to menu">${g("x")}</button>
      </div>
      <div class="qb-slots" id="qbSlots"></div>
      <input class="qb-cust" id="qbCust" placeholder="Customer name or phone (optional)" autocomplete="off">
      <div class="qb-lines" id="qbLines"></div>
      <div class="qb-totals" id="qbTotals"></div>
      <div class="qb-actions">
        <div class="qb-row3">
          <button class="btn" id="qbHold" title="Hold order (F4)">${g("pause",16)} Hold</button>
          <button class="btn" id="qbKot" title="Print kitchen ticket">${g("chef",16)} KOT</button>
          <button class="btn danger-text" id="qbClear" title="Clear">${g("trash",16)}</button>
        </div>
        <div class="qb-pay">
          <button class="btn qb-paybtn cash" data-pay="Cash"><span>Cash</span><kbd>F8</kbd></button>
          <button class="btn qb-paybtn upi" data-pay="UPI"><span>UPI</span><kbd>F9</kbd></button>
          <button class="btn qb-paybtn card" data-pay="Card"><span>Card</span><kbd>F10</kbd></button>
        </div>
      </div>
    </aside>
    <button class="qb-mobilebar" id="qbBar"><span id="qbBarCount">0 items</span><b id="qbBarTotal">${x(0)}</b><span>View order ›</span></button>
  </div>`;const o=e.firstElementChild,d=$("#qbq",o);function f(){const r=ba(Je(P("items"),"all")),S=[["popular","Popular"],["all","All"],...r.map(L=>[L,L])];$("#qbTabs",o).innerHTML=S.map(([L,D])=>`<button role="tab" class="${L===c&&!a?"on":""}" data-tab="${l(L)}" ${L!=="popular"&&L!=="all"?`style="--h:${tt(L)}"`:""}>${l(D)}</button>`).join("")}function C(){const r=P("items"),S=a?yt(a,r,120):Je(r,c),L=Object.fromEntries(i.items.map(D=>[D.itemId,D.qty]));if(!r.length){$("#qbGrid",o).innerHTML=`<div class="qb-empty">${g("box",40)}<p>Add your menu or products once, then bill with one tap.</p>
        <div class="row-gap wrap"><a class="btn primary" href="#/items?import=1">${g("upload")} Import 100 items at once</a><a class="btn" href="#/items">${g("plus")} Add items</a></div></div>`;return}$("#qbGrid",o).innerHTML=S.map(D=>`<button class="qb-tile${L[D.id]?" in":""}" data-id="${D.id}" style="--h:${tt(D.category)}">
        ${s.showCodes&&D.code?`<span class="qb-code">${l(D.code)}</span>`:""}
        ${L[D.id]?`<span class="qb-badge">${L[D.id]}</span>`:""}
        <span class="qb-name">${l(D.name)}</span><span class="qb-price">${x(D.rate)}</span></button>`).join("")||`<div class="qb-empty"><p>No item matches "${l(a)}".</p></div>`}function N(){const r=$("#qbSlots",o);if(!s.slot||!(s.tables>0)){r.hidden=!0;return}r.hidden=!1;const S=Object.fromEntries(m().map(E=>[(E.fields||{}).table,ce(E).payable])),L=(i.fields||{}).table||"",D=Array.from({length:s.tables},(E,j)=>String(j+1));r.innerHTML=`<button class="qb-slot${L?"":" on"}" data-slot="">${s.slot==="Table"?"Takeaway":"Walk-in"}</button>${D.map(E=>`<button class="qb-slot${L===E?" on":""}${S[E]!==void 0?" busy":""}" data-slot="${E}" title="${l(s.slot)} ${E}${S[E]!==void 0?` · ${x(S[E])}`:""}">${l(s.slot.charAt(0))}${E}</button>`).join("")}`}function T(){const r=ce(i,n),S=(i.fields||{}).table;$("#qbTitle",o).textContent=S?`${s.slot} ${S}`:s.slot==="Table"?"Takeaway":"New bill",$("#qbNumber",o).textContent=i.id?`${i.number} · held`:i.number,$("#qbLines",o).innerHTML=i.items.length?i.items.map((E,j)=>`<div class="qb-line" data-i="${j}">
        <div class="qb-line-name"><b>${l(E.name)}</b><small>${x(E.rate)}${E.tax?` · ${E.tax}% GST`:""}</small></div>
        <div class="qb-qty"><button class="icon-btn" data-dq="-1" aria-label="One less">${g("minus",16)}</button><input value="${l(E.qty)}" inputmode="decimal" data-setq aria-label="Quantity"><button class="icon-btn" data-dq="1" aria-label="One more">${g("plus",16)}</button></div>
        <b class="qb-line-amt">${x(E.qty*E.rate)}</b></div>`).join(""):'<p class="qb-hint">Tap items, or type a name or code and press <kbd>Enter</kbd>.<br><small>Tip: <b>3*12</b> adds 3 of item 12 · <kbd>F8</kbd> Cash · <kbd>F9</kbd> UPI · <kbd>F4</kbd> Hold</small></p>';const L=i.items.reduce((E,j)=>E+(Number(j.qty)||0),0);$("#qbTotals",o).innerHTML=`${r.totalTax?`<div><span>Sub total</span><span>${x(r.taxable)}</span></div><div><span>GST</span><span>${x(r.totalTax)}</span></div>`:""}
      ${r.roundOff?`<div><span>Round off</span><span>${x(r.roundOff)}</span></div>`:""}
      <div class="qb-grand"><span>${L} item${L===1?"":"s"}</span><b>${x(r.payable)}</b></div>`,$("#qbBarCount",o).textContent=`${L} item${L===1?"":"s"}`,$("#qbBarTotal",o).textContent=x(r.payable),o.classList.toggle("has-items",L>0);const D=m().length;$("#qbHeldN").textContent=D||""}const B=()=>{f(),C(),N(),T()};B(),setTimeout(()=>d.focus(),50);function M(r,S=1){i.items=Qe(i.items,r,S,t),i.id&&le(i),C(),T();const L=$(`.qb-tile[data-id="${r.id}"]`,o);L&&(L.classList.remove("pop"),L.offsetWidth,L.classList.add("pop"))}function F(r,S){i.items=ma(i.items,r,S),i.id&&le(i),C(),T()}function q(){const r=$("#qbCust",o).value.trim();if(!r){i.client=null,i.clientId="";return}const S=r.replace(/\D/g,""),L=P("clients").find(D=>S.length>=6&&String(D.phone||"").replace(/\D/g,"").endsWith(S.slice(-10))||D.name.toLowerCase()===r.toLowerCase());L?(i.clientId=L.id,i.client={id:L.id,name:L.name,phone:L.phone,extra:{}}):(i.clientId="",i.client=S.length>=6?{name:"Customer",phone:r,extra:{}}:{name:r,extra:{}})}function U(r=!1){return i.items.length?(q(),i.status="draft",le(i),O(),r||I(`Held: ${(i.fields||{}).table?`${s.slot} ${i.fields.table}`:i.number}`),!0):(r||I("Nothing to hold yet","err"),!1)}function R(r){const S=r?h(r):null;i=S?JSON.parse(JSON.stringify(S)):b(r),$("#qbCust",o).value=i.client?i.client.phone&&i.client.name==="Customer"?i.client.phone:i.client.name:"",B()}function Y(r){const S=(i.fields||{}).table||"";if(r!==S){if(!i.id&&i.items.length){const L=r?h(r):null;if(!L){i.fields={...i.fields,table:r},r||delete i.fields.table,N(),T();return}let D=L.items;for(const E of i.items)D=Qe(D,{id:E.itemId,name:E.name,rate:E.rate,tax:E.tax,unit:E.unit,hsn:E.hsn,category:E.category},E.qty,t);L.items=D,le(L),I(`Added to ${s.slot} ${r}`),R(r);return}i.id&&i.items.length&&U(!0),R(r)}}function ne(r,S=""){q();const L=ce(i,n);i.status="sent",i.payments=[{id:Date.now().toString(36),date:ee(),amount:L.payable,method:r,ref:S}],i.dueDate=i.date,i.template=s.receipt==="design"?"":"thermal";const D=le(i),E={};for(const j of D.items)j.itemId&&(E[j.itemId]=(E[j.itemId]||0)+(Number(j.qty)||0));for(const j of P("items"))E[j.id]&&z("items",{...j,sold:(Number(j.sold)||0)+E[j.id]});O(),s.autoPrint&&ue([D],s.receipt==="thermal58"?{...n,design:{...n.design,paper:"58mm"}}:n),I(`${D.number} · ${x(L.payable)} · ${r}`),i=b(""),$("#qbCust",o).value="",a="",d.value="",o.classList.remove("show-order"),B(),d.focus()}function w(r){if(!i.items.length){I("Add items first","err");return}const S=ce(i,n);if(r!=="UPI"){ne(r);return}const L=n.business.upiId?qt({upiId:n.business.upiId,payee:n.business.name,amount:S.payable,note:i.number}):"";se({title:`UPI · ${x(S.payable)}`,submit:"Payment received",cancel:"Back",body:L?`<div class="qb-upi">${It(L,{size:260})}<p>Customer scans with GPay, PhonePe, Paytm or any UPI app.</p><b>${x(S.payable)}</b></div>`:'<p>Add your UPI ID in <a href="#/settings">Settings → Getting paid</a> to show a scan-to-pay QR here. You can still record this as a UPI payment.</p>',onSubmit:E=>{ne("UPI",E.get("ref")||"")}}).el.querySelector(".modal-body").insertAdjacentHTML("beforeend",k("UPI reference (optional)",'<input name="ref" placeholder="Last 4–12 digits of UTR">'))}function A(){if(!i.items.length){I("Add items first","err");return}i.id||U(!0),Qt(va+ha({number:i.number,table:(i.fields||{}).table,slotLabel:s.slot||"Table",lines:i.items,note:i.notes})),T()}async function u(){if(i.items.length){if(i.id){if(!await Z("Cancel this order?",`${i.number} will be marked cancelled.`,"Cancel order"))return;i.status="cancelled",le(i),O()}else if(!await Z("Clear the bill?","All items in this bill will be removed.","Clear"))return;i=b(""),$("#qbCust",o).value="",B(),d.focus()}}function y(){const r=m(),S=se({title:`Open orders (${r.length})`,submit:"",cancel:"Close",body:r.length?`<div class="ws-list">${r.map(L=>`<button type="button" class="ws-item" data-open="${L.id}"><b>${(L.fields||{}).table?`${l(s.slot||"Table")} ${l(L.fields.table)}`:l(L.number)}</b><small>${l(L.number)} · ${L.items.length} lines · ${x(ce(L).payable)}</small></button>`).join("")}</div>`:'<p class="muted">No held orders.</p>'});S.el.addEventListener("click",L=>{const D=L.target.closest("[data-open]");if(!D)return;i.id&&i.items.length&&U(!0);const E=r.find(j=>j.id===D.dataset.open);i=JSON.parse(JSON.stringify(E)),S.close(),B()})}function p(){se({title:"Quick Bill settings",body:`<div class="grid g2">
        ${k("Bill by",`<select name="slot">${H([["","No tables (counter billing)"],["Table","Table"],["Room","Room"],["Chair","Chair"],["Counter","Counter"],["Seat","Seat"]],s.slot)}</select>`)}
        ${k("How many",`<input name="tables" type="number" min="0" max="200" value="${s.tables}">`)}
        ${k("Receipt",`<select name="receipt">${H([["thermal","Thermal printer 80 mm"],["thermal58","Thermal printer 58 mm"],["design","My invoice design (A4)"]],s.receipt)}</select>`)}
        <label class="check"><input type="checkbox" name="autoPrint" ${s.autoPrint?"checked":""}> Print the bill automatically after payment</label>
        <label class="check"><input type="checkbox" name="showCodes" ${s.showCodes?"checked":""}> Show item codes on tiles</label>
      </div>
      <p class="muted small">Give items short codes in Items (e.g. 12) to bill by typing the code and pressing Enter. A barcode scanner works the same way.</p>`,onSubmit:r=>{n.pos={slot:r.get("slot"),tables:Math.max(0,Math.min(200,parseInt(r.get("tables"),10)||0)),receipt:r.get("receipt"),autoPrint:r.has("autoPrint"),showCodes:r.has("showCodes")},re(),s=et(n),B(),I("Saved")}})}d.addEventListener("input",()=>{a=d.value.trim(),f(),C()}),d.addEventListener("keydown",r=>{if(r.key==="Enter"){r.preventDefault();const S=pa(d.value,P("items"));S?(M(S.item,S.qty),d.value="",a="",f(),C()):d.value.trim()&&I(`No item "${d.value.trim()}"`,"err")}else r.key==="Escape"&&(d.value="",a="",f(),C())}),o.addEventListener("click",r=>{const S=r.target.closest(".qb-tile");if(S){const pe=P("items").find(St=>St.id===S.dataset.id);pe&&M(pe);return}const L=r.target.closest("[data-tab]");if(L){c=L.dataset.tab,a="",d.value="",f(),C();return}const D=r.target.closest("[data-slot]");if(D){Y(D.dataset.slot);return}const E=r.target.closest("[data-dq]");if(E){const pe=+E.closest(".qb-line").dataset.i;F(pe,(Number(i.items[pe].qty)||0)+Number(E.dataset.dq));return}const j=r.target.closest("[data-pay]");if(j){w(j.dataset.pay);return}if(r.target.closest("#qbHold")){U()&&(i=b(""),B(),d.focus());return}if(r.target.closest("#qbKot")){A();return}if(r.target.closest("#qbClear")){u();return}if(r.target.closest("#qbBar")){o.classList.add("show-order");return}r.target.closest("#qbClose")&&o.classList.remove("show-order")}),o.addEventListener("change",r=>{r.target.matches("[data-setq]")&&F(+r.target.closest(".qb-line").dataset.i,parseFloat(r.target.value))}),$("#qbHeld").addEventListener("click",y),$("#qbSettings").addEventListener("click",p);const v=r=>{if(!o.isConnected){window.removeEventListener("keydown",v);return}if(document.querySelector("dialog[open]"))return;const S=/INPUT|TEXTAREA|SELECT/.test(document.activeElement&&document.activeElement.tagName)&&document.activeElement!==d;r.key==="F8"?(r.preventDefault(),w("Cash")):r.key==="F9"?(r.preventDefault(),w("UPI")):r.key==="F10"?(r.preventDefault(),w("Card")):r.key==="F4"?(r.preventDefault(),U()&&(i=b(""),B())):(r.key==="/"||r.key==="F2")&&!S&&document.activeElement!==d&&(r.preventDefault(),d.focus())};window.addEventListener("keydown",v)}const ga=["#2563eb","#0f766e","#16a34a","#ea580c","#b91c1c","#db2777","#7c3aed","#0369a1","#334155","#111827","#a16207","#be123c"],ya={logo:"Logo",business:"Business details",contact:"Phone / email / website",placeOfSupply:"Place of supply",dueDate:"Due date",hsn:"HSN/SAC column",unit:"Units with quantity",discountCol:"Discount column (when used)",taxCol:"Tax % column",shipTo:"Ship-to address",words:"Amount in words",taxSummary:"GST summary table",bank:"Bank details",qr:"UPI QR code",notes:"Notes",terms:"Terms",signature:"Signature block",footer:"Footer / thank-you line",stamp:"PAID / OVERDUE stamp"};function wa(){const e=_(),n=P("docs").find(c=>c.type==="invoice")||P("docs")[0];if(n)return JSON.parse(JSON.stringify(n));const s=Le("invoice");s.number=s.number||"INV-0001";const t=$e(e);return s.client={name:`Sample ${e.clientLabel||"Customer"}`,company:"",phone:"+91 90000 00000",address:"MG Road",city:"Kochi",state:"32",pincode:"682001",extra:Object.fromEntries(t.clientFields.map(c=>[c.key,We(c)]))},s.fields=Object.fromEntries(t.fields.map(c=>[c.key,We(c,0,s.date)])),s.items=lt(e.industry).slice(0,4).map((c,a)=>({...c,qty:a+1,rate:c.rate||400,discount:0})),s.status="sent",s}function Fe(e){const n=_(),s=n.design;s.show={...Nt,...s.show},s.labels=s.labels||{},s.customFields=s.customFields||[];const t=wa();K("Invoice design studio",`<button class="btn" id="printSample">${g("print")}<span class="hide-sm"> Test print</span></button>`),e.innerHTML=`
  <div class="editor design">
    <div class="editor-form">
      <section class="card">
        <h3>Template</h3>
        <div class="tpl-grid">${ke.map(h=>`<button type="button" class="tpl${h.id===s.template?" on":""}" data-tpl="${h.id}">
          <div class="tpl-thumb" data-thumb="${h.id}"></div><b>${l(h.name)}</b><small>${l(h.note)}</small></button>`).join("")}</div>
      </section>

      <section class="card">
        <h3>Brand & layout</h3>
        <div class="swatches">${ga.map(h=>`<button type="button" class="sw${h===s.accent?" on":""}" data-sw="${h}" style="background:${h}" aria-label="Colour ${h}"></button>`).join("")}
          <label class="sw-pick" title="Custom colour"><input type="color" id="accent" value="${l(s.accent)}"></label></div>
        <div class="grid g3">
          ${k("Font",`<select data-d="font">${H(Object.entries(Dt).map(([h,o])=>[h,o.name]),s.font)}</select>`)}
          ${k("Paper",`<select data-d="paper">${H(Object.entries(Bt).map(([h,o])=>[h,o.name]),s.paper)}</select>`)}
          ${k("Header alignment",`<select data-d="align">${H([["left","Left"],["center","Centre"],["right","Right"]],s.align)}</select>`)}
          ${k("Spacing",`<select data-d="density">${H([["compact","Compact"],["normal","Normal"],["roomy","Roomy"]],s.density)}</select>`)}
          <label class="check"><input type="checkbox" data-d="groupByCategory" ${s.groupByCategory?"checked":""}> Group lines by category with sub-totals</label>
        </div>
        <div class="grid g2">
          <div class="upload">
            <span>Logo</span>
            <div class="upload-box">${n.business.logo?`<img src="${l(n.business.logo)}" alt="Logo">`:'<span class="muted">No logo</span>'}</div>
            <div class="row-gap"><label class="btn">${g("upload")} Upload<input type="file" accept="image/*" data-img="logo" hidden></label>${n.business.logo?'<button type="button" class="btn ghost" data-clear="logo">Remove</button>':""}</div>
          </div>
          <div class="upload">
            <span>Signature / seal</span>
            <div class="upload-box">${n.business.signature?`<img src="${l(n.business.signature)}" alt="Signature">`:'<span class="muted">No signature</span>'}</div>
            <div class="row-gap"><label class="btn">${g("upload")} Upload<input type="file" accept="image/*" data-img="signature" hidden></label>${n.business.signature?'<button type="button" class="btn ghost" data-clear="signature">Remove</button>':""}</div>
          </div>
        </div>
      </section>

      <section class="card">
        <h3>Show on the document</h3>
        <div class="toggles">${Object.entries(ya).map(([h,o])=>`<label class="check"><input type="checkbox" data-show="${h}" ${s.show[h]?"checked":""}> ${l(o)}</label>`).join("")}</div>
      </section>

      <section class="card">
        <h3>Document titles</h3>
        <div class="grid g3">${Object.entries(V).map(([h,o])=>k(o.name,`<input data-title="${h}" value="${l(n.docTitles[h]||o.title)}">`)).join("")}</div>
      </section>

      <section class="card">
        <h3>Rename any label <small>leave blank for the default</small></h3>
        <div class="grid g3">${Object.entries(At).map(([h,o])=>k(o,`<input data-label="${h}" value="${l(s.labels[h]||"")}" placeholder="${l(o)}">`)).join("")}</div>
      </section>

      <section class="card">
        <h3>Default extra fields <small>added to every new document</small></h3>
        <div id="dcf"></div>
        <button type="button" class="btn ghost" id="addDcf">${g("plus")} Add field</button>
        ${k("Footer text",`<input id="footer" value="${l(n.footer||"")}" placeholder="e.g. This is a computer-generated invoice">`)}
      </section>
    </div>
    <aside class="editor-preview">
      <div class="preview-bar"><span>Preview</span><span class="muted">${P("docs").length?"your latest invoice":"sample data"}</span></div>
      <div id="preview"></div>
    </aside>
  </div>`;const c=e.firstElementChild,a=$("#preview",e),i=()=>W("[data-thumb]",e).forEach(h=>Ce(h,{...t,template:h.dataset.thumb,accent:""},n,{maxScale:.3})),b=(h=!1)=>{re(),Ce(a,{...t,template:"",accent:""},n),h&&i()};b(!0);const m=()=>{$("#dcf",e).innerHTML=s.customFields.map((h,o)=>`<div class="cf" data-j="${o}">
      <input data-dcf="label" placeholder="Label" value="${l(h.label)}"><input data-dcf="value" placeholder="Default value" value="${l(h.value||"")}">
      <button type="button" class="icon-btn danger" data-dcfdel aria-label="Remove">${g("trash",16)}</button></div>`).join("")||'<p class="muted">e.g. "E-way bill No.", "Vehicle No.", "Delivery date".</p>'};m(),c.addEventListener("click",async h=>{const o=h.target.closest("[data-tpl]");if(o){s.template=o.dataset.tpl,s.template==="thermal"?s.paper="80mm":["80mm","58mm"].includes(s.paper)&&(s.paper="A4"),$('[data-d="paper"]',e).value=s.paper,W(".tpl",e).forEach(C=>C.classList.toggle("on",C===o)),b();return}const d=h.target.closest("[data-sw]");if(d){s.accent=d.dataset.sw,$("#accent",e).value=s.accent,W(".sw",e).forEach(C=>C.classList.toggle("on",C===d)),b(!0);return}const f=h.target.closest("[data-clear]");if(f){n.business[f.dataset.clear]="",O(),Fe(e);return}if(h.target.closest("#addDcf")){s.customFields.push({label:"",value:""}),m();return}h.target.closest("[data-dcfdel]")&&(s.customFields.splice(+h.target.closest(".cf").dataset.j,1),m(),re())}),c.addEventListener("input",h=>{const o=h.target;o.id==="accent"?(s.accent=o.value,W(".sw",e).forEach(d=>d.classList.remove("on")),b()):o.dataset.label?(o.value.trim()?s.labels[o.dataset.label]=o.value:delete s.labels[o.dataset.label],b()):o.dataset.title?(n.docTitles[o.dataset.title]=o.value,o.dataset.title===t.type&&(t.title=o.value),b()):o.dataset.dcf?(s.customFields[+o.closest(".cf").dataset.j][o.dataset.dcf]=o.value,re()):o.id==="footer"&&(n.footer=o.value,b())}),c.addEventListener("change",async h=>{const o=h.target;if(o.dataset.d)s[o.dataset.d]=o.type==="checkbox"?o.checked:o.value,o.dataset.d==="paper"&&["80mm","58mm"].includes(o.value)&&(s.template="thermal"),o.dataset.d==="paper"&&!["80mm","58mm"].includes(o.value)&&s.template==="thermal"&&(s.template="modern"),W(".tpl",e).forEach(d=>d.classList.toggle("on",d.dataset.tpl===s.template)),b(o.dataset.d==="font");else if(o.dataset.show)s.show[o.dataset.show]=o.checked,b();else if(o.dataset.img)try{n.business[o.dataset.img]=await rt(o.files[0],o.dataset.img==="logo"?480:360),O()||I("Image too large for browser storage","err"),Fe(e)}catch(d){I(d.message,"err")}}),$("#printSample").addEventListener("click",()=>ue([{...t,template:"",accent:""}],n))}function ka(){const e=ee(),[n,s]=e.split("-").map(Number),t=(b,m)=>`${b}-${String(m).padStart(2,"0")}`,c=(b,m)=>new Date(Date.UTC(b,m,0)).toISOString().slice(0,10),a=s===1?[n-1,12]:[n,s-1],i=s>=4?n:n-1;return{month:["This month",`${t(n,s)}-01`,c(n,s)],last:["Last month",`${t(...a)}-01`,c(...a)],q:["Last 90 days",jt(e,-89),e],fy:[`FY ${i}-${String(i+1).slice(2)}`,`${i}-04-01`,`${i+1}-03-31`],pfy:[`FY ${i-1}-${String(i).slice(2)}`,`${i-1}-04-01`,`${i}-03-31`],all:["All time","0000-01-01","9999-12-31"]}}function xa(e,n,s){const t=ka(),c=s.get("p")||"fy",[a,i,b]=c==="custom"?["Custom",s.get("from")||ee(),s.get("to")||ee()]:t[c]||t.fy;K("Reports",`<button class="btn" id="csv">${g("download")}<span class="hide-sm"> Export CSV</span></button>`);const m=p=>p.date>=i&&p.date<=b,h=de(p=>m(p)&&p.status!=="cancelled"&&p.status!=="draft"),o=h.filter(p=>p.d.type==="invoice"),d=h.filter(p=>p.d.type==="credit"),f=(p,v)=>p.reduce((r,S)=>r+v(S),0),C=f(o,p=>p.t.total),N=f(o,p=>p.t.totalTax),T=f(o,p=>p.t.paid),B=f(o,p=>p.t.insurance),M=f(d,p=>p.t.total),F=f(o,p=>Math.max(p.t.balance,0)),q=new Map;for(const p of o){const v=p.d.date.slice(0,7),r=q.get(v)||{n:0,taxable:0,tax:0,total:0,paid:0};r.n++,r.taxable+=p.t.taxable,r.tax+=p.t.totalTax,r.total+=p.t.total,r.paid+=p.t.paid,q.set(v,r)}const U=[...q.entries()].sort((p,v)=>p[0].localeCompare(v[0])),R=Math.max(1,...U.map(([,p])=>p.total)),Y=new Map;for(const p of o)for(const v of p.t.taxes){const r=Y.get(v.rate)||{taxable:0,cgst:0,sgst:0,igst:0};r.taxable+=v.taxable,r.cgst+=v.cgst||0,r.sgst+=v.sgst||0,r.igst+=v.igst||(_().taxMode!=="gst"?v.amount:0),Y.set(v.rate,r)}const ne=f(o,p=>p.t.taxable-p.t.taxes.reduce((v,r)=>v+r.taxable,0)),w=de(p=>p.type==="invoice"&&p.status!=="cancelled"&&p.status!=="draft").filter(p=>p.t.balance>.004),A=[["Not due",0,0],["1-30 days",1,30],["31-60 days",31,60],["61-90 days",61,90],["90+ days",91,1e9]].map(([p,v,r])=>{const S=w.filter(L=>{const D=Pt(L.d);return D>=v&&D<=r});return{l:p,n:S.length,amt:f(S,L=>L.t.balance)}}),u=new Map;for(const p of o){const v=p.d.client&&p.d.client.name||"—",r=u.get(v)||{total:0,paid:0,n:0,id:p.d.clientId};r.total+=p.t.total,r.paid+=p.t.paid,r.n++,u.set(v,r)}const y=[...u.entries()].sort((p,v)=>v[1].total-p[1].total).slice(0,10);e.innerHTML=`
    <div class="toolbar">
      <div class="chips">${Object.entries(t).map(([p,[v]])=>`<a class="chip${p===c?" on":""}" href="#/reports?p=${p}">${l(v)}</a>`).join("")}</div>
      <form class="row-gap" id="custom"><input type="date" name="from" value="${l(i>"0001"?i:"")}"><span>to</span><input type="date" name="to" value="${l(b<"9999"?b:"")}"><button class="btn">Apply</button></form>
    </div>
    <p class="muted">${l(a)}${c!=="all"?` · ${l(i)} to ${l(b)}`:""} · issued invoices only</p>
    <div class="kpis">
      <div class="kpi"><span>Invoiced</span><b>${x(C)}</b><small>${o.length} invoices</small></div>
      <div class="kpi"><span>Tax collected</span><b>${x(N)}</b></div>
      <div class="kpi good"><span>Received</span><b>${x(T)}</b></div>
      ${B?`<div class="kpi"><span>Insurance / TPA share</span><b>${x(B)}</b></div>`:""}
      ${M?`<div class="kpi"><span>Credit notes</span><b>${x(M)}</b></div>`:""}
      <div class="kpi warn"><span>Outstanding</span><b>${x(F)}</b></div>
    </div>
    <div class="two-col">
      <section class="card">
        <h3>Month by month</h3>
        ${U.length?`<div class="bars">${U.map(([p,v])=>`<div class="bar-row"><span>${l(p)}</span><div class="bar"><i style="width:${v.total/R*100}%"></i><i class="paid" style="width:${v.paid/R*100}%"></i></div><b>${x(v.total)}</b></div>`).join("")}</div>
        <p class="legend"><i></i> Invoiced <i class="paid"></i> Received</p>
        <div class="table-wrap"><table class="table"><thead><tr><th>Month</th><th class="num">Invoices</th><th class="num">Taxable</th><th class="num">Tax</th><th class="num">Total</th><th class="num">Received</th></tr></thead>
        <tbody>${U.map(([p,v])=>`<tr><td>${l(p)}</td><td class="num">${v.n}</td><td class="num">${x(v.taxable)}</td><td class="num">${x(v.tax)}</td><td class="num">${x(v.total)}</td><td class="num">${x(v.paid)}</td></tr>`).join("")}</tbody></table></div>`:'<p class="muted">No invoices in this period.</p>'}
      </section>
      <section class="card">
        <h3>GST summary <small>for GSTR-1 / 3B</small></h3>
        <div class="table-wrap"><table class="table"><thead><tr><th>Rate</th><th class="num">Taxable</th><th class="num">CGST</th><th class="num">SGST</th><th class="num">IGST</th></tr></thead>
        <tbody>${[...Y.entries()].sort((p,v)=>p[0]-v[0]).map(([p,v])=>`<tr><td>${p}%</td><td class="num">${x(v.taxable)}</td><td class="num">${x(v.cgst)}</td><td class="num">${x(v.sgst)}</td><td class="num">${x(v.igst)}</td></tr>`).join("")}
        ${ne>.004?`<tr><td>Nil / exempt</td><td class="num">${x(ne)}</td><td class="num">–</td><td class="num">–</td><td class="num">–</td></tr>`:""}</tbody></table></div>
        <h3>Receivables ageing <small>all open invoices</small></h3>
        <div class="table-wrap"><table class="table"><tbody>${A.map(p=>`<tr><td>${p.l}</td><td class="num">${p.n}</td><td class="num">${x(p.amt)}</td></tr>`).join("")}</tbody></table></div>
        <h3>Top ${l(X().toLowerCase())}s</h3>
        <div class="table-wrap"><table class="table"><tbody>${y.map(([p,v])=>`<tr${v.id?` class="link" data-client="${v.id}"`:""}><td>${l(p)}</td><td class="num">${v.n}</td><td class="num">${x(v.total)}</td></tr>`).join("")||'<tr><td class="muted">No data</td></tr>'}</tbody></table></div>
      </section>
    </div>`,$("#custom",e).addEventListener("submit",p=>{p.preventDefault();const v=new FormData(p.target);G(`#/reports?p=custom&from=${v.get("from")||ee()}&to=${v.get("to")||ee()}`)}),e.querySelectorAll("[data-client]").forEach(p=>p.addEventListener("click",()=>G(`#/client/${p.dataset.client}`))),$("#csv").addEventListener("click",()=>{const p=de(S=>m(S)),v=["Type","Number","Date","Due date","Status",X(),"Company","GSTIN","Place of supply","Taxable","CGST","SGST","IGST","Total tax","Total","Insurance","Paid","Balance"],r=p.map(({d:S,t:L,status:D})=>[V[S.type].name,S.number,S.date,S.dueDate,D,S.client&&S.client.name,S.client&&S.client.company,S.client&&S.client.gstin,S.placeOfSupply,L.taxable,L.taxes.reduce((E,j)=>E+(j.cgst||0),0).toFixed(2),L.taxes.reduce((E,j)=>E+(j.sgst||0),0).toFixed(2),L.taxes.reduce((E,j)=>E+(j.igst||0),0).toFixed(2),L.totalTax,L.total,L.insurance,L.paid,L.balance]);Te(`documents-${i>"0001"?i:"all"}-to-${b<"9999"?b:ee()}.csv`,mt([v,...r]),"text/csv")})}function xe(e){const n=_(),s=n.business;K("Settings",'<button class="btn primary" form="setForm">Save settings</button>'),e.innerHTML=`
  <form id="setForm" class="settings">
    <section class="card">
      <h3>Business profile</h3>
      <div class="grid g3">
        ${k("Business name *",`<input name="b.name" required value="${l(s.name)}">`)}
        ${k("Tagline",`<input name="b.tagline" value="${l(s.tagline)}">`)}
        ${k("Registration / licence no.",`<input name="b.regNo" value="${l(s.regNo)}" placeholder="e.g. Clinical Est. Reg. No.">`)}
        ${k("Address",`<textarea name="b.address" rows="2">${l(s.address)}</textarea>`,"span2")}
        ${k("City",`<input name="b.city" value="${l(s.city)}">`)}
        ${k("State",`<select name="b.state">${H(qe.map(([o,d])=>[o,`${d} (${o})`]),s.state)}</select>`)}
        ${k("PIN code",`<input name="b.pincode" value="${l(s.pincode)}">`)}
        ${k("Phone / WhatsApp",`<input name="b.phone" value="${l(s.phone)}">`)}
        ${k("Email",`<input name="b.email" type="email" value="${l(s.email)}">`)}
        ${k("Website",`<input name="b.website" value="${l(s.website)}">`)}
        ${k("GSTIN",`<input name="b.gstin" value="${l(s.gstin)}" maxlength="15" style="text-transform:uppercase">`)}
        ${k("PAN",`<input name="b.pan" value="${l(s.pan)}" maxlength="10" style="text-transform:uppercase">`)}
      </div>
      <div class="grid g2">
        ${["logo","signature"].map(o=>`<div class="upload"><span>${o==="logo"?"Logo":"Signature / seal"}</span>
          <div class="upload-box">${s[o]?`<img src="${l(s[o])}" alt="">`:'<span class="muted">None</span>'}</div>
          <div class="row-gap"><label class="btn">${g("upload")} Upload<input type="file" accept="image/*" data-img="${o}" hidden></label>${s[o]?`<button type="button" class="btn ghost" data-clear="${o}">Remove</button>`:""}</div></div>`).join("")}
      </div>
    </section>

    <section class="card">
      <h3>Getting paid</h3>
      <div class="grid g3">
        ${k("UPI ID (for QR & pay button)",`<input name="b.upiId" value="${l(s.upiId)}" placeholder="name@okhdfcbank">`)}
        ${k("Account name",`<input name="b.accountName" value="${l(s.accountName)}">`)}
        ${k("Bank",`<input name="b.bankName" value="${l(s.bankName)}">`)}
        ${k("Account number",`<input name="b.accountNo" value="${l(s.accountNo)}">`)}
        ${k("IFSC",`<input name="b.ifsc" value="${l(s.ifsc)}" style="text-transform:uppercase">`)}
        ${k("Branch",`<input name="b.branch" value="${l(s.branch)}">`)}
      </div>
    </section>

    <section class="card">
      <h3>Business type <small>now: ${l(ie[n.industry]?ie[n.industry].name:"General")}</small></h3>
      <p class="muted">Switching sets the labels, bill fields, starter items, default tax and design for that kind of business. Existing documents are kept.</p>
      <details class="sp-details"><summary class="btn">Change business type</summary>${ft(n.industry)}</details>
      ${k("What do you call your customers?",`<input name="clientLabel" value="${l(n.clientLabel)}" placeholder="Customer, Client, Patient, Student, Guest, Member, Tenant…">`)}
    </section>

    <section class="card" id="fieldsCard">
      <h3>Fields on your bills <small>add, rename or remove anything</small></h3>
      <div id="fieldEditor"></div>
    </section>

    <section class="card">
      <h3>Tax & money</h3>
      <div class="grid g3">
        ${k("Currency",`<select name="currency">${H(Object.keys(Se).map(o=>[o,`${o} (${Se[o].symbol})`]),n.currency)}</select>`)}
        ${k("Tax system",`<select name="taxMode">${H([["gst","India GST (CGST+SGST / IGST)"],["simple","Simple tax / VAT"],["none","No tax"]],n.taxMode)}</select>`)}
        ${k("Default tax %",`<input name="defaultTax" type="number" step="any" min="0" value="${l(n.defaultTax)}">`)}
        ${k("Payment due after (days)",`<input name="dueDays" type="number" min="0" value="${l(n.dueDays)}">`)}
        <label class="check"><input type="checkbox" name="roundOff" ${n.roundOff?"checked":""}> Round total to whole number</label>
        <label class="check"><input type="checkbox" name="taxInclusive" ${n.taxInclusive?"checked":""}> Rates already include tax (MRP style)</label>
      </div>
    </section>

    <section class="card">
      <h3>Numbering <small>{YYYY} = year, {FY} = financial year, e.g. INV/{FY}/</small></h3>
      <div class="table-wrap"><table class="table edit-table"><thead><tr><th>Document</th><th>Prefix</th><th>Next no.</th><th>Digits</th><th>Suffix</th><th>Next will be</th></tr></thead>
      <tbody>${Object.entries(V).map(([o,d])=>`<tr><td>${l(d.name)}</td>
        <td><input name="n.${o}.prefix" value="${l(n.numbering[o].prefix)}"></td>
        <td><input name="n.${o}.next" type="number" min="1" value="${l(n.numbering[o].next)}"></td>
        <td><input name="n.${o}.pad" type="number" min="1" max="8" value="${l(n.numbering[o].pad)}"></td>
        <td><input name="n.${o}.suffix" value="${l(n.numbering[o].suffix)}"></td>
        <td><b>${l(Mt(o))}</b></td></tr>`).join("")}</tbody></table></div>
    </section>

    <section class="card">
      <h3>Default text</h3>
      <div class="grid g2">
        ${k("Notes on new documents",`<textarea name="notes" rows="3">${l(n.notes)}</textarea>`)}
        ${k("Terms on new documents",`<textarea name="terms" rows="3">${l(n.terms)}</textarea>`)}
      </div>
    </section>
  </form>

  <section class="card">
    <h3>Your data</h3>
    <p class="muted">Everything is saved in this browser on this device. Download a backup regularly and keep it safe; restore it on any device.</p>
    <div class="row-gap wrap">
      <button class="btn" id="exp">${g("download")} Download backup</button>
      <label class="btn">${g("upload")} Restore backup<input type="file" id="imp" accept="application/json,.json" hidden></label>
      <button class="btn" id="sample">${g("refresh")} Add sample data</button>
      <button class="btn danger-text" id="reset">${g("trash")} Erase this business's data</button>
      ${Re().length>1?`<button class="btn danger-text" id="delWs">${g("trash")} Remove this business from BillX</button>`:""}
    </div>
    <p class="muted small">Backups cover the business you have open (${l(s.name)}). Switch business from the sidebar to back up the others.</p>
  </section>`;const t=$("#setForm",e);vt(t,o=>{t.elements.clientLabel.value=ie[o].clientLabel});const c=$e(n),a={fields:c.fields.map(o=>({...o})),clientFields:c.clientFields.map(o=>({...o})),itemCols:c.itemCols.filter(o=>!o.hidden).map(o=>({...o})),hiddenCols:c.itemCols.filter(o=>o.hidden),insurance:c.insurance},i=[["fields","Bill details","Shown with the number and date on every bill: e.g. Vehicle No., Room No., Project, Table, Event date.",!0],["clientFields",`${n.clientLabel} fields`,`Saved on each ${n.clientLabel.toLowerCase()} and printed under their name: e.g. Member ID, Age, PAN.`,!1],["itemCols","Extra item columns","Extra columns in the items table: e.g. Batch, Expiry, Size, Colour, Serial / IMEI, Weight.",!1]],b=()=>{$("#fieldEditor",e).innerHTML=`${i.map(([o,d,f,C])=>`<div class="fe-block" data-list="${o}">
      <div class="fe-head"><b>${l(d)}</b><span class="muted small">${l(f)}</span></div>
      ${a[o].map((N,T)=>`<div class="fe-row" data-i="${T}">
        <input data-fe="label" value="${l(N.label)}" placeholder="Field name" aria-label="Field name">
        ${C?`<select data-fe="type" aria-label="Type">${H([["","Text"],["date","Date"]],N.type||"")}</select>`:""}
        <button type="button" class="icon-btn" data-fe-move="-1" aria-label="Move up">${g("up",16)}</button>
        <button type="button" class="icon-btn danger" data-fe-del aria-label="Remove">${g("trash",16)}</button>
      </div>`).join("")||'<p class="muted small">None.</p>'}
      <button type="button" class="btn ghost" data-fe-add>${g("plus")} Add</button>
    </div>`).join("")}
    <label class="check"><input type="checkbox" data-fe-ins ${a.insurance?"checked":""}> Third-party share on bills (insurance / TPA / sponsor / subsidy pays part, the rest is payable)</label>`};b();const m=$("#fieldEditor",e);m.addEventListener("input",o=>{const d=o.target.closest(".fe-row");if(!d)return;const f=a[d.closest("[data-list]").dataset.list];f[+d.dataset.i][o.target.dataset.fe]=o.target.value,Q(!0)}),m.addEventListener("change",o=>{o.target.matches("[data-fe-ins]")&&(a.insurance=o.target.checked,Q(!0))}),m.addEventListener("click",o=>{const d=o.target.closest("[data-list]");if(!d)return;const f=!!o.target.closest("[data-fe-add]"),C=a[d.dataset.list],N=o.target.closest(".fe-row");if(f)C.push({key:`f${Date.now().toString(36)}`,label:""});else if(N&&o.target.closest("[data-fe-del]"))C.splice(+N.dataset.i,1);else if(N&&o.target.closest("[data-fe-move]")){const T=+N.dataset.i;T>0&&([C[T-1],C[T]]=[C[T],C[T-1]])}else return;if(Q(!0),b(),f){const T=m.querySelectorAll(`[data-list="${d.dataset.list}"] [data-fe="label"]`);T.length&&T[T.length-1].focus()}}),t.addEventListener("input",()=>Q(!0)),t.addEventListener("change",async o=>{const d=o.target;if(d.dataset.img)try{s[d.dataset.img]=await rt(d.files[0],d.dataset.img==="logo"?480:360),O()?I("Image saved"):I("Image too large for browser storage","err"),Q(!1),xe(e)}catch(f){I(f.message,"err")}}),t.addEventListener("click",o=>{const d=o.target.closest("[data-clear]");d&&(s[d.dataset.clear]="",O(),xe(e))}),t.addEventListener("submit",async o=>{o.preventDefault();const d=new FormData(t),f=d.get("industry");let C=!1;if(f&&f!==n.industry&&await Z(`Switch to ${ie[f].name}?`,"Labels, fields, default tax and the default design change to suit it, and its starter items are added. Your existing documents are kept.","Switch")&&(ot(f),C=!0),!C){const N=T=>T.filter(B=>B.label&&B.label.trim()).map(B=>({...B,label:B.label.trim()}));n.sector={fields:N(a.fields),clientFields:N(a.clientFields),itemCols:[...a.hiddenCols,...N(a.itemCols)],insurance:a.insurance}}for(const[N,T]of d.entries())if(N.startsWith("b."))s[N.slice(2)]=String(T).trim();else if(N.startsWith("n.")){const[,B,M]=N.split(".");n.numbering[B][M]=["next","pad"].includes(M)?Math.max(1,parseInt(T,10)||1):String(T)}s.gstin=s.gstin.toUpperCase(),s.pan=s.pan.toUpperCase(),s.ifsc=s.ifsc.toUpperCase(),Object.assign(n,{clientLabel:C?n.clientLabel:d.get("clientLabel")||n.clientLabel,currency:d.get("currency"),taxMode:d.get("taxMode"),defaultTax:parseFloat(d.get("defaultTax"))||0,dueDays:parseInt(d.get("dueDays"),10)||0,roundOff:d.has("roundOff"),taxInclusive:d.has("taxInclusive"),notes:d.get("notes"),terms:d.get("terms")}),re(),O(),Q(!1),I("Settings saved"),xe(e)}),$("#exp",e).addEventListener("click",()=>Te(`billing-backup-${new Date().toISOString().slice(0,10)}.json`,Ot())),$("#imp",e).addEventListener("change",async o=>{const d=o.target.files[0];if(d&&await Z("Restore this backup?","It replaces all data in this browser with the backup.","Restore"))try{Ft(await d.text()),I("Backup restored"),G("#/")}catch(f){I(f.message,"err")}}),$("#sample",e).addEventListener("click",async()=>{await Z("Add sample data?","Adds demo clients, items and documents and fills the business profile with sample details. You can edit or delete them later.","Add samples")&&(it(n.industry),O(),I("Sample data added"),G("#/"))});const h=$("#delWs",e);h&&h.addEventListener("click",async()=>{await Z(`Remove ${s.name}?`,"This business and all its documents, customers and items are deleted from this browser. Download a backup first if you need it.","Remove business")&&(st(nt()),location.hash="#/",location.reload())}),$("#reset",e).addEventListener("click",async()=>{await Z("Erase everything?","All documents, clients, items and settings in this browser are deleted. Download a backup first if you need it.","Erase")&&(Rt(),location.hash="#/",location.reload())})}let oe=null;const Ue="billx-guest",Sa=e=>{try{return localStorage.getItem(e)}catch{return null}},kt=(e,n)=>{try{n===null?localStorage.removeItem(e):localStorage.setItem(e,n)}catch{}};new URLSearchParams(location.search).get("guest")==="1"&&kt(Ue,"1");const _e=ut()&&Sa(Ue)==="1",xt=()=>{kt(Ue,null),location.hash="#/signup",location.reload()};document.querySelectorAll("[data-ic]").forEach(e=>{e.innerHTML=g(e.dataset.ic,20)});function De(){const e=_(),n=document.querySelector("[data-nav-clients]");n&&(n.textContent=`${e.clientLabel||"Client"}s`),document.getElementById("wsName").textContent=e.business.name,document.getElementById("wsSector").textContent=(ie[e.industry]||ie.general).name}function we(){return oe?oe.access.limitsOf(oe.session.account).businesses:1/0}function La(){const e=Re();se({title:"Your businesses",submit:"",cancel:"Close",body:`<p class="muted">Run every business from one BillX. Each has its own customers, items, numbering, design and reports.</p>
      <div class="ws-list">${e.map(s=>{const t=Gt(s.id);return`<button type="button" class="ws-item${s.active?" on":""}" data-ws="${s.id}"><b>${l(t.name||"New business")}</b>
        <small>${l((ie[t.industry]||{}).name||"Not set up yet")}${s.active?" · open now":""}</small></button>`}).join("")}</div>
      <button type="button" class="btn primary block" id="wsAdd">${g("plus")} Add another business</button>
      ${Number.isFinite(we())?`<p class="muted small">${e.length} of ${we()} businesses on your plan.</p>`:""}`}).el.addEventListener("click",s=>{const t=s.target.closest("[data-ws]");if(t&&!t.classList.contains("on")&&(Wt(t.dataset.ws),location.hash="#/",location.reload()),s.target.closest("#wsAdd")){if(e.length>=we()){I(`Your plan allows ${we()} businesses. Upgrade for more.`,"err");return}if(Vt()===null)return;location.hash="#/",location.reload()}})}const Be=e=>(n,s,t)=>{if(!Yt.canWrite()){I("Your trial or plan has ended. Choose a plan to make changes; your data is safe.","err"),location.hash="#/subscription";return}e(n,s,t)};function Ca(){J("/",ta),J("/pos",Be($a)),J("/docs/:type?",oa),J("/new/:type",Be(Me)),J("/edit/:id",Be(Me)),J("/doc/:id",Oe),J("/clients",sa),J("/client/:id",$t),J("/items",fa),J("/design",Fe),J("/reports",xa),J("/settings",xe),oe&&J("/subscription",(e,n,s)=>he(()=>import("./subscription-C6P_32iL.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21]),import.meta.url).then(t=>t.subscriptionView(e,n,s))),J("/signup",()=>{_e?xt():location.hash="#/"}),J("/login",()=>{location.hash="#/"})}function Ae(){const e=document.getElementById("acctBanner");if(_e){e.className="acct-banner",e.innerHTML='You are using BillX free on this device, without an account. <button class="btn" id="bannerSignup">Create free account</button> <span class="muted small">to save in the cloud, add staff and use it on every device.</span>',e.hidden=!1,document.getElementById("bannerSignup").onclick=xt;return}if(!oe){e.hidden=!0;return}const{session:n,access:s}=oe;if(n.error==="permission"){e.className="acct-banner bad",e.innerHTML='You no longer have access to this account. <button class="btn" id="bannerOut">Sign out</button>',e.hidden=!1,document.getElementById("bannerOut").onclick=()=>he(()=>import("./session-BFvT1bF-.js"),__vite__mapDeps([2,3,4,5,6,7,8,9,10,1,11,12]),import.meta.url).then(b=>b.signOut());return}const t=s.accessInfo(n.account),c=n.role==="owner",a=c?'<a class="btn" href="#/subscription">Choose a plan</a>':"<span>Ask the account owner to renew.</span>",i={trial:t.daysLeft<=14?`Free trial: <b>${t.daysLeft} day${t.daysLeft===1?"":"s"} left</b>. ${a}`:"",grace:`Payment due. Access continues for ${t.daysLeft} day${t.daysLeft===1?"":"s"}. ${c?'<a class="btn" href="#/subscription">Update payment</a>':""}`,expired:`Your ${n.account&&n.account.paidUntil?"plan":"free trial"} has ended. Your bills are safe and you can view them; choose a plan to continue. ${a}`,active:""}[t.state];e.className=`acct-banner ${t.state==="expired"?"bad":t.state==="grace"?"warn":""}`,e.innerHTML=i,e.hidden=!i}function at(){document.body.classList.remove("onboarding"),window.onhashchange=null,De(),Ut(De),document.getElementById("wsBtn").addEventListener("click",La),document.getElementById("menuBtn").addEventListener("click",()=>document.body.classList.toggle("nav-open")),document.getElementById("scrim").addEventListener("click",()=>document.body.classList.remove("nav-open")),window.addEventListener("billing:save-failed",()=>I("Browser storage is full. Download a backup and remove large images.","err")),window.addEventListener("billx:readonly",()=>I("Read-only: your trial or plan has ended. Choose a plan to make changes.","err")),_t(()=>{De(),!/^#\/(new|edit|settings|design)/.test(location.hash)&&!document.querySelector("dialog[open]")&&ve()}),Ca(),Ae(),oe&&(document.getElementById("navSub").hidden=!1,document.getElementById("sideNote").textContent=`Signed in as ${oe.session.user.email}. Saved to the cloud.`,Ae(),window.addEventListener("billx:account",()=>{Ae()})),ea()}async function Ta(){if(!ut()||_e){Ht(),at();return}const[e,n,s]=await Promise.all([he(()=>import("./session-BFvT1bF-.js"),__vite__mapDeps([2,3,4,5,6,7,8,9,10,1,11,12]),import.meta.url),he(()=>import("./auth-view-DMhIVki1.js"),__vite__mapDeps([22,3,4,7,8,5,6,9,1,15,11,12,19]),import.meta.url),he(()=>import("./access-Bs4tIRgd.js"),__vite__mapDeps([10,1]),import.meta.url)]);n.showStatus("Loading…");const t=location.hash.match(/^#\/signup\?(.*plan=.*)$/);t&&sessionStorage.setItem("billx-wanted",t[1]),e.startCloud({onSignedOut:()=>n.showAuth(),onVerify:c=>n.showVerify(c),onStatus:c=>n.showStatus(c),onReady:(c,a)=>{if(a){n.showStatus(`Could not open your account (${a.code||a.message}). Check your connection and reload.`);return}if(oe={session:c,access:s},/^#\/(signup|login)/.test(location.hash)){const i=sessionStorage.getItem("billx-wanted");location.hash=i&&_().onboarded&&c.role==="owner"?`#/subscription?${i}`:"#/"}at()}})}Ta();export{K as s};
