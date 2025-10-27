import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard/Dashboard';
import Tasks from './pages/Tasks/Tasks';
import AIInsights from './pages/AIInsights/AIInsights';
import Expenses from './pages/Expenses/Expenses';
import Calendar from './pages/Calendar/Calendar';
import Settings from './pages/Settings/Settings';
import { SettingsProvider } from './context/SettingsContext';

// Placeholder pages - replace with actual later

// Navbar component (responsive)
const Navbar = ({ toggleSidebar, isMobile }) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <button className="sidebar-toggle" onClick={toggleSidebar}>
                    <i className="bi bi-list"></i>
                </button>
                <div className="navbar-brand">
                    <i className="bi bi-grid-3x3-gap-fill"></i>
                    {!isMobile && <span>Smart Dashboard</span>}
                </div>
            </div>
            <div className="navbar-right">
                <button className="navbar-btn" title="Notifications">
                    <i className="bi bi-bell"></i>
                    <span className="notification-badge">3</span>
                </button>
                {!isMobile && (
                    <button className="navbar-btn" title="Settings">
                        <i className="bi bi-gear"></i>
                    </button>
                )}
                <div className="navbar-profile-container">
                    <button
                        className="navbar-profile"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <div className="profile-avatar">AG</div>
                    </button>
                    {showProfileMenu && (
                        <div className="profile-dropdown">
                            <div className="profile-dropdown-header">
                                <div className="profile-avatar-large">AG</div>
                                <div>
                                    <div className="profile-name">Aggios</div>
                                    <div className="profile-email">user@example.com</div>
                                </div>
                            </div>
                            <div className="profile-dropdown-divider"></div>
                            <a href="/profile" className="profile-dropdown-item">
                                <i className="bi bi-person"></i>
                                Profile
                            </a>
                            <a href="/settings" className="profile-dropdown-item">
                                <i className="bi bi-gear"></i>
                                Settings
                            </a>
                            <div className="profile-dropdown-divider"></div>
                            <button className="profile-dropdown-item logout">
                                <i className="bi bi-box-arrow-right"></i>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

// Sidebar component with active link highlighting
const Sidebar = ({ collapsed }) => {
    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <nav className="sidebar-nav">
                <NavLink
                    to="/"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    end
                >
                    <i className="bi bi-house-door"></i>
                    <span>Dashboard</span>
                </NavLink>
                <NavLink
                    to="/tasks"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <i className="bi bi-check-square"></i>
                    <span>Tasks</span>
                </NavLink>
                <NavLink
                    to="/expenses"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <i className="bi bi-wallet2"></i>
                    <span>Expenses</span>
                </NavLink>
                <NavLink
                    to="/ai-insights"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <i className="bi bi-stars"></i>
                    <span>AI Insights</span>
                </NavLink>
                <NavLink
                    to="/calendar"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <i className="bi bi-calendar"></i>
                    <span>Calendar</span>
                </NavLink>
                <div className="nav-divider"></div>
                <NavLink
                    to="/settings"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <i className="bi bi-gear"></i>
                    <span>Settings</span>
                </NavLink>
            </nav>
        </aside>
    );
};

function App() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setSidebarCollapsed(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Call on mount

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <SettingsProvider>
            <Router>
                <div className="app">
                    <Navbar toggleSidebar={toggleSidebar} isMobile={isMobile} />
                    <Sidebar collapsed={sidebarCollapsed} />
                    <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/tasks" element={<Tasks />} />
                            <Route path="/expenses" element={<Expenses />} />
                            <Route path="/ai-insights" element={<AIInsights />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/calendar" element={<Calendar />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </SettingsProvider>
    );
}

export default App;
