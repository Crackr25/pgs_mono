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

    console.log('🔌 Connecting to WebSocket with config:', {
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      host: process.env.NEXT_PUBLIC_PUSHER_HOST,
      port: process.env.NEXT_PUBLIC_PUSHER_PORT,
      scheme: process.env.NEXT_PUBLIC_PUSHER_SCHEME
    });

    this.pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap1',
      forceTLS: true,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${process.env.NEXT_PUBLIC_API_URL || 'https://api.pinoyglobalsupply.com/api'}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    });

    this.pusher.connection.bind('connected', () => {
      console.log('✅ WebSocket connected successfully!');
      this.isConnected = true;
    });

    this.pusher.connection.bind('disconnected', () => {
      console.log('❌ WebSocket disconnected');
      this.isConnected = false;
    });

    this.pusher.connection.bind('error', (error) => {
      console.error('❌ WebSocket connection error:', error);
    });

    this.pusher.connection.bind('state_change', (states) => {
      console.log('🔄 WebSocket state change:', states.previous, '→', states.current);
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
      console.error('❌ WebSocket not connected - cannot subscribe to conversation');
      return null;
    }

    const channelName = `private-conversation.${conversationId}`;
    console.log('📡 Subscribing to conversation channel:', channelName);
    
    if (this.channels.has(channelName)) {
      console.log('✅ Already subscribed to conversation:', conversationId);
      return this.channels.get(channelName);
    }

    const channel = this.pusher.subscribe(channelName);
    
    channel.bind('message.sent', (data) => {
      console.log('🔔 WebSocket Service - New message received:', data);
      console.log('🔔 WebSocket Service - Callback exists:', !!callbacks.onMessageReceived);
      if (callbacks.onMessageReceived) {
        console.log('🔔 WebSocket Service - Calling onMessageReceived callback');
        callbacks.onMessageReceived(data);
      } else {
        console.log('⚠️ WebSocket Service - No onMessageReceived callback provided');
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
      console.error('❌ WebSocket not connected - cannot subscribe to user channel');
      return null;
    }

    const channelName = `private-user.${userId}`;
    console.log('👤 Subscribing to user channel:', channelName);
    
    if (this.channels.has(channelName)) {
      console.log('✅ Already subscribed to user channel:', userId);
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

  // Generic method to subscribe to any channel
  subscribeToChannel(channelName, eventName, callback) {
    if (!this.pusher) {
      console.error('❌ WebSocket not connected - cannot subscribe to channel');
      return null;
    }

    const fullChannelName = channelName.startsWith('private-') ? channelName : `private-${channelName}`;
    console.log('📡 Subscribing to channel:', fullChannelName, 'event:', eventName);
    
    if (this.channels.has(fullChannelName)) {
      console.log('✅ Already subscribed to channel:', fullChannelName);
      const existingChannel = this.channels.get(fullChannelName);
      // Bind the new event if not already bound
      existingChannel.bind(eventName, callback);
      return existingChannel;
    }

    const channel = this.pusher.subscribe(fullChannelName);
    
    channel.bind(eventName, (data) => {
      console.log(`🔔 Event '${eventName}' received on ${fullChannelName}:`, data);
      if (callback) {
        callback(data);
      }
    });

    channel.bind('pusher:subscription_succeeded', () => {
      console.log(`✅ Successfully subscribed to ${fullChannelName}`);
    });

    channel.bind('pusher:subscription_error', (error) => {
      console.error(`❌ Failed to subscribe to ${fullChannelName}:`, error);
    });

    this.channels.set(fullChannelName, channel);
    return channel;
  }

  // Generic method to unsubscribe from any channel
  unsubscribeFromChannel(channelName) {
    const fullChannelName = channelName.startsWith('private-') ? channelName : `private-${channelName}`;
    
    if (this.channels.has(fullChannelName)) {
      console.log('📡 Unsubscribing from channel:', fullChannelName);
      this.pusher.unsubscribe(fullChannelName);
      this.channels.delete(fullChannelName);
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();
export default websocketService;
