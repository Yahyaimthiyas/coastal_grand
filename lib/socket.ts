// WebSocket client service for real-time updates
const WS_URL = 'wss://coastal-grand-back.onrender.com/ws';

class SocketService {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private eventListeners: Map<string, Function[]> = new Map();

  connect(): WebSocket | null {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    // WebSocket implementation
    try {
      this.socket = new WebSocket(WS_URL);
      
      this.socket.onopen = () => {
        console.log('Connected to server');
        this.isConnected = true;
      };

      this.socket.onclose = () => {
        console.log('Disconnected from server');
        this.isConnected = false;
      };

      this.socket.onerror = (error: Event) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
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
