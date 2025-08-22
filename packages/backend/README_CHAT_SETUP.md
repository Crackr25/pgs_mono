# Real-time Chat Setup Instructions

## Backend Setup (Laravel)

### 1. Install Dependencies
```bash
cd packages/backend
composer install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and update the following settings:

```env
# Broadcasting
BROADCAST_DRIVER=pusher

# Pusher/WebSocket Settings
PUSHER_APP_ID=local
PUSHER_APP_KEY=local
PUSHER_APP_SECRET=local
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http
PUSHER_APP_CLUSTER=mt1

# Laravel WebSockets
LARAVEL_WEBSOCKETS_PORT=6001
```

### 3. Database Migration
Run the chat-related migrations:
```bash
php artisan migrate
```

### 4. Start Laravel WebSockets Server
In a separate terminal, start the WebSocket server:
```bash
php artisan websockets:serve
```

The WebSocket server will run on `http://127.0.0.1:6001`

### 5. Start Laravel Application
```bash
php artisan serve
```

## Frontend Setup (Next.js)

### 1. Install Dependencies
```bash
cd packages/frontend
npm install
```

### 2. Environment Configuration
Copy `.env.local.example` to `.env.local` and configure:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Pusher/WebSocket Configuration
NEXT_PUBLIC_PUSHER_KEY=local
NEXT_PUBLIC_PUSHER_CLUSTER=mt1
NEXT_PUBLIC_PUSHER_HOST=127.0.0.1
NEXT_PUBLIC_PUSHER_PORT=6001
NEXT_PUBLIC_PUSHER_SCHEME=http
```

### 3. Start Next.js Application
```bash
npm run dev
```

## Testing the Chat Feature

1. **Access the Chat**: Navigate to `/chat` in your seller portal
2. **WebSocket Dashboard**: Visit `http://127.0.0.1:6001` to monitor WebSocket connections
3. **Create Conversations**: Use the API endpoints to create conversations between sellers and buyers
4. **Real-time Messaging**: Messages should appear instantly without page refresh

## API Endpoints

- `GET /api/conversations` - Get all conversations for authenticated seller
- `GET /api/conversations/{id}` - Get messages for specific conversation
- `POST /api/conversations` - Create new conversation
- `POST /api/messages/chat` - Send message in conversation
- `POST /api/messages/mark-read` - Mark messages as read
- `GET /api/chat/unread-count` - Get unread message count

## Troubleshooting

### WebSocket Connection Issues
- Ensure Laravel WebSockets server is running on port 6001
- Check firewall settings for port 6001
- Verify PUSHER_* environment variables match between backend and frontend

### Authentication Issues
- Ensure user is authenticated with valid Sanctum token
- Check channel authorization in `routes/channels.php`

### Database Issues
- Run `php artisan migrate` to ensure chat tables exist
- Check database connection settings in `.env`

## Features Included

✅ Real-time messaging between sellers and buyers
✅ Conversation management
✅ Unread message indicators
✅ Message read status
✅ WebSocket connection with automatic reconnection
✅ Mobile-responsive chat interface
✅ Browser notifications for new messages
✅ Chat navigation in seller dashboard
