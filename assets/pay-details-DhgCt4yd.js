import{S as r}from"./site-DEmB1ocq.js";import{w as I,p as w,P as $}from"./plans-DOwXfloS.js";import{f as v,e as s,u as k,q as N}from"./templates-C3isoJkH.js";import{c as A,t as T,i as h}from"./ui-DH3jCLhP.js";const y=t=>v(t,"INR").replace(/\.00$/,"");function b(t,n){return I(w(t,n))}function U(t){return`https://wa.me/${r.whatsapp}?text=${encodeURIComponent(t)}`}const x=(t,n)=>`Hello ${r.company}, I want to buy BillX ${$[t].name} (${n}) for ${y(b(t,n))}. Please send the payment details.`;function C(t,n,o=null){const c=b(t,n),p=`<div class="pd-amount"><span>Amount to pay</span><b>${y(c)}</b><small>${s($[t].name)} plan, ${n==="yearly"?"1 year":"1 month"}</small></div>`,a=o||{};if(!(a.gpay||a.upiId||a.accountNo)){const i=U(x(t,n));return`<div class="pay-details">${p}
      <section class="pd-box pd-private">
        <h4>Pay ${s(r.company)} by UPI, GPay or bank transfer</h4>
        <p class="muted">For your security we share our UPI and bank details personally. Tap below and we'll send them on WhatsApp right away.</p>
        ${i?`<a class="btn primary block" href="${s(i)}" target="_blank" rel="noopener">${h("whatsapp")} Get payment details on WhatsApp</a>`:""}
      </section>
    </div>`}const l=a.payee||r.pay.payee,f=`BillX ${$[t].name} ${n}`,d=a.upiId?k({upiId:a.upiId,payee:l,amount:c,note:f}):"",e=(i,m,P=!0)=>m?`<div class="pd-row"><span>${s(i)}</span><b>${s(m)}</b>${P?`<button type="button" class="icon-btn" data-copy="${s(m)}" aria-label="Copy ${s(i)}">${h("copy",16)}</button>`:""}</div>`:"";return`<div class="pay-details">${p}
    <div class="pd-grid">
      <section class="pd-box">
        <h4>UPI · GPay · PhonePe · Paytm</h4>
        ${d?`<div class="pd-qr">${N(d,{size:170})}</div><a class="btn primary block" href="${s(d)}">${h("cash")} Pay ${y(c)} in UPI app</a>`:""}
        ${e("Pay to name",l,!1)}
        ${e("GPay / UPI number",a.gpay)}
        ${e("UPI ID",a.upiId)}
        ${a.accountName?`<p class="muted small">Your UPI app shows the account holder's name (${s(a.accountName)}) when you pay.</p>`:""}
      </section>
      ${a.accountNo?`<section class="pd-box">
        <h4>Bank transfer (NEFT / IMPS / RTGS)</h4>
        ${e("Account name",a.accountName)}
        ${e("Account number",a.accountNo)}
        ${e("IFSC",a.ifsc)}
        ${e("Bank",a.bankName,!1)}
        ${e("Branch",a.branch,!1)}
      </section>`:""}
    </div>
  </div>`}function G(t){t.addEventListener("click",async n=>{const o=n.target.closest("[data-copy]");o&&await A(o.dataset.copy)&&T("Copied")})}function L({plan:t,period:n,utr:o,name:c,business:p,phone:a,email:u,method:l}){return[`Hello ${r.company}, I have paid for BillX.`,`Plan: ${$[t].name} (${n})`,`Amount: ${y(b(t,n))}`,`Paid by: ${l||"UPI"}`,`Reference / UTR: ${o}`,c&&`Name: ${c}`,p&&`Business: ${p}`,a&&`Phone: ${a}`,u&&`BillX login email: ${u}`].filter(Boolean).join(`
`)}export{C as a,G as b,L as c,b as p,y as r,U as w};
