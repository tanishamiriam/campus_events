import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Loader from '../components/Loader';

const RESPONSIBILITIES = [
  { title: 'Create & submit events', desc: 'New events go live once an admin approves them.' },
  { title: 'Update event details', desc: 'Edit venue, timing, capacity or price any time before the event.' },
  { title: 'Track ticket availability', desc: 'See how many seats are booked vs. remaining, per event.' },
  { title: 'Sell tickets at the door', desc: 'Issue a ticket directly to a walk-in attendee by their email.' },
  { title: 'Check attendees in', desc: 'Scan or enter a ticket code at the entrance to mark them present.' },
  { title: 'View registrations', desc: 'See who registered, their payment status, and check-in time.' }
];

export default function OrganizerProfile() {
  const user = useSelector((state) => state.auth.user);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events/mine/created').then(({ data }) => setEvents(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading your profile…" />;

  const totalEvents = events.length;
  const totalRegistrations = events.reduce((sum, e) => sum + Number(e.seats_taken), 0);
  const pendingApproval = events.filter((e) => e.status === 'pending').length;

  return (
    <div className="page">
      <div className="flex-between mb-24">
        <div>
          <h1 className="page-title">Organizer Profile</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Your identity and what you're able to do on Kampus.</p>
        </div>
        <Link to="/organizer/new" className="btn btn-primary">+ New event</Link>
      </div>

      <div className="form-card mb-24">
        <div className="flex-between">
          <div>
            <p style={{ fontSize: '20px', fontWeight: 700 }}>{user?.name}</p>
            <p className="text-muted" style={{ fontSize: '14px' }}>{user?.email}</p>
          </div>
          <span className="badge badge-approved">Organizer</span>
        </div>
        {user?.department && <p className="text-muted mt-16" style={{ fontSize: '14px' }}>Department: {user.department}</p>}
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <p className="stat-label">Events created</p>
          <p className="stat-value">{totalEvents}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total registrations</p>
          <p className="stat-value">{totalRegistrations}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Awaiting approval</p>
          <p className="stat-value accent">{pendingApproval}</p>
        </div>
      </div>

      <h2 className="section-title mt-24 mb-24">What you can do as an organizer</h2>
      <div className="grid">
        {RESPONSIBILITIES.map((r) => (
          <div key={r.title} className="info-tile">
            <p className="info-tile-value">{r.title}</p>
            <p className="text-muted mt-16" style={{ fontSize: '13px', marginTop: '6px' }}>{r.desc}</p>
          </div>
        ))}
      </div>

      <Link to="/organizer" className="btn btn-secondary mt-24">Go to your events dashboard →</Link>
    </div>
  );
}
