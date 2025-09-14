// API service layer for connecting to live server
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://coastal-grand-back.onrender.com';

export interface Hotel {
  id: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  description: string;
  image: string;
  status: string;
  lastActivity: string;
  manager: {
    name: string;
    phone: string;
    email: string;
    status: string;
  };
  totalRooms?: number;
  activeRooms?: number;
  occupancy?: number;
}

export interface Room {
  hotelId: string;
  id: number;
  number: string;
  status: string;
  hasMasterKey: boolean;
  hasLowPower: boolean;
  powerStatus: string;
  occupantType: string | null;
}

export interface Attendance {
  hotelId: string;
  card_uid: string;
  role: string;
  check_in: string;
  check_out: string;
  duration: number;
  room: string;
}

export interface Alert {
  hotelId: string;
  card_uid: string;
  role: string;
  alert_message: string;
  triggered_at: string;
  room: string;
}

export interface DeniedAccess {
  hotelId: string;
  card_uid: string;
  role: string;
  denial_reason: string;
  attempted_at: string;
  room: string;
}

export interface Activity {
  hotelId: string;
  id: string;
  type: string;
  action: string;
  user: string;
  time: string;
}

export interface User {
  hotelId: string;
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  avatar: string;
}

export interface Card {
  hotelId: string;
  id: string;
  roomNumber: string;
  guestName: string;
  status: string;
  expiryDate: string;
  lastUsed: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw new Error(`Failed to connect to server. Please ensure the backend server is running on ${API_BASE_URL}`);
    }
  }

  // Hotel endpoints
  async getHotels(): Promise<Hotel[]> {
    return this.request<Hotel[]>('/api/hotels');
  }

  async getHotel(hotelId: string): Promise<Hotel> {
    return this.request<Hotel>(`/api/hotel/${hotelId}`);
  }

  async updateHotel(hotelId: string, data: Partial<Hotel>): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/hotel/${hotelId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Room endpoints
  async getRooms(hotelId: string): Promise<Room[]> {
    return this.request<Room[]>(`/api/rooms/${hotelId}`);
  }

  // Attendance endpoints
  async getAttendance(hotelId: string): Promise<Attendance[]> {
    return this.request<Attendance[]>(`/api/attendance/${hotelId}`);
  }

  // Alert endpoints
  async getAlerts(hotelId: string): Promise<Alert[]> {
    return this.request<Alert[]>(`/api/alerts/${hotelId}`);
  }

  // Denied access endpoints
  async getDeniedAccess(hotelId: string): Promise<DeniedAccess[]> {
    return this.request<DeniedAccess[]>(`/api/denied_access/${hotelId}`);
  }

  // User endpoints
  async getUsers(hotelId: string): Promise<User[]> {
    return this.request<User[]>(`/api/users/${hotelId}`);
  }

  // Card endpoints
  async getCards(hotelId: string): Promise<Card[]> {
    return this.request<Card[]>(`/api/cards/${hotelId}`);
  }

  // Activity endpoints
  async getActivity(hotelId: string): Promise<Activity[]> {
    return this.request<Activity[]>(`/api/activity/${hotelId}`);
  }
}

export const apiService = new ApiService();
