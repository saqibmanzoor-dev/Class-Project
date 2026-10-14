import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, Sparkles, Filter, 
  Check, ArrowRight, ShieldCheck, Truck, RefreshCw
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { getProfile, getProducts } from '../services/api';
import { useCart } from '../context/CartContext';

export default function Home({ user, setUser }) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addingId, setAddingId] = useState(null);
  const [addedNotice, setAddedNotice] = useState(null);

  const categories = ['All', 'Electronics', 'Fashion', 'Books', 'Home'];

  // 1. Verify Authentication
  useEffect(() => {
    let isMounted = true;
    const fetchCustomerProfile = async () => {
      try {
        const profileData = await getProfile();
        if (isMounted) {
          setUser(profileData);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Unauthorized session, redirecting to /login:', err);
        if (isMounted) {
          setUser(null);
          navigate('/login', { replace: true });
        }
      }
    };

    fetchCustomerProfile();
    return () => { isMounted = false; };
  }, [navigate, setUser]);

  // 2. Fetch Products
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        setLoadingProducts(true);
        const params = {};
        if (selectedCategory !== 'All') {
          params.category = selectedCategory;
        }
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        const data = await getProducts(params);
        if (isMounted && data.success) {
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to fetch catalog:', err);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };

    if (user) {
      fetchCatalog();
    }
    return () => { isMounted = false; };
  }, [user, selectedCategory, searchQuery]);

  const handleAddToCart = async (product) => {
    try {
      setAddingId(product._id);
      const res = await addItem(product._id, 1);
      if (res.success) {
        setAddedNotice(`Added "${product.name}" to cart!`);
        setTimeout(() => setAddedNotice(null), 3000);
      } else {
        alert(res.message || 'Could not add to cart');
      }
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen" id="home-loading-screen">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
          Authenticating secure session...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="app-container" id="home-page-root">
      <Navbar user={user} onLogoutSuccess={() => setUser(null)} />

      <main className="main-content">
        <div className="dashboard-container">
          {/* Hero Banner */}
          <div className="welcome-banner" style={{ marginBottom: '2rem' }}>
            <div className="welcome-header">
              <div>
                <span className="badge badge-accent">
                  <Sparkles size={14} /> Engineering Lab 06 — Checkout & Orders Ready
                </span>
                <h1 className="welcome-title" style={{ marginTop: '0.75rem' }}>
                  Welcome back, {user.fullName || 'Shopper'} 👋
                </h1>
                <p className="welcome-subtitle">
                  Explore verified catalog items, manage your cart, and complete your purchase with Razorpay Test Mode checkout.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate('/cart')}
                  id="hero-view-cart-btn"
                >
                  <ShoppingBag size={18} />
                  <span>Go to Cart</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/orders')}
                  id="hero-view-orders-btn"
                >
                  <span>My Orders</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Notification alert */}
            {addedNotice && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '0.75rem 1.25rem',
                  background: 'var(--success-light)',
                  border: '1px solid var(--success-border)',
                  color: '#065f46',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                <Check size={18} />
                <span>{addedNotice}</span>
              </div>
            )}
          </div>

          {/* Catalog Filter Controls */}
          <div className="catalog-toolbar">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search products by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="catalog-search-input"
              />
            </div>

            <div className="category-chips">
              <Filter size={16} style={{ color: 'var(--text-muted)', marginRight: '0.25rem' }} />
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  id={`cat-chip-${cat.toLowerCase()}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Collection`}
              </h2>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {products.length} products found
              </span>
            </div>

            {loadingProducts ? (
              <div style={{ padding: '4rem', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                <p style={{ color: 'var(--text-muted)' }}>Loading catalog items...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state-card" id="catalog-empty-state">
                <ShoppingBag size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
                <h3>No products found</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
                  No items matched your filter or search query. Try clearing your search or switching categories.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="product-grid" id="products-catalog-grid">
                {products.map((item) => (
                  <div key={item._id} className="product-card" id={`product-card-${item._id}`}>
                    <div className="product-image-wrap">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                        alt={item.name}
                        className="product-image"
                        loading="lazy"
                      />
                      <span className="product-category-tag">{item.category}</span>
                      {item.stock <= 5 && item.stock > 0 && (
                        <span className="product-stock-tag warning">Only {item.stock} left!</span>
                      )}
                      {item.stock === 0 && (
                        <span className="product-stock-tag out">Out of Stock</span>
                      )}
                    </div>

                    <div className="product-card-body">
                      <h3 className="product-card-title" title={item.name}>{item.name}</h3>
                      <p className="product-card-desc">{item.description}</p>

                      <div className="product-card-footer">
                        <div>
                          <span className="product-card-label">Price</span>
                          <div className="product-card-price">₹{item.price.toLocaleString('en-IN')}</div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={item.stock === 0 || addingId === item._id}
                          onClick={() => handleAddToCart(item)}
                          id={`add-to-cart-${item._id}`}
                        >
                          {addingId === item._id ? (
                            <>
                              <div className="spinner-sm"></div>
                              <span>Adding...</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={14} />
                              <span>{item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trust Badges */}
          <div className="trust-badges-grid" style={{ marginTop: '3.5rem', marginBottom: '2rem' }}>
            <div className="trust-badge-item">
              <ShieldCheck size={28} className="trust-icon" />
              <div>
                <h4>Razorpay Test Payments</h4>
                <p>Industry-standard HMAC SHA256 payment signature verification.</p>
              </div>
            </div>
            <div className="trust-badge-item">
              <Truck size={28} className="trust-icon" />
              <div>
                <h4>Fast Order Dispatch</h4>
                <p>Orders are snapshotted and queued immediately upon verification.</p>
              </div>
            </div>
            <div className="trust-badge-item">
              <RefreshCw size={28} className="trust-icon" />
              <div>
                <h4>Dynamic Cart State</h4>
                <p>Synchronized global cart state with server-side stock validation.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
