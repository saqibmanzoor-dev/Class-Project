import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, ShieldCheck, Sparkles, 
  ShoppingBag, Package, Heart, Clock, ArrowRight,
  ExternalLink
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { getProfile } from '../services/api';

export default function Home({ user, setUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCustomerProfile = async () => {
      try {
        // Task 3 Requirement: Fetch /customers/me to verify authentication
        const profileData = await getProfile();
        if (isMounted) {
          setUser(profileData);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Unauthorized or failed to fetch profile, redirecting to /login:', err);
        if (isMounted) {
          setUser(null);
          // Requirement: "If Not Logged In: Automatically redirect to /login"
          navigate('/login', { replace: true });
        }
      }
    };

    fetchCustomerProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate, setUser]);

  const handleLogoutSuccess = () => {
    setUser(null);
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

  if (!user) {
    return null;
  }

  // Curated showcase products to make the e-commerce home page feel real & premium
  const sampleProducts = [
    {
      id: 1,
      title: 'Aura Studio Wireless ANC Headphones',
      category: 'Audio & Tech',
      price: '$199.00',
      badge: 'Bestseller',
    },
    {
      id: 2,
      title: 'Minimalist Chrono Series Watch',
      category: 'Accessories',
      price: '$149.50',
      badge: 'Trending',
    },
    {
      id: 3,
      title: 'Ergonomic Mechanical Keyboard',
      category: 'Computing',
      price: '$129.00',
      badge: 'New Arrival',
    },
    {
      id: 4,
      title: 'Ultra-lightweight Running Trainers',
      category: 'Footwear',
      price: '$89.99',
      badge: 'Popular',
    },
  ];

  return (
    <div className="app-container" id="home-page-root">
      {/* Navbar with Customer Profile & Logout Action */}
      <Navbar user={user} onLogoutSuccess={handleLogoutSuccess} />

      <main className="main-content">
        <div className="dashboard-container">
          {/* Welcome Banner */}
          <div className="hero-welcome-card" id="welcome-banner">
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>ShopKart Gold Member</span>
            </div>
            <h1 className="hero-title" id="welcome-heading">
              Welcome back, {user.fullName || 'Valued Customer'}!
            </h1>
            <p className="hero-subtitle">
              Your customer account is securely authenticated. Explore your member perks, manage your profile, and discover today's personalized recommendations.
            </p>
          </div>

          {/* Customer Profile & Store Overview Grid */}
          <div className="dashboard-grid">
            {/* Customer Details Card (Task 3: Display Name, Email, Phone) */}
            <div className="profile-card" id="customer-profile-card">
              <div className="profile-card-header">
                <div className="profile-big-avatar" id="customer-avatar">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <h2 className="profile-meta-title" id="display-customer-name">
                    {user.fullName}
                  </h2>
                  <span className="profile-role-tag">Verified Customer</span>
                </div>
              </div>

              <div className="profile-info-list">
                {/* Full Name */}
                <div className="profile-info-item">
                  <div className="info-icon-box">
                    <User size={18} />
                  </div>
                  <div className="info-content">
                    <div className="info-label">Full Name</div>
                    <div className="info-value" id="profile-fullname">
                      {user.fullName}
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div className="profile-info-item">
                  <div className="info-icon-box">
                    <Mail size={18} />
                  </div>
                  <div className="info-content">
                    <div className="info-label">Email Address</div>
                    <div className="info-value" id="profile-email">
                      {user.email}
                    </div>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="profile-info-item">
                  <div className="info-icon-box">
                    <Phone size={18} />
                  </div>
                  <div className="info-content">
                    <div className="info-label">Phone Number</div>
                    <div className="info-value" id="profile-phone">
                      {user.phone}
                    </div>
                  </div>
                </div>

                {/* Security / Cookie Verification Badge */}
                <div className="profile-info-item">
                  <div className="info-icon-box" style={{ color: 'var(--success)' }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div className="info-content">
                    <div className="info-label">Authentication Status</div>
                    <div className="info-value" style={{ color: 'var(--success)', fontSize: '0.85rem' }}>
                      HttpOnly Cookie Active
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Quick Stats & Featured Deals */}
            <div className="store-section">
              {/* Quick Stat Tiles */}
              <div className="stat-cards-row">
                <div className="stat-card">
                  <div className="stat-card-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                    <Package size={22} />
                  </div>
                  <div>
                    <div className="stat-card-num">3</div>
                    <div className="stat-card-label">Active Orders</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
                    <Heart size={22} />
                  </div>
                  <div>
                    <div className="stat-card-num">12</div>
                    <div className="stat-card-label">Wishlist Items</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                    <Clock size={22} />
                  </div>
                  <div>
                    <div className="stat-card-num">1,450</div>
                    <div className="stat-card-label">Reward Points</div>
                  </div>
                </div>
              </div>

              {/* Curated Products Showcase */}
              <div>
                <div className="section-header" style={{ marginBottom: '1rem' }}>
                  <h3 className="section-title">Trending Member Exclusives</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>
                    View All Catalog &rarr;
                  </span>
                </div>

                <div className="products-grid">
                  {sampleProducts.map((product) => (
                    <div className="product-card" key={product.id}>
                      <div className="product-image-wrap">
                        <ShoppingBag size={36} />
                        <span className="product-tag">{product.badge}</span>
                      </div>
                      <div className="product-details">
                        <h4 className="product-title">{product.title}</h4>
                        <span className="product-category">{product.category}</span>
                        <div className="product-footer">
                          <span className="product-price">{product.price}</span>
                          <button type="button" className="btn btn-primary product-add-btn">
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
