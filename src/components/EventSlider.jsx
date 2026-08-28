import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EventSlider({ events }) {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (events.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % events.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [events.length]);

  if (events.length === 0) return null;

  function goTo(i) {
    setIndex((i + events.length) % events.length);
  }

  return (
    <section className="slider">
      {events.map((event, i) => (
        <div
          key={event.id}
          className={`slider-slide ${i === index ? 'active' : ''}`}
          style={{ backgroundImage: event.banner_url ? `url(${event.banner_url})` : 'none' }}
        >
          <div className="slider-overlay" />
          <div className="slider-content">
            <p className="slider-eyebrow">{event.category} · Upcoming</p>
            <h2 className="slider-title">{event.title}</h2>
            <p className="slider-meta">📍 {event.venue} · {formatDate(event.event_date)}</p>
            <div className="slider-actions">
              <button className="btn btn-primary" onClick={() => navigate(`/events/${event.id}`)}>
                View & Book
              </button>
              <span className="slider-price">
                {Number(event.price) > 0 ? `₹${event.price}` : 'Free entry'}
              </span>
            </div>
          </div>
        </div>
      ))}

      {events.length > 1 && (
        <>
          <button className="slider-arrow slider-arrow-left" onClick={() => goTo(index - 1)} aria-label="Previous event">‹</button>
          <button className="slider-arrow slider-arrow-right" onClick={() => goTo(index + 1)} aria-label="Next event">›</button>
          <div className="slider-dots">
            {events.map((_, i) => (
              <button
                key={i}
                className={`slider-dot ${i === index ? 'active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
