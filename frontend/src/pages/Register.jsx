import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { FileText, Eye, EyeOff, Sun, Moon, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setSubmitting(true);
      await register(name.trim(), email.trim(), password);
      toast.success('Account created successfully! Welcome to NoteSphere.');
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.message || 'Registration failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <button
        onClick={toggleTheme}
        className="theme-toggle-btn"
        style={{ position: 'fixed', top: '1.25rem', right: '1.25rem' }}
        aria-label="Toggle color theme"
        title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
      >
        {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <FileText size={24} />
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start organizing your personal, college & work notes</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && (
            <div
              role="alert"
              style={{
                padding: '0.7rem 0.95rem',
                backgroundColor: 'var(--danger-light)',
                color: 'var(--danger)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              Full Name
            </label>
            <input
              id="register-name"
              type="text"
              className="form-input"
              placeholder="e.g., Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              Email Address
            </label>
            <input
              id="register-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingRight: '2.75rem' }}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm-password">
              Confirm Password
            </label>
            <input
              id="register-confirm-password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.78rem' }}
            disabled={submitting}
          >
            <UserPlus size={18} />
            <span>{submitting ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?
          <Link to="/login" className="auth-footer-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

