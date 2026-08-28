// Sets up demo accounts and sample events so the app has content out of the box.
// Run with: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function upsertUser({ name, email, password, role, department }) {
  const hashed = await bcrypt.hash(password, 10);
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

  if (existing.length > 0) {
    await pool.query('UPDATE users SET password = ?, role = ?, name = ? WHERE email = ?', [hashed, role, name, email]);
    return existing[0].id;
  }

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)',
    [name, email, hashed, role, department || null]
  );
  return result.insertId;
}

// A handful of realistic college events, each with a stock photo banner.
// Dates are set relative to "today" so they always show up as upcoming, no matter when you seed.
function sampleEvents(organizerId) {
  const daysFromNow = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };

  return [
    {
      title: 'TechnoVerse 2026 — Annual Tech Fest',
      description: 'A two-day celebration of code, robotics and startup pitches. Hackathon, coding contests, robotics demos, and a startup pitch stage — open to all departments.',
      category: 'Technical',
      venue: 'Main Auditorium',
      event_date: daysFromNow(14),
      event_time: '09:30:00',
      capacity: 300,
      price: 0,
      banner_url: 'https://picsum.photos/id/180/900/500'
    },
    {
      title: 'Rhythms — Cultural Night',
      description: 'An evening of music, dance and drama performed by student clubs, followed by a live band and open mic.',
      category: 'Cultural',
      venue: 'Open Air Theatre',
      event_date: daysFromNow(21),
      event_time: '18:00:00',
      capacity: 500,
      price: 150,
      banner_url: 'https://picsum.photos/id/1062/900/500'
    },
    {
      title: 'Inter-Department Sports Meet',
      description: 'Athletics, cricket, basketball and badminton finals across departments. Come cheer your team on.',
      category: 'Sports',
      venue: 'University Sports Complex',
      event_date: daysFromNow(28),
      event_time: '08:00:00',
      capacity: 400,
      price: 0,
      banner_url: 'https://picsum.photos/id/1071/900/500'
    },
    {
      title: 'Intro to Machine Learning — Hands-on Workshop',
      description: 'A beginner-friendly, laptop-required workshop covering Python, pandas, and building your first classifier. Certificates provided.',
      category: 'Workshop',
      venue: 'CS Department Lab 2',
      event_date: daysFromNow(9),
      event_time: '10:00:00',
      capacity: 60,
      price: 50,
      banner_url: 'https://picsum.photos/id/60/900/500'
    },
    {
      title: 'Careers in Product Design — Guest Seminar',
      description: 'An industry designer walks through breaking into UX/product design, with a portfolio review session afterward.',
      category: 'Seminar',
      venue: 'Seminar Hall B',
      event_date: daysFromNow(5),
      event_time: '15:00:00',
      capacity: 120,
      price: 0,
      banner_url: 'https://picsum.photos/id/96/900/500'
    },
    {
      title: 'Alumni Connect 2026',
      description: 'Network with alumni across tech, finance and design. Panel discussion followed by informal mixers.',
      category: 'General',
      venue: 'Convocation Hall',
      event_date: daysFromNow(35),
      event_time: '17:30:00',
      capacity: 200,
      price: 0,
      banner_url: 'https://picsum.photos/id/1076/900/500'
    }
  ].map((e) => ({ ...e, organizer_id: organizerId, status: 'approved' }));
}

async function seed() {
  const adminId = await upsertUser({
    name: 'Campus Admin', email: 'admin@campus.edu', password: 'Admin@123', role: 'admin'
  });

  // Demo organizer — sample events below are created under this account
  const organizerId = await upsertUser({
    name: 'Aditi Rao', email: 'organizer@campus.edu', password: 'Organizer@123',
    role: 'organizer', department: 'Student Activity Council'
  });

  // Demo attendee — handy for testing the "sell ticket" / walk-in flow as an organizer
  await upsertUser({
    name: 'Rahul Menon', email: 'attendee@campus.edu', password: 'Attendee@123',
    role: 'attendee', department: 'Computer Science'
  });

  const [existingEvents] = await pool.query('SELECT id FROM events WHERE organizer_id = ?', [organizerId]);
  if (existingEvents.length > 0) {
    console.log('Sample events already exist for the demo organizer — skipping event seed.');
  } else {
    const events = sampleEvents(organizerId);
    for (const e of events) {
      await pool.query(
        `INSERT INTO events (title, description, category, venue, event_date, event_time, capacity, price, banner_url, organizer_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [e.title, e.description, e.category, e.venue, e.event_date, e.event_time, e.capacity, e.price, e.banner_url, e.organizer_id, e.status]
      );
    }
    console.log(`Created ${events.length} sample approved events.`);
  }

  console.log(`
Login with:
  Admin:     admin@campus.edu     / Admin@123
  Organizer: organizer@campus.edu / Organizer@123
  Attendee:  attendee@campus.edu  / Attendee@123
`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
