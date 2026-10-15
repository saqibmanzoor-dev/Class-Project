import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, ShoppingBag, Trash2, ArrowLeft, 
  ExternalLink, AlertCircle, ShoppingCart, Sparkles, Check 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getWishlist, removeFromWishlist } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Wishlist({ user, setUser }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { fetchWishlist: refreshGlobalWishlist } = useWishlist();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [movingId, setMovingId] = useState(null);
  const [notice, setNotice] = useState(null);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getWishlist();
      if (res.success && Array.isArray(res.wishlist)) {
        setWishlist(res.wishlist);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      if (err.response?.status === 401) {
        navigate('/login', { replace: true });
      } else {
        setError("We couldn't load your wishlist. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId);
      const res = await removeFromWishlist(productId);
      if (res.success) {
        setWishlist((prev) => prev.filter((item) => (item._id || item) !== productId));
        refreshGlobalWishlist();
        setNotice('Item removed from wishlist');
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      alert('Unable to remove item from wishlist.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleMoveToCart = async (product) => {
    try {
      setMovingId(product._id);
      const res = await addItem(product._id, 1);
      if (res.success) {
        setNotice(`Moved "${product.name}" to cart! 🛍️`);
        setTimeout(() => setNotice(null), 3000);
      } else {
        alert(res.message || 'Could not add to cart');
      }
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="app-container" id="wishlist-page-root">
      <Navbar user={user} onLogoutSuccess={() => setUser(null)} />

      <main className="main-content">
        <div className="dashboard-container">
          {/* Header & Breadcrumb */}
          <div className="page-header-wrap">
            <div>
              <Link to="/products" className="details-back-link" id="wishlist-back-btn">
                <ArrowLeft size={16} />
                <span>Back to Catalog</span>
              </Link>
              <h1 className="page-main-title">
                <span>My Wishlist</span>
                <Heart size={26} style={{ color: '#ef4444', fill: '#ef4444' }} />
              </h1>
              <p className="page-sub-title">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for your next shopping run
              </p>
            </div>

            {wishlist.length > 0 && (
              <div className="header-action-btns">
                <Link to="/products" className="btn btn-secondary btn-sm">
                  <span>Continue Shopping</span>
                </Link>
                <Link to="/cart" className="btn btn-primary btn-sm">
                  <ShoppingBag size={16} />
                  <span>View Bag</span>
                </Link>
              </div>
            )}
          </div>

          {/* Toast Notice */}
          {notice && (
            <div className="floating-toast-alert" id="wishlist-action-notice">
              <Check size={18} />
              <span>{notice}</span>
            </div>
          )}

          {/* UI States */}
          {loading ? (
            <div className="loading-state-box" id="wishlist-loading-state">
              <div className="spinner"></div>
              <p>Loading your saved wishlist items...</p>
            </div>
          ) : error ? (
            <div className="empty-state-card" id="wishlist-error-state">
              <AlertCircle size={48} style={{ color: 'var(--error)', marginBottom: '1rem' }} />
              <h2>Something went wrong.</h2>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem auto 1.5rem', maxWidth: '420px' }}>
                {error}
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={loadWishlist}
                id="wishlist-retry-btn"
              >
                <span>Try Again</span>
              </button>
            </div>
          ) : wishlist.length === 0 ? (
            <div className="empty-state-card" id="wishlist-empty-state">
              <div className="empty-icon-circle-red">
                <Heart size={42} style={{ fill: '#ef4444', color: '#ef4444' }} />
              </div>
              <h2>Your wishlist is empty ❤️</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
                Don't let your favorite items slip away. Explore our latest drops and save items you love for easy checkout!
              </p>
              <Link to="/products" className="btn btn-primary btn-lg" id="wishlist-browse-products-btn">
                <ShoppingBag size={18} />
                <span>Explore Drops</span>
              </Link>
            </div>
          ) : (
            <div className="product-grid" id="wishlist-grid">
              {wishlist.map((item) => {
                const originalPrice = Math.round(item.price * 1.25);

                return (
                  <div key={item._id} className="snitch-product-card" id={`wishlist-card-${item._id}`}>
                    <div className="product-image-wrap">
                      <Link to={`/products/${item._id}`}>
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                          alt={item.name}
                          className="product-image"
                          loading="lazy"
                        />
                      </Link>

                      <div className="card-top-badges">
                        <span className="product-category-tag">{item.category}</span>
                        <span className="card-discount-badge">20% OFF</span>
                      </div>

                      {item.stock <= 5 && item.stock > 0 && (
                        <span className="product-stock-tag warning">Only {item.stock} left</span>
                      )}
                      {item.stock === 0 && (
                        <span className="product-stock-tag out">Out of Stock</span>
                      )}

                      {/* Remove Button on card top right */}
                      <button
                        type="button"
                        className="card-remove-wishlist-btn"
                        onClick={() => handleRemove(item._id)}
                        disabled={removingId === item._id}
                        title="Remove from Wishlist"
                        id={`remove-wishlist-${item._id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="product-card-body">
                      <Link to={`/products/${item._id}`} className="card-title-link">
                        <h3 className="product-card-title" title={item.name}>{item.name}</h3>
                      </Link>
                      <p className="product-card-desc">{item.description}</p>

                      <div className="product-card-pricing-row" style={{ margin: '0.75rem 0' }}>
                        <div>
                          <div className="product-card-price">₹{item.price.toLocaleString('en-IN')}</div>
                          <div className="mrp-strikethrough">MRP ₹{originalPrice.toLocaleString('en-IN')}</div>
                        </div>
                        <span className="tax-inclusive-tag">Free Shipping</span>
                      </div>

                      <div className="card-actions-grid">
                        <Link
                          to={`/products/${item._id}`}
                          className="btn btn-secondary btn-sm"
                          id={`view-details-${item._id}`}
                        >
                          <ExternalLink size={14} />
                          <span>Details</span>
                        </Link>

                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleMoveToCart(item)}
                          disabled={item.stock === 0 || movingId === item._id}
                          id={`move-to-cart-${item._id}`}
                        >
                          <ShoppingCart size={14} />
                          <span>{movingId === item._id ? 'Moving...' : item.stock === 0 ? 'Sold Out' : 'Move to Bag'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
