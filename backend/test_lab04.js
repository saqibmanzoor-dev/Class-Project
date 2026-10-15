require("dotenv").config({ path: "./.env" });
const axios = require("axios");

const BASE_URL = "http://127.0.0.1:5000";

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let token = "";
let testProductId = "";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runTests() {
  console.log("🧪 Starting ShopKart Lab 04 Wishlist Test Suite...\n");

  try {
    // 1. Login user
    const loginRes = await client.post("/customers/login", {
      email: "postman@shopkart.com",
      password: "Password123!",
    });
    token = loginRes.data.token;
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log(`Log in as: ${loginRes.data.customer.fullName}\n`);

    // 2. Fetch a product to test with
    const productsRes = await client.get("/products");
    assert(productsRes.data.products.length > 0, "Products exist in database");
    testProductId = productsRes.data.products[0]._id;
    console.log(`Using Test Product: ${productsRes.data.products[0].name} (${testProductId})\n`);

    // 3. Clear wishlist initially if already added
    try {
      await client.delete(`/wishlist/${testProductId}`);
    } catch (e) {
      // ignore if not present
    }

    // 4. Test Unauthenticated request to /wishlist
    console.log("[Test 1] Testing Unauthenticated /wishlist access...");
    const unauthClient = axios.create({ baseURL: BASE_URL });
    try {
      await unauthClient.get("/wishlist");
      assert(false, "Unauthenticated request should have failed");
    } catch (err) {
      assert(err.response.status === 401, "Unauthenticated request returns 401 Unauthorized");
    }

    // 5. Test Add Product to Wishlist (Task 2)
    console.log("\n[Test 2] Testing Add Product to Wishlist (POST /wishlist/:productId)...");
    const addRes = await client.post(`/wishlist/${testProductId}`);
    assert(addRes.status === 200 || addRes.status === 201, "Add to wishlist returns 200/201");
    assert(addRes.data.success === true, "Add to wishlist returns success: true");

    // 6. Test Duplicate Prevention (409 Conflict)
    console.log("\n[Test 3] Testing Duplicate Wishlist Prevention (POST /wishlist/:productId)...");
    try {
      await client.post(`/wishlist/${testProductId}`);
      assert(false, "Duplicate add should have failed with 409");
    } catch (err) {
      assert(err.response.status === 409, "Duplicate add returns 409 Conflict");
      assert(err.response.data.message === "Product already in wishlist", "Correct conflict message returned");
    }

    // 7. Test Invalid Product ID validation (400 Bad Request)
    console.log("\n[Test 4] Testing Invalid Product ID validation...");
    try {
      await client.post("/wishlist/invalid_id_123");
      assert(false, "Invalid ID should have failed with 400");
    } catch (err) {
      assert(err.response.status === 400, "Invalid ObjectId returns 400 Bad Request");
    }

    // 8. Test Non-existent Product ID validation (404 Not Found)
    console.log("\n[Test 5] Testing Non-existent Product ID...");
    try {
      await client.post("/wishlist/60d5ec49f1b2c8b1f8e4e1a0");
      assert(false, "Non-existent product should have failed with 404");
    } catch (err) {
      assert(err.response.status === 404, "Non-existent product returns 404 Not Found");
    }

    // 9. Test Get Wishlist with populate (Task 3)
    console.log("\n[Test 6] Testing Get Wishlist (GET /wishlist)...");
    const getRes = await client.get("/wishlist");
    assert(getRes.status === 200, "Get wishlist returns 200 OK");
    assert(getRes.data.success === true, "Get wishlist returns success: true");
    assert(Array.isArray(getRes.data.wishlist), "wishlist field is an array");
    const foundItem = getRes.data.wishlist.find((p) => p._id === testProductId);
    assert(foundItem !== undefined, "Added product is present in wishlist");
    assert(foundItem.name !== undefined, "Product is populated with name");
    assert(foundItem.price !== undefined, "Product is populated with price");

    // 10. Test Remove Product from Wishlist (Task 4)
    console.log("\n[Test 7] Testing Remove Product from Wishlist (DELETE /wishlist/:productId)...");
    const removeRes = await client.delete(`/wishlist/${testProductId}`);
    assert(removeRes.status === 200, "Remove returns 200 OK");
    assert(removeRes.data.success === true, "Remove returns success: true");

    // 11. Test Remove when not in wishlist (404 Not Found)
    console.log("\n[Test 8] Testing Remove Product that is NOT in wishlist (404)...");
    try {
      await client.delete(`/wishlist/${testProductId}`);
      assert(false, "Remove non-wishlisted item should have returned 404");
    } catch (err) {
      assert(err.response.status === 404, "Removing item not in wishlist returns 404 Not Found");
    }

    // 12. Test Bonus: Toggle Wishlist Action (PATCH /wishlist/:productId/toggle)
    console.log("\n[Test 9] Testing Bonus: Toggle Wishlist Action (PATCH /wishlist/:productId/toggle)...");
    const toggle1 = await client.patch(`/wishlist/${testProductId}/toggle`);
    assert(toggle1.data.saved === true, "Toggle added product (saved = true)");

    const toggle2 = await client.patch(`/wishlist/${testProductId}/toggle`);
    assert(toggle2.data.saved === false, "Toggle removed product (saved = false)");

    console.log("\n🎉 ALL LAB 04 WISHLIST TESTS PASSED SUCCESSFULLY! (100/100)\n");
  } catch (err) {
    console.error("Test failed:", err.message);
    process.exit(1);
  }
}

runTests();
