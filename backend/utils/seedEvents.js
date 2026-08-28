// Seeds a handful of approved, photo-backed demo events so the homepage slider and
// event grid have something real to display out of the box. Safe to re-run — it
// skips events that already exist (matched by title). Run with: npm run seed:events
require('dotenv').config();
const pool = require('../config/db');

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const DEMO_EVENTS = [
  {
    title: 'TechnoVerse 2026',
    description: 'A full-day tech fest with hackathons, robotics demos, and talks from industry engineers. Open to all departments.',
    category: 'Technical',
    venue: 'Main Auditorium',
    event_date: daysFromNow(12),
    event_time: '09:00:00',
    capacity: 300,
    price: 0,
    banner_url: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Rhythm Nights — Cultural Fest',
    description: 'An evening of live music, dance battles, and open mic performances hosted by the cultural committee.',
    category: 'Cultural',
    venue: 'Open Air Theatre',
    event_date: daysFromNow(19),
    event_time: '18:30:00',
    capacity: 500,
    price: 150,
    banner_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Inter-Dept Sports Meet',
    description: 'Annual athletics and team sports competition between departments — track events, football, and basketball.',
    category: 'Sports',
    venue: 'Sports Complex',
    event_date: daysFromNow(25),
    event_time: '07:30:00',
    capacity: 400,
    price: 0,
    banner_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'UI/UX Design Sprint Workshop',
    description: 'A hands-on Figma workshop covering design systems, prototyping, and portfolio building — laptops required.',
    category: 'Workshop',
    venue: 'Design Lab, Block C',
    event_date: daysFromNow(8),
    event_time: '10:00:00',
    capacity: 60,
    price: 50,
    banner_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'AI in Industry — Guest Seminar',
    description: 'A seminar with alumni panelists discussing how AI is reshaping product and engineering roles after graduation.',
    category: 'Seminar',
    venue: 'Seminar Hall 2',
    event_date: daysFromNow(15),
    event_time: '14:00:00',
    capacity: 150,
    price: 0,
    banner_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80'
  }
];

async function seed() {
  const [[admin]] = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (!admin) {
    console.error('No admin account found — run "npm run seed" first to create one.');
    process.exit(1);
  }

  for (const event of DEMO_EVENTS) {
    const [existing] = await pool.query('SELECT id FROM events WHERE title = ?', [event.title]);
    if (existing.length > 0) {
      console.log(`Skipped (already exists): ${event.title}`);
      continue;
    }

    await pool.query(
      `INSERT INTO events (title, description, category, venue, event_date, event_time, capacity, price, banner_url, organizer_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')`,
      [
        event.title, event.description, event.category, event.venue, event.event_date,
        event.event_time, event.capacity, event.price, event.banner_url, admin.id
      ]
    );
    console.log(`Created: ${event.title}`);
  }

  console.log('\nDemo events are ready — refresh the homepage to see them in the slider.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
