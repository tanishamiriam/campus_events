import { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';

const FILTERS = ['pending', 'approved', 'rejected', 'cancelled', 'all'];

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/events');
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(id, status) {
    try {
      await api.patch(`/events/${id}/status`, { status });
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update status.');
    }
  }

  const visible = filter === 'all' ? events : events.filter((e) => e.status === filter);

  if (loading) return <Loader label="Loading events…" />;

  return (
    <div className="page">
      <h1 className="page-title">Event moderation</h1>
      <p className="page-subtitle">Approve or reject events submitted by organizers.</p>

      <div className="chip-row mb-24">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`chip ${filter === f ? 'active' : ''}`}>
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="empty-state">No events in this category.</p>
      ) : (
        <div>
          {visible.map((e) => (
            <div key={e.id} className="list-row">
              <div>
                <div className="flex-between" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                  <StatusBadge status={e.status} />
                  <span className="text-muted" style={{ fontSize: '12px' }}>{e.category}</span>
                </div>
                <h3 className="section-title mt-16">{e.title}</h3>
                <p className="text-muted" style={{ fontSize: '14px' }}>
                  by {e.organizer_name} · {e.venue} · {e.seats_taken}/{e.capacity} registered
                </p>
              </div>
              <div className="list-row-actions">
                {e.status !== 'approved' && (
                  <button onClick={() => setStatus(e.id, 'approved')} className="btn btn-success btn-sm">Approve</button>
                )}
                {e.status !== 'rejected' && (
                  <button onClick={() => setStatus(e.id, 'rejected')} className="btn btn-danger btn-sm">Reject</button>
                )}
                {e.status !== 'cancelled' && (
                  <button onClick={() => setStatus(e.id, 'cancelled')} className="btn btn-secondary btn-sm">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
