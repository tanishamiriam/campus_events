import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';

const CATEGORY_DATA = [
  {
    name: 'All',
    label: 'All Events',
    icon: '✨',
    img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Technical',
    label: 'Technical',
    icon: '💻',
    img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Cultural',
    label: 'Cultural & Fests',
    icon: '🎭',
    img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Sports',
    label: 'Sports & Games',
    icon: '🏆',
    img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Workshop',
    label: 'Workshops & Bootcamps',
    icon: '🛠️',
    img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80',
  },
];

const DEFAULT_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

  async function fetchEvents() {
    setLoading(true);
    try {
      const categoryParam = selectedCategory !== 'All' ? selectedCategory : '';
      const { data } = await api.get('/events', {
        params: {
          category: categoryParam,
          search: search.trim() || undefined,
        },
      });
      setEvents(Array.isArray(data) ? data : data?.events || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchEvents();
  }

  const filteredEvents = events.filter((ev) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      ev.title?.toLowerCase().includes(term) ||
      ev.venue?.toLowerCase().includes(term) ||
      ev.description?.toLowerCase().includes(term) ||
      ev.category?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="home-container" style={{ minHeight: '100vh', background: '#0b0d19', color: '#f8fafc' }}>
      {/* 1. HERO BANNER SECTION */}
      <section
        style={{
          position: 'relative',
          padding: '6rem 1.5rem 5rem',
          textAlign: 'center',
          backgroundImage: `linear-gradient(180deg, rgba(11, 13, 25, 0.75) 0%, rgba(11, 13, 25, 0.95) 100%), url('https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1800&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '0.5px',
              marginBottom: '1rem',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            ⚡ CAMPUS LIFE & EXPERIENCES
          </span>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              fontWeight: '800',
              lineHeight: '1.15',
              letterSpacing: '-0.5px',
              margin: '0 0 1rem',
            }}
          >
            Every workshop, fest and seminar on campus —{' '}
            <span style={{ color: '#f59e0b', textShadow: '0 0 25px rgba(245, 158, 11, 0.3)' }}>
              one ticket away.
            </span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: '#94a3b8', margin: '0 auto 2.5rem', maxWidth: '620px', lineHeight: '1.6' }}>
            Browse what's happening across departments, grab a ticket, and show your QR code at the door.
          </p>

          {/* Search Bar Input */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              maxWidth: '650px',
              margin: '0 auto',
              display: 'flex',
              gap: '8px',
              background: '#131627',
              padding: '6px',
              borderRadius: '12px',
              border: '1px solid #2e3456',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hackathons, cultural nights, sports meet..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                padding: '12px 18px',
                color: '#fff',
                fontSize: '15px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: '#f59e0b',
                color: '#0b0d19',
                border: 'none',
                fontWeight: '700',
                padding: '0 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: '0.2s transform',
              }}
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* 2. VISUAL CATEGORY TILES */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem 1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', color: '#cbd5e1' }}>
          Explore by Category
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '1rem',
          }}
        >
          {CATEGORY_DATA.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <div
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                style={{
                  position: 'relative',
                  height: '110px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #f59e0b' : '1px solid #1e293b',
                  boxShadow: isSelected ? '0 0 15px rgba(245, 158, 11, 0.4)' : 'none',
                  transition: 'transform 0.2s ease',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <img
                  src={cat.img}
                  alt={cat.label}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: isSelected ? 'brightness(0.7)' : 'brightness(0.4)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    background: 'linear-gradient(0deg, rgba(11,13,25,0.9) 0%, rgba(11,13,25,0.2) 100%)',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: isSelected ? '#f59e0b' : '#fff' }}>
                    {cat.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. UPCOMING EVENTS GRID */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
              {selectedCategory === 'All' ? 'Upcoming Campus Events' : `${selectedCategory} Events`}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0' }}>
              Showing {filteredEvents.length} active events
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center' }}>
            <Loader label="Fetching events..." />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              background: '#131627',
              borderRadius: '16px',
              border: '1px solid #1e293b',
            }}
          >
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>🔍</span>
            <h3 style={{ fontSize: '1.25rem', margin: '0 0 6px' }}>No events match your criteria</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
              Try selecting another category, searching a different keyword, or check back later!
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {filteredEvents.map((e) => {
              const dateObj = new Date(e.event_date);
              const day = dateObj.getDate() || '—';
              const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
              const capacity = Number(e.capacity) || 100;
              const taken = Number(e.seats_taken) || 0;
              const isFull = taken >= capacity;

              return (
                <div
                  key={e.id}
                  style={{
                    background: '#131627',
                    borderRadius: '16px',
                    border: '1px solid #1e293b',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {/* Event Banner Image Header */}
                  <div style={{ position: 'relative', height: '170px', width: '100%', overflow: 'hidden' }}>
                    <img
                      src={e.banner_url || DEFAULT_EVENT_IMAGE}
                      alt={e.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(6px)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <span style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#f59e0b' }}>
                        {month}
                      </span>
                      <span style={{ display: 'block', fontSize: '16px', fontWeight: '800', color: '#fff' }}>
                        {day}
                      </span>
                    </div>

                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <span
                        style={{
                          background: 'rgba(15, 23, 42, 0.85)',
                          color: '#fff',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        {Number(e.price) === 0 ? 'FREE' : `₹${e.price}`}
                      </span>
                    </div>
                  </div>

                  {/* Event Details Content */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600', textTransform: 'uppercase' }}>
                      {e.category || 'General'}
                    </span>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '6px 0 8px', lineHeight: '1.3' }}>
                      {e.title}
                    </h3>

                    <p
                      style={{
                        color: '#94a3b8',
                        fontSize: '13px',
                        margin: '0 0 1rem',
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {e.description || 'No description provided for this campus event.'}
                    </p>

                    <div style={{ marginTop: 'auto' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          color: '#cbd5e1',
                          marginBottom: '1rem',
                        }}
                      >
                        <span>📍 {e.venue || 'Campus Venue'}</span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '1px solid #1e293b',
                          paddingTop: '1rem',
                        }}
                      >
                        <span style={{ fontSize: '12px', color: isFull ? '#ef4444' : '#94a3b8' }}>
                          {isFull ? 'Sold Out' : `${capacity - taken} spots left`}
                        </span>

                        <Link
                          to={`/events/${e.id}`}
                          style={{
                            background: isFull ? '#334155' : '#f59e0b',
                            color: isFull ? '#94a3b8' : '#0b0d19',
                            fontWeight: '700',
                            fontSize: '13px',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            transition: 'opacity 0.2s',
                          }}
                        >
                          {isFull ? 'View Event' : 'Book Ticket →'}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}