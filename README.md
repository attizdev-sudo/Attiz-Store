This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 📦 Order Tracking & Shiprocket API Controls

ATTIZ Store supports two modes for order tracking and status updates:

### 1. Manual Admin Tracking Mode (Currently Active)
In this mode:
- Live Shiprocket Tracking API calls are paused (`ENABLE_SHIPROCKET_TRACKING=false`).
- External Shiprocket webhooks are blocked from overriding the order status.
- Order tracking timeline (`Confirmed` → `Packed` → `Dispatched` → `Shipped / In Transit` → `Delivered`) is **100% controlled manually by the admin** from the Admin Panel (`/admin` → **Orders** tab).
- Whenever an admin changes an order status in the Admin Panel dropdown, the customer's Order Details page (`/orders/[id]`) and Orders list (`/orders`) update immediately.

### 2. How to Undo & Re-enable Live Shiprocket Tracking

When you are ready to switch back to automated tracking from Shiprocket's courier API:

1. Open your `.env` (or production environment variables on Vercel / hosting provider).
2. Find `ENABLE_SHIPROCKET_TRACKING`:
   ```env
   ENABLE_SHIPROCKET_TRACKING=true
   ```
   *(Change `false` to `true`, or remove the line as it defaults to enabled)*.
3. Restart your Next.js development server (or trigger a redeploy if in production):
   ```bash
   npm run dev
   ```
4. Once re-enabled:
   - Clicking **"Tracking Details"** on any order page will fetch live courier tracking, AWB checkpoint history, and courier EDD from Shiprocket.
   - Shiprocket webhooks (`/api/webhooks/shiprocket`) will resume syncing real-time courier scan events into the database automatically.
 
  
