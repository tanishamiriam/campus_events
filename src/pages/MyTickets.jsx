import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function MyTickets() {
  const user = useSelector((state) => state.auth.user);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/registrations/my');
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function completePayment(regId) {
    setPayingId(regId);
    try {
      await api.post(`/payments/${regId}/pay`);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed.');
    } finally {
      setPayingId(null);
    }
  }

  if (loading) return <Loader label="Loading your tickets…" />;

  const upcoming = tickets.filter((t) => new Date(t.event_date) >= new Date().setHours(0, 0, 0, 0));
  const checkedInCount = tickets.filter((t) => t.checked_in).length;

  return (
    <div className="page" style={{ maxWidth: '760px' }}>
      <div className="profile-header">
        <div className="profile-avatar">{initials(user?.name)}</div>
        <div>
          <h1 className="page-title">{user?.name}</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>{user?.email} · Attendee</p>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <p className="stat-label">Total tickets</p>
          <p className="stat-value">{tickets.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Upcoming events</p>
          <p className="stat-value">{upcoming.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Events attended</p>
          <p className="stat-value accent">{checkedInCount}</p>
        </div>
      </div>

      <div className="capability-card mb-24">
        <h2 className="section-title">What you can do here</h2>
        <ul className="capability-list">
          <li>🔍 Browse and search every approved event on campus</li>
          <li>🎟️ Book a ticket instantly for free events, or pay online for paid ones</li>
          <li>📱 Show your QR code ticket at the door for check-in</li>
          <li>📋 Keep track of every event you've registered for, right here</li>
        </ul>
      </div>

      <h2 className="section-title mb-24">My tickets</h2>

      {tickets.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No tickets yet.</p>
          <Link to="/">Browse events →</Link>
        </div>
      ) : (
        <div>
          {tickets.map((t) => (
            <div key={t.id} className="ticket-row">
              <div className="ticket-row-body">
                <div className="flex-between" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                  <StatusBadge status={t.payment_status} />
                  {t.checked_in && <StatusBadge status="approved" />}
                  {t.checked_in && <span className="text-muted" style={{ fontSize: '12px' }}>Checked in</span>}
                </div>
                <h3 className="section-title mt-16">{t.title}</h3>
                <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>
                  📍 {t.venue} · {formatDate(t.event_date)} · {t.event_time?.slice(0, 5)}
                </p>
                <p className="ticket-code">{t.ticket_code}</p>

                {t.payment_status === 'pending' && (
                  <button
                    onClick={() => completePayment(t.id)}
                    disabled={payingId === t.id}
                    className="btn btn-primary btn-sm mt-16"
                  >
                    {payingId === t.id ? 'Processing…' : `Pay ₹${t.price} now`}
                  </button>
                )}
              </div>

              <div className="ticket-qr-box">
                {t.qr_code ? (
                  <img src={t.qr_code} alt="Ticket QR code" />
                ) : (
                  <p className="ticket-qr-placeholder">QR unlocks after payment</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
