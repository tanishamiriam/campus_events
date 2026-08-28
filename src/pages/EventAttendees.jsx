import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';

export default function EventAttendees() {
  const { eventId } = useParams();
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/registrations/event/${eventId}`);
      setAttendees(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load attendees.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loader label="Loading attendees…" />;

  return (
    <div className="page">
      <Link to="/organizer" className="back-link">← Back to your events</Link>
      <h1 className="page-title mt-16">Attendees</h1>
      <p className="page-subtitle">{attendees.length} registered</p>

      {error && <p className="alert alert-error">{error}</p>}

      {attendees.length === 0 ? (
        <p className="empty-state">No registrations yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Payment</th>
                <th>Check-in</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td className="text-muted">{a.email}</td>
                  <td><StatusBadge status={a.payment_status} /></td>
                  <td>
                    {a.checked_in ? (
                      <span style={{ color: 'var(--emerald)', fontSize: '12px' }}>
                        ✓ {new Date(a.checked_in_at).toLocaleTimeString()}
                      </span>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '12px' }}>Not yet</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
