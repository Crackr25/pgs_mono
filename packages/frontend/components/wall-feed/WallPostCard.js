import { useState, useEffect } from 'react';
import { Heart, MessageCircle, MoreVertical, Trash2, Edit2, Send, Mail, Eye } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import AgentFloatingChat from './AgentFloatingChat';
import apiService from '../../lib/api';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function WallPostCard({ post, currentUser, onPostDeleted, onPostUpdated }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked_by_me);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [replies, setReplies] = useState(post.replies || []);
  const [repliesCount, setRepliesCount] = useState(post.replies_count);
  const [showFloatingChat, setShowFloatingChat] = useState(false);

  const isMyPost = post.user.id === currentUser.id;

  const handleDirectMessage = () => {
    setShowFloatingChat(true);
  };

  // Track view when component mounts
  useEffect(() => {
    const trackView = async () => {
      try {
        await apiService.trackPostView(post.id);
      } catch (error) {
        // Silently fail
      }
    };
    trackView();
  }, [post.id]);

  const handleLike = async () => {
    try {
      const response = await apiService.toggleWallPostLike(post.id);
      setIsLiked(response.liked);
      setLikesCount(response.likes_count);
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await apiService.deleteWallPost(post.id);
      onPostDeleted(post.id);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSubmittingReply(true);
      const formData = new FormData();
      formData.append('content', replyText);

      const response = await apiService.addWallPostReply(post.id, formData);
      setReplies(prev => [...prev, response.reply]);
      setRepliesCount(prev => prev + 1);
      setReplyText('');
      setShowReplies(true);
      toast.success('Reply added');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleReplyDeleted = (replyId) => {
    setReplies(prev => prev.filter(r => r.id !== replyId));
    setRepliesCount(prev => prev - 1);
  };

  return (
    <>
    <Card>
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {post.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-secondary-900">{post.user.name}</p>
            <div className="flex items-center space-x-2 text-xs text-secondary-500">
              <span>{post.company.name}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        {isMyPost && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-secondary-100 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-secondary-600" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-20">
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Post
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-secondary-900 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {post.images.map((image, index) => (
            <img
              key={index}
              src={image.url}
              alt={image.name}
              className="rounded-lg w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(image.url, '_blank')}
            />
          ))}
        </div>
      )}

      {/* Post Videos */}
      {post.videos && post.videos.length > 0 && (
        <div className="mb-4 space-y-2">
          {post.videos.map((video, index) => (
            <video
              key={index}
              src={video.url}
              controls
              className="rounded-lg w-full"
            />
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-secondary-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 transition-colors ${
              isLiked ? 'text-red-600' : 'text-secondary-600 hover:text-red-600'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{likesCount}</span>
          </button>
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center space-x-1 text-secondary-600 hover:text-primary-600 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{repliesCount}</span>
          </button>
          {!isMyPost && (
            <button
              onClick={handleDirectMessage}
              className="flex items-center space-x-1 text-secondary-600 hover:text-blue-600 transition-colors"
              title="Send direct message"
            >
              <Mail className="w-5 h-5" />
              <span className="text-sm font-medium">Message</span>
            </button>
          )}
        </div>
        <div className="flex items-center space-x-1 text-secondary-500">
          <Eye className="w-4 h-4" />
          <span className="text-sm">{post.views_count || 0}</span>
        </div>
      </div>

      {/* Reply Form */}
      {showReplies && (
        <div className="mt-4 pt-4 border-t border-secondary-200">
          <form onSubmit={handleSubmitReply} className="flex items-start space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-blue-600">
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-4 py-2 border border-secondary-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={submittingReply}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!replyText.trim() || submittingReply}
                className="rounded-full"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Replies List */}
          <div className="space-y-3">
            {replies.map(reply => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                postId={post.id}
                currentUser={currentUser}
                onReplyDeleted={handleReplyDeleted}
              />
            ))}
          </div>
        </div>
      )}
    </Card>

    {/* Floating Chat Modal - Outside Card for proper positioning */}
    {showFloatingChat && (
      <AgentFloatingChat
        isOpen={showFloatingChat}
        onClose={() => setShowFloatingChat(false)}
        recipientAgent={post.user}
      />
    )}
    </>
  );
}

function ReplyCard({ reply, postId, currentUser, onReplyDeleted }) {
  const [isLiked, setIsLiked] = useState(reply.is_liked_by_me);
  const [likesCount, setLikesCount] = useState(reply.likes_count);
  const [showMenu, setShowMenu] = useState(false);
  const [showFloatingChat, setShowFloatingChat] = useState(false);

  const isMyReply = reply.user.id === currentUser.id;

  const handleDirectMessage = () => {
    setShowFloatingChat(true);
  };

  const handleLike = async () => {
    try {
      const response = await apiService.toggleWallReplyLike(postId, reply.id);
      setIsLiked(response.liked);
      setLikesCount(response.likes_count);
    } catch (error) {
      console.error('Error liking reply:', error);
      toast.error('Failed to like reply');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this reply?')) return;

    try {
      await apiService.deleteWallPostReply(postId, reply.id);
      onReplyDeleted(reply.id);
      toast.success('Reply deleted');
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Failed to delete reply');
    }
  };

  return (
    <>
    <div className="flex items-start space-x-2">
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-medium text-blue-600">
          {reply.user.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1">
        <div className="bg-secondary-100 rounded-2xl px-4 py-2">
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium text-sm text-secondary-900">{reply.user.name}</p>
            {isMyReply && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-0.5 hover:bg-secondary-200 rounded-full"
                >
                  <MoreVertical className="w-3 h-3 text-secondary-600" />
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-20">
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3 mr-1.5" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-secondary-700">{reply.content}</p>
        </div>
        <div className="flex items-center space-x-3 mt-1 px-2">
          <button
            onClick={handleLike}
            className={`text-xs font-medium ${
              isLiked ? 'text-red-600' : 'text-secondary-600 hover:text-red-600'
            }`}
          >
            {isLiked ? 'Liked' : 'Like'} {likesCount > 0 && `(${likesCount})`}
          </button>
          {!isMyReply && (
            <button
              onClick={handleDirectMessage}
              className="flex items-center space-x-1 text-xs font-medium text-secondary-600 hover:text-blue-600 transition-colors"
              title="Send direct message"
            >
              <Mail className="w-3 h-3" />
              <span>Message</span>
            </button>
          )}
          <span className="text-xs text-secondary-500">
            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>

    {/* Floating Chat Modal for Reply */}
    {showFloatingChat && (
      <AgentFloatingChat
        isOpen={showFloatingChat}
        onClose={() => setShowFloatingChat(false)}
        recipientAgent={reply.user}
      />
    )}
    </>
  );
}
