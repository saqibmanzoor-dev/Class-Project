import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Package, ShoppingBag, ArrowRight, 
  MapPin, Clock, ShieldCheck, Download
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { getOrderById } from '../services/api';

export default function OrderSuccess({ user, setUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await getOrderById(id);
        if (isMounted && data.success) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
        if (isMounted) {
          setError(err.response?.data?.message || 'Order details could not be retrieved.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
    return () => { isMounted = false; };
  }, [id]);

  return (
    <div className="app-container" id="order-success-root">
      <Navbar user={user} onLogoutSuccess={() => setUser(null)} />

      <main className="main-content">
        <div className="dashboard-container" style={{ maxWidth: '780px' }}>
          {loading ? (
            <div style={{ padding: '5rem 0', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 1.25rem' }}></div>
              <p style={{ color: 'var(--text-muted)' }}>Retrieving order receipt...</p>
            </div>
          ) : error ? (
            <div className="empty-state-card" id="order-error-card">
              <h2 style={{ color: 'var(--error)' }}>Error Loading Order</h2>
              <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>{error}</p>
              <Link to="/orders" className="btn btn-primary">
                Go to My Orders
              </Link>
            </div>
          ) : order ? (
            <div className="order-success-card" id="order-success-content">
              {/* Success Hero */}
              <div className="order-success-header">
                <div className="success-icon-badge">
                  <CheckCircle2 size={54} />
                </div>
                <h1 className="success-headline">Order Placed Successfully!</h1>
                <p className="success-subtext">
                  Thank you for your purchase. Your payment was verified through Razorpay Test Mode and your order has been confirmed.
                </p>
              </div>

              {/* Order Meta Bar */}
              <div className="order-receipt-meta">
                <div>
                  <span className="meta-label">Order ID:</span>
                  <div className="meta-value" style={{ fontFamily: 'monospace' }} id="success-order-id">
                    {order._id}
                  </div>
                </div>

                <div>
                  <span className="meta-label">Payment Status:</span>
                  <span className="status-badge status-paid" id="success-payment-status">
                    {order.paymentStatus || 'PAID'}
                  </span>
                </div>

                <div>
                  <span className="meta-label">Order Status:</span>
                  <span className="status-badge status-placed" id="success-order-status">
                    {order.status || 'PLACED'}
                  </span>
                </div>

                <div>
                  <span className="meta-label">Total Amount:</span>
                  <div className="meta-value" style={{ color: 'var(--primary)', fontWeight: 800 }} id="success-order-total">
                    ₹{order.totalAmount?.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Snapshot Items Summary */}
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>
                  Purchased Items ({order.items?.length || 0})
                </h3>

                <div className="receipt-items-list">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="receipt-item-row">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                        alt={item.name}
                        className="receipt-item-img"
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          ₹{item.price?.toLocaleString('en-IN')} × {item.quantity}
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details */}
              {order.shippingAddress && (
                <div className="receipt-shipping-box" style={{ marginTop: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <MapPin size={18} style={{ color: 'var(--primary)' }} />
                    <strong style={{ fontSize: '0.95rem' }}>Delivery Address</strong>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    <div><strong>{order.shippingAddress.fullName}</strong> ({order.shippingAddress.phone})</div>
                    <div>{order.shippingAddress.addressLine1}</div>
                    <div>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</div>
                  </div>
                </div>
              )}

              {/* Navigation Action Buttons (Task 6) */}
              <div className="receipt-actions-footer">
                <Link to="/orders" className="btn btn-primary" id="success-view-orders-btn">
                  <Package size={18} />
                  <span>View My Orders</span>
                </Link>
                <Link to="/home" className="btn btn-secondary" id="success-continue-shopping-btn">
                  <ShoppingBag size={18} />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
