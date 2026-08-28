import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useSelector } from 'react-redux';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function EventDetails() {
  const { id } = useParams();
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [pendingReg, setPendingReg] = useState(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);
    } catch (err) {
      setError('This event could not be found.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!user) return navigate('/login');
    setRegistering(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.post(`/registrations/${id}`);
      if (data.requiresPayment) {
        setPendingReg({ registrationId: data.registrationId, amount: data.amount });
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not register for this event.');
    } finally {
      setRegistering(false);
    }
  }

  async function handlePay() {
    setRegistering(true);
    setError('');
    try {
      await api.post(`/payments/${pendingReg.registrationId}/pay`);
      setMessage('Payment successful! Your ticket is ready — find it under "My Tickets".');
      setPendingReg(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed.');
    } finally {
      setRegistering(false);
    }
  }

  if (loading) return <Loader label="Loading event…" />;
  if (error && !event) {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <p className="page-title">{error}</p>
        <Link to="/" className="back-link">Back to events</Link>
      </div>
    );
  }

  const seatsLeft = event.capacity - event.seats_taken;
  const isFull = seatsLeft <= 0;

  return (
    <div className="page" style={{ maxWidth: '760px' }}>
      <Link to="/" className="back-link">← Back to events</Link>

      <div className="flex-between mt-16">
        <div>
          <p className="hero-eyebrow" style={{ marginBottom: '8px' }}>{event.category}</p>
          <h1 className="page-title">{event.title}</h1>
          <p className="text-muted" style={{ marginTop: '4px' }}>Hosted by {event.organizer_name}</p>
        </div>
        <StatusBadge status={event.status} />
      </div>

      <div className="info-tile-row">
        <div className="info-tile">
          <p className="info-tile-label">Date & time</p>
          <p className="info-tile-value">{formatDate(event.event_date)}</p>
          <p className="text-muted" style={{ fontSize: '13px' }}>{event.event_time?.slice(0, 5)}</p>
        </div>
        <div className="info-tile">
          <p className="info-tile-label">Venue</p>
          <p className="info-tile-value">{event.venue}</p>
        </div>
        <div className="info-tile">
          <p className="info-tile-label">Seats</p>
          <p className="info-tile-value">{isFull ? 'Sold out' : `${seatsLeft} of ${event.capacity} left`}</p>
        </div>
      </div>

      <div className="mt-24">
        <h2 className="section-title">About this event</h2>
        <p className="text-muted" style={{ whiteSpace: 'pre-line' }}>{event.description || 'No description provided.'}</p>
      </div>

      {message ? (
        <div className="success-panel mt-24">
          <div className="success-icon">✓</div>
          <div>
            <h3 className="success-title">Booking Successful!</h3>
            <p className="text-muted" style={{ fontSize: '14px' }}>{message}</p>
          </div>
          <Link to="/my-tickets" className="btn btn-primary btn-sm">View my ticket</Link>
        </div>
      ) : (
        <div className="form-card flex-between mt-24">
          <div>
            <p className="info-tile-label">Price</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--marigold)' }}>
              {Number(event.price) > 0 ? `₹${event.price}` : 'Free'}
            </p>
          </div>

          {pendingReg ? (
            <div className="flex-between">
              <p className="text-muted" style={{ fontSize: '14px' }}>Pay ₹{pendingReg.amount} to confirm your seat</p>
              <button onClick={handlePay} disabled={registering} className="btn btn-primary">
                {registering ? 'Processing…' : 'Pay now (mock)'}
              </button>
            </div>
          ) : user?.role !== 'attendee' ? (
            <p className="text-muted" style={{ fontSize: '14px' }}>
              {user ? 'Only attendees can register for events.' : 'Log in as an attendee to register.'}
            </p>
          ) : (
            <button
              onClick={handleRegister}
              disabled={registering || isFull || event.status !== 'approved'}
              className="btn btn-primary"
            >
              {isFull ? 'Sold out' : registering ? 'Registering…' : 'Register'}
            </button>
          )}
        </div>
      )}

      {error && event && <p className="alert alert-error mt-16">{error}</p>}
    </div>
  );
}
