import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, ShieldCheck, Truck, RefreshCw, 
  CreditCard, Heart, ArrowRight, Mail, Instagram, 
  Twitter, Facebook, Github 
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer" id="main-footer">
      {/* Brand Perks Strip */}
      <div className="footer-perks-strip">
        <div className="footer-perks-container">
          <div className="footer-perk-card">
            <div className="perk-icon-circle">
              <Truck size={20} />
            </div>
            <div>
              <h4>Free Express Delivery</h4>
              <p>On all qualifying orders across India</p>
            </div>
          </div>

          <div className="footer-perk-card">
            <div className="perk-icon-circle">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4>100% Verified Quality</h4>
              <p>Direct from authenticated manufacturers</p>
            </div>
          </div>

          <div className="footer-perk-card">
            <div className="perk-icon-circle">
              <RefreshCw size={20} />
            </div>
            <div>
              <h4>Instant 7-Day Exchange</h4>
              <p>Hassle-free doorstep pickup & swap</p>
            </div>
          </div>

          <div className="footer-perk-card">
            <div className="perk-icon-circle">
              <CreditCard size={20} />
            </div>
            <div>
              <h4>Secure Razorpay Checkout</h4>
              <p>UPI, Cards, NetBanking & Wallets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="footer-main-content">
        <div className="footer-grid">
          {/* Col 1: Brand Info */}
          <div className="footer-brand-col">
            <Link to="/products" className="footer-logo">
              <div className="brand-icon-box">
                <ShoppingBag size={20} />
              </div>
              <span>ShopKart</span>
            </Link>
            <p className="footer-bio">
              Engineered for seamless shopping. Bringing curated collections, secure authentication, and lightning-fast checkout to modern shoppers.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon" aria-label="Instagram"><Instagram size={17} /></a>
              <a href="#" className="social-icon" aria-label="Twitter"><Twitter size={17} /></a>
              <a href="#" className="social-icon" aria-label="Facebook"><Facebook size={17} /></a>
              <a href="#" className="social-icon" aria-label="Github"><Github size={17} /></a>
            </div>
          </div>

          {/* Col 2: Shop Categories */}
          <div className="footer-col">
            <h4 className="footer-heading">Collections</h4>
            <ul className="footer-links-list">
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/products">Electronics & Audio</Link></li>
              <li><Link to="/products">Fashion & Streetwear</Link></li>
              <li><Link to="/products">Home & Lifestyle</Link></li>
              <li><Link to="/products">Books & Stationery</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="footer-col">
            <h4 className="footer-heading">Customer Care</h4>
            <ul className="footer-links-list">
              <li><Link to="/orders">Track Your Order</Link></li>
              <li><Link to="/wishlist">Saved Wishlist</Link></li>
              <li><Link to="/cart">Shopping Bag</Link></li>
              <li><a href="#help">Shipping Policy</a></li>
              <li><a href="#returns">Returns & Exchanges</a></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="footer-col footer-newsletter-col">
            <h4 className="footer-heading">Stay in the Loop</h4>
            <p className="newsletter-desc">
              Subscribe for early drops, exclusive member-only deals, and secret discount codes.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to ShopKart Insider drops!'); }} className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                required 
                className="newsletter-input" 
              />
              <button type="submit" className="newsletter-submit-btn" aria-label="Subscribe">
                <ArrowRight size={16} />
              </button>
            </form>
            <span className="newsletter-notice">
              🔒 No spam ever. Unsubscribe anytime in one click.
            </span>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} ShopKart Inc. All rights reserved. Crafted with precision.</p>
          <div className="payment-badges-row">
            <span className="payment-chip">Razorpay</span>
            <span className="payment-chip">UPI</span>
            <span className="payment-chip">Visa</span>
            <span className="payment-chip">Mastercard</span>
            <span className="payment-chip">RuPay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
