import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Mail, Phone, ShieldCheck, KeyRound, 
  X, Check, AlertCircle, LogOut, Package, 
  Heart, ShoppingBag, Eye, EyeOff, Lock 
} from 'lucide-react';
import { getProfile, changePassword } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function UserProfileModal({ isOpen, onClose, user, onLogout }) {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [profileData, setProfileData] = useState(user || {});
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'security'

  // Change password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState(null);

  // Fetch latest profile when modal opens
  useEffect(() => {
    if (!isOpen) {
      setPasswordNotice(null);
      setOldPassword('');
      setNewPassword('');
      return;
    }

    const fetchLatestProfile = async () => {
      try {
        setLoadingProfile(true);
        const data = await getProfile();
        if (data) {
          setProfileData(data);
        }
      } catch (err) {
        console.warn('Failed to fetch fresh profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchLatestProfile();

    // Close on escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordNotice(null);

    if (!oldPassword) {
      setPasswordNotice({ success: false, message: 'Please enter your current password' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordNotice({ success: false, message: 'New password must contain at least 6 characters' });
      return;
    }

    try {
      setSubmittingPassword(true);
      const res = await changePassword({ oldPassword, newPassword });
      if (res.success) {
        setPasswordNotice({ success: true, message: 'Password updated successfully! 🎉' });
        setOldPassword('');
        setNewPassword('');
      } else {
        setPasswordNotice({ success: false, message: res.message || 'Failed to update password' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password. Please verify current password.';
      setPasswordNotice({ success: false, message: msg });
    } finally {
      setSubmittingPassword(false);
    }
  };

  const initial = (profileData.fullName || user?.fullName || 'U').charAt(0).toUpperCase();

  return (
    <div className="profile-modal-backdrop" onClick={onClose} id="user-profile-modal-backdrop">
      <div 
        className="profile-modal-card" 
        onClick={(e) => e.stopPropagation()} 
        id="user-profile-modal-card"
      >
        {/* Modal Header Banner */}
        <div className="profile-modal-header-banner">
          <button 
            type="button" 
            className="profile-modal-close-btn" 
            onClick={onClose} 
            title="Close popup"
            id="close-profile-modal-btn"
          >
            <X size={18} />
          </button>

          <div className="profile-avatar-wrap">
            <div className="profile-avatar-large">
              {initial}
            </div>
            <span className="profile-avatar-badge" title="Verified Customer">
              <Check size={13} />
            </span>
          </div>

          <h2 className="profile-user-name" id="profile-user-name">
            {profileData.fullName || user?.fullName || 'Customer'}
          </h2>
          <span className="profile-badge-pill">
            <ShieldCheck size={13} />
            <span>Verified Customer Account</span>
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="profile-modal-tabs">
          <button 
            type="button" 
            className={`profile-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
            id="tab-profile-info"
          >
            <User size={15} />
            <span>Account Details</span>
          </button>
          <button 
            type="button" 
            className={`profile-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
            id="tab-profile-security"
          >
            <KeyRound size={15} />
            <span>Security & Password</span>
          </button>
        </div>

        {/* Tab 1: Account Information */}
        {activeTab === 'info' && (
          <div className="profile-modal-body">
            <div className="profile-info-fields-list">
              {/* Full Name */}
              <div className="profile-field-row">
                <div className="profile-field-icon">
                  <User size={16} />
                </div>
                <div className="profile-field-meta">
                  <span className="profile-field-label">Full Name</span>
                  <span className="profile-field-val" id="profile-val-name">
                    {profileData.fullName || user?.fullName || '—'}
                  </span>
                </div>
              </div>

              {/* Email Address */}
              <div className="profile-field-row">
                <div className="profile-field-icon">
                  <Mail size={16} />
                </div>
                <div className="profile-field-meta">
                  <span className="profile-field-label">Email Address</span>
                  <span className="profile-field-val" id="profile-val-email">
                    {profileData.email || user?.email || '—'}
                  </span>
                </div>
                <span className="verified-status-tag">Verified</span>
              </div>

              {/* Phone Number */}
              <div className="profile-field-row">
                <div className="profile-field-icon">
                  <Phone size={16} />
                </div>
                <div className="profile-field-meta">
                  <span className="profile-field-label">Phone Number</span>
                  <span className="profile-field-val" id="profile-val-phone">
                    {profileData.phone || user?.phone || 'Not provided'}
                  </span>
                </div>
              </div>

              {/* Customer ID */}
              <div className="profile-field-row">
                <div className="profile-field-icon">
                  <ShieldCheck size={16} />
                </div>
                <div className="profile-field-meta">
                  <span className="profile-field-label">Customer ID</span>
                  <span className="profile-field-val code-font" id="profile-val-id">
                    {profileData._id || user?._id || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Activity Stats */}
            <div className="profile-quick-stats-grid">
              <Link to="/cart" onClick={onClose} className="quick-stat-card">
                <div className="quick-stat-icon-indigo">
                  <ShoppingBag size={18} />
                </div>
                <div className="quick-stat-info">
                  <span className="quick-stat-num">{cartCount}</span>
                  <span className="quick-stat-label">In Bag</span>
                </div>
              </Link>

              <Link to="/wishlist" onClick={onClose} className="quick-stat-card">
                <div className="quick-stat-icon-red">
                  <Heart size={18} />
                </div>
                <div className="quick-stat-info">
                  <span className="quick-stat-num">{wishlistCount}</span>
                  <span className="quick-stat-label">Wishlisted</span>
                </div>
              </Link>

              <Link to="/orders" onClick={onClose} className="quick-stat-card">
                <div className="quick-stat-icon-green">
                  <Package size={18} />
                </div>
                <div className="quick-stat-info">
                  <span className="quick-stat-num">Orders</span>
                  <span className="quick-stat-label">View History</span>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Tab 2: Security & Change Password */}
        {activeTab === 'security' && (
          <div className="profile-modal-body">
            <div className="security-notice-box">
              <Lock size={16} className="security-lock-icon" />
              <span>
                Your session is secured using <strong>HttpOnly JWT Cookies</strong>. You can update your password below.
              </span>
            </div>

            {passwordNotice && (
              <div 
                className={`profile-notice-banner ${passwordNotice.success ? 'success' : 'error'}`}
                id="profile-password-notice"
              >
                {passwordNotice.success ? <Check size={16} /> : <AlertCircle size={16} />}
                <span>{passwordNotice.message}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="profile-password-form" id="change-password-form">
              {/* Old Password */}
              <div className="profile-form-group">
                <label className="profile-form-label">Current Password</label>
                <div className="profile-input-wrap">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="profile-form-input"
                    id="input-old-password"
                  />
                  <button
                    type="button"
                    className="profile-eye-btn"
                    onClick={() => setShowOldPass(!showOldPass)}
                    tabIndex={-1}
                  >
                    {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="profile-form-group">
                <label className="profile-form-label">New Password (min 6 characters)</label>
                <div className="profile-input-wrap">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    placeholder="Enter at least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="profile-form-input"
                    id="input-new-password"
                  />
                  <button
                    type="button"
                    className="profile-eye-btn"
                    onClick={() => setShowNewPass(!showNewPass)}
                    tabIndex={-1}
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={submittingPassword}
                id="submit-change-password-btn"
                style={{ marginTop: '0.75rem' }}
              >
                {submittingPassword ? (
                  <>
                    <div className="spinner-sm"></div>
                    <span>Updating Password...</span>
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="profile-modal-footer">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            id="profile-modal-close-action"
          >
            Close
          </button>

          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => {
              onClose();
              if (onLogout) onLogout();
            }}
            id="profile-modal-logout-btn"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
