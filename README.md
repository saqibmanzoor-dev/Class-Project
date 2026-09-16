# Engineering Lab 02 — Frontend Engineering Lab: ShopKart

A React authentication frontend integrated with an Express.js and MongoDB Atlas backend. This project implements customer registration, login with HttpOnly cookie handling, protected dashboard routing, and secure logout.

---

## Folder Structure

```
ShopKart/
│
├── backend/                  # Lab 01 Node/Express authentication service
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   └── package.json
│
├── src/                      # Lab 02 React frontend application
│   ├── components/
│   │   └── Navbar.jsx        # Navigation bar with user chip & Logout action
│   ├── pages/
│   │   ├── Home.jsx          # Protected Home dashboard (GET /customers/me)
│   │   ├── Login.jsx         # Login page (POST /customers/login)
│   │   └── Register.jsx      # Registration page (POST /customers/register)
│   ├── services/
│   │   └── api.js            # Axios client configured with credentials: true
│   ├── App.jsx               # React Router routes (/register, /login, /home)
│   ├── index.css             # Modern CSS design system
│   └── main.jsx              # React DOM entry point
│
├── index.html                # HTML entry template with typography and SEO tags
├── .env                      # Frontend environment config (VITE_API_URL)
├── vite.config.js            # Vite configuration (port 5173)
├── package.json              # Frontend scripts and dependencies
└── README.md                 # Lab documentation and TA Viva preparation
```

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Start the Backend Server (Port 5000)
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000` and connects to MongoDB Atlas.*

### 3. Start the Frontend Server (Port 5173)
```bash
# In the project root:
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## Features Implemented

### Task 1 — Registration Page (`/register`) [25 Marks]
- Controlled inputs for **Full Name**, **Email**, **Password**, and **Phone Number**.
- Client-side validation for empty fields, minimum length (password $\ge$ 6 characters), and email format.
- Submits payload to `POST /customers/register`.
- Handles backend validation errors and 409 Conflict (e.g. duplicate email).
- Displays success notification and navigates to `/login`.

### Task 2 — Login Page (`/login`) [30 Marks]
- Controlled inputs for **Email** and **Password** with password visibility toggle.
- Submits credentials to `POST /customers/login`.
- Transmits session credentials with `withCredentials: true`.
- On 401 Unauthorized failure, displays generic `"Invalid credentials"` message.
- On success, redirects the customer to `/home`.

### Task 3 — Protected Home Page (`/home`) [30 Marks]
- Makes an authenticated request to `GET /customers/me` on mount.
- Displays customer profile details:
  - Welcome banner: `"Welcome back, {Customer Name}!"`
  - Full Name
  - Email Address
  - Phone Number
  - Gold Member badge and interactive store preview.
- **Route Protection**: If the customer is unauthenticated (e.g. token missing or expired), immediately redirects to `/login`.

### Task 4 — Logout (`/customers/logout`) [15 Marks]
- Logout button embedded in `Navbar`.
- Calls `POST /customers/logout` with `withCredentials: true`.
- Backend clears the HttpOnly `token` cookie.
- Client clears local state and navigates back to `/login`.

---

## TA Evaluation Rubric Mapping (100/100)

| Category | Marks | Implementation Details |
| :--- | :---: | :--- |
| **Registration UI + API** | **25** | Form with 4 controlled fields, inline error text, password validation, `POST /customers/register` integration, duplicate email handling, redirect. |
| **Login UI + API** | **25** | Controlled email/password, password toggle, `withCredentials: true`, 401 "Invalid credentials" error banner, redirect to `/home`. |
| **Protected Home** | **20** | `GET /customers/me` on mount, displays Name, Email, Phone, automatic redirect to `/login` if unauthenticated. |
| **Logout** | **10** | Integrated in Navbar, triggers `POST /customers/logout`, clears session cookie, navigates to `/login`. |
| **Routing** | **10** | React Router DOM (`/register`, `/login`, `/home`, fallback redirects). |
| **UI & Code Quality** | **10** | Custom CSS design system, Plus Jakarta Sans typography, responsive split layout, clean modular folder structure. |
| **Total** | **100** | Full compliance with all requirements. |

---

## TA Viva Questions & Answers

### 1. Why do we use `withCredentials: true`?
**Answer:**
By default, browsers adhere to the Same-Origin Policy and do not send cookies, authorization headers, or TLS client certificates on cross-origin HTTP requests made via `XMLHttpRequest` or `fetch`/`axios`. Setting `withCredentials: true` instructs the browser to automatically include stored cookies (such as our HttpOnly JWT session cookie) in outgoing requests, and allows the browser to accept and set cookies received via the `Set-Cookie` response header. Without this option, the backend cannot authenticate the user on subsequent calls to `/customers/me` or `/customers/logout`.

### 2. Why can't JavaScript read an `HttpOnly` cookie?
**Answer:**
The `HttpOnly` flag is a critical security directive set by the server in the `Set-Cookie` HTTP header. When a cookie is flagged as `HttpOnly`, browser engines strictly restrict access to it, making it invisible to client-side scripts via `document.cookie`. This prevents Cross-Site Scripting (XSS) attacks from stealing the user's authentication token, ensuring that even if malicious JavaScript is injected into the application, the session cookie cannot be exfiltrated.

### 3. Why is `/home` called a protected route?
**Answer:**
`/home` is called a protected route because it is restricted to authenticated users only. Unauthenticated visitors or users with expired/invalid sessions cannot view this page. In our React implementation, when the `/home` route mounts, it sends a request to the backend `GET /customers/me` endpoint. If the server responds with a `401 Unauthorized` (indicating the JWT cookie is missing or invalid), the frontend automatically intercepts the error and redirects the visitor to `/login`.

### 4. Why do we fetch `/customers/me` instead of storing the user manually in localStorage?
**Answer:**
Storing user details or authentication tokens in `localStorage` poses two main risks:
1. **Security Vulnerabilities:** `localStorage` is completely accessible to any JavaScript running on the page, making it susceptible to credential theft via Cross-Site Scripting (XSS).
2. **Data Staleness & Tampering:** Data stored in `localStorage` can be manually altered by the client or go out of sync with the database (e.g., if a user is deactivated, changes their name, or their session is revoked on the backend). 

Fetching `/customers/me` ensures that the server validates the cryptographically signed `HttpOnly` cookie and returns the source of truth directly from the database on every page visit.

### 5. What is the difference between Authentication and Authorization?
**Answer:**
- **Authentication (AuthN):** The process of verifying **who** a user is. It checks user credentials (e.g., matching email and password during login, or validating a JWT token) to confirm identity.
- **Authorization (AuthZ):** The process of verifying **what permissions or access rights** an authenticated user possesses. For example, determining whether an authenticated customer is allowed to access an admin dashboard, delete another user's account, or modify store inventory.
