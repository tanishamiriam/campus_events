import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-narrow" style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '56px', fontWeight: 700, color: 'var(--marigold)' }}>404</p>
      <p className="text-muted mb-24">That page doesn't exist.</p>
      <Link to="/" className="back-link">Back to events</Link>
    </div>
  );
}
