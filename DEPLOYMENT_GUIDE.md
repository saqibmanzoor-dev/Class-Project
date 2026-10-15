# 🚀 ShopKart Vercel Deployment Guide

This guide walks you through deploying both the **ShopKart Backend API** and **Frontend Web Application** on **Vercel** with full serverless database connection pooling, cross-origin cookies/tokens, and SPA routing.

---

## 🏗️ Architecture Overview

| Component | Technology | Vercel Deployment Role | Root Directory |
|---|---|---|---|
| **Backend API** | Node.js + Express + MongoDB Atlas | Serverless Function (`api/index.js`) | `backend` |
| **Frontend App** | Vite + React 19 + Vanilla CSS | Static SPA with client-side rewrites | `./` (Root) |

---

## 🛠️ Step 1: Deploy Backend API on Vercel

1. Log into your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** ➔ **"Project"**.
2. Select your repository: **`saqibmanzoor-dev/Class-Project`**.
3. In the project setup screen:
   - **Project Name**: `shopkart-backend` (or your preferred name)
   - **Framework Preset**: Select **Other**
   - **Root Directory**: Click *Edit* and select **`backend`**
4. Expand **Environment Variables** and add the following:

| Variable Name | Example / Recommended Value | Description |
|---|---|---|
| `MONGO_URI` | `mongodb+srv://sakibmanzoor2380_db_user:1234567890@cluster0.llcxtyg.mongodb.net/shopkart?retryWrites=true&w=majority` | MongoDB Atlas Connection String |
| `JWT_SECRET` | `shopkart_super_secret_jwt_key_2026` | Secret key for signing customer JWTs |
| `JWT_EXPIRES_IN` | `7d` | Token expiration duration |
| `NODE_ENV` | `production` | Enables secure SameSite=None cookies |
| `FRONTEND_URL` | *(Leave blank for initial deploy, update in Step 3)* | Allowed CORS origin |
| `RAZORPAY_KEY_ID` | `rzp_test_TnklksqUZUXtLR` | Razorpay Test Mode Key ID |
| `RAZORPAY_KEY_SECRET` | `w0KxCFXF9wQv15HTMJXxRHwZ` | Razorpay Test Mode Secret |

5. Click **"Deploy"**.
6. Once deployed, note down your production API URL (e.g., `https://shopkart-backend.vercel.app`).
   - You can verify it immediately by visiting `https://shopkart-backend.vercel.app/` in your browser. You should see:
   ```json
   {
     "success": true,
     "message": "ShopKart API is running 🚀",
     "database": "connected",
     "timestamp": "2026-10-15T..."
   }
   ```

---

## 💻 Step 2: Deploy Frontend on Vercel

1. In your [Vercel Dashboard](https://vercel.com/dashboard), click **"Add New..."** ➔ **"Project"**.
2. Select the **same repository**: **`saqibmanzoor-dev/Class-Project`**.
3. In the project setup screen:
   - **Project Name**: `shopkart` (or your preferred frontend name)
   - **Framework Preset**: **Vite** (automatically detected)
   - **Root Directory**: Leave as **`./`** (the repository root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:

| Variable Name | Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://shopkart-backend.vercel.app` *(from Step 1, without trailing slash)* | Backend API endpoint |
| `VITE_RAZORPAY_KEY_ID` | `rzp_test_TnklksqUZUXtLR` | Razorpay Test Key |

5. Click **"Deploy"**.
6. Once deployed, note your frontend URL (e.g., `https://shopkart-client.vercel.app`).

---

## 🔄 Step 3: Link Backend to Frontend (CORS Optimization)

1. Return to your **`shopkart-backend`** project on Vercel.
2. Go to **Settings** ➔ **Environment Variables**.
3. Add or update `FRONTEND_URL`:
   - `FRONTEND_URL` = `https://shopkart-client.vercel.app`
4. Go to **Deployments** tab and click **"Redeploy"** on the latest deployment to apply the new variable.

---

## ⚡ Alternative: Deploy via Vercel CLI

If you prefer deploying from your terminal:

```bash
# 1. Log in to Vercel
npx vercel login

# 2. Deploy Backend
cd backend
npx vercel --prod
# Follow the prompts to configure project name: shopkart-backend

# 3. Deploy Frontend
cd ..
npx vercel --prod
# Follow prompts to configure project name: shopkart-frontend
```

---

## ✅ Deployment Checklist & Verification

- [ ] **Health Check**: Visit `https://your-backend.vercel.app/` — should show `"database": "connected"`.
- [ ] **Registration & Login**: Create a new customer account or log in with `postman@shopkart.com` / `Password123!`.
- [ ] **Customer Profile Pop-up**: Click user chip in navbar; profile modal should load personal details and order metrics.
- [ ] **Wishlist & Cart**: Add products to cart and wishlist; ensure persistence.
- [ ] **Razorpay Checkout**: Test Razorpay payment flow in Test Mode.
- [ ] **Page Refresh (SPA Routing)**: Refresh on `/cart` or `/orders` — verify no 404 errors appear.
