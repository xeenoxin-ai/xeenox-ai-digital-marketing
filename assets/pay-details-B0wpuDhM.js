import{S as m}from"./site-xgmjrS31.js";import{w as y,p as d,P as r}from"./plans-DOwXfloS.js";import{f,e}from"./templates-CkKCGG_a.js";import{c as b,t as h,i as P}from"./ui-DPvKWOVF.js";const $=a=>f(a,"INR").replace(/\.00$/,"");function l(a,n){return y(d(a,n))}function B(a,n){const o=m.pay,i=l(a,n);`${r[a].name}${n}`;const s=o.bank,t=(c,p,u=!0)=>p?`<div class="pd-row"><span>${e(c)}</span><b>${e(p)}</b>${u?`<button type="button" class="icon-btn" data-copy="${e(p)}" aria-label="Copy ${e(c)}">${P("copy",16)}</button>`:""}</div>`:"";return`<div class="pay-details">
    <div class="pd-amount"><span>Amount to pay</span><b>${$(i)}</b><small>${e(r[a].name)} plan, ${n==="yearly"?"1 year":"1 month"}</small></div>
    <div class="pd-grid">
      <section class="pd-box">
        <h4>UPI · GPay · PhonePe · Paytm</h4>
        
        ${t("Pay to name",o.payee,!1)}
        ${t("GPay / UPI number",o.gpay)}
        ${t("UPI ID",o.upiId)}
        <p class="muted small">Your UPI app shows the bank account holder's name${` (${e(s.accountName)})`} when you pay.</p>
      </section>
      <section class="pd-box">
        <h4>Bank transfer (NEFT / IMPS / RTGS)</h4>
        ${t("Account name",s.accountName)}
        ${t("Account number",s.accountNo)}
        ${t("IFSC",s.ifsc)}
        ${t("Bank",s.bankName,!1)}
        ${t("Branch",s.branch,!1)}
        <p class="muted small">IFSC code: ask us on WhatsApp.</p>
      </section>
    </div>
  </div>`}function N(a){a.addEventListener("click",async n=>{const o=n.target.closest("[data-copy]");o&&await b(o.dataset.copy)&&h("Copied")})}function T(a){return`https://wa.me/${m.whatsapp}?text=${encodeURIComponent(a)}`}function x({plan:a,period:n,utr:o,name:i,business:s,phone:t,email:c,method:p}){return[`Hello ${m.company}, I have paid for BillX.`,`Plan: ${r[a].name} (${n})`,`Amount: ${$(l(a,n))}`,`Paid by: ${p||"UPI"}`,`Reference / UTR: ${o}`,i&&`Name: ${i}`,s&&`Business: ${s}`,t&&`Phone: ${t}`,c&&`BillX login email: ${c}`].filter(Boolean).join(`
`)}export{B as a,N as b,x as c,l as p,$ as r,T as w};
