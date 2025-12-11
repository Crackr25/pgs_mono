# POS Platform Wall Feed - Implementation Guide

## Overview
A Facebook-like social wall feed exclusively for company agents to communicate across different companies. Includes public posts, replies, likes, and private agent-to-agent messaging with multimedia support.

## Features Implemented

### 1. Wall Feed (Public Timeline)
- ✅ Only company agents can create posts
- ✅ Posts support:
  - Text content (up to 5000 characters)
  - Multiple images (up to 4 images, 10MB each)
  - Multiple videos (up to 2 videos, 50MB each)
- ✅ All agents from all companies can view the feed
- ✅ Real-time like/unlike functionality
- ✅ Post editing and deletion (by creator only)
- ✅ Pagination support

### 2. Public Replies
- ✅ Agents can reply publicly under posts
- ✅ Replies support text, images, and videos
- ✅ Like/unlike replies
- ✅ Delete replies (by creator only)
- ✅ Real-time reply count updates

### 3. Agent-to-Agent Messaging System
- ✅ Private conversations between agents from different companies
- ✅ Message types supported:
  - Text messages
  - Images
  - Videos
  - File attachments (up to 20MB)
- ✅ Unread message tracking
- ✅ Conversation list with last message preview
- ✅ Mark messages as read
- ✅ Search for agents to start conversations

### 4. Permissions & Access Control
- ✅ **Agents Only**: Only users with `usertype = 'agent'` can access
- ✅ Buyers, sellers, and factories are blocked from accessing the feed
- ✅ Agents can only edit/delete their own posts and replies
- ✅ All agents can view all posts regardless of company

## Database Schema

### Tables Created

#### 1. `wall_posts`
```sql
- id (primary key)
- user_id (foreign key to users)
- company_id (foreign key to companies)
- content (text)
- images (json array)
- videos (json array)
- post_type (text/image/video/mixed)
- likes_count (integer)
- replies_count (integer)
- is_pinned (boolean)
- is_active (boolean)
- timestamps
- soft deletes
```

#### 2. `post_replies`
```sql
- id (primary key)
- wall_post_id (foreign key to wall_posts)
- user_id (foreign key to users)
- company_id (foreign key to companies)
- content (text)
- images (json array)
- videos (json array)
- likes_count (integer)
- is_active (boolean)
- timestamps
- soft deletes
```

#### 3. `post_likes`
```sql
- id (primary key)
- user_id (foreign key to users)
- likeable_id (polymorphic)
- likeable_type (polymorphic - WallPost or PostReply)
- timestamps
- unique constraint on (user_id, likeable_id, likeable_type)
```

#### 4. `agent_conversations`
```sql
- id (primary key)
- agent1_id (foreign key to users)
- agent2_id (foreign key to users)
- company1_id (foreign key to companies)
- company2_id (foreign key to companies)
- last_message_at (timestamp)
- agent1_unread_count (integer)
- agent2_unread_count (integer)
- timestamps
- unique constraint on (agent1_id, agent2_id)
```

#### 5. `agent_messages`
```sql
- id (primary key)
- agent_conversation_id (foreign key to agent_conversations)
- sender_id (foreign key to users)
- receiver_id (foreign key to users)
- message (text)
- message_type (text/image/video/file)
- attachments (json array)
- read (boolean)
- read_at (timestamp)
- timestamps
- soft deletes
```

## Backend Implementation

### Models Created
1. **WallPost.php** - Wall feed posts with relationships and helper methods
2. **PostReply.php** - Public replies to posts
3. **PostLike.php** - Polymorphic likes for posts and replies
4. **AgentConversation.php** - Private conversations between agents
5. **AgentMessage.php** - Messages within agent conversations

### Controllers Created

#### 1. WallFeedController.php
**Endpoints:**
- `GET /wall-feed` - Get paginated wall feed
- `POST /wall-feed` - Create new post
- `GET /wall-feed/{post}` - Get specific post with all replies
- `PUT /wall-feed/{post}` - Update post (creator only)
- `DELETE /wall-feed/{post}` - Delete post (creator only)
- `POST /wall-feed/{post}/like` - Toggle like on post
- `POST /wall-feed/{post}/replies` - Add public reply
- `DELETE /wall-feed/{post}/replies/{reply}` - Delete reply (creator only)
- `POST /wall-feed/{post}/replies/{reply}/like` - Toggle like on reply

**Features:**
- Agent-only access control
- File upload handling (images/videos)
- Automatic post type detection
- Like/unlike toggle logic
- Reply count management

#### 2. AgentMessagingController.php
**Endpoints:**
- `GET /agent-messaging/conversations` - Get all conversations for agent
- `GET /agent-messaging/conversations/{conversation}/messages` - Get messages
- `POST /agent-messaging/messages` - Send message to another agent
- `POST /agent-messaging/conversations/{conversation}/mark-read` - Mark as read
- `GET /agent-messaging/agents` - Get list of all agents
- `POST /agent-messaging/conversations/start` - Start new conversation
- `DELETE /agent-messaging/messages/{message}` - Delete message (sender only)

**Features:**
- Agent-to-agent verification
- Automatic conversation creation
- Unread count tracking
- File attachment handling
- Search agents by name/email

### API Routes
All routes are protected by `auth:sanctum` middleware and include agent-only access control within controllers.

## Frontend Implementation

### Pages Created

#### 1. `/agent/wall-feed` (pages/agent/wall-feed.js)
Main wall feed page with:
- Create post button
- Quick create post card
- Infinite scroll pagination
- Real-time post updates
- Empty state handling

### Components Created

#### 1. WallPostCard.js (components/wall-feed/)
**Features:**
- Display post with user info and company
- Show images/videos
- Like/unlike functionality
- Reply form and list
- Edit/delete menu (for post creator)
- Time ago formatting
- Nested reply cards with likes

#### 2. CreatePostModal.js (components/wall-feed/)
**Features:**
- Text content input
- Image upload (up to 4)
- Video upload (up to 2)
- File preview with remove option
- Form validation
- Loading states

### Updated Components

#### AgentSideBar.js
Added "Wall Feed" navigation item with Users icon

### API Service Updates (lib/api.js)

**Wall Feed Methods:**
- `getWallFeed(page, perPage, pinned)`
- `createWallPost(formData)`
- `getWallPost(postId)`
- `updateWallPost(postId, content)`
- `deleteWallPost(postId)`
- `toggleWallPostLike(postId)`
- `addWallPostReply(postId, formData)`
- `deleteWallPostReply(postId, replyId)`
- `toggleWallReplyLike(postId, replyId)`

**Agent Messaging Methods:**
- `getAgentConversations(page, perPage)`
- `getAgentMessages(conversationId, page, perPage)`
- `sendAgentMessage(formData)`
- `markAgentConversationRead(conversationId)`
- `getAgentsList(search, page, perPage)`
- `startAgentConversation(agentId)`
- `deleteAgentMessage(messageId)`

## Installation & Setup

### 1. Run Database Migrations
```bash
cd packages/backend
php artisan migrate
```

This will create all 5 tables:
- wall_posts
- post_replies
- post_likes
- agent_conversations
- agent_messages

### 2. Storage Setup
Ensure storage is linked for file uploads:
```bash
php artisan storage:link
```

### 3. File Upload Directories
The following directories will be auto-created:
- `storage/app/public/wall-posts/images/`
- `storage/app/public/wall-posts/videos/`
- `storage/app/public/wall-posts/replies/images/`
- `storage/app/public/wall-posts/replies/videos/`
- `storage/app/public/agent-messages/images/`
- `storage/app/public/agent-messages/videos/`
- `storage/app/public/agent-messages/files/`

### 4. Frontend Dependencies
No additional dependencies needed. Uses existing:
- `react-hot-toast` for notifications
- `date-fns` for date formatting
- `lucide-react` for icons

## Usage Guide

### For Agents

#### Accessing Wall Feed
1. Login as an agent
2. Navigate to "Wall Feed" from sidebar
3. View posts from all agents across all companies

#### Creating a Post
1. Click "Create Post" button or quick create card
2. Enter text content (optional)
3. Add images (up to 4) or videos (up to 2)
4. Click "Post"

#### Interacting with Posts
- **Like**: Click heart icon
- **Reply**: Click comment icon, type reply, press send
- **Edit**: Click menu (⋮) on your own posts
- **Delete**: Click menu (⋮) on your own posts

#### Private Messaging (Future Implementation)
- Click "Send PM" on any post to message the creator directly
- Access agent messaging from navigation

### For Administrators

#### Monitoring
- All posts are stored with company and user information
- Soft deletes allow recovery if needed
- Access logs track all interactions

#### Moderation (Future Enhancement)
- Add admin endpoints to hide/delete inappropriate posts
- Implement reporting system
- Add content filtering

## Security Features

1. **Agent-Only Access**: All endpoints verify `usertype === 'agent'`
2. **Ownership Verification**: Users can only edit/delete their own content
3. **File Validation**: 
   - Images: max 10MB, image/* mime types
   - Videos: max 50MB, video/* mime types
   - Files: max 20MB
4. **SQL Injection Protection**: Laravel Eloquent ORM
5. **XSS Protection**: Laravel sanitization
6. **CSRF Protection**: Sanctum tokens

## File Size Limits

- **Post Images**: 10MB per image, max 4 images
- **Post Videos**: 50MB per video, max 2 videos
- **Reply Images**: 10MB per image
- **Reply Videos**: 50MB per video
- **Message Attachments**: 20MB per file

## Future Enhancements

### Phase 2 (Recommended)
1. **Real-time Updates**: WebSocket integration for live posts/messages
2. **Notifications**: Push notifications for likes, replies, messages
3. **Mentions**: @mention other agents in posts
4. **Hashtags**: #hashtag support for categorization
5. **Search**: Search posts by content, user, company
6. **Filters**: Filter by company, date range, media type

### Phase 3 (Advanced)
1. **Admin Moderation**: Report/hide/delete inappropriate content
2. **Analytics**: Post engagement metrics, popular topics
3. **Pinned Posts**: Company-wide announcements
4. **Polls**: Create polls in posts
5. **Reactions**: Beyond likes (love, laugh, etc.)
6. **Stories**: 24-hour temporary posts

## Testing Checklist

### Wall Feed
- [ ] Agent can create text-only post
- [ ] Agent can create post with images
- [ ] Agent can create post with videos
- [ ] Agent can create post with mixed media
- [ ] Agent can like/unlike posts
- [ ] Agent can reply to posts
- [ ] Agent can like/unlike replies
- [ ] Agent can delete own posts
- [ ] Agent can delete own replies
- [ ] Buyer/Seller cannot access wall feed
- [ ] Pagination works correctly
- [ ] Empty states display properly

### Agent Messaging
- [ ] Agent can view conversation list
- [ ] Agent can search for other agents
- [ ] Agent can start new conversation
- [ ] Agent can send text message
- [ ] Agent can send image
- [ ] Agent can send video
- [ ] Agent can send file
- [ ] Unread count updates correctly
- [ ] Mark as read works
- [ ] Agent can delete own messages
- [ ] Cannot message non-agents

## Troubleshooting

### Posts not showing
- Verify user is logged in as agent
- Check `usertype` in database
- Verify migrations ran successfully

### File upload fails
- Check storage permissions
- Verify `storage:link` was run
- Check file size limits in php.ini
- Verify disk space available

### Access denied errors
- Confirm user has `usertype = 'agent'`
- Check CompanyAgent relationship exists
- Verify auth token is valid

## API Response Examples

### Get Wall Feed
```json
{
  "data": [
    {
      "id": 1,
      "user": {
        "id": 5,
        "name": "John Doe",
        "email": "john@company.com"
      },
      "company": {
        "id": 2,
        "name": "ABC Manufacturing"
      },
      "content": "Great meeting today!",
      "images": [
        {
          "url": "https://example.com/storage/wall-posts/images/uuid.jpg",
          "path": "wall-posts/images/uuid.jpg",
          "name": "photo.jpg"
        }
      ],
      "videos": null,
      "post_type": "image",
      "likes_count": 5,
      "replies_count": 2,
      "is_liked_by_me": false,
      "created_at": "2024-12-11T10:30:00.000000Z",
      "replies": [...]
    }
  ],
  "current_page": 1,
  "last_page": 5,
  "per_page": 15,
  "total": 73
}
```

### Create Post Response
```json
{
  "message": "Post created successfully",
  "post": {
    "id": 10,
    "user_id": 5,
    "company_id": 2,
    "content": "New post content",
    "images": [...],
    "videos": null,
    "post_type": "image",
    "likes_count": 0,
    "replies_count": 0,
    "is_liked_by_me": false,
    "created_at": "2024-12-11T11:00:00.000000Z"
  }
}
```

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in `storage/logs/laravel.log`
3. Verify database migrations
4. Check file permissions
5. Review API responses in browser console

---

**Implementation Date**: December 11, 2024  
**Version**: 1.0.0  
**Status**: ✅ Complete and Ready for Testing
