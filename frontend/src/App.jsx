import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Common
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import ArticlesPage from './pages/public/ArticlesPage';
import NewsPage from './pages/public/NewsPage';
import AnnouncementsPage from './pages/public/AnnouncementsPage';
import EventsPage from './pages/public/EventsPage';
import ContentDetailPage from './pages/public/ContentDetailPage';
import AboutUsPage from './pages/public/AboutUsPage';
import ContactPage from './pages/public/ContactPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard
import DashboardLayout from './components/dashboard/DashboardLayout';
import OverviewPage from './pages/dashboard/OverviewPage';
import ContentListPage from './pages/dashboard/ContentListPage';
import ContentEditorPage from './pages/dashboard/ContentEditorPage';
import CategoriesPage from './pages/dashboard/CategoriesPage';
import MediaLibraryPage from './pages/dashboard/MediaLibraryPage';
import UserManagementPage from './pages/dashboard/UserManagementPage';
import ActivityLogsPage from './pages/dashboard/ActivityLogsPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import AIAssistantPage from './pages/dashboard/AIAssistantPage';

// Public Layout Wrapper
const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/content/:slug" element={<ContentDetailPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Authenticated CMS Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'editor', 'author']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="ai" element={<AIAssistantPage />} />
            <Route path="content" element={<ContentListPage />} />
            <Route path="content/create" element={<ContentEditorPage />} />
            <Route path="content/edit/:id" element={<ContentEditorPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="media" element={<MediaLibraryPage />} />
            
            {/* Admin only */}
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />

            {/* Admin & Editor only */}
            <Route
              path="activity"
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor']}>
                  <ActivityLogsPage />
                </ProtectedRoute>
              }
            />

            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
