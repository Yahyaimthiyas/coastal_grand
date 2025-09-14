import { useState, useEffect, useCallback } from 'react';
import { apiService, Hotel, Room, Activity } from '@/lib/api';
import { socketService } from '@/lib/socket';

export function useHotelData(hotelId: string) {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHotelData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [hotelData, roomsData, activitiesData] = await Promise.all([
        apiService.getHotel(hotelId),
        apiService.getRooms(hotelId),
        apiService.getActivity(hotelId),
      ]);

      setHotel(hotelData);
      setRooms(roomsData);
      setActivities(activitiesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch hotel data');
      console.error('Error fetching hotel data:', err);
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    fetchHotelData();
  }, [fetchHotelData]);

  // Set up real-time updates
  useEffect(() => {
    if (!hotelId) return;

    // Connect to socket
    socketService.connect();

    // Listen for room updates
    const handleRoomUpdate = (data: any) => {
      setRooms(prevRooms => {
        const updatedRooms = [...prevRooms];
        const roomIndex = updatedRooms.findIndex(room => room.number === data.roomNum);
        
        if (roomIndex !== -1) {
          updatedRooms[roomIndex] = { ...updatedRooms[roomIndex], ...data };
        } else {
          // Add new room if it doesn't exist
          updatedRooms.push({
            hotelId,
            id: parseInt(data.roomNum),
            number: data.roomNum,
            status: data.status || 'vacant',
            hasMasterKey: data.hasMasterKey || false,
            hasLowPower: data.hasLowPower || false,
            powerStatus: data.powerStatus || 'off',
            occupantType: data.occupantType || null,
          });
        }
        
        // Update hotel occupancy stats
        setHotel(prevHotel => {
          if (!prevHotel) return prevHotel;
          
          const activeRooms = updatedRooms.filter(room => 
            room.status === 'occupied' || room.status === 'maintenance'
          ).length;
          
          const occupancy = prevHotel.totalRooms 
            ? Math.round((activeRooms / prevHotel.totalRooms) * 100) 
            : 0;

          return {
            ...prevHotel,
            activeRooms,
            occupancy,
          };
        });
        
        return updatedRooms;
      });
    };

    // Listen for activity updates
    const handleActivityUpdate = (data: Activity) => {
      setActivities(prevActivities => [data, ...prevActivities]);
    };

    socketService.onRoomUpdate(hotelId, handleRoomUpdate);
    socketService.onActivityUpdate(hotelId, handleActivityUpdate);

    return () => {
      socketService.offRoomUpdate(hotelId, handleRoomUpdate);
      socketService.offActivityUpdate(hotelId, handleActivityUpdate);
    };
  }, [hotelId]);

  const updateHotel = useCallback(async (data: Partial<Hotel>) => {
    try {
      await apiService.updateHotel(hotelId, data);
      setHotel(prevHotel => prevHotel ? { ...prevHotel, ...data } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update hotel');
      throw err;
    }
  }, [hotelId]);

  const refreshData = useCallback(() => {
    fetchHotelData();
  }, [fetchHotelData]);

  return {
    hotel,
    rooms,
    activities,
    loading,
    error,
    updateHotel,
    refreshData,
  };
}

export function useHotelsData() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHotels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const hotelsData = await apiService.getHotels();
      setHotels(hotelsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch hotels');
      console.error('Error fetching hotels:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const refreshHotels = useCallback(() => {
    fetchHotels();
  }, [fetchHotels]);

  return {
    hotels,
    loading,
    error,
    refreshHotels,
  };
}