require("dotenv").config();
const mongoose = require("mongoose");
const { app } = require("./index");
const Customer = require("./models/customer.model");

const TEST_PORT = 5099;
let server;
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Helper to run assertions
function assert(condition, message) {
  if (!condition) {
    console.error(` FAIL: ${message}`);
    throw new Error(message);
  }
  console.log(` PASS: ${message}`);
}

async function runTests() {
  console.log("\n==========================================");
  console.log("   ShopKart Authentication Service Tests   ");
  console.log("==========================================\n");

  try {
    // 1. Connect DB and start test server
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" Connected to MongoDB for testing");

    server = app.listen(TEST_PORT);
    console.log(` Test server listening on ${BASE_URL}\n`);

    const timestamp = Date.now();
    const testEmail = `testuser_${timestamp}@shopkart.com`;
    const testPassword = "securePassword123";

    // Clean up any test user with this email if exists
    await Customer.deleteOne({ email: testEmail });

    // ----------------------------------------------------------------
    // Test 1: Task 1 - Register with missing fields should return 400
    // ----------------------------------------------------------------
    console.log("[1] Testing Registration Validation: Missing field...");
    const missingRes = await fetch(`${BASE_URL}/customers/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Incomplete User",
        email: testEmail,
        // password missing
        phone: "9876543210",
      }),
    });
    const missingData = await missingRes.json();
    assert(missingRes.status === 400, "Missing fields return 400 Bad Request");
    assert(missingData.success === false, "success: false in failure response");

    // ----------------------------------------------------------------
    // Test 2: Task 1 - Register with short password (<6 chars) should return 400
    // ----------------------------------------------------------------
    console.log("\n[2] Testing Registration Validation: Password too short...");
    const shortPassRes = await fetch(`${BASE_URL}/customers/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Short Pass User",
        email: testEmail,
        password: "123", // < 6 chars
        phone: "9876543210",
      }),
    });
    const shortPassData = await shortPassRes.json();
    assert(shortPassRes.status === 400, "Short password returns 400 Bad Request");
    assert(
      shortPassData.message.includes("6 characters"),
      "Message clarifies password requirement"
    );

    // ----------------------------------------------------------------
    // Test 3: Task 1 - Successful Customer Registration
    // ----------------------------------------------------------------
    console.log("\n[3] Testing Successful Registration...");
    const regRes = await fetch(`${BASE_URL}/customers/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "John Doe",
        email: testEmail,
        password: testPassword,
        phone: "9876543210",
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, "Registration returns 201 Created");
    assert(regData.success === true, "Registration returns success: true");
    assert(
      regData.customer && regData.customer.email === testEmail,
      "Returned customer object matches registered email"
    );
    assert(
      regData.customer.password === undefined,
      "Password is NEVER returned in register response"
    );

    // Verify bcrypt hash in MongoDB
    const savedCustomer = await Customer.findOne({ email: testEmail });
    assert(savedCustomer !== null, "Customer saved in MongoDB");
    assert(
      savedCustomer.password.startsWith("$2"),
      "Password stored in MongoDB is a valid bcrypt hash ($2...)"
    );
    assert(
      savedCustomer.password !== testPassword,
      "Raw password is NEVER stored in database"
    );

    // ----------------------------------------------------------------
    // Test 4: Task 1 - Duplicate Email Registration should return 409
    // ----------------------------------------------------------------
    console.log("\n[4] Testing Duplicate Email Registration...");
    const dupRes = await fetch(`${BASE_URL}/customers/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Another Person",
        email: testEmail,
        password: "anotherpassword123",
        phone: "9123456780",
      }),
    });
    const dupData = await dupRes.json();
    assert(dupRes.status === 409, "Duplicate email returns 409 Conflict");
    assert(dupData.message === "Email already exists", "Correct error message returned");

    // ----------------------------------------------------------------
    // Test 5: Task 2 - Login with Invalid Credentials should return 401
    // ----------------------------------------------------------------
    console.log("\n[5] Testing Login with Invalid Credentials...");
    const badLoginRes = await fetch(`${BASE_URL}/customers/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "wrongPassword999",
      }),
    });
    const badLoginData = await badLoginRes.json();
    assert(badLoginRes.status === 401, "Invalid password returns 401 Unauthorized");
    assert(
      badLoginData.message === "Invalid credentials",
      "Generic message used: does NOT reveal if email or password was incorrect"
    );

    const nonExistentEmailRes = await fetch(`${BASE_URL}/customers/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nonexistent_random_user@shopkart.com",
        password: testPassword,
      }),
    });
    assert(
      nonExistentEmailRes.status === 401,
      "Non-existent email returns 401 Unauthorized"
    );

    // ----------------------------------------------------------------
    // Test 6: Task 2 - Successful Login and HttpOnly Cookie Check
    // ----------------------------------------------------------------
    console.log("\n[6] Testing Successful Login & HttpOnly Cookie...");
    const loginRes = await fetch(`${BASE_URL}/customers/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, "Login returns 200 OK");
    assert(loginData.success === true, "Login response has success: true");

    // Check Set-Cookie header
    const rawSetCookie = loginRes.headers.get("set-cookie");
    assert(rawSetCookie !== null, "Set-Cookie header is present");
    assert(
      rawSetCookie.includes("HttpOnly"),
      "Cookie has HttpOnly flag set for security"
    );
    assert(rawSetCookie.includes("token="), "Cookie contains JWT token");

    // Extract cookie token string for subsequent requests
    const cookieToken = rawSetCookie.split(";")[0];

    // ----------------------------------------------------------------
    // Test 7: Task 3 - Protected Profile GET /customers/me without Cookie
    // ----------------------------------------------------------------
    console.log("\n[7] Testing Protected Profile without Authentication...");
    const unauthProfileRes = await fetch(`${BASE_URL}/customers/me`);
    assert(
      unauthProfileRes.status === 401,
      "Unauthenticated request to /customers/me returns 401 Unauthorized"
    );

    // ----------------------------------------------------------------
    // Test 8: Task 3 - Protected Profile GET /customers/me with Cookie
    // ----------------------------------------------------------------
    console.log("\n[8] Testing Protected Profile with Cookie...");
    const authProfileRes = await fetch(`${BASE_URL}/customers/me`, {
      headers: {
        Cookie: cookieToken,
      },
    });
    const profileData = await authProfileRes.json();
    assert(authProfileRes.status === 200, "Authenticated request returns 200 OK");
    assert(profileData.email === testEmail, "Profile contains correct email");
    assert(profileData.fullName === "John Doe", "Profile contains fullName");
    assert(profileData.phone === "9876543210", "Profile contains phone");
    assert(
      profileData.password === undefined,
      "Password is NEVER exposed in profile endpoint"
    );

    // ----------------------------------------------------------------
    // Test 9: Bonus Challenge - PATCH /customers/change-password
    // ----------------------------------------------------------------
    console.log("\n[9] Testing Bonus Challenge: Change Password...");
    const newPassword = "newSuperSecretPassword456";

    // Test with wrong old password
    const wrongOldPassRes = await fetch(`${BASE_URL}/customers/change-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieToken,
      },
      body: JSON.stringify({
        oldPassword: "incorrectOldPassword",
        newPassword: newPassword,
      }),
    });
    assert(
      wrongOldPassRes.status === 400,
      "Incorrect old password rejected with 400"
    );

    // Test with correct old password
    const changePassRes = await fetch(`${BASE_URL}/customers/change-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieToken,
      },
      body: JSON.stringify({
        oldPassword: testPassword,
        newPassword: newPassword,
      }),
    });
    const changePassData = await changePassRes.json();
    assert(changePassRes.status === 200, "Password changed successfully (200 OK)");
    assert(
      changePassData.message === "Password changed successfully",
      "Correct success message returned"
    );

    // Verify login with new password works
    const newLoginRes = await fetch(`${BASE_URL}/customers/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: newPassword,
      }),
    });
    assert(newLoginRes.status === 200, "Login with new password succeeded");

    // ----------------------------------------------------------------
    // Test 10: Task 4 - Logout POST /customers/logout
    // ----------------------------------------------------------------
    console.log("\n[10] Testing Logout...");
    const logoutRes = await fetch(`${BASE_URL}/customers/logout`, {
      method: "POST",
      headers: {
        Cookie: cookieToken,
      },
    });
    const logoutData = await logoutRes.json();
    assert(logoutRes.status === 200, "Logout returns 200 OK");
    assert(
      logoutData.message === "Logged out successfully",
      "Correct logout message returned"
    );

    const logoutSetCookie = logoutRes.headers.get("set-cookie");
    assert(
      logoutSetCookie && (logoutSetCookie.includes("token=;") || logoutSetCookie.includes("Expires=")),
      "Logout clears the auth cookie"
    );

    // Cleanup test user
    await Customer.deleteOne({ email: testEmail });
    console.log("\n🧹 Cleaned up test user from MongoDB");

    console.log("\n==========================================");
    console.log("   ALL 10 TEST SUITES PASSED (100/100)!   ");
    console.log("==========================================\n");
  } catch (err) {
    console.error("\n❌ Test execution failed:", err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
  }
}

runTests();
