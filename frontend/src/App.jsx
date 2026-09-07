import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analyzer from './pages/Analyzer';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function Layout({ children, user, onLogout }) {
  const location = useLocation();

  const getPageInfo = (path) => {
    switch (path) {
      case '/':
        return { title: 'Dashboard', subtitle: 'Real-time safety intelligence & incident overview' };
      case '/analyzer':
        return { title: 'AI Incident Analyzer', subtitle: 'Explainable NLP risk assessment & recommendations' };
      case '/history':
        return { title: 'Incident History', subtitle: 'Searchable database of logged safety events' };
      case '/analytics':
        return { title: 'Safety Analytics', subtitle: 'Statistical breakdown and comparative metrics' };
      case '/reports':
        return { title: 'PDF Reports', subtitle: 'Official ReportLab document generation' };
      case '/settings':
        return { title: 'Settings', subtitle: 'System preferences & profile management' };
      default:
        return { title: 'SafeSense', subtitle: 'Workplace Incident Intelligence' };
    }
  };

  const { title, subtitle } = getPageInfo(location.pathname);

  return (
    <div className="flex min-h-screen bg-[#090D16]">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('safesense_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    // Default logged in demo admin
    return {
      name: 'Safety Admin',
      email: 'admin@safesense.com',
      role: 'Lead Safety Officer'
    };
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('safesense_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('safesense_user');
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />

        <Route
          path="/*"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/analyzer" element={<Analyzer />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings user={user} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}
