const Razorpay = require("razorpay");

let razorpayInstance = null;

/**
 * Initializes and exports a singleton instance of the Razorpay SDK.
 * Reads credentials securely from process.env (Key Secret never sent to client).
 */
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.warn("⚠️ Razorpay credentials missing from environment variables (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET).");
    return null;
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }

  return razorpayInstance;
};

module.exports = { getRazorpayInstance };
