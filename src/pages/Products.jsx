import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  ShoppingBag, Search, Sparkles, Filter, Heart,
  Check, ArrowRight, ShieldCheck, Truck, RefreshCw, 
  Eye, ArrowUpDown, Star, Zap, Flame, X, AlertCircle, ShoppingCart
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Products({ user, setUser }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();
  const { isWishlisted, toggleItemInWishlist } = useWishlist();

  // Read initial category from URL if present (e.g. /products?category=Fashion)
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('newest');
  const [addingId, setAddingId] = useState(null);
  const [wishlistSavingId, setWishlistSavingId] = useState(null);
  const [addedNotice, setAddedNotice] = useState(null);
  const [guestAuthPrompt, setGuestAuthPrompt] = useState(null);

  const categories = ['All', 'Electronics', 'Fashion', 'Books', 'Home'];

  // Sync category changes with URL query parameter
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams, { replace: true });
  };

  // Fetch Catalog from Backend (Public Endpoint - Works for both Guests and Users)
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

    fetchCatalog();
    return () => { isMounted = false; };
  }, [selectedCategory, searchQuery, sortBy]);

  // Add to Cart handler
  const handleAddToCart = async (product) => {
    if (!user) {
      setGuestAuthPrompt(`Please sign in to add "${product.name}" to your bag.`);
      setTimeout(() => setGuestAuthPrompt(null), 4000);
      return;
    }

    try {
      setAddingId(product._id);
      const res = await addItem(product._id, 1);
      if (res.success) {
        setAddedNotice(`Added "${product.name}" to your bag! 🛒`);
        setTimeout(() => setAddedNotice(null), 3000);
      } else {
        alert(res.message || 'Could not add to cart');
      }
    } finally {
      setAddingId(null);
    }
  };

  // Toggle Wishlist handler
  const handleToggleWishlist = async (e, product) => {
    e.stopPropagation();
    if (!user) {
      setGuestAuthPrompt(`Please sign in to save "${product.name}" to your wishlist.`);
      setTimeout(() => setGuestAuthPrompt(null), 4000);
      return;
    }

    try {
      setWishlistSavingId(product._id);
      const res = await toggleItemInWishlist(product._id);
      if (res.success) {
        setAddedNotice(res.saved ? `Saved "${product.name}" to Wishlist! ♥` : `Removed from Wishlist`);
        setTimeout(() => setAddedNotice(null), 2500);
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    } finally {
      setWishlistSavingId(null);
    }
  };

  return (
    <div className="app-container" id="products-page-root">
      <Navbar user={user} onLogoutSuccess={() => setUser(null)} />

      <main className="main-content">
        <div className="dashboard-container">
          {/* Breadcrumb & Page Header */}
          <div className="catalog-header-bar" style={{ marginBottom: '1.5rem', paddingTop: '1rem' }}>
            <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
              <span style={{ margin: '0 0.5rem' }}>/</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Catalogue</span>
              {selectedCategory !== 'All' && (
                <>
                  <span style={{ margin: '0 0.5rem' }}>/</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{selectedCategory}</span>
                </>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
                  {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Collection`}
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
                  Explore verified essentials with 24-hour dispatch and guaranteed authenticity.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <span>Showing <strong>{products.length}</strong> items</span>
              </div>
            </div>
          </div>

          {/* Toast Notification Alert */}
          {addedNotice && (
            <div className="floating-toast-alert" id="products-action-toast">
              <Check size={18} />
              <span>{addedNotice}</span>
            </div>
          )}

          {/* Guest Auth Prompt Banner */}
          {guestAuthPrompt && (
            <div 
              className="floating-toast-alert" 
              style={{ background: '#0f172a', borderLeft: '4px solid var(--primary)', display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              <AlertCircle size={20} style={{ color: '#38bdf8' }} />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <span style={{ display: 'block', fontSize: '0.875rem' }}>{guestAuthPrompt}</span>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/login')}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                Sign In
              </button>
            </div>
          )}

          {/* Catalog Filter Controls & Search Toolbar */}
          <div className="catalog-toolbar" id="products-toolbar">
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
                    onClick={() => handleCategoryChange(cat)}
                    id={`cat-filter-${cat.toLowerCase()}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="sort-control">
                <ArrowUpDown size={15} className="sort-icon" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                  id="catalog-sort-select"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Alphabetical: A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Tags */}
          {(selectedCategory !== 'All' || searchQuery) && (
            <div className="active-filters-bar">
              <span className="filters-label">Active Filters:</span>
              {selectedCategory !== 'All' && (
                <span className="filter-tag">
                  Category: {selectedCategory}
                  <button type="button" onClick={() => handleCategoryChange('All')}><X size={12} /></button>
                </span>
              )}
              {searchQuery && (
                <span className="filter-tag">
                  Query: "{searchQuery}"
                  <button type="button" onClick={() => setSearchQuery('')}><X size={12} /></button>
                </span>
              )}
              <button 
                type="button" 
                className="btn-clear-all-filters"
                onClick={() => { handleCategoryChange('All'); setSearchQuery(''); }}
              >
                Clear All
              </button>
            </div>
          )}

          {/* Loading State Skeleton */}
          {loadingProducts ? (
            <div className="products-grid-skeleton" id="products-loading-skeleton">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="product-card-skeleton">
                  <div className="skeleton-image-box"></div>
                  <div className="skeleton-line title"></div>
                  <div className="skeleton-line price"></div>
                  <div className="skeleton-line btn"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="empty-catalog-state" id="empty-catalog-box">
              <div className="empty-icon-circle">
                <ShoppingBag size={48} />
              </div>
              <h3>No products found</h3>
              <p>We couldn't find any products matching your selected filters or search terms.</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  handleCategoryChange('All');
                  setSearchQuery('');
                  setSortBy('newest');
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Product Cards Grid */
            <div className="products-grid" id="catalog-products-grid">
              {products.map((product) => {
                const wishlisted = isWishlisted(product._id);
                const discountRate = product.category === 'Fashion' ? 25 : product.category === 'Electronics' ? 15 : 20;
                const originalPrice = Math.round(product.price * (1 + discountRate / 100));

                return (
                  <article 
                    key={product._id} 
                    className="product-card" 
                    id={`product-card-${product._id}`}
                  >
                    {/* Media Thumbnail Container */}
                    <div 
                      className="product-image-wrap"
                      onClick={() => navigate(`/products/${product._id}`)}
                      title={`View details of ${product.name}`}
                    >
                      <img
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'}
                        alt={product.name}
                        className="product-image"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                        }}
                      />

                      {/* Floating Category Badge */}
                      <span className="product-category-badge">
                        {product.category || 'General'}
                      </span>

                      {/* Floating Discount Tag */}
                      <span className="product-discount-pill">
                        {discountRate}% OFF
                      </span>

                      {/* Wishlist Heart Toggle Button */}
                      <button
                        type="button"
                        className={`product-wishlist-toggle ${wishlisted ? 'active' : ''}`}
                        onClick={(e) => handleToggleWishlist(e, product)}
                        disabled={wishlistSavingId === product._id}
                        id={`wishlist-toggle-${product._id}`}
                        title={wishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                      >
                        <Heart 
                          size={18} 
                          fill={wishlisted ? '#ef4444' : 'none'} 
                          color={wishlisted ? '#ef4444' : '#0f172a'} 
                        />
                      </button>

                      {/* Stock Warning Badge if Low */}
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="product-low-stock-badge">
                          Only {product.stock} left!
                        </span>
                      )}
                      {product.stock === 0 && (
                        <div className="product-out-of-stock-overlay">
                          <span>Sold Out</span>
                        </div>
                      )}
                    </div>

                    {/* Product Metadata & Action Section */}
                    <div className="product-content">
                      <div className="product-title-row">
                        <Link 
                          to={`/products/${product._id}`} 
                          className="product-title-link"
                          title={product.name}
                        >
                          <h3 className="product-name">{product.name}</h3>
                        </Link>
                      </div>

                      <p className="product-description-snippet">
                        {product.description || 'Premium design with engineered durability and comfort.'}
                      </p>

                      {/* Ratings Strip */}
                      <div className="product-rating-row">
                        <div className="rating-pill">
                          <Star size={12} fill="#f59e0b" color="#f59e0b" />
                          <span>4.8</span>
                        </div>
                        <span className="rating-count">(94 reviews)</span>
                        <span className="stock-dot-status">
                          <span className={`dot ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}></span>
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>

                      {/* Price Section */}
                      <div className="product-pricing-wrap">
                        <div className="price-stack">
                          <span className="current-price">₹{product.price.toLocaleString('en-IN')}</span>
                          <span className="original-price">₹{originalPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <span className="savings-badge">Save ₹{(originalPrice - product.price).toLocaleString('en-IN')}</span>
                      </div>

                      {/* Quick Add to Cart CTA */}
                      <div className="product-card-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-block btn-add-bag"
                          onClick={() => handleAddToCart(product)}
                          disabled={addingId === product._id || product.stock <= 0}
                          id={`add-to-cart-btn-${product._id}`}
                        >
                          <ShoppingCart size={16} />
                          <span>
                            {product.stock <= 0
                              ? 'Out of Stock'
                              : addingId === product._id
                              ? 'Adding...'
                              : 'Add to Bag'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </article>
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
