import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotesPage from './pages/NotesPage';
import LandingPage from './pages/LandingPage';
import { authService } from './services/authService';
import { analyticsService } from './services/analyticsService';

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
        </BrowserRouter>
    );
}

export default App;
