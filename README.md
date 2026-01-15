# My E-Commerce App

A full-stack e-commerce application built with robust modern technologies.

## 🚀 Tech Stack

### Client
-   **Core**: [React](https://react.dev/), [Vite](https://vitejs.dev/)
-   **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Forms & Validation**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
-   **Routing**: [React Router](https://reactrouter.com/)
-   **Payments**: [Stripe](https://stripe.com/)

### Server
-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express](https://expressjs.com/)
-   **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
-   **Authentication**: JWT, bcryptjs
-   **Language**: [TypeScript](https://www.typescriptlang.org/)

## 📂 Project Structure

```text
my-e-commerce-app/
├── client/         # React Frontend
└── server/         # Node.js/Express Backend
```

## 🛠️ Getting Started

### Prerequisites
-   Node.js installed
-   MongoDB instance (local or Atlas)

### 1. Setup Server
```bash
cd server
npm install
npm run dev
```
*Server runs on default port (check `server.ts` or `.env`)*

### 2. Setup Client
```bash
cd client
npm install
npm run dev
```
*Client typically runs on `http://localhost:5173`*

## 📜 Scripts

| Service | Command         | Description                |
| :------ | :-------------- | :------------------------- |
| Client  | `npm run dev`   | Start dev server           |
| Client  | `npm run build` | Build for production       |
| Server  | `npm run dev`   | Start dev server (ts-node) |
| Server  | `npm run build` | Compile TypeScript         |

## 📝 License
This project is licensed under the ISC License.

1. Identity & User APIs (IAM)
POST /api/auth/register: Naya user create karne ke liye.

POST /api/auth/login: JWT Access aur Refresh tokens generate karne ke liye.

POST /api/auth/refresh-token: Session extend karne ke liye.

GET /api/users/profile: Current logged-in user ki details fetch karne ke liye.

PUT /api/users/update: Profile picture, name, ya contact update karne ke liye.

POST /api/auth/verify-otp: Email verification ya password reset ke liye.

GET /api/admin/users: (Admin Only) Sabhi users ki list dekhne aur filter karne ke liye.

2. Product & SKU APIs (Catalog)
Yahan focus browsing aur management par hota hai.

GET /api/products: Search, filters (category, price, rating), aur pagination ke saath products fetch karna.

GET /api/products/:slug: Product ki deep details aur uske saare SKUs/Variants fetch karna.

POST /api/products: (Seller/Admin) Naya product parent create karna.

POST /api/products/:id/skus: (Seller/Admin) Specific product ke variants (Red, Blue, XL) add karna.

PUT /api/products/:id: Product description ya images update karna.

DELETE /api/products/:id: Soft delete (isDeleted: true) karne ke liye.

3. Category APIs
GET /api/categories: Full category tree fetch karne ke liye (Menus ke liye).

GET /api/categories/:slug: Specific category aur uske sub-categories fetch karna.

POST /api/categories: (Admin Only) Nayi category add karna (Pre-save hook slug handle karega).

4. Cart & Inventory APIs
GET /api/cart: User ka current cart aur bill breakdown (tax, shipping) fetch karna.

POST /api/cart/add: Item cart mein daalna (SKU ID ke saath, product ID ke saath nahi).

PATCH /api/cart/update-quantity: Quantity kam ya zyada karna.

DELETE /api/cart/item/:skuId: Cart se specific variant hatana.

GET /api/inventory/:skuId: Real-time stock availability check karna.

5. Order & Fulfillment APIs (OMS)
Yeh APIs snapshotting aur historical data handle karti hain.

POST /api/orders/checkout: Cart ko Order mein convert karna aur Inventory Reserve karna.

GET /api/orders/my-orders: User ki purchase history.

GET /api/orders/:id: Specific order ki snapshot details dekhna.

PATCH /api/admin/orders/:id/status: (Admin/Seller) Order status update karna (Processing -> Shipped -> Delivered).

POST /api/orders/:id/return: Return request initiate karna.

6. Business (Seller) APIs
POST /api/business/register: Naya seller account/shop apply karna.

GET /api/business/dashboard: Seller ki sales analytics, total orders, aur revenue dekhna.

GET /api/admin/business/pending: (Admin Only) Un-verified businesses ko review karne ke liye.

PATCH /api/admin/business/:id/verify: Business status 'active' karne ke liye.

7. Payment & Transaction APIs
POST /api/payments/create-intent: Stripe/Razorpay ka payment session start karna.

POST /api/payments/webhook: Payment gateway se response sunna (Success/Failure) aur Order status update karna.

GET /api/admin/transactions: (Admin Only) Saari financial transactions ka record dekhna.

8. Reviews & Marketing APIs
POST /api/reviews: Product par review dena (Backend check karega isVerifiedPurchase).

GET /api/products/:id/reviews: Kisi product ke saare reviews aur ratings dekhna.

POST /api/coupons/validate: Checkout ke waqt coupon code check karna.

9. System & Audit APIs (Security)
GET /api/admin/audit-logs: (Super Admin Only) System mein kisne kya change kiya uski poori history.