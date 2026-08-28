import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Auto-advancing slider for featured/upcoming events, with a full-bleed photo,
// dot navigation, and manual arrows. Falls back gracefully if an event has no banner_url.
export default function EventCarousel({ events }) {
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

  const event = events[index];
  const fallbackBg = 'linear-gradient(135deg, #242438, #121220)';

  return (
    <section className="carousel">
      <div
        className="carousel-slide"
        style={{
          backgroundImage: event.banner_url
            ? `linear-gradient(rgba(10,10,15,0.35), rgba(10,10,15,0.85)), url(${event.banner_url})`
            : fallbackBg
        }}
        onClick={() => navigate(`/events/${event.id}`)}
      >
        <div className="carousel-content">
          <p className="carousel-eyebrow">{event.category} · {formatDate(event.event_date)}</p>
          <h2 className="carousel-title">{event.title}</h2>
          <p className="carousel-meta">📍 {event.venue}</p>
          <button
            className="btn btn-primary mt-16"
            onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }}
          >
            View & book →
          </button>
        </div>
      </div>

      {events.length > 1 && (
        <>
          <button
            className="carousel-arrow left"
            onClick={() => setIndex((i) => (i - 1 + events.length) % events.length)}
            aria-label="Previous event"
          >
            ‹
          </button>
          <button
            className="carousel-arrow right"
            onClick={() => setIndex((i) => (i + 1) % events.length)}
            aria-label="Next event"
          >
            ›
          </button>

          <div className="carousel-dots">
            {events.map((_, i) => (
              <button
                key={i}
                className={`carousel-dot ${i === index ? 'active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
