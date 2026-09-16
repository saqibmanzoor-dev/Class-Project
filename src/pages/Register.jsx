import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Mail, Lock, Phone, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { registerCustomer } from '../services/api';

export default function Register() {
  const navigate = useNavigate();

  // Controlled component states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  // Handle controlled input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    if (apiError) setApiError('');
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is mandatory';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is mandatory';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is mandatory';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must contain at least 6 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is mandatory';
    } else if (formData.phone.trim().length < 7) {
      newErrors.phone = 'Please provide a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await registerCustomer({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
      });

      if (response.success) {
        setApiSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login', {
            state: {
              registeredEmail: formData.email.trim().toLowerCase(),
              message: 'Account created! Please log in with your new credentials.',
            },
          });
        }, 1200);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setApiError(err.response.data.message);
      } else {
        setApiError('Registration failed. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" id="register-page-wrapper">
      {/* Visual Promotional Sidebar */}
      <div className="auth-sidebar">
        <div className="auth-sidebar-bg-decor"></div>
        <div className="auth-sidebar-bg-decor-2"></div>

        <div className="auth-sidebar-brand">
          <div className="auth-sidebar-brand-icon">
            <ShoppingBag size={22} />
          </div>
          <span>ShopKart</span>
        </div>

        <div className="auth-sidebar-content">
          <h1 className="auth-sidebar-title">Join millions of smart shoppers today.</h1>
          <p className="auth-sidebar-desc">
            Create your free account to access exclusive daily discounts, lightning-fast order processing, and curated collections.
          </p>

          <div className="auth-sidebar-features">
            <div className="auth-sidebar-feature-item">
              <div className="auth-feature-check">✓</div>
              <span>Exclusive Member Deals & Early Access</span>
            </div>
            <div className="auth-sidebar-feature-item">
              <div className="auth-feature-check">✓</div>
              <span>Secure HttpOnly Cookie Authentication</span>
            </div>
            <div className="auth-sidebar-feature-item">
              <div className="auth-feature-check">✓</div>
              <span>Free Express Delivery on Qualifying Orders</span>
            </div>
          </div>
        </div>

        <div className="auth-sidebar-footer">
          <span>© 2026 ShopKart Inc. All rights reserved.</span>
          <span>Engineering Lab 02</span>
        </div>
      </div>

      {/* Main Registration Form */}
      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-header-mobile-brand">
              <ShoppingBag size={24} />
              <span>ShopKart</span>
            </div>
            <h2 className="auth-title">Create an account</h2>
            <p className="auth-subtitle">Start your personalized shopping journey</p>
          </div>

          {/* Success Banner */}
          {apiSuccess && (
            <div className="alert-banner alert-success" id="register-success-alert">
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{apiSuccess}</div>
            </div>
          )}

          {/* Global API Error Banner */}
          {apiError && (
            <div className="alert-banner alert-error" id="register-error-alert">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{apiError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate id="register-form">
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="register-fullName" className="form-label">
                Full Name
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="register-fullName"
                  name="fullName"
                  placeholder="e.g. Jane Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                />
                <div className="input-icon-left">
                  <User size={18} />
                </div>
              </div>
              {errors.fullName && (
                <span className="field-error-text" id="fullName-error">
                  <AlertCircle size={12} />
                  {errors.fullName}
                </span>
              )}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label htmlFor="register-email" className="form-label">
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="register-email"
                  name="email"
                  placeholder="jane.doe@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                />
                <div className="input-icon-left">
                  <Mail size={18} />
                </div>
              </div>
              {errors.email && (
                <span className="field-error-text" id="email-error">
                  <AlertCircle size={12} />
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="register-password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="register-password"
                  name="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                />
                <div className="input-icon-left">
                  <Lock size={18} />
                </div>
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  id="toggle-register-password"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="field-error-text" id="password-error">
                  <AlertCircle size={12} />
                  {errors.password}
                </span>
              )}
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label htmlFor="register-phone" className="form-label">
                Phone Number
              </label>
              <div className="input-wrapper">
                <input
                  type="tel"
                  id="register-phone"
                  name="phone"
                  placeholder="e.g. +1 555-0199"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`form-input ${errors.phone ? 'input-error' : ''}`}
                />
                <div className="input-icon-left">
                  <Phone size={18} />
                </div>
              </div>
              {errors.phone && (
                <span className="field-error-text" id="phone-error">
                  <AlertCircle size={12} />
                  {errors.phone}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="register-submit-btn"
              className="btn btn-primary btn-block"
              disabled={loading}
              style={{ marginTop: '0.75rem' }}
            >
              {loading ? (
                <>
                  <div className="spinner-sm"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="auth-footer-prompt">
            Already have an account?{' '}
            <Link to="/login" className="auth-link" id="link-to-login">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
