# Grove Market storefront

A mobile-first organic grocery shop built with the Next.js App Router, JavaScript, Tailwind CSS and Framer Motion. It runs alongside the separate Grove Market backend.

## Run locally

1. Use Node.js 22.13 or later on the 22.x line. Set up and start the backend first. Run its seed command to load the 16 sample groceries.
2. From the folder containing this package.json, run the following commands.

~~~sh
cp .env.example .env.local
npm ci
npm run dev
~~~

3. In an existing `.env.local`, update `API_ORIGIN=http://localhost:8000`. Restart Next.js and open http://localhost:3000. The storefront forwards its `/api` requests to the backend on port 8000. For a production build, run `npm run build` followed by `npm start`.

## Deploy to Vercel

Import the frontend and backend into **two separate Vercel projects**. Select the folder containing the relevant package.json as each project's root. Choose the Next.js preset for this project and select Node.js 22.x.

| Frontend environment variable | Example or purpose |
| --- | --- |
| API_ORIGIN | Exact backend origin, such as https://your-grove-api.vercel.app. Omit the trailing /api. |
| STOREFRONT_URL | Canonical public storefront origin, such as https://your-grove.vercel.app. Used for social sharing metadata. |
| NEXT_PUBLIC_SUPPORT_EMAIL, NEXT_PUBLIC_SUPPORT_PHONE, NEXT_PUBLIC_STORE_ADDRESS | Business contact details displayed in the footer and customer care page. |
| NEXT_PUBLIC_FACEBOOK_URL, NEXT_PUBLIC_INSTAGRAM_URL | Optional full URLs for your store's social profiles. |

Set the backend's FRONTEND_URL to the same storefront origin. Redeploy after entering the variables. Open `/api/health` on the storefront to check the connection. Browser requests go through the storefront's same-origin `/api/*` rewrite so the login cookie stays on the storefront domain. Payment, upload, database, email and OAuth secrets belong in the backend project.

## Main routes

| Route | Shopper or admin action |
| --- | --- |
| / | Click category banners, browse Popular picks, New arrivals and the latest stock in each category, or add a pack to the cart. |
| /all-products | Search and combine collection, category, origin, availability and organic filters. Sort by price or savings. |
| /products/[id] | Choose a pack and quantity, add to cart, buy now or read delivered-purchase reviews. |
| /cart and /checkout | Edit the cart and choose cash on delivery or the hosted SSLCOMMERZ checkout. Sign-in preserves the selected checkout and merges the guest cart. |
| /order-success/[id] | Signed-in owner's receipt, verified payment status and generated order ID. |
| /dashboard | Shopping cart, orders and purchases waiting for review. |
| /account | Sends a signed-in admin to /admin and a shopper to /dashboard. |
| /admin | Product and collection management, users, order confirmation and delivery, campaign pages. |
| /c/[slug] | Shareable campaign with a lead product, highlights, purchase controls and optional related groceries. The seed includes /c/wildflower-honey. |

## Store content

The four left-hand promo panels and six brand tiles come from the supplied screenshots. Replace the promotion files in `public/media` with your current approved offers before a public campaign. The category targets, three slide headlines and static home sections are in `components/Home.jsx`. The logo, contact links and mobile navigation are in `components/Shell.jsx`. Photographic credits and source licences are in `public/media/CREDITS.md`.

Delivery prices come from the backend. Its sample environment pairs the supplied “Free Delivery From £30” marquee copy with the actual ৳4,500 checkout threshold. Clearing DELIVERY_MARQUEE_LABEL automatically displays only the BDT threshold. Update the other marquee claims to match your store's services before launch.

