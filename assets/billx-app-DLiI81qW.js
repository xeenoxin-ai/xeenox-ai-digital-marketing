const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./subscription-oKn1lnwT.js","./plans-DOwXfloS.js","./session-DklIgF9q.js","./index.esm-CIxl6DF6.js","./index.esm-CtpscmOZ.js","./index.esm-DbjkYzeo.js","./bloom_blob_es2018-BgEMCAT0.js","./firebase-DqiAbLcZ.js","./index.esm-S3lCh42Z.js","./config-BIi44hYM.js","./access-Bs4tIRgd.js","./templates-CkKCGG_a.js","./templates-Dod7qGBY.css","./pay-details-B0wpuDhM.js","./site-xgmjrS31.js","./ui-DPvKWOVF.js","./modulepreload-polyfill-B5Qt9EMX.js","./preload-helper-C1FmrZbK.js","./helpers-DgI9AgnL.js","./logo-CtwRhacI.js","./portal-codec-7epzrYuT.js","./invoice-CLLushqy.css","./auth-view-mnOOsWFp.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill-B5Qt9EMX.js";import{_ as ce}from"./preload-helper-C1FmrZbK.js";import{e as n,I as Z,A as rt,s as M,B as z,a as H,v as R,y as Q,w as Be,S as ke,C as ge,E as We,g as Ve,F as Ge,G as Ye,H as de,h as N,J as pe,K as X,L as K,M as je,N as he,O as Qe,P as Ee,T as $e,Q as ut,R as Oe,U as pt,t as Xe,D as mt,V as bt,W as ht,X as vt,Y as Pe,Z as $t,_ as ft,$ as gt,a0 as yt,a1 as wt,a2 as kt,l as xt,o as Lt,a3 as St,a4 as Ct,a5 as Et,a6 as Tt,p as Dt}from"./templates-CkKCGG_a.js";/* empty css                */import{i as $,b as j,g as re,f as y,o as I,$ as f,t as L,e as J,p as me,m as ne,c as Je,S as Ke,a as ye,r as ze,d as Ze}from"./ui-DPvKWOVF.js";import{c as et}from"./config-BIi44hYM.js";import{d as ae,m as k,c as W,a as tt,b as Re,s as It,t as Nt}from"./helpers-DgI9AgnL.js";import{l as At}from"./logo-CtwRhacI.js";import{e as Bt,p as jt}from"./portal-codec-7epzrYuT.js";const at=[];let we=!1,st=location.hash,xe=!1;function U(e,i){at.push({parts:e.split("/").filter(Boolean),view:i})}function Rt(e,i){const l=i.split("/").filter(Boolean),t={};if(l.length>e.length)return null;for(let c=0;c<e.length;c++){const a=e[c],m=l[c];if(a.startsWith(":")){const u=a.endsWith("?"),p=a.slice(1).replace("?","");if(m===void 0){if(!u)return null;t[p]="";continue}t[p]=decodeURIComponent(m)}else if(a!==m)return null}return t}const O=e=>{we=e};function A(e,{replace:i=!1}={}){i?(history.replaceState(null,"",e),ue()):location.hash===e?ue():location.hash=e}function _(e,i=""){document.getElementById("pageTitle").textContent=e,document.getElementById("pageActions").innerHTML=i,document.title=`${e} · BillX`}function ue(){const[e,i]=(location.hash.slice(1)||"/").split("?"),l=new URLSearchParams(i||""),t=document.getElementById("view");for(const c of at){const a=Rt(c.parts,e);if(a){we=!1,st=location.hash,document.querySelectorAll(".nav a").forEach(m=>{const u=m.getAttribute("href").split("/")[1];m.classList.toggle("on",e.split("/")[1]===u||u==="docs"&&["doc","edit","new"].includes(e.split("/")[1])||u==="clients"&&e.split("/")[1]==="client")}),document.body.classList.remove("nav-open"),document.querySelectorAll("dialog.modal").forEach(m=>m.remove()),t.scrollTop=0,window.scrollTo(0,0);try{c.view(t,a,l)}catch(m){console.error(m),t.innerHTML=`<div class="empty"><p>Something went wrong showing this page.</p><pre class="err">${n(m.message)}</pre><a class="btn" href="#/">Go to dashboard</a></div>`}return}}A("#/",{replace:!0})}function Mt(){window.addEventListener("hashchange",()=>{if(xe){xe=!1;return}if(we&&!confirm("You have unsaved changes. Leave without saving?")){xe=!0,location.hash=st;return}ue()}),window.addEventListener("beforeunload",e=>{we&&(e.preventDefault(),e.returnValue="")}),ue()}function nt(e,i="industry"){const l=Object.keys(Z).length;return`<div class="sector-picker">
    <div class="search sp-search">${$("search",16)}<input type="search" data-sp-q placeholder="Search ${l} business types: salon, garage, school, jewellery, transport…" aria-label="Search business types"></div>
    ${rt().map(([t,c])=>`<div class="sp-group">
      <h4>${n(t)}</h4>
      <div class="ind-grid">${c.map(([a,m])=>{const u=[m.name,t,m.clientLabel,m.docTitle,...m.items.map(p=>p[0]),...m.fields.map(p=>p.label),...m.clientFields.map(p=>p.label),...m.itemCols.map(p=>p.label)].join(" ").toLowerCase();return`<label class="ind${a===e?" on":""}" data-s="${n(u)}"><input type="radio" name="${i}" value="${a}" ${a===e?"checked":""}>
        <b>${n(m.name)}</b><small>${n(m.clientLabel)}s · ${n(m.docTitle)}</small></label>`}).join("")}</div></div>`).join("")}
    <p class="muted small sp-none" hidden>No match. Pick <b>Custom (build your own)</b> and add your own fields.</p>
  </div>`}function it(e,i){const l=e.querySelector("[data-sp-q]");l.addEventListener("input",()=>{const t=l.value.trim().toLowerCase();let c=0;j(".sp-group",e).forEach(a=>{let m=0;j(".ind",a).forEach(u=>{const p=!t||t.split(/\s+/).every(v=>u.dataset.s.includes(v));u.hidden=!p,p&&m++}),a.hidden=!m,c+=m}),e.querySelector(".sp-none").hidden=c>0}),l.addEventListener("keydown",t=>{t.key==="Enter"&&t.preventDefault()}),e.addEventListener("change",t=>{t.target.matches(".ind input")&&(j(".ind",e).forEach(c=>c.classList.toggle("on",c.contains(t.target))),i&&i(t.target.value))})}function Ft(e){const i=M();if(!i.onboarded)return Ot(e);_("Dashboard",`<a class="btn" href="#/new/quote">${$("plus")}<span class="hide-sm"> Quote</span></a>
    <a class="btn primary" href="#/new/invoice">${$("plus")} New ${n((i.docTitles.invoice||"Invoice").toLowerCase())}</a>`);const l=z(),t=l.slice(0,7),c=ae(g=>g.status!=="cancelled"&&g.status!=="draft"),a=c.filter(g=>g.d.type==="invoice"),m=a.filter(g=>g.d.date.startsWith(t)),u=(g,T)=>g.reduce((o,h)=>o+T(h),0),p=a.filter(g=>g.status==="overdue"),v=u(a,g=>Math.max(g.t.balance,0)),s=a.reduce((g,T)=>g+(T.d.payments||[]).filter(o=>(o.date||"").startsWith(t)).reduce((o,h)=>o+Number(h.amount||0),0),0),r=c.filter(g=>g.d.type==="quote"&&g.status==="awaiting"),w=[],[S,C]=l.split("-").map(Number);for(let g=5;g>=0;g--){const T=new Date(Date.UTC(S,C-1-g,1));w.push(T.toISOString().slice(0,7))}const E=w.map(g=>({k:g,billed:u(a.filter(T=>T.d.date.startsWith(g)),T=>T.t.total),paid:a.reduce((T,o)=>T+(o.d.payments||[]).filter(h=>(h.date||"").startsWith(g)).reduce((h,d)=>h+Number(d.amount||0),0),0)})),F=Math.max(1,...E.map(g=>Math.max(g.billed,g.paid))),G=560,B=180,P=G/E.length,te=E.map((g,T)=>{const o=g.billed/F*(B-30),h=g.paid/F*(B-30),d=new Date(`${g.k}-01T00:00:00`).toLocaleDateString("en-GB",{month:"short"});return`<g><title>${d}: billed ${k(g.billed)}, received ${k(g.paid)}</title>
      <rect x="${T*P+P*.18}" y="${B-20-o}" width="${P*.3}" height="${o}" rx="3" class="c-billed"/>
      <rect x="${T*P+P*.52}" y="${B-20-h}" width="${P*.3}" height="${h}" rx="3" class="c-paid"/>
      <text x="${T*P+P/2}" y="${B-4}" text-anchor="middle">${d}</text></g>`}).join(""),V=ae().slice(0,8),Y=a.filter(g=>["sent","partial","overdue"].includes(g.status)).sort((g,T)=>(g.d.dueDate||"").localeCompare(T.d.dueDate||"")).slice(0,6),se=!H("docs").length;e.innerHTML=`
    ${se?`<section class="card hero">
      <h2>Welcome, ${n(i.business.name)}</h2>
      <p>Create your first ${n((i.docTitles.invoice||"invoice").toLowerCase())} in under a minute. Your logo, UPI QR and design are applied automatically.</p>
      <div class="row-gap wrap"><a class="btn primary" href="#/new/invoice">${$("plus")} Create ${n((i.docTitles.invoice||"invoice").toLowerCase())}</a>
      <a class="btn" href="#/settings">${$("settings")} Complete business profile</a><a class="btn" href="#/design">${$("palette")} Choose a design</a></div>
    </section>`:""}
    <div class="kpis">
      <div class="kpi"><span>Billed this month</span><b>${k(u(m,g=>g.t.total))}</b><small>${m.length} ${n(R.invoice.plural.toLowerCase())}</small></div>
      <div class="kpi good"><span>Received this month</span><b>${k(s)}</b></div>
      <div class="kpi warn"><span>Outstanding</span><b>${k(v)}</b><small>${a.filter(g=>g.t.balance>.004).length} unpaid</small></div>
      <a class="kpi bad" href="#/docs/invoice?status=overdue"><span>Overdue</span><b>${k(u(p,g=>g.t.balance))}</b><small>${p.length} invoices</small></a>
      <a class="kpi" href="#/docs/quote?status=awaiting"><span>Open quotes</span><b>${k(u(r,g=>g.t.total))}</b><small>${r.length} waiting</small></a>
    </div>
    <div class="two-col">
      <section class="card">
        <div class="row-between"><h3>Last 6 months</h3><span class="legend"><i></i> Billed <i class="paid"></i> Received</span></div>
        <svg class="chart" viewBox="0 0 ${G} ${B}" role="img" aria-label="Billed and received per month">${te}</svg>
      </section>
      <section class="card">
        <h3>Waiting for payment</h3>
        ${Y.length?Y.map(({d:g,t:T,status:o})=>`<a class="list-row" href="#/doc/${g.id}">
          <span><b>${n(g.client?g.client.name:"—")}</b><small>${n(g.number)} · due ${Q(g.dueDate)}</small></span>
          <span class="right">${k(T.balance)}${re(o)}</span></a>`).join(""):'<p class="muted">Nothing outstanding. 🎉</p>'}
      </section>
    </div>
    <section class="card">
      <div class="row-between"><h3>Recent documents</h3><a href="#/docs/all">See all</a></div>
      ${V.length?`<div class="table-wrap"><table class="table"><thead><tr><th>Number</th><th>${n(W())}</th><th>Date</th><th class="num">Amount</th><th>Status</th></tr></thead>
      <tbody>${V.map(({d:g,t:T,status:o})=>`<tr class="link" data-id="${g.id}"><td><b>${n(g.number)}</b><div class="sub">${n(R[g.type].name)}</div></td>
        <td>${n(g.client?g.client.name:"—")}</td><td>${Q(g.date)}</td><td class="num">${k(T.payable)}</td><td>${re(o)}</td></tr>`).join("")}</tbody></table></div>`:'<p class="muted">No documents yet.</p>'}
    </section>`,j("tr.link",e).forEach(g=>g.addEventListener("click",()=>A(`#/doc/${g.dataset.id}`)))}function qe(e){const i=Z[e];if(!i)return"";if(i.custom)return"Start blank: add your own bill fields, customer fields and item columns in Settings → Fields on your bills.";const l=[`${i.clientLabel}s`,i.docTitle,i.fields.length?`bill fields: ${i.fields.map(t=>t.label).join(", ")}`:"",i.clientFields.length?`${i.clientLabel.toLowerCase()} fields: ${i.clientFields.map(t=>t.label).join(", ")}`:"",i.itemCols.filter(t=>!t.hidden).length?`item columns: ${i.itemCols.filter(t=>!t.hidden).map(t=>t.label).join(", ")}`:"",`${i.items.length} starter items`,`${i.tax}% tax`].filter(Boolean);return`<b>${n(i.name)}</b> · ${n(l.join(" · "))}. You can change all of it later.`}function Ot(e){const i=M(),l=Be().filter(a=>!a.active);_("Set up BillX",""),document.body.classList.add("onboarding"),e.innerHTML=`
  <form class="onboard" id="ob">
    <div class="onboard-head"><img src="${At}" alt="" width="48" height="48"><div><h1>${l.length?"Add a business to BillX":"Welcome to BillX"}</h1>
    <p>Billing &amp; invoicing for every kind of business. Pick your type and BillX prepares the fields, labels, tax, starter items and invoice design. Not listed? Choose <b>Custom</b> and build your own.</p></div></div>
    ${nt(i.industry||"general")}
    <p class="sp-info" id="spInfo">${qe(i.industry||"general")}</p>
    <div class="grid g3">
      ${y("Business name",`<input name="name" placeholder="e.g. Sunrise Traders" value="${i.business.name==="Your Business Name"?"":n(i.business.name)}">`)}
      ${y("State",`<select name="state">${I(ke.map(([a,m])=>[a,m]),i.business.state)}</select>`)}
      ${y("Currency",`<select name="currency">${I(Object.keys(ge).map(a=>[a,`${a} (${ge[a].symbol})`]),i.currency)}</select>`)}
    </div>
    <div class="row-gap wrap end">
      ${l.length?'<button type="button" class="btn ghost" id="obCancel">Cancel</button>':""}
      <button class="btn" value="sample">${$("eye")} Explore with sample data</button>
      <button class="btn primary" value="start">${$("check")} Start billing</button>
    </div>
  </form>`;const t=f("#ob",e);it(t,a=>{f("#spInfo",t).innerHTML=qe(a)});const c=f("#obCancel",t);c&&c.addEventListener("click",()=>{We(Ve()),document.body.classList.remove("onboarding"),location.hash="#/",location.reload()}),t.addEventListener("submit",a=>{a.preventDefault();const m=new FormData(t),u=m.get("industry")||"general",p=a.submitter&&a.submitter.value==="sample";p?Ge(u):Ye(u),m.get("name")&&(i.business.name=m.get("name").trim()),p||(i.business.state=m.get("state")),i.currency=m.get("currency"),i.currency!=="INR"&&(i.taxMode="simple"),i.onboarded=!0,de(),N(),document.body.classList.remove("onboarding"),location.hash="#/",location.reload()})}function Te(e){const i=M(),l=pe(i),t=e.extra||{};return`<div class="grid g2">
    ${y("Name *",`<input name="name" required value="${n(e.name||"")}">`)}
    ${y("Company / organisation",`<input name="company" value="${n(e.company||"")}">`)}
    ${y("Phone / WhatsApp",`<input name="phone" type="tel" value="${n(e.phone||"")}">`)}
    ${y("Email",`<input name="email" type="email" value="${n(e.email||"")}">`)}
    ${l.clientFields.map(c=>y(c.label,c.options?`<select name="x_${c.key}">${I(c.options.map(a=>[a,a||"—"]),t[c.key]||"")}</select>`:`<input name="x_${c.key}" value="${n(t[c.key]||"")}">`)).join("")}
    ${i.taxMode!=="none"?y("GSTIN / Tax ID",`<input name="gstin" value="${n(e.gstin||"")}" maxlength="15" style="text-transform:uppercase">`):""}
    ${y("Address",`<textarea name="address" rows="2">${n(e.address||"")}</textarea>`,"span2")}
    ${y("City",`<input name="city" value="${n(e.city||"")}">`)}
    ${y("PIN code",`<input name="pincode" value="${n(e.pincode||"")}">`)}
    ${y("State",`<select name="state">${I(ke.map(([c,a])=>[c,a]),e.state||i.business.state)}</select>`)}
    ${y("Shipping address (if different)",`<textarea name="shipAddress" rows="2">${n(e.shipAddress||"")}</textarea>`)}
    ${y("Private notes",`<textarea name="notes" rows="2">${n(e.notes||"")}</textarea>`,"span2")}
  </div>`}function De(e,i){const l={...i,extra:{...i.extra||{}}};for(const[t,c]of e.entries())t.startsWith("x_")?l.extra[t.slice(2)]=String(c).trim():l[t]=String(c).trim();return l.gstin&&(l.gstin=l.gstin.toUpperCase()),l}function Pt(e,i,l){const t=W(),c=(l.get("q")||"").toLowerCase(),a=pe(M()).clientFields[0];_(`${t}s`,`<a class="btn primary" href="#/client/new">${$("plus")} New ${n(t.toLowerCase())}</a>`);const m=H("clients").filter(p=>!c||[p.name,p.company,p.phone,p.email,p.gstin,...Object.values(p.extra||{})].some(v=>String(v||"").toLowerCase().includes(c))).map(p=>({c:p,b:tt(p.id)})).sort((p,v)=>v.b.outstanding-p.b.outstanding||p.c.name.localeCompare(v.c.name));e.innerHTML=`
    <div class="toolbar"><div class="search">${$("search",16)}<input id="q" type="search" placeholder="Search name, phone, ${a?n(a.label):"GSTIN"}" value="${n(c)}"></div></div>
    ${m.length?`<div class="table-wrap"><table class="table">
      <thead><tr><th>Name</th><th>Contact</th><th class="num">Billed</th><th class="num">Outstanding</th></tr></thead>
      <tbody>${m.map(({c:p,b:v})=>`<tr class="link" data-id="${p.id}">
        <td><b>${n(p.name)}</b>${p.company&&p.company!==p.name?`<div class="sub">${n(p.company)}</div>`:""}${a&&p.extra&&p.extra[a.key]?`<div class="sub">${n(a.label)}: ${n(p.extra[a.key])}</div>`:""}</td>
        <td>${n(p.phone||"")}<div class="sub">${n(p.email||"")}</div></td>
        <td class="num">${k(v.billed)}</td>
        <td class="num ${v.outstanding>.5?"due":""}">${k(v.outstanding)}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">${$("users",40)}<p>No ${n(t.toLowerCase())}s yet.</p><a class="btn primary" href="#/client/new">${$("plus")} Add ${n(t.toLowerCase())}</a></div>`}`;let u;f("#q",e).addEventListener("input",p=>{clearTimeout(u),u=setTimeout(()=>{A(`#/clients${p.target.value?`?q=${encodeURIComponent(p.target.value)}`:""}`,{replace:!0});const v=f("#q");v.focus(),v.setSelectionRange(v.value.length,v.value.length)},250)}),j("tr.link",e).forEach(p=>p.addEventListener("click",()=>A(`#/client/${p.dataset.id}`)))}function lt(e,i){const l=W(),t=i.id==="new",c=t?{}:X("clients",i.id);if(!c){e.innerHTML='<div class="empty"><p>Not found.</p></div>',_("Not found");return}if(t){_(`New ${l.toLowerCase()}`,""),e.innerHTML=`<form class="card narrow" id="cform">${Te(c)}
      <div class="row-gap end"><a class="btn" href="#/clients">Cancel</a><button class="btn primary">${$("check")} Save</button></div></form>`,f("#cform",e).addEventListener("input",()=>O(!0)),f("#cform",e).addEventListener("submit",u=>{u.preventDefault();const p=K("clients",De(new FormData(u.target),{}));N(),O(!1),L(`${l} saved`),A(`#/client/${p.id}`)});return}const a=tt(c.id),m=ae(u=>u.clientId===c.id);_(c.name,`
    <a class="btn" href="#/new/invoice?client=${c.id}">${$("plus")}<span class="hide-sm"> Invoice</span></a>
    <a class="btn" href="#/new/quote?client=${c.id}">${$("plus")}<span class="hide-sm"> Quote</span></a>
    <button class="btn primary" id="portalBtn">${$("globe")}<span class="hide-sm"> Client portal</span></button>`),e.innerHTML=`
    <div class="kpis">
      <div class="kpi"><span>Billed</span><b>${k(a.billed)}</b></div>
      <div class="kpi"><span>Received</span><b>${k(a.paid)}</b></div>
      ${a.credit?`<div class="kpi"><span>Credit notes</span><b>${k(a.credit)}</b></div>`:""}
      <div class="kpi ${a.outstanding>.5?"warn":"good"}"><span>Outstanding</span><b>${k(a.outstanding)}</b></div>
    </div>
    <div class="two-col">
      <section class="card">
        <div class="row-between"><h3>Documents</h3><button class="btn ghost" id="printStmt">${$("print")} Print all unpaid</button></div>
        ${m.length?`<div class="table-wrap"><table class="table">
          <thead><tr><th>Number</th><th>Date</th><th class="num">Amount</th><th class="num">Balance</th><th>Status</th></tr></thead>
          <tbody>${m.map(({d:u,t:p,status:v})=>`<tr class="link" data-doc="${u.id}"><td><b>${n(u.number)}</b><div class="sub">${n(R[u.type].name)}</div></td>
            <td>${Q(u.date)}</td><td class="num">${k(p.payable)}</td><td class="num">${u.type==="invoice"?k(Math.max(p.balance,0)):"–"}</td><td>${re(v)}</td></tr>`).join("")}</tbody></table></div>`:'<p class="muted">No documents yet.</p>'}
      </section>
      <form class="card" id="cform"><h3>Details</h3>${Te(c)}
        <div class="row-gap end"><button type="button" class="btn danger-text" id="delC">${$("trash")} Delete</button><button class="btn primary">${$("check")} Save changes</button></div>
      </form>
    </div>`,j("tr[data-doc]",e).forEach(u=>u.addEventListener("click",()=>A(`#/doc/${u.dataset.doc}`))),f("#cform",e).addEventListener("input",()=>O(!0)),f("#cform",e).addEventListener("submit",u=>{u.preventDefault(),K("clients",De(new FormData(u.target),c)),N(),O(!1),L("Saved"),lt(e,i)}),f("#delC",e).addEventListener("click",async()=>{await J(`Delete ${c.name}?`,`Their documents stay (with the ${l.toLowerCase()} details copied on them).`)&&(je("clients",c.id),N(),O(!1),A("#/clients"))}),f("#printStmt",e).addEventListener("click",()=>{const u=m.filter(p=>["sent","partial","overdue"].includes(p.status)).map(p=>p.d);if(!u.length)return L("Nothing unpaid","err");me(u,M())}),f("#portalBtn").addEventListener("click",()=>qt(c))}async function qt(e){const i=H("docs").filter(u=>u.clientId===e.id&&u.status!=="draft"),l=M(),t=ne({title:`Client portal · ${e.name}`,submit:"",cancel:"Close",wide:!0,body:`<p class="muted">One private link with every issued document for ${n(e.name)} (${i.length}): statement, outstanding balance, view & download each bill, pay by UPI, and confirm payment or accept quotes by WhatsApp. The data travels in the link; send a fresh link after you add new bills.</p>
      <div class="share-link"><input id="pUrl" readonly value="Preparing link…"><button type="button" class="btn" id="pCopy">${$("copy")} Copy</button></div>
      <div class="share-btns"><a class="btn whatsapp" id="pWa" target="_blank" rel="noopener">${$("whatsapp")} WhatsApp</a>
      <a class="btn" id="pMail">${$("mail")} Email</a><a class="btn" id="pOpen" target="_blank" rel="noopener">${$("globe")} Open portal</a></div>`});if(!i.length){f("#pUrl",t.el).value="Issue a document first (drafts are not shared).";return}const c=await ot(e,i),a=`Hello ${e.name},

Your account with ${l.business.name}: view all your bills, balance and pay online here:
${c}

Thank you.`,m=String(e.phone||"").replace(/\D/g,"");f("#pUrl",t.el).value=c,f("#pWa",t.el).href=`https://wa.me/${m.length===10?`91${m}`:m}?text=${encodeURIComponent(a)}`,f("#pMail",t.el).href=`mailto:${encodeURIComponent(e.email||"")}?subject=${encodeURIComponent(`Your account - ${l.business.name}`)}&body=${encodeURIComponent(a)}`,f("#pOpen",t.el).href=c,f("#pCopy",t.el).addEventListener("click",async()=>{await Je(c)&&L("Link copied")})}const Ut=["all","draft","sent","partial","overdue","paid","awaiting","accepted","cancelled"];function Ht(e,i,l){const t=i.type||"all",c=l.get("status")||"all",a=(l.get("q")||"").toLowerCase();_(t==="all"?"All documents":R[t].plural,`
    <a class="btn primary" href="#/new/${t==="all"?"invoice":t}">${$("plus")} New ${t==="all"?"invoice":R[t].name.toLowerCase()}</a>`);const m=ae(r=>t==="all"||r.type===t).filter(r=>c==="all"||r.status===c||c==="sent"&&r.status==="sent").filter(r=>!a||[r.d.number,r.d.client&&r.d.client.name,r.d.client&&r.d.client.company,r.d.reference].some(w=>String(w||"").toLowerCase().includes(a))),u=m.reduce((r,w)=>w.status==="cancelled"?r:{total:r.total+w.t.payable,due:r.due+(w.d.type==="invoice"?Math.max(w.t.balance,0):0)},{total:0,due:0}),p=[["all","All"],...Object.entries(R).map(([r,w])=>[r,w.plural])];e.innerHTML=`
    <div class="tabs" role="tablist">${p.map(([r,w])=>`<a role="tab" class="tab${r===t?" on":""}" href="#/docs/${r}">${n(w)}</a>`).join("")}</div>
    <div class="toolbar">
      <div class="search">${$("search",16)}<input id="q" type="search" placeholder="Search number, ${n(W().toLowerCase())}, reference" value="${n(a)}"></div>
      <div class="chips">${Ut.map(r=>`<button class="chip${r===c?" on":""}" data-status="${r}">${r==="all"?"All":Ke[r]}</button>`).join("")}</div>
    </div>
    <div class="sumline">${m.length} document${m.length===1?"":"s"} · Total <b>${k(u.total)}</b> · Outstanding <b>${k(u.due)}</b></div>
    ${m.length?`<div class="table-wrap"><table class="table">
      <thead><tr><th>Number</th><th>${n(W())}</th><th>Date</th><th>Due</th><th class="num">Amount</th><th class="num">Balance</th><th>Status</th></tr></thead>
      <tbody>${m.map(({d:r,t:w,status:S})=>`
        <tr class="link" data-id="${r.id}">
          <td><b>${n(r.number)}</b><div class="sub">${n(R[r.type].name)}</div></td>
          <td>${n(r.client&&r.client.name||"—")}${r.client&&r.client.company&&r.client.company!==r.client.name?`<div class="sub">${n(r.client.company)}</div>`:""}</td>
          <td>${Q(r.date)}</td><td>${Q(r.dueDate)}</td>
          <td class="num">${k(w.payable)}</td>
          <td class="num">${r.type==="invoice"?k(Math.max(w.balance,0)):"–"}</td>
          <td>${re(S)}</td>
        </tr>`).join("")}</tbody></table></div>`:`<div class="empty">${$("file",40)}<p>No documents here yet.</p><a class="btn primary" href="#/new/${t==="all"?"invoice":t}">${$("plus")} Create one</a></div>`}`;const v=r=>{const w=new URLSearchParams(l);Object.entries(r).forEach(([C,E])=>E&&E!=="all"?w.set(C,E):w.delete(C));const S=w.toString();A(`#/docs/${t}${S?`?${S}`:""}`,{replace:!0})};j(".chip",e).forEach(r=>r.addEventListener("click",()=>v({status:r.dataset.status})));let s;f("#q",e).addEventListener("input",r=>{clearTimeout(s),s=setTimeout(()=>{v({q:r.target.value.trim()});const w=f("#q");w&&(w.focus(),w.setSelectionRange(w.value.length,w.value.length))},250)}),j("tr.link",e).forEach(r=>r.addEventListener("click",()=>A(`#/doc/${r.dataset.id}`)))}let oe=null;function Le(e){oe=e,A(`#/new/${e.type}?draft=1`)}const _t=(e,i,l)=>{const t=i.split(".");let c=e;t.slice(0,-1).forEach(a=>{c[a]=c[a]||{},c=c[a]}),c[t.at(-1)]=l};function Ue(e){return e==="quote"||e==="proforma"?["draft","sent","accepted","declined","cancelled"]:e==="receipt"||e==="credit"?["draft","issued","cancelled"]:["draft","sent","cancelled"]}const Wt={...Ke,sent:"Sent / issued"};function Ie(e,i,l){const t=M(),c=pe(t);let a;if(i.id){const o=X("docs",i.id);if(!o){e.innerHTML='<div class="empty"><p>Document not found.</p></div>';return}a=JSON.parse(JSON.stringify(o))}else l.get("draft")&&oe?(a=oe,oe=null):a=Ee(i.type||"invoice",l.get("client")||"");const m=!a.id,u=R[a.type].name;_(`${m?"New":"Edit"} ${u.toLowerCase()}`,`
    <button class="btn" id="cancelBtn">Cancel</button>
    <button class="btn" id="printBtn" title="Print or save as PDF">${$("print")}<span class="hide-sm"> Print</span></button>
    <button class="btn primary" id="saveBtn">${$("check")} Save</button>`);const p=o=>c.clientFields[0]&&o.extra?o.extra[c.clientFields[0].key]:"",v=H("items"),s=[...new Set(v.map(o=>o.category).filter(Boolean))],r=t.design.groupByCategory||c.itemCols.some(o=>o.key==="category"),w=c.itemCols.filter(o=>o.key!=="category"),S=t.taxMode!=="none";e.innerHTML=`
  <div class="editor">
    <form class="editor-form" id="docForm" autocomplete="off">
      <section class="card">
        <div class="grid g4">
          ${y("Document",`<select data-f="type">${I(Object.entries(R).map(([o,h])=>[o,h.name]),a.type)}</select>`)}
          ${y("Title on document",`<input data-f="title" value="${n(a.title)}">`)}
          ${y("Number",`<input data-f="number" value="${n(a.number)}" required>`)}
          ${y("Status",`<select data-f="status">${I(Ue(a.type).map(o=>[o,Wt[o]]),a.status)}</select>`)}
          ${y("Date",`<input type="date" data-f="date" value="${n(a.date)}">`)}
          ${y(a.type==="quote"?"Valid till":"Due date",`<input type="date" data-f="dueDate" value="${n(a.dueDate)}">`)}
          ${t.taxMode==="gst"?y("Place of supply",`<select data-f="placeOfSupply">${I(ke.map(([o,h])=>[o,`${o} - ${h}`]),a.placeOfSupply)}</select>`):""}
          ${y("Reference / PO",`<input data-f="reference" value="${n(a.reference||"")}">`)}
        </div>
      </section>

      <section class="card">
        <h3>${n(W())}</h3>
        <div class="row-gap">
          <select id="clientSel" class="grow">
            <option value="">— Select ${n(W().toLowerCase())} —</option>
            ${I(H("clients").slice().sort((o,h)=>o.name.localeCompare(h.name)).map(o=>[o.id,`${o.name}${o.company&&o.company!==o.name?` · ${o.company}`:""}${p(o)?` · ${p(o)}`:""}`]),a.clientId)}
          </select>
          <button type="button" class="btn" id="newClientBtn">${$("plus")} New</button>
        </div>
        <div id="clientCard" class="client-card"></div>
      </section>

      ${c.fields.length?`<section class="card"><h3>Bill details</h3><div class="grid g3">
        ${c.fields.map(o=>y(o.label,`<input ${o.type==="date"?'type="date"':""} data-ff="${o.key}" value="${n((a.fields||{})[o.key]||"")}">`)).join("")}
      </div></section>`:""}

      <section class="card">
        <h3>Items</h3>
        <div id="lines"></div>
        <div class="row-gap">
          <button type="button" class="btn" id="addLine">${$("plus")} Add line</button>
          <button type="button" class="btn ghost" id="pickItems">${$("box")} From catalogue</button>
        </div>
        <datalist id="catalog">${v.map(o=>`<option value="${n(o.name)}">${n(o.category||"")} ${k(o.rate)}</option>`).join("")}</datalist>
        <datalist id="cats">${s.map(o=>`<option value="${n(o)}">`).join("")}</datalist>
      </section>

      <section class="card">
        <h3>Charges, discount & payments</h3>
        <div class="grid g4">
          ${y("Discount",`<div class="join"><input type="number" step="any" min="0" data-f="discount.value" data-num value="${n(a.discount.value)}"><select data-f="discount.type">${I([["%","%"],["flat","Flat"]],a.discount.type)}</select></div>`)}
          ${y("Shipping / other charges",`<input type="number" step="any" data-f="shipping" data-num value="${n(a.shipping)}">`)}
          ${y("Adjustment (+/−)",`<input type="number" step="any" data-f="adjustment" data-num value="${n(a.adjustment)}">`)}
          ${y("Advance received",`<input type="number" step="any" min="0" data-f="advance" data-num value="${n(a.advance)}">`)}
          ${c.insurance||a.insurance?y(`${t.design.labels.insurance||"Insurance / third-party share"}`,`<input type="number" step="any" min="0" data-f="insurance" data-num value="${n(a.insurance)}">`):""}
        </div>
        <div id="sumBox" class="sumbox"></div>
      </section>

      <section class="card">
        <h3>Extra fields <small>shown with the document details</small></h3>
        <div id="customFields"></div>
        <button type="button" class="btn ghost" id="addCf">${$("plus")} Add field</button>
      </section>

      <section class="card">
        <div class="grid g2">
          ${y("Notes",`<textarea rows="3" data-f="notes">${n(a.notes)}</textarea>`)}
          ${y("Terms & conditions",`<textarea rows="3" data-f="terms">${n(a.terms)}</textarea>`)}
        </div>
      </section>

      <section class="card">
        <h3>Design for this document</h3>
        <div class="grid g3">
          ${y("Template",`<select data-f="template"><option value="">Default (${n(($e.find(o=>o.id===t.design.template)||$e[0]).name)})</option>${I($e.map(o=>[o.id,o.name]),a.template)}</select>`)}
          ${y("Accent colour",`<div class="join"><input type="color" data-f="accent" value="${n(a.accent||t.design.accent)}"><button type="button" class="btn ghost" id="resetAccent">Default</button></div>`)}
          <div class="fld"><span>&nbsp;</span><a class="btn ghost" href="#/design">${$("palette")} Full design studio</a></div>
        </div>
      </section>
    </form>
    <aside class="editor-preview">
      <div class="preview-bar"><span>Live preview</span><span id="pvTotal"></span></div>
      <div id="preview"></div>
    </aside>
  </div>`;const C=f("#docForm",e),E=f("#preview",e);let F;const G=o=>{clearTimeout(F);const h=()=>{C.isConnected&&(ye(E,a,t),se())};o?h():F=setTimeout(h,120)},B=()=>{O(!0),G()};function P(){const o=a.client,h=f("#clientCard",e);if(!o||!o.name){h.innerHTML=`<p class="muted">Pick a saved ${n(W().toLowerCase())} or add a new one.</p>`;return}const d=c.clientFields.filter(b=>o.extra&&o.extra[b.key]).map(b=>`${n(b.label)}: ${n(o.extra[b.key])}`);h.innerHTML=`<b>${n(o.name)}</b>${o.company&&o.company!==o.name?` · ${n(o.company)}`:""}
      <div class="muted">${[o.phone,o.email,o.gstin&&`GSTIN ${o.gstin}`,...d].filter(Boolean).map(n).join(" · ")}</div>`}function te(o,h){const d=Oe(o).net;return`<div class="li" data-i="${h}">
      <div class="li-main">
        <input class="li-name" data-k="name" list="catalog" placeholder="Item or service name" value="${n(o.name)}">
        <textarea data-k="description" rows="1" placeholder="Description (optional)">${n(o.description||"")}</textarea>
        ${r||w.length?`<div class="li-extra">
          ${r?`<label><span>Category</span><input data-k="category" list="cats" value="${n(o.category||"")}"></label>`:""}
          ${w.map(b=>`<label><span>${n(b.label)}</span><input data-k="${b.key}" value="${n(o[b.key]||"")}"></label>`).join("")}
        </div>`:""}
      </div>
      <div class="li-nums">
        ${t.design.show.hsn?`<label><span>HSN/SAC</span><input data-k="hsn" value="${n(o.hsn||"")}"></label>`:""}
        <label><span>Qty</span><input type="number" step="any" data-k="qty" data-num value="${n(o.qty)}"></label>
        <label><span>Unit</span><input data-k="unit" value="${n(o.unit||"")}" placeholder="pcs"></label>
        <label><span>Rate</span><input type="number" step="any" data-k="rate" data-num value="${n(o.rate)}"></label>
        <label><span>Disc %</span><input type="number" step="any" min="0" max="100" data-k="discount" data-num value="${n(o.discount||0)}"></label>
        ${S?`<label><span>Tax %</span><input type="number" step="any" min="0" data-k="tax" data-num value="${n(o.tax||0)}" list="taxrates"></label>`:""}
        <div class="li-amt"><span>Amount</span><b>${k(d)}</b></div>
      </div>
      <div class="li-act">
        <button type="button" class="icon-btn" data-act="up" title="Move up" aria-label="Move up">${$("up",16)}</button>
        <button type="button" class="icon-btn" data-act="down" title="Move down" aria-label="Move down">${$("down",16)}</button>
        <button type="button" class="icon-btn" data-act="save" title="Save to catalogue" aria-label="Save to catalogue">${$("star",16)}</button>
        <button type="button" class="icon-btn danger" data-act="del" title="Remove line" aria-label="Remove line">${$("trash",16)}</button>
      </div>
    </div>`}function V(){f("#lines",e).innerHTML=`${a.items.map(te).join("")}
      <datalist id="taxrates">${[0,5,12,18,28].map(o=>`<option value="${o}">`).join("")}</datalist>`}function Y(){f("#customFields",e).innerHTML=(a.customFields||[]).map((o,h)=>`
      <div class="cf" data-j="${h}">
        <input data-cf="label" placeholder="Label (e.g. Vehicle No.)" value="${n(o.label)}">
        <input data-cf="value" placeholder="Value" value="${n(o.value)}">
        <button type="button" class="icon-btn danger" data-cfdel aria-label="Remove">${$("trash",16)}</button>
      </div>`).join("")||'<p class="muted">Add any field you need: vehicle number, PO date, e-way bill, room number…</p>'}function se(){const o=Re(a,t),h=[["Sub total",o.gross],o.discountTotal&&["Discount",-o.discountTotal],["Tax",o.totalTax],o.shipping&&["Charges",o.shipping],o.adjustment&&["Adjustment",o.adjustment],o.roundOff&&["Round off",o.roundOff]].filter(Boolean);f("#sumBox",e).innerHTML=`${h.map(([d,b])=>`<div><span>${d}</span><span>${k(b)}</span></div>`).join("")}
      <div class="big"><span>Total</span><span>${k(o.total)}</span></div>
      ${o.insurance?`<div><span>Insurance</span><span>−${k(o.insurance)}</span></div><div class="big"><span>Payable</span><span>${k(o.payable)}</span></div>`:""}
      ${o.paid?`<div><span>Paid</span><span>−${k(o.paid)}</span></div><div class="big"><span>Balance</span><span>${k(o.balance)}</span></div>`:""}`,f("#pvTotal",e).textContent=k(o.insurance?o.payable:o.total),j(".li",e).forEach(d=>{const b=a.items[+d.dataset.i];b&&(d.querySelector(".li-amt b").textContent=k(Oe(b).net))})}P(),V(),Y(),G(!0),O(!1),C.addEventListener("input",o=>{const h=o.target,d=h.dataset.num!==void 0?h.value===""?0:parseFloat(h.value):h.value;if(h.dataset.f){if(h.dataset.f==="type")return;_t(a,h.dataset.f,d)}else if(h.dataset.ff)a.fields=a.fields||{},a.fields[h.dataset.ff]=d;else if(h.dataset.k){const b=+h.closest(".li").dataset.i;a.items[b][h.dataset.k]=d}else if(h.dataset.cf){const b=+h.closest(".cf").dataset.j;a.customFields[b][h.dataset.cf]=d}else return;B()}),C.addEventListener("change",o=>{const h=o.target;if(h.dataset.f==="type"){const d=h.value,b=!m;a.type=d,a.title=t.docTitles[d]||R[d].title,b||(a.number=Ee(d).number),Ue(d).includes(a.status)||(a.status="draft"),O(!0),oe=a,Ie(e,{...i,type:d},new URLSearchParams("draft=1")),O(!0);return}if(h.dataset.k==="name"){const d=+h.closest(".li").dataset.i,b=v.find(x=>x.name.toLowerCase()===h.value.trim().toLowerCase());if(b){const x=a.items[d];Object.assign(x,{name:b.name,rate:b.rate,tax:S?b.tax:0,hsn:b.hsn||"",unit:b.unit||"",category:b.category||"",description:x.description||b.description||""}),V(),B();const D=f(`.li[data-i="${d}"] [data-k="qty"]`,e);D&&D.focus()}}}),f("#clientSel",e).addEventListener("change",o=>{const h=X("clients",o.target.value);if(a.clientId=h?h.id:"",a.client=ut(h),h&&h.state){a.placeOfSupply=h.state;const d=f('[data-f="placeOfSupply"]',e);d&&(d.value=h.state)}P(),B()}),f("#newClientBtn",e).addEventListener("click",()=>{ne({title:`New ${W().toLowerCase()}`,body:Te({}),wide:!0,onSubmit:o=>{const h=De(o,{});if(!h.name)return L("Name is required","err"),!1;K("clients",h);const d=f("#clientSel",e);return d.insertAdjacentHTML("beforeend",`<option value="${h.id}">${n(h.name)}</option>`),d.value=h.id,d.dispatchEvent(new Event("change")),L(`${W()} saved`),!0}})}),f("#lines",e).addEventListener("click",o=>{const h=o.target.closest("[data-act]");if(!h)return;const d=+h.closest(".li").dataset.i,b=a.items;if(h.dataset.act==="del")b.splice(d,1),b.length||b.push(g());else if(h.dataset.act==="up"&&d>0)[b[d-1],b[d]]=[b[d],b[d-1]];else if(h.dataset.act==="down"&&d<b.length-1)[b[d+1],b[d]]=[b[d],b[d+1]];else if(h.dataset.act==="save"){const x=b[d];if(!x.name)return L("Give the line a name first","err");const D=H("items").find(q=>q.name.toLowerCase()===x.name.toLowerCase());return K("items",{...D||{},name:x.name,description:x.description||"",rate:+x.rate||0,tax:+x.tax||0,hsn:x.hsn||"",unit:x.unit||"",category:x.category||""}),L(D?"Catalogue item updated":"Saved to catalogue")}V(),B()});const g=()=>({name:"",description:"",hsn:"",qty:1,unit:"",rate:0,discount:0,tax:S?t.defaultTax:0,category:""});f("#addLine",e).addEventListener("click",()=>{a.items.push(g()),V(),B(),f(`.li[data-i="${a.items.length-1}"] .li-name`,e).focus()}),f("#pickItems",e).addEventListener("click",()=>{const o=H("items");if(!o.length)return L("Your catalogue is empty. Add items in Items.","err");ne({title:"Add from catalogue",wide:!0,submit:"Add selected",body:`<div class="search">${$("search",16)}<input id="pickQ" type="search" placeholder="Filter"></div>
        <div class="pick-list">${o.map(h=>`<label class="pick" data-name="${n(`${h.name} ${h.category}`.toLowerCase())}"><input type="checkbox" name="pick" value="${h.id}"><span>${n(h.name)}<small>${n(h.category||"")}</small></span><b>${k(h.rate)}</b></label>`).join("")}</div>`,onSubmit:h=>{const d=h.getAll("pick");a.items.length===1&&!a.items[0].name&&!Number(a.items[0].rate)&&(a.items=[]);for(const b of d){const x=X("items",b);a.items.push({...g(),name:x.name,description:x.description||"",rate:x.rate,tax:S?x.tax:0,hsn:x.hsn||"",unit:x.unit||"",category:x.category||""})}a.items.length||a.items.push(g()),V(),B()}}),f("#pickQ").addEventListener("input",h=>{const d=h.target.value.toLowerCase();j(".pick").forEach(b=>{b.hidden=!b.dataset.name.includes(d)})})}),f("#addCf",e).addEventListener("click",()=>{a.customFields=a.customFields||[],a.customFields.push({label:"",value:""}),Y(),f(`.cf[data-j="${a.customFields.length-1}"] input`,e).focus()}),f("#customFields",e).addEventListener("click",o=>{o.target.closest("[data-cfdel]")&&(a.customFields.splice(+o.target.closest(".cf").dataset.j,1),Y(),B())}),f("#resetAccent",e).addEventListener("click",()=>{a.accent="",f('[data-f="accent"]',e).value=t.design.accent,B()});const T=()=>{if(!a.number.trim())return L("Number is required","err"),null;if(H("docs").find(d=>d.id!==a.id&&d.type===a.type&&d.number===a.number.trim()))return L(`${a.number} already exists. Change the number.`,"err"),null;if(a.number=a.number.trim(),a.items=a.items.filter(d=>d.name||Number(d.rate)),!a.items.length)return L("Add at least one item","err"),a.items.push(g()),V(),null;const h=Qe(a);return N(),O(!1),h};f("#saveBtn").addEventListener("click",()=>{const o=T();o&&(L(`${u} ${o.number} saved`),A(`#/doc/${o.id}`))}),f("#cancelBtn").addEventListener("click",()=>history.length>1?history.back():A("#/docs/all")),f("#printBtn").addEventListener("click",()=>me([a],t)),C.addEventListener("keydown",o=>{(o.ctrlKey||o.metaKey)&&o.key==="s"&&(o.preventDefault(),f("#saveBtn").click())})}const Vt=["Cash","UPI","Bank transfer","Card","Cheque","Insurance / TPA","Wallet","Other"];function Ne(e,i){const l=M(),t=X("docs",i.id);if(!t){e.innerHTML='<div class="empty"><p>Document not found.</p><a class="btn" href="#/docs/all">Back to documents</a></div>',_("Not found");return}const c=Re(t),a=It(t,c),m=t.type==="invoice"||t.type==="proforma";_(`${R[t.type].name} ${t.number}`,`
    <a class="btn" href="#/edit/${t.id}">${$("edit")}<span class="hide-sm"> Edit</span></a>
    <button class="btn" data-a="print">${$("print")}<span class="hide-sm"> Print / PDF</span></button>
    <button class="btn primary" data-a="share">${$("share")}<span class="hide-sm"> Share</span></button>`);const u=t.client||{};e.innerHTML=`
  <div class="docpage">
    <div class="docpage-preview"><div id="preview"></div></div>
    <aside class="docpage-side">
      <section class="card">
        <div class="row-between">${re(a)}<span class="muted">${n(R[t.type].name)}</span></div>
        <div class="bigmoney">${k(c.payable)}</div>
        ${m?`<div class="muted">Paid ${k(c.paid)} · Balance <b>${k(Math.max(c.balance,0))}</b></div>`:""}
        <div class="muted">${n(u.name||"—")}${u.phone?` · ${n(u.phone)}`:""}</div>
        <div class="muted">Dated ${Q(t.date)}${t.dueDate?` · ${t.type==="quote"?"valid till":"due"} ${Q(t.dueDate)}`:""}</div>
      </section>
      <section class="card actions">
        ${m&&a!=="paid"&&a!=="cancelled"?`<button class="btn primary block" data-a="pay">${$("cash")} Record payment</button>`:""}
        ${t.status==="draft"?`<button class="btn block" data-a="sent">${$("send")} Mark as sent</button>`:""}
        ${t.type==="quote"||t.type==="proforma"?`<button class="btn block" data-a="convert">${$("refresh")} Convert to invoice</button>`:""}
        ${t.type==="quote"&&!["accepted","converted"].includes(a)?`<button class="btn block" data-a="accept">${$("check")} Mark accepted</button>`:""}
        ${t.type==="invoice"?`<button class="btn block" data-a="credit">${$("file")} Create credit note</button>`:""}
        ${t.type==="invoice"&&c.paid?`<button class="btn block" data-a="receipt">${$("file")} Payment receipt</button>`:""}
        <button class="btn block" data-a="dup">${$("copy")} Duplicate</button>
        ${t.status!=="cancelled"?`<button class="btn block" data-a="cancel">${$("x")} Cancel document</button>`:`<button class="btn block" data-a="restore">${$("refresh")} Restore</button>`}
        <button class="btn block danger-text" data-a="delete">${$("trash")} Delete</button>
      </section>
      ${m?`<section class="card">
        <h3>Payments</h3>
        ${t.advance?`<div class="pay-row"><span>Advance</span><b>${k(t.advance)}</b></div>`:""}
        ${(t.payments||[]).map(s=>`<div class="pay-row"><span>${Q(s.date)} · ${n(s.method)}${s.ref?` · ${n(s.ref)}`:""}</span><b>${k(s.amount)}</b>
          <button class="icon-btn danger" data-delpay="${s.id}" aria-label="Remove payment">${$("trash",14)}</button></div>`).join("")||(t.advance?"":'<p class="muted">No payments yet.</p>')}
      </section>`:""}
      ${t.convertedFrom||t.convertedTo?`<section class="card muted">
        ${t.convertedFrom&&X("docs",t.convertedFrom)?`From <a href="#/doc/${t.convertedFrom}">${n(X("docs",t.convertedFrom).number)}</a>`:""}
        ${t.convertedTo&&X("docs",t.convertedTo)?`Converted to <a href="#/doc/${t.convertedTo}">${n(X("docs",t.convertedTo).number)}</a>`:""}
      </section>`:""}
    </aside>
  </div>`,ye(f("#preview",e),t,l);const p=s=>{K("docs",t),N(),s&&L(s),Ne(e,i)},v={print:()=>me([t],l),share:()=>Yt(t,()=>Ne(e,i)),pay:()=>Gt(t,c,()=>p("Payment recorded")),sent:()=>{t.status="sent",t.sentAt=new Date().toISOString(),p("Marked as sent")},accept:()=>{t.status="accepted",p("Marked accepted")},convert:()=>{const s=he(t,"invoice");s.status="draft",s.reference=s.reference||t.number;const r=Qe(s);t.convertedTo=r.id,t.type==="quote"&&(t.status="accepted"),K("docs",t),N(),L(`Invoice ${r.number} created`),A(`#/edit/${r.id}`)},credit:()=>{const s=he(t,"credit");s.status="issued",s.reference=t.number,s.dueDate="",s.notes=`Against invoice ${t.number} dated ${Q(t.date)}`,Le(s)},receipt:()=>{const s=he(t,"receipt");s.items=[{name:`Payment against ${t.number}`,description:(t.payments||[]).map(r=>`${Q(r.date)} ${r.method} ${r.ref||""}`).join(`
`),hsn:"",qty:1,unit:"",rate:c.paid,discount:0,tax:0,category:""}],Object.assign(s,{status:"issued",reference:t.number,dueDate:"",discount:{type:"%",value:0},shipping:0,adjustment:0,insurance:0,terms:""}),Le(s)},dup:()=>Le(he(t)),cancel:async()=>{await J("Cancel document?",`${t.number} stays in your records marked as cancelled.`,"Cancel document")&&(t.status="cancelled",p("Cancelled"))},restore:()=>{t.status="sent",p("Restored")},delete:async()=>{await J("Delete permanently?",`${t.number} will be removed. This cannot be undone.`)&&(je("docs",t.id),N(),L("Deleted"),A("#/docs/all"))}};document.querySelectorAll("[data-a]").forEach(s=>s.addEventListener("click",()=>v[s.dataset.a]&&v[s.dataset.a]())),j("[data-delpay]",e).forEach(s=>s.addEventListener("click",async()=>{await J("Remove payment?","This payment will be removed from the document.","Remove")&&(t.payments=t.payments.filter(r=>r.id!==s.dataset.delpay),p("Payment removed"))}))}function Gt(e,i,l){const t=Math.max(i.balance,0);ne({title:`Record payment · ${e.number}`,body:`<div class="grid g2">
      ${y("Amount",`<input type="number" step="any" min="0" name="amount" value="${t.toFixed(2)}" required>`)}
      ${y("Date",`<input type="date" name="date" value="${z()}">`)}
      ${y("Method",`<select name="method">${I(Vt.map(c=>[c,c]),"UPI")}</select>`)}
      ${y("Reference / UTR / cheque no.",'<input name="ref">')}
    </div><p class="muted">Balance due: ${k(t)}</p>`,onSubmit:c=>{const a=parseFloat(c.get("amount"));if(!(a>0))return L("Enter an amount","err"),!1;e.payments=e.payments||[],e.payments.push({id:Date.now().toString(36),date:c.get("date")||z(),amount:a,method:c.get("method"),ref:c.get("ref")}),e.status==="draft"&&(e.status="sent"),l()}})}async function ot(e,i){const l=await Bt(jt(M(),e,i));return`${new URL("../portal.html",location.href.split("#")[0]).href}#${l}`}function Yt(e,i){const l=M(),t=e.client||{},c=Re(e),m=ne({title:`Share ${e.number}`,submit:"",cancel:"Close",wide:!0,body:`<p class="muted">Your ${n(W().toLowerCase())} opens a private page where they can view, download and pay. The document travels inside the link itself; nothing is uploaded.</p>
      <div class="share-link"><input id="shareUrl" readonly value="Preparing link…"><button class="btn" id="copyLink" type="button">${$("copy")} Copy</button></div>
      <div class="share-btns">
        <a class="btn whatsapp" id="waBtn" target="_blank" rel="noopener">${$("whatsapp")} WhatsApp</a>
        <a class="btn" id="mailBtn">${$("mail")} Email</a>
        <a class="btn" id="openBtn" target="_blank" rel="noopener">${$("globe")} Open portal</a>
        <button class="btn" id="printShare" type="button">${$("download")} Save PDF</button>
      </div>
      ${e.status==="draft"?'<label class="check"><input type="checkbox" id="markSent" checked> Mark as sent when I share</label>':""}`}).el;ot(t.id&&X("clients",t.id)||t,[{...e,status:e.status==="draft"?"sent":e.status}]).then(p=>{const v=k(c.insurance?c.payable:c.total),s=`Hello ${t.name||""},

Your ${e.title||R[e.type].title} ${e.number} for ${v} from ${l.business.name} is ready.
View, download & pay: ${p}

Thank you.`,r=String(t.phone||"").replace(/\D/g,""),w=`https://wa.me/${r.length===10?`91${r}`:r}?text=${encodeURIComponent(s)}`;f("#shareUrl",m).value=p,f("#waBtn",m).href=w,f("#mailBtn",m).href=`mailto:${encodeURIComponent(t.email||"")}?subject=${encodeURIComponent(`${e.title||R[e.type].title} ${e.number} - ${l.business.name}`)}&body=${encodeURIComponent(s)}`,f("#openBtn",m).href=p,p.length>7e3&&f("#shareUrl",m).insertAdjacentHTML("afterend",'<p class="muted small">This link is long (a big logo or many lines). It still works when copied; some apps may shorten the preview.</p>')});const u=()=>{const p=f("#markSent",m);p&&p.checked&&e.status==="draft"&&(e.status="sent",e.sentAt=new Date().toISOString(),K("docs",e),N(),i&&i())};f("#copyLink",m).addEventListener("click",async()=>{await Je(f("#shareUrl",m).value)&&L("Link copied"),u()}),["#waBtn","#mailBtn","#openBtn"].forEach(p=>f(p,m).addEventListener("click",u)),f("#printShare",m).addEventListener("click",()=>me([e],l))}function Qt(e){const i=M();_("Items & services",`
    <button class="btn" id="addStarter">${$("download")}<span class="hide-sm"> ${n(pt(i.industry).name)} starter list</span></button>
    <button class="btn primary" id="addItem">${$("plus")} New item</button>`);const l=()=>{const t=H("items"),c=[...new Set(t.map(u=>u.category).filter(Boolean))];e.innerHTML=`
      <div class="toolbar"><div class="search">${$("search",16)}<input id="q" type="search" placeholder="Filter items"></div>
      <span class="muted">${t.length} items · edit any cell, changes save automatically</span></div>
      ${t.length?`<div class="table-wrap"><table class="table edit-table" id="itemsTable">
        <thead><tr><th>Name</th><th>Description</th><th>Category</th><th>HSN/SAC</th><th>Unit</th><th class="num">Rate</th><th class="num">Tax %</th><th></th></tr></thead>
        <tbody>${t.map(u=>`<tr data-id="${u.id}" data-s="${n(`${u.name} ${u.category} ${u.hsn}`.toLowerCase())}">
          <td><input data-k="name" value="${n(u.name)}"></td>
          <td><input data-k="description" value="${n(u.description||"")}"></td>
          <td><input data-k="category" list="icats" value="${n(u.category||"")}"></td>
          <td><input data-k="hsn" value="${n(u.hsn||"")}" size="8"></td>
          <td><input data-k="unit" value="${n(u.unit||"")}" size="6"></td>
          <td class="num"><input data-k="rate" data-num type="number" step="any" value="${n(u.rate)}"></td>
          <td class="num"><input data-k="tax" data-num type="number" step="any" value="${n(u.tax)}" size="4"></td>
          <td><button class="icon-btn danger" data-del aria-label="Delete">${$("trash",16)}</button></td></tr>`).join("")}</tbody></table></div>
        <datalist id="icats">${c.map(u=>`<option value="${n(u)}">`).join("")}</datalist>`:`<div class="empty">${$("box",40)}<p>Save the products and services you bill often. Picking one on a bill fills rate, tax and HSN.</p></div>`}`;const a=f("#q",e);a.addEventListener("input",()=>j("#itemsTable tbody tr",e).forEach(u=>{u.hidden=!u.dataset.s.includes(a.value.toLowerCase())}));const m=f("#itemsTable",e);m&&(m.addEventListener("change",u=>{const p=u.target,v=p.closest("tr"),s=H("items").find(r=>r.id===v.dataset.id);!s||!p.dataset.k||(s[p.dataset.k]=p.dataset.num!==void 0?parseFloat(p.value)||0:p.value.trim(),K("items",s),N(),L(`Saved · ${s.name} ${k(s.rate)}`))}),m.addEventListener("click",async u=>{if(!u.target.closest("[data-del]"))return;const p=u.target.closest("tr");await J("Delete item?","It will be removed from the catalogue. Bills that used it are not changed.")&&(je("items",p.dataset.id),N(),l())}))};l(),f("#addItem").addEventListener("click",()=>{K("items",{name:"New item",description:"",category:"",hsn:"",unit:"pcs",rate:0,tax:i.taxMode==="none"?0:i.defaultTax}),N(),l();const t=f("#itemsTable tbody tr input",e);t&&(t.focus(),t.select())}),f("#addStarter").addEventListener("click",()=>{const t=new Set(H("items").map(a=>a.name.toLowerCase()));let c=0;for(const a of Xe(i.industry))t.has(a.name.toLowerCase())||(K("items",a),c++);N(),L(c?`Added ${c} items`:"Starter items are already in your list"),l()})}const Xt=["#2563eb","#0f766e","#16a34a","#ea580c","#b91c1c","#db2777","#7c3aed","#0369a1","#334155","#111827","#a16207","#be123c"],Jt={logo:"Logo",business:"Business details",contact:"Phone / email / website",placeOfSupply:"Place of supply",dueDate:"Due date",hsn:"HSN/SAC column",unit:"Units with quantity",discountCol:"Discount column (when used)",taxCol:"Tax % column",shipTo:"Ship-to address",words:"Amount in words",taxSummary:"GST summary table",bank:"Bank details",qr:"UPI QR code",notes:"Notes",terms:"Terms",signature:"Signature block",footer:"Footer / thank-you line",stamp:"PAID / OVERDUE stamp"};function Kt(){const e=M(),i=H("docs").find(c=>c.type==="invoice")||H("docs")[0];if(i)return JSON.parse(JSON.stringify(i));const l=Ee("invoice");l.number=l.number||"INV-0001";const t=pe(e);return l.client={name:`Sample ${e.clientLabel||"Customer"}`,company:"",phone:"+91 90000 00000",address:"MG Road",city:"Kochi",state:"32",pincode:"682001",extra:Object.fromEntries(t.clientFields.map(c=>[c.key,Pe(c)]))},l.fields=Object.fromEntries(t.fields.map(c=>[c.key,Pe(c,0,l.date)])),l.items=Xe(e.industry).slice(0,4).map((c,a)=>({...c,qty:a+1,rate:c.rate||400,discount:0})),l.status="sent",l}function Ae(e){const i=M(),l=i.design;l.show={...mt,...l.show},l.labels=l.labels||{},l.customFields=l.customFields||[];const t=Kt();_("Invoice design studio",`<button class="btn" id="printSample">${$("print")}<span class="hide-sm"> Test print</span></button>`),e.innerHTML=`
  <div class="editor design">
    <div class="editor-form">
      <section class="card">
        <h3>Template</h3>
        <div class="tpl-grid">${$e.map(v=>`<button type="button" class="tpl${v.id===l.template?" on":""}" data-tpl="${v.id}">
          <div class="tpl-thumb" data-thumb="${v.id}"></div><b>${n(v.name)}</b><small>${n(v.note)}</small></button>`).join("")}</div>
      </section>

      <section class="card">
        <h3>Brand & layout</h3>
        <div class="swatches">${Xt.map(v=>`<button type="button" class="sw${v===l.accent?" on":""}" data-sw="${v}" style="background:${v}" aria-label="Colour ${v}"></button>`).join("")}
          <label class="sw-pick" title="Custom colour"><input type="color" id="accent" value="${n(l.accent)}"></label></div>
        <div class="grid g3">
          ${y("Font",`<select data-d="font">${I(Object.entries(bt).map(([v,s])=>[v,s.name]),l.font)}</select>`)}
          ${y("Paper",`<select data-d="paper">${I(Object.entries(ht).map(([v,s])=>[v,s.name]),l.paper)}</select>`)}
          ${y("Header alignment",`<select data-d="align">${I([["left","Left"],["center","Centre"],["right","Right"]],l.align)}</select>`)}
          ${y("Spacing",`<select data-d="density">${I([["compact","Compact"],["normal","Normal"],["roomy","Roomy"]],l.density)}</select>`)}
          <label class="check"><input type="checkbox" data-d="groupByCategory" ${l.groupByCategory?"checked":""}> Group lines by category with sub-totals</label>
        </div>
        <div class="grid g2">
          <div class="upload">
            <span>Logo</span>
            <div class="upload-box">${i.business.logo?`<img src="${n(i.business.logo)}" alt="Logo">`:'<span class="muted">No logo</span>'}</div>
            <div class="row-gap"><label class="btn">${$("upload")} Upload<input type="file" accept="image/*" data-img="logo" hidden></label>${i.business.logo?'<button type="button" class="btn ghost" data-clear="logo">Remove</button>':""}</div>
          </div>
          <div class="upload">
            <span>Signature / seal</span>
            <div class="upload-box">${i.business.signature?`<img src="${n(i.business.signature)}" alt="Signature">`:'<span class="muted">No signature</span>'}</div>
            <div class="row-gap"><label class="btn">${$("upload")} Upload<input type="file" accept="image/*" data-img="signature" hidden></label>${i.business.signature?'<button type="button" class="btn ghost" data-clear="signature">Remove</button>':""}</div>
          </div>
        </div>
      </section>

      <section class="card">
        <h3>Show on the document</h3>
        <div class="toggles">${Object.entries(Jt).map(([v,s])=>`<label class="check"><input type="checkbox" data-show="${v}" ${l.show[v]?"checked":""}> ${n(s)}</label>`).join("")}</div>
      </section>

      <section class="card">
        <h3>Document titles</h3>
        <div class="grid g3">${Object.entries(R).map(([v,s])=>y(s.name,`<input data-title="${v}" value="${n(i.docTitles[v]||s.title)}">`)).join("")}</div>
      </section>

      <section class="card">
        <h3>Rename any label <small>leave blank for the default</small></h3>
        <div class="grid g3">${Object.entries(vt).map(([v,s])=>y(s,`<input data-label="${v}" value="${n(l.labels[v]||"")}" placeholder="${n(s)}">`)).join("")}</div>
      </section>

      <section class="card">
        <h3>Default extra fields <small>added to every new document</small></h3>
        <div id="dcf"></div>
        <button type="button" class="btn ghost" id="addDcf">${$("plus")} Add field</button>
        ${y("Footer text",`<input id="footer" value="${n(i.footer||"")}" placeholder="e.g. This is a computer-generated invoice">`)}
      </section>
    </div>
    <aside class="editor-preview">
      <div class="preview-bar"><span>Preview</span><span class="muted">${H("docs").length?"your latest invoice":"sample data"}</span></div>
      <div id="preview"></div>
    </aside>
  </div>`;const c=e.firstElementChild,a=f("#preview",e),m=()=>j("[data-thumb]",e).forEach(v=>ye(v,{...t,template:v.dataset.thumb,accent:""},i,{maxScale:.3})),u=(v=!1)=>{de(),ye(a,{...t,template:"",accent:""},i),v&&m()};u(!0);const p=()=>{f("#dcf",e).innerHTML=l.customFields.map((v,s)=>`<div class="cf" data-j="${s}">
      <input data-dcf="label" placeholder="Label" value="${n(v.label)}"><input data-dcf="value" placeholder="Default value" value="${n(v.value||"")}">
      <button type="button" class="icon-btn danger" data-dcfdel aria-label="Remove">${$("trash",16)}</button></div>`).join("")||'<p class="muted">e.g. "E-way bill No.", "Vehicle No.", "Delivery date".</p>'};p(),c.addEventListener("click",async v=>{const s=v.target.closest("[data-tpl]");if(s){l.template=s.dataset.tpl,l.template==="thermal"?l.paper="80mm":["80mm","58mm"].includes(l.paper)&&(l.paper="A4"),f('[data-d="paper"]',e).value=l.paper,j(".tpl",e).forEach(S=>S.classList.toggle("on",S===s)),u();return}const r=v.target.closest("[data-sw]");if(r){l.accent=r.dataset.sw,f("#accent",e).value=l.accent,j(".sw",e).forEach(S=>S.classList.toggle("on",S===r)),u(!0);return}const w=v.target.closest("[data-clear]");if(w){i.business[w.dataset.clear]="",N(),Ae(e);return}if(v.target.closest("#addDcf")){l.customFields.push({label:"",value:""}),p();return}v.target.closest("[data-dcfdel]")&&(l.customFields.splice(+v.target.closest(".cf").dataset.j,1),p(),de())}),c.addEventListener("input",v=>{const s=v.target;s.id==="accent"?(l.accent=s.value,j(".sw",e).forEach(r=>r.classList.remove("on")),u()):s.dataset.label?(s.value.trim()?l.labels[s.dataset.label]=s.value:delete l.labels[s.dataset.label],u()):s.dataset.title?(i.docTitles[s.dataset.title]=s.value,s.dataset.title===t.type&&(t.title=s.value),u()):s.dataset.dcf?(l.customFields[+s.closest(".cf").dataset.j][s.dataset.dcf]=s.value,de()):s.id==="footer"&&(i.footer=s.value,u())}),c.addEventListener("change",async v=>{const s=v.target;if(s.dataset.d)l[s.dataset.d]=s.type==="checkbox"?s.checked:s.value,s.dataset.d==="paper"&&["80mm","58mm"].includes(s.value)&&(l.template="thermal"),s.dataset.d==="paper"&&!["80mm","58mm"].includes(s.value)&&l.template==="thermal"&&(l.template="modern"),j(".tpl",e).forEach(r=>r.classList.toggle("on",r.dataset.tpl===l.template)),u(s.dataset.d==="font");else if(s.dataset.show)l.show[s.dataset.show]=s.checked,u();else if(s.dataset.img)try{i.business[s.dataset.img]=await ze(s.files[0],s.dataset.img==="logo"?480:360),N()||L("Image too large for browser storage","err"),Ae(e)}catch(r){L(r.message,"err")}}),f("#printSample").addEventListener("click",()=>me([{...t,template:"",accent:""}],i))}function zt(){const e=z(),[i,l]=e.split("-").map(Number),t=(u,p)=>`${u}-${String(p).padStart(2,"0")}`,c=(u,p)=>new Date(Date.UTC(u,p,0)).toISOString().slice(0,10),a=l===1?[i-1,12]:[i,l-1],m=l>=4?i:i-1;return{month:["This month",`${t(i,l)}-01`,c(i,l)],last:["Last month",`${t(...a)}-01`,c(...a)],q:["Last 90 days",ft(e,-89),e],fy:[`FY ${m}-${String(m+1).slice(2)}`,`${m}-04-01`,`${m+1}-03-31`],pfy:[`FY ${m-1}-${String(m).slice(2)}`,`${m-1}-04-01`,`${m}-03-31`],all:["All time","0000-01-01","9999-12-31"]}}function Zt(e,i,l){const t=zt(),c=l.get("p")||"fy",[a,m,u]=c==="custom"?["Custom",l.get("from")||z(),l.get("to")||z()]:t[c]||t.fy;_("Reports",`<button class="btn" id="csv">${$("download")}<span class="hide-sm"> Export CSV</span></button>`);const p=d=>d.date>=m&&d.date<=u,v=ae(d=>p(d)&&d.status!=="cancelled"&&d.status!=="draft"),s=v.filter(d=>d.d.type==="invoice"),r=v.filter(d=>d.d.type==="credit"),w=(d,b)=>d.reduce((x,D)=>x+b(D),0),S=w(s,d=>d.t.total),C=w(s,d=>d.t.totalTax),E=w(s,d=>d.t.paid),F=w(s,d=>d.t.insurance),G=w(r,d=>d.t.total),B=w(s,d=>Math.max(d.t.balance,0)),P=new Map;for(const d of s){const b=d.d.date.slice(0,7),x=P.get(b)||{n:0,taxable:0,tax:0,total:0,paid:0};x.n++,x.taxable+=d.t.taxable,x.tax+=d.t.totalTax,x.total+=d.t.total,x.paid+=d.t.paid,P.set(b,x)}const te=[...P.entries()].sort((d,b)=>d[0].localeCompare(b[0])),V=Math.max(1,...te.map(([,d])=>d.total)),Y=new Map;for(const d of s)for(const b of d.t.taxes){const x=Y.get(b.rate)||{taxable:0,cgst:0,sgst:0,igst:0};x.taxable+=b.taxable,x.cgst+=b.cgst||0,x.sgst+=b.sgst||0,x.igst+=b.igst||(M().taxMode!=="gst"?b.amount:0),Y.set(b.rate,x)}const se=w(s,d=>d.t.taxable-d.t.taxes.reduce((b,x)=>b+x.taxable,0)),g=ae(d=>d.type==="invoice"&&d.status!=="cancelled"&&d.status!=="draft").filter(d=>d.t.balance>.004),T=[["Not due",0,0],["1-30 days",1,30],["31-60 days",31,60],["61-90 days",61,90],["90+ days",91,1e9]].map(([d,b,x])=>{const D=g.filter(q=>{const be=$t(q.d);return be>=b&&be<=x});return{l:d,n:D.length,amt:w(D,q=>q.t.balance)}}),o=new Map;for(const d of s){const b=d.d.client&&d.d.client.name||"—",x=o.get(b)||{total:0,paid:0,n:0,id:d.d.clientId};x.total+=d.t.total,x.paid+=d.t.paid,x.n++,o.set(b,x)}const h=[...o.entries()].sort((d,b)=>b[1].total-d[1].total).slice(0,10);e.innerHTML=`
    <div class="toolbar">
      <div class="chips">${Object.entries(t).map(([d,[b]])=>`<a class="chip${d===c?" on":""}" href="#/reports?p=${d}">${n(b)}</a>`).join("")}</div>
      <form class="row-gap" id="custom"><input type="date" name="from" value="${n(m>"0001"?m:"")}"><span>to</span><input type="date" name="to" value="${n(u<"9999"?u:"")}"><button class="btn">Apply</button></form>
    </div>
    <p class="muted">${n(a)}${c!=="all"?` · ${n(m)} to ${n(u)}`:""} · issued invoices only</p>
    <div class="kpis">
      <div class="kpi"><span>Invoiced</span><b>${k(S)}</b><small>${s.length} invoices</small></div>
      <div class="kpi"><span>Tax collected</span><b>${k(C)}</b></div>
      <div class="kpi good"><span>Received</span><b>${k(E)}</b></div>
      ${F?`<div class="kpi"><span>Insurance / TPA share</span><b>${k(F)}</b></div>`:""}
      ${G?`<div class="kpi"><span>Credit notes</span><b>${k(G)}</b></div>`:""}
      <div class="kpi warn"><span>Outstanding</span><b>${k(B)}</b></div>
    </div>
    <div class="two-col">
      <section class="card">
        <h3>Month by month</h3>
        ${te.length?`<div class="bars">${te.map(([d,b])=>`<div class="bar-row"><span>${n(d)}</span><div class="bar"><i style="width:${b.total/V*100}%"></i><i class="paid" style="width:${b.paid/V*100}%"></i></div><b>${k(b.total)}</b></div>`).join("")}</div>
        <p class="legend"><i></i> Invoiced <i class="paid"></i> Received</p>
        <div class="table-wrap"><table class="table"><thead><tr><th>Month</th><th class="num">Invoices</th><th class="num">Taxable</th><th class="num">Tax</th><th class="num">Total</th><th class="num">Received</th></tr></thead>
        <tbody>${te.map(([d,b])=>`<tr><td>${n(d)}</td><td class="num">${b.n}</td><td class="num">${k(b.taxable)}</td><td class="num">${k(b.tax)}</td><td class="num">${k(b.total)}</td><td class="num">${k(b.paid)}</td></tr>`).join("")}</tbody></table></div>`:'<p class="muted">No invoices in this period.</p>'}
      </section>
      <section class="card">
        <h3>GST summary <small>for GSTR-1 / 3B</small></h3>
        <div class="table-wrap"><table class="table"><thead><tr><th>Rate</th><th class="num">Taxable</th><th class="num">CGST</th><th class="num">SGST</th><th class="num">IGST</th></tr></thead>
        <tbody>${[...Y.entries()].sort((d,b)=>d[0]-b[0]).map(([d,b])=>`<tr><td>${d}%</td><td class="num">${k(b.taxable)}</td><td class="num">${k(b.cgst)}</td><td class="num">${k(b.sgst)}</td><td class="num">${k(b.igst)}</td></tr>`).join("")}
        ${se>.004?`<tr><td>Nil / exempt</td><td class="num">${k(se)}</td><td class="num">–</td><td class="num">–</td><td class="num">–</td></tr>`:""}</tbody></table></div>
        <h3>Receivables ageing <small>all open invoices</small></h3>
        <div class="table-wrap"><table class="table"><tbody>${T.map(d=>`<tr><td>${d.l}</td><td class="num">${d.n}</td><td class="num">${k(d.amt)}</td></tr>`).join("")}</tbody></table></div>
        <h3>Top ${n(W().toLowerCase())}s</h3>
        <div class="table-wrap"><table class="table"><tbody>${h.map(([d,b])=>`<tr${b.id?` class="link" data-client="${b.id}"`:""}><td>${n(d)}</td><td class="num">${b.n}</td><td class="num">${k(b.total)}</td></tr>`).join("")||'<tr><td class="muted">No data</td></tr>'}</tbody></table></div>
      </section>
    </div>`,f("#custom",e).addEventListener("submit",d=>{d.preventDefault();const b=new FormData(d.target);A(`#/reports?p=custom&from=${b.get("from")||z()}&to=${b.get("to")||z()}`)}),e.querySelectorAll("[data-client]").forEach(d=>d.addEventListener("click",()=>A(`#/client/${d.dataset.client}`))),f("#csv").addEventListener("click",()=>{const d=ae(D=>p(D)),b=["Type","Number","Date","Due date","Status",W(),"Company","GSTIN","Place of supply","Taxable","CGST","SGST","IGST","Total tax","Total","Insurance","Paid","Balance"],x=d.map(({d:D,t:q,status:be})=>[R[D.type].name,D.number,D.date,D.dueDate,be,D.client&&D.client.name,D.client&&D.client.company,D.client&&D.client.gstin,D.placeOfSupply,q.taxable,q.taxes.reduce((ie,le)=>ie+(le.cgst||0),0).toFixed(2),q.taxes.reduce((ie,le)=>ie+(le.sgst||0),0).toFixed(2),q.taxes.reduce((ie,le)=>ie+(le.igst||0),0).toFixed(2),q.totalTax,q.total,q.insurance,q.paid,q.balance]);Ze(`documents-${m>"0001"?m:"all"}-to-${u<"9999"?u:z()}.csv`,Nt([b,...x]),"text/csv")})}function fe(e){const i=M(),l=i.business;_("Settings",'<button class="btn primary" form="setForm">Save settings</button>'),e.innerHTML=`
  <form id="setForm" class="settings">
    <section class="card">
      <h3>Business profile</h3>
      <div class="grid g3">
        ${y("Business name *",`<input name="b.name" required value="${n(l.name)}">`)}
        ${y("Tagline",`<input name="b.tagline" value="${n(l.tagline)}">`)}
        ${y("Registration / licence no.",`<input name="b.regNo" value="${n(l.regNo)}" placeholder="e.g. Clinical Est. Reg. No.">`)}
        ${y("Address",`<textarea name="b.address" rows="2">${n(l.address)}</textarea>`,"span2")}
        ${y("City",`<input name="b.city" value="${n(l.city)}">`)}
        ${y("State",`<select name="b.state">${I(ke.map(([s,r])=>[s,`${r} (${s})`]),l.state)}</select>`)}
        ${y("PIN code",`<input name="b.pincode" value="${n(l.pincode)}">`)}
        ${y("Phone / WhatsApp",`<input name="b.phone" value="${n(l.phone)}">`)}
        ${y("Email",`<input name="b.email" type="email" value="${n(l.email)}">`)}
        ${y("Website",`<input name="b.website" value="${n(l.website)}">`)}
        ${y("GSTIN",`<input name="b.gstin" value="${n(l.gstin)}" maxlength="15" style="text-transform:uppercase">`)}
        ${y("PAN",`<input name="b.pan" value="${n(l.pan)}" maxlength="10" style="text-transform:uppercase">`)}
      </div>
      <div class="grid g2">
        ${["logo","signature"].map(s=>`<div class="upload"><span>${s==="logo"?"Logo":"Signature / seal"}</span>
          <div class="upload-box">${l[s]?`<img src="${n(l[s])}" alt="">`:'<span class="muted">None</span>'}</div>
          <div class="row-gap"><label class="btn">${$("upload")} Upload<input type="file" accept="image/*" data-img="${s}" hidden></label>${l[s]?`<button type="button" class="btn ghost" data-clear="${s}">Remove</button>`:""}</div></div>`).join("")}
      </div>
    </section>

    <section class="card">
      <h3>Getting paid</h3>
      <div class="grid g3">
        ${y("UPI ID (for QR & pay button)",`<input name="b.upiId" value="${n(l.upiId)}" placeholder="name@okhdfcbank">`)}
        ${y("Account name",`<input name="b.accountName" value="${n(l.accountName)}">`)}
        ${y("Bank",`<input name="b.bankName" value="${n(l.bankName)}">`)}
        ${y("Account number",`<input name="b.accountNo" value="${n(l.accountNo)}">`)}
        ${y("IFSC",`<input name="b.ifsc" value="${n(l.ifsc)}" style="text-transform:uppercase">`)}
        ${y("Branch",`<input name="b.branch" value="${n(l.branch)}">`)}
      </div>
    </section>

    <section class="card">
      <h3>Business type <small>now: ${n(Z[i.industry]?Z[i.industry].name:"General")}</small></h3>
      <p class="muted">Switching sets the labels, bill fields, starter items, default tax and design for that kind of business. Existing documents are kept.</p>
      <details class="sp-details"><summary class="btn">Change business type</summary>${nt(i.industry)}</details>
      ${y("What do you call your customers?",`<input name="clientLabel" value="${n(i.clientLabel)}" placeholder="Customer, Client, Patient, Student, Guest, Member, Tenant…">`)}
    </section>

    <section class="card" id="fieldsCard">
      <h3>Fields on your bills <small>add, rename or remove anything</small></h3>
      <div id="fieldEditor"></div>
    </section>

    <section class="card">
      <h3>Tax & money</h3>
      <div class="grid g3">
        ${y("Currency",`<select name="currency">${I(Object.keys(ge).map(s=>[s,`${s} (${ge[s].symbol})`]),i.currency)}</select>`)}
        ${y("Tax system",`<select name="taxMode">${I([["gst","India GST (CGST+SGST / IGST)"],["simple","Simple tax / VAT"],["none","No tax"]],i.taxMode)}</select>`)}
        ${y("Default tax %",`<input name="defaultTax" type="number" step="any" min="0" value="${n(i.defaultTax)}">`)}
        ${y("Payment due after (days)",`<input name="dueDays" type="number" min="0" value="${n(i.dueDays)}">`)}
        <label class="check"><input type="checkbox" name="roundOff" ${i.roundOff?"checked":""}> Round total to whole number</label>
        <label class="check"><input type="checkbox" name="taxInclusive" ${i.taxInclusive?"checked":""}> Rates already include tax (MRP style)</label>
      </div>
    </section>

    <section class="card">
      <h3>Numbering <small>{YYYY} = year, {FY} = financial year, e.g. INV/{FY}/</small></h3>
      <div class="table-wrap"><table class="table edit-table"><thead><tr><th>Document</th><th>Prefix</th><th>Next no.</th><th>Digits</th><th>Suffix</th><th>Next will be</th></tr></thead>
      <tbody>${Object.entries(R).map(([s,r])=>`<tr><td>${n(r.name)}</td>
        <td><input name="n.${s}.prefix" value="${n(i.numbering[s].prefix)}"></td>
        <td><input name="n.${s}.next" type="number" min="1" value="${n(i.numbering[s].next)}"></td>
        <td><input name="n.${s}.pad" type="number" min="1" max="8" value="${n(i.numbering[s].pad)}"></td>
        <td><input name="n.${s}.suffix" value="${n(i.numbering[s].suffix)}"></td>
        <td><b>${n(gt(s))}</b></td></tr>`).join("")}</tbody></table></div>
    </section>

    <section class="card">
      <h3>Default text</h3>
      <div class="grid g2">
        ${y("Notes on new documents",`<textarea name="notes" rows="3">${n(i.notes)}</textarea>`)}
        ${y("Terms on new documents",`<textarea name="terms" rows="3">${n(i.terms)}</textarea>`)}
      </div>
    </section>
  </form>

  <section class="card">
    <h3>Your data</h3>
    <p class="muted">Everything is saved in this browser on this device. Download a backup regularly and keep it safe; restore it on any device.</p>
    <div class="row-gap wrap">
      <button class="btn" id="exp">${$("download")} Download backup</button>
      <label class="btn">${$("upload")} Restore backup<input type="file" id="imp" accept="application/json,.json" hidden></label>
      <button class="btn" id="sample">${$("refresh")} Add sample data</button>
      <button class="btn danger-text" id="reset">${$("trash")} Erase this business's data</button>
      ${Be().length>1?`<button class="btn danger-text" id="delWs">${$("trash")} Remove this business from BillX</button>`:""}
    </div>
    <p class="muted small">Backups cover the business you have open (${n(l.name)}). Switch business from the sidebar to back up the others.</p>
  </section>`;const t=f("#setForm",e);it(t,s=>{t.elements.clientLabel.value=Z[s].clientLabel});const c=pe(i),a={fields:c.fields.map(s=>({...s})),clientFields:c.clientFields.map(s=>({...s})),itemCols:c.itemCols.filter(s=>!s.hidden).map(s=>({...s})),hiddenCols:c.itemCols.filter(s=>s.hidden),insurance:c.insurance},m=[["fields","Bill details","Shown with the number and date on every bill: e.g. Vehicle No., Room No., Project, Table, Event date.",!0],["clientFields",`${i.clientLabel} fields`,`Saved on each ${i.clientLabel.toLowerCase()} and printed under their name: e.g. Member ID, Age, PAN.`,!1],["itemCols","Extra item columns","Extra columns in the items table: e.g. Batch, Expiry, Size, Colour, Serial / IMEI, Weight.",!1]],u=()=>{f("#fieldEditor",e).innerHTML=`${m.map(([s,r,w,S])=>`<div class="fe-block" data-list="${s}">
      <div class="fe-head"><b>${n(r)}</b><span class="muted small">${n(w)}</span></div>
      ${a[s].map((C,E)=>`<div class="fe-row" data-i="${E}">
        <input data-fe="label" value="${n(C.label)}" placeholder="Field name" aria-label="Field name">
        ${S?`<select data-fe="type" aria-label="Type">${I([["","Text"],["date","Date"]],C.type||"")}</select>`:""}
        <button type="button" class="icon-btn" data-fe-move="-1" aria-label="Move up">${$("up",16)}</button>
        <button type="button" class="icon-btn danger" data-fe-del aria-label="Remove">${$("trash",16)}</button>
      </div>`).join("")||'<p class="muted small">None.</p>'}
      <button type="button" class="btn ghost" data-fe-add>${$("plus")} Add</button>
    </div>`).join("")}
    <label class="check"><input type="checkbox" data-fe-ins ${a.insurance?"checked":""}> Third-party share on bills (insurance / TPA / sponsor / subsidy pays part, the rest is payable)</label>`};u();const p=f("#fieldEditor",e);p.addEventListener("input",s=>{const r=s.target.closest(".fe-row");if(!r)return;const w=a[r.closest("[data-list]").dataset.list];w[+r.dataset.i][s.target.dataset.fe]=s.target.value,O(!0)}),p.addEventListener("change",s=>{s.target.matches("[data-fe-ins]")&&(a.insurance=s.target.checked,O(!0))}),p.addEventListener("click",s=>{const r=s.target.closest("[data-list]");if(!r)return;const w=!!s.target.closest("[data-fe-add]"),S=a[r.dataset.list],C=s.target.closest(".fe-row");if(w)S.push({key:`f${Date.now().toString(36)}`,label:""});else if(C&&s.target.closest("[data-fe-del]"))S.splice(+C.dataset.i,1);else if(C&&s.target.closest("[data-fe-move]")){const E=+C.dataset.i;E>0&&([S[E-1],S[E]]=[S[E],S[E-1]])}else return;if(O(!0),u(),w){const E=p.querySelectorAll(`[data-list="${r.dataset.list}"] [data-fe="label"]`);E.length&&E[E.length-1].focus()}}),t.addEventListener("input",()=>O(!0)),t.addEventListener("change",async s=>{const r=s.target;if(r.dataset.img)try{l[r.dataset.img]=await ze(r.files[0],r.dataset.img==="logo"?480:360),N()?L("Image saved"):L("Image too large for browser storage","err"),O(!1),fe(e)}catch(w){L(w.message,"err")}}),t.addEventListener("click",s=>{const r=s.target.closest("[data-clear]");r&&(l[r.dataset.clear]="",N(),fe(e))}),t.addEventListener("submit",async s=>{s.preventDefault();const r=new FormData(t),w=r.get("industry");let S=!1;if(w&&w!==i.industry&&await J(`Switch to ${Z[w].name}?`,"Labels, fields, default tax and the default design change to suit it, and its starter items are added. Your existing documents are kept.","Switch")&&(Ye(w),S=!0),!S){const C=E=>E.filter(F=>F.label&&F.label.trim()).map(F=>({...F,label:F.label.trim()}));i.sector={fields:C(a.fields),clientFields:C(a.clientFields),itemCols:[...a.hiddenCols,...C(a.itemCols)],insurance:a.insurance}}for(const[C,E]of r.entries())if(C.startsWith("b."))l[C.slice(2)]=String(E).trim();else if(C.startsWith("n.")){const[,F,G]=C.split(".");i.numbering[F][G]=["next","pad"].includes(G)?Math.max(1,parseInt(E,10)||1):String(E)}l.gstin=l.gstin.toUpperCase(),l.pan=l.pan.toUpperCase(),l.ifsc=l.ifsc.toUpperCase(),Object.assign(i,{clientLabel:S?i.clientLabel:r.get("clientLabel")||i.clientLabel,currency:r.get("currency"),taxMode:r.get("taxMode"),defaultTax:parseFloat(r.get("defaultTax"))||0,dueDays:parseInt(r.get("dueDays"),10)||0,roundOff:r.has("roundOff"),taxInclusive:r.has("taxInclusive"),notes:r.get("notes"),terms:r.get("terms")}),de(),N(),O(!1),L("Settings saved"),fe(e)}),f("#exp",e).addEventListener("click",()=>Ze(`billing-backup-${new Date().toISOString().slice(0,10)}.json`,yt())),f("#imp",e).addEventListener("change",async s=>{const r=s.target.files[0];if(r&&await J("Restore this backup?","It replaces all data in this browser with the backup.","Restore"))try{wt(await r.text()),L("Backup restored"),A("#/")}catch(w){L(w.message,"err")}}),f("#sample",e).addEventListener("click",async()=>{await J("Add sample data?","Adds demo clients, items and documents and fills the business profile with sample details. You can edit or delete them later.","Add samples")&&(Ge(i.industry),N(),L("Sample data added"),A("#/"))});const v=f("#delWs",e);v&&v.addEventListener("click",async()=>{await J(`Remove ${l.name}?`,"This business and all its documents, customers and items are deleted from this browser. Download a backup first if you need it.","Remove business")&&(We(Ve()),location.hash="#/",location.reload())}),f("#reset",e).addEventListener("click",async()=>{await J("Erase everything?","All documents, clients, items and settings in this browser are deleted. Download a backup first if you need it.","Erase")&&(kt(),location.hash="#/",location.reload())})}let ee=null;const Me="billx-guest",ea=e=>{try{return localStorage.getItem(e)}catch{return null}},ct=(e,i)=>{try{i===null?localStorage.removeItem(e):localStorage.setItem(e,i)}catch{}};new URLSearchParams(location.search).get("guest")==="1"&&ct(Me,"1");const Fe=et()&&ea(Me)==="1",dt=()=>{ct(Me,null),location.hash="#/signup",location.reload()};document.querySelectorAll("[data-ic]").forEach(e=>{e.innerHTML=$(e.dataset.ic,20)});function Se(){const e=M(),i=document.querySelector("[data-nav-clients]");i&&(i.textContent=`${e.clientLabel||"Client"}s`),document.getElementById("wsName").textContent=e.business.name,document.getElementById("wsSector").textContent=(Z[e.industry]||Z.general).name}function ve(){return ee?ee.access.limitsOf(ee.session.account).businesses:1/0}function ta(){const e=Be();ne({title:"Your businesses",submit:"",cancel:"Close",body:`<p class="muted">Run every business from one BillX. Each has its own customers, items, numbering, design and reports.</p>
      <div class="ws-list">${e.map(l=>{const t=Ct(l.id);return`<button type="button" class="ws-item${l.active?" on":""}" data-ws="${l.id}"><b>${n(t.name||"New business")}</b>
        <small>${n((Z[t.industry]||{}).name||"Not set up yet")}${l.active?" · open now":""}</small></button>`}).join("")}</div>
      <button type="button" class="btn primary block" id="wsAdd">${$("plus")} Add another business</button>
      ${Number.isFinite(ve())?`<p class="muted small">${e.length} of ${ve()} businesses on your plan.</p>`:""}`}).el.addEventListener("click",l=>{const t=l.target.closest("[data-ws]");if(t&&!t.classList.contains("on")&&(Et(t.dataset.ws),location.hash="#/",location.reload()),l.target.closest("#wsAdd")){if(e.length>=ve()){L(`Your plan allows ${ve()} businesses. Upgrade for more.`,"err");return}if(Tt()===null)return;location.hash="#/",location.reload()}})}const He=e=>(i,l,t)=>{if(!Dt.canWrite()){L("Your trial or plan has ended. Choose a plan to make changes; your data is safe.","err"),location.hash="#/subscription";return}e(i,l,t)};function aa(){U("/",Ft),U("/docs/:type?",Ht),U("/new/:type",He(Ie)),U("/edit/:id",He(Ie)),U("/doc/:id",Ne),U("/clients",Pt),U("/client/:id",lt),U("/items",Qt),U("/design",Ae),U("/reports",Zt),U("/settings",fe),ee&&U("/subscription",(e,i,l)=>ce(()=>import("./subscription-oKn1lnwT.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21]),import.meta.url).then(t=>t.subscriptionView(e,i,l))),U("/signup",()=>{Fe?dt():location.hash="#/"}),U("/login",()=>{location.hash="#/"})}function Ce(){const e=document.getElementById("acctBanner");if(Fe){e.className="acct-banner",e.innerHTML='You are using BillX free on this device, without an account. <button class="btn" id="bannerSignup">Create free account</button> <span class="muted small">to save in the cloud, add staff and use it on every device.</span>',e.hidden=!1,document.getElementById("bannerSignup").onclick=dt;return}if(!ee){e.hidden=!0;return}const{session:i,access:l}=ee;if(i.error==="permission"){e.className="acct-banner bad",e.innerHTML='You no longer have access to this account. <button class="btn" id="bannerOut">Sign out</button>',e.hidden=!1,document.getElementById("bannerOut").onclick=()=>ce(()=>import("./session-DklIgF9q.js"),__vite__mapDeps([2,3,4,5,6,7,8,9,10,1,11,12]),import.meta.url).then(u=>u.signOut());return}const t=l.accessInfo(i.account),c=i.role==="owner",a=c?'<a class="btn" href="#/subscription">Choose a plan</a>':"<span>Ask the account owner to renew.</span>",m={trial:t.daysLeft<=14?`Free trial: <b>${t.daysLeft} day${t.daysLeft===1?"":"s"} left</b>. ${a}`:"",grace:`Payment due. Access continues for ${t.daysLeft} day${t.daysLeft===1?"":"s"}. ${c?'<a class="btn" href="#/subscription">Update payment</a>':""}`,expired:`Your ${i.account&&i.account.paidUntil?"plan":"free trial"} has ended. Your bills are safe and you can view them; choose a plan to continue. ${a}`,active:""}[t.state];e.className=`acct-banner ${t.state==="expired"?"bad":t.state==="grace"?"warn":""}`,e.innerHTML=m,e.hidden=!m}function _e(){document.body.classList.remove("onboarding"),window.onhashchange=null,Se(),Lt(Se),document.getElementById("wsBtn").addEventListener("click",ta),document.getElementById("menuBtn").addEventListener("click",()=>document.body.classList.toggle("nav-open")),document.getElementById("scrim").addEventListener("click",()=>document.body.classList.remove("nav-open")),window.addEventListener("billing:save-failed",()=>L("Browser storage is full. Download a backup and remove large images.","err")),window.addEventListener("billx:readonly",()=>L("Read-only: your trial or plan has ended. Choose a plan to make changes.","err")),St(()=>{Se(),!/^#\/(new|edit|settings|design)/.test(location.hash)&&!document.querySelector("dialog[open]")&&ue()}),aa(),Ce(),ee&&(document.getElementById("navSub").hidden=!1,document.getElementById("sideNote").textContent=`Signed in as ${ee.session.user.email}. Saved to the cloud.`,Ce(),window.addEventListener("billx:account",()=>{Ce()})),Mt()}async function sa(){if(!et()||Fe){xt(),_e();return}const[e,i,l]=await Promise.all([ce(()=>import("./session-DklIgF9q.js"),__vite__mapDeps([2,3,4,5,6,7,8,9,10,1,11,12]),import.meta.url),ce(()=>import("./auth-view-mnOOsWFp.js"),__vite__mapDeps([22,3,4,7,8,5,6,9,1,15,11,12,19]),import.meta.url),ce(()=>import("./access-Bs4tIRgd.js"),__vite__mapDeps([10,1]),import.meta.url)]);i.showStatus("Loading…");const t=location.hash.match(/^#\/signup\?(.*plan=.*)$/);t&&sessionStorage.setItem("billx-wanted",t[1]),e.startCloud({onSignedOut:()=>i.showAuth(),onVerify:c=>i.showVerify(c),onStatus:c=>i.showStatus(c),onReady:(c,a)=>{if(a){i.showStatus(`Could not open your account (${a.code||a.message}). Check your connection and reload.`);return}if(ee={session:c,access:l},/^#\/(signup|login)/.test(location.hash)){const m=sessionStorage.getItem("billx-wanted");location.hash=m&&M().onboarded&&c.role==="owner"?`#/subscription?${m}`:"#/"}_e()}})}sa();export{_ as s};
