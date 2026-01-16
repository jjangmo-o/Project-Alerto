import { useEffect, useState, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/supabase';
import './AdminCommunityStatus.css';

type PostStatus = 'ACTIVE' | 'ARCHIVED' | 'DELETED';

interface CommunityPost {
  report_id: string;
  report_text: string | null;
  status_type: string | null;
  barangay_id: string | null;
  created_at: string;
  moderation_status: PostStatus;
  user_id: string;
}

interface SignedUrlCache {
  url: string;
  expiresAt: number;
}

const FILTERS: { label: string; value: PostStatus }[] = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Archived', value: 'ARCHIVED' },
  { label: 'Deleted', value: 'DELETED' },
];

const STATUS_TYPES = [
  'Safe',
  'Injured',
  'Critical',
  'Flooding',
  'Missing',
  'Fire',
  'Outbreak',
  'Trapped',
  'Power Outage',
  'Medical Assistance',
  'Rescue',
  'Animal Rescue',
];

const BARANGAY_ID_MAP: Record<string, string> = {
  'Barangka': '3fee7818-0f5f-424e-ad29-4c4a7a217a0c',
  'Calumpang': 'c8b28f65-8466-4b52-8a98-2f95bc4f45ab',
  'Concepcion I (Uno)': '11af9721-639d-4237-ac99-f226ff413329',
  'Concepcion II (Dos)': '440c0ddf-c31d-4031-95a2-813b5159f144',
  'Fortune': '7d948164-954c-43b8-9463-22a7a494b40b',
  'Industrial Valley Complex (IVC)': '736a9cdd-e8ec-4f49-a413-db138c5d06a7',
  'Jesus Dela Peña': '26ea0dd6-f2dd-4914-8f6c-196587c9413a',
  'Malanday': '4119162b-f6f6-414b-8db1-c9c4462e6380',
  'Marikina Heights': '7b32821a-285f-4c78-ac57-fd0812ca36ed',
  'Nangka': 'f668a15e-ffea-4a93-abf3-e63c8edb5ea1',
  'Parang': '299a25fe-197a-43fb-ade2-0c3cc76d91cb',
  'San Roque': '19f6fc41-38b8-4a1b-83e7-a2ceb14bdb06',
  'Santa Elena': 'f1a0f639-eae6-475c-ba71-7c6a8da52de7',
  'Santo Niño': 'ed6073e5-688f-445e-93a2-e5b913840b30',
  'Tañong': '7584c655-3867-4529-b381-518cfd61f6c0',
  'Tumana': 'f459284f-9a62-4adb-b5a2-807f833dafac',
};

const BARANGAY_NAME_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(BARANGAY_ID_MAP).map(([name, id]) => [id, name])
);

const AdminCommunityStatus = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<PostStatus>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [barangayFilter, setBarangayFilter] = useState<string>('all');
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [imagesByReport, setImagesByReport] = useState<Record<string, string[]>>({});
  const [signedUrlCache, setSignedUrlCache] = useState<Record<string, SignedUrlCache>>({});
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Get signed URL with caching
  const getSignedUrl = useCallback(async (filename: string): Promise<string> => {
    const now = Date.now();
    
    if (signedUrlCache[filename] && signedUrlCache[filename].expiresAt > now) {
      return signedUrlCache[filename].url;
    }

    const { data, error } = await supabase.storage
      .from('report-images')
      .createSignedUrl(filename, 3600);

    if (error || !data?.signedUrl) {
      console.error('Error creating signed URL:', error);
      return '';
    }

    const expiresAt = now + (59 * 60 * 1000);
    setSignedUrlCache(prev => ({
      ...prev,
      [filename]: {
        url: data.signedUrl,
        expiresAt
      }
    }));
    
    return data.signedUrl;
  }, [signedUrlCache]);

  /* =======================
     FETCH POSTS (DB)
  ======================= */
  const fetchPosts = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('disaster_reports')
      .select(`
        report_id,
        report_text,
        status_type,
        barangay_id,
        created_at,
        moderation_status,
        user_id
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch posts error:', error);
    } else {
      setPosts(data as CommunityPost[]);
      
      // Fetch images for all posts
      const reportIds = data.map(d => d.report_id);
      if (reportIds.length > 0) {
        const { data: images } = await supabase
          .from('report_images')
          .select('report_id, image_url')
          .in('report_id', reportIds);

        const map: Record<string, string[]> = {};

        for (const img of images ?? []) {
          if (img.report_id && img.image_url) {
            let filename = img.image_url;
            if (filename.includes('/')) {
              const parts = filename.split('/');
              filename = parts[parts.length - 1];
            }
            
            const signedUrl = await getSignedUrl(filename);
            if (signedUrl) {
              if (!map[img.report_id]) map[img.report_id] = [];
              map[img.report_id].push(signedUrl);
            }
          }
        }

        setImagesByReport(map);
      }
    }

    setLoading(false);
  }, [getSignedUrl]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchPosts();
    };
    fetchData();
  }, [fetchPosts]);


  const updateStatus = async (
    reportId: string,
    newStatus: PostStatus
  ) => {
    const { error } = await supabase
      .from('disaster_reports')
      .update({
        moderation_status: newStatus,
      })
      .eq('report_id', reportId);

    if (error) {
      console.error('Update status error:', error);
      alert('Failed to update status');
      return;
    }

    await fetchPosts();
  };

  /* =======================
     BULK ACTIONS
  ======================= */
  const handleBulkAction = async (action: PostStatus) => {
    if (selectedPosts.size === 0) {
      alert('Please select at least one post');
      return;
    }

    const confirmMessage = `Are you sure you want to ${action.toLowerCase()} ${selectedPosts.size} post(s)?`;
    if (!window.confirm(confirmMessage)) return;

    for (const reportId of Array.from(selectedPosts)) {
      await supabase
        .from('disaster_reports')
        .update({ moderation_status: action })
        .eq('report_id', reportId);
    }

    setSelectedPosts(new Set());
    await fetchPosts();
  };

  const togglePostSelection = (reportId: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(reportId)) {
      newSelected.delete(reportId);
    } else {
      newSelected.add(reportId);
    }
    setSelectedPosts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedPosts.size === filteredPosts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(filteredPosts.map(p => p.report_id)));
    }
  };

  /* =======================
     FILTERING & SEARCH
  ======================= */
  const filteredPosts = posts.filter((post) => {
    // Moderation status filter
    if (post.moderation_status !== activeFilter) return false;
    
    // Status type filter
    if (statusFilter !== 'all' && post.status_type !== statusFilter) return false;
    
    // Barangay filter
    if (barangayFilter !== 'all' && post.barangay_id !== barangayFilter) return false;
    
    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const text = (post.report_text || '').toLowerCase();
      const status = (post.status_type || '').toLowerCase();
      const barangay = (BARANGAY_NAME_MAP[post.barangay_id || ''] || '').toLowerCase();
      
      return text.includes(query) || status.includes(query) || barangay.includes(query);
    }
    
    return true;
  });

  /* =======================
     STATS
  ======================= */
  const stats = {
    active: posts.filter(p => p.moderation_status === 'ACTIVE').length,
    archived: posts.filter(p => p.moderation_status === 'ARCHIVED').length,
    deleted: posts.filter(p => p.moderation_status === 'DELETED').length,
  };

  return (
    <AdminLayout>
      <div className="admin-community-page">
        <div className="admin-community-header">
          <h2 className="admin-community-title">
            Community Status Moderation
          </h2>
          
          <div className="admin-stats">
            <div className="stat-card">
              <span className="stat-value">{stats.active}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.archived}</span>
              <span className="stat-label">Archived</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.deleted}</span>
              <span className="stat-label">Deleted</span>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="admin-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status Types</option>
              {STATUS_TYPES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={barangayFilter}
              onChange={(e) => setBarangayFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Barangays</option>
              {Object.entries(BARANGAY_ID_MAP).map(([name, id]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="admin-community-filters">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              className={`filter-tab ${
                activeFilter === filter.value ? 'active' : ''
              }`}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label} ({
                filter.value === 'ACTIVE' ? stats.active :
                filter.value === 'ARCHIVED' ? stats.archived :
                stats.deleted
              })
            </button>
          ))}
        </div>

        {/* BULK ACTIONS */}
        {selectedPosts.size > 0 && (
          <div className="bulk-actions-bar">
            <span className="bulk-count">
              {selectedPosts.size} post(s) selected
            </span>
            <div className="bulk-buttons">
              {activeFilter !== 'ACTIVE' && (
                <button
                  className="bulk-btn btn-restore"
                  onClick={() => handleBulkAction('ACTIVE')}
                >
                  Restore
                </button>
              )}
              {activeFilter === 'ACTIVE' && (
                <button
                  className="bulk-btn btn-archive"
                  onClick={() => handleBulkAction('ARCHIVED')}
                >
                  Archive
                </button>
              )}
              <button
                className="bulk-btn btn-delete"
                onClick={() => handleBulkAction('DELETED')}
              >
                Delete
              </button>
              <button
                className="bulk-btn btn-cancel"
                onClick={() => setSelectedPosts(new Set())}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading && (
          <p className="admin-empty">Loading community posts…</p>
        )}

        {!loading && filteredPosts.length === 0 && (
          <p className="admin-empty">
            No posts found matching your filters.
          </p>
        )}

        {/* SELECT ALL */}
        {!loading && filteredPosts.length > 0 && (
          <div className="select-all-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedPosts.size === filteredPosts.length}
                onChange={toggleSelectAll}
              />
              <span>Select All ({filteredPosts.length})</span>
            </label>
          </div>
        )}

        {/* POSTS FEED */}
        <div className="admin-community-feed">
          {filteredPosts.map((post) => (
            <div key={post.report_id} className="admin-community-card">
              {/* CHECKBOX */}
              <div className="post-checkbox">
                <input
                  type="checkbox"
                  checked={selectedPosts.has(post.report_id)}
                  onChange={() => togglePostSelection(post.report_id)}
                />
              </div>

              {/* CONTENT */}
              <div className="admin-community-content">
                <div className="post-meta">
                  <span className={`admin-tag status-${post.status_type?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {post.status_type || 'Uncategorized'}
                  </span>
                  {post.barangay_id && (
                    <span className="admin-barangay">
                      {BARANGAY_NAME_MAP[post.barangay_id] || 'Unknown'}
                    </span>
                  )}
                  <span className="post-date">
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <p className="admin-post-text">
                  {post.report_text || '—'}
                </p>

                {/* IMAGES */}
                {imagesByReport[post.report_id] && imagesByReport[post.report_id].length > 0 && (
                  <div className="post-images-admin">
                    {imagesByReport[post.report_id].slice(0, 3).map((img, idx) => (
                      <div
                        key={idx}
                        className="post-image-thumb"
                        onClick={() => setPreviewImage(img)}
                      >
                        <img src={img} alt={`Post image ${idx + 1}`} />
                      </div>
                    ))}
                    {imagesByReport[post.report_id].length > 3 && (
                      <div className="more-images">
                        +{imagesByReport[post.report_id].length - 3} more
                      </div>
                    )}
                  </div>
                )}

                {/* EXPAND/COLLAPSE */}
                {expandedPost === post.report_id && (
                  <div className="expanded-details">
                    <p><strong>Report ID:</strong> {post.report_id}</p>
                    <p><strong>User ID:</strong> {post.user_id}</p>
                    <p><strong>Created:</strong> {new Date(post.created_at).toLocaleString()}</p>
                  </div>
                )}

                <button
                  className="expand-btn"
                  onClick={() => setExpandedPost(
                    expandedPost === post.report_id ? null : post.report_id
                  )}
                >
                  {expandedPost === post.report_id ? '▲ Less' : '▼ More'}
                </button>
              </div>

              {/* ACTIONS */}
              <div className="admin-community-actions">
                {post.moderation_status !== 'ACTIVE' && (
                  <button
                    className="btn-view"
                    onClick={() => updateStatus(post.report_id, 'ACTIVE')}
                  >
                    Restore
                  </button>
                )}

                {post.moderation_status === 'ACTIVE' && (
                  <button
                    className="btn-archive"
                    onClick={() => updateStatus(post.report_id, 'ARCHIVED')}
                  >
                    Archive
                  </button>
                )}

                {post.moderation_status !== 'DELETED' && (
                  <button
                    className="btn-delete"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this post?')) {
                        updateStatus(post.report_id, 'DELETED');
                      }
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* IMAGE PREVIEW MODAL */}
        {previewImage && (
          <div className="image-preview-modal" onClick={() => setPreviewImage(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-preview" onClick={() => setPreviewImage(null)}>
                ×
              </button>
              <img src={previewImage} alt="Preview" />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCommunityStatus;