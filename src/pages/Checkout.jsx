import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CreditCard, ShieldCheck, ArrowLeft, AlertCircle, 
  CheckCircle2, MapPin, Truck, Lock, Sparkles
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, verifyPayment } from '../services/api';

/**
 * Loads Razorpay Standard Checkout SDK dynamically
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay Checkout script.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export default function Checkout({ user, setUser }) {
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, emptyCart, loading: cartLoading } = useCart();

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Validation & Submission States
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // If user opens checkout directly with empty cart, redirect back
  useEffect(() => {
    if (!cartLoading && cart.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cart, cartLoading, navigate]);

  // Update prefill if user profile loads late
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleFillSampleAddress = () => {
    setFormData({
      fullName: user?.fullName || 'Aarav Sharma',
      phone: user?.phone || '9876543210',
      addressLine1: '22 MG Road, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
    });
    setErrors({});
    setApiError('');
  };

  /**
   * Task 3 — Shipping Form Validation Rules:
   * - No required field can be empty
   * - Phone should contain a valid number format (10+ digits)
   * - Pincode should contain 6 digits
   * - Whitespace-only input is invalid
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    const cleanPhone = formData.phone.replace(/[\s-]/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,14}$/.test(cleanPhone)) {
      newErrors.phone = 'Enter a valid phone number (at least 10 digits)';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must contain 6 digits.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setApiError('Please fill in all required shipping address fields marked in red.');
      // Auto-scroll to first missing field
      const firstErrorKey = Object.keys(newErrors)[0];
      const el = document.getElementById(`shipping-${firstErrorKey}`);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    return true;
  };

  /**
   * Task 4 & Razorpay Test Payment Flow:
   * 1. Validate shipping address client-side
   * 2. Call POST /orders/create-payment-order (sends only shippingAddress)
   * 3. Backend verifies cart, live stock, calculates total, and creates Razorpay Order
   * 4. Open Razorpay Checkout modal
   * 5. Send handler response to POST /orders/verify-payment
   * 6. Clear global cart state and navigate to /order-success/:id
   */
  const handlePlaceOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    if (cart.length === 0) {
      setApiError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create Pending Order & Razorpay Order on Backend
      const orderPayload = {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      };

      console.log('📦 Initiating order with payload:', orderPayload);
      const orderData = await createPaymentOrder(orderPayload);
      console.log('✅ Order created response from backend:', orderData);

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to initiate order');
      }

      // 2. Load Razorpay Checkout Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay Checkout failed to load. Please disable ad-blockers for localhost.');
      }

      // 3. Configure Razorpay Standard Checkout in Test Mode
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'ShopKart',
        description: 'ShopKart Order Checkout',
        order_id: orderData.razorpayOrderId,

        handler: async function (response) {
          try {
            console.log('💳 Razorpay payment response received:', response);
            setVerifying(true);
            setSubmitting(true);

            // Step 11: Call Payment Verification API on Backend
            const verificationResult = await verifyPayment({
              shopKartOrderId: orderData.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            console.log('🎉 Verification result:', verificationResult);

            if (verificationResult.success) {
              // Task 5: Clear Cart ONLY after verified payment
              emptyCart();
              // Task 6: Navigate to Order Confirmation
              navigate(`/order-success/${orderData.shopKartOrderId}`);
            } else {
              setApiError(verificationResult.message || 'Payment signature verification failed.');
            }
          } catch (err) {
            console.error('Payment verification failed:', err);
            const errMsg = err.response?.data?.message || 'Payment verification failed on the server.';
            setApiError(errMsg);
          } finally {
            setVerifying(false);
            setSubmitting(false);
          }
        },

        prefill: {
          name: formData.fullName.trim(),
          contact: formData.phone.trim(),
          email: user?.email || '',
        },

        theme: {
          color: '#4f46e5',
        },

        modal: {
          ondismiss: function () {
            setSubmitting(false);
            console.log('Razorpay payment modal closed by customer.');
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function (failResponse) {
        console.error('Razorpay payment failed:', failResponse.error);
        setApiError(
          `Payment Failed: ${failResponse.error?.description || 'Transaction declined'}. Your cart has not been cleared. Please try again.`
        );
        setSubmitting(false);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Checkout error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to initialize payment.';
      setApiError(errMsg);
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container" id="checkout-page-root">
      <Navbar user={user} onLogoutSuccess={() => setUser(null)} />

      <main className="main-content">
        <div className="dashboard-container">
          {/* Header & Back link */}
          <div style={{ marginBottom: '1.75rem' }}>
            <Link
              to="/cart"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
                textDecoration: 'none',
                fontWeight: 600,
              }}
              id="back-to-cart-link"
            >
              <ArrowLeft size={16} /> Back to Cart
            </Link>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Checkout
            </h1>
          </div>

          {/* Top Banner for Backend or Form Errors */}
          {apiError && (
            <div className="alert-banner alert-danger" style={{ marginBottom: '1.5rem' }} id="checkout-api-error">
              <AlertCircle size={20} />
              <div style={{ flex: 1 }}>{apiError}</div>
            </div>
          )}

          {verifying && (
            <div className="alert-banner alert-info" style={{ marginBottom: '1.5rem' }}>
              <div className="spinner-sm" style={{ borderColor: 'rgba(79, 70, 229, 0.3)', borderTopColor: 'var(--primary)' }}></div>
              <div>Verifying HMAC SHA256 payment signature with Razorpay...</div>
            </div>
          )}

          <div className="checkout-layout-grid">
            {/* Left Column: Shipping Details Form (Task 2 & 3) */}
            <div className="checkout-form-column">
              <div className="checkout-card">
                <div className="checkout-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="step-badge">1</div>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Shipping Details</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Enter your delivery destination and contact information
                      </p>
                    </div>
                  </div>

                  {/* One-click Test Address Fill Button */}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleFillSampleAddress}
                    title="Quickly fill verified test address for evaluation"
                    id="fill-sample-address-btn"
                  >
                    <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                    <span>Fill Test Address</span>
                  </button>
                </div>

                <form onSubmit={handlePlaceOrder} id="checkout-shipping-form" noValidate>
                  <div className="form-group-grid">
                    {/* Full Name */}
                    <div className="form-group">
                      <label htmlFor="shipping-fullName" className="form-label">
                        Full Name <span style={{ color: 'var(--error)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="shipping-fullName"
                        name="fullName"
                        className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                        placeholder="e.g. Aarav Sharma"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled={submitting || verifying}
                      />
                      {errors.fullName && (
                        <span className="field-error-text" id="err-fullName">
                          {errors.fullName}
                        </span>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="form-group">
                      <label htmlFor="shipping-phone" className="form-label">
                        Phone Number <span style={{ color: 'var(--error)' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        id="shipping-phone"
                        name="phone"
                        className={`form-input ${errors.phone ? 'input-error' : ''}`}
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={submitting || verifying}
                      />
                      {errors.phone && (
                        <span className="field-error-text" id="err-phone">
                          {errors.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Street Address Line 1 */}
                  <div className="form-group">
                    <label htmlFor="shipping-addressLine1" className="form-label">
                      Address <span style={{ color: 'var(--error)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="shipping-addressLine1"
                      name="addressLine1"
                      className={`form-input ${errors.addressLine1 ? 'input-error' : ''}`}
                      placeholder="e.g. 22 MG Road, Koramangala"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      disabled={submitting || verifying}
                    />
                    {errors.addressLine1 && (
                      <span className="field-error-text" id="err-addressLine1">
                        {errors.addressLine1}
                      </span>
                    )}
                  </div>

                  <div className="form-group-grid-3">
                    {/* City */}
                    <div className="form-group">
                      <label htmlFor="shipping-city" className="form-label">
                        City <span style={{ color: 'var(--error)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="shipping-city"
                        name="city"
                        className={`form-input ${errors.city ? 'input-error' : ''}`}
                        placeholder="e.g. Bengaluru"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={submitting || verifying}
                      />
                      {errors.city && (
                        <span className="field-error-text" id="err-city">
                          {errors.city}
                        </span>
                      )}
                    </div>

                    {/* State */}
                    <div className="form-group">
                      <label htmlFor="shipping-state" className="form-label">
                        State <span style={{ color: 'var(--error)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="shipping-state"
                        name="state"
                        className={`form-input ${errors.state ? 'input-error' : ''}`}
                        placeholder="e.g. Karnataka"
                        value={formData.state}
                        onChange={handleChange}
                        disabled={submitting || verifying}
                      />
                      {errors.state && (
                        <span className="field-error-text" id="err-state">
                          {errors.state}
                        </span>
                      )}
                    </div>

                    {/* Pincode */}
                    <div className="form-group">
                      <label htmlFor="shipping-pincode" className="form-label">
                        Pincode <span style={{ color: 'var(--error)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="shipping-pincode"
                        name="pincode"
                        maxLength={6}
                        className={`form-input ${errors.pincode ? 'input-error' : ''}`}
                        placeholder="e.g. 560001"
                        value={formData.pincode}
                        onChange={handleChange}
                        disabled={submitting || verifying}
                      />
                      {errors.pincode && (
                        <span className="field-error-text" id="err-pincode">
                          {errors.pincode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Payment Security Notice */}
                  <div
                    style={{
                      marginTop: '1.5rem',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--surface-border)',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'center',
                    }}
                  >
                    <CreditCard size={22} style={{ color: 'var(--primary)' }} />
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <strong>Razorpay Test Mode Integration:</strong> No real money will be charged. Standard Test Cards, Netbanking, or UPI test flows can be selected in the checkout modal.
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Order Summary (Task 2) */}
            <div className="checkout-summary-column">
              <div className="order-summary-card">
                <div className="checkout-card-header" style={{ marginBottom: '1.25rem' }}>
                  <div className="step-badge">2</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Order Summary</h3>
                </div>

                {/* Items Review List */}
                <div className="checkout-items-list" id="checkout-items-summary">
                  {cart.map((item) => {
                    const product = item.product || {};
                    const lineTotal = (product.price || 0) * (item.quantity || 1);
                    return (
                      <div key={product._id || item._id} className="checkout-item-row">
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <img
                            src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                            alt={product.name}
                            style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                              {product.name}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Qty: {item.quantity} × ₹{(product.price || 0).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          ₹{lineTotal.toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row">
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal ({cartCount} items)</span>
                  <span style={{ fontWeight: 700 }}>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="summary-row">
                  <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total-row">
                  <span>Total Amount</span>
                  <span className="total-amount">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>

                {/* Inline Error Notice Directly Above Button */}
                {apiError && (
                  <div
                    style={{
                      marginTop: '1.25rem',
                      padding: '0.75rem 1rem',
                      background: 'var(--error-light)',
                      border: '1px solid var(--error-border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--error)',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 600,
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{apiError}</span>
                  </div>
                )}

                {/* Task 2: Place Order Button */}
                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg"
                  style={{ marginTop: apiError ? '1rem' : '1.75rem' }}
                  onClick={handlePlaceOrder}
                  disabled={submitting || verifying || cart.length === 0}
                  id="place-order-submit-btn"
                >
                  {submitting || verifying ? (
                    <>
                      <div className="spinner-sm"></div>
                      <span>{verifying ? 'Verifying Signature...' : 'Connecting to Razorpay...'}</span>
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      <span>Place Order & Pay with Razorpay</span>
                    </>
                  )}
                </button>

                <div className="trust-indicator" style={{ marginTop: '1.25rem' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--success)' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    End-to-end encrypted • Test Mode enabled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
