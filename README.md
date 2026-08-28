# Kampus — Campus Event Management System

A full-stack event management system for college fests, workshops, and seminars.
Built with **React (Vite) + plain CSS + Redux Toolkit** on the frontend and **Node.js/Express + MySQL** on the backend.

## Roles

- **Attendee** — browse upcoming events (photo carousel + searchable grid), book tickets, pay (mock), view QR-code tickets, track events attended, from a personal dashboard
- **Organizer** — create/update events (go live after admin approval), see tickets sold vs. capacity per event, sell a ticket at the door, view attendee lists, check attendees in, from a personal dashboard
- **Admin** — approve/reject/cancel events, view platform-wide stats, manage user roles

## Features

- JWT auth with bcrypt password hashing, session state managed with Redux Toolkit
- Event CRUD with an approval workflow (organizer submits → admin approves/rejects)
- **Home page photo carousel** — auto-rotating banner of upcoming events, click through to book
- Registration with live capacity limits (no overbooking, no duplicate registrations)
- Clear **"Booking successful"** confirmation panel after registering, linking straight to the ticket
- Mock payment gateway for paid events (swap in Razorpay/Stripe later — see `paymentController.js`)
- QR-code ticket generation, unlocked once payment/registration is complete
- **Organizer dashboard**: profile header, stats (events created / tickets sold / revenue), a "what you can do" guide, a ticket-sold progress bar per event, and a **walk-in ticket sale** form (sell a ticket at the door to an attendee who already has an account)
- **Attendee dashboard**: profile header, stats (total tickets / upcoming / attended), a "what you can do" guide, and the full ticket list
- Check-in flow: organizer enters/scans a ticket code, ticket flips to "checked in"
- Admin dashboard: user counts, event counts by status, revenue, category breakdown

## Project structure

```
campus-events/
├── backend/         Express API (MySQL via mysql2)
│   ├── config/       DB connection pool
│   ├── controllers/  Route logic (auth, events, registrations, payments, admin)
│   ├── middleware/   JWT verification + role guards
│   ├── routes/        Express routers
│   ├── utils/         QR code helper + seed script (demo accounts + sample events)
│   ├── schema.sql      Run this once to create the database
│   └── server.js
└── frontend/         React app (Vite + plain CSS + Redux Toolkit)
    └── src/
        ├── index.css    All styles in one file (variables, buttons, cards, forms, tables, carousel…)
        ├── utils/        Axios instance with auth header injection
        ├── redux/        Redux Toolkit store, reducers, and authSlice
        ├── components/  Navbar, EventCard, EventCarousel, ProtectedRoute, etc.
        └── pages/       One file per screen (Home, Login, EventDetails, dashboards…)
```

## Setup

### 1. Database

Make sure MySQL is running locally, then:

```bash
mysql -u root -p < backend/schema.sql
```

This creates the `campus_events` database and all tables.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env — set DB_PASSWORD and a random JWT_SECRET
npm run seed   # creates demo accounts + sample events
npm run dev    # starts on http://localhost:5000
```

`npm run seed` creates three ready-to-use accounts and six sample **approved** events (with photos) under the demo organizer, so the app has real content the moment you open it:

| Role      | Email                | Password       |
|-----------|-----------------------|-----------------|
| Admin     | admin@campus.edu      | Admin@123       |
| Organizer | organizer@campus.edu  | Organizer@123   |
| Attendee  | attendee@campus.edu   | Attendee@123    |

(Change these before any real deployment.)

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # defaults to http://localhost:5000/api, edit if needed
npm run dev             # starts on http://localhost:5173
```

Open `http://localhost:5173` — you should immediately see the photo carousel and event grid populated from the seed data.

## Typical demo flow

1. Open the site logged out → carousel and event grid are already populated (seed data).
2. Log in as **attendee@campus.edu** → open an event → Register → see the "Booking successful" panel → check "My tickets" for the QR code.
3. Log in as **organizer@campus.edu** → see the dashboard profile, stats, and the ticket-sold progress bar on each event → try "Sell ticket" using `attendee@campus.edu` as the email (simulates a walk-in sale) → open "Attendees" to see the full list → use "Check-in" with a ticket code to check someone in.
4. Log in as **admin@campus.edu** → create a new organizer event from another account and approve/reject it under Moderation → check the Admin overview stats.

## Notes for your project write-up

- Passwords are hashed with bcrypt; sessions are stateless JWTs (7-day expiry), held in Redux state and persisted to `localStorage` so a refresh doesn't log you out.
- The payment flow is intentionally mocked (no real money moves) — it simulates a gateway so the ticketing/QR flow is fully demonstrable without external API keys. Swapping in a real gateway only touches `paymentController.js`.
- The "sell ticket" (walk-in) flow requires the attendee to already have an account — the organizer looks them up by email rather than the app creating accounts on their behalf, which keeps auth logic in one place.
- Authorization is enforced both in route middleware (`requireRole`) and inside controllers (e.g. an organizer can only edit/delete/view attendees/sell tickets for their own events).
- Event photos in the seed data are stock placeholder images (`picsum.photos`) referenced by URL — swap `banner_url` for your own image links (or a real upload flow) any time.
