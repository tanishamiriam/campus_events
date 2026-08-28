import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Loader from '../components/Loader';

const CAPABILITIES = [
  { title: 'Browse & search events', desc: 'Filter by category, search by name or venue, all in one place.' },
  { title: 'Book tickets instantly', desc: 'Free events confirm immediately; paid events unlock after checkout.' },
  { title: 'Pay securely online', desc: 'Complete payment for paid events right from the event page.' },
  { title: 'View your QR ticket', desc: 'Every confirmed booking gets a scannable QR code under My Tickets.' },
  { title: 'Track check-in status', desc: "See whether you've already been checked in at the venue." }
];

export default function AttendeeDashboard() {
  const user = useSelector((state) => state.auth.user);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/registrations/my').then(({ data }) => setTickets(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading your dashboard…" />;

  const upcoming = tickets.filter((t) => new Date(t.event_date) >= new Date()).length;
  const checkedIn = tickets.filter((t) => t.checked_in).length;

  return (
    <div className="page">
      <div className="flex-between mb-24">
        <div>
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Your identity and what you can do on Kampus.</p>
        </div>
        <Link to="/" className="btn btn-primary">Browse events</Link>
      </div>

      <div className="form-card mb-24">
        <div className="flex-between">
          <div>
            <p style={{ fontSize: '20px', fontWeight: 700 }}>{user?.name}</p>
            <p className="text-muted" style={{ fontSize: '14px' }}>{user?.email}</p>
          </div>
          <span className="badge badge-free">Attendee</span>
        </div>
        {user?.department && <p className="text-muted mt-16" style={{ fontSize: '14px' }}>Department: {user.department}</p>}
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <p className="stat-label">Total tickets</p>
          <p className="stat-value">{tickets.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Upcoming events</p>
          <p className="stat-value accent">{upcoming}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Checked in so far</p>
          <p className="stat-value">{checkedIn}</p>
        </div>
      </div>

      <h2 className="section-title mt-24 mb-24">What you can do as an attendee</h2>
      <div className="grid">
        {CAPABILITIES.map((c) => (
          <div key={c.title} className="info-tile">
            <p className="info-tile-value">{c.title}</p>
            <p className="text-muted" style={{ fontSize: '13px', marginTop: '6px' }}>{c.desc}</p>
          </div>
        ))}
      </div>

      <Link to="/my-tickets" className="btn btn-secondary mt-24">View my tickets →</Link>
    </div>
  );
}
