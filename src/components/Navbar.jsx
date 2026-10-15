import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, ShoppingCart, Heart, Package, 
  LogOut, User as UserIcon, Sparkles, ChevronRight 
} from 'lucide-react';
import { logoutCustomer } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import UserProfileModal from './UserProfileModal';

export default function Navbar({ user, onLogoutSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

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
    <header className="header-wrapper" id="site-header">
      {/* Top Promotional Announcement Ticker (Snitch-inspired) */}
      <div className="announcement-bar">
        <div className="announcement-content">
          <span className="announcement-badge">LIMITED TIME</span>
          <span className="announcement-text">
            ⚡ FREE EXPRESS SHIPPING ACROSS INDIA • 10% OFF ON PREPAID ORDERS • EASY 7-DAY DOORSTEP EXCHANGES
          </span>
          <span className="announcement-link">
            USE CODE: <strong>SHOPKART10</strong>
          </span>
        </div>
      </div>

      {/* Main Glassmorphic Navbar */}
      <nav className="navbar" id="shopkart-navbar">
        <div className="navbar-inner">
          {/* Brand Logo */}
          <Link to="/products" className="navbar-brand" id="nav-brand-link">
            <div className="brand-icon-box">
              <ShoppingBag size={20} />
            </div>
            <div className="brand-text-wrap">
              <span className="brand-title">SHOPKART</span>
              <span className="brand-sub">STUDIO</span>
            </div>
          </Link>

          {/* Navigation Center Links */}
          {user && (
            <div className="navbar-center-links">
              <Link
                to="/products"
                className={`nav-link-item ${location.pathname === '/products' || location.pathname === '/home' ? 'active' : ''}`}
                id="nav-products-link"
              >
                <span>Products</span>
                <span className="nav-link-indicator"></span>
              </Link>
              <Link
                to="/wishlist"
                className={`nav-link-item ${location.pathname === '/wishlist' ? 'active' : ''}`}
                id="nav-wishlist-link"
              >
                <span>Wishlist</span>
                {wishlistCount > 0 && <span className="nav-counter-pill">{wishlistCount}</span>}
                <span className="nav-link-indicator"></span>
              </Link>
              <Link
                to="/orders"
                className={`nav-link-item ${location.pathname === '/orders' ? 'active' : ''}`}
                id="nav-orders-link"
              >
                <span>My Orders</span>
                <span className="nav-link-indicator"></span>
              </Link>
            </div>
          )}

          {/* Right Actions */}
          <div className="navbar-right">
            {user ? (
              <>
                {/* Wishlist Quick Button */}
                <Link
                  to="/wishlist"
                  className={`btn-nav-action ${location.pathname === '/wishlist' ? 'active' : ''}`}
                  id="nav-wishlist-btn"
                  title="View Saved Wishlist"
                >
                  <Heart 
                    size={19} 
                    style={{ 
                      color: wishlistCount > 0 ? '#ef4444' : 'currentColor', 
                      fill: wishlistCount > 0 ? '#ef4444' : 'none' 
                    }} 
                  />
                  {wishlistCount > 0 && (
                    <span className="action-badge-dot" id="wishlist-badge-count">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart Quick Button with Live Dynamic Count Badge */}
                <Link
                  to="/cart"
                  className={`btn-nav-action btn-cart-highlight ${location.pathname === '/cart' ? 'active' : ''}`}
                  id="nav-cart-btn"
                  title="View Shopping Cart"
                >
                  <ShoppingCart size={19} />
                  <span className="action-cart-label">Bag</span>
                  <span className="action-badge-count" id="cart-badge-count">
                    {cartCount}
                  </span>
                </Link>

                {/* User Identity Chip (Clickable to view profile popup) */}
                <button
                  type="button"
                  className="user-chip user-chip-interactive"
                  id="nav-user-chip"
                  title="Click to view profile & account info"
                  onClick={() => setShowProfileModal(true)}
                  aria-haspopup="dialog"
                  aria-expanded={showProfileModal}
                >
                  <div className="user-avatar">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon size={14} />}
                  </div>
                  <div className="user-info-text">
                    <span className="user-name-short">{user.fullName || 'Shopper'}</span>
                    <span className="user-verified-badge">View Profile</span>
                  </div>
                </button>

                {/* Logout Button */}
                <button
                  type="button"
                  id="logout-button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  title="Log out of session"
                >
                  <LogOut size={15} />
                  <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Link to="/login" className="btn btn-secondary btn-sm" id="nav-login-btn">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" id="nav-register-btn">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* User Information Pop-up Modal */}
      {user && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={user}
          onLogout={handleLogout}
        />
      )}
    </header>
  );
}
