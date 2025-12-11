import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { Plus, Image as ImageIcon, Video, Send, Loader } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import WallPostCard from '../../components/wall-feed/WallPostCard';
import CreatePostModal from '../../components/wall-feed/CreatePostModal';
import apiService from '../../lib/api';
import { toast } from 'react-hot-toast';

export default function WallFeed() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (user?.usertype !== 'agent') {
      router.push('/');
      return;
    }
    loadPosts();
  }, [user]);

  const loadPosts = async (page = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await apiService.getWallFeed(page);
      
      if (page === 1) {
        setPosts(response.data);
      } else {
        setPosts(prev => [...prev, ...response.data]);
      }

      setCurrentPage(response.current_page);
      setHasMore(response.current_page < response.last_page);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreateModal(false);
    toast.success('Post created successfully!');
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    toast.success('Post deleted');
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadPosts(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2">
          <Loader className="w-6 h-6 animate-spin text-primary-600" />
          <span className="text-secondary-600">Loading wall feed...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Wall Feed - Agent Portal</title>
      </Head>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Wall Feed</h1>
            <p className="text-secondary-600 mt-1">
              Connect with agents from other companies
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>

        {/* Create Post Quick Card */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowCreateModal(true)}>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="bg-secondary-100 rounded-full px-4 py-2 text-secondary-600">
                What's on your mind, {user?.name?.split(' ')[0]}?
              </div>
            </div>
          </div>
          <div className="flex items-center justify-around mt-4 pt-4 border-t border-secondary-200">
            <button className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600 transition-colors">
              <ImageIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Photo</span>
            </button>
            <button className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600 transition-colors">
              <Video className="w-5 h-5" />
              <span className="text-sm font-medium">Video</span>
            </button>
          </div>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-secondary-400 mb-4">
                <Send className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                No posts yet
              </h3>
              <p className="text-secondary-600 mb-4">
                Be the first to share something with the community!
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                Create First Post
              </Button>
            </Card>
          ) : (
            <>
              {posts.map(post => (
                <WallPostCard
                  key={post.id}
                  post={post}
                  currentUser={user}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                />
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center py-4">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Posts'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
          currentUser={user}
        />
      )}
    </>
  );
}
