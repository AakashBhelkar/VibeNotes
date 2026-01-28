import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { authService } from './services/authService';
import { analyticsService } from './services/analyticsService';
import { PageLoader } from './components/PageLoader';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    return authService.isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
}

function AnalyticsTracker() {
    const location = useLocation();

    useEffect(() => {
        analyticsService.trackPageView();
    }, [location.pathname]);

    return null;
}

function App() {
    return (
        <BrowserRouter>
            <AnalyticsTracker />
            <OfflineIndicator />
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route
                        path="/notes"
                        element={
                            <ProtectedRoute>
                                <NotesPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Suspense>
            <PWAInstallPrompt />
        </BrowserRouter>
    );
}

export default App;
