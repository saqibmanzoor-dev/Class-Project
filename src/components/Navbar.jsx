import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Package, LogOut, User as UserIcon } from 'lucide-react';
import { logoutCustomer } from '../services/api';
import { useCart } from '../context/CartContext';

export default function Navbar({ user, onLogoutSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const { cartCount } = useCart();

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutCustomer();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
      navigate('/login');
    }
  };

  return (
    <nav className="navbar" id="shopkart-navbar">
      <div className="navbar-inner">
        <Link to="/home" className="navbar-brand" id="nav-brand-link">
          <div className="brand-icon-box">
            <ShoppingBag size={20} />
          </div>
          <span>ShopKart</span>
        </Link>

        {user && (
          <div className="navbar-center-links">
            <Link
              to="/home"
              className={`nav-link-item ${location.pathname === '/home' ? 'active' : ''}`}
              id="nav-home-link"
            >
              Explore Products
            </Link>
            <Link
              to="/orders"
              className={`nav-link-item ${location.pathname === '/orders' ? 'active' : ''}`}
              id="nav-orders-link"
            >
              <Package size={16} />
              <span>My Orders</span>
            </Link>
          </div>
        )}

        <div className="navbar-right">
          {user ? (
            <>
              {/* Cart Link with Live Dynamic Count Badge */}
              <Link
                to="/cart"
                className={`btn btn-cart-nav ${location.pathname === '/cart' ? 'active' : ''}`}
                id="nav-cart-btn"
                title="View Shopping Cart"
              >
                <ShoppingCart size={18} />
                <span className="cart-text">Cart ({cartCount})</span>
              </Link>

              <div className="user-chip" id="nav-user-chip" title={user.email}>
                <div className="user-avatar">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon size={14} />}
                </div>
                <span className="user-name-short">{user.fullName || 'Customer'}</span>
              </div>

              <button
                type="button"
                id="logout-button"
                className="btn btn-outline-danger"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <LogOut size={16} />
                <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary" id="nav-login-btn">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary" id="nav-register-btn">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
