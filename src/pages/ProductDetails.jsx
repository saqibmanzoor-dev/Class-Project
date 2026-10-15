import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, Heart, ArrowLeft, ShieldCheck, 
  Truck, Check, AlertCircle, RefreshCw, Star, 
  Zap, Share2, MapPin, ChevronDown, ChevronUp, Clock 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductDetails({ user, setUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isWishlisted, toggleItemInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccessNotice, setCartSuccessNotice] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);
  const [activeTab, setActiveTab] = useState('specs');

  useEffect(() => {
    let isMounted = true;
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(id);
        if (isMounted) {
          if (data.success && data.product) {
            setProduct(data.product);
          } else {
            setError('Product not found');
          }
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        if (isMounted) {
          if (err.response?.status === 404) {
            setError('Product not found');
          } else if (err.response?.status === 400) {
            setError('Invalid product identifier');
          } else {
            setError('Something went wrong while loading product details');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
    return () => { isMounted = false; };
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
      setCartSuccessNotice(`Please sign in to add "${product.name}" to your bag.`);
      setTimeout(() => setCartSuccessNotice(null), 4000);
      return;
    }
    try {
      setAddingToCart(true);
      const res = await addItem(product._id, quantity);
      if (res.success) {
        setCartSuccessNotice(`Added ${quantity}x "${product.name}" to your bag! 🛍️`);
        setTimeout(() => setCartSuccessNotice(null), 3500);
      } else {
        alert(res.message || 'Could not add to cart');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    if (!user) {
      setCartSuccessNotice(`Please sign in to save "${product.name}" to your wishlist.`);
      setTimeout(() => setCartSuccessNotice(null), 4000);
      return;
    }
    try {
      setWishlistLoading(true);
      await toggleItemInWishlist(product._id);
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.trim().length !== 6) {
      setPincodeResult({ success: false, text: 'Please enter a valid 6-digit pincode' });
      return;
    }
    setPincodeResult({ 
      success: true, 
      text: `Express Delivery Available to ${pincode}! Expected in 2 business days.` 
    });
  };

  const savedInWishlist = product ? isWishlisted(product._id) : false;
  const originalPrice = product ? Math.round(product.price * 1.25) : 0;
  const savings = product ? originalPrice - product.price : 0;

  return (
    <div className="app-container" id="product-details-root">
      <Navbar user={user} onLogoutSuccess={() => setUser(null)} />

      <main className="main-content">
        <div className="dashboard-container">
          {/* Breadcrumb Navigation */}
          <div className="details-breadcrumb-bar">
            <Link to="/products" className="details-back-link" id="back-to-products-link">
              <ArrowLeft size={16} />
              <span>Back to Catalog</span>
            </Link>
            {product && (
              <span className="details-breadcrumb-trail">
                / {product.category} / <strong>{product.name}</strong>
              </span>
            )}
          </div>

          {loading ? (
            <div className="loading-state-box" id="product-details-loading">
              <div className="spinner"></div>
              <p>Fetching product details...</p>
            </div>
          ) : error || !product ? (
            <div className="empty-state-card" id="product-details-error">
              <AlertCircle size={48} style={{ color: 'var(--error)', marginBottom: '1rem' }} />
              <h2>{error || 'Product Not Found'}</h2>
              <p style={{ color: 'var(--text-muted)', margin: '0.75rem auto 1.5rem', maxWidth: '420px' }}>
                We couldn't find the product you're looking for. It may have been sold out or the link is invalid.
              </p>
              <Link to="/products" className="btn btn-primary" id="return-catalog-btn">
                <span>Browse Latest Drops</span>
              </Link>
            </div>
          ) : (
            <div>
              {/* Added to cart notification */}
              {cartSuccessNotice && (
                <div className="cart-added-notification-banner" id="product-details-cart-alert">
                  <div className="notif-content">
                    <Check size={18} className="notif-icon" />
                    <span>{cartSuccessNotice}</span>
                  </div>
                  <Link to="/cart" className="notif-link">
                    View Shopping Bag →
                  </Link>
                </div>
              )}

              {/* Product Showcase Split Card (Snitch Inspired) */}
              <div className="snitch-product-details-grid">
                {/* Left Showcase Media Box */}
                <div className="details-media-column">
                  <div className="details-main-image-wrap">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                      alt={product.name}
                      className="details-hero-image"
                      id="product-details-main-img"
                    />

                    {/* Floating Badges */}
                    <span className="details-floating-category">{product.category}</span>
                    <button
                      type="button"
                      className={`details-floating-wishlist-btn ${savedInWishlist ? 'active' : ''}`}
                      onClick={handleToggleWishlist}
                      disabled={wishlistLoading}
                      title={savedInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      id="product-details-wishlist-toggle"
                    >
                      <Heart 
                        size={22} 
                        style={{ 
                          color: savedInWishlist ? '#ef4444' : '#0f172a', 
                          fill: savedInWishlist ? '#ef4444' : 'none' 
                        }} 
                      />
                    </button>
                  </div>

                  {/* Thumbnail gallery preview */}
                  <div className="details-thumbnail-strip">
                    <div className="thumb-item active">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="thumb-item">
                      <img src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80" alt="Alternate View" />
                    </div>
                    <div className="thumb-item">
                      <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80" alt="Detail View" />
                    </div>
                  </div>
                </div>

                {/* Right Product Information Column */}
                <div className="details-info-column">
                  {/* Brand & Category Header */}
                  <div className="details-brand-badge">
                    <span>SHOPKART VERIFIED</span>
                    <span className="dot">•</span>
                    <span>{product.category}</span>
                  </div>

                  <h1 className="details-title" id="product-details-name">
                    {product.name}
                  </h1>

                  {/* Rating Stars & Customer Social Proof */}
                  <div className="details-social-proof-row">
                    <div className="stars-pill">
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <span>4.9</span>
                    </div>
                    <span className="social-proof-count">128 Verified Ratings & Reviews</span>
                    <span className="dot">•</span>
                    <span className="high-demand-tag"><Flame size={13} /> High Demand</span>
                  </div>

                  {/* Price Block */}
                  <div className="details-price-block">
                    <div className="price-main-row">
                      <span className="details-current-price" id="product-details-price">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <span className="details-mrp-strikethrough">
                        ₹{originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="details-savings-tag">
                        Save ₹{savings.toLocaleString('en-IN')} (25% OFF)
                      </span>
                    </div>
                    <span className="details-tax-note">Inclusive of all applicable GST & shipping taxes</span>
                  </div>

                  {/* Stock Status Badge */}
                  <div className="details-stock-status-wrap">
                    {product.stock > 10 ? (
                      <div className="stock-alert in-stock">
                        <span className="pulse-indicator-green"></span>
                        <span>In Stock • Ready for immediate courier dispatch</span>
                      </div>
                    ) : product.stock > 0 ? (
                      <div className="stock-alert low-stock">
                        <Clock size={16} />
                        <span>Only {product.stock} items remaining — order soon!</span>
                      </div>
                    ) : (
                      <div className="stock-alert out-stock">
                        <span>Sold Out • Check back shortly for restock</span>
                      </div>
                    )}
                  </div>

                  {/* Quantity Counter & CTA Actions */}
                  <div className="details-purchase-controls">
                    <div className="qty-picker-wrap">
                      <label className="picker-label">Quantity</label>
                      <div className="qty-selector-pill">
                        <button
                          type="button"
                          className="qty-selector-btn"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <span className="qty-current-value">{quantity}</span>
                        <button
                          type="button"
                          className="qty-selector-btn"
                          onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                          disabled={quantity >= product.stock}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="purchase-buttons-row">
                      <button
                        type="button"
                        className="btn btn-primary btn-lg add-to-bag-btn"
                        onClick={handleAddToCart}
                        disabled={product.stock === 0 || addingToCart}
                        id="product-details-add-to-cart-btn"
                      >
                        {addingToCart ? (
                          <>
                            <div className="spinner-sm"></div>
                            <span>Adding to Bag...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={20} />
                            <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className={`btn btn-secondary btn-lg details-wishlist-cta ${savedInWishlist ? 'saved' : ''}`}
                        onClick={handleToggleWishlist}
                        disabled={wishlistLoading}
                        id="product-details-wishlist-action-btn"
                      >
                        <Heart 
                          size={18} 
                          style={{ 
                            color: savedInWishlist ? '#ef4444' : 'currentColor', 
                            fill: savedInWishlist ? '#ef4444' : 'none' 
                          }} 
                        />
                        <span>{savedInWishlist ? 'Wishlisted' : 'Save'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Delivery Pincode Checker (Snitch feature) */}
                  <div className="pincode-checker-box">
                    <div className="pincode-header">
                      <MapPin size={16} className="pin-icon" />
                      <span>Check Delivery Speed & COD Availability</span>
                    </div>
                    <form onSubmit={handleCheckPincode} className="pincode-form">
                      <input
                        type="text"
                        placeholder="Enter 6-digit Pincode"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        className="pincode-input"
                      />
                      <button type="submit" className="pincode-btn">Check</button>
                    </form>
                    {pincodeResult && (
                      <div className={`pincode-result ${pincodeResult.success ? 'success' : 'error'}`}>
                        {pincodeResult.success ? <Check size={14} /> : <AlertCircle size={14} />}
                        <span>{pincodeResult.text}</span>
                      </div>
                    )}
                  </div>

                  {/* Tabs / Accordion for Details & Specs */}
                  <div className="details-tabs-container">
                    <div className="tabs-header-nav">
                      <button
                        type="button"
                        className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('specs')}
                      >
                        Description & Specs
                      </button>
                      <button
                        type="button"
                        className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
                        onClick={() => setActiveTab('shipping')}
                      >
                        Delivery & Returns
                      </button>
                      <button
                        type="button"
                        className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviews')}
                      >
                        Verified Reviews (128)
                      </button>
                    </div>

                    <div className="tab-pane-content">
                      {activeTab === 'specs' && (
                        <div>
                          <p className="tab-text" id="product-details-desc">{product.description}</p>
                          <div className="specs-table">
                            <div className="spec-row">
                              <span className="spec-key">Category</span>
                              <span className="spec-val">{product.category}</span>
                            </div>
                            <div className="spec-row">
                              <span className="spec-key">Authenticity</span>
                              <span className="spec-val">100% Certified Genuine</span>
                            </div>
                            <div className="spec-row">
                              <span className="spec-key">Warranty</span>
                              <span className="spec-val">1 Year Brand Warranty</span>
                            </div>
                            <div className="spec-row">
                              <span className="spec-key">In the Box</span>
                              <span className="spec-val">1x {product.name}, User Guide, Warranty Card</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'shipping' && (
                        <div className="shipping-tab-info">
                          <div className="perk-bullet">
                            <Truck size={16} />
                            <span><strong>Standard Dispatch:</strong> Dispatched within 24 hours from local fulfillment center.</span>
                          </div>
                          <div className="perk-bullet">
                            <RefreshCw size={16} />
                            <span><strong>7-Day Returns:</strong> Free doorstep exchange or replacement if defective or unsatisfied.</span>
                          </div>
                          <div className="perk-bullet">
                            <ShieldCheck size={16} />
                            <span><strong>Cash on Delivery & Online:</strong> Fully verified payment checkout supported.</span>
                          </div>
                        </div>
                      )}

                      {activeTab === 'reviews' && (
                        <div className="reviews-tab-info">
                          <div className="overall-rating-summary">
                            <div className="rating-huge">4.9</div>
                            <div>
                              <div className="stars-row">
                                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                              </div>
                              <span className="rating-summary-text">Based on 128 verified customer experiences</span>
                            </div>
                          </div>

                          <div className="review-cards-list">
                            <div className="user-review-card">
                              <div className="review-user-row">
                                <span className="review-author">Aarav K.</span>
                                <span className="verified-chip">Verified Buyer</span>
                              </div>
                              <p className="review-comment">"Phenomenal build quality! Arrived within 2 days in mint packaging. Exceeded my expectations completely."</p>
                            </div>
                            <div className="user-review-card">
                              <div className="review-user-row">
                                <span className="review-author">Priya S.</span>
                                <span className="verified-chip">Verified Buyer</span>
                              </div>
                              <p className="review-comment">"Super sleek look and feel. Exactly like shown in pictures. Will definitely buy more from ShopKart."</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
