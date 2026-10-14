import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, 
  ArrowLeft, ShieldCheck, AlertCircle 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

export default function Cart({ user, setUser }) {
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, loading, updateItemQty, removeItem, clearEntireCart } = useCart();

  const handleQtyChange = async (productId, currentQty, delta, maxStock) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (maxStock !== undefined && newQty > maxStock) {
      alert(`Cannot add more than available stock of ${maxStock}`);
      return;
    }
    await updateItemQty(productId, newQty);
  };

  return (
    <div className="app-container" id="cart-page-root">
      <Navbar user={user} onLogoutSuccess={() => setUser(null)} />

      <main className="main-content">
        <div className="dashboard-container">
          {/* Breadcrumb & Title */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Link to="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', textDecoration: 'none', fontWeight: 600 }}>
                <ArrowLeft size={16} /> Back to Products
              </Link>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Shopping Cart ({cartCount})
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
                <span>Clear Cart</span>
              </button>
            )}
          </div>

          {loading && cart.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
              <p style={{ color: 'var(--text-muted)' }}>Loading your cart...</p>
            </div>
          ) : cart.length === 0 ? (
            /* Empty Cart State */
            <div className="empty-state-card" id="cart-empty-state">
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <ShoppingCart size={40} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your shopping cart is empty</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
                You haven't added any products to your cart yet. Explore our verified catalog and discover items you love.
              </p>
              <Link to="/home" className="btn btn-primary" id="cart-start-shopping-btn">
                <ShoppingCart size={18} />
                <span>Start Shopping</span>
              </Link>
            </div>
          ) : (
            /* Cart Content Split */
            <div className="cart-layout-grid">
              {/* Left Column: Cart Items List */}
              <div className="cart-items-column">
                <div className="cart-items-card">
                  {cart.map((item) => {
                    const product = item.product || {};
                    const lineTotal = (product.price || 0) * (item.quantity || 1);

                    return (
                      <div key={product._id || item._id} className="cart-item-row" id={`cart-item-${product._id}`}>
                        <img
                          src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                          alt={product.name}
                          className="cart-item-img"
                        />

                        <div className="cart-item-info">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <h3 className="cart-item-name">{product.name}</h3>
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

                          <span className="cart-item-category">{product.category || 'Product'}</span>
                          <div className="cart-item-price">₹{(product.price || 0).toLocaleString('en-IN')} each</div>

                          <div className="cart-item-actions">
                            <div className="qty-counter">
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => handleQtyChange(product._id, item.quantity, -1, product.stock)}
                                disabled={item.quantity <= 1}
                                id={`decrement-qty-${product._id}`}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="qty-value" id={`qty-value-${product._id}`}>{item.quantity}</span>
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => handleQtyChange(product._id, item.quantity, 1, product.stock)}
                                disabled={item.quantity >= (product.stock || 999)}
                                id={`increment-qty-${product._id}`}
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <div className="cart-item-line-total">
                              <span>Total: </span>
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
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                    Order Summary
                  </h3>

                  <div className="summary-row">
                    <span style={{ color: 'var(--text-muted)' }}>Items Subtotal ({cartCount})</span>
                    <span style={{ fontWeight: 700 }}>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="summary-row">
                    <span style={{ color: 'var(--text-muted)' }}>Estimated Delivery</span>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE</span>
                  </div>

                  <div className="summary-divider"></div>

                  <div className="summary-row total-row">
                    <span>Estimated Total</span>
                    <span className="total-amount">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-block btn-lg"
                    style={{ marginTop: '1.5rem' }}
                    onClick={() => navigate('/checkout')}
                    id="proceed-to-checkout-btn"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={18} />
                  </button>

                  <div className="trust-indicator" style={{ marginTop: '1.25rem' }}>
                    <ShieldCheck size={18} style={{ color: 'var(--success)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Verified Razorpay Test Mode checkout
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
