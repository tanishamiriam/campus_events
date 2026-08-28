import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';

function formatDate(dateStr) {
  if (!dateStr) return 'TBA';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function initials(name = '') {
  if (!name) return 'ORG';
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function OrganizerDashboard() {
  const user = useSelector((state) => state.auth?.user);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellingFor, setSellingFor] = useState(null);
  const [sellEmail, setSellEmail] = useState('');
  const [sellStatus, setSellStatus] = useState(null);
  const [selling, setSelling] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/events/mine/created');
      const data = Array.isArray(res.data) ? res.data : res.data?.events || [];
      setEvents(data);
    } catch (err) {
      console.error('Failed to load organizer events:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete event.');
    }
  }

  function openSellForm(eventId) {
    setSellingFor(eventId);
    setSellEmail('');
    setSellStatus(null);
  }

  async function handleSell(e, eventId) {
    e.preventDefault();
    setSelling(true);
    setSellStatus(null);
    try {
      const { data } = await api.post(`/registrations/sell/${eventId}`, {
        email: sellEmail,
      });
      setSellStatus({ ok: true, message: data.message || 'Ticket sold successfully!' });
      setSellEmail('');
      load();
    } catch (err) {
      setSellStatus({
        ok: false,
        message: err.response?.data?.message || 'Could not sell this ticket.',
      });
    } finally {
      setSelling(false);
    }
  }

  const safeEvents = Array.isArray(events) ? events : [];
  const totalTickets = safeEvents.reduce(
    (sum, e) => sum + (Number(e?.seats_taken) || 0),
    0
  );
  const totalRevenue = safeEvents.reduce(
    (sum, e) =>
      sum + (Number(e?.seats_taken) || 0) * (Number(e?.price) || 0),
    0
  );

  if (loading) {
    return (
      typeof Loader !== 'undefined' ? (
        <Loader label="Loading your events…" />
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
          Loading your events…
        </div>
      )
    );
  }

  return (
    <div className="page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Profile Header */}
      <div className="profile-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div
          className="profile-avatar"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#f59e0b',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.25rem',
          }}
        >
          {initials(user?.name)}
        </div>
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: '1.75rem' }}>
            {user?.name || 'Organizer Dashboard'}
          </h1>
          <p className="text-muted" style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
            {user?.email} · Organizer
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div
        className="stat-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="stat-card" style={{ background: '#131627', padding: '1.25rem', borderRadius: '8px', border: '1px solid #2e3456' }}>
          <p className="stat-label" style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>Events created</p>
          <p className="stat-value" style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0.25rem 0 0' }}>{safeEvents.length}</p>
        </div>
        <div className="stat-card" style={{ background: '#131627', padding: '1.25rem', borderRadius: '8px', border: '1px solid #2e3456' }}>
          <p className="stat-label" style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>Tickets sold</p>
          <p className="stat-value" style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0.25rem 0 0' }}>{totalTickets}</p>
        </div>
        <div className="stat-card" style={{ background: '#131627', padding: '1.25rem', borderRadius: '8px', border: '1px solid #2e3456' }}>
          <p className="stat-label" style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>Revenue generated</p>
          <p className="stat-value accent" style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#f59e0b', margin: '0.25rem 0 0' }}>
            ₹{totalRevenue}
          </p>
        </div>
      </div>

      {/* Capabilities */}
      <div
        className="capability-card mb-24"
        style={{
          background: '#131627',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #2e3456',
          marginBottom: '2rem',
        }}
      >
        <h2 className="section-title" style={{ marginTop: 0, fontSize: '1.25rem' }}>What you can do here</h2>
        <ul className="capability-list" style={{ lineHeight: '1.8', color: '#cbd5e1', paddingLeft: '1.25rem' }}>
          <li>📅 Create new events — they go live once an admin approves them</li>
          <li>✏️ Update details on events you have already created</li>
          <li>🎟️ Track how many tickets are available vs. sold, per event</li>
          <li>💵 Sell a ticket at the door to an attendee who already has an account</li>
          <li>👥 View the full attendee list for any of your events</li>
          <li>✅ Check attendees in at the venue using their ticket code</li>
        </ul>
      </div>

      {/* Events List Header */}
      <div
        className="flex-between mb-24"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h2 className="section-title" style={{ margin: 0, fontSize: '1.35rem' }}>Your events</h2>
        <Link
          to="/organizer/new"
          className="btn btn-primary"
          style={{
            backgroundColor: '#f59e0b',
            color: '#0f172a',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: '600',
          }}
        >
          + New event
        </Link>
      </div>

      {/* Events Render */}
      {safeEvents.length === 0 ? (
        <div
          className="empty-state"
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: '#131627',
            borderRadius: '8px',
            border: '1px solid #2e3456',
          }}
        >
          <p className="empty-state-title" style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
            You haven't created any events yet.
          </p>
          <Link to="/organizer/new" style={{ color: '#f59e0b', fontWeight: 'bold' }}>
            Create your first event →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {safeEvents.map((e) => {
            const capacity = Number(e.capacity) || 1;
            const taken = Number(e.seats_taken) || 0;
            const pctSold = Math.min(100, Math.round((taken / capacity) * 100));

            return (
              <div
                key={e.id}
                className="list-row"
                style={{
                  background: '#131627',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  border: '1px solid #2e3456',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {typeof StatusBadge !== 'undefined' ? (
                        <StatusBadge status={e.status} />
                      ) : (
                        <span style={{ fontSize: '12px', padding: '2px 8px', background: '#334155', borderRadius: '4px' }}>
                          {e.status}
                        </span>
                      )}
                      <span className="text-muted" style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {e.category}
                      </span>
                    </div>
                    <h3 className="section-title" style={{ margin: '0.5rem 0', fontSize: '1.2rem' }}>
                      {e.title}
                    </h3>
                    <p className="text-muted" style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                      {formatDate(e.event_date)} · {e.venue}
                    </p>
                  </div>

                  <div className="list-row-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Link to={`/organizer/events/${e.id}/attendees`} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.75rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '4px', color: '#fff', textDecoration: 'none' }}>
                      Attendees
                    </Link>
                    <Link to={`/organizer/edit/${e.id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.75rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '4px', color: '#fff', textDecoration: 'none' }}>
                      Edit
                    </Link>
                    <button type="button" onClick={() => openSellForm(e.id)} className="btn btn-success btn-sm" style={{ padding: '0.4rem 0.75rem', background: '#10b981', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
                      Sell ticket
                    </button>
                    <button type="button" onClick={() => handleDelete(e.id)} className="btn btn-danger btn-sm" style={{ padding: '0.4rem 0.75rem', background: '#ef4444', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
                      Delete
                    </button>
                  </div>
                </div>

                <div className="ticket-progress" style={{ marginTop: '1rem' }}>
                  <div style={{ height: '6px', background: '#0f172a', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                    <div style={{ width: `${pctSold}%`, background: '#f59e0b', height: '100%' }} />
                  </div>
                  <span className="text-muted" style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {taken}/{capacity} tickets sold
                  </span>
                </div>

                {sellingFor === e.id && (
                  <form onSubmit={(ev) => handleSell(ev, e.id)} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <input
                      type="email"
                      required
                      value={sellEmail}
                      onChange={(ev) => setSellEmail(ev.target.value)}
                      placeholder="attendee's email (must already have an account)"
                      style={{ flex: 1, padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#fff' }}
                    />
                    <button type="submit" disabled={selling} style={{ padding: '0.5rem 1rem', background: '#f59e0b', border: 'none', borderRadius: '4px', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' }}>
                      {selling ? 'Selling…' : 'Confirm'}
                    </button>
                    <button type="button" onClick={() => setSellingFor(null)} style={{ padding: '0.5rem 1rem', background: '#334155', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </form>
                )}

                {sellingFor === e.id && sellStatus && (
                  <p style={{ marginTop: '0.5rem', fontSize: '13px', color: sellStatus.ok ? '#10b981' : '#ef4444' }}>
                    {sellStatus.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}