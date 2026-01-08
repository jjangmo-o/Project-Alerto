import { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';
import { notificationService, type Notification, type NotificationType, type SeverityLevel } from '../services/notificationService';
import closeIcon from '../assets/icon-close-button.svg';
import './Notifications.css';


type FilterType = 'all' | 'typhoon' | 'earthquake' | 'fire';
type SortOption = 'newest' | 'oldest';

const Notifications = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [focusedNotification, setFocusedNotification] = useState<Notification | null>(null);
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
        case 'normal': return 'ALERT';
        default: return '';
    }
    };


  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'typhoon': return '🌀';
      case 'earthquake': return '🌍';
      case 'fire': return '🔥';
      default: return '⚠️';
    }
  };

  const getTabIcon = (tab: FilterType) => {
  switch (tab) {
    case 'typhoon': return '🌀';
    case 'earthquake': return '🌍';
    case 'fire': return '🔥';
    case 'all':
    default:
      return '🔔';
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

  const truncateText = (text: string, limit = 160) => {
    if (text.length <= limit) return text;
    return text.slice(0, limit) + '…';
  };

  useEffect(() => {
    if (focusedNotification) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [focusedNotification]);


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

  const tabTitles: Record<FilterType, string> = {
    all: 'All Updates',
    typhoon: 'Typhoon Updates',
    earthquake: 'Earthquake Alerts',
    fire: 'Fire Alert Updates',
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
              <span className="sort-label">SORT BY</span>

              <div className="sort-select-wrapper">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="sort-select"
                >
                  <option value="newest">NEWEST</option>
                  <option value="oldest">OLDEST</option>
                </select>
                <span className="sort-arrow">▾</span>
              </div>
            </div>

          </div>

          <div className="notifications-section-header">
            <div className="notifications-section-title">
              <span className="section-icon">{getTabIcon(activeTab)}</span>
              <h2>{tabTitles[activeTab]}</h2>
            </div>
            <button
              className={`refresh-btn ${loading ? 'loading' : ''}`}
              onClick={handleRefresh}
              disabled={loading}
              aria-label="Refresh notifications"
            >
              <span className="refresh-icon" aria-hidden>
                ↻
              </span>
              <span className="refresh-text">
                Refresh
              </span>
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

          <div
            key={`${activeTab}-${sortBy}`}
            className="notifications-list animated-tab"
          >
            {!loading && sortedNotifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications to display</p>
              </div>
            ) : (
              sortedNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-card ${getSeverityClass(notification.severity)} ${!notification.is_read ? 'unread' : ''}`}
                  onClick={() => setFocusedNotification(notification)}
                  role="button"
                  tabIndex={0}
                >
                  <button
                    className="notification-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismiss(notification.id);
                    }}
                    aria-label="Dismiss notification"
                  >
                    <img src={closeIcon} alt="Close notification" />
                  </button>

                  <div className="notification-header">
                    <span className="notification-icon">{getTypeIcon(notification.type)}</span>
                    <span className="notification-title">{notification.title}</span>
                    <span className="notification-time">{formatTime(notification.created_at)}</span>
                  </div>

                  <div className="notification-body">
                    <p>
                      {truncateText(notification.message)}
                      {notification.message.length > 160 && (
                        <span className="see-more"> See more</span>
                      )}
                    </p>
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

          {focusedNotification && (
            <div
              className="notification-overlay"
              onClick={() => setFocusedNotification(null)}
            >
              <div
                className={`notification-spotlight ${getSeverityClass(focusedNotification.severity)}`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="spotlight-close"
                  onClick={() => setFocusedNotification(null)}
                >
                  <img src={closeIcon} alt="" />
                </button>

                <div className="notification-header">
                  <span className="notification-icon">
                    {getTypeIcon(focusedNotification.type)}
                  </span>
                  <span className="notification-title">
                    {focusedNotification.title}
                  </span>
                  <span className="notification-time">
                    {formatTime(focusedNotification.created_at)}
                  </span>
                </div>

                <div className="notification-body expanded">
                  <p>{focusedNotification.message}</p>
                </div>

                <div className="notification-footer">
                  <span className={`severity-badge ${getSeverityClass(focusedNotification.severity)}`}>
                    {getSeverityLabel(focusedNotification.severity)}
                  </span>
                </div>
              </div>
            </div>
          )}

        </section>
      </main>
    </div>
  );
};

export default Notifications;