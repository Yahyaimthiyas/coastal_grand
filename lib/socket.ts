// WebSocket client service for real-time updates
const WS_URL = 'wss://coastal-grand-back.onrender.com/ws';

class SocketService {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private eventListeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3 seconds

  connect(): WebSocket | null {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    // WebSocket implementation
    try {
      console.log('Attempting to connect to WebSocket:', WS_URL);
      this.socket = new WebSocket(WS_URL);
      
      this.socket.onopen = () => {
        console.log('✅ Connected to WebSocket server');
        this.isConnected = true;
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      };

      this.socket.onclose = (event) => {
        console.log('❌ WebSocket connection closed:', event.code, event.reason);
        this.isConnected = false;
        this.attemptReconnect();
      };

      this.socket.onerror = (error: Event) => {
        console.error('🚨 WebSocket connection error:', error);
        this.isConnected = false;
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          console.log('📨 Received WebSocket message:', event.data);
          const { event: eventType, data } = JSON.parse(event.data);
          
          if (eventType.startsWith('roomUpdate:')) {
            // Handle room updates
            const listeners = this.eventListeners.get(eventType);
            if (listeners) {
              listeners.forEach(callback => callback(data));
            }
          } else if (eventType.startsWith('activityUpdate:')) {
            // Handle activity updates
            const listeners = this.eventListeners.get(eventType);
            if (listeners) {
              listeners.forEach(callback => callback(data));
            }
          } else {
            // Handle other events
            const listeners = this.eventListeners.get(eventType);
            if (listeners) {
              listeners.forEach(callback => callback(data));
            }
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
      
      setTimeout(() => {
        this.socket = null;
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('❌ Max reconnection attempts reached. Please refresh the page.');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Room update listeners
  onRoomUpdate(hotelId: string, callback: (data: any) => void): void {
    if (!this.socket) {
      this.connect();
    }
    
    const eventName = `roomUpdate:${hotelId}`;
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)!.push(callback);
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
    if (!this.socket) {
      this.connect();
    }
    
    const eventName = `activityUpdate:${hotelId}`;
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)!.push(callback);
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
