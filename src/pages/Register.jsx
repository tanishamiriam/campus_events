import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../utils/api';
import {
  registerStart,
  registerSuccess,
  registerFailure,
  clearAuthError,
} from '../redux/slices/authSlice';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student', // 'student' or 'organizer'
    department: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    if (error) dispatch(clearAuthError());
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (selectedRole) => {
    if (error) dispatch(clearAuthError());
    setFormData({ ...formData, role: selectedRole });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(registerStart());

    try {
      const res = await api.post('/auth/register', formData);
      dispatch(registerSuccess(res.data));

      // Redirect user to their respective dashboard
      const role = res.data.user?.role;
      if (role === 'organizer') {
        navigate('/organizer-dashboard');
      } else {
        navigate('/attendee-dashboard');
      }
    } catch (err) {
      dispatch(
        registerFailure(
          err.response?.data?.message || 'Registration failed. Please try again.'
        )
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">
          Attendees register for events. Organizers can host their own.
        </p>
      </div>

      <div className="auth-card">
        {/* Role Toggle Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            type="button"
            className={formData.role === 'student' ? 'auth-submit-btn' : 'btn-logout'}
            style={{
              flex: 1,
              marginTop: 0,
              padding: '0.6rem',
              backgroundColor: formData.role === 'student' ? '#f59e0b' : '#131627',
              color: formData.role === 'student' ? '#0f172a' : '#94a3b8',
              border: '1px solid #2e3456',
            }}
            onClick={() => handleRoleChange('student')}
          >
            Attendee
          </button>
          <button
            type="button"
            className={formData.role === 'organizer' ? 'auth-submit-btn' : 'btn-logout'}
            style={{
              flex: 1,
              marginTop: 0,
              padding: '0.6rem',
              backgroundColor: formData.role === 'organizer' ? '#f59e0b' : '#131627',
              color: formData.role === 'organizer' ? '#0f172a' : '#94a3b8',
              border: '1px solid #2e3456',
            }}
            onClick={() => handleRoleChange('organizer')}
          >
            Organizer
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full name</label>
            <input
              type="text"
              name="name"
              placeholder="Priya Sharma"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@campus.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Department (optional)</label>
            <input
              type="text"
              name="department"
              placeholder="Computer Science"
              value={formData.department}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}