# BillX: where the data lives (the backend)

BillX can run in two modes. The live site at https://billxsolutions.pages.dev
runs in **Free mode** today, because Firebase has not been set up yet.

| | Free mode (live now) | Cloud mode (after Firebase setup) |
|---|---|---|
| Who can use it | Anyone, without an account | Signed-in accounts with a 14-day trial, then a paid plan |
| Where bills are saved | Only in that customer's browser, on their own device | Google Firebase (Firestore) database, plus a copy in the browser for speed and offline use |
| Works offline | Yes | Yes, and syncs when back online |
| Multiple devices / staff | No (one device) | Yes: phone, counter PC and staff logins all see the same data |
| Your server cost | ₹0 | ₹0 on the Firebase free tier for a long time (limits below) |
| Can you (BillX Solutions) see customers' bills? | No, never | Only through the Firebase console, as the database owner. Security rules stop other customers from seeing them. |

## 1. Free mode: the customer's browser

Nothing is sent to any server. Each business is stored in the browser's
`localStorage`, under these keys:

| Key | What it holds |
|---|---|
| `billx-workspaces` | List of businesses on this device and which one is open |
| `billx-v1` | The first business: settings, clients, items, documents |
| `billx-v1:<id>` | Each extra business |
| `billx-guest` | "Trying without an account" flag (cloud site only) |

One business is one JSON object:

```text
{
  settings:  business name, address, GSTIN, UPI ID, logo, tax mode, numbering,
             invoice design, labels, custom fields, Quick Bill (tables, receipt)
  clients:   [ { id, name, phone, email, address, GSTIN, state, custom fields } ]
  items:     [ { id, code, name, rate, tax, category, unit, HSN, sold } ]
  docs:      [ { id, type (invoice/quote/receipt/…), number, date, status,
                 client snapshot, items[], payments[], fields{ table, … } } ]
}
```

A browser can keep about 5 MB this way: roughly 5,000–10,000 bills, depending on
their size.

**Risk to explain to customers:** if they clear browser data, change the phone or
use private/incognito mode, the bills are gone. They should use **Settings →
Download backup** every week. The backup is a JSON file that **Settings →
Restore backup** reads back. Cloud mode removes this risk.

## 2. Cloud mode: Google Firebase (Firestore)

Turned on by adding a Firebase config (see `docs/BILLX_LAUNCH.md`). Database layout:

```text
accounts/{accountId}                    plan, status, trial start, paidUntil, team emails, limits
  workspaces/{businessId}               settings of one business
    clients/{id}                        one document per client
    items/{id}                          one document per item / menu dish
    docs/{id}                           one document per invoice, quote, receipt, held order
users/{uid}                             which account a login belongs to (owner or staff)
paymentRequests/{id}                    "I paid ₹X by UPI, ref …": waits for your approval in /admin
private/payment                         your payee / UPI / bank details (see below)
admins/{uid}                            who can open /admin (you)
```

Security rules (`billx/firestore.rules`, tested by `npm run test:billx-rules`):

- Customers read and write **only their own account**. Staff need an email the
  owner added and a verified email address.
- After the trial or paid period (plus 3 days' grace) the account becomes
  **read-only**: the customer can still see and download everything but cannot
  add bills until they pay.
- Nobody but an admin can change a plan, the paid-until date or user limits.
- Payment requests can be created by the customer, but only an admin can
  approve them.

The browser also keeps a cached copy under `billx-cloud:<accountId>:…`, so
billing keeps working when the internet drops.

**Firebase free tier (Spark plan):** 1 GB stored, 50,000 reads and 20,000
writes a day. One bill is one write, so this covers hundreds of active shops
before it costs anything. After that, pay-as-you-go is a few hundred rupees a
month.

## 3. Your payment details (bank / UPI / GPay)

- They are **not** in the code, the GitHub repository or the website files.
- In cloud mode you enter them once in **/admin → Payment details (private)**.
  They are saved in Firestore at `private/payment`.
- The security rules allow only **signed-in users with a verified email** to read
  that one record, on the payment page, when they are about to pay you. Nobody
  can list or change it except an admin.
- In free mode (now) the payment page shows a **"Get payment details on
  WhatsApp"** button instead, so the details are only ever sent by you,
  person to person.

## 4. Hosting and code

| Part | Where | What it stores |
|---|---|---|
| Website and app files | Cloudflare Pages, project `billxsolutions` | Only static files (HTML, JS, images). No customer data. |
| Server functions (optional) | Cloudflare Pages Functions, `functions/api/*` | Nothing stored. Only used for Razorpay auto-payments. Secrets: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_PROJECT_ID`, all set as Cloudflare environment secrets, never in code. |
| Source code | GitHub repository | Code only. No customer data, no bank details. |

## 5. What a customer sees in "Open orders" (Quick Bill)

A held restaurant order is an ordinary invoice with `pos: true`, status
`draft`, and `fields.table` set to the table/room/chair number. When it is paid
it becomes `sent` with a payment (Cash, UPI or Card) attached. Cancelled
orders are kept with status `cancelled` so the day's records stay complete.
Each item's `sold` count grows with every bill, which is how the **Popular**
tab knows what to show first.
