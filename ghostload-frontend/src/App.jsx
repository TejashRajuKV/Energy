import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Marketing
import LandingPage from './pages/marketing/LandingPage';
import AboutPage from './pages/marketing/AboutPage';
import FeaturesPage from './pages/marketing/FeaturesPage';
import ContactPage from './pages/marketing/ContactPage';

// Auth
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import OnboardingPage from './pages/auth/OnboardingPage';

// App
import DashboardPage from './pages/app/DashboardPage';
import SitesPage from './pages/app/SitesPage';
import SiteDetailPage from './pages/app/SiteDetailPage';
import NewSitePage from './pages/app/NewSitePage';
import NewAnalysisWizard from './pages/app/NewAnalysisWizard';
import AnalysisResultPage from './pages/app/AnalysisResultPage';
import ScenarioSimulatorPage from './pages/app/ScenarioSimulatorPage';
import ProfilePage from './pages/app/ProfilePage';
import SharedReportPage from './pages/app/SharedReportPage';
import CompareSitesPage from './pages/app/CompareSitesPage';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 60_000 } } });

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: 40, height: 40, background: 'var(--accent-terracotta)', borderRadius: 10, animation: 'pulse 1.5s infinite' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</span>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return children;
}

export default function App() {
  const { fetchMe } = useAuthStore();
  useEffect(() => { fetchMe(); }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'var(--font-body)', fontSize: '0.875rem', borderRadius: '10px', border: '1px solid var(--border-light)' }, success: { iconTheme: { primary: 'var(--state-success)', secondary: '#fff' } }, error: { iconTheme: { primary: 'var(--state-error)', secondary: '#fff' } } }} />
        <Routes>
          {/* Marketing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/pricing" element={<FeaturesPage />} />

          {/* Shared */}
          <Route path="/shared/:shareToken" element={<SharedReportPage />} />

          {/* Auth (public-only) */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

          {/* Onboarding */}
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

          {/* App (protected) */}
          <Route path="/app" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/app/sites" element={<ProtectedRoute><SitesPage /></ProtectedRoute>} />
          <Route path="/app/sites/new" element={<ProtectedRoute><NewSitePage /></ProtectedRoute>} />
          <Route path="/app/sites/:siteId" element={<ProtectedRoute><SiteDetailPage /></ProtectedRoute>} />
          <Route path="/app/sites/:siteId/new-analysis" element={<ProtectedRoute><NewAnalysisWizard /></ProtectedRoute>} />
          <Route path="/app/compare" element={<ProtectedRoute><CompareSitesPage /></ProtectedRoute>} />
          <Route path="/app/analyses/:analysisId" element={<ProtectedRoute><AnalysisResultPage /></ProtectedRoute>} />
          <Route path="/app/analyses/:analysisId/scenarios" element={<ProtectedRoute><ScenarioSimulatorPage /></ProtectedRoute>} />
          <Route path="/app/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="/app/*" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
