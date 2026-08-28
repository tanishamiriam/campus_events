import { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';

function StatCard({ label, value, accent }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className={`stat-value ${accent ? 'accent' : ''}`}>{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading platform stats…" />;
  if (!stats) return null;

  return (
    <div className="page">
      <h1 className="page-title">Admin overview</h1>
      <p className="page-subtitle">Platform-wide numbers, updated live.</p>

      <div className="stat-grid">
        <StatCard label="Total users" value={stats.users.total} />
        <StatCard label="Total events" value={stats.events.total} />
        <StatCard label="Registrations" value={stats.registrations} />
        <StatCard label="Revenue collected" value={`₹${stats.revenue}`} accent />
      </div>

      <div className="grid">
        <div className="stat-breakdown">
          <h2 className="section-title">Users by role</h2>
          <div className="stat-breakdown-row"><span className="label">Attendees</span><span>{stats.users.attendees || 0}</span></div>
          <div className="stat-breakdown-row"><span className="label">Organizers</span><span>{stats.users.organizers || 0}</span></div>
          <div className="stat-breakdown-row"><span className="label">Admins</span><span>{stats.users.admins || 0}</span></div>
        </div>

        <div className="stat-breakdown">
          <h2 className="section-title">Events by status</h2>
          <div className="stat-breakdown-row"><span className="label">Pending review</span><span style={{ color: 'var(--marigold)' }}>{stats.events.pending || 0}</span></div>
          <div className="stat-breakdown-row"><span className="label">Approved</span><span>{stats.events.approved || 0}</span></div>
          <div className="stat-breakdown-row"><span className="label">Rejected</span><span>{stats.events.rejected || 0}</span></div>
          <div className="stat-breakdown-row"><span className="label">Cancelled</span><span>{stats.events.cancelled || 0}</span></div>
        </div>
      </div>
    </div>
  );
}
