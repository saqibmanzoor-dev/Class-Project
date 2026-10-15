import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, Sparkles, Heart, Check, ArrowRight, 
  ShieldCheck, Truck, RefreshCw, Star, Zap, Flame, 
  ChevronRight, Award, Compass, Layers, ShoppingCart, 
  Mail, Copy, AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Home({ user, setUser }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isWishlisted, toggleItemInWishlist } = useWishlist();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeTab, setActiveTab] = useState('trending');
  const [addingId, setAddingId] = useState(null);
  const [wishlistSavingId, setWishlistSavingId] = useState(null);
  const [addedNotice, setAddedNotice] = useState(null);
  const [guestAuthPrompt, setGuestAuthPrompt] = useState(null);

  // VIP Newsletter State
  const [emailInput, setEmailInput] = useState('');
  const [claimedDiscount, setClaimedDiscount] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch Live Featured Products from Backend (Public Endpoint - Zero forced auth redirects)
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        setLoadingProducts(true);
        const data = await getProducts();
        if (isMounted && data.success) {
          setFeaturedProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to load home featured products:', err);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };

    fetchCatalog();
    return () => { isMounted = false; };
  }, []);

  // Filter products based on active tab
  const displayedProducts = featuredProducts.filter((p) => {
    if (activeTab === 'trending') return true;
    if (activeTab === 'fashion') return p.category === 'Fashion';
    if (activeTab === 'tech') return p.category === 'Electronics';
    return true;
  }).slice(0, 8);

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

  const handleClaimVIP = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setClaimedDiscount(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('SHOPKART15');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="app-container" id="home-page-root">
      <Navbar user={user} onLogoutSuccess={() => setUser(null)} />

      <main className="main-content">
        <div className="dashboard-container" style={{ paddingBottom: '4rem' }}>
          
          {/* Toast Notification Alert */}
          {addedNotice && (
            <div className="floating-toast-alert" id="home-action-toast">
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

          {/* 1. Grand Editorial Hero Banner (Snitch-inspired Luxury) */}
          <section className="snitch-hero-banner" id="home-hero-banner">
            <div className="hero-decor-orb-1"></div>
            <div className="hero-decor-orb-2"></div>

            <div className="hero-inner-content">
              <div className="hero-badge-pill">
                <Flame size={14} className="hero-flame-icon" />
                <span>CAPSULE DROP '26 • THE NEW STANDARD</span>
              </div>

              <h1 className="hero-headline">
                Engineered for Style. <br />
                <span className="hero-highlight-text">Crafted for Everyday Presence.</span>
              </h1>

              <p className="hero-tagline">
                Discover limited drop streetwear, high-precision tech, and design-led lifestyle goods. 
                Zero fast-fashion shortcuts. Guaranteed 100% authentic with 24-hour dispatch.
              </p>

              {/* Trust stats row */}
              <div className="hero-stats-row">
                <div className="hero-stat-item">
                  <div className="stat-stars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                    ))}
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
                <Link
                  to="/products"
                  className="btn btn-primary"
                  id="hero-explore-catalog-btn"
                >
                  <ShoppingBag size={18} />
                  <span>Explore Collection</span>
                </Link>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    const el = document.getElementById('featured-drops-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  id="hero-trending-scroll-btn"
                >
                  <Sparkles size={18} style={{ color: '#a5b4fc' }} />
                  <span>Trending Drops</span>
                </button>
              </div>
            </div>
          </section>

          {/* 2. Curated Category Spotlight Tiles */}
          <section className="home-categories-section" style={{ marginBottom: '4rem' }}>
            <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)' }}>
                  Curated Categories
                </span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
                  Explore by Silhouette & Edit
                </h2>
              </div>
              <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
                <span>View All</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {[
                {
                  id: 'fashion',
                  title: 'Streetwear & Apparel',
                  items: '24+ Silhouettes',
                  desc: 'Heavyweight oversized tees, relaxed denim & statement layers',
                  image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80',
                  cat: 'Fashion',
                },
                {
                  id: 'tech',
                  title: 'Smart Tech & Audio',
                  items: '18+ Devices',
                  desc: 'Studio-grade acoustics, active noise cancellation & wearables',
                  image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
                  cat: 'Electronics',
                },
                {
                  id: 'home',
                  title: 'Modern Home & Living',
                  items: '12+ Pieces',
                  desc: 'Architectural ceramics, ambient workspace lamps & desk essentials',
                  image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
                  cat: 'Home',
                },
                {
                  id: 'books',
                  title: 'Curated Reads & Art',
                  items: '15+ Titles',
                  desc: 'Contemporary design monographs, architecture & modern classics',
                  image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
                  cat: 'Books',
                },
              ].map((categoryItem) => (
                <div
                  key={categoryItem.id}
                  onClick={() => navigate(`/products?category=${categoryItem.cat}`)}
                  style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    height: '280px',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                >
                  <img
                    src={categoryItem.image}
                    alt={categoryItem.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.3) 60%, rgba(15, 23, 42, 0) 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '1.5rem',
                      color: '#ffffff',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a5b4fc', marginBottom: '0.25rem' }}>
                      {categoryItem.items}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: '#ffffff' }}>
                      {categoryItem.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                      {categoryItem.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Featured Drops & Bestsellers (Live Backend API Products) */}
          <section id="featured-drops-section" style={{ marginBottom: '4.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)' }}>
                  Fresh From The Studio
                </span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
                  Featured Drops & Bestsellers
                </h2>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', background: 'var(--surface)', padding: '0.35rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--surface-border)', gap: '0.25rem' }}>
                <button
                  type="button"
                  className={`category-chip ${activeTab === 'trending' ? 'active' : ''}`}
                  onClick={() => setActiveTab('trending')}
                  style={{ border: 'none' }}
                >
                  All Drops
                </button>
                <button
                  type="button"
                  className={`category-chip ${activeTab === 'fashion' ? 'active' : ''}`}
                  onClick={() => setActiveTab('fashion')}
                  style={{ border: 'none' }}
                >
                  Streetwear
                </button>
                <button
                  type="button"
                  className={`category-chip ${activeTab === 'tech' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tech')}
                  style={{ border: 'none' }}
                >
                  Tech & Gear
                </button>
              </div>
            </div>

            {loadingProducts ? (
              <div className="products-grid-skeleton">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="product-card-skeleton">
                    <div className="skeleton-image-box"></div>
                    <div className="skeleton-line title"></div>
                    <div className="skeleton-line price"></div>
                  </div>
                ))}
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="empty-catalog-state" style={{ padding: '3rem' }}>
                <ShoppingBag size={40} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
                <h3>No products available</h3>
                <p>Check back soon for upcoming capsule drops.</p>
              </div>
            ) : (
              <div className="products-grid">
                {displayedProducts.map((product) => {
                  const wishlisted = isWishlisted(product._id);
                  const discountRate = product.category === 'Fashion' ? 25 : product.category === 'Electronics' ? 15 : 20;
                  const originalPrice = Math.round(product.price * (1 + discountRate / 100));

                  return (
                    <article key={product._id} className="product-card" id={`home-product-${product._id}`}>
                      <div 
                        className="product-image-wrap"
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        <img
                          src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'}
                          alt={product.name}
                          className="product-image"
                          loading="lazy"
                        />
                        <span className="product-category-badge">{product.category || 'General'}</span>
                        <span className="product-discount-pill">{discountRate}% OFF</span>

                        <button
                          type="button"
                          className={`product-wishlist-toggle ${wishlisted ? 'active' : ''}`}
                          onClick={(e) => handleToggleWishlist(e, product)}
                          disabled={wishlistSavingId === product._id}
                        >
                          <Heart 
                            size={18} 
                            fill={wishlisted ? '#ef4444' : 'none'} 
                            color={wishlisted ? '#ef4444' : '#0f172a'} 
                          />
                        </button>
                      </div>

                      <div className="product-content">
                        <Link to={`/products/${product._id}`} className="product-title-link">
                          <h3 className="product-name">{product.name}</h3>
                        </Link>

                        <div className="product-rating-row">
                          <div className="rating-pill">
                            <Star size={12} fill="#f59e0b" color="#f59e0b" />
                            <span>4.8</span>
                          </div>
                          <span className="rating-count">(94 reviews)</span>
                          <span className="stock-dot-status">
                            <span className="dot in-stock"></span>
                            In Stock
                          </span>
                        </div>

                        <div className="product-pricing-wrap">
                          <div className="price-stack">
                            <span className="current-price">₹{product.price.toLocaleString('en-IN')}</span>
                            <span className="original-price">₹{originalPrice.toLocaleString('en-IN')}</span>
                          </div>
                          <span className="savings-badge">Save ₹{(originalPrice - product.price).toLocaleString('en-IN')}</span>
                        </div>

                        <div className="product-card-actions">
                          <button
                            type="button"
                            className="btn btn-primary btn-block btn-add-bag"
                            onClick={() => handleAddToCart(product)}
                            disabled={addingId === product._id || product.stock <= 0}
                          >
                            <ShoppingCart size={16} />
                            <span>
                              {product.stock <= 0 ? 'Out of Stock' : addingId === product._id ? 'Adding...' : 'Add to Bag'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* View Full Catalogue CTA Banner */}
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link to="/products" className="btn btn-secondary" style={{ padding: '0.85rem 2.25rem', fontSize: '1rem', fontWeight: 700 }}>
                <span>Explore Full Catalogue ({featuredProducts.length} Products)</span>
                <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
              </Link>
            </div>
          </section>

          {/* 4. The Studio Philosophy & Craftsmanship Section (Snitch-inspired) */}
          <section
            style={{
              background: 'linear-gradient(135deg, #090d16 0%, #172033 100%)',
              borderRadius: 'var(--radius-xl)',
              padding: '4rem 3rem',
              color: '#ffffff',
              marginBottom: '4.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#818cf8', display: 'block', marginBottom: '0.75rem' }}>
                Studio Manifesto
              </span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 1.25rem 0' }}>
                Unapologetic Minimalism. <br />
                <span style={{ background: 'linear-gradient(135deg, #a5b4fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Zero Compromises.
                </span>
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                We believe that modern fashion and everyday tech should be designed with uncompromising integrity. 
                From 280 GSM custom-knit French Terry cotton to precision matte-black finishes, everything we ship is engineered for presence and endurance.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff' }}>280 GSM</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Heavyweight Cotton</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff' }}>50k+</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Satisfied Shoppers</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff' }}>24h</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Avg. Dispatch Time</div>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '380px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80"
                alt="Studio craft editorial"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Limited Edition</span>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>The Heavyweight Studio Capsule</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>Reinforced drop-shoulder cut • Silicon enzyme washed</div>
              </div>
            </div>
          </section>

          {/* 5. Why ShopKart Studio (Four Pillars of Trust) */}
          <section style={{ marginBottom: '4.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)' }}>
                Guaranteed Satisfaction
              </span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: '0.25rem 0 0 0' }}>
                Why Shoppers Choose ShopKart
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {[
                {
                  icon: <Truck size={28} style={{ color: 'var(--primary)' }} />,
                  title: 'Free Express Shipping',
                  desc: 'All prepaid orders above ₹999 qualify for prioritized air dispatch within 24 hours.',
                },
                {
                  icon: <RefreshCw size={28} style={{ color: '#06b6d4' }} />,
                  title: '7-Day Easy Returns',
                  desc: 'Hassle-free doorstep exchanges or full refunds with zero questions asked.',
                },
                {
                  icon: <ShieldCheck size={28} style={{ color: '#10b981' }} />,
                  title: '100% Quality Inspected',
                  desc: 'Every garment and gadget undergoes rigorous multi-point verification before packing.',
                },
                {
                  icon: <Award size={28} style={{ color: '#f59e0b' }} />,
                  title: '256-Bit Razorpay Protected',
                  desc: 'End-to-end encrypted checkout supporting UPI, Credit Cards, Netbanking & EMI.',
                },
              ].map((perk, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '2rem 1.75rem',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <div style={{ marginBottom: '1.25rem' }}>{perk.icon}</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
                    {perk.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    {perk.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Verified Customer Testimonials & Reviews */}
          <section style={{ marginBottom: '4.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)' }}>
                  Customer Reviews
                </span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
                  Loved by Over 50,000+ Customers
                </h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex' }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>4.9 out of 5</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[
                {
                  name: 'Aarav Mehta',
                  city: 'Bengaluru',
                  rating: 5,
                  title: 'The fabric quality is unreal!',
                  review: 'Ordered the oversized drop-shoulder tee and it fits like luxury streetwear that normally costs 4x more. Arrived in 2 days in premium packaging.',
                  product: 'Heavyweight Studio Tee (L)',
                },
                {
                  name: 'Sneha Kapoor',
                  city: 'Mumbai',
                  rating: 5,
                  title: 'Seamless checkout with Razorpay',
                  review: 'Paid with UPI in under 10 seconds. The wireless ANC headphones sound crystal-clear and the battery life lasts all week during my commute.',
                  product: 'Wireless Studio ANC Headphones',
                },
                {
                  name: 'Vikramaditya Rao',
                  city: 'Delhi NCR',
                  rating: 5,
                  title: 'Exceeded all expectations',
                  review: 'First time buying from ShopKart and I am hooked. The fit, the finish, and the attention to detail on the collars and seams is top-notch.',
                  product: 'Tactical Oversized Cargo Pant',
                },
              ].map((testimonial, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.75rem',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.75rem' }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
                      "{testimonial.title}"
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                      {testimonial.review}
                    </p>
                  </div>

                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-main)' }}>{testimonial.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{testimonial.city} • Verified Buyer</div>
                    </div>
                    <span style={{ fontSize: '0.7rem', background: 'var(--surface-alt)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {testimonial.product}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 7. VIP Inner Circle Newsletter Section */}
          <section
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              borderRadius: 'var(--radius-xl)',
              padding: '3.5rem 2.5rem',
              color: '#ffffff',
              textAlign: 'center',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#a5b4fc', display: 'block', marginBottom: '0.5rem' }}>
                Join The Inner Circle
              </span>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 0.75rem 0' }}>
                Get 15% Off Your Next Haul
              </h2>
              <p style={{ color: '#c7d2fe', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Subscribe to our private weekly drops letter for secret sales, exclusive early-access capsules, and style edits.
              </p>

              {claimedDiscount ? (
                <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'inline-flex', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 700 }}>YOUR EXCLUSIVE COUPON CODE</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.1em', color: '#ffffff' }}>SHOPKART15</div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleCopyCode}
                    style={{ background: '#ffffff', color: '#1e1b4b', fontWeight: 800 }}
                  >
                    {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleClaimVIP} style={{ display: 'flex', gap: '0.75rem', maxWidth: '480px', margin: '0 auto', flexWrap: 'wrap' }}>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: '240px',
                      padding: '0.85rem 1.25rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      outline: 'none',
                      fontSize: '0.95rem',
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ background: '#ffffff', color: '#1e1b4b', fontWeight: 800, borderRadius: 'var(--radius-full)', padding: '0.85rem 1.75rem' }}
                  >
                    Claim 15% Off
                  </button>
                </form>
              )}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
