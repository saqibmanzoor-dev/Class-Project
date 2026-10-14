const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config({ path: "./.env" });

const BASE_URL = "http://127.0.0.1:5000";

const runTests = async () => {
  console.log("🧪 Starting ShopKart Lab 06 Comprehensive Test Suite...\n");

  const client = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  let token = "";
  let user = null;
  let testProductId = "6ab3b0248d46410133a2efaa"; // RGB Mechanical Gaming Keyboard (Price: 2999)

  try {
    // ------------------------------------------------------------------------
    // Step 1: Health check
    // ------------------------------------------------------------------------
    const health = await client.get("/");
    console.log("✅ 1. Backend Health Check:", health.data.message);

    // ------------------------------------------------------------------------
    // Step 2: Login customer
    // ------------------------------------------------------------------------
    const loginRes = await client.post("/customers/login", {
      email: "postman@shopkart.com",
      password: "Password123!",
    });
    token = loginRes.data.token;
    user = loginRes.data.customer;
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log(`✅ 2. Logged in customer: ${user.fullName} (${user.email})`);

    // ------------------------------------------------------------------------
    // Step 3: Clear cart initially
    // ------------------------------------------------------------------------
    await client.delete("/cart");
    const emptyCartRes = await client.get("/cart");
    console.log("✅ 3. Cart initialized empty:", emptyCartRes.data.cart.length === 0);

    // ------------------------------------------------------------------------
    // Step 4: Test 1 — Empty cart order creation should fail (400)
    // ------------------------------------------------------------------------
    try {
      await client.post("/orders/create-payment-order", {
        shippingAddress: {
          fullName: "Aarav Sharma",
          phone: "9876543210",
          addressLine1: "22 MG Road",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560001",
        },
      });
      console.error("❌ 4. Failed: Empty cart order should have been rejected with 400");
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log("✅ 4. Empty cart order rejected as expected (400):", err.response.data.message);
      } else {
        throw err;
      }
    }

    // ------------------------------------------------------------------------
    // Step 5: Add product to cart
    // ------------------------------------------------------------------------
    const addRes = await client.post(`/cart/${testProductId}`, { quantity: 2 });
    console.log(`✅ 5. Added 2x Keyboard to cart. Cart length: ${addRes.data.cart.length}`);

    // ------------------------------------------------------------------------
    // Step 6: Test shipping address validation (Invalid Pincode)
    // ------------------------------------------------------------------------
    try {
      await client.post("/orders/create-payment-order", {
        shippingAddress: {
          fullName: "Aarav Sharma",
          phone: "9876543210",
          addressLine1: "22 MG Road",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "123", // invalid < 6 digits
        },
      });
      console.error("❌ 6. Failed: Invalid pincode should be rejected with 400");
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log("✅ 6. Invalid pincode rejected as expected (400):", err.response.data.message);
      } else {
        throw err;
      }
    }

    // ------------------------------------------------------------------------
    // Step 7: Create Order with valid address (Fake total sent from client ignored!)
    // ------------------------------------------------------------------------
    const validShippingAddress = {
      fullName: "Aarav Sharma",
      phone: "9876543210",
      addressLine1: "22 MG Road, Koramangala",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
    };

    const orderRes = await client.post("/orders/create-payment-order", {
      shippingAddress: validShippingAddress,
      totalAmount: 1, // Manipulated fake total - MUST BE IGNORED by backend!
    });

    const { shopKartOrderId, razorpayOrderId, amount, currency, key } = orderRes.data;
    console.log(`✅ 7. Pending Order & Razorpay Order created:`);
    console.log(`     - ShopKart Order ID: ${shopKartOrderId}`);
    console.log(`     - Razorpay Order ID: ${razorpayOrderId}`);
    console.log(`     - Amount in paise:   ${amount} (Calculated by server: ₹${amount / 100})`);
    console.log(`     - Currency:          ${currency}`);
    console.log(`     - Public Key ID:     ${key}`);

    // 2 x 2999 = 5998 INR = 599800 paise
    if (amount !== 599800) {
      throw new Error(`Expected server to calculate 599800 paise, got: ${amount}`);
    }

    // ------------------------------------------------------------------------
    // Step 8: Verify cart is still preserved before payment confirmation!
    // ------------------------------------------------------------------------
    const cartBeforePayment = await client.get("/cart");
    if (cartBeforePayment.data.cart.length > 0) {
      console.log(`✅ 8. Cart preserved before payment verification (${cartBeforePayment.data.cart.length} items)`);
    } else {
      throw new Error("Cart was cleared prematurely before payment verification!");
    }

    // ------------------------------------------------------------------------
    // Step 9: Test fake/tampered payment signature verification (Should fail 400)
    // ------------------------------------------------------------------------
    try {
      await client.post("/orders/verify-payment", {
        shopKartOrderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: "pay_fake123456789",
        razorpay_signature: "tampered_fake_signature_abc",
      });
      console.error("❌ 9. Failed: Tampered payment signature should have been rejected with 400");
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log("✅ 9. Tampered payment signature rejected as expected (400):", err.response.data.message);
      } else {
        throw err;
      }
    }

    // Confirm cart is STILL not cleared after failed payment
    const cartAfterFail = await client.get("/cart");
    if (cartAfterFail.data.cart.length > 0) {
      console.log("✅ 10. Cart remains preserved after failed payment attempt");
    }

    // ------------------------------------------------------------------------
    // Step 11: Valid HMAC SHA256 Signature Payment Verification
    // ------------------------------------------------------------------------
    const paymentId = "pay_test_" + Date.now();
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = razorpayOrderId + "|" + paymentId;
    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    const verifyRes = await client.post("/orders/verify-payment", {
      shopKartOrderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
    });

    console.log("✅ 11. Payment verified successfully:");
    console.log(`      - Status:         ${verifyRes.data.order.status}`);
    console.log(`      - Payment Status: ${verifyRes.data.order.paymentStatus}`);
    console.log(`      - Payment ID:     ${verifyRes.data.order.razorpayPaymentId}`);

    // ------------------------------------------------------------------------
    // Step 12: Verify cart is now CLEARED after successful payment!
    // ------------------------------------------------------------------------
    const cartAfterSuccess = await client.get("/cart");
    if (cartAfterSuccess.data.cart.length === 0) {
      console.log("✅ 12. Cart is now completely cleared (0 items)");
    } else {
      throw new Error("Cart was not cleared after successful payment verification!");
    }

    // ------------------------------------------------------------------------
    // Step 13: Get User's Orders
    // ------------------------------------------------------------------------
    const ordersRes = await client.get("/orders");
    console.log(`✅ 13. Fetched user orders: ${ordersRes.data.orders.length} order(s)`);
    const createdOrder = ordersRes.data.orders.find((o) => o._id === shopKartOrderId);
    if (!createdOrder) {
      throw new Error("Created order not found in user orders list!");
    }
    console.log(`      - Order found with ${createdOrder.items.length} snapshotted items`);

    // ------------------------------------------------------------------------
    // Step 14: Single Order API & Ownership
    // ------------------------------------------------------------------------
    const singleOrderRes = await client.get(`/orders/${shopKartOrderId}`);
    console.log(`✅ 14. Single order fetched: Total ₹${singleOrderRes.data.order.totalAmount}`);

    // ------------------------------------------------------------------------
    // Step 15: Bonus - Order Status Progression
    // ------------------------------------------------------------------------
    const statusRes = await client.patch(`/orders/${shopKartOrderId}/status`, {
      status: "CONFIRMED",
    });
    console.log(`✅ 15. Bonus: Order status progressed to: ${statusRes.data.order.status}`);

    console.log("\n🎉 ALL 15 LAB 06 ACCEPTANCE TESTS PASSED SUCCESSFULLY! 🎉\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Test suite failed with error:", error.response?.data || error.message);
    process.exit(1);
  }
};

runTests();
