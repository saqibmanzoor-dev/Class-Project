import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, ShoppingBag, Clock, Calendar, 
  MapPin, ChevronRight, AlertCircle, RefreshCw, 
  CheckCircle, Truck, Box 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { getOrders, updateOrderStatus } from '../services/api';

export default function Orders({ user, setUser }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getOrders();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.response?.data?.message || 'Could not load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Bonus (+10 Marks): Progress order status simulator
  const handleProgressStatus = async (orderId, currentStatus) => {
    const progression = {
      PENDING_PAYMENT: 'PLACED',
      PLACED: 'CONFIRMED',
      CONFIRMED: 'SHIPPED',
      SHIPPED: 'DELIVERED',
      DELIVERED: 'PLACED',
    };
    const nextStatus = progression[currentStatus] || 'CONFIRMED';

    try {
      setUpdatingId(orderId);
      const res = await updateOrderStatus(orderId, nextStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'status-delivered';
      case 'SHIPPED':
        return 'status-shipped';
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'PLACED':
        return 'status-placed';
      case 'PENDING_PAYMENT':
        return 'status-pending';
      default:
        return 'status-placed';
    }
  };

  return (
    <div className="app-container" id="orders-page-root">
      <Navbar user={user} onLogoutSuccess={() => setUser(null)} />

      <main className="main-content">
        <div className="dashboard-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                My Orders
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Track your active orders and review purchase history
              </p>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={fetchOrders}
              disabled={loading}
              title="Refresh Orders"
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="alert-banner alert-danger" style={{ marginBottom: '1.5rem' }}>
              <AlertCircle size={20} />
              <div style={{ flex: 1 }}>{error}</div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={fetchOrders}>
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div style={{ padding: '4.5rem 0', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 1.25rem' }}></div>
              <p style={{ color: 'var(--text-muted)' }}>Loading your orders history...</p>
            </div>
          ) : orders.length === 0 ? (
            /* Empty State (Task 8) */
            <div className="empty-state-card" id="orders-empty-state">
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Package size={40} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                You have not placed any orders yet.
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
                Once you complete your checkout with Razorpay Test Mode, your order snapshot and historical receipt will be safely preserved here.
              </p>
              <Link to="/home" className="btn btn-primary" id="start-shopping-empty-btn">
                <ShoppingBag size={18} />
                <span>Start Shopping</span>
              </Link>
            </div>
          ) : (
            /* Orders List */
            <div className="orders-list-grid" id="orders-list-container">
              {orders.map((order) => {
                const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={order._id} className="order-history-card" id={`order-card-${order._id}`}>
                    {/* Header */}
                    <div className="order-history-card-header">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                            Order #{order._id}
                          </span>
                          <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                            {order.status || 'PLACED'}
                          </span>
                          <span className="status-badge status-paid">
                            Payment: {order.paymentStatus || 'PAID'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={13} />
                          <span>Placed on {formattedDate}</span>
                        </div>
                      </div>

                      <div className="order-history-total">
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                          ₹{order.totalAmount?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Snapshot Items Preview */}
                    <div className="order-history-items-list">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="order-history-item-row">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                            alt={item.name}
                            className="order-history-item-img"
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              ₹{item.price?.toLocaleString('en-IN')} × {item.quantity}
                            </div>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                            ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer with Shipping Address & Actions */}
                    <div className="order-history-footer">
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <MapPin size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                        <span>Deliver to: <strong>{order.shippingAddress?.fullName}</strong>, {order.shippingAddress?.city} ({order.shippingAddress?.pincode})</span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        {/* Bonus progression button */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleProgressStatus(order._id, order.status)}
                          disabled={updatingId === order._id}
                          title="Simulate order status progression (Bonus +10 Marks)"
                          id={`progress-status-btn-${order._id}`}
                        >
                          <RefreshCw size={14} className={updatingId === order._id ? 'spin' : ''} />
                          <span>Progress Status</span>
                        </button>

                        <Link
                          to={`/orders/${order._id}`}
                          className="btn btn-primary btn-sm"
                          id={`view-order-details-${order._id}`}
                        >
                          <span>View Details</span>
                          <ChevronRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
