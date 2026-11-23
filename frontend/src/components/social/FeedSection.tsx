import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Newspaper } from 'lucide-react';
import CreatePostForm from './CreatePostForm';
import PostCard from './PostCard';
import { EmptyState, PageLoader } from '../ui';

/** Community feed block shared by the student and alumni dashboards. */
const FeedSection: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await axios.get('/posts/feed');
      setPosts(res.data.posts || []);
    } catch (e) {
      console.error('Error fetching posts:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Community feed</h2>
      <CreatePostForm onPostCreated={load} />
      {loading ? (
        <PageLoader label="Loading posts" />
      ) : posts.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Newspaper className="h-6 w-6" />}
            title="No posts yet"
            description="Share an update or follow people to see their posts here."
          />
        </div>
      ) : (
        posts.map((post) => <PostCard key={post._id} post={post} onDelete={(id: string) => setPosts((p) => p.filter((x) => x._id !== id))} />)
      )}
    </div>
  );
};

export default FeedSection;
