import Pusher from 'pusher-js';

class WebSocketService {
  constructor() {
    this.pusher = null;
    this.channels = new Map();
    this.isConnected = false;
  }

  connect(authToken) {
    if (this.pusher) {
      this.disconnect();
    }

    this.pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST,
      wsPort: process.env.NEXT_PUBLIC_PUSHER_PORT,
      wssPort: process.env.NEXT_PUBLIC_PUSHER_PORT,
      forceTLS: process.env.NEXT_PUBLIC_PUSHER_SCHEME === 'https',
      enabledTransports: ['ws', 'wss'],
      auth: {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    });

    this.pusher.connection.bind('connected', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
    });

    this.pusher.connection.bind('disconnected', () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
    });

    this.pusher.connection.bind('error', (error) => {
      console.error('WebSocket error:', error);
    });

    return this.pusher;
  }

  disconnect() {
    if (this.pusher) {
      this.channels.forEach((channel) => {
        this.pusher.unsubscribe(channel.name);
      });
      this.channels.clear();
      this.pusher.disconnect();
      this.pusher = null;
      this.isConnected = false;
    }
  }

  subscribeToConversation(conversationId, callbacks = {}) {
    if (!this.pusher) {
      console.error('WebSocket not connected');
      return null;
    }

    const channelName = `private-conversation.${conversationId}`;
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName);
    }

    const channel = this.pusher.subscribe(channelName);
    
    channel.bind('message.sent', (data) => {
      console.log('New message received:', data);
      if (callbacks.onMessageReceived) {
        callbacks.onMessageReceived(data);
      }
    });

    channel.bind('pusher:subscription_succeeded', () => {
      console.log(`Subscribed to conversation ${conversationId}`);
      if (callbacks.onSubscribed) {
        callbacks.onSubscribed();
      }
    });

    channel.bind('pusher:subscription_error', (error) => {
      console.error(`Failed to subscribe to conversation ${conversationId}:`, error);
      if (callbacks.onError) {
        callbacks.onError(error);
      }
    });

    this.channels.set(channelName, channel);
    return channel;
  }

  subscribeToUserChannel(userId, callbacks = {}) {
    if (!this.pusher) {
      console.error('WebSocket not connected');
      return null;
    }

    const channelName = `private-user.${userId}`;
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName);
    }

    const channel = this.pusher.subscribe(channelName);
    
    channel.bind('message.sent', (data) => {
      console.log('New message notification:', data);
      if (callbacks.onMessageNotification) {
        callbacks.onMessageNotification(data);
      }
    });

    this.channels.set(channelName, channel);
    return channel;
  }

  unsubscribeFromConversation(conversationId) {
    const channelName = `private-conversation.${conversationId}`;
    
    if (this.channels.has(channelName)) {
      this.pusher.unsubscribe(channelName);
      this.channels.delete(channelName);
    }
  }

  unsubscribeFromUserChannel(userId) {
    const channelName = `private-user.${userId}`;
    
    if (this.channels.has(channelName)) {
      this.pusher.unsubscribe(channelName);
      this.channels.delete(channelName);
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();
export default websocketService;
