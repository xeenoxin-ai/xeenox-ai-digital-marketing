import"./modulepreload-polyfill-B5Qt9EMX.js";import{ab as H,c as x,d as F,e as n,i,D as S,ac as q,h as U,b,ad as _,K as O,B as j,f as z}from"./portal-codec-_bXHpt1u.js";const h=document.getElementById("portal");function A(m){h.innerHTML=`<div class="portal-card empty">${i("file",40)}<h2>Link can't be opened</h2><p>${n(m)}</p><p class="muted">Ask the sender for a fresh link.</p></div>`}async function Y(){const m=location.hash.slice(1);if(!m)return A("This page needs the full link you were sent.");let o;try{o=await H(m)}catch{return A("The link looks incomplete or damaged. Make sure you copied all of it.")}const s={...o.s,numbering:{},docTitles:o.s.docTitles||{}},t=s.business||{},f=s.currency||"INR",c=e=>z(e,f),C={sellerState:t.state,taxMode:s.taxMode,roundOff:s.roundOff,taxInclusive:s.taxInclusive},d=(o.d||[]).map(e=>{const a=x(e,C);return{d:e,t:a,status:F(e,a)}}).sort((e,a)=>(a.d.date||"").localeCompare(e.d.date||"")),I=d.filter(e=>e.d.type==="invoice"&&e.status!=="cancelled"),w=I.reduce((e,a)=>e+a.t.payable,0),P=I.reduce((e,a)=>e+a.t.paid,0),T=d.filter(e=>e.d.type==="credit"&&e.status!=="cancelled").reduce((e,a)=>e+a.t.total,0),r=Math.max(0,w-P-T),v=String(t.phone||"").replace(/\D/g,""),y=v.length===10?`91${v}`:v;document.title=`${t.name||"BillX"} · ${o.c.name}`,s.design&&s.design.accent&&document.documentElement.style.setProperty("--brand-2",s.design.accent);const u=e=>y?`https://wa.me/${y}?text=${encodeURIComponent(e)}`:`mailto:${encodeURIComponent(t.email||"")}?subject=${encodeURIComponent(`Message from ${o.c.name}`)}&body=${encodeURIComponent(e)}`,D=`<header class="portal-head">
      ${t.logo?`<img src="${n(t.logo)}" alt="" class="portal-logo">`:""}
      <div><div class="portal-biz">${n(t.name)}</div><div class="muted small">${[t.phone,t.email,t.website].filter(Boolean).map(n).join(" · ")}</div></div>
    </header>`;function E(){h.innerHTML=`${D}
      <section class="portal-card">
        <p class="muted">Account statement for</p>
        <h1>${n(o.c.name)}${o.c.company&&o.c.company!==o.c.name?` <small>${n(o.c.company)}</small>`:""}</h1>
        <div class="kpis">
          <div class="kpi"><span>Total billed</span><b>${c(w)}</b></div>
          <div class="kpi good"><span>Paid</span><b>${c(P+T)}</b></div>
          <div class="kpi ${r>.5?"warn":"good"}"><span>Balance due</span><b>${c(r)}</b></div>
        </div>
        ${r>.5&&f==="INR"&&t.upiId?`<a class="btn primary big" href="${n(q({upiId:t.upiId,payee:t.name,amount:r,note:`Balance ${o.c.name}`}))}">${i("cash")} Pay ${c(r)} by UPI</a>`:""}
        <p class="muted small">As of ${b((o.at||"").slice(0,10))}. Payments made after that show up in the next link you receive.</p>
      </section>
      <section class="portal-card">
        <h3>Your documents</h3>
        ${d.map(({d:e,t:a,status:p},$)=>`<button class="list-row portal-doc" data-i="${$}">
          <span><b>${n(e.title||S[e.type].title)} ${n(e.number)}</b><small>${b(e.date)}${e.dueDate&&e.type==="invoice"?` · due ${b(e.dueDate)}`:""}</small></span>
          <span class="right">${c(a.payable)}${U(p)}</span></button>`).join("")||'<p class="muted">No documents.</p>'}
      </section>
      <footer class="portal-foot">Shared privately by ${n(t.name)}. Questions? <a href="${n(u(`Hello, I have a question about my account (${o.c.name}).`))}" target="_blank" rel="noopener">Contact us</a></footer>`,h.querySelectorAll(".portal-doc").forEach(e=>e.addEventListener("click",()=>R(+e.dataset.i)))}function R(e){const{d:a,t:p,status:$}=d[e],B=a.title||S[a.type].title,l=a.type==="invoice"||a.type==="proforma"?Math.max(0,p.balance):0,g=l>0&&f==="INR"&&t.upiId?q({upiId:t.upiId,payee:t.name,amount:l,note:a.number}):"";h.innerHTML=`${D}
      ${d.length>1?`<button class="btn ghost" id="back">${i("back")} All documents</button>`:""}
      <div class="portal-doc-page">
        <section class="portal-card portal-actions">
          <div class="row-between"><b>${n(B)} ${n(a.number)}</b>${U($)}</div>
          <div class="bigmoney">${c(l||p.payable)}</div>
          <div class="muted small">${l?"Amount due":"Total"}${a.dueDate&&l?` · due ${b(a.dueDate)}`:""}</div>
          <button class="btn block" id="print">${i("download")} Download PDF / Print</button>
          ${g?`<a class="btn primary block" href="${n(g)}">${i("cash")} Pay ${c(l)} with UPI app</a>
            <div class="portal-qr">${_(g,{size:150})}<span class="muted small">On a computer? Scan with GPay, PhonePe, Paytm or any UPI app.</span></div>`:""}
          ${l&&t.accountNo?`<div class="muted small">Bank transfer: ${n(t.accountName||t.name)} · A/c ${n(t.accountNo)} · IFSC ${n(t.ifsc||"")}</div>`:""}
          ${l?`<form id="paidForm" class="paid-form"><label class="fld"><span>Paid already? Reference / UTR</span><input name="ref" placeholder="e.g. 4321 8765 1234"></label>
            <button class="btn block whatsapp">${i(y?"whatsapp":"mail")} Send payment confirmation</button></form>`:""}
          ${a.type==="quote"&&!["accepted","declined","converted"].includes($)?`<a class="btn primary block" target="_blank" rel="noopener" href="${n(u(`Hello, I accept quotation ${a.number} for ${c(p.payable)}. Please go ahead. - ${o.c.name}`))}">${i("check")} Accept quotation</a>
            <a class="btn block" target="_blank" rel="noopener" href="${n(u(`Hello, about quotation ${a.number}: I'd like to discuss some changes. - ${o.c.name}`))}">${i("edit")} Request changes</a>`:""}
        </section>
        <section class="portal-card portal-preview"><div id="pv"></div></section>
      </div>`,O(document.getElementById("pv"),a,s),document.getElementById("print").addEventListener("click",()=>j([a],s));const L=document.getElementById("back");L&&L.addEventListener("click",E);const k=document.getElementById("paidForm");k&&k.addEventListener("submit",N=>{N.preventDefault();const M=new FormData(k).get("ref");window.open(u(`Hello, I have paid ${c(l)} for ${B} ${a.number}.${M?` Reference/UTR: ${M}.`:""} - ${o.c.name}`),"_blank","noopener")}),window.scrollTo(0,0)}d.length===1?R(0):E()}Y();window.addEventListener("hashchange",()=>location.reload());
