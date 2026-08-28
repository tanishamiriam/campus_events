import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';

const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'General'];

const EMPTY = {
  title: '', description: '', category: 'Technical', venue: '',
  event_date: '', event_time: '', capacity: 100, price: 0, banner_url: ''
};

export default function CreateEditEvent() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) loadEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadEvent() {
    try {
      const { data } = await api.get(`/events/${id}`);
      setForm({
        title: data.title, description: data.description || '', category: data.category,
        venue: data.venue, event_date: data.event_date?.slice(0, 10), event_time: data.event_time?.slice(0, 5),
        capacity: data.capacity, price: data.price, banner_url: data.banner_url || ''
      });
    } catch (err) {
      setError('Could not load this event.');
    } finally {
      setLoading(false);
    }
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/events/${id}`, form);
      } else {
        await api.post('/events', form);
      }
      navigate('/organizer');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this event.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader label="Loading event…" />;

  return (
    <div className="page-narrow" style={{ maxWidth: '600px' }}>
      <h1 className="page-title">{isEdit ? 'Edit event' : 'Create an event'}</h1>
      <p className="page-subtitle">
        {isEdit ? 'Changes will be sent back to the admin for re-approval.' : 'Your event goes live once an admin approves it.'}
      </p>

      <form onSubmit={handleSubmit} className="form-card">
        {error && <p className="alert alert-error">{error}</p>}

        <div className="form-group">
          <label className="form-label">Title</label>
          <input required value={form.title} onChange={(e) => update('title', e.target.value)} className="form-input" />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} className="form-textarea" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select value={form.category} onChange={(e) => update('category', e.target.value)} className="form-select">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Venue</label>
            <input required value={form.venue} onChange={(e) => update('venue', e.target.value)} className="form-input" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" required value={form.event_date} onChange={(e) => update('event_date', e.target.value)} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Time</label>
            <input type="time" required value={form.event_time} onChange={(e) => update('event_time', e.target.value)} className="form-input" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Capacity</label>
            <input type="number" min={1} required value={form.capacity} onChange={(e) => update('capacity', e.target.value)} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Price (₹, 0 for free)</label>
            <input type="number" min={0} value={form.price} onChange={(e) => update('price', e.target.value)} className="form-input" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Banner image URL (optional)</label>
          <input value={form.banner_url} onChange={(e) => update('banner_url', e.target.value)} placeholder="https://…" className="form-input" />
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary btn-block">
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create event'}
        </button>
      </form>
    </div>
  );
}
