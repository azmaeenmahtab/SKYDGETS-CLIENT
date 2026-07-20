# SKYDGETS — Client

**Buy and sell secondhand gadgets with confidence.** SKYDGETS is a full-stack gadget resale marketplace built around AI-assisted listing creation and an intelligent shopping assistant — not just another storefront template.

This repository is the **frontend** — Next.js 15, TypeScript, HeroUI v3. The backend/API lives in a separate repository ([link here]).

---

## ✨ AI-Powered Features

### 🧠 AI Smart Listing Assistant
Upload a few photos of a gadget and a short note, and the assistant does the rest:
- **Vision analysis** — detects the device, its condition, and visible defects
- **Auto-classification** — matches it to the right category and fills in category-specific specs (storage, brand, condition grade, etc.)
- **Copy generation** — writes an honest, accurate title and description
- **Price suggestion** — checks your own existing catalog for comparable listings and suggests a fair price range

Nothing publishes automatically — every AI-generated field is editable on a review screen before it becomes a live listing.

### 💬 AI Chat Assistant
A shopping assistant embedded on every page, backed by a real tool-calling agent rather than canned responses:
- Searches the live product catalog by budget, category, or keyword
- Checks order status for the logged-in user (with proper ownership checks — it won't leak someone else's order)
- Recommends gadgets based on stated budget or use case
- Streams responses token-by-token, with suggested follow-up questions after each answer

---

## 🛍️ Core Features

- Browse/search/filter/sort the full catalog with pagination
- Product details with dynamic specs per category, ratings, and reviews
- Cart that works for guests and persists across sessions once logged in
- Checkout with Cash on Delivery (bKash/Nagad wired in as upcoming payment methods)
- Order history with a live status timeline
- Email/password **and** Google sign-in, with a one-click demo login
- Verified-purchase reviews (only customers who received the item can review it)
- Admin tools: manual product add/edit, AI listing draft review queue, order management

---

## 🧱 Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling / UI | Tailwind CSS + HeroUI v3 |
| Server state | TanStack Query |
| Client state | React Context (split state/dispatch for cart) |
| Auth | Better Auth (email/password + Google OAuth), JWT bridge to the API |
| AI | Gemini API (multimodal + tool-calling), consumed via the backend only |

---

## 📁 Project Structure

```
app/
├── (public)/          # home, products, product details, cart, checkout, login, register, about, contact
├── (protected)/       # items/add, items/manage, orders, profile — requires auth
├── admin/             # AI listing drafts, order management
└── api/auth/[...all]/ # Better Auth handler

components/            # layout, products, chat, admin, forms, common
contexts/               # Auth, Cart (split state/dispatch)
lib/                    # api client, query client, site config, validators
hooks/                  # useProducts, useCart, useAuth, useChatSession
types/                  # shared TypeScript interfaces
```

---

## 🚀 Getting Started

```bash
git clone <this-repo-url>
cd skydgets-client
npm install
```

Create `.env.local` from the template below:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
BETTER_AUTH_SECRET=<generate a random 32+ character string>
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
```

```bash
npm run dev
```

The app runs on [http://localhost:3000](http://localhost:3000). The backend must be running separately — see that repo's README.

---

## 🔗 Related

- **Backend/API repo:** [link here]
- **Live site:** [link here once deployed]

---

## 📄 License

This project was built as a full-stack + agentic AI web development assignment, and now doubles as a real product. All rights reserved by the author.
