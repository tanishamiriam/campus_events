import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="navbar-wrapper">
      <nav className="navbar-content">
        <Link to="/" className="brand-logo">
          Campus Events
        </Link>

        <div className="nav-items">
          <Link to="/" className="nav-link-item">Home</Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <Link to="/admin" className="nav-link-item">Admin Dashboard</Link>
              )}
              {user?.role === 'organizer' && (
                <Link to="/organizer-dashboard" className="nav-link-item">Organizer Dashboard</Link>
              )}
              {user?.role === 'student' && (
                <Link to="/my-tickets" className="nav-link-item">My Tickets</Link>
              )}
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link-item">Login</Link>
              <Link to="/register" className="btn-register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}