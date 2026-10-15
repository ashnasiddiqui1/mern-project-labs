# ShopKart — Full-Stack E-Commerce Application (Clone Edition)

A self-contained, full-stack MERN (MongoDB, Express, React, Node.js) e-commerce web platform featuring real-time inventory management, responsive product catalog with live search and category filtering, user authentication, customer wishlists, shopping bag workflows, and complete Razorpay Test Mode checkout verification.

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Implemented Features](#2-implemented-features)
3. [Technology Stack](#3-technology-stack)
4. [Folder Structure](#4-folder-structure)
5. [Prerequisites](#5-prerequisites)
6. [Backend Installation & Configuration](#6-backend-installation--configuration)
7. [Frontend Installation & Configuration](#7-frontend-installation--configuration)
8. [Environment Variables Guide](#8-environment-variables-guide)
9. [Database Setup & Seeding](#9-database-setup--seeding)
10. [Starting the Application](#10-starting-the-application)
11. [Frontend-to-Backend Integration](#11-frontend-to-backend-integration)
12. [Razorpay Test Mode Verification Workflow](#12-razorpay-test-mode-verification-workflow)
13. [Known Limitations & Setup Notes](#13-known-limitations--setup-notes)

---

## 1. Application Overview

ShopKart is an independent e-commerce web application engineered to demonstrate full lifecycle online retail shopping. Customers can create accounts, securely log in via HTTP-only JWT cookies, explore a catalog with real-time stock indicators, add items to a persistent wishlist or cart, proceed to a validated checkout form, and complete mock payments through Razorpay's Test Mode. 

Upon successful payment verification via server-side HMAC SHA256 cryptographic signatures, customer orders are immutably archived, inventory is deducted atomically, and shopping carts are cleared.

---

## 2. Implemented Features

### Authentication & Account Management
- **Customer Registration**: New user signup validating full name, unique email, 6+ character password, and phone number with bcrypt hashing (salt rounds: 10).
- **Secure Session Login**: Cookie-based authentication issuing JSON Web Tokens (JWT) stored in HTTP-only cookies (`token`, 24-hour expiration).
- **Profile Inspection**: Authenticated `GET /customers/me` endpoint powering dynamic user greetings, customer dashboard, and checkout autofill.
- **Session Logout**: Secure cookie invalidation with `POST /customers/logout`.

### Product Catalog & Live Search
- **Product Listing**: Dynamic inventory browsing showing title, pricing, category pill, high-resolution thumbnail, and remaining stock.
- **Live Search & Category Filtering**: Case-insensitive substring search by product name with single-click category filters (`Electronics`, `Fashion`, `Books`, `Home`).
- **Product Details Page**: Dedicated view displaying deep product descriptions, stock meter, category badge, and interactive quantity adjusters.

### Wishlist (Saved Items)
- **Customer Wishlist**: Save favorite items with persistent database references.
- **One-Click Toggle**: Toggle products in/out of wishlist directly from product cards or details views.
- **Move to Bag**: Transfer items from wishlist into the active shopping cart with one click.

### Shopping Bag & Live Inventory Controls
- **Stock-Bounded Quantity Controls**: Quantity increment/decrement buttons automatically enforce available inventory limits.
- **Line-Item Breakdown**: Real-time calculation of item subtotals and overall order grand total.
- **Stock Depletion Guards**: Prevents customers from requesting more units than currently stocked in MongoDB.

### Checkout & Razorpay Test Mode Payment
- **Shipping Address Form**: Full delivery address input with client & server-side validation:
  - Recipient Full Name
  - Phone Number (valid numeric string, 10–15 digits)
  - Address Line / Street Details
  - City & State
  - Pincode (strictly validated 6-digit numeric pattern)
- **Server-Side Order Initialization**: Creates a pending order in MongoDB and initiates a paired Razorpay Order via the official Razorpay SDK with INR paise conversion.
- **Razorpay Modal Checkout**: Client opens the responsive Razorpay Test modal prefilled with user details.
- **HMAC SHA256 Signature Verification**: Cryptographically computes `razorpay_order_id + '|' + razorpay_payment_id` against `RAZORPAY_KEY_SECRET`.
  - **Success**: Status updated to `PAID` / `PLACED`, stock decremented, cart cleared, redirects to `/order-success/:id`.
  - **Failure / Dismissal**: Order updated to `FAILED`, stock untouched, cart preserved.

### Order Tracking & History
- **Order History Listing (`/orders`)**: Chronological listing of past orders with status badges (`PAID`, `FAILED`, `PENDING`), item thumbnails, and totals.
- **Itemized Order Invoice (`/orders/:id`)**: Detailed receipt showing snapshot item prices (immutable to future catalog price changes), shipping destination, and Razorpay payment ID.
- **Order Success Confirmation (`/order-success/:id`)**: Celebratory receipt view with the assigned order reference.

---

## 3. Technology Stack

### Frontend Application (`Frontend/`)
- **Framework**: React 19 (`react`, `react-dom`)
- **Build Tool**: Vite 8 (`vite`, `@vitejs/plugin-react`)
- **Routing**: React Router v7 (`react-router-dom`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`, `tailwindcss`)
- **HTTP Client**: Axios (`axios`, configured with `withCredentials: true`)
- **Typography**: Plus Jakarta Sans

### Backend Application (`Backend/`)
- **Runtime**: Node.js (ES Modules, `"type": "module"`)
- **Server Framework**: Express 5 (`express`)
- **Database Engine**: MongoDB with Mongoose 9 (`mongoose`)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcrypt` (10 rounds), `cookie-parser`
- **Security & CORS**: `cors` (credentialed origins)
- **Payment Gateway**: Razorpay Node.js SDK (`razorpay`)
- **Environment**: `dotenv`

---

## 4. Folder Structure

```text
Clone/
├── README.md                          # Comprehensive project documentation
├── .gitignore                         # Project git ignore specification
│
├── Frontend/                          # Complete React 19 + Vite frontend
│   ├── .env.example                   # Frontend environment template
│   ├── index.html                     # HTML5 entry template
│   ├── package.json                   # Frontend dependencies & scripts
│   ├── vite.config.js                 # Vite + Tailwind build configuration
│   ├── public/                        # Static brand assets (favicon, icons)
│   └── src/
│       ├── components/
│       │   ├── FilterToolbar.jsx      # Search input & category filter pills
│       │   ├── Footer.jsx             # Informational footer & security badges
│       │   ├── Header.jsx             # Sticky responsive navigation bar
│       │   └── ProductCard.jsx        # Redesigned product card with stock badges
│       ├── context/
│       │   ├── CartContext.jsx        # Shopping cart state provider
│       │   └── WishlistContext.jsx    # Saved items state provider
│       ├── pages/
│       │   ├── Cart.jsx               # Cart inspection & order summary page
│       │   ├── Checkout.jsx           # Shipping address form & Razorpay modal
│       │   ├── Home.jsx               # Customer welcome dashboard & metrics
│       │   ├── Login.jsx              # Customer login form
│       │   ├── OrderDetails.jsx       # Itemized order invoice & status breakdown
│       │   ├── Orders.jsx             # Order history list
│       │   ├── OrderSuccess.jsx       # Payment success confirmation view
│       │   ├── ProductDetails.jsx     # Deep product showcase & bag controls
│       │   ├── Products.jsx           # Product catalog with search & filters
│       │   ├── Register.jsx           # Customer registration form
│       │   └── Wishlist.jsx           # Saved items page with move-to-bag action
│       ├── services/
│       │   └── api.js                 # Axios API instance with credentials
│       ├── App.jsx                    # Application routing switchboard
│       ├── index.css                  # Tailwind CSS styling rules
│       └── main.jsx                   # React root entry point
│
└── Backend/                           # Complete Express + Mongoose backend
    ├── .env.example                   # Backend environment template
    ├── package.json                   # Backend dependencies & scripts
    ├── server.js                      # Express app server & middleware
    ├── index.js                       # Server entry exporter
    ├── config/
    │   ├── database.js                # MongoDB Mongoose connection handler
    │   └── payment.js                 # Razorpay gateway initialization
    ├── controllers/
    │   ├── auth.controller.js         # Register, login, profile, logout handlers
    │   ├── basket.controller.js       # Cart CRUD & stock limit operations
    │   ├── catalog.controller.js      # Product listing, search, creation handlers
    │   ├── checkout.controller.js     # Razorpay order, HMAC verify, orders lookup
    │   └── savedItems.controller.js   # Wishlist addition & removal handlers
    ├── middleware/
    │   └── verifyAuth.js              # Cookie JWT authentication middleware
    ├── models/
    │   ├── customer.model.js          # Customer schema (auth, cart, wishlist)
    │   ├── order.model.js             # Order schema (items, address, payments)
    │   └── product.model.js           # Product schema (pricing, stock, category)
    ├── routes/
    │   ├── cart.routes.js             # /cart endpoints
    │   ├── customer.routes.js         # /customers endpoints
    │   ├── order.routes.js            # /orders endpoints
    │   ├── product.routes.js          # /products endpoints
    │   └── wishlist.routes.js         # /wishlist endpoints
    ├── seeds/
    │   └── seedCatalog.js             # Initial database seed script for sample items
    └── utils/
        └── authToken.js               # JWT signing helper utility
```

---

## 5. Prerequisites

Before installing and launching the application, ensure your environment meets the following specifications:

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: A free MongoDB Atlas cluster connection URI (or local `mongodb://127.0.0.1:27017/shopkart`)
- **Razorpay Account (Test Mode)**: A Razorpay account with Test API keys enabled (`rzp_test_...`)

---

## 6. Backend Installation & Configuration

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd Clone/Backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create your local `.env` configuration file from the template:
   ```bash
   cp .env.example .env
   ```

4. Populate `.env` with your credentials:
   ```env
   PORT=8002
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/shopkart?retryWrites=true&w=majority
   JWT_SECRET=your_custom_jwt_secret_phrase_here
   RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

---

## 7. Frontend Installation & Configuration

1. In a separate terminal tab or window, navigate to the frontend directory:
   ```bash
   cd Clone/Frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Optionally create your local `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
   *(Defaults to `http://localhost:8002` if omitted).*

---

## 8. Environment Variables Guide

| Variable | Scope | Description | Example Placeholder |
| :--- | :--- | :--- | :--- |
| `PORT` | Backend | Port on which the Express server listens | `8002` |
| `MONGO_URI` | Backend | MongoDB Atlas or local connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Backend | Secret key used to sign and verify session JWTs | `secret_jwt_key_123` |
| `RAZORPAY_KEY_ID` | Backend | Razorpay Test Mode Key ID | `rzp_test_XXXXXX` |
| `RAZORPAY_KEY_SECRET` | Backend | Razorpay Test Mode Key Secret | `abcdef123456...` |
| `VITE_API_BASE_URL` | Frontend | Backend base URL for Axios client | `http://localhost:8002` |

> **Security Warning**: Never commit `.env` files with real secrets to version control. The included `.gitignore` rules prevent `.env` files from being tracked.

---

## 9. Database Setup & Seeding

### 1. MongoDB Atlas Setup
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (e.g. M0 tier).
3. Under **Security > Database Access**, create a user with read/write permissions.
4. Under **Security > Network Access**, add your current IP address (or `0.0.0.0/0` for development).
5. Copy your connection string into `Clone/Backend/.env` as `MONGO_URI`.

### 2. Seeding Sample Products
To seed initial products across categories (`Electronics`, `Fashion`, `Books`, `Home`):
```bash
cd Clone/Backend
npm run seed
```
*(To wipe and overwrite existing catalog products, pass `npm run seed -- --force`).*

---

## 10. Starting the Application

### 1. Launch the Backend Server
From `Clone/Backend`:
```bash
npm run dev
```
*Or using `npm start`.* The backend starts on **`http://localhost:8002`**.
Verify that the console logs:
```text
Database connected successfully: ...
Server running on port 8002
```

### 2. Launch the Frontend Development Server
From `Clone/Frontend`:
```bash
npm run dev
```
The application will be accessible at **`http://localhost:5173`**.

---

## 11. Frontend-to-Backend Integration

- **CORS & Credentials**: The Express backend is configured with `cors({ origin: true, credentials: true })`.
- **Axios HTTP Client**: All client-side requests in `Frontend/src/services/api.js` use `withCredentials: true`, ensuring authentication cookies are automatically dispatched.
- **Base Endpoint**: Defaults to `http://localhost:8002` and can be overridden via `VITE_API_BASE_URL`.

### REST API Endpoints

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/customers/register` | Public | Create new customer account |
| `POST` | `/customers/login` | Public | Authenticate and set HTTP-only cookie |
| `GET` | `/customers/me` | Protected | Fetch authenticated profile info |
| `POST` | `/customers/logout` | Protected | Clear session cookie |
| `GET` | `/products` | Public | List products (supports `?search=&category=`) |
| `GET` | `/products/:id` | Public | Fetch product details by ID |
| `POST` | `/products` | Public | Create new catalog product |
| `GET` | `/wishlist` | Protected | Fetch user's wishlist |
| `POST` | `/wishlist/:productId` | Protected | Add item to wishlist |
| `DELETE`| `/wishlist/:productId` | Protected | Remove item from wishlist |
| `GET` | `/cart` | Protected | Fetch active cart with populated items |
| `POST` | `/cart/:productId` | Protected | Add 1 unit of product to cart |
| `PATCH`| `/cart/:productId` | Protected | Update quantity for cart item |
| `DELETE`| `/cart/:productId` | Protected | Remove item from cart |
| `POST` | `/orders/create-payment-order` | Protected | Create order & Razorpay order ID |
| `POST` | `/orders/verify-payment` | Protected | Cryptographically verify payment signature |
| `POST` | `/orders/payment-failed` | Protected | Mark order status as payment failed |
| `GET` | `/orders` | Protected | Fetch customer order history |
| `GET` | `/orders/:id` | Protected | Fetch specific order details |

---

## 12. Razorpay Test Mode Verification Workflow

1. **Sign Up & Log In**: Visit `http://localhost:5173/register`, create an account, and sign in.
2. **Add Products**: Navigate to the catalog at `/products`, browse or search items, and click **Add to Bag**.
3. **Cart Inspection**: Open `/cart` to adjust quantities (observing stock limit guards).
4. **Proceed to Checkout**: Click **Proceed to Checkout**, fill in your recipient address, valid 10-digit phone, and 6-digit pincode.
5. **Modal Trigger**: Click **Pay with Razorpay**. The Razorpay checkout modal opens.
6. **Simulating Success**:
   - In the Razorpay modal, select **Success**.
   - Razorpay issues a mock `razorpay_payment_id` and signature.
   - The backend computes the HMAC SHA256 signature against `RAZORPAY_KEY_SECRET`.
   - On match: Order status updates to `PAID` / `PLACED`, stock is deducted in MongoDB, the cart is emptied, and the browser redirects to `/order-success/:id`.
7. **Simulating Failure**:
   - In the Razorpay modal, select **Failure** or close the modal.
   - Order status transitions to `FAILED`, MongoDB product stock is unaffected, and cart items remain intact.
8. **View History**: Visit `/orders` to inspect your placed orders and click **View Full Order Details** for receipts.

---

## 13. Known Limitations & Setup Notes

- **Razorpay Test Keys Required**: To test checkout transactions, valid Razorpay Test Mode keys (`RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`) must be provided in `Clone/Backend/.env`.
- **Database Connectivity**: An active MongoDB connection (Atlas or local) is required for authentication, products, cart persistence, and orders.
- **Browser Cookies**: Because authentication relies on HTTP-only cookies across ports (`localhost:5173` to `localhost:8002`), ensure your browser allows local third-party / localhost session cookies.
