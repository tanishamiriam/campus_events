import { useState } from 'react';
import api from '../api/axios';

export default function CheckIn() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/registrations/checkin', { ticket_code: code.trim() });
      setResult({ ok: true, message: data.message });
    } catch (err) {
      setResult({ ok: false, message: err.response?.data?.message || 'Check-in failed.' });
    } finally {
      setLoading(false);
      setCode('');
    }
  }

  return (
    <div className="page-narrow">
      <h1 className="page-title">Check-in</h1>
      <p className="page-subtitle">
        Scan a ticket's QR code with any scanner app (it just pastes the code as text), or type it in below.
      </p>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label className="form-label">Ticket code</label>
          <input
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste or type ticket code"
            className="form-input"
            style={{ fontFamily: 'monospace' }}
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary btn-block">
          {loading ? 'Checking…' : 'Check in'}
        </button>
      </form>

      {result && (
        <div className={`alert ${result.ok ? 'alert-success' : 'alert-error'} mt-16`}>
          {result.message}
        </div>
      )}
    </div>
  );
}
