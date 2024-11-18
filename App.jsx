import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Menu from './components/Menu.jsx';
import RegistrationPage from './pages/RegistrationPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import { useEffect, useState } from 'react';
import AuthService from './services/auth.service.js';
import FullscreenLoader from './components/FullscreenLoader.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useNavigate } from 'react-router-dom';
import AuthGuard from "./components/AuthGuard.jsx";
import {RoleProvider} from "./components/RoleContext.jsx";
import PortfolioPage from "./pages/PortfolioPage.jsx";

function AppContent() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setLoading(false);
            navigate('/login');
            return;
        }

        try {
            const userProfile = await AuthService.getProfile();
            setProfile(userProfile);
        } catch (error) {
            console.error('Error fetching profile:', error);
            AuthService.logout();
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <FullscreenLoader show={loading} />;
    }

    return (
        <div>
            <Menu />
            <Routes>
                <Route path="/" element={<AuthGuard><PortfolioPage /></AuthGuard>} />
                <Route path="/register" element={<RegistrationPage />} />
                <Route path="/login" element={<LoginPage setProfile={setProfile} />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <RoleProvider>
            <Router>
                <ToastContainer/>
                <AppContent />
            </Router>
        </RoleProvider>
    );
}

export default App;
