import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Package, MapPin, Calendar, 
  CreditCard, ShieldCheck, CheckCircle2, Clock 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { getOrderById } from '../services/api';

export default function OrderDetails({ user, setUser }) {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getOrderById(id);
        if (isMounted && data.success) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
        if (isMounted) {
          setError(err.response?.data?.message || 'Could not load order details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) fetchOrder();
    return () => { isMounted = false; };
  }, [id]);

  return (
    <div className="app-container" id="order-details-root">
      <Navbar user={user} onLogoutSuccess={() => setUser(null)} />

      <main className="main-content">
        <div className="dashboard-container" style={{ maxWidth: '820px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <Link
              to="/orders"
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
              id="back-to-orders-link"
            >
              <ArrowLeft size={16} /> Back to My Orders
            </Link>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Order Details
            </h1>
          </div>

          {loading ? (
            <div style={{ padding: '5rem 0', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 1.25rem' }}></div>
              <p style={{ color: 'var(--text-muted)' }}>Loading order information...</p>
            </div>
          ) : error ? (
            <div className="empty-state-card">
              <h2 style={{ color: 'var(--error)' }}>Cannot Access Order</h2>
              <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>{error}</p>
              <Link to="/orders" className="btn btn-primary">
                Return to My Orders
              </Link>
            </div>
          ) : order ? (
            <div className="order-details-card" id="order-details-content">
              {/* Header */}
              <div className="order-details-header">
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Number</span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'monospace' }}>
                    {order._id}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className={`status-badge status-${(order.status || 'placed').toLowerCase()}`}>
                    {order.status || 'PLACED'}
                  </span>
                  <span className="status-badge status-paid">
                    Payment: {order.paymentStatus || 'PAID'}
                  </span>
                </div>
              </div>

              {/* Items Snapshot Table */}
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>
                  Snapshot Order Items ({order.items?.length || 0})
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
                          Unit Price: ₹{item.price?.toLocaleString('en-IN')} × {item.quantity}
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Split Details: Shipping & Payment Meta */}
              <div className="details-split-grid" style={{ marginTop: '2rem' }}>
                <div className="details-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <MapPin size={18} style={{ color: 'var(--primary)' }} />
                    <strong style={{ fontSize: '0.95rem' }}>Shipping Address</strong>
                  </div>
                  {order.shippingAddress ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      <div><strong>{order.shippingAddress.fullName}</strong></div>
                      <div>Phone: {order.shippingAddress.phone}</div>
                      <div>{order.shippingAddress.addressLine1}</div>
                      <div>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</div>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>No shipping address recorded</p>
                  )}
                </div>

                <div className="details-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <CreditCard size={18} style={{ color: 'var(--primary)' }} />
                    <strong style={{ fontSize: '0.95rem' }}>Payment & Transaction</strong>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    <div>Method: <strong>Razorpay Test Mode</strong></div>
                    {order.razorpayOrderId && (
                      <div>Razorpay Order: <code style={{ fontSize: '0.8rem' }}>{order.razorpayOrderId}</code></div>
                    )}
                    {order.razorpayPaymentId && (
                      <div>Payment ID: <code style={{ fontSize: '0.8rem' }}>{order.razorpayPaymentId}</code></div>
                    )}
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Total Paid:</span>
                      <strong style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
