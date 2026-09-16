import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { loginCustomer } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Controlled component states
  const [formData, setFormData] = useState({
    email: location.state?.registeredEmail || '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successNotice, setSuccessNotice] = useState(location.state?.message || '');

  // Handle controlled input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessNotice('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Calls POST /customers/login with withCredentials: true
      const response = await loginCustomer({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (response.success) {
        if (onLoginSuccess) {
          onLoginSuccess(response.customer);
        }
        // Navigate to /home on success
        navigate('/home');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Backend returns 401 with message "Invalid credentials"
      if (err.response && err.response.data && err.response.data.message) {
        setApiError(err.response.data.message);
      } else {
        setApiError('Invalid Credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" id="login-page-wrapper">
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
          <h1 className="auth-sidebar-title">Welcome back to effortless shopping.</h1>
          <p className="auth-sidebar-desc">
            Sign in to securely access your saved cart, personalized order history, and exclusive member-only privileges.
          </p>

          <div className="auth-sidebar-features">
            <div className="auth-sidebar-feature-item">
              <div className="auth-feature-check">
                <ShieldCheck size={14} />
              </div>
              <span>Encrypted Session via Secure HttpOnly Cookie</span>
            </div>
            <div className="auth-sidebar-feature-item">
              <div className="auth-feature-check">✓</div>
              <span>Real-time Order Tracking & Instant Updates</span>
            </div>
            <div className="auth-sidebar-feature-item">
              <div className="auth-feature-check">✓</div>
              <span>Protected Route Security for Customer Dashboard</span>
            </div>
          </div>
        </div>

        <div className="auth-sidebar-footer">
          <span>© 2026 ShopKart Inc. All rights reserved.</span>
          <span>Engineering Lab 02</span>
        </div>
      </div>

      {/* Main Login Form */}
      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-header-mobile-brand">
              <ShoppingBag size={24} />
              <span>ShopKart</span>
            </div>
            <h2 className="auth-title">Log in to ShopKart</h2>
            <p className="auth-subtitle">Enter your email and password below</p>
          </div>

          {/* Notice Banner (e.g. from registration redirect) */}
          {successNotice && (
            <div className="alert-banner alert-success" id="login-notice-alert">
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{successNotice}</div>
            </div>
          )}

          {/* Invalid Credentials / Error Banner */}
          {apiError && (
            <div className="alert-banner alert-error" id="login-error-alert">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div id="login-error-message">{apiError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate id="login-form">
            {/* Email Address */}
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                />
                <div className="input-icon-left">
                  <Mail size={18} />
                </div>
              </div>
              {errors.email && (
                <span className="field-error-text" id="login-email-error">
                  <AlertCircle size={12} />
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="login-password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  name="password"
                  placeholder="••••••••"
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
                  id="toggle-login-password"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="field-error-text" id="login-password-error">
                  <AlertCircle size={12} />
                  {errors.password}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="login-submit-btn"
              className="btn btn-primary btn-block"
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? (
                <>
                  <div className="spinner-sm"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <div className="auth-footer-prompt">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link" id="link-to-register">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
