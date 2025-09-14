// Socket.IO client service for real-time updates
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://coastal-grand-back.onrender.com';

class SocketService {
  private socket: any = null;
  private isConnected = false;
  private eventListeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private reconnectTimer: any = null;
  private fallbackToPolling = false;
  private pollingInterval: any = null;
  private sseConnections: Map<string, EventSource> = new Map();
  private useSSE = false;

  connect(): any {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    // Simple WebSocket implementation for development
    try {
      const wsUrl = SOCKET_URL.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws';
      console.log('Attempting WebSocket connection to:', wsUrl);
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('✅ Connected to WebSocket server');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.socket.onclose = (event: CloseEvent) => {
        console.log('❌ WebSocket connection closed:', event.code, event.reason);
        this.isConnected = false;
        this.attemptReconnect();
      };

      this.socket.onerror = (error: any) => {
        console.error('🚨 WebSocket connection error:', error);
        this.isConnected = false;
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          const eventName = data.event || data.type;
          const listeners = this.eventListeners.get(eventName);
          if (listeners) {
            listeners.forEach(callback => callback(data.data || data));
          }
        } catch (error) {
          console.error('Error parsing socket message:', error);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnected = false;
    }

    return this.socket;
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      this.reconnectTimer = setTimeout(() => {
        this.socket = null;
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.warn('❌ WebSocket failed, switching to Server-Sent Events...');
      this.useSSE = true;
      this.connectSSE();
    }
  }

  private connectSSE(): void {
    // Get all unique hotel IDs from event listeners
    const hotelIds = new Set<string>();
    this.eventListeners.forEach((_, eventName) => {
      const match = eventName.match(/^(roomUpdate|activityUpdate):(.+)$/);
      if (match) {
        hotelIds.add(match[2]);
      }
    });

    // Create SSE connection for each hotel
    hotelIds.forEach(hotelId => {
      if (this.sseConnections.has(hotelId)) return;

      const sseUrl = `${SOCKET_URL}/api/events/${hotelId}`;
      console.log(`📡 Connecting to SSE for hotel ${hotelId}:`, sseUrl);
      
      const eventSource = new EventSource(sseUrl);
      
      eventSource.onopen = () => {
        console.log(`✅ SSE connected for hotel ${hotelId}`);
        this.isConnected = true;
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const eventName = data.event || data.type;
          const listeners = this.eventListeners.get(eventName);
          if (listeners) {
            listeners.forEach(callback => callback(data.data || data));
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error(`SSE error for hotel ${hotelId}:`, error);
        eventSource.close();
        this.sseConnections.delete(hotelId);
      };

      this.sseConnections.set(hotelId, eventSource);
    });
  }

  private startPolling(): void {
    if (this.pollingInterval) return;
    
    this.pollingInterval = setInterval(() => {
      // Trigger refresh for all registered hotel IDs
      const hotelIds = new Set<string>();
      this.eventListeners.forEach((_, eventName) => {
        const match = eventName.match(/^(roomUpdate|activityUpdate):(.+)$/);
        if (match) {
          hotelIds.add(match[2]);
        }
      });
      
      // Simulate updates by triggering callbacks
      hotelIds.forEach(hotelId => {
        const roomListeners = this.eventListeners.get(`roomUpdate:${hotelId}`);
        if (roomListeners) {
          console.log(`📊 Polling update for hotel ${hotelId}`);
          // You could fetch fresh data here if needed
        }
      });
    }, 10000); // Poll every 10 seconds
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
    
    // Close all SSE connections
    this.sseConnections.forEach((eventSource, hotelId) => {
      eventSource.close();
    });
    this.sseConnections.clear();
    
    // Clear polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Room update listeners
  onRoomUpdate(hotelId: string, callback: (data: any) => void): void {
    const eventName = `roomUpdate:${hotelId}`;
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)!.push(callback);
    
    // Connect using appropriate method
    if (this.useSSE) {
      this.connectSSE();
    } else if (!this.socket) {
      this.connect();
    }
  }

  offRoomUpdate(hotelId: string, callback?: (data: any) => void): void {
    const eventName = `roomUpdate:${hotelId}`;
    if (callback && this.eventListeners.has(eventName)) {
      const listeners = this.eventListeners.get(eventName)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Activity update listeners
  onActivityUpdate(hotelId: string, callback: (data: any) => void): void {
    const eventName = `activityUpdate:${hotelId}`;
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)!.push(callback);
    
    // Connect using appropriate method
    if (this.useSSE) {
      this.connectSSE();
    } else if (!this.socket) {
      this.connect();
    }
  }

  offActivityUpdate(hotelId: string, callback?: (data: any) => void): void {
    const eventName = `activityUpdate:${hotelId}`;
    if (callback && this.eventListeners.has(eventName)) {
      const listeners = this.eventListeners.get(eventName)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Generic event listeners
  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) {
      this.connect();
    }
    
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (callback && this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Emit events
  emit(event: string, ...args: any[]): void {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({
        event,
        data: args.length === 1 ? args[0] : args
      }));
    }
  }

  getSocket(): any {
    return this.socket;
  }

  isSocketConnected(): boolean {
    return this.isConnected;
  }
}

export const socketService = new SocketService();
