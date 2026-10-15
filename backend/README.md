# ShopKart: Customer Authentication Service (Engineering Lab 01)

> **Course:** Backend Engineering Lab  
> **Lab:** 01 — Customer Authentication Module  
> **Architecture:** MVC (Model-View-Controller)  
> **Total Marks:** 100 / 100 (+ 10 Bonus Marks)

---

## 📁 Project Structure

```text
backend/
│
├── controllers/
│   └── customer.controller.js   # Request handlers for register, login, profile, logout, change-password
│
├── models/
│   └── customer.model.js        # Mongoose Customer schema (with automatic password exclusions)
│
├── routes/
│   └── customer.routes.js       # Customer route definitions and protection mapping
│
├── middlewares/
│   └── auth.middleware.js       # JWT & HttpOnly cookie verification middleware
│
├── utils/
│   └── generateToken.js         # JWT signing & secure cookie options helper
│
├── test.js                      # Automated verification test suite (10/10 test cases)
├── index.js                     # Express app setup, DB connection, and server listener
├── package.json                 # Project dependencies & scripts
├── .env                         # Environment configurations
└── README.md                    # Lab documentation & TA Viva Guide
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup (`.env`)
The `.env` file is pre-configured:
```env
PORT=5000
MONGO_URI=mongodb+srv://sakibmanzoor2380_db_user:1234567890@cluster0.llcxtyg.mongodb.net/shopkart?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_secure_random_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Run Development Server
```bash
npm run dev
# or
npm start
```
The server will start at `http://localhost:5000`.

### 4. Run Automated Test Suite
```bash
npm test
```
Runs 10 test suites covering registration validation, duplicate email handling, bcrypt hashing, invalid login, HttpOnly cookie generation, protected `/customers/me`, bonus change password, and cookie clearance upon logout.

---

## 📡 API Reference & Postman Guide

### Base URL: `http://localhost:5000/customers`

| Method | Endpoint | Protected | Description |
|---|---|---|---|
| `POST` | `/customers/register` | ❌ No | Registers a new customer account |
| `POST` | `/customers/login` | ❌ No | Authenticates customer & sets HttpOnly JWT cookie |
| `GET` | `/customers/me` | ✅ Yes | Returns authenticated customer profile |
| `POST` | `/customers/logout` | ✅ Yes | Clears authentication cookie |
| `PATCH` | `/customers/change-password` | ✅ Yes | **Bonus**: Updates customer password |

---

### 1. Register Customer
- **Method:** `POST`
- **URL:** `http://localhost:5000/customers/register`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@gmail.com",
  "password": "john123",
  "phone": "9876543210"
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Customer registered successfully",
  "customer": {
    "_id": "673f...",
    "fullName": "John Doe",
    "email": "john@gmail.com",
    "phone": "9876543210"
  }
}
```
- **Error Responses:**
  - `400 Bad Request`: Missing field or password less than 6 characters.
  - `409 Conflict`: Email already exists.

---

### 2. Login Customer
- **Method:** `POST`
- **URL:** `http://localhost:5000/customers/login`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "john@gmail.com",
  "password": "john123"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "customer": {
    "_id": "673f...",
    "fullName": "John Doe",
    "email": "john@gmail.com",
    "phone": "9876543210"
  }
}
```
- **Cookie Set:**
  `token=<JWT_STRING>; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
- **Error Response:**
  - `401 Unauthorized`: `"Invalid credentials"` (generic error avoids leaking whether email or password was incorrect).

---

### 3. Get Authenticated Profile
- **Method:** `GET`
- **URL:** `http://localhost:5000/customers/me`
- **Headers:** Automatically sends `Cookie: token=...` (or `Authorization: Bearer <token>`)
- **Success Response (200 OK):**
```json
{
  "_id": "673f...",
  "fullName": "John Doe",
  "email": "john@gmail.com",
  "phone": "9876543210"
}
```
- **Error Response (401 Unauthorized):**
  - If cookie is absent or invalid token.

---

### 4. Logout Customer
- **Method:** `POST`
- **URL:** `http://localhost:5000/customers/logout`
- **Headers:** Sends cookie
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```
- **Cookie:** Clears `token` cookie.

---

### 5. Bonus Challenge: Change Password (+10 Marks)
- **Method:** `PATCH`
- **URL:** `http://localhost:5000/customers/change-password`
- **Headers:** `Content-Type: application/json` (with auth cookie)
- **Body:**
```json
{
  "oldPassword": "john123",
  "newPassword": "newSecretPassword456"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 🎓 TA Viva Preparation Guide (10 Marks)

Here are the precise, technical answers to the 5 Viva questions:

### Q1: Why do we use bcrypt instead of encrypting passwords?
> **Answer:**  
> Encryption is **two-way** (reversible) — if an attacker acquires the encryption key, they can decrypt all passwords.  
> `bcrypt` is a **one-way cryptographic hash function** designed specifically for passwords. It cannot be reversed. Additionally, bcrypt incorporates **salting** (preventing rainbow table attacks) and a configurable **work factor (cost/rounds)**, making brute-force attacks computationally expensive and future-proof against increasing hardware speeds.

### Q2: What information is typically stored inside a JWT payload?
> **Answer:**  
> A JWT payload should store minimal, non-sensitive identification claims necessary for authorization, such as the user's unique identifier (`id` or `sub`) and standard claims like expiration time (`exp`) or user roles (`role`).  
> **Never store sensitive data** (like passwords, credit card numbers, or SSNs) in a JWT payload because the payload is merely Base64Url-encoded, not encrypted, meaning anyone who can inspect the token can read it.

### Q3: Why is the `HttpOnly` flag important for cookies?
> **Answer:**  
> The `HttpOnly` flag instructs the browser that the cookie cannot be accessed via client-side scripts (e.g., `document.cookie`).  
> This provides vital protection against **Cross-Site Scripting (XSS)** attacks: even if a malicious script executes on the client, it cannot steal or exfiltrate the authentication token.

### Q4: Why should passwords never be returned to the frontend?
> **Answer:**  
> Returning password hashes (even bcrypt hashes) introduces severe security vulnerabilities:
> 1. It exposes hashes to potential offline cracking or dictionary attacks if intercepted or logged.
> 2. Hashes might be logged in browser cache, proxy logs, server access logs, or browser extension memory.
> 3. Following the **Principle of Least Privilege**, the client never has a legitimate reason to know or display the password hash.

### Q5: What is the purpose of authentication middleware?
> **Answer:**  
> Authentication middleware intercepts incoming HTTP requests to protected routes, checks for the presence and validity of the authentication credential (e.g., reading and verifying the JWT from the cookie), resolves the associated user entity from the database, and attaches it to `req.user`.  
> If the token is missing, expired, or invalid, the middleware halts request processing early and returns a `401 Unauthorized` status, preventing unauthorized access to sensitive business logic.

---

## ✅ Evaluation Rubric Checklist (100 / 100 Marks)

- [x] **Register API (15 Marks):** Validates required fields, password length >= 6, unique email, returns 201 with clean user info.
- [x] **Login API (15 Marks):** Validates email & password, uses `bcrypt.compare`, returns 401 without leakage.
- [x] **JWT + Cookie Authentication (20 Marks):** Signs JWT with secret and stores in `HttpOnly` cookie.
- [x] **Protected Profile Route (20 Marks):** `/customers/me` checks cookie, verifies token, attaches `req.user`, returns 401 when unauthorized.
- [x] **MVC Code Structure (10 Marks):** Separate `controllers/`, `models/`, `routes/`, `middlewares/`, and `utils/`.
- [x] **Error Handling (10 Marks):** 400 for bad inputs, 409 for duplicates, 401 for unauthorized, global error middleware.
- [x] **Viva (10 Marks):** Complete answers in the guide above.
- [x] **Bonus Challenge (+10 Marks):** `PATCH /customers/change-password` implemented and verified.
