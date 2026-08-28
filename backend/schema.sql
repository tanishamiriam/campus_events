-- Campus Events Management System — Database Schema
-- Run this once against a fresh MySQL database (see README for setup)

CREATE DATABASE IF NOT EXISTS campus_events;
USE campus_events;

-- ---------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,
  role          ENUM('admin', 'organizer', 'attendee') NOT NULL DEFAULT 'attendee',
  department    VARCHAR(100) DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- EVENTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(150) NOT NULL,
  description     TEXT,
  category        VARCHAR(60) NOT NULL DEFAULT 'General',
  venue           VARCHAR(150) NOT NULL,
  event_date      DATE NOT NULL,
  event_time      TIME NOT NULL,
  capacity        INT NOT NULL DEFAULT 100,
  price           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  banner_url      VARCHAR(500) DEFAULT NULL,
  organizer_id    INT NOT NULL,
  status          ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- REGISTRATIONS (one attendee signing up for one event)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registrations (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  event_id        INT NOT NULL,
  user_id         INT NOT NULL,
  ticket_code     VARCHAR(64) NOT NULL UNIQUE,
  payment_status  ENUM('free', 'pending', 'paid') NOT NULL DEFAULT 'free',
  checked_in      BOOLEAN NOT NULL DEFAULT FALSE,
  checked_in_at   TIMESTAMP NULL DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_registration (event_id, user_id)
);

-- ---------------------------------------------------------------------
-- PAYMENTS (mock/simulated gateway — logs a transaction per paid ticket)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  registration_id   INT NOT NULL,
  amount            DECIMAL(10,2) NOT NULL,
  status            ENUM('pending', 'success', 'failed') NOT NULL DEFAULT 'pending',
  transaction_id    VARCHAR(64) DEFAULT NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
);

-- Helpful indexes
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_user ON registrations(user_id);
