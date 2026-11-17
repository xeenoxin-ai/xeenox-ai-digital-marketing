# Launching BillX as a paid service

This guide takes BillX from code to a live website where businesses sign up,
get a 14-day free trial and pay you every month. Follow the steps in order.
Expect about 2 hours, plus Razorpay's KYC approval time (often 1–3 working days).

| What | Service | Cost to you |
| --- | --- | --- |
| Website + payment server | Cloudflare Pages (commercial use allowed on the free plan) | ₹0 |
| Logins + database | Firebase (Spark plan): 50k reads and 20k writes per day free | ₹0 to start |
| Card / UPI Autopay collection | Razorpay Subscriptions | About 2% per payment plus a small subscription fee, plus GST on fees. Check razorpay.com/pricing |
| Web address | `billx.pages.dev` (free) or your own `.in` domain | Free subdomain, or a yearly fee for `.in` (step 7) |

> **Before you start:** Razorpay checks your website during KYC. The site must
> show your business name, address, contact, and the Terms, Privacy, Refund and
> Contact pages (all included in `billx/legal/`). Fill in `billx/src/site.js` first (step 0).

---

## 0. Your business details (5 minutes)

Edit `billx/src/site.js`:

- `whatsapp`: your support WhatsApp, digits only with 91, e.g. `919847000000`
- `email`: your support email
- `address`: your registered business address
- `legalReviewed`: set to `true` **after** you or your CA/lawyer have read
  `billx/legal/*` (the text is generated in `billx/src/legal.js`). While it is `false`, the
  legal pages show a "Draft" note.

Plans and prices live in `billx/src/plans.js` (₹499 / ₹1,499 / ₹3,999 a month).
Change them there and they update on the website, in the app and on the server.

## 1. Firebase: logins and database (20 minutes)

1. Go to <https://console.firebase.google.com> → **Add project** → name it e.g. `billx-prod`.
   Google Analytics is optional.
2. **Build → Authentication → Get started → Sign-in method**: enable **Email/Password** and **Google**.
3. **Authentication → Templates → Email address verification**: set the sender name to `BillX`.
4. **Build → Firestore Database → Create database** → *Production mode* →
   location **asia-south1 (Mumbai)**.
5. Upload the security rules from this repository:
   ```bash
   npx firebase login
   npx firebase deploy --only firestore --config billx/firebase.json --project billx-prod
   ```
6. **Project settings (⚙) → General → Your apps → Web (</>)** → register app `BillX` →
   copy the `firebaseConfig` object. You will paste it as `VITE_BILLX_FIREBASE` in step 3,
   on one line, as JSON with quoted keys, e.g.
   `{"apiKey":"AIza…","authDomain":"billx-prod.firebaseapp.com","projectId":"billx-prod","appId":"1:…"}`
7. **Project settings → Service accounts → Generate new private key**. A JSON file
   downloads. **This is a secret**: never commit it or send it on WhatsApp/email.
   You will paste its whole content as the secret `FIREBASE_SERVICE_ACCOUNT` in step 3.

## 2. Razorpay: getting paid (30 minutes + KYC)

1. Sign up at <https://dashboard.razorpay.com>, complete **KYC** (PAN, bank account, GST if
   registered, website = your BillX address from step 3).
2. Start in **Test mode** (toggle at the top). Do everything below in test mode first,
   then repeat it in Live mode.
3. **Subscriptions → Plans → Create plan**: create these 6 plans. If you are GST-registered,
   charge price + 18% GST (amounts below include GST):

   | Plan name | Billing | Amount |
   | --- | --- | --- |
   | BillX Starter | Monthly, every 1 month | ₹588.82 |
   | BillX Starter yearly | Yearly, every 1 year | ₹5,888.20 |
   | BillX Business | Monthly | ₹1,768.82 |
   | BillX Business yearly | Yearly | ₹17,688.20 |
   | BillX Pro | Monthly | ₹4,718.82 |
   | BillX Pro yearly | Yearly | ₹47,188.20 |

   Copy each plan's ID (`plan_…`).
   UPI Autopay has a per-payment limit (RBI rules; check the current limit with Razorpay).
   Large yearly payments may need card or net banking.
4. **Account & Settings → API keys → Generate key**: copy the **Key ID** (`rzp_test_…`) and
   **Key Secret** (secret).
5. **Account & Settings → Webhooks → Add new webhook**
   - URL: `https://YOUR-SITE/api/razorpay-webhook` (e.g. `https://billx.pages.dev/api/razorpay-webhook`)
   - Secret: make up a long random password and keep it for step 3
   - Events: `subscription.activated`, `subscription.charged`, `subscription.pending`,
     `subscription.halted`, `subscription.cancelled`, `subscription.completed`,
     `subscription.paused`, `subscription.resumed`

## 3. Cloudflare Pages: put it online (20 minutes)

1. Sign up at <https://dash.cloudflare.com> (free).
2. **Workers & Pages → Create → Pages → Connect to Git** → pick
   `xeenoxin-ai/xeenox-ai-digital-marketing` → production branch `main`.
3. Build settings:
   - Framework preset: **None**
   - Build command: `npm run build:billx`
   - Build output directory: `dist-billx`
   - Project name: `billx` (gives `https://billx.pages.dev`; pick another name if taken)
4. **Environment variables** (Settings → Variables and Secrets), for *Production*:

   | Name | Value | Type |
   | --- | --- | --- |
   | `VITE_BILLX_FIREBASE` | the config JSON from step 1.6 | Text |
   | `VITE_RAZORPAY_KEY_ID` | Key ID from step 2.4 | Text |
   | `FIREBASE_PROJECT_ID` | e.g. `billx-prod` | Text |
   | `FIREBASE_SERVICE_ACCOUNT` | whole JSON file from step 1.7 | **Secret** |
   | `RAZORPAY_KEY_ID` | Key ID | Text |
   | `RAZORPAY_KEY_SECRET` | Key Secret | **Secret** |
   | `RAZORPAY_WEBHOOK_SECRET` | webhook secret from step 2.5 | **Secret** |
   | `RZP_PLAN_STARTER_MONTHLY` … `RZP_PLAN_PRO_YEARLY` | the 6 plan IDs | Text |

   The six plan variables are `RZP_PLAN_STARTER_MONTHLY`, `RZP_PLAN_STARTER_YEARLY`,
   `RZP_PLAN_BUSINESS_MONTHLY`, `RZP_PLAN_BUSINESS_YEARLY`, `RZP_PLAN_PRO_MONTHLY`, `RZP_PLAN_PRO_YEARLY`.
5. **Deployments → Retry deployment** so the build picks up the variables.
6. Firebase console → **Authentication → Settings → Authorized domains → Add domain**:
   `billx.pages.dev` (and your own domain later).

Every push to `main` now redeploys automatically. The payment API is in `/functions/api`.

## 4. Make yourself the admin (5 minutes)

1. Open `https://billx.pages.dev/app/` and sign up with your own email.
2. Firebase console → **Authentication → Users** → copy your **User UID**.
3. **Firestore → Start collection** `admins` → Document ID = your UID → add any field
   (e.g. `name` = `Owner`) → Save.
4. Open `https://billx.pages.dev/admin.html`. You see every account, trials, paying
   customers, monthly revenue, and an **Activate / extend** button for customers who pay
   you by cash, cheque or bank transfer.

## 5. Test the whole flow (test mode)

1. In a private window, sign up as a new customer, finish setup, create an invoice.
2. **Subscription & team → Subscribe** → pay with a Razorpay test card / test UPI.
3. The plan shows **Active**, and the admin page shows the payment and revenue.
4. Add a staff email; sign in as that staff member: they see the same bills.
5. In the admin page, "Activate" an account to a past date to see the read-only mode.

## 6. Go live

Switch Razorpay to **Live mode**, create the 6 plans and the webhook again (live IDs
differ), replace the Razorpay variables in Cloudflare with the live ones, redeploy.

## 7. Your own `.in` domain (last step)

**A `.in` domain is not free.** The `.in` registry (NIXI) charges every registrar, so
every `.in` has a yearly fee, even if the first year is on offer. Free choices:

- **`billx.pages.dev`**: free forever and already secure (https). Fine to start selling.
- If you already pay for a **web hosting plan** (e.g. Hostinger), many include one free
  domain for the first year; check whether `.in` is included in yours.

To buy one, check `billx.in` / `getbillx.in` / `billx.co.in` at a registrar
(GoDaddy, Hostinger, BigRock, Namecheap…). Compare the **renewal** price, not just the
first-year offer. Then connect it:

1. Cloudflare → your Pages project → **Custom domains → Set up a domain** → enter it.
2. Cloudflare shows a DNS record (CNAME) or offers to move the domain's nameservers to
   Cloudflare (free, recommended). Add it at your registrar as shown. It goes live in
   minutes to a few hours, with https included.
3. Firebase → Authentication → **Authorized domains** → add the domain.
4. Razorpay → update the website URL and the webhook URL to the new domain.

## Day-to-day

- **Admin page**: new sign-ups, trials ending soon (call them!), payments due.
- **Customers who don't pay online**: Admin → Activate / extend → choose plan and date.
- **Backups**: Firebase keeps the data; customers can also download their own backup
  in Settings.
- **Changing prices**: edit `billx/src/plans.js` *and* create new Razorpay plans with the
  new amounts, then update the `RZP_PLAN_*` variables. Existing subscribers stay on
  their old plan.

## For developers

```bash
npm run dev:billx          # BillX site on localhost (free mode unless VITE_BILLX_FIREBASE is set)
npm run emulators:billx    # local Firebase Auth + Firestore
VITE_BILLX_FIREBASE='{"apiKey":"x","projectId":"demo-billx","authDomain":"x"}' VITE_BILLX_EMULATOR=127.0.0.1 npm run dev:billx
npm test                   # unit tests (billing maths, templates, payment server)
npm run test:billx-rules   # Firestore security rules on the emulator
npm run build:billx        # production build in dist-billx/
```

Code map: `billx/src/cloud/` (login, sync, trial, payments in the browser),
`billx/server/` + `functions/api/` (payment server on Cloudflare),
`billx/firestore.rules` (who can read and write), `billx/src/admin.js` (admin console),
`billx/index.html` + `billx/src/landing.js` (sales page), `billx/legal/` (policies).
