import { Link } from 'react-router-dom';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EventCard({ event }) {
  const seatsLeft = event.capacity - event.seats_taken;
  const isFull = seatsLeft <= 0;

  return (
    <Link to={`/events/${event.id}`} className="event-card">
      {event.banner_url && (
        <div className="event-card-image" style={{ backgroundImage: `url(${event.banner_url})` }} />
      )}

      <div className="event-card-main">
        <div className="event-card-body">
          <p className="event-card-meta">{event.category} • {event.organizer_name}</p>
          <h3 className="event-card-title">{event.title}</h3>
          <p className="event-card-desc">{event.description}</p>
          <div className="event-card-info">
            <span>📍 {event.venue}</span>
            <span>{formatDate(event.event_date)}</span>
          </div>
        </div>

        <div className="ticket-stub">
          <span className="ticket-stub-seats">{isFull ? 'FULL' : `${seatsLeft} LEFT`}</span>
          <span className="ticket-stub-price">
            {Number(event.price) > 0 ? `₹${event.price}` : 'FREE'}
          </span>
          <span className="ticket-stub-time">{event.event_time?.slice(0, 5)}</span>
        </div>
      </div>
    </Link>
  );
}
