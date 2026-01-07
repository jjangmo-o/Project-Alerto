import { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';
import { notificationService, type Notification, type NotificationType, type SeverityLevel } from '../services/notificationService';
import './Notifications.css';

type FilterType = 'all' | NotificationType;
type SortOption = 'newest' | 'oldest';

const Notifications = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const userName = profile?.first_name || 'User';

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await notificationService.getAll();
        setNotifications(data);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        setError('Failed to load notifications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const subscription = notificationService.subscribeToRealtime((newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const filteredNotifications = activeTab === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeTab);

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const getSeverityClass = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical': return 'severity-critical';
      case 'urgent': return 'severity-urgent';
      case 'normal': return 'severity-normal';
      default: return '';
    }
  };

    const getSeverityLabel = (severity: SeverityLevel) => {
    switch (severity) {
        case 'critical': return 'CRITICAL';
        case 'urgent': return 'URGENT';
        case 'normal': return 'ALERT'; // matches UI
        default: return '';
    }
    };


  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'typhoon': return '🌀';
      case 'earthquake': return '🌍';
      case 'fire': return '🔥';
      case 'flood': return '🌊';
      default: return '⚠️';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDismiss = useCallback(async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await notificationService.dismiss(id);
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
      setError(null);
    } catch {
      setError('Failed to refresh notifications.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notifications-container">
      <Sidebar isOpen={isSidebarOpen} />

      <main className="notifications-main">
        <Header onMenuClick={toggleSidebar} username={userName} />

        <section className="notifications-content">
          <div className="notifications-controls">
            <div className="notifications-tabs">
              <button
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Types
              </button>
              <button
                className={`tab-btn ${activeTab === 'typhoon' ? 'active' : ''}`}
                onClick={() => setActiveTab('typhoon')}
              >
                Typhoon Updates
              </button>
              <button
                className={`tab-btn ${activeTab === 'earthquake' ? 'active' : ''}`}
                onClick={() => setActiveTab('earthquake')}
              >
                Earthquake Updates
              </button>
              <button
                className={`tab-btn ${activeTab === 'fire' ? 'active' : ''}`}
                onClick={() => setActiveTab('fire')}
              >
                Fire Alert Updates
              </button>
            </div>

            <div className="sort-dropdown">
              <label>SORT BY:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
                <option value="newest">NEWEST</option>
                <option value="oldest">OLDEST</option>
              </select>
            </div>
          </div>

          <div className="notifications-section-header">
            <div className="notifications-section-title">
              <span className="section-icon">🔔</span>
              <h2>All Updates</h2>
            </div>
            <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
              {loading ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>

          {error && (
            <div className="notifications-error">
              <p>{error}</p>
              <button onClick={handleRefresh}>Try Again</button>
            </div>
          )}

          {loading && notifications.length === 0 && (
            <div className="notifications-loading">
              <div className="loading-spinner"></div>
              <p>Loading notifications...</p>
            </div>
          )}

          <div className="notifications-list">
            {!loading && sortedNotifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications to display</p>
              </div>
            ) : (
              sortedNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-card ${getSeverityClass(notification.severity)} ${!notification.is_read ? 'unread' : ''}`}
                >
                  <button
                    className="notification-close"
                    onClick={() => handleDismiss(notification.id)}
                    aria-label="Dismiss notification"
                  >
                    ×
                  </button>

                  <div className="notification-header">
                    <span className="notification-icon">{getTypeIcon(notification.type)}</span>
                    <span className="notification-title">{notification.title}</span>
                    <span className="notification-time">{formatTime(notification.created_at)}</span>
                  </div>

                  <div className="notification-body">
                    <p>{notification.message}</p>
                  </div>

                  <div className="notification-footer">
                    <span className={`severity-badge ${getSeverityClass(notification.severity)}`}>
                      {getSeverityLabel(notification.severity)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Notifications;