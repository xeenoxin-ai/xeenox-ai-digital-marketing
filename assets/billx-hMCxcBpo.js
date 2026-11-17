import"./modulepreload-polyfill-B5Qt9EMX.js";import{e as i,I as Z,i as $,g as et,$ as M,a as U,f as tt,s as j,c as at,d as st,t as K,D as F,b as Q,h as de,w as Ee,j as y,o as I,S as ye,C as ve,k as f,r as Me,l as Fe,m as Re,n as Oe,p as oe,q as N,u as ce,v as X,x as z,y as S,z as J,A as De,B as re,E as se,F as Pe,G as qe,H as xe,T as be,J as nt,K as $e,L as Ue,M as me,N as Ne,O as it,P as lt,Q as ot,R as He,U as dt,V as ct,W as rt,X as ut,Y as We,Z as je,_ as pt,a0 as Ge,a1 as mt,a2 as bt,a3 as ht,a4 as vt,a5 as $t,a6 as ft,a7 as gt,a8 as yt,a9 as wt,aa as kt}from"./portal-codec-_bXHpt1u.js";const Ve=[];let fe=!1,Ye=location.hash,we=!1;function Y(e,s){Ve.push({parts:e.split("/").filter(Boolean),view:s})}function xt(e,s){const l=s.split("/").filter(Boolean),t={};if(l.length>e.length)return null;for(let c=0;c<e.length;c++){const a=e[c],b=l[c];if(a.startsWith(":")){const u=a.endsWith("?"),p=a.slice(1).replace("?","");if(b===void 0){if(!u)return null;t[p]="";continue}t[p]=decodeURIComponent(b)}else if(a!==b)return null}return t}const O=e=>{fe=e};function A(e,{replace:s=!1}={}){s?(history.replaceState(null,"",e),ge()):location.hash===e?ge():location.hash=e}function H(e,s=""){document.getElementById("pageTitle").textContent=e,document.getElementById("pageActions").innerHTML=s,document.title=`${e} · BillX`}function ge(){const[e,s]=(location.hash.slice(1)||"/").split("?"),l=new URLSearchParams(s||""),t=document.getElementById("view");for(const c of Ve){const a=xt(c.parts,e);if(a){fe=!1,Ye=location.hash,document.querySelectorAll(".nav a").forEach(b=>{const u=b.getAttribute("href").split("/")[1];b.classList.toggle("on",e.split("/")[1]===u||u==="docs"&&["doc","edit","new"].includes(e.split("/")[1])||u==="clients"&&e.split("/")[1]==="client")}),document.body.classList.remove("nav-open"),document.querySelectorAll("dialog.modal").forEach(b=>b.remove()),t.scrollTop=0,window.scrollTo(0,0);try{c.view(t,a,l)}catch(b){console.error(b),t.innerHTML=`<div class="empty"><p>Something went wrong showing this page.</p><pre class="err">${i(b.message)}</pre><a class="btn" href="#/">Go to dashboard</a></div>`}return}}A("#/",{replace:!0})}function Lt(){window.addEventListener("hashchange",()=>{if(we){we=!1;return}if(fe&&!confirm("You have unsaved changes. Leave without saving?")){we=!0,location.hash=Ye;return}ge()}),window.addEventListener("beforeunload",e=>{fe&&(e.preventDefault(),e.returnValue="")}),ge()}function _e(e,s="industry"){const l=Object.keys(Z).length;return`<div class="sector-picker">
    <div class="search sp-search">${$("search",16)}<input type="search" data-sp-q placeholder="Search ${l} business types: salon, garage, school, jewellery, transport…" aria-label="Search business types"></div>
    ${et().map(([t,c])=>`<div class="sp-group">
      <h4>${i(t)}</h4>
      <div class="ind-grid">${c.map(([a,b])=>{const u=[b.name,t,b.clientLabel,b.docTitle,...b.items.map(p=>p[0]),...b.fields.map(p=>p.label),...b.clientFields.map(p=>p.label),...b.itemCols.map(p=>p.label)].join(" ").toLowerCase();return`<label class="ind${a===e?" on":""}" data-s="${i(u)}"><input type="radio" name="${s}" value="${a}" ${a===e?"checked":""}>
        <b>${i(b.name)}</b><small>${i(b.clientLabel)}s · ${i(b.docTitle)}</small></label>`}).join("")}</div></div>`).join("")}
    <p class="muted small sp-none" hidden>No match. Pick <b>Custom (build your own)</b> and add your own fields.</p>
  </div>`}function Qe(e,s){const l=e.querySelector("[data-sp-q]");l.addEventListener("input",()=>{const t=l.value.trim().toLowerCase();let c=0;M(".sp-group",e).forEach(a=>{let b=0;M(".ind",a).forEach(u=>{const p=!t||t.split(/\s+/).every(v=>u.dataset.s.includes(v));u.hidden=!p,p&&b++}),a.hidden=!b,c+=b}),e.querySelector(".sp-none").hidden=c>0}),l.addEventListener("keydown",t=>{t.key==="Enter"&&t.preventDefault()}),e.addEventListener("change",t=>{t.target.matches(".ind input")&&(M(".ind",e).forEach(c=>c.classList.toggle("on",c.contains(t.target))),s&&s(t.target.value))})}const ue=(e,s=j())=>at(e,{sellerState:s.business.state,taxMode:s.taxMode,roundOff:s.roundOff,taxInclusive:s.taxInclusive}),Xe=(e,s=ue(e))=>st(e,s),k=e=>tt(e,j().currency),W=()=>j().clientLabel||"Client";function te(e=()=>!0){return U("docs").filter(e).map(s=>{const l=ue(s);return{d:s,t:l,status:Xe(s,l)}}).sort((s,l)=>(l.d.date||"").localeCompare(s.d.date||"")||(l.d.number||"").localeCompare(s.d.number||""))}function Je(e){let s=0,l=0,t=0;for(const{d:c,t:a,status:b}of te(u=>u.clientId===e))b==="cancelled"||b==="draft"||(c.type==="invoice"&&(s+=a.payable,l+=a.paid),c.type==="credit"&&(t+=a.total));return{billed:s,paid:l,credit:t,outstanding:s-l-t}}function St(e){const s=String(e??"");return/[",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s}const Ct=e=>e.map(s=>s.map(St).join(",")).join(`
`),Tt=""+new URL("logo-CqiQSCWF.svg",import.meta.url).href;function Et(e){const s=j();if(!s.onboarded)return Dt(e);H("Dashboard",`<a class="btn" href="#/new/quote">${$("plus")}<span class="hide-sm"> Quote</span></a>
    <a class="btn primary" href="#/new/invoice">${$("plus")} New ${i((s.docTitles.invoice||"Invoice").toLowerCase())}</a>`);const l=K(),t=l.slice(0,7),c=te(g=>g.status!=="cancelled"&&g.status!=="draft"),a=c.filter(g=>g.d.type==="invoice"),b=a.filter(g=>g.d.date.startsWith(t)),u=(g,E)=>g.reduce((o,h)=>o+E(h),0),p=a.filter(g=>g.status==="overdue"),v=u(a,g=>Math.max(g.t.balance,0)),n=a.reduce((g,E)=>g+(E.d.payments||[]).filter(o=>(o.date||"").startsWith(t)).reduce((o,h)=>o+Number(h.amount||0),0),0),r=c.filter(g=>g.d.type==="quote"&&g.status==="awaiting"),w=[],[L,T]=l.split("-").map(Number);for(let g=5;g>=0;g--){const E=new Date(Date.UTC(L,T-1-g,1));w.push(E.toISOString().slice(0,7))}const C=w.map(g=>({k:g,billed:u(a.filter(E=>E.d.date.startsWith(g)),E=>E.t.total),paid:a.reduce((E,o)=>E+(o.d.payments||[]).filter(h=>(h.date||"").startsWith(g)).reduce((h,d)=>h+Number(d.amount||0),0),0)})),R=Math.max(1,...C.map(g=>Math.max(g.billed,g.paid))),V=560,B=180,P=V/C.length,ee=C.map((g,E)=>{const o=g.billed/R*(B-30),h=g.paid/R*(B-30),d=new Date(`${g.k}-01T00:00:00`).toLocaleDateString("en-GB",{month:"short"});return`<g><title>${d}: billed ${k(g.billed)}, received ${k(g.paid)}</title>
      <rect x="${E*P+P*.18}" y="${B-20-o}" width="${P*.3}" height="${o}" rx="3" class="c-billed"/>
      <rect x="${E*P+P*.52}" y="${B-20-h}" width="${P*.3}" height="${h}" rx="3" class="c-paid"/>
      <text x="${E*P+P/2}" y="${B-4}" text-anchor="middle">${d}</text></g>`}).join(""),G=te().slice(0,8),_=a.filter(g=>["sent","partial","overdue"].includes(g.status)).sort((g,E)=>(g.d.dueDate||"").localeCompare(E.d.dueDate||"")).slice(0,6),ae=!U("docs").length;e.innerHTML=`
    ${ae?`<section class="card hero">
      <h2>Welcome, ${i(s.business.name)}</h2>
      <p>Create your first ${i((s.docTitles.invoice||"invoice").toLowerCase())} in under a minute. Your logo, UPI QR and design are applied automatically.</p>
      <div class="row-gap wrap"><a class="btn primary" href="#/new/invoice">${$("plus")} Create ${i((s.docTitles.invoice||"invoice").toLowerCase())}</a>
      <a class="btn" href="#/settings">${$("settings")} Complete business profile</a><a class="btn" href="#/design">${$("palette")} Choose a design</a></div>
    </section>`:""}
    <div class="kpis">
      <div class="kpi"><span>Billed this month</span><b>${k(u(b,g=>g.t.total))}</b><small>${b.length} ${i(F.invoice.plural.toLowerCase())}</small></div>
      <div class="kpi good"><span>Received this month</span><b>${k(n)}</b></div>
      <div class="kpi warn"><span>Outstanding</span><b>${k(v)}</b><small>${a.filter(g=>g.t.balance>.004).length} unpaid</small></div>
      <a class="kpi bad" href="#/docs/invoice?status=overdue"><span>Overdue</span><b>${k(u(p,g=>g.t.balance))}</b><small>${p.length} invoices</small></a>
      <a class="kpi" href="#/docs/quote?status=awaiting"><span>Open quotes</span><b>${k(u(r,g=>g.t.total))}</b><small>${r.length} waiting</small></a>
    </div>
    <div class="two-col">
      <section class="card">
        <div class="row-between"><h3>Last 6 months</h3><span class="legend"><i></i> Billed <i class="paid"></i> Received</span></div>
        <svg class="chart" viewBox="0 0 ${V} ${B}" role="img" aria-label="Billed and received per month">${ee}</svg>
      </section>
      <section class="card">
        <h3>Waiting for payment</h3>
        ${_.length?_.map(({d:g,t:E,status:o})=>`<a class="list-row" href="#/doc/${g.id}">
          <span><b>${i(g.client?g.client.name:"—")}</b><small>${i(g.number)} · due ${Q(g.dueDate)}</small></span>
          <span class="right">${k(E.balance)}${de(o)}</span></a>`).join(""):'<p class="muted">Nothing outstanding. 🎉</p>'}
      </section>
    </div>
    <section class="card">
      <div class="row-between"><h3>Recent documents</h3><a href="#/docs/all">See all</a></div>
      ${G.length?`<div class="table-wrap"><table class="table"><thead><tr><th>Number</th><th>${i(W())}</th><th>Date</th><th class="num">Amount</th><th>Status</th></tr></thead>
      <tbody>${G.map(({d:g,t:E,status:o})=>`<tr class="link" data-id="${g.id}"><td><b>${i(g.number)}</b><div class="sub">${i(F[g.type].name)}</div></td>
        <td>${i(g.client?g.client.name:"—")}</td><td>${Q(g.date)}</td><td class="num">${k(E.payable)}</td><td>${de(o)}</td></tr>`).join("")}</tbody></table></div>`:'<p class="muted">No documents yet.</p>'}
    </section>`,M("tr.link",e).forEach(g=>g.addEventListener("click",()=>A(`#/doc/${g.dataset.id}`)))}function Ae(e){const s=Z[e];if(!s)return"";if(s.custom)return"Start blank: add your own bill fields, customer fields and item columns in Settings → Fields on your bills.";const l=[`${s.clientLabel}s`,s.docTitle,s.fields.length?`bill fields: ${s.fields.map(t=>t.label).join(", ")}`:"",s.clientFields.length?`${s.clientLabel.toLowerCase()} fields: ${s.clientFields.map(t=>t.label).join(", ")}`:"",s.itemCols.filter(t=>!t.hidden).length?`item columns: ${s.itemCols.filter(t=>!t.hidden).map(t=>t.label).join(", ")}`:"",`${s.items.length} starter items`,`${s.tax}% tax`].filter(Boolean);return`<b>${i(s.name)}</b> · ${i(l.join(" · "))}. You can change all of it later.`}function Dt(e){const s=j(),l=Ee().filter(a=>!a.active);H("Set up BillX",""),document.body.classList.add("onboarding"),e.innerHTML=`
  <form class="onboard" id="ob">
    <div class="onboard-head"><img src="${Tt}" alt="" width="48" height="48"><div><h1>${l.length?"Add a business to BillX":"Welcome to BillX"}</h1>
    <p>Billing &amp; invoicing for every kind of business. Pick your type and BillX prepares the fields, labels, tax, starter items and invoice design. Not listed? Choose <b>Custom</b> and build your own.</p></div></div>
    ${_e(s.industry||"general")}
    <p class="sp-info" id="spInfo">${Ae(s.industry||"general")}</p>
    <div class="grid g3">
      ${y("Business name",`<input name="name" placeholder="e.g. Sunrise Traders" value="${s.business.name==="Your Business Name"?"":i(s.business.name)}">`)}
      ${y("State",`<select name="state">${I(ye.map(([a,b])=>[a,b]),s.business.state)}</select>`)}
      ${y("Currency",`<select name="currency">${I(Object.keys(ve).map(a=>[a,`${a} (${ve[a].symbol})`]),s.currency)}</select>`)}
    </div>
    <div class="row-gap wrap end">
      ${l.length?'<button type="button" class="btn ghost" id="obCancel">Cancel</button>':""}
      <button class="btn" value="sample">${$("eye")} Explore with sample data</button>
      <button class="btn primary" value="start">${$("check")} Start billing</button>
    </div>
  </form>`;const t=f("#ob",e);Qe(t,a=>{f("#spInfo",t).innerHTML=Ae(a)});const c=f("#obCancel",t);c&&c.addEventListener("click",()=>{Me(Fe()),document.body.classList.remove("onboarding"),location.hash="#/",location.reload()}),t.addEventListener("submit",a=>{a.preventDefault();const b=new FormData(t),u=b.get("industry")||"general",p=a.submitter&&a.submitter.value==="sample";p?Re(u):Oe(u),b.get("name")&&(s.business.name=b.get("name").trim()),p||(s.business.state=b.get("state")),s.currency=b.get("currency"),s.currency!=="INR"&&(s.taxMode="simple"),s.onboarded=!0,oe(),N(),document.body.classList.remove("onboarding"),location.hash="#/",location.reload()})}function Le(e){const s=j(),l=ce(s),t=e.extra||{};return`<div class="grid g2">
    ${y("Name *",`<input name="name" required value="${i(e.name||"")}">`)}
    ${y("Company / organisation",`<input name="company" value="${i(e.company||"")}">`)}
    ${y("Phone / WhatsApp",`<input name="phone" type="tel" value="${i(e.phone||"")}">`)}
    ${y("Email",`<input name="email" type="email" value="${i(e.email||"")}">`)}
    ${l.clientFields.map(c=>y(c.label,c.options?`<select name="x_${c.key}">${I(c.options.map(a=>[a,a||"—"]),t[c.key]||"")}</select>`:`<input name="x_${c.key}" value="${i(t[c.key]||"")}">`)).join("")}
    ${s.taxMode!=="none"?y("GSTIN / Tax ID",`<input name="gstin" value="${i(e.gstin||"")}" maxlength="15" style="text-transform:uppercase">`):""}
    ${y("Address",`<textarea name="address" rows="2">${i(e.address||"")}</textarea>`,"span2")}
    ${y("City",`<input name="city" value="${i(e.city||"")}">`)}
    ${y("PIN code",`<input name="pincode" value="${i(e.pincode||"")}">`)}
    ${y("State",`<select name="state">${I(ye.map(([c,a])=>[c,a]),e.state||s.business.state)}</select>`)}
    ${y("Shipping address (if different)",`<textarea name="shipAddress" rows="2">${i(e.shipAddress||"")}</textarea>`)}
    ${y("Private notes",`<textarea name="notes" rows="2">${i(e.notes||"")}</textarea>`,"span2")}
  </div>`}function Se(e,s){const l={...s,extra:{...s.extra||{}}};for(const[t,c]of e.entries())t.startsWith("x_")?l.extra[t.slice(2)]=String(c).trim():l[t]=String(c).trim();return l.gstin&&(l.gstin=l.gstin.toUpperCase()),l}function It(e,s,l){const t=W(),c=(l.get("q")||"").toLowerCase(),a=ce(j()).clientFields[0];H(`${t}s`,`<a class="btn primary" href="#/client/new">${$("plus")} New ${i(t.toLowerCase())}</a>`);const b=U("clients").filter(p=>!c||[p.name,p.company,p.phone,p.email,p.gstin,...Object.values(p.extra||{})].some(v=>String(v||"").toLowerCase().includes(c))).map(p=>({c:p,b:Je(p.id)})).sort((p,v)=>v.b.outstanding-p.b.outstanding||p.c.name.localeCompare(v.c.name));e.innerHTML=`
    <div class="toolbar"><div class="search">${$("search",16)}<input id="q" type="search" placeholder="Search name, phone, ${a?i(a.label):"GSTIN"}" value="${i(c)}"></div></div>
    ${b.length?`<div class="table-wrap"><table class="table">
      <thead><tr><th>Name</th><th>Contact</th><th class="num">Billed</th><th class="num">Outstanding</th></tr></thead>
      <tbody>${b.map(({c:p,b:v})=>`<tr class="link" data-id="${p.id}">
        <td><b>${i(p.name)}</b>${p.company&&p.company!==p.name?`<div class="sub">${i(p.company)}</div>`:""}${a&&p.extra&&p.extra[a.key]?`<div class="sub">${i(a.label)}: ${i(p.extra[a.key])}</div>`:""}</td>
        <td>${i(p.phone||"")}<div class="sub">${i(p.email||"")}</div></td>
        <td class="num">${k(v.billed)}</td>
        <td class="num ${v.outstanding>.5?"due":""}">${k(v.outstanding)}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">${$("users",40)}<p>No ${i(t.toLowerCase())}s yet.</p><a class="btn primary" href="#/client/new">${$("plus")} Add ${i(t.toLowerCase())}</a></div>`}`;let u;f("#q",e).addEventListener("input",p=>{clearTimeout(u),u=setTimeout(()=>{A(`#/clients${p.target.value?`?q=${encodeURIComponent(p.target.value)}`:""}`,{replace:!0});const v=f("#q");v.focus(),v.setSelectionRange(v.value.length,v.value.length)},250)}),M("tr.link",e).forEach(p=>p.addEventListener("click",()=>A(`#/client/${p.dataset.id}`)))}function ze(e,s){const l=W(),t=s.id==="new",c=t?{}:X("clients",s.id);if(!c){e.innerHTML='<div class="empty"><p>Not found.</p></div>',H("Not found");return}if(t){H(`New ${l.toLowerCase()}`,""),e.innerHTML=`<form class="card narrow" id="cform">${Le(c)}
      <div class="row-gap end"><a class="btn" href="#/clients">Cancel</a><button class="btn primary">${$("check")} Save</button></div></form>`,f("#cform",e).addEventListener("input",()=>O(!0)),f("#cform",e).addEventListener("submit",u=>{u.preventDefault();const p=z("clients",Se(new FormData(u.target),{}));N(),O(!1),S(`${l} saved`),A(`#/client/${p.id}`)});return}const a=Je(c.id),b=te(u=>u.clientId===c.id);H(c.name,`
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
        ${b.length?`<div class="table-wrap"><table class="table">
          <thead><tr><th>Number</th><th>Date</th><th class="num">Amount</th><th class="num">Balance</th><th>Status</th></tr></thead>
          <tbody>${b.map(({d:u,t:p,status:v})=>`<tr class="link" data-doc="${u.id}"><td><b>${i(u.number)}</b><div class="sub">${i(F[u.type].name)}</div></td>
            <td>${Q(u.date)}</td><td class="num">${k(p.payable)}</td><td class="num">${u.type==="invoice"?k(Math.max(p.balance,0)):"–"}</td><td>${de(v)}</td></tr>`).join("")}</tbody></table></div>`:'<p class="muted">No documents yet.</p>'}
      </section>
      <form class="card" id="cform"><h3>Details</h3>${Le(c)}
        <div class="row-gap end"><button type="button" class="btn danger-text" id="delC">${$("trash")} Delete</button><button class="btn primary">${$("check")} Save changes</button></div>
      </form>
    </div>`,M("tr[data-doc]",e).forEach(u=>u.addEventListener("click",()=>A(`#/doc/${u.dataset.doc}`))),f("#cform",e).addEventListener("input",()=>O(!0)),f("#cform",e).addEventListener("submit",u=>{u.preventDefault(),z("clients",Se(new FormData(u.target),c)),N(),O(!1),S("Saved"),ze(e,s)}),f("#delC",e).addEventListener("click",async()=>{await J(`Delete ${c.name}?`,`Their documents stay (with the ${l.toLowerCase()} details copied on them).`)&&(De("clients",c.id),N(),O(!1),A("#/clients"))}),f("#printStmt",e).addEventListener("click",()=>{const u=b.filter(p=>["sent","partial","overdue"].includes(p.status)).map(p=>p.d);if(!u.length)return S("Nothing unpaid","err");re(u,j())}),f("#portalBtn").addEventListener("click",()=>Nt(c))}async function Nt(e){const s=U("docs").filter(u=>u.clientId===e.id&&u.status!=="draft"),l=j(),t=se({title:`Client portal · ${e.name}`,submit:"",cancel:"Close",wide:!0,body:`<p class="muted">One private link with every issued document for ${i(e.name)} (${s.length}): statement, outstanding balance, view & download each bill, pay by UPI, and confirm payment or accept quotes by WhatsApp. The data travels in the link; send a fresh link after you add new bills.</p>
      <div class="share-link"><input id="pUrl" readonly value="Preparing link…"><button type="button" class="btn" id="pCopy">${$("copy")} Copy</button></div>
      <div class="share-btns"><a class="btn whatsapp" id="pWa" target="_blank" rel="noopener">${$("whatsapp")} WhatsApp</a>
      <a class="btn" id="pMail">${$("mail")} Email</a><a class="btn" id="pOpen" target="_blank" rel="noopener">${$("globe")} Open portal</a></div>`});if(!s.length){f("#pUrl",t.el).value="Issue a document first (drafts are not shared).";return}const c=await Ke(e,s),a=`Hello ${e.name},

Your account with ${l.business.name}: view all your bills, balance and pay online here:
${c}

Thank you.`,b=String(e.phone||"").replace(/\D/g,"");f("#pUrl",t.el).value=c,f("#pWa",t.el).href=`https://wa.me/${b.length===10?`91${b}`:b}?text=${encodeURIComponent(a)}`,f("#pMail",t.el).href=`mailto:${encodeURIComponent(e.email||"")}?subject=${encodeURIComponent(`Your account - ${l.business.name}`)}&body=${encodeURIComponent(a)}`,f("#pOpen",t.el).href=c,f("#pCopy",t.el).addEventListener("click",async()=>{await Pe(c)&&S("Link copied")})}const jt=["all","draft","sent","partial","overdue","paid","awaiting","accepted","cancelled"];function At(e,s,l){const t=s.type||"all",c=l.get("status")||"all",a=(l.get("q")||"").toLowerCase();H(t==="all"?"All documents":F[t].plural,`
    <a class="btn primary" href="#/new/${t==="all"?"invoice":t}">${$("plus")} New ${t==="all"?"invoice":F[t].name.toLowerCase()}</a>`);const b=te(r=>t==="all"||r.type===t).filter(r=>c==="all"||r.status===c||c==="sent"&&r.status==="sent").filter(r=>!a||[r.d.number,r.d.client&&r.d.client.name,r.d.client&&r.d.client.company,r.d.reference].some(w=>String(w||"").toLowerCase().includes(a))),u=b.reduce((r,w)=>w.status==="cancelled"?r:{total:r.total+w.t.payable,due:r.due+(w.d.type==="invoice"?Math.max(w.t.balance,0):0)},{total:0,due:0}),p=[["all","All"],...Object.entries(F).map(([r,w])=>[r,w.plural])];e.innerHTML=`
    <div class="tabs" role="tablist">${p.map(([r,w])=>`<a role="tab" class="tab${r===t?" on":""}" href="#/docs/${r}">${i(w)}</a>`).join("")}</div>
    <div class="toolbar">
      <div class="search">${$("search",16)}<input id="q" type="search" placeholder="Search number, ${i(W().toLowerCase())}, reference" value="${i(a)}"></div>
      <div class="chips">${jt.map(r=>`<button class="chip${r===c?" on":""}" data-status="${r}">${r==="all"?"All":qe[r]}</button>`).join("")}</div>
    </div>
    <div class="sumline">${b.length} document${b.length===1?"":"s"} · Total <b>${k(u.total)}</b> · Outstanding <b>${k(u.due)}</b></div>
    ${b.length?`<div class="table-wrap"><table class="table">
      <thead><tr><th>Number</th><th>${i(W())}</th><th>Date</th><th>Due</th><th class="num">Amount</th><th class="num">Balance</th><th>Status</th></tr></thead>
      <tbody>${b.map(({d:r,t:w,status:L})=>`
        <tr class="link" data-id="${r.id}">
          <td><b>${i(r.number)}</b><div class="sub">${i(F[r.type].name)}</div></td>
          <td>${i(r.client&&r.client.name||"—")}${r.client&&r.client.company&&r.client.company!==r.client.name?`<div class="sub">${i(r.client.company)}</div>`:""}</td>
          <td>${Q(r.date)}</td><td>${Q(r.dueDate)}</td>
          <td class="num">${k(w.payable)}</td>
          <td class="num">${r.type==="invoice"?k(Math.max(w.balance,0)):"–"}</td>
          <td>${de(L)}</td>
        </tr>`).join("")}</tbody></table></div>`:`<div class="empty">${$("file",40)}<p>No documents here yet.</p><a class="btn primary" href="#/new/${t==="all"?"invoice":t}">${$("plus")} Create one</a></div>`}`;const v=r=>{const w=new URLSearchParams(l);Object.entries(r).forEach(([T,C])=>C&&C!=="all"?w.set(T,C):w.delete(T));const L=w.toString();A(`#/docs/${t}${L?`?${L}`:""}`,{replace:!0})};M(".chip",e).forEach(r=>r.addEventListener("click",()=>v({status:r.dataset.status})));let n;f("#q",e).addEventListener("input",r=>{clearTimeout(n),n=setTimeout(()=>{v({q:r.target.value.trim()});const w=f("#q");w&&(w.focus(),w.setSelectionRange(w.value.length,w.value.length))},250)}),M("tr.link",e).forEach(r=>r.addEventListener("click",()=>A(`#/doc/${r.dataset.id}`)))}let le=null;function ke(e){le=e,A(`#/new/${e.type}?draft=1`)}const Bt=(e,s,l)=>{const t=s.split(".");let c=e;t.slice(0,-1).forEach(a=>{c[a]=c[a]||{},c=c[a]}),c[t.at(-1)]=l};function Be(e){return e==="quote"||e==="proforma"?["draft","sent","accepted","declined","cancelled"]:e==="receipt"||e==="credit"?["draft","issued","cancelled"]:["draft","sent","cancelled"]}const Mt={...qe,sent:"Sent / issued"};function Ie(e,s,l){const t=j(),c=ce(t);let a;if(s.id){const o=X("docs",s.id);if(!o){e.innerHTML='<div class="empty"><p>Document not found.</p></div>';return}a=JSON.parse(JSON.stringify(o))}else l.get("draft")&&le?(a=le,le=null):a=xe(s.type||"invoice",l.get("client")||"");const b=!a.id,u=F[a.type].name;H(`${b?"New":"Edit"} ${u.toLowerCase()}`,`
    <button class="btn" id="cancelBtn">Cancel</button>
    <button class="btn" id="printBtn" title="Print or save as PDF">${$("print")}<span class="hide-sm"> Print</span></button>
    <button class="btn primary" id="saveBtn">${$("check")} Save</button>`);const p=o=>c.clientFields[0]&&o.extra?o.extra[c.clientFields[0].key]:"",v=U("items"),n=[...new Set(v.map(o=>o.category).filter(Boolean))],r=t.design.groupByCategory||c.itemCols.some(o=>o.key==="category"),w=c.itemCols.filter(o=>o.key!=="category"),L=t.taxMode!=="none";e.innerHTML=`
  <div class="editor">
    <form class="editor-form" id="docForm" autocomplete="off">
      <section class="card">
        <div class="grid g4">
          ${y("Document",`<select data-f="type">${I(Object.entries(F).map(([o,h])=>[o,h.name]),a.type)}</select>`)}
          ${y("Title on document",`<input data-f="title" value="${i(a.title)}">`)}
          ${y("Number",`<input data-f="number" value="${i(a.number)}" required>`)}
          ${y("Status",`<select data-f="status">${I(Be(a.type).map(o=>[o,Mt[o]]),a.status)}</select>`)}
          ${y("Date",`<input type="date" data-f="date" value="${i(a.date)}">`)}
          ${y(a.type==="quote"?"Valid till":"Due date",`<input type="date" data-f="dueDate" value="${i(a.dueDate)}">`)}
          ${t.taxMode==="gst"?y("Place of supply",`<select data-f="placeOfSupply">${I(ye.map(([o,h])=>[o,`${o} - ${h}`]),a.placeOfSupply)}</select>`):""}
          ${y("Reference / PO",`<input data-f="reference" value="${i(a.reference||"")}">`)}
        </div>
      </section>

      <section class="card">
        <h3>${i(W())}</h3>
        <div class="row-gap">
          <select id="clientSel" class="grow">
            <option value="">— Select ${i(W().toLowerCase())} —</option>
            ${I(U("clients").slice().sort((o,h)=>o.name.localeCompare(h.name)).map(o=>[o.id,`${o.name}${o.company&&o.company!==o.name?` · ${o.company}`:""}${p(o)?` · ${p(o)}`:""}`]),a.clientId)}
          </select>
          <button type="button" class="btn" id="newClientBtn">${$("plus")} New</button>
        </div>
        <div id="clientCard" class="client-card"></div>
      </section>

      ${c.fields.length?`<section class="card"><h3>Bill details</h3><div class="grid g3">
        ${c.fields.map(o=>y(o.label,`<input ${o.type==="date"?'type="date"':""} data-ff="${o.key}" value="${i((a.fields||{})[o.key]||"")}">`)).join("")}
      </div></section>`:""}

      <section class="card">
        <h3>Items</h3>
        <div id="lines"></div>
        <div class="row-gap">
          <button type="button" class="btn" id="addLine">${$("plus")} Add line</button>
          <button type="button" class="btn ghost" id="pickItems">${$("box")} From catalogue</button>
        </div>
        <datalist id="catalog">${v.map(o=>`<option value="${i(o.name)}">${i(o.category||"")} ${k(o.rate)}</option>`).join("")}</datalist>
        <datalist id="cats">${n.map(o=>`<option value="${i(o)}">`).join("")}</datalist>
      </section>

      <section class="card">
        <h3>Charges, discount & payments</h3>
        <div class="grid g4">
          ${y("Discount",`<div class="join"><input type="number" step="any" min="0" data-f="discount.value" data-num value="${i(a.discount.value)}"><select data-f="discount.type">${I([["%","%"],["flat","Flat"]],a.discount.type)}</select></div>`)}
          ${y("Shipping / other charges",`<input type="number" step="any" data-f="shipping" data-num value="${i(a.shipping)}">`)}
          ${y("Adjustment (+/−)",`<input type="number" step="any" data-f="adjustment" data-num value="${i(a.adjustment)}">`)}
          ${y("Advance received",`<input type="number" step="any" min="0" data-f="advance" data-num value="${i(a.advance)}">`)}
          ${c.insurance||a.insurance?y(`${t.design.labels.insurance||"Insurance / third-party share"}`,`<input type="number" step="any" min="0" data-f="insurance" data-num value="${i(a.insurance)}">`):""}
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
          ${y("Notes",`<textarea rows="3" data-f="notes">${i(a.notes)}</textarea>`)}
          ${y("Terms & conditions",`<textarea rows="3" data-f="terms">${i(a.terms)}</textarea>`)}
        </div>
      </section>

      <section class="card">
        <h3>Design for this document</h3>
        <div class="grid g3">
          ${y("Template",`<select data-f="template"><option value="">Default (${i((be.find(o=>o.id===t.design.template)||be[0]).name)})</option>${I(be.map(o=>[o.id,o.name]),a.template)}</select>`)}
          ${y("Accent colour",`<div class="join"><input type="color" data-f="accent" value="${i(a.accent||t.design.accent)}"><button type="button" class="btn ghost" id="resetAccent">Default</button></div>`)}
          <div class="fld"><span>&nbsp;</span><a class="btn ghost" href="#/design">${$("palette")} Full design studio</a></div>
        </div>
      </section>
    </form>
    <aside class="editor-preview">
      <div class="preview-bar"><span>Live preview</span><span id="pvTotal"></span></div>
      <div id="preview"></div>
    </aside>
  </div>`;const T=f("#docForm",e),C=f("#preview",e);let R;const V=o=>{clearTimeout(R);const h=()=>{$e(C,a,t),ae()};o?h():R=setTimeout(h,120)},B=()=>{O(!0),V()};function P(){const o=a.client,h=f("#clientCard",e);if(!o||!o.name){h.innerHTML=`<p class="muted">Pick a saved ${i(W().toLowerCase())} or add a new one.</p>`;return}const d=c.clientFields.filter(m=>o.extra&&o.extra[m.key]).map(m=>`${i(m.label)}: ${i(o.extra[m.key])}`);h.innerHTML=`<b>${i(o.name)}</b>${o.company&&o.company!==o.name?` · ${i(o.company)}`:""}
      <div class="muted">${[o.phone,o.email,o.gstin&&`GSTIN ${o.gstin}`,...d].filter(Boolean).map(i).join(" · ")}</div>`}function ee(o,h){const d=Ne(o).net;return`<div class="li" data-i="${h}">
      <div class="li-main">
        <input class="li-name" data-k="name" list="catalog" placeholder="Item or service name" value="${i(o.name)}">
        <textarea data-k="description" rows="1" placeholder="Description (optional)">${i(o.description||"")}</textarea>
        ${r||w.length?`<div class="li-extra">
          ${r?`<label><span>Category</span><input data-k="category" list="cats" value="${i(o.category||"")}"></label>`:""}
          ${w.map(m=>`<label><span>${i(m.label)}</span><input data-k="${m.key}" value="${i(o[m.key]||"")}"></label>`).join("")}
        </div>`:""}
      </div>
      <div class="li-nums">
        ${t.design.show.hsn?`<label><span>HSN/SAC</span><input data-k="hsn" value="${i(o.hsn||"")}"></label>`:""}
        <label><span>Qty</span><input type="number" step="any" data-k="qty" data-num value="${i(o.qty)}"></label>
        <label><span>Unit</span><input data-k="unit" value="${i(o.unit||"")}" placeholder="pcs"></label>
        <label><span>Rate</span><input type="number" step="any" data-k="rate" data-num value="${i(o.rate)}"></label>
        <label><span>Disc %</span><input type="number" step="any" min="0" max="100" data-k="discount" data-num value="${i(o.discount||0)}"></label>
        ${L?`<label><span>Tax %</span><input type="number" step="any" min="0" data-k="tax" data-num value="${i(o.tax||0)}" list="taxrates"></label>`:""}
        <div class="li-amt"><span>Amount</span><b>${k(d)}</b></div>
      </div>
      <div class="li-act">
        <button type="button" class="icon-btn" data-act="up" title="Move up" aria-label="Move up">${$("up",16)}</button>
        <button type="button" class="icon-btn" data-act="down" title="Move down" aria-label="Move down">${$("down",16)}</button>
        <button type="button" class="icon-btn" data-act="save" title="Save to catalogue" aria-label="Save to catalogue">${$("star",16)}</button>
        <button type="button" class="icon-btn danger" data-act="del" title="Remove line" aria-label="Remove line">${$("trash",16)}</button>
      </div>
    </div>`}function G(){f("#lines",e).innerHTML=`${a.items.map(ee).join("")}
      <datalist id="taxrates">${[0,5,12,18,28].map(o=>`<option value="${o}">`).join("")}</datalist>`}function _(){f("#customFields",e).innerHTML=(a.customFields||[]).map((o,h)=>`
      <div class="cf" data-j="${h}">
        <input data-cf="label" placeholder="Label (e.g. Vehicle No.)" value="${i(o.label)}">
        <input data-cf="value" placeholder="Value" value="${i(o.value)}">
        <button type="button" class="icon-btn danger" data-cfdel aria-label="Remove">${$("trash",16)}</button>
      </div>`).join("")||'<p class="muted">Add any field you need: vehicle number, PO date, e-way bill, room number…</p>'}function ae(){const o=ue(a,t),h=[["Sub total",o.gross],o.discountTotal&&["Discount",-o.discountTotal],["Tax",o.totalTax],o.shipping&&["Charges",o.shipping],o.adjustment&&["Adjustment",o.adjustment],o.roundOff&&["Round off",o.roundOff]].filter(Boolean);f("#sumBox",e).innerHTML=`${h.map(([d,m])=>`<div><span>${d}</span><span>${k(m)}</span></div>`).join("")}
      <div class="big"><span>Total</span><span>${k(o.total)}</span></div>
      ${o.insurance?`<div><span>Insurance</span><span>−${k(o.insurance)}</span></div><div class="big"><span>Payable</span><span>${k(o.payable)}</span></div>`:""}
      ${o.paid?`<div><span>Paid</span><span>−${k(o.paid)}</span></div><div class="big"><span>Balance</span><span>${k(o.balance)}</span></div>`:""}`,f("#pvTotal",e).textContent=k(o.insurance?o.payable:o.total),M(".li",e).forEach(d=>{const m=a.items[+d.dataset.i];m&&(d.querySelector(".li-amt b").textContent=k(Ne(m).net))})}P(),G(),_(),V(!0),O(!1),T.addEventListener("input",o=>{const h=o.target,d=h.dataset.num!==void 0?h.value===""?0:parseFloat(h.value):h.value;if(h.dataset.f){if(h.dataset.f==="type")return;Bt(a,h.dataset.f,d)}else if(h.dataset.ff)a.fields=a.fields||{},a.fields[h.dataset.ff]=d;else if(h.dataset.k){const m=+h.closest(".li").dataset.i;a.items[m][h.dataset.k]=d}else if(h.dataset.cf){const m=+h.closest(".cf").dataset.j;a.customFields[m][h.dataset.cf]=d}else return;B()}),T.addEventListener("change",o=>{const h=o.target;if(h.dataset.f==="type"){const d=h.value,m=!b;a.type=d,a.title=t.docTitles[d]||F[d].title,m||(a.number=xe(d).number),Be(d).includes(a.status)||(a.status="draft"),O(!0),le=a,Ie(e,{...s,type:d},new URLSearchParams("draft=1")),O(!0);return}if(h.dataset.k==="name"){const d=+h.closest(".li").dataset.i,m=v.find(x=>x.name.toLowerCase()===h.value.trim().toLowerCase());if(m){const x=a.items[d];Object.assign(x,{name:m.name,rate:m.rate,tax:L?m.tax:0,hsn:m.hsn||"",unit:m.unit||"",category:m.category||"",description:x.description||m.description||""}),G(),B();const D=f(`.li[data-i="${d}"] [data-k="qty"]`,e);D&&D.focus()}}}),f("#clientSel",e).addEventListener("change",o=>{const h=X("clients",o.target.value);if(a.clientId=h?h.id:"",a.client=nt(h),h&&h.state){a.placeOfSupply=h.state;const d=f('[data-f="placeOfSupply"]',e);d&&(d.value=h.state)}P(),B()}),f("#newClientBtn",e).addEventListener("click",()=>{se({title:`New ${W().toLowerCase()}`,body:Le({}),wide:!0,onSubmit:o=>{const h=Se(o,{});if(!h.name)return S("Name is required","err"),!1;z("clients",h);const d=f("#clientSel",e);return d.insertAdjacentHTML("beforeend",`<option value="${h.id}">${i(h.name)}</option>`),d.value=h.id,d.dispatchEvent(new Event("change")),S(`${W()} saved`),!0}})}),f("#lines",e).addEventListener("click",o=>{const h=o.target.closest("[data-act]");if(!h)return;const d=+h.closest(".li").dataset.i,m=a.items;if(h.dataset.act==="del")m.splice(d,1),m.length||m.push(g());else if(h.dataset.act==="up"&&d>0)[m[d-1],m[d]]=[m[d],m[d-1]];else if(h.dataset.act==="down"&&d<m.length-1)[m[d+1],m[d]]=[m[d],m[d+1]];else if(h.dataset.act==="save"){const x=m[d];if(!x.name)return S("Give the line a name first","err");const D=U("items").find(q=>q.name.toLowerCase()===x.name.toLowerCase());return z("items",{...D||{},name:x.name,description:x.description||"",rate:+x.rate||0,tax:+x.tax||0,hsn:x.hsn||"",unit:x.unit||"",category:x.category||""}),S(D?"Catalogue item updated":"Saved to catalogue")}G(),B()});const g=()=>({name:"",description:"",hsn:"",qty:1,unit:"",rate:0,discount:0,tax:L?t.defaultTax:0,category:""});f("#addLine",e).addEventListener("click",()=>{a.items.push(g()),G(),B(),f(`.li[data-i="${a.items.length-1}"] .li-name`,e).focus()}),f("#pickItems",e).addEventListener("click",()=>{const o=U("items");if(!o.length)return S("Your catalogue is empty. Add items in Items.","err");se({title:"Add from catalogue",wide:!0,submit:"Add selected",body:`<div class="search">${$("search",16)}<input id="pickQ" type="search" placeholder="Filter"></div>
        <div class="pick-list">${o.map(h=>`<label class="pick" data-name="${i(`${h.name} ${h.category}`.toLowerCase())}"><input type="checkbox" name="pick" value="${h.id}"><span>${i(h.name)}<small>${i(h.category||"")}</small></span><b>${k(h.rate)}</b></label>`).join("")}</div>`,onSubmit:h=>{const d=h.getAll("pick");a.items.length===1&&!a.items[0].name&&!Number(a.items[0].rate)&&(a.items=[]);for(const m of d){const x=X("items",m);a.items.push({...g(),name:x.name,description:x.description||"",rate:x.rate,tax:L?x.tax:0,hsn:x.hsn||"",unit:x.unit||"",category:x.category||""})}a.items.length||a.items.push(g()),G(),B()}}),f("#pickQ").addEventListener("input",h=>{const d=h.target.value.toLowerCase();M(".pick").forEach(m=>{m.hidden=!m.dataset.name.includes(d)})})}),f("#addCf",e).addEventListener("click",()=>{a.customFields=a.customFields||[],a.customFields.push({label:"",value:""}),_(),f(`.cf[data-j="${a.customFields.length-1}"] input`,e).focus()}),f("#customFields",e).addEventListener("click",o=>{o.target.closest("[data-cfdel]")&&(a.customFields.splice(+o.target.closest(".cf").dataset.j,1),_(),B())}),f("#resetAccent",e).addEventListener("click",()=>{a.accent="",f('[data-f="accent"]',e).value=t.design.accent,B()});const E=()=>{if(!a.number.trim())return S("Number is required","err"),null;if(U("docs").find(d=>d.id!==a.id&&d.type===a.type&&d.number===a.number.trim()))return S(`${a.number} already exists. Change the number.`,"err"),null;if(a.number=a.number.trim(),a.items=a.items.filter(d=>d.name||Number(d.rate)),!a.items.length)return S("Add at least one item","err"),a.items.push(g()),G(),null;const h=Ue(a);return N(),O(!1),h};f("#saveBtn").addEventListener("click",()=>{const o=E();o&&(S(`${u} ${o.number} saved`),A(`#/doc/${o.id}`))}),f("#cancelBtn").addEventListener("click",()=>history.length>1?history.back():A("#/docs/all")),f("#printBtn").addEventListener("click",()=>re([a],t)),T.addEventListener("keydown",o=>{(o.ctrlKey||o.metaKey)&&o.key==="s"&&(o.preventDefault(),f("#saveBtn").click())})}const Ft=["Cash","UPI","Bank transfer","Card","Cheque","Insurance / TPA","Wallet","Other"];function Ce(e,s){const l=j(),t=X("docs",s.id);if(!t){e.innerHTML='<div class="empty"><p>Document not found.</p><a class="btn" href="#/docs/all">Back to documents</a></div>',H("Not found");return}const c=ue(t),a=Xe(t,c),b=t.type==="invoice"||t.type==="proforma";H(`${F[t.type].name} ${t.number}`,`
    <a class="btn" href="#/edit/${t.id}">${$("edit")}<span class="hide-sm"> Edit</span></a>
    <button class="btn" data-a="print">${$("print")}<span class="hide-sm"> Print / PDF</span></button>
    <button class="btn primary" data-a="share">${$("share")}<span class="hide-sm"> Share</span></button>`);const u=t.client||{};e.innerHTML=`
  <div class="docpage">
    <div class="docpage-preview"><div id="preview"></div></div>
    <aside class="docpage-side">
      <section class="card">
        <div class="row-between">${de(a)}<span class="muted">${i(F[t.type].name)}</span></div>
        <div class="bigmoney">${k(c.payable)}</div>
        ${b?`<div class="muted">Paid ${k(c.paid)} · Balance <b>${k(Math.max(c.balance,0))}</b></div>`:""}
        <div class="muted">${i(u.name||"—")}${u.phone?` · ${i(u.phone)}`:""}</div>
        <div class="muted">Dated ${Q(t.date)}${t.dueDate?` · ${t.type==="quote"?"valid till":"due"} ${Q(t.dueDate)}`:""}</div>
      </section>
      <section class="card actions">
        ${b&&a!=="paid"&&a!=="cancelled"?`<button class="btn primary block" data-a="pay">${$("cash")} Record payment</button>`:""}
        ${t.status==="draft"?`<button class="btn block" data-a="sent">${$("send")} Mark as sent</button>`:""}
        ${t.type==="quote"||t.type==="proforma"?`<button class="btn block" data-a="convert">${$("refresh")} Convert to invoice</button>`:""}
        ${t.type==="quote"&&!["accepted","converted"].includes(a)?`<button class="btn block" data-a="accept">${$("check")} Mark accepted</button>`:""}
        ${t.type==="invoice"?`<button class="btn block" data-a="credit">${$("file")} Create credit note</button>`:""}
        ${t.type==="invoice"&&c.paid?`<button class="btn block" data-a="receipt">${$("file")} Payment receipt</button>`:""}
        <button class="btn block" data-a="dup">${$("copy")} Duplicate</button>
        ${t.status!=="cancelled"?`<button class="btn block" data-a="cancel">${$("x")} Cancel document</button>`:`<button class="btn block" data-a="restore">${$("refresh")} Restore</button>`}
        <button class="btn block danger-text" data-a="delete">${$("trash")} Delete</button>
      </section>
      ${b?`<section class="card">
        <h3>Payments</h3>
        ${t.advance?`<div class="pay-row"><span>Advance</span><b>${k(t.advance)}</b></div>`:""}
        ${(t.payments||[]).map(n=>`<div class="pay-row"><span>${Q(n.date)} · ${i(n.method)}${n.ref?` · ${i(n.ref)}`:""}</span><b>${k(n.amount)}</b>
          <button class="icon-btn danger" data-delpay="${n.id}" aria-label="Remove payment">${$("trash",14)}</button></div>`).join("")||(t.advance?"":'<p class="muted">No payments yet.</p>')}
      </section>`:""}
      ${t.convertedFrom||t.convertedTo?`<section class="card muted">
        ${t.convertedFrom&&X("docs",t.convertedFrom)?`From <a href="#/doc/${t.convertedFrom}">${i(X("docs",t.convertedFrom).number)}</a>`:""}
        ${t.convertedTo&&X("docs",t.convertedTo)?`Converted to <a href="#/doc/${t.convertedTo}">${i(X("docs",t.convertedTo).number)}</a>`:""}
      </section>`:""}
    </aside>
  </div>`,$e(f("#preview",e),t,l);const p=n=>{z("docs",t),N(),n&&S(n),Ce(e,s)},v={print:()=>re([t],l),share:()=>Ot(t,()=>Ce(e,s)),pay:()=>Rt(t,c,()=>p("Payment recorded")),sent:()=>{t.status="sent",t.sentAt=new Date().toISOString(),p("Marked as sent")},accept:()=>{t.status="accepted",p("Marked accepted")},convert:()=>{const n=me(t,"invoice");n.status="draft",n.reference=n.reference||t.number;const r=Ue(n);t.convertedTo=r.id,t.type==="quote"&&(t.status="accepted"),z("docs",t),N(),S(`Invoice ${r.number} created`),A(`#/edit/${r.id}`)},credit:()=>{const n=me(t,"credit");n.status="issued",n.reference=t.number,n.dueDate="",n.notes=`Against invoice ${t.number} dated ${Q(t.date)}`,ke(n)},receipt:()=>{const n=me(t,"receipt");n.items=[{name:`Payment against ${t.number}`,description:(t.payments||[]).map(r=>`${Q(r.date)} ${r.method} ${r.ref||""}`).join(`
`),hsn:"",qty:1,unit:"",rate:c.paid,discount:0,tax:0,category:""}],Object.assign(n,{status:"issued",reference:t.number,dueDate:"",discount:{type:"%",value:0},shipping:0,adjustment:0,insurance:0,terms:""}),ke(n)},dup:()=>ke(me(t)),cancel:async()=>{await J("Cancel document?",`${t.number} stays in your records marked as cancelled.`,"Cancel document")&&(t.status="cancelled",p("Cancelled"))},restore:()=>{t.status="sent",p("Restored")},delete:async()=>{await J("Delete permanently?",`${t.number} will be removed. This cannot be undone.`)&&(De("docs",t.id),N(),S("Deleted"),A("#/docs/all"))}};document.querySelectorAll("[data-a]").forEach(n=>n.addEventListener("click",()=>v[n.dataset.a]&&v[n.dataset.a]())),M("[data-delpay]",e).forEach(n=>n.addEventListener("click",async()=>{await J("Remove payment?","This payment will be removed from the document.","Remove")&&(t.payments=t.payments.filter(r=>r.id!==n.dataset.delpay),p("Payment removed"))}))}function Rt(e,s,l){const t=Math.max(s.balance,0);se({title:`Record payment · ${e.number}`,body:`<div class="grid g2">
      ${y("Amount",`<input type="number" step="any" min="0" name="amount" value="${t.toFixed(2)}" required>`)}
      ${y("Date",`<input type="date" name="date" value="${K()}">`)}
      ${y("Method",`<select name="method">${I(Ft.map(c=>[c,c]),"UPI")}</select>`)}
      ${y("Reference / UTR / cheque no.",'<input name="ref">')}
    </div><p class="muted">Balance due: ${k(t)}</p>`,onSubmit:c=>{const a=parseFloat(c.get("amount"));if(!(a>0))return S("Enter an amount","err"),!1;e.payments=e.payments||[],e.payments.push({id:Date.now().toString(36),date:c.get("date")||K(),amount:a,method:c.get("method"),ref:c.get("ref")}),e.status==="draft"&&(e.status="sent"),l()}})}async function Ke(e,s){const l=await it(lt(j(),e,s));return`${new URL("portal.html",location.href.split("#")[0]).href}#${l}`}function Ot(e,s){const l=j(),t=e.client||{},c=ue(e),b=se({title:`Share ${e.number}`,submit:"",cancel:"Close",wide:!0,body:`<p class="muted">Your ${i(W().toLowerCase())} opens a private page where they can view, download and pay. The document travels inside the link itself; nothing is uploaded.</p>
      <div class="share-link"><input id="shareUrl" readonly value="Preparing link…"><button class="btn" id="copyLink" type="button">${$("copy")} Copy</button></div>
      <div class="share-btns">
        <a class="btn whatsapp" id="waBtn" target="_blank" rel="noopener">${$("whatsapp")} WhatsApp</a>
        <a class="btn" id="mailBtn">${$("mail")} Email</a>
        <a class="btn" id="openBtn" target="_blank" rel="noopener">${$("globe")} Open portal</a>
        <button class="btn" id="printShare" type="button">${$("download")} Save PDF</button>
      </div>
      ${e.status==="draft"?'<label class="check"><input type="checkbox" id="markSent" checked> Mark as sent when I share</label>':""}`}).el;Ke(t.id&&X("clients",t.id)||t,[{...e,status:e.status==="draft"?"sent":e.status}]).then(p=>{const v=k(c.insurance?c.payable:c.total),n=`Hello ${t.name||""},

Your ${e.title||F[e.type].title} ${e.number} for ${v} from ${l.business.name} is ready.
View, download & pay: ${p}

Thank you.`,r=String(t.phone||"").replace(/\D/g,""),w=`https://wa.me/${r.length===10?`91${r}`:r}?text=${encodeURIComponent(n)}`;f("#shareUrl",b).value=p,f("#waBtn",b).href=w,f("#mailBtn",b).href=`mailto:${encodeURIComponent(t.email||"")}?subject=${encodeURIComponent(`${e.title||F[e.type].title} ${e.number} - ${l.business.name}`)}&body=${encodeURIComponent(n)}`,f("#openBtn",b).href=p,p.length>7e3&&f("#shareUrl",b).insertAdjacentHTML("afterend",'<p class="muted small">This link is long (a big logo or many lines). It still works when copied; some apps may shorten the preview.</p>')});const u=()=>{const p=f("#markSent",b);p&&p.checked&&e.status==="draft"&&(e.status="sent",e.sentAt=new Date().toISOString(),z("docs",e),N(),s&&s())};f("#copyLink",b).addEventListener("click",async()=>{await Pe(f("#shareUrl",b).value)&&S("Link copied"),u()}),["#waBtn","#mailBtn","#openBtn"].forEach(p=>f(p,b).addEventListener("click",u)),f("#printShare",b).addEventListener("click",()=>re([e],l))}function Pt(e){const s=j();H("Items & services",`
    <button class="btn" id="addStarter">${$("download")}<span class="hide-sm"> ${i(ot(s.industry).name)} starter list</span></button>
    <button class="btn primary" id="addItem">${$("plus")} New item</button>`);const l=()=>{const t=U("items"),c=[...new Set(t.map(u=>u.category).filter(Boolean))];e.innerHTML=`
      <div class="toolbar"><div class="search">${$("search",16)}<input id="q" type="search" placeholder="Filter items"></div>
      <span class="muted">${t.length} items · edit any cell, changes save automatically</span></div>
      ${t.length?`<div class="table-wrap"><table class="table edit-table" id="itemsTable">
        <thead><tr><th>Name</th><th>Description</th><th>Category</th><th>HSN/SAC</th><th>Unit</th><th class="num">Rate</th><th class="num">Tax %</th><th></th></tr></thead>
        <tbody>${t.map(u=>`<tr data-id="${u.id}" data-s="${i(`${u.name} ${u.category} ${u.hsn}`.toLowerCase())}">
          <td><input data-k="name" value="${i(u.name)}"></td>
          <td><input data-k="description" value="${i(u.description||"")}"></td>
          <td><input data-k="category" list="icats" value="${i(u.category||"")}"></td>
          <td><input data-k="hsn" value="${i(u.hsn||"")}" size="8"></td>
          <td><input data-k="unit" value="${i(u.unit||"")}" size="6"></td>
          <td class="num"><input data-k="rate" data-num type="number" step="any" value="${i(u.rate)}"></td>
          <td class="num"><input data-k="tax" data-num type="number" step="any" value="${i(u.tax)}" size="4"></td>
          <td><button class="icon-btn danger" data-del aria-label="Delete">${$("trash",16)}</button></td></tr>`).join("")}</tbody></table></div>
        <datalist id="icats">${c.map(u=>`<option value="${i(u)}">`).join("")}</datalist>`:`<div class="empty">${$("box",40)}<p>Save the products and services you bill often. Picking one on a bill fills rate, tax and HSN.</p></div>`}`;const a=f("#q",e);a.addEventListener("input",()=>M("#itemsTable tbody tr",e).forEach(u=>{u.hidden=!u.dataset.s.includes(a.value.toLowerCase())}));const b=f("#itemsTable",e);b&&(b.addEventListener("change",u=>{const p=u.target,v=p.closest("tr"),n=U("items").find(r=>r.id===v.dataset.id);!n||!p.dataset.k||(n[p.dataset.k]=p.dataset.num!==void 0?parseFloat(p.value)||0:p.value.trim(),z("items",n),N(),S(`Saved · ${n.name} ${k(n.rate)}`))}),b.addEventListener("click",async u=>{if(!u.target.closest("[data-del]"))return;const p=u.target.closest("tr");await J("Delete item?","It will be removed from the catalogue. Bills that used it are not changed.")&&(De("items",p.dataset.id),N(),l())}))};l(),f("#addItem").addEventListener("click",()=>{z("items",{name:"New item",description:"",category:"",hsn:"",unit:"pcs",rate:0,tax:s.taxMode==="none"?0:s.defaultTax}),N(),l();const t=f("#itemsTable tbody tr input",e);t&&(t.focus(),t.select())}),f("#addStarter").addEventListener("click",()=>{const t=new Set(U("items").map(a=>a.name.toLowerCase()));let c=0;for(const a of He(s.industry))t.has(a.name.toLowerCase())||(z("items",a),c++);N(),S(c?`Added ${c} items`:"Starter items are already in your list"),l()})}const qt=["#2563eb","#0f766e","#16a34a","#ea580c","#b91c1c","#db2777","#7c3aed","#0369a1","#334155","#111827","#a16207","#be123c"],Ut={logo:"Logo",business:"Business details",contact:"Phone / email / website",placeOfSupply:"Place of supply",dueDate:"Due date",hsn:"HSN/SAC column",unit:"Units with quantity",discountCol:"Discount column (when used)",taxCol:"Tax % column",shipTo:"Ship-to address",words:"Amount in words",taxSummary:"GST summary table",bank:"Bank details",qr:"UPI QR code",notes:"Notes",terms:"Terms",signature:"Signature block",footer:"Footer / thank-you line",stamp:"PAID / OVERDUE stamp"};function Ht(){const e=j(),s=U("docs").find(c=>c.type==="invoice")||U("docs")[0];if(s)return JSON.parse(JSON.stringify(s));const l=xe("invoice");l.number=l.number||"INV-0001";const t=ce(e);return l.client={name:`Sample ${e.clientLabel||"Customer"}`,company:"",phone:"+91 90000 00000",address:"MG Road",city:"Kochi",state:"32",pincode:"682001",extra:Object.fromEntries(t.clientFields.map(c=>[c.key,je(c)]))},l.fields=Object.fromEntries(t.fields.map(c=>[c.key,je(c,0,l.date)])),l.items=He(e.industry).slice(0,4).map((c,a)=>({...c,qty:a+1,rate:c.rate||400,discount:0})),l.status="sent",l}function Te(e){const s=j(),l=s.design;l.show={...dt,...l.show},l.labels=l.labels||{},l.customFields=l.customFields||[];const t=Ht();H("Invoice design studio",`<button class="btn" id="printSample">${$("print")}<span class="hide-sm"> Test print</span></button>`),e.innerHTML=`
  <div class="editor design">
    <div class="editor-form">
      <section class="card">
        <h3>Template</h3>
        <div class="tpl-grid">${be.map(v=>`<button type="button" class="tpl${v.id===l.template?" on":""}" data-tpl="${v.id}">
          <div class="tpl-thumb" data-thumb="${v.id}"></div><b>${i(v.name)}</b><small>${i(v.note)}</small></button>`).join("")}</div>
      </section>

      <section class="card">
        <h3>Brand & layout</h3>
        <div class="swatches">${qt.map(v=>`<button type="button" class="sw${v===l.accent?" on":""}" data-sw="${v}" style="background:${v}" aria-label="Colour ${v}"></button>`).join("")}
          <label class="sw-pick" title="Custom colour"><input type="color" id="accent" value="${i(l.accent)}"></label></div>
        <div class="grid g3">
          ${y("Font",`<select data-d="font">${I(Object.entries(ct).map(([v,n])=>[v,n.name]),l.font)}</select>`)}
          ${y("Paper",`<select data-d="paper">${I(Object.entries(rt).map(([v,n])=>[v,n.name]),l.paper)}</select>`)}
          ${y("Header alignment",`<select data-d="align">${I([["left","Left"],["center","Centre"],["right","Right"]],l.align)}</select>`)}
          ${y("Spacing",`<select data-d="density">${I([["compact","Compact"],["normal","Normal"],["roomy","Roomy"]],l.density)}</select>`)}
          <label class="check"><input type="checkbox" data-d="groupByCategory" ${l.groupByCategory?"checked":""}> Group lines by category with sub-totals</label>
        </div>
        <div class="grid g2">
          <div class="upload">
            <span>Logo</span>
            <div class="upload-box">${s.business.logo?`<img src="${i(s.business.logo)}" alt="Logo">`:'<span class="muted">No logo</span>'}</div>
            <div class="row-gap"><label class="btn">${$("upload")} Upload<input type="file" accept="image/*" data-img="logo" hidden></label>${s.business.logo?'<button type="button" class="btn ghost" data-clear="logo">Remove</button>':""}</div>
          </div>
          <div class="upload">
            <span>Signature / seal</span>
            <div class="upload-box">${s.business.signature?`<img src="${i(s.business.signature)}" alt="Signature">`:'<span class="muted">No signature</span>'}</div>
            <div class="row-gap"><label class="btn">${$("upload")} Upload<input type="file" accept="image/*" data-img="signature" hidden></label>${s.business.signature?'<button type="button" class="btn ghost" data-clear="signature">Remove</button>':""}</div>
          </div>
        </div>
      </section>

      <section class="card">
        <h3>Show on the document</h3>
        <div class="toggles">${Object.entries(Ut).map(([v,n])=>`<label class="check"><input type="checkbox" data-show="${v}" ${l.show[v]?"checked":""}> ${i(n)}</label>`).join("")}</div>
      </section>

      <section class="card">
        <h3>Document titles</h3>
        <div class="grid g3">${Object.entries(F).map(([v,n])=>y(n.name,`<input data-title="${v}" value="${i(s.docTitles[v]||n.title)}">`)).join("")}</div>
      </section>

      <section class="card">
        <h3>Rename any label <small>leave blank for the default</small></h3>
        <div class="grid g3">${Object.entries(ut).map(([v,n])=>y(n,`<input data-label="${v}" value="${i(l.labels[v]||"")}" placeholder="${i(n)}">`)).join("")}</div>
      </section>

      <section class="card">
        <h3>Default extra fields <small>added to every new document</small></h3>
        <div id="dcf"></div>
        <button type="button" class="btn ghost" id="addDcf">${$("plus")} Add field</button>
        ${y("Footer text",`<input id="footer" value="${i(s.footer||"")}" placeholder="e.g. This is a computer-generated invoice">`)}
      </section>
    </div>
    <aside class="editor-preview">
      <div class="preview-bar"><span>Preview</span><span class="muted">${U("docs").length?"your latest invoice":"sample data"}</span></div>
      <div id="preview"></div>
    </aside>
  </div>`;const c=e.firstElementChild,a=f("#preview",e),b=()=>M("[data-thumb]",e).forEach(v=>$e(v,{...t,template:v.dataset.thumb,accent:""},s,{maxScale:.3})),u=(v=!1)=>{oe(),$e(a,{...t,template:"",accent:""},s),v&&b()};u(!0);const p=()=>{f("#dcf",e).innerHTML=l.customFields.map((v,n)=>`<div class="cf" data-j="${n}">
      <input data-dcf="label" placeholder="Label" value="${i(v.label)}"><input data-dcf="value" placeholder="Default value" value="${i(v.value||"")}">
      <button type="button" class="icon-btn danger" data-dcfdel aria-label="Remove">${$("trash",16)}</button></div>`).join("")||'<p class="muted">e.g. "E-way bill No.", "Vehicle No.", "Delivery date".</p>'};p(),c.addEventListener("click",async v=>{const n=v.target.closest("[data-tpl]");if(n){l.template=n.dataset.tpl,l.template==="thermal"?l.paper="80mm":["80mm","58mm"].includes(l.paper)&&(l.paper="A4"),f('[data-d="paper"]',e).value=l.paper,M(".tpl",e).forEach(L=>L.classList.toggle("on",L===n)),u();return}const r=v.target.closest("[data-sw]");if(r){l.accent=r.dataset.sw,f("#accent",e).value=l.accent,M(".sw",e).forEach(L=>L.classList.toggle("on",L===r)),u(!0);return}const w=v.target.closest("[data-clear]");if(w){s.business[w.dataset.clear]="",N(),Te(e);return}if(v.target.closest("#addDcf")){l.customFields.push({label:"",value:""}),p();return}v.target.closest("[data-dcfdel]")&&(l.customFields.splice(+v.target.closest(".cf").dataset.j,1),p(),oe())}),c.addEventListener("input",v=>{const n=v.target;n.id==="accent"?(l.accent=n.value,M(".sw",e).forEach(r=>r.classList.remove("on")),u()):n.dataset.label?(n.value.trim()?l.labels[n.dataset.label]=n.value:delete l.labels[n.dataset.label],u()):n.dataset.title?(s.docTitles[n.dataset.title]=n.value,n.dataset.title===t.type&&(t.title=n.value),u()):n.dataset.dcf?(l.customFields[+n.closest(".cf").dataset.j][n.dataset.dcf]=n.value,oe()):n.id==="footer"&&(s.footer=n.value,u())}),c.addEventListener("change",async v=>{const n=v.target;if(n.dataset.d)l[n.dataset.d]=n.type==="checkbox"?n.checked:n.value,n.dataset.d==="paper"&&["80mm","58mm"].includes(n.value)&&(l.template="thermal"),n.dataset.d==="paper"&&!["80mm","58mm"].includes(n.value)&&l.template==="thermal"&&(l.template="modern"),M(".tpl",e).forEach(r=>r.classList.toggle("on",r.dataset.tpl===l.template)),u(n.dataset.d==="font");else if(n.dataset.show)l.show[n.dataset.show]=n.checked,u();else if(n.dataset.img)try{s.business[n.dataset.img]=await We(n.files[0],n.dataset.img==="logo"?480:360),N()||S("Image too large for browser storage","err"),Te(e)}catch(r){S(r.message,"err")}}),f("#printSample").addEventListener("click",()=>re([{...t,template:"",accent:""}],s))}function Wt(){const e=K(),[s,l]=e.split("-").map(Number),t=(u,p)=>`${u}-${String(p).padStart(2,"0")}`,c=(u,p)=>new Date(Date.UTC(u,p,0)).toISOString().slice(0,10),a=l===1?[s-1,12]:[s,l-1],b=l>=4?s:s-1;return{month:["This month",`${t(s,l)}-01`,c(s,l)],last:["Last month",`${t(...a)}-01`,c(...a)],q:["Last 90 days",mt(e,-89),e],fy:[`FY ${b}-${String(b+1).slice(2)}`,`${b}-04-01`,`${b+1}-03-31`],pfy:[`FY ${b-1}-${String(b).slice(2)}`,`${b-1}-04-01`,`${b}-03-31`],all:["All time","0000-01-01","9999-12-31"]}}function Gt(e,s,l){const t=Wt(),c=l.get("p")||"fy",[a,b,u]=c==="custom"?["Custom",l.get("from")||K(),l.get("to")||K()]:t[c]||t.fy;H("Reports",`<button class="btn" id="csv">${$("download")}<span class="hide-sm"> Export CSV</span></button>`);const p=d=>d.date>=b&&d.date<=u,v=te(d=>p(d)&&d.status!=="cancelled"&&d.status!=="draft"),n=v.filter(d=>d.d.type==="invoice"),r=v.filter(d=>d.d.type==="credit"),w=(d,m)=>d.reduce((x,D)=>x+m(D),0),L=w(n,d=>d.t.total),T=w(n,d=>d.t.totalTax),C=w(n,d=>d.t.paid),R=w(n,d=>d.t.insurance),V=w(r,d=>d.t.total),B=w(n,d=>Math.max(d.t.balance,0)),P=new Map;for(const d of n){const m=d.d.date.slice(0,7),x=P.get(m)||{n:0,taxable:0,tax:0,total:0,paid:0};x.n++,x.taxable+=d.t.taxable,x.tax+=d.t.totalTax,x.total+=d.t.total,x.paid+=d.t.paid,P.set(m,x)}const ee=[...P.entries()].sort((d,m)=>d[0].localeCompare(m[0])),G=Math.max(1,...ee.map(([,d])=>d.total)),_=new Map;for(const d of n)for(const m of d.t.taxes){const x=_.get(m.rate)||{taxable:0,cgst:0,sgst:0,igst:0};x.taxable+=m.taxable,x.cgst+=m.cgst||0,x.sgst+=m.sgst||0,x.igst+=m.igst||(j().taxMode!=="gst"?m.amount:0),_.set(m.rate,x)}const ae=w(n,d=>d.t.taxable-d.t.taxes.reduce((m,x)=>m+x.taxable,0)),g=te(d=>d.type==="invoice"&&d.status!=="cancelled"&&d.status!=="draft").filter(d=>d.t.balance>.004),E=[["Not due",0,0],["1-30 days",1,30],["31-60 days",31,60],["61-90 days",61,90],["90+ days",91,1e9]].map(([d,m,x])=>{const D=g.filter(q=>{const pe=pt(q.d);return pe>=m&&pe<=x});return{l:d,n:D.length,amt:w(D,q=>q.t.balance)}}),o=new Map;for(const d of n){const m=d.d.client&&d.d.client.name||"—",x=o.get(m)||{total:0,paid:0,n:0,id:d.d.clientId};x.total+=d.t.total,x.paid+=d.t.paid,x.n++,o.set(m,x)}const h=[...o.entries()].sort((d,m)=>m[1].total-d[1].total).slice(0,10);e.innerHTML=`
    <div class="toolbar">
      <div class="chips">${Object.entries(t).map(([d,[m]])=>`<a class="chip${d===c?" on":""}" href="#/reports?p=${d}">${i(m)}</a>`).join("")}</div>
      <form class="row-gap" id="custom"><input type="date" name="from" value="${i(b>"0001"?b:"")}"><span>to</span><input type="date" name="to" value="${i(u<"9999"?u:"")}"><button class="btn">Apply</button></form>
    </div>
    <p class="muted">${i(a)}${c!=="all"?` · ${i(b)} to ${i(u)}`:""} · issued invoices only</p>
    <div class="kpis">
      <div class="kpi"><span>Invoiced</span><b>${k(L)}</b><small>${n.length} invoices</small></div>
      <div class="kpi"><span>Tax collected</span><b>${k(T)}</b></div>
      <div class="kpi good"><span>Received</span><b>${k(C)}</b></div>
      ${R?`<div class="kpi"><span>Insurance / TPA share</span><b>${k(R)}</b></div>`:""}
      ${V?`<div class="kpi"><span>Credit notes</span><b>${k(V)}</b></div>`:""}
      <div class="kpi warn"><span>Outstanding</span><b>${k(B)}</b></div>
    </div>
    <div class="two-col">
      <section class="card">
        <h3>Month by month</h3>
        ${ee.length?`<div class="bars">${ee.map(([d,m])=>`<div class="bar-row"><span>${i(d)}</span><div class="bar"><i style="width:${m.total/G*100}%"></i><i class="paid" style="width:${m.paid/G*100}%"></i></div><b>${k(m.total)}</b></div>`).join("")}</div>
        <p class="legend"><i></i> Invoiced <i class="paid"></i> Received</p>
        <div class="table-wrap"><table class="table"><thead><tr><th>Month</th><th class="num">Invoices</th><th class="num">Taxable</th><th class="num">Tax</th><th class="num">Total</th><th class="num">Received</th></tr></thead>
        <tbody>${ee.map(([d,m])=>`<tr><td>${i(d)}</td><td class="num">${m.n}</td><td class="num">${k(m.taxable)}</td><td class="num">${k(m.tax)}</td><td class="num">${k(m.total)}</td><td class="num">${k(m.paid)}</td></tr>`).join("")}</tbody></table></div>`:'<p class="muted">No invoices in this period.</p>'}
      </section>
      <section class="card">
        <h3>GST summary <small>for GSTR-1 / 3B</small></h3>
        <div class="table-wrap"><table class="table"><thead><tr><th>Rate</th><th class="num">Taxable</th><th class="num">CGST</th><th class="num">SGST</th><th class="num">IGST</th></tr></thead>
        <tbody>${[..._.entries()].sort((d,m)=>d[0]-m[0]).map(([d,m])=>`<tr><td>${d}%</td><td class="num">${k(m.taxable)}</td><td class="num">${k(m.cgst)}</td><td class="num">${k(m.sgst)}</td><td class="num">${k(m.igst)}</td></tr>`).join("")}
        ${ae>.004?`<tr><td>Nil / exempt</td><td class="num">${k(ae)}</td><td class="num">–</td><td class="num">–</td><td class="num">–</td></tr>`:""}</tbody></table></div>
        <h3>Receivables ageing <small>all open invoices</small></h3>
        <div class="table-wrap"><table class="table"><tbody>${E.map(d=>`<tr><td>${d.l}</td><td class="num">${d.n}</td><td class="num">${k(d.amt)}</td></tr>`).join("")}</tbody></table></div>
        <h3>Top ${i(W().toLowerCase())}s</h3>
        <div class="table-wrap"><table class="table"><tbody>${h.map(([d,m])=>`<tr${m.id?` class="link" data-client="${m.id}"`:""}><td>${i(d)}</td><td class="num">${m.n}</td><td class="num">${k(m.total)}</td></tr>`).join("")||'<tr><td class="muted">No data</td></tr>'}</tbody></table></div>
      </section>
    </div>`,f("#custom",e).addEventListener("submit",d=>{d.preventDefault();const m=new FormData(d.target);A(`#/reports?p=custom&from=${m.get("from")||K()}&to=${m.get("to")||K()}`)}),e.querySelectorAll("[data-client]").forEach(d=>d.addEventListener("click",()=>A(`#/client/${d.dataset.client}`))),f("#csv").addEventListener("click",()=>{const d=te(D=>p(D)),m=["Type","Number","Date","Due date","Status",W(),"Company","GSTIN","Place of supply","Taxable","CGST","SGST","IGST","Total tax","Total","Insurance","Paid","Balance"],x=d.map(({d:D,t:q,status:pe})=>[F[D.type].name,D.number,D.date,D.dueDate,pe,D.client&&D.client.name,D.client&&D.client.company,D.client&&D.client.gstin,D.placeOfSupply,q.taxable,q.taxes.reduce((ne,ie)=>ne+(ie.cgst||0),0).toFixed(2),q.taxes.reduce((ne,ie)=>ne+(ie.sgst||0),0).toFixed(2),q.taxes.reduce((ne,ie)=>ne+(ie.igst||0),0).toFixed(2),q.totalTax,q.total,q.insurance,q.paid,q.balance]);Ge(`documents-${b>"0001"?b:"all"}-to-${u<"9999"?u:K()}.csv`,Ct([m,...x]),"text/csv")})}function he(e){const s=j(),l=s.business;H("Settings",'<button class="btn primary" form="setForm">Save settings</button>'),e.innerHTML=`
  <form id="setForm" class="settings">
    <section class="card">
      <h3>Business profile</h3>
      <div class="grid g3">
        ${y("Business name *",`<input name="b.name" required value="${i(l.name)}">`)}
        ${y("Tagline",`<input name="b.tagline" value="${i(l.tagline)}">`)}
        ${y("Registration / licence no.",`<input name="b.regNo" value="${i(l.regNo)}" placeholder="e.g. Clinical Est. Reg. No.">`)}
        ${y("Address",`<textarea name="b.address" rows="2">${i(l.address)}</textarea>`,"span2")}
        ${y("City",`<input name="b.city" value="${i(l.city)}">`)}
        ${y("State",`<select name="b.state">${I(ye.map(([n,r])=>[n,`${r} (${n})`]),l.state)}</select>`)}
        ${y("PIN code",`<input name="b.pincode" value="${i(l.pincode)}">`)}
        ${y("Phone / WhatsApp",`<input name="b.phone" value="${i(l.phone)}">`)}
        ${y("Email",`<input name="b.email" type="email" value="${i(l.email)}">`)}
        ${y("Website",`<input name="b.website" value="${i(l.website)}">`)}
        ${y("GSTIN",`<input name="b.gstin" value="${i(l.gstin)}" maxlength="15" style="text-transform:uppercase">`)}
        ${y("PAN",`<input name="b.pan" value="${i(l.pan)}" maxlength="10" style="text-transform:uppercase">`)}
      </div>
      <div class="grid g2">
        ${["logo","signature"].map(n=>`<div class="upload"><span>${n==="logo"?"Logo":"Signature / seal"}</span>
          <div class="upload-box">${l[n]?`<img src="${i(l[n])}" alt="">`:'<span class="muted">None</span>'}</div>
          <div class="row-gap"><label class="btn">${$("upload")} Upload<input type="file" accept="image/*" data-img="${n}" hidden></label>${l[n]?`<button type="button" class="btn ghost" data-clear="${n}">Remove</button>`:""}</div></div>`).join("")}
      </div>
    </section>

    <section class="card">
      <h3>Getting paid</h3>
      <div class="grid g3">
        ${y("UPI ID (for QR & pay button)",`<input name="b.upiId" value="${i(l.upiId)}" placeholder="name@okhdfcbank">`)}
        ${y("Account name",`<input name="b.accountName" value="${i(l.accountName)}">`)}
        ${y("Bank",`<input name="b.bankName" value="${i(l.bankName)}">`)}
        ${y("Account number",`<input name="b.accountNo" value="${i(l.accountNo)}">`)}
        ${y("IFSC",`<input name="b.ifsc" value="${i(l.ifsc)}" style="text-transform:uppercase">`)}
        ${y("Branch",`<input name="b.branch" value="${i(l.branch)}">`)}
      </div>
    </section>

    <section class="card">
      <h3>Business type <small>now: ${i(Z[s.industry]?Z[s.industry].name:"General")}</small></h3>
      <p class="muted">Switching sets the labels, bill fields, starter items, default tax and design for that kind of business. Existing documents are kept.</p>
      <details class="sp-details"><summary class="btn">Change business type</summary>${_e(s.industry)}</details>
      ${y("What do you call your customers?",`<input name="clientLabel" value="${i(s.clientLabel)}" placeholder="Customer, Client, Patient, Student, Guest, Member, Tenant…">`)}
    </section>

    <section class="card" id="fieldsCard">
      <h3>Fields on your bills <small>add, rename or remove anything</small></h3>
      <div id="fieldEditor"></div>
    </section>

    <section class="card">
      <h3>Tax & money</h3>
      <div class="grid g3">
        ${y("Currency",`<select name="currency">${I(Object.keys(ve).map(n=>[n,`${n} (${ve[n].symbol})`]),s.currency)}</select>`)}
        ${y("Tax system",`<select name="taxMode">${I([["gst","India GST (CGST+SGST / IGST)"],["simple","Simple tax / VAT"],["none","No tax"]],s.taxMode)}</select>`)}
        ${y("Default tax %",`<input name="defaultTax" type="number" step="any" min="0" value="${i(s.defaultTax)}">`)}
        ${y("Payment due after (days)",`<input name="dueDays" type="number" min="0" value="${i(s.dueDays)}">`)}
        <label class="check"><input type="checkbox" name="roundOff" ${s.roundOff?"checked":""}> Round total to whole number</label>
        <label class="check"><input type="checkbox" name="taxInclusive" ${s.taxInclusive?"checked":""}> Rates already include tax (MRP style)</label>
      </div>
    </section>

    <section class="card">
      <h3>Numbering <small>{YYYY} = year, {FY} = financial year, e.g. INV/{FY}/</small></h3>
      <div class="table-wrap"><table class="table edit-table"><thead><tr><th>Document</th><th>Prefix</th><th>Next no.</th><th>Digits</th><th>Suffix</th><th>Next will be</th></tr></thead>
      <tbody>${Object.entries(F).map(([n,r])=>`<tr><td>${i(r.name)}</td>
        <td><input name="n.${n}.prefix" value="${i(s.numbering[n].prefix)}"></td>
        <td><input name="n.${n}.next" type="number" min="1" value="${i(s.numbering[n].next)}"></td>
        <td><input name="n.${n}.pad" type="number" min="1" max="8" value="${i(s.numbering[n].pad)}"></td>
        <td><input name="n.${n}.suffix" value="${i(s.numbering[n].suffix)}"></td>
        <td><b>${i(bt(n))}</b></td></tr>`).join("")}</tbody></table></div>
    </section>

    <section class="card">
      <h3>Default text</h3>
      <div class="grid g2">
        ${y("Notes on new documents",`<textarea name="notes" rows="3">${i(s.notes)}</textarea>`)}
        ${y("Terms on new documents",`<textarea name="terms" rows="3">${i(s.terms)}</textarea>`)}
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
      ${Ee().length>1?`<button class="btn danger-text" id="delWs">${$("trash")} Remove this business from BillX</button>`:""}
    </div>
    <p class="muted small">Backups cover the business you have open (${i(l.name)}). Switch business from the sidebar to back up the others.</p>
  </section>`;const t=f("#setForm",e);Qe(t,n=>{t.elements.clientLabel.value=Z[n].clientLabel});const c=ce(s),a={fields:c.fields.map(n=>({...n})),clientFields:c.clientFields.map(n=>({...n})),itemCols:c.itemCols.filter(n=>!n.hidden).map(n=>({...n})),hiddenCols:c.itemCols.filter(n=>n.hidden),insurance:c.insurance},b=[["fields","Bill details","Shown with the number and date on every bill: e.g. Vehicle No., Room No., Project, Table, Event date.",!0],["clientFields",`${s.clientLabel} fields`,`Saved on each ${s.clientLabel.toLowerCase()} and printed under their name: e.g. Member ID, Age, PAN.`,!1],["itemCols","Extra item columns","Extra columns in the items table: e.g. Batch, Expiry, Size, Colour, Serial / IMEI, Weight.",!1]],u=()=>{f("#fieldEditor",e).innerHTML=`${b.map(([n,r,w,L])=>`<div class="fe-block" data-list="${n}">
      <div class="fe-head"><b>${i(r)}</b><span class="muted small">${i(w)}</span></div>
      ${a[n].map((T,C)=>`<div class="fe-row" data-i="${C}">
        <input data-fe="label" value="${i(T.label)}" placeholder="Field name" aria-label="Field name">
        ${L?`<select data-fe="type" aria-label="Type">${I([["","Text"],["date","Date"]],T.type||"")}</select>`:""}
        <button type="button" class="icon-btn" data-fe-move="-1" aria-label="Move up">${$("up",16)}</button>
        <button type="button" class="icon-btn danger" data-fe-del aria-label="Remove">${$("trash",16)}</button>
      </div>`).join("")||'<p class="muted small">None.</p>'}
      <button type="button" class="btn ghost" data-fe-add>${$("plus")} Add</button>
    </div>`).join("")}
    <label class="check"><input type="checkbox" data-fe-ins ${a.insurance?"checked":""}> Third-party share on bills (insurance / TPA / sponsor / subsidy pays part, the rest is payable)</label>`};u();const p=f("#fieldEditor",e);p.addEventListener("input",n=>{const r=n.target.closest(".fe-row");if(!r)return;const w=a[r.closest("[data-list]").dataset.list];w[+r.dataset.i][n.target.dataset.fe]=n.target.value,O(!0)}),p.addEventListener("change",n=>{n.target.matches("[data-fe-ins]")&&(a.insurance=n.target.checked,O(!0))}),p.addEventListener("click",n=>{const r=n.target.closest("[data-list]");if(!r)return;const w=!!n.target.closest("[data-fe-add]"),L=a[r.dataset.list],T=n.target.closest(".fe-row");if(w)L.push({key:`f${Date.now().toString(36)}`,label:""});else if(T&&n.target.closest("[data-fe-del]"))L.splice(+T.dataset.i,1);else if(T&&n.target.closest("[data-fe-move]")){const C=+T.dataset.i;C>0&&([L[C-1],L[C]]=[L[C],L[C-1]])}else return;if(O(!0),u(),w){const C=p.querySelectorAll(`[data-list="${r.dataset.list}"] [data-fe="label"]`);C.length&&C[C.length-1].focus()}}),t.addEventListener("input",()=>O(!0)),t.addEventListener("change",async n=>{const r=n.target;if(r.dataset.img)try{l[r.dataset.img]=await We(r.files[0],r.dataset.img==="logo"?480:360),N()?S("Image saved"):S("Image too large for browser storage","err"),O(!1),he(e)}catch(w){S(w.message,"err")}}),t.addEventListener("click",n=>{const r=n.target.closest("[data-clear]");r&&(l[r.dataset.clear]="",N(),he(e))}),t.addEventListener("submit",async n=>{n.preventDefault();const r=new FormData(t),w=r.get("industry");let L=!1;if(w&&w!==s.industry&&await J(`Switch to ${Z[w].name}?`,"Labels, fields, default tax and the default design change to suit it, and its starter items are added. Your existing documents are kept.","Switch")&&(Oe(w),L=!0),!L){const T=C=>C.filter(R=>R.label&&R.label.trim()).map(R=>({...R,label:R.label.trim()}));s.sector={fields:T(a.fields),clientFields:T(a.clientFields),itemCols:[...a.hiddenCols,...T(a.itemCols)],insurance:a.insurance}}for(const[T,C]of r.entries())if(T.startsWith("b."))l[T.slice(2)]=String(C).trim();else if(T.startsWith("n.")){const[,R,V]=T.split(".");s.numbering[R][V]=["next","pad"].includes(V)?Math.max(1,parseInt(C,10)||1):String(C)}l.gstin=l.gstin.toUpperCase(),l.pan=l.pan.toUpperCase(),l.ifsc=l.ifsc.toUpperCase(),Object.assign(s,{clientLabel:L?s.clientLabel:r.get("clientLabel")||s.clientLabel,currency:r.get("currency"),taxMode:r.get("taxMode"),defaultTax:parseFloat(r.get("defaultTax"))||0,dueDays:parseInt(r.get("dueDays"),10)||0,roundOff:r.has("roundOff"),taxInclusive:r.has("taxInclusive"),notes:r.get("notes"),terms:r.get("terms")}),oe(),N(),O(!1),S("Settings saved"),he(e)}),f("#exp",e).addEventListener("click",()=>Ge(`billing-backup-${new Date().toISOString().slice(0,10)}.json`,ht())),f("#imp",e).addEventListener("change",async n=>{const r=n.target.files[0];if(r&&await J("Restore this backup?","It replaces all data in this browser with the backup.","Restore"))try{vt(await r.text()),S("Backup restored"),A("#/")}catch(w){S(w.message,"err")}}),f("#sample",e).addEventListener("click",async()=>{await J("Add sample data?","Adds demo clients, items and documents and fills the business profile with sample details. You can edit or delete them later.","Add samples")&&(Re(s.industry),N(),S("Sample data added"),A("#/"))});const v=f("#delWs",e);v&&v.addEventListener("click",async()=>{await J(`Remove ${l.name}?`,"This business and all its documents, customers and items are deleted from this browser. Download a backup first if you need it.","Remove business")&&(Me(Fe()),location.hash="#/",location.reload())}),f("#reset",e).addEventListener("click",async()=>{await J("Erase everything?","All documents, clients, items and settings in this browser are deleted. Download a backup first if you need it.","Erase")&&($t(),location.hash="#/",location.reload())})}ft();document.querySelectorAll("[data-ic]").forEach(e=>{e.innerHTML=$(e.dataset.ic,20)});function Ze(){const e=j(),s=document.querySelector("[data-nav-clients]");s&&(s.textContent=`${e.clientLabel||"Client"}s`),document.getElementById("wsName").textContent=e.business.name,document.getElementById("wsSector").textContent=(Z[e.industry]||Z.general).name}Ze();gt(Ze);document.getElementById("wsBtn").addEventListener("click",()=>{const e=Ee();se({title:"Your businesses",submit:"",cancel:"Close",body:`<p class="muted">Run every business from one BillX. Each has its own ${i("customers")}, items, numbering, design and reports.</p>
      <div class="ws-list">${e.map(l=>{const t=yt(l.id);return`<button type="button" class="ws-item${l.active?" on":""}" data-ws="${l.id}"><b>${i(t.name||"New business")}</b>
        <small>${i((Z[t.industry]||{}).name||"Not set up yet")}${l.active?" · open now":""}</small></button>`}).join("")}</div>
      <button type="button" class="btn primary block" id="wsAdd">${$("plus")} Add another business</button>`}).el.addEventListener("click",l=>{const t=l.target.closest("[data-ws]");t&&!t.classList.contains("on")&&(wt(t.dataset.ws),location.hash="#/",location.reload()),l.target.closest("#wsAdd")&&(kt(),location.hash="#/",location.reload())})});document.getElementById("menuBtn").addEventListener("click",()=>document.body.classList.toggle("nav-open"));document.getElementById("scrim").addEventListener("click",()=>document.body.classList.remove("nav-open"));window.addEventListener("billing:save-failed",()=>S("Browser storage is full. Download a backup and remove large images.","err"));Y("/",Et);Y("/docs/:type?",At);Y("/new/:type",Ie);Y("/edit/:id",Ie);Y("/doc/:id",Ce);Y("/clients",It);Y("/client/:id",ze);Y("/items",Pt);Y("/design",Te);Y("/reports",Gt);Y("/settings",he);Lt();
