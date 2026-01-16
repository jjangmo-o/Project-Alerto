import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import closeIcon from '../assets/icon-close-button.svg';
import './Notifications.css';

import {
  BellIcon,
  CloudRainWindIcon,
  ActivityIcon,
  FireAlertIcon,
  EvacuationIcon
} from './NotificationsIcons';

type FilterType = 'all' | 'typhoon' | 'earthquake' | 'fire' | 'evacuation' | 'archive';
type SortOption = 'newest' | 'oldest';

interface Notification {
  notification_id: string;
  title: string;
  message: string;
  barangay_id: string | null;
  target_role: string;
  created_at: string;
  created_by: string | null;
  disaster_type: 'typhoon' | 'earthquake' | 'fire';
  severity: 'normal' | 'alert' | 'urgent' | 'critical';
  barangay_ids?: string[];
  is_read?: boolean;
  is_archived?: boolean;
}

const BARANGAY_MAP: Record<string, string> = {
  '3fee7818-0f5f-424e-ad29-4c4a7a217a0c': 'Barangka',
  'c8b28f65-8466-4b52-8a98-2f95bc4f45ab': 'Calumpang',
  '11af9721-639d-4237-ac99-f226ff413329': 'Concepcion I',
  '440c0ddf-c31d-4031-95a2-813b5159f144': 'Concepcion II',
  '7d948164-954c-43b8-9463-22a7a494b40b': 'Fortune',
  '736a9cdd-e8ec-4f49-a413-db138c5d06a7': 'Industrial Valley',
  '26ea0dd6-f2dd-4914-8f6c-196587c9413a': 'Jesus Dela Peña',
  '4119162b-f6f6-414b-8db1-c9c4462e6380': 'Malanday',
  '7b32821a-285f-4c78-ac57-fd0812ca36ed': 'Marikina Heights',
  'f668a15e-ffea-4a93-abf3-e63c8edb5ea1': 'Nangka',
  '299a25fe-197a-43fb-ade2-0c3cc76d91cb': 'Parang',
  '19f6fc41-38b8-4a1b-83e7-a2ceb14bdb06': 'San Roque',
  'f1a0f639-eae6-475c-ba71-7c6a8da52de7': 'Santa Elena',
  'ed6073e5-688f-445e-93a2-e5b913840b30': 'Santo Niño',
  '7584c655-3867-4529-b381-518cfd61f6c0': 'Tañong',
  'f459284f-9a62-4adb-b5a2-807f833dafac': 'Tumana',
}

const Notifications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [archivedNotifications, setArchivedNotifications] = useState<Notification[]>([]);
  const [focusedNotification, setFocusedNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('target_role', 'USER')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        setError('Failed to load notifications. Please try again.');
      } else {
        const safeNotifications = (data || []).map((n) => ({
          ...(n as Notification),
          created_at: typeof n.created_at === 'string' && n.created_at !== null ? n.created_at : '',
        }));

        // Filter archived notifications if user is logged in
        if (currentUserId) {
          const { data: userNotifs } = await supabase
            .from('user_notifications')
            .select('notification_id, is_archived')
            .eq('user_id', currentUserId);

          const archivedIds = new Set(
            (userNotifs || [])
              .filter(un => un.is_archived)
              .map(un => un.notification_id)
          );

          const active = safeNotifications.filter(n => !archivedIds.has(n.notification_id));
          const archived = safeNotifications.filter(n => archivedIds.has(n.notification_id));

          setNotifications(active);
          setArchivedNotifications(archived);
        } else {
          setNotifications(safeNotifications);
        }

        // check alert query param to auto open a specific notification
        const alertId = searchParams.get('alert');
        if (alertId && safeNotifications.length > 0) {
          const targetAlert = safeNotifications.find((n: Notification) => n.notification_id === alertId);
          if (targetAlert) {
            setFocusedNotification(targetAlert);
            // clear query param after opening
            setSearchParams({});
          }
        }
      }

      setLoading(false);
    };

    fetchNotifications();
  }, [searchParams, setSearchParams, currentUserId]);

  const isEvacuationNotification = (title: string) => {
    return title && title.toLowerCase().includes('evacuation center');
  };

  // Get evacuation center status from notification title or message
  const getEvacuationStatus = (notification: Notification): string | null => {
    if (!isEvacuationNotification(notification.title)) return null;
    
    const text = (notification.title + ' ' + notification.message).toLowerCase();
    
    if (text.includes('full') && !text.includes('near-full') && !text.includes('half-full')) {
      return 'full';
    }
    if (text.includes('near-full') || text.includes('near full') || text.includes('nearly full')) {
      return 'near-full';
    }
    if (text.includes('half-full') || text.includes('half full')) {
      return 'half-full';
    }
    if (text.includes('open') || text.includes('available')) {
      return 'open';
    }
    if (text.includes('closed')) {
      return 'closed';
    }
    
    return null;
  };

  // Get CSS class for evacuation status
  const getEvacuationStatusClass = (notification: Notification): string => {
    const status = getEvacuationStatus(notification);
    if (!status) return 'evacuation-type';
    return `evacuation-type evac-status-${status}`;
  };

  // Get label for evacuation status
  const getEvacuationStatusLabel = (notification: Notification): string => {
    const status = getEvacuationStatus(notification);
    switch (status) {
      case 'full': return 'FULL';
      case 'near-full': return 'NEAR-FULL';
      case 'half-full': return 'HALF-FULL';
      case 'open': return 'OPEN';
      case 'closed': return 'CLOSED';
      default: return 'STATUS';
    }
  };

  const filteredNotifications =
    activeTab === 'all'
    ? notifications
    : activeTab === 'evacuation'
    ? notifications.filter(n => isEvacuationNotification(n.title))
    : activeTab === 'archive'
    ? archivedNotifications
    : notifications.filter(n => n.disaster_type === activeTab && !isEvacuationNotification(n.title));

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'critical': return 'severity-critical';
      case 'urgent': return 'severity-urgent';
      case 'alert': return 'severity-alert';
      case 'normal': return 'severity-normal';
      default: return '';
    }
  };

  const getSeverityLabel = (severity: string, title?: string) => {
    if (title && title.toLowerCase().includes('evacuation center')) {
      return 'STATUS';
    }
    switch (severity) {
        case 'critical': return 'CRITICAL';
        case 'urgent': return 'URGENT';
        case 'alert': return 'ALERT';
        case 'normal': return 'NORMAL';
        default: return '';
    }
  };
  
  const getTypeIcon = (type: string, title?: string) => {
    if (title && isEvacuationNotification(title)) {
      return <EvacuationIcon />;
    }
    switch (type) {
      case 'typhoon':
        return <CloudRainWindIcon />;
      case 'earthquake':
        return <ActivityIcon />;
      case 'fire':
        return <FireAlertIcon />;
      case 'evacuation':
        return <EvacuationIcon />;
      default:
        return <BellIcon />;
    }
  };

  const getTabIcon = (tab: FilterType) => {
    switch (tab) {
      case 'typhoon':
        return <CloudRainWindIcon size={20} />;
      case 'earthquake':
        return <ActivityIcon size={20} />;
      case 'fire':
        return <FireAlertIcon size={20} />;
      case 'evacuation':
        return <EvacuationIcon size={20} />
      case 'all':
      default:
        return <BellIcon size={20} />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString).getTime();
    const now = new Date().getTime();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return new Date(date).toLocaleDateString('en-PH', {
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

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('target_role', 'USER')
      .order('created_at', { ascending: false });

    if (error) {
      setError('Failed to refresh notifications.');
    } else {
      const allNotifs = (data as Notification[]) || [];
      
      if (currentUserId) {
        const { data: userNotifs } = await supabase
          .from('user_notifications')
          .select('notification_id, is_archived')
          .eq('user_id', currentUserId);

        const archivedIds = new Set(
          (userNotifs || [])
            .filter(un => un.is_archived)
            .map(un => un.notification_id)
        );

        const active = allNotifs.filter(n => !archivedIds.has(n.notification_id));
        const archived = allNotifs.filter(n => archivedIds.has(n.notification_id));

        setNotifications(active);
        setArchivedNotifications(archived);
      } else {
        setNotifications(allNotifs);
      }
    }

    setLoading(false);
  };

  // Archive/Unarchive handler
  const handleArchiveToggle = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!currentUserId) return;

    const isArchiving = activeTab !== 'archive';

    try {
      // Check if user_notification record exists
      const { data: existing } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('notification_id', notificationId)
        .eq('user_id', currentUserId)
        .single();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('user_notifications')
          .update({ 
            is_archived: isArchiving,
            archived_at: isArchiving ? new Date().toISOString() : null
          })
          .eq('notification_id', notificationId)
          .eq('user_id', currentUserId);

        if (error) {
          console.error('Error updating notification:', error);
          return;
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from('user_notifications')
          .insert({
            notification_id: notificationId,
            user_id: currentUserId,
            is_read: false,
            is_archived: isArchiving,
            archived_at: isArchiving ? new Date().toISOString() : null
          });

        if (error) {
          console.error('Error creating notification record:', error);
          return;
        }
      }

      // Update local state
      if (isArchiving) {
        const notif = notifications.find(n => n.notification_id === notificationId);
        if (notif) {
          setNotifications(prev => prev.filter(n => n.notification_id !== notificationId));
          setArchivedNotifications(prev => [notif, ...prev]);
        }
      } else {
        const notif = archivedNotifications.find(n => n.notification_id === notificationId);
        if (notif) {
          setArchivedNotifications(prev => prev.filter(n => n.notification_id !== notificationId));
          setNotifications(prev => [notif, ...prev]);
        }
      }

      // Close spotlight if needed
      if (focusedNotification?.notification_id === notificationId) {
        setFocusedNotification(null);
      }
    } catch (err) {
      console.error('Failed to toggle archive:', err);
    }
  };

  const tabTitles: Record<FilterType, string> = {
    all: 'All Updates',
    typhoon: 'Typhoon Updates',
    earthquake: 'Earthquake Alerts',
    fire: 'Fire Alert Updates',
    evacuation: 'Evacuation Updates',
    archive: 'Archived Notifications',
  };

  return (
    <div className="notifications-content">
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
  
              <button
                className={`tab-btn ${activeTab === 'evacuation' ? 'active' : ''}`}
                onClick={() => setActiveTab('evacuation')}
              >
                Evacuation Updates
              </button>
  
              <button
                className={`tab-btn ${activeTab === 'archive' ? 'active' : ''}`}
                onClick={() => setActiveTab('archive')}
              >
                Archived
              </button>
            </div>
          </div>

          <div className="notifications-section-header">
            <div className="notifications-section-title">
              <span className="section-icon">{getTabIcon(activeTab)}</span>
              <h2>{tabTitles[activeTab]}</h2>
            </div>

            <div className="notifications-actions">
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

              <button
                className={`refresh-btn ${loading ? 'loading' : ''}`}
                onClick={handleRefresh}
                disabled={loading}
                aria-label="Refresh notifications"
              >
                <span className="refresh-icon" aria-hidden>↻</span>
                <span className="refresh-text">Refresh</span>
              </button>
            </div>
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
                  key={notification.notification_id}
                  className={`notification-card ${getSeverityClass(notification.severity)} ${isEvacuationNotification(notification.title) ? getEvacuationStatusClass(notification) : ''} ${!notification.is_read ? 'unread' : ''}`}
                  onClick={() => setFocusedNotification(notification)}
                  role="button"
                  tabIndex={0}
                >
                  <button
                    className="notification-close"
                    onClick={(e) => handleArchiveToggle(notification.notification_id, e)}
                    aria-label={activeTab === 'archive' ? 'Restore notification' : 'Archive notification'}
                    title={activeTab === 'archive' ? 'Restore notification' : 'Archive notification'}
                  >
                    <img src={closeIcon} alt={activeTab === 'archive' ? 'Restore' : 'Archive'} />
                  </button>

                  <div className="notification-header">
                    <span className="notification-icon">{getTypeIcon(notification.disaster_type, notification.title)}</span>
                    <span className="notification-title">{notification.title}</span>
                    <span className="notification-time">{formatTime(notification.created_at)}</span>
                  </div>

                  <div className="notification-body">
                    <p className="message-text">
                      {truncateText(notification.message)}
                      {notification.message.length > 160 && (
                        <span className="see-more"> See more</span>
                      )}
                    </p>
                  </div>

                  {Array.isArray(notification.barangay_ids) &&
                    notification.barangay_ids.length > 0 && (
                      <div className="notification-barangays">
                        {notification.barangay_ids.map((id: string) => (
                          <span key={id} className="barangay-badge">
                            {BARANGAY_MAP[id] || 'Unknown Barangay'}
                          </span>
                        ))}
                      </div>
                  )}

                  <div className="notification-footer">
                    <span className={`severity-badge ${getSeverityClass(notification.severity)} ${isEvacuationNotification(notification.title) ? `evacuation-badge evac-badge-${getEvacuationStatus(notification) || 'default'}` : ''}`}>
                      {isEvacuationNotification(notification.title) ? getEvacuationStatusLabel(notification) : getSeverityLabel(notification.severity, notification.title)}
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
                className={`notification-spotlight ${getSeverityClass(focusedNotification.severity)} ${isEvacuationNotification(focusedNotification.title) ? getEvacuationStatusClass(focusedNotification) : ''}`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="spotlight-close"
                  onClick={(e) => handleArchiveToggle(focusedNotification.notification_id, e)}
                  aria-label={activeTab === 'archive' ? 'Restore notification' : 'Archive notification'}
                  title={activeTab === 'archive' ? 'Restore notification' : 'Archive notification'}
                >
                  <img src={closeIcon} alt={activeTab === 'archive' ? 'Restore' : 'Archive'} />
                </button>

                <div className="notification-header">
                  <span className="notification-icon">
                    {getTypeIcon(focusedNotification.disaster_type, focusedNotification.title)}
                  </span>
                  <span className="notification-title">
                    {focusedNotification.title}
                  </span>
                  <span className="notification-time">
                    {formatTime(focusedNotification.created_at)}
                  </span>
                </div>

                <div className="notification-body expanded">
                  <p className="message-text">{focusedNotification.message}</p>
                </div>

                {Array.isArray(focusedNotification.barangay_ids) &&
                  focusedNotification.barangay_ids.length > 0 && (
                    <div className="notification-barangays">
                      {focusedNotification.barangay_ids.map((id: string) => (
                        <span key={id} className="barangay-badge">
                          {BARANGAY_MAP[id] || 'Unknown Barangay'}
                        </span>
                      ))}
                    </div>
                )}

                <div className="notification-footer">
                  <span className={`severity-badge ${getSeverityClass(focusedNotification.severity)} ${isEvacuationNotification(focusedNotification.title) ? `evacuation-badge evac-badge-${getEvacuationStatus(focusedNotification) || 'default'}` : ''}`}>
                    {isEvacuationNotification(focusedNotification.title) ? getEvacuationStatusLabel(focusedNotification) : getSeverityLabel(focusedNotification.severity, focusedNotification.title)}
                  </span>
                </div>
              </div>
            </div>
          )}

    </div>
  );
};

export default Notifications;