import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, Search, Sparkles, Filter, Heart,
  Check, ArrowRight, ShieldCheck, Truck, RefreshCw, 
  Eye, ArrowUpDown, Star, Zap, Flame, X
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getProfile, getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Home({ user, setUser }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isWishlisted, toggleItemInWishlist } = useWishlist();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [addingId, setAddingId] = useState(null);
  const [wishlistSavingId, setWishlistSavingId] = useState(null);
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

  // 2. Fetch Catalog
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
        if (sortBy) {
          params.sort = sortBy;
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
  }, [user, selectedCategory, searchQuery, sortBy]);

  const handleAddToCart = async (product) => {
    try {
      setAddingId(product._id);
      const res = await addItem(product._id, 1);
      if (res.success) {
        setAddedNotice(`Added "${product.name}" to cart! 🛒`);
        setTimeout(() => setAddedNotice(null), 3000);
      } else {
        alert(res.message || 'Could not add to cart');
      }
    } finally {
      setAddingId(null);
    }
  };

  const handleToggleWishlist = async (e, productId) => {
    e.stopPropagation();
    try {
      setWishlistSavingId(productId);
      const res = await toggleItemInWishlist(productId);
      if (res.success) {
        setAddedNotice(res.saved ? 'Saved to your Wishlist! ♥' : 'Removed from Wishlist');
        setTimeout(() => setAddedNotice(null), 2500);
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    } finally {
      setWishlistSavingId(null);
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
          {/* Editorial Hero Banner (Snitch-inspired aesthetic) */}
          <section className="snitch-hero-banner" id="catalog-hero-banner">
            <div className="hero-decor-orb-1"></div>
            <div className="hero-decor-orb-2"></div>

            <div className="hero-inner-content">
              <div className="hero-badge-pill">
                <Flame size={14} className="hero-flame-icon" />
                <span>DROP '26 • THE NEW STANDARD</span>
              </div>

              <h1 className="hero-headline">
                Engineered for Style. <br />
                <span className="hero-highlight-text">Crafted for Everyday Life.</span>
              </h1>

              <p className="hero-tagline">
                Explore handpicked electronics, premium streetwear, and everyday essentials with instant dispatch & verified buyer guarantees.
              </p>

              {/* Trust stats row */}
              <div className="hero-stats-row">
                <div className="hero-stat-item">
                  <div className="stat-stars">
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  </div>
                  <span>4.9 / 5.0 (15k+ Reviews)</span>
                </div>
                <div className="stat-divider"></div>
                <div className="hero-stat-item">
                  <Zap size={14} className="stat-icon-gold" />
                  <span>Express 2-Day Delivery</span>
                </div>
                <div className="stat-divider"></div>
                <div className="hero-stat-item">
                  <ShieldCheck size={14} className="stat-icon-green" />
                  <span>Razorpay Verified</span>
                </div>
              </div>

              {/* Action shortcuts */}
              <div className="hero-actions-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const el = document.getElementById('products-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  id="hero-explore-catalog-btn"
                >
                  <ShoppingBag size={18} />
                  <span>Explore Drop</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/wishlist')}
                  id="hero-wishlist-shortcut-btn"
                >
                  <Heart size={18} style={{ color: '#ef4444' }} />
                  <span>My Wishlist</span>
                </button>
              </div>
            </div>
          </section>

          {/* Toast Notification Alert */}
          {addedNotice && (
            <div className="floating-toast-alert" id="home-action-toast">
              <Check size={18} />
              <span>{addedNotice}</span>
            </div>
          )}

          {/* Catalog Filter Controls & Search Toolbar */}
          <div className="catalog-toolbar" id="products-section">
            {/* Search Input Box */}
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
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  className="search-clear-btn"
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Category Selector Chips & Sorting */}
            <div className="toolbar-controls-row">
              <div className="category-chips">
                <Filter size={15} style={{ color: 'var(--text-muted)', marginRight: '0.25rem' }} />
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                    id={`cat-chip-${cat.toLowerCase()}`}
                  >
                    <span>{cat}</span>
                  </button>
                ))}
              </div>

              {/* Sort Selector Dropdown */}
              <div className="sort-dropdown-wrap">
                <ArrowUpDown size={14} className="sort-icon" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                  id="catalog-sort-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid Section */}
          <div style={{ marginTop: '2rem' }}>
            <div className="section-header-row">
              <div>
                <h2 className="section-title">
                  {selectedCategory === 'All' ? 'Curated Products' : `${selectedCategory} Collection`}
                </h2>
                <p className="section-subtitle">
                  Showing {products.length} {products.length === 1 ? 'item' : 'items'} available for instant dispatch
                </p>
              </div>
            </div>

            {loadingProducts ? (
              <div className="loading-state-box" id="catalog-loading-box">
                <div className="spinner"></div>
                <p>Curating catalog items...</p>
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
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setSortBy('newest'); }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="product-grid" id="products-catalog-grid">
                {products.map((item) => {
                  const saved = isWishlisted(item._id);
                  const isSavingWishlist = wishlistSavingId === item._id;
                  const originalPrice = Math.round(item.price * 1.25);
                  const discountPercent = Math.round(((originalPrice - item.price) / originalPrice) * 100);

                  return (
                    <div key={item._id} className="snitch-product-card" id={`product-card-${item._id}`}>
                      {/* Image Wrap */}
                      <div className="product-image-wrap">
                        <Link to={`/products/${item._id}`} className="product-img-link">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                            alt={item.name}
                            className="product-image"
                            loading="lazy"
                          />
                        </Link>

                        {/* Top Badges */}
                        <div className="card-top-badges">
                          <span className="product-category-tag">{item.category}</span>
                          {discountPercent > 0 && (
                            <span className="card-discount-badge">{discountPercent}% OFF</span>
                          )}
                        </div>

                        {/* Urgency stock indicator */}
                        {item.stock <= 5 && item.stock > 0 && (
                          <span className="product-stock-tag warning">Only {item.stock} left!</span>
                        )}
                        {item.stock === 0 && (
                          <span className="product-stock-tag out">Out of Stock</span>
                        )}

                        {/* Floating Wishlist Heart Button */}
                        <button
                          type="button"
                          className={`card-wishlist-btn ${saved ? 'active' : ''}`}
                          onClick={(e) => handleToggleWishlist(e, item._id)}
                          disabled={isSavingWishlist}
                          title={saved ? 'Remove from Wishlist' : 'Add to Wishlist'}
                          id={`wishlist-btn-${item._id}`}
                        >
                          <Heart 
                            size={18} 
                            style={{ 
                              color: saved ? '#ef4444' : '#475569', 
                              fill: saved ? '#ef4444' : 'none' 
                            }} 
                          />
                        </button>
                      </div>

                      {/* Card Content */}
                      <div className="product-card-body">
                        {/* Rating stars & review count */}
                        <div className="card-rating-row">
                          <div className="rating-pill">
                            <Star size={12} fill="#f59e0b" color="#f59e0b" />
                            <span>4.8</span>
                          </div>
                          <span className="rating-reviews-count">(94 reviews)</span>
                        </div>

                        {/* Product Title */}
                        <Link to={`/products/${item._id}`} className="card-title-link">
                          <h3 className="product-card-title" title={item.name}>{item.name}</h3>
                        </Link>
                        <p className="product-card-desc">{item.description}</p>

                        {/* Pricing section with original MRP and discount */}
                        <div className="product-card-pricing-row">
                          <div>
                            <div className="product-card-price">₹{item.price.toLocaleString('en-IN')}</div>
                            <div className="mrp-strikethrough">MRP ₹{originalPrice.toLocaleString('en-IN')}</div>
                          </div>
                          <span className="tax-inclusive-tag">incl. taxes</span>
                        </div>

                        {/* Dual Action Buttons */}
                        <div className="card-actions-grid">
                          <Link
                            to={`/products/${item._id}`}
                            className="btn btn-secondary btn-sm"
                            id={`view-details-${item._id}`}
                          >
                            <Eye size={14} />
                            <span>Details</span>
                          </Link>

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
                                <span>{item.stock === 0 ? 'Sold Out' : 'Add to Bag'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
