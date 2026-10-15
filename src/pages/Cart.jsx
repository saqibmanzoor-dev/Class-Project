import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, 
  ArrowLeft, ShieldCheck, AlertCircle, Sparkles, 
  Tag, Truck, Lock, Check 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

export default function Cart({ user, setUser }) {
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, loading, updateItemQty, removeItem, clearEntireCart } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMsg, setCouponMsg] = useState(null);

  const freeDeliveryThreshold = 1999;
  const amountNeeded = Math.max(0, freeDeliveryThreshold - cartTotal);
  const progressPercent = Math.min(100, Math.round((cartTotal / freeDeliveryThreshold) * 100));

  const handleQtyChange = async (productId, currentQty, delta, maxStock) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (maxStock !== undefined && newQty > maxStock) {
      alert(`Cannot add more than available stock of ${maxStock}`);
      return;
    }
    await updateItemQty(productId, newQty);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const code = couponCode.trim().toUpperCase();
    if (code === 'SHOPKART10' || code === 'FIRST10') {
      setDiscountPercent(10);
      setCouponMsg({ success: true, text: 'Coupon applied! 10% instant discount added.' });
    } else {
      setDiscountPercent(0);
      setCouponMsg({ success: false, text: 'Invalid coupon code. Try "SHOPKART10"' });
    }
  };

  const discountAmount = Math.round((cartTotal * discountPercent) / 100);
  const finalTotal = cartTotal - discountAmount;

  return (
    <div className="app-container" id="cart-page-root">
      <Navbar user={user} onLogoutSuccess={() => setUser(null)} />

      <main className="main-content">
        <div className="dashboard-container">
          {/* Breadcrumb & Title */}
          <div className="page-header-wrap">
            <div>
              <Link to="/products" className="details-back-link" id="cart-back-btn">
                <ArrowLeft size={16} />
                <span>Back to Products</span>
              </Link>
              <h1 className="page-main-title">
                <span>Shopping Bag</span>
                <span className="count-pill">({cartCount})</span>
              </h1>
            </div>

            {cart.length > 0 && (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your cart?')) {
                    clearEntireCart();
                  }
                }}
                id="clear-cart-btn"
              >
                <Trash2 size={15} />
                <span>Clear Bag</span>
              </button>
            )}
          </div>

          {loading && cart.length === 0 ? (
            <div className="loading-state-box" id="cart-loading-state">
              <div className="spinner"></div>
              <p>Loading your shopping bag...</p>
            </div>
          ) : cart.length === 0 ? (
            <div className="empty-state-card" id="cart-empty-state">
              <div className="empty-icon-circle-indigo">
                <ShoppingCart size={42} />
              </div>
              <h2>Your shopping bag is empty</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
                {!user 
                  ? 'Sign in to access items previously saved in your cart, or start exploring our latest drops!'
                  : 'You haven\'t added any products to your bag yet. Explore our verified catalog and discover items you love.'
                }
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {!user && (
                  <Link to="/login" className="btn btn-primary" id="cart-login-btn">
                    <span>Sign In to Your Account</span>
                  </Link>
                )}
                <Link to="/products" className={`btn ${!user ? 'btn-secondary' : 'btn-primary btn-lg'}`} id="cart-start-shopping-btn">
                  <ShoppingCart size={18} />
                  <span>Start Shopping</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="cart-layout-grid">
              {/* Left Column: Cart Items List */}
              <div className="cart-items-column">
                {/* Free Delivery Tracker Bar */}
                <div className="free-delivery-tracker-box">
                  <div className="tracker-header">
                    <Truck size={18} className="tracker-truck-icon" />
                    <span>
                      {amountNeeded === 0 ? (
                        <strong>🎉 Congratulations! You have unlocked FREE Express Delivery!</strong>
                      ) : (
                        <>Add <strong>₹{amountNeeded.toLocaleString('en-IN')}</strong> more to unlock <strong>FREE Express Delivery</strong></>
                      )}
                    </span>
                  </div>
                  <div className="tracker-progress-bg">
                    <div 
                      className="tracker-progress-fill" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="cart-items-card">
                  {cart.map((item) => {
                    const product = item.product || {};
                    const lineTotal = (product.price || 0) * (item.quantity || 1);
                    const originalPrice = Math.round((product.price || 0) * 1.25);

                    return (
                      <div key={product._id || item._id} className="snitch-cart-item-row" id={`cart-item-${product._id}`}>
                        <Link to={`/products/${product._id}`} className="cart-img-wrap">
                          <img
                            src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                            alt={product.name}
                            className="cart-item-img"
                          />
                        </Link>

                        <div className="cart-item-info">
                          <div className="cart-item-header">
                            <div>
                              <span className="cart-item-cat-label">{product.category || 'Product'}</span>
                              <Link to={`/products/${product._id}`} className="cart-item-title-link">
                                <h3 className="cart-item-name">{product.name}</h3>
                              </Link>
                            </div>

                            <button
                              type="button"
                              className="btn-icon-danger"
                              onClick={() => removeItem(product._id)}
                              title="Remove item"
                              id={`remove-cart-item-${product._id}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="cart-item-price-row">
                            <span className="cart-price-bold">₹{(product.price || 0).toLocaleString('en-IN')}</span>
                            <span className="cart-mrp-strike">MRP ₹{originalPrice.toLocaleString('en-IN')}</span>
                            <span className="cart-unit-label">each</span>
                          </div>

                          <div className="cart-item-bottom-actions">
                            {/* Quantity Controls */}
                            <div className="qty-counter">
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => handleQtyChange(product._id, item.quantity, -1, product.stock)}
                                disabled={item.quantity <= 1}
                                id={`decrement-qty-${product._id}`}
                              >
                                <Minus size={13} />
                              </button>
                              <span className="qty-value" id={`qty-value-${product._id}`}>{item.quantity}</span>
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => handleQtyChange(product._id, item.quantity, 1, product.stock)}
                                disabled={item.quantity >= (product.stock || 999)}
                                id={`increment-qty-${product._id}`}
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            <div className="cart-item-line-total">
                              <span>Subtotal: </span>
                              <strong>₹{lineTotal.toLocaleString('en-IN')}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Order Summary Box */}
              <div className="cart-summary-column">
                <div className="order-summary-card">
                  <h3 className="summary-card-title">Order Summary</h3>

                  {/* Promo Code Input Box */}
                  <form onSubmit={handleApplyCoupon} className="coupon-apply-form">
                    <div className="coupon-input-wrap">
                      <Tag size={16} className="coupon-tag-icon" />
                      <input
                        type="text"
                        placeholder="Coupon: SHOPKART10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="coupon-input"
                      />
                      <button type="submit" className="coupon-btn">Apply</button>
                    </div>
                  </form>

                  {couponMsg && (
                    <div className={`coupon-msg ${couponMsg.success ? 'success' : 'error'}`}>
                      {couponMsg.success ? <Check size={14} /> : <AlertCircle size={14} />}
                      <span>{couponMsg.text}</span>
                    </div>
                  )}

                  {/* Summary Breakdown */}
                  <div className="summary-breakdown">
                    <div className="summary-row">
                      <span className="summary-label">Bag Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                      <span className="summary-value">₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="summary-row discount-row">
                        <span className="summary-label">Coupon Discount (10%)</span>
                        <span className="summary-value discount-text">- ₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="summary-row">
                      <span className="summary-label">Estimated Shipping</span>
                      <span className="summary-value free-text">FREE</span>
                    </div>

                    <div className="summary-row">
                      <span className="summary-label">Estimated Tax (GST)</span>
                      <span className="summary-value">Included</span>
                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-row total-row">
                      <span>Total Amount</span>
                      <span className="total-amount">₹{finalTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Proceed to Checkout Button */}
                  <button
                    type="button"
                    className="btn btn-primary btn-block btn-lg checkout-cta-btn"
                    onClick={() => navigate('/checkout')}
                    id="proceed-to-checkout-btn"
                  >
                    <Lock size={18} />
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={18} />
                  </button>

                  {/* Trust indicator */}
                  <div className="trust-indicator" style={{ marginTop: '1.25rem' }}>
                    <ShieldCheck size={18} style={{ color: 'var(--success)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Verified 256-bit encrypted Razorpay Test Mode checkout
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
