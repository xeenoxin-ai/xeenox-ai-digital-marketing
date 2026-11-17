import"./modulepreload-polyfill-B5Qt9EMX.js";import{c as H,d as x,e as n,y as M,u as S,z as b,q as F,f as _}from"./templates-UjNXZVn3.js";/* empty css                */import{d as O}from"./portal-codec-7epzrYuT.js";import{i,g as U,a as j,p as z}from"./ui-eLZoGku3.js";const f=document.getElementById("portal");function A(m){f.innerHTML=`<div class="portal-card empty">${i("file",40)}<h2>Link can't be opened</h2><p>${n(m)}</p><p class="muted">Ask the sender for a fresh link.</p></div>`}async function Y(){const m=location.hash.slice(1);if(!m)return A("This page needs the full link you were sent.");let o;try{o=await O(m)}catch{return A("The link looks incomplete or damaged. Make sure you copied all of it.")}const s={...o.s,numbering:{},docTitles:o.s.docTitles||{}},a=s.business||{},h=s.currency||"INR",c=e=>_(e,h),C={sellerState:a.state,taxMode:s.taxMode,roundOff:s.roundOff,taxInclusive:s.taxInclusive},d=(o.d||[]).map(e=>{const t=H(e,C);return{d:e,t,status:x(e,t)}}).sort((e,t)=>(t.d.date||"").localeCompare(e.d.date||"")),I=d.filter(e=>e.d.type==="invoice"&&e.status!=="cancelled"),w=I.reduce((e,t)=>e+t.t.payable,0),P=I.reduce((e,t)=>e+t.t.paid,0),T=d.filter(e=>e.d.type==="credit"&&e.status!=="cancelled").reduce((e,t)=>e+t.t.total,0),r=Math.max(0,w-P-T),v=String(a.phone||"").replace(/\D/g,""),y=v.length===10?`91${v}`:v;document.title=`${a.name||"BillX"} · ${o.c.name}`,s.design&&s.design.accent&&document.documentElement.style.setProperty("--brand-2",s.design.accent);const u=e=>y?`https://wa.me/${y}?text=${encodeURIComponent(e)}`:`mailto:${encodeURIComponent(a.email||"")}?subject=${encodeURIComponent(`Message from ${o.c.name}`)}&body=${encodeURIComponent(e)}`,E=`<header class="portal-head">
      ${a.logo?`<img src="${n(a.logo)}" alt="" class="portal-logo">`:""}
      <div><div class="portal-biz">${n(a.name)}</div><div class="muted small">${[a.phone,a.email,a.website].filter(Boolean).map(n).join(" · ")}</div></div>
    </header>`;function D(){f.innerHTML=`${E}
      <section class="portal-card">
        <p class="muted">Account statement for</p>
        <h1>${n(o.c.name)}${o.c.company&&o.c.company!==o.c.name?` <small>${n(o.c.company)}</small>`:""}</h1>
        <div class="kpis">
          <div class="kpi"><span>Total billed</span><b>${c(w)}</b></div>
          <div class="kpi good"><span>Paid</span><b>${c(P+T)}</b></div>
          <div class="kpi ${r>.5?"warn":"good"}"><span>Balance due</span><b>${c(r)}</b></div>
        </div>
        ${r>.5&&h==="INR"&&a.upiId?`<a class="btn primary big" href="${n(S({upiId:a.upiId,payee:a.name,amount:r,note:`Balance ${o.c.name}`}))}">${i("cash")} Pay ${c(r)} by UPI</a>`:""}
        <p class="muted small">As of ${b((o.at||"").slice(0,10))}. Payments made after that show up in the next link you receive.</p>
      </section>
      <section class="portal-card">
        <h3>Your documents</h3>
        ${d.map(({d:e,t,status:p},$)=>`<button class="list-row portal-doc" data-i="${$}">
          <span><b>${n(e.title||M[e.type].title)} ${n(e.number)}</b><small>${b(e.date)}${e.dueDate&&e.type==="invoice"?` · due ${b(e.dueDate)}`:""}</small></span>
          <span class="right">${c(t.payable)}${U(p)}</span></button>`).join("")||'<p class="muted">No documents.</p>'}
      </section>
      <footer class="portal-foot">Shared privately by ${n(a.name)}. Questions? <a href="${n(u(`Hello, I have a question about my account (${o.c.name}).`))}" target="_blank" rel="noopener">Contact us</a></footer>`,f.querySelectorAll(".portal-doc").forEach(e=>e.addEventListener("click",()=>R(+e.dataset.i)))}function R(e){const{d:t,t:p,status:$}=d[e],L=t.title||M[t.type].title,l=t.type==="invoice"||t.type==="proforma"?Math.max(0,p.balance):0,g=l>0&&h==="INR"&&a.upiId?S({upiId:a.upiId,payee:a.name,amount:l,note:t.number}):"";f.innerHTML=`${E}
      ${d.length>1?`<button class="btn ghost" id="back">${i("back")} All documents</button>`:""}
      <div class="portal-doc-page">
        <section class="portal-card portal-actions">
          <div class="row-between"><b>${n(L)} ${n(t.number)}</b>${U($)}</div>
          <div class="bigmoney">${c(l||p.payable)}</div>
          <div class="muted small">${l?"Amount due":"Total"}${t.dueDate&&l?` · due ${b(t.dueDate)}`:""}</div>
          <button class="btn block" id="print">${i("download")} Download PDF / Print</button>
          ${g?`<a class="btn primary block" href="${n(g)}">${i("cash")} Pay ${c(l)} with UPI app</a>
            <div class="portal-qr">${F(g,{size:150})}<span class="muted small">On a computer? Scan with GPay, PhonePe, Paytm or any UPI app.</span></div>`:""}
          ${l&&a.accountNo?`<div class="muted small">Bank transfer: ${n(a.accountName||a.name)} · A/c ${n(a.accountNo)} · IFSC ${n(a.ifsc||"")}</div>`:""}
          ${l?`<form id="paidForm" class="paid-form"><label class="fld"><span>Paid already? Reference / UTR</span><input name="ref" placeholder="e.g. 4321 8765 1234"></label>
            <button class="btn block whatsapp">${i(y?"whatsapp":"mail")} Send payment confirmation</button></form>`:""}
          ${t.type==="quote"&&!["accepted","declined","converted"].includes($)?`<a class="btn primary block" target="_blank" rel="noopener" href="${n(u(`Hello, I accept quotation ${t.number} for ${c(p.payable)}. Please go ahead. - ${o.c.name}`))}">${i("check")} Accept quotation</a>
            <a class="btn block" target="_blank" rel="noopener" href="${n(u(`Hello, about quotation ${t.number}: I'd like to discuss some changes. - ${o.c.name}`))}">${i("edit")} Request changes</a>`:""}
        </section>
        <section class="portal-card portal-preview"><div id="pv"></div></section>
      </div>`,j(document.getElementById("pv"),t,s),document.getElementById("print").addEventListener("click",()=>z([t],s));const q=document.getElementById("back");q&&q.addEventListener("click",D);const k=document.getElementById("paidForm");k&&k.addEventListener("submit",N=>{N.preventDefault();const B=new FormData(k).get("ref");window.open(u(`Hello, I have paid ${c(l)} for ${L} ${t.number}.${B?` Reference/UTR: ${B}.`:""} - ${o.c.name}`),"_blank","noopener")}),window.scrollTo(0,0)}d.length===1?R(0):D()}Y();window.addEventListener("hashchange",()=>location.reload());
