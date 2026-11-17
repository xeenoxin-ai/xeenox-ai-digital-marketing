import"./modulepreload-polyfill-B5Qt9EMX.js";import{e as p}from"./templates-UjNXZVn3.js";/* empty css                */import{P as c}from"./plans-DOwXfloS.js";import{S as u}from"./site-DEmB1ocq.js";import{c as d}from"./config-BIi44hYM.js";import{f as a,o as i,i as y}from"./ui-eLZoGku3.js";import{b as h,r as f,p as g,a as b,w as m,c as $}from"./pay-details-BeCEpv1M.js";const t=document.getElementById("pay"),s=new URLSearchParams(location.search);let r=c[s.get("plan")]?s.get("plan"):"business",n=s.get("period")==="yearly"?"yearly":"monthly";function l(){t.innerHTML=`
    <h1>Buy BillX</h1>
    <p class="muted">Pay ${p(u.company)} directly. Then send us the payment reference and we activate your plan, usually within a few hours.</p>
    <div class="grid g2 pay-pick">
      ${a("Plan",`<select id="plan">${i(Object.entries(c).map(([e,o])=>[e,`${o.name}: ${f(g(e,n))}/${n==="yearly"?"year":"month"}`]),r)}</select>`)}
      ${a("Billing",`<select id="period">${i([["monthly","Monthly"],["yearly","Yearly (2 months free)"]],n)}</select>`)}
    </div>
    <h2>1. Pay</h2>
    ${b(r,n)}
    <h2>2. Send us the payment reference</h2>
    <form id="confirm" class="card">
      <div class="grid g2">
        ${a("UPI / bank reference (UTR) *",'<input name="utr" required minlength="6" placeholder="12-digit UTR from your payment app">')}
        ${a("Paid by",`<select name="method">${i([["UPI","UPI / GPay / PhonePe"],["Bank transfer","Bank transfer"]],"UPI")}</select>`)}
        ${a("Your name *",'<input name="name" required autocomplete="name">')}
        ${a("Business name",'<input name="business">')}
        ${a("Phone / WhatsApp *",'<input name="phone" required type="tel" autocomplete="tel">')}
        ${a("Email for your BillX login",'<input name="email" type="email" autocomplete="email">')}
      </div>
      <button class="btn primary big">${y("whatsapp")} Send on WhatsApp</button>
      ${d()?'<p class="muted small">Already signed up? You can also submit the reference inside BillX → Subscription & team, and it activates as soon as we confirm the money arrived.</p>':""}
    </form>
    <p class="muted small">Need a GST invoice or have a question? <a href="${p(m("Hi, I have a question about paying for BillX."))}" target="_blank" rel="noopener">WhatsApp us</a>.</p>`,t.querySelector("#plan").onchange=e=>{r=e.target.value,l()},t.querySelector("#period").onchange=e=>{n=e.target.value,l()},t.querySelector("#confirm").addEventListener("submit",e=>{e.preventDefault();const o=Object.fromEntries(new FormData(e.target));window.open(m($({plan:r,period:n,...o})),"_blank","noopener")})}h(t);l();
