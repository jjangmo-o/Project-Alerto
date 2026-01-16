import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../pages/Sidebar';
import Header from '../pages/Header';

const UserLayout = () => {
    const { profile } = useAuth();
    const userName = profile?.first_name || 'User';
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    return (
        <div className="app-container">
        {isSidebarOpen && (
            <div
            className="sidebar-overlay"
            onClick={() => setIsSidebarOpen(false)}
            />
        )}

        <Sidebar isOpen={isSidebarOpen} role="user" />

        <main className="main-content">
            <Header onMenuClick={toggleSidebar} username={userName} />
            <Outlet />
        </main>
        </div>
    );
};

export default UserLayout;