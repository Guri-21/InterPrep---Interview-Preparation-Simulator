import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense } from 'react';

import AppShell from '@/components/layout/AppShell.jsx';
import Spinner from '@/components/ui/Spinner.jsx';
import ProtectedRoute from '@/components/auth/ProtectedRoute.jsx';

const Landing   = lazy(() => import('@/pages/Landing.jsx'));
const Login     = lazy(() => import('@/pages/Login.jsx'));
const Signup    = lazy(() => import('@/pages/Signup.jsx'));
const Dashboard = lazy(() => import('@/pages/Dashboard.jsx'));
const Domains   = lazy(() => import('@/pages/Domains.jsx'));
const Interview = lazy(() => import('@/pages/Interview.jsx'));
const Results   = lazy(() => import('@/pages/Results.jsx'));
const Analytics = lazy(() => import('@/pages/Analytics.jsx'));
const Library   = lazy(() => import('@/pages/Library.jsx'));
const Settings  = lazy(() => import('@/pages/Settings.jsx'));
const Admin     = lazy(() => import('@/pages/Admin.jsx'));
const NotFound  = lazy(() => import('@/pages/NotFound.jsx'));

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Spinner label="Loading…" />
    </div>
  );
}

/**
 * Routes that live inside the AppShell and animate as the user navigates.
 * Everything here is auth-gated via <ProtectedRoute>.
 */
function ShellRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <Suspense fallback={<PageFallback />}>
          <Routes location={location}>
            <Route path="/dashboard"             element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/practice"              element={<ProtectedRoute><Domains /></ProtectedRoute>} />
            <Route path="/interview/:domainId"   element={<ProtectedRoute><Interview /></ProtectedRoute>} />
            <Route path="/interview/:domainId/results/:sessionId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
            <Route path="/analytics"             element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/library"               element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/settings"              element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/admin"                 element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />
            <Route path="*"                      element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const location = useLocation();
  const standalone = ['/', '/login', '/signup'].includes(location.pathname);

  if (standalone) {
    // Landing + auth pages render without the AppShell chrome.
    return (
      <Suspense fallback={<PageFallback />}>
        <Routes location={location}>
          <Route path="/"       element={<Landing />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <AppShell>
      <ShellRoutes />
    </AppShell>
  );
}
