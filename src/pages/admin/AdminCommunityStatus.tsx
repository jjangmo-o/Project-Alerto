import { useEffect, useState } from 'react';
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
}

const FILTERS: { label: string; value: PostStatus }[] = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Archived', value: 'ARCHIVED' },
  { label: 'Deleted', value: 'DELETED' },
];

const AdminCommunityStatus = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<PostStatus>('ACTIVE');

  /* =======================
     FETCH POSTS (DB)
  ======================= */
  const fetchPosts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('disaster_reports')
      .select(`
        report_id,
        report_text,
        status_type,
        barangay_id,
        created_at,
        moderation_status
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch posts error:', error);
    } else {
      setPosts(data as CommunityPost[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await fetchPosts();
    })();
  }, []);

  /* =======================
     UPDATE STATUS (ADMIN)
  ======================= */
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
      return;
    }

    // 🔑 IMPORTANT: refresh + switch tab
    await fetchPosts();
    setActiveFilter(newStatus);
  };

  const filteredPosts = posts.filter(
    (post) => post.moderation_status === activeFilter
  );

  return (
    <AdminLayout>
      <div className="admin-community-page">

        <h2 className="admin-community-title">
          Community Status Moderation
        </h2>

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
              {filter.label}
            </button>
          ))}
        </div>

        {loading && (
          <p className="admin-empty">Loading community posts…</p>
        )}

        {!loading && filteredPosts.length === 0 && (
          <p className="admin-empty">
            No {activeFilter.toLowerCase()} posts.
          </p>
        )}

        <div className="admin-community-feed">
          {filteredPosts.map((post) => (
            <div key={post.report_id} className="admin-community-card">

              {/* CONTENT */}
              <div className="admin-community-content">
                <span className="admin-tag">
                  {post.status_type || 'Uncategorized'}
                </span>
                <p className="admin-post-text">
                  {post.report_text || '—'}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="admin-community-actions">

                {post.moderation_status !== 'ACTIVE' && (
                  <button
                    className="btn-view"
                    onClick={() =>
                      updateStatus(post.report_id, 'ACTIVE')
                    }
                  >
                    View
                  </button>
                )}

                {post.moderation_status === 'ACTIVE' && (
                  <button
                    className="btn-archive"
                    onClick={() =>
                      updateStatus(post.report_id, 'ARCHIVED')
                    }
                  >
                    Archive
                  </button>
                )}

                {post.moderation_status !== 'DELETED' && (
                  <button
                    className="btn-delete"
                    onClick={() =>
                      updateStatus(post.report_id, 'DELETED')
                    }
                  >
                    Delete
                  </button>
                )}

              </div>
            </div>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminCommunityStatus;
