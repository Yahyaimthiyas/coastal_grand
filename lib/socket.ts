// Socket.IO client service for real-time updates
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://coastal-grand-back.onrender.com';

class SocketService {
  private socket: any = null;
  private isConnected = false;
  private eventListeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 2; // Reduced from 5 to 2 for faster fallback
  private reconnectInterval = 1000; // Reduced from 3000ms to 1000ms
  private reconnectTimer: any = null;
  private fallbackToPolling = false;
  private pollingInterval: any = null;
  private sseConnections: Map<string, EventSource> = new Map();
  private useSSE = false;
  private isRenderEnvironment = SOCKET_URL.includes('onrender.com'); // Detect Render environment

  connect(): any {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    // If we're on Render, skip WebSocket and go directly to SSE
    if (this.isRenderEnvironment && !this.useSSE) {
      console.log('Render environment detected, using SSE directly for better reliability');
      this.switchToSSE();
      return null;
    }

    // Try WebSocket first, fallback to SSE if it fails
    if (!this.useSSE) {
      this.connectWebSocket();
    } else {
      console.log('Using SSE fallback mode');
    }

    return this.socket;
  }

  private connectWebSocket(): void {
    try {
      const wsUrl = SOCKET_URL.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws';
      console.log('Attempting WebSocket connection to:', wsUrl);
      this.socket = new WebSocket(wsUrl);
      
      // Set connection timeout - much faster for immediate fallback
      const connectionTimeout = setTimeout(() => {
        if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
          console.log('WebSocket connection timeout, switching to SSE');
          this.socket.close();
          this.switchToSSE();
        }
      }, 3000); // Reduced from 10s to 3s timeout
      
      this.socket.onopen = () => {
        console.log('✅ Connected to WebSocket server');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.useSSE = false;
        clearTimeout(connectionTimeout);
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.socket.onclose = (event: CloseEvent) => {
        console.log('❌ WebSocket connection closed:', event.code, event.reason);
        this.isConnected = false;
        clearTimeout(connectionTimeout);
        
        // If it's error 1006 (connection blocked), switch to SSE immediately
        if (event.code === 1006) {
          console.log('WebSocket blocked (1006), switching to SSE immediately');
          this.switchToSSE();
        } else {
          this.attemptReconnect();
        }
      };

      this.socket.onerror = (error: any) => {
        console.error('🚨 WebSocket connection error:', error);
        this.isConnected = false;
        clearTimeout(connectionTimeout);
        
        // On error, immediately try SSE if we haven't already
        if (!this.useSSE && this.reconnectAttempts >= 1) {
          console.log('WebSocket error after retry, switching to SSE');
          this.switchToSSE();
        }
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
    if (this.useSSE) {
      return; // Don't reconnect WebSocket if using SSE
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max WebSocket reconnection attempts reached. Switching to SSE fallback.');
      this.switchToSSE();
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting WebSocket reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connectWebSocket();
    }, this.reconnectInterval); // Fixed interval for faster reconnection
  }

  private connectSSE(hotelId: string): void {
    if (this.sseConnections.has(hotelId)) {
      return; // Already connected for this hotel
    }

    const sseUrl = `${SOCKET_URL}/api/events/${hotelId}`;
    console.log(`Connecting to SSE for hotel ${hotelId}:`, sseUrl);
    
    try {
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
        console.error(`SSE connection error for hotel ${hotelId}:`, error);
        this.sseConnections.delete(hotelId);
        
        // Attempt to reconnect SSE after a delay with exponential backoff
        const retryDelay = Math.min(5000 * Math.pow(2, this.reconnectAttempts), 30000);
        setTimeout(() => {
          if (this.useSSE && !this.sseConnections.has(hotelId)) {
            this.reconnectAttempts++;
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
              this.connectSSE(hotelId);
            } else {
              console.log(`Max SSE reconnection attempts reached for hotel ${hotelId}`);
            }
          }
        }, retryDelay);
      };
      
      this.sseConnections.set(hotelId, eventSource);
    } catch (error) {
      console.error(`Failed to create SSE connection for hotel ${hotelId}:`, error);
    }
  }

  private switchToSSE(): void {
    console.log('🔄 Switching to Server-Sent Events (SSE) fallback');
    this.useSSE = true;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    
    // Clean up WebSocket
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // SSE connections will be established per hotel when listeners are added
  }

  disconnect(): void {
    console.log('🔌 Disconnecting from socket service');
    
    // Clear reconnection timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // Clear polling interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    // Close WebSocket connection
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    // Close all SSE connections
    this.sseConnections.forEach((eventSource, hotelId) => {
      console.log(`Closing SSE connection for hotel ${hotelId}`);
      try {
        eventSource.close();
      } catch (error) {
        console.error(`Error closing SSE connection for hotel ${hotelId}:`, error);
      }
    });
    this.sseConnections.clear();
    
    this.isConnected = false;
    this.useSSE = false;
    this.reconnectAttempts = 0;
    this.eventListeners.clear();
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
      this.connectSSE(hotelId);
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
      this.connectSSE(hotelId);
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
