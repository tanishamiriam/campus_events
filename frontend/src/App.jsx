import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';//component(rbac)

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetails from './pages/EventDetails';
import MyTickets from './pages/MyTickets';
import AttendeeDashboard from './pages/AttendeeDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import OrganizerProfile from './pages/OrganizerProfile';
import CreateEditEvent from './pages/CreateEditEvent';
import EventAttendees from './pages/EventAttendees';
import CheckIn from './pages/CheckIn';
import AdminDashboard from './pages/AdminDashboard';
import AdminEvents from './pages/AdminEvents';
import AdminUsers from './pages/AdminUsers';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div>
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events/:id" element={<EventDetails />} />

          {/* Attendee Protected Routes */}
          <Route
            path="/attendee-dashboard"
            element={
              <ProtectedRoute roles={['attendee']}>
                <AttendeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-tickets"
            element={
              <ProtectedRoute roles={['attendee']}>
                <MyTickets />
              </ProtectedRoute>
            }
          />

          {/* Organizer Protected Routes */}
          <Route
            path="/organizer"
            element={
              <ProtectedRoute roles={['organizer']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
          {/* Alias for /organizer-dashboard */}
          <Route
            path="/organizer-dashboard"
            element={<Navigate to="/organizer" replace />}
          />
          <Route
            path="/organizer/profile"
            element={
              <ProtectedRoute roles={['organizer']}>
                <OrganizerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/new"
            element={
              <ProtectedRoute roles={['organizer']}>
                <CreateEditEvent />//comp for creating events 
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/edit/:id"
            element={
              <ProtectedRoute roles={['organizer']}>
                <CreateEditEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/:eventId/attendees"
            element={
              <ProtectedRoute roles={['organizer', 'admin']}>
                <EventAttendees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/check-in"
            element={
              <ProtectedRoute roles={['organizer', 'admin']}>
                <CheckIn />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          {/* Alias for /admin-dashboard */}
          <Route
            path="/admin-dashboard"
            element={<Navigate to="/admin" replace />}
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}