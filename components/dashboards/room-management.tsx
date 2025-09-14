"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RoomCard } from "@/components/ui/room-card"
import { useHotelData } from "@/hooks/useHotelData"

import { 
  Building2, 
  Users, 
  Bed, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Calendar,
  Clock,
  User,
  Shield,
  Eye,
  Settings,
  CheckCircle
} from "lucide-react"

interface RoomManagementProps {
  hotelId: string
}

export function RoomManagement({ hotelId }: RoomManagementProps) {
  const { rooms, loading, error } = useHotelData(hotelId)
  const [searchTerm, setSearchTerm] = useState("")
  const [floorFilter, setFloorFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [occupancyFilter, setOccupancyFilter] = useState("all")
  const [occupantTypeFilter, setOccupantTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("number")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Transform live room data to match the expected format
  const transformedRooms = useMemo(() => {
    if (!rooms) return []
    
    return rooms.map(room => ({
      id: room.id.toString(),
      number: room.number,
      type: "Standard", // Default type since it's not in the database
      floor: room.number.charAt(0), // Extract floor from room number
      occupancy: room.status === "vacant" ? "vacant" : "occupied",
      occupant: room.occupantType ? {
        name: `${room.occupantType} User`,
        type: room.occupantType,
        checkIn: "2024-01-01",
        checkOut: "2024-01-07",
        avatar: "/placeholder.svg?height=40&width=40"
      } : undefined,
      lastActivity: "Recently",
      status: room.status === "maintenance" ? "maintenance" : "active"
    }))
  }, [rooms])

  const filteredAndSortedRooms = useMemo(() => {
    let filtered = transformedRooms.filter((room) => {
      const matchesSearch = 
        room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.occupant?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      const matchesFloor = floorFilter === "all" || room.floor === floorFilter
      const matchesType = typeFilter === "all" || room.type === typeFilter
      const matchesOccupancy = occupancyFilter === "all" || room.occupancy === occupancyFilter
      const matchesOccupantType = occupantTypeFilter === "all" || room.occupant?.type === occupantTypeFilter || (occupantTypeFilter === "maintenance" && room.status === "maintenance")
      
      return matchesSearch && matchesFloor && matchesType && matchesOccupancy && matchesOccupantType
    })

    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case "number":
          aValue = parseInt(a.number)
          bValue = parseInt(b.number)
          break
        case "floor":
          aValue = parseInt(a.floor)
          bValue = parseInt(b.floor)
          break
        case "occupancy":
          aValue = a.occupancy
          bValue = b.occupancy
          break
        case "lastActivity":
          aValue = a.lastActivity
          bValue = b.lastActivity
          break
        default:
          aValue = a.number
          bValue = b.number
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [transformedRooms, searchTerm, floorFilter, typeFilter, occupancyFilter, occupantTypeFilter, sortBy, sortOrder])

  const roomStats = useMemo(() => {
    const total = transformedRooms.length
    const occupied = transformedRooms.filter(room => room.occupancy === "occupied").length
    const vacant = transformedRooms.filter(room => room.occupancy === "vacant").length
    const maintenance = transformedRooms.filter(room => room.status === "maintenance").length
    
    return { total, occupied, vacant, maintenance }
  }, [transformedRooms])

  const floors = useMemo(() => {
    const uniqueFloors = [...new Set(transformedRooms.map(room => room.floor))]
    return uniqueFloors.sort()
  }, [transformedRooms])

  const roomTypes = useMemo(() => {
    const uniqueTypes = [...new Set(transformedRooms.map(room => room.type))]
    return uniqueTypes.sort()
  }, [transformedRooms])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading rooms...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <Building2 className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Rooms</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Room Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Rooms</p>
                <p className="text-2xl font-bold">{roomStats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupied</p>
                <p className="text-2xl font-bold text-green-600">{roomStats.occupied}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vacant</p>
                <p className="text-2xl font-bold text-blue-600">{roomStats.vacant}</p>
              </div>
              <Bed className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold text-orange-600">{roomStats.maintenance}</p>
              </div>
              <Settings className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Room Management</CardTitle>
          <CardDescription>Manage and monitor hotel rooms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rooms or occupants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={floorFilter} onValueChange={setFloorFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                {floors.map(floor => (
                  <SelectItem key={floor} value={floor}>Floor {floor}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {roomTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={occupancyFilter} onValueChange={setOccupancyFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Occupancy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="vacant">Vacant</SelectItem>
              </SelectContent>
            </Select>

            <Select value={occupantTypeFilter} onValueChange={setOccupantTypeFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Occupant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="floor">Floor</SelectItem>
                  <SelectItem value="occupancy">Occupancy</SelectItem>
                  <SelectItem value="lastActivity">Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>

            <div className="ml-auto text-sm text-muted-foreground">
              {filteredAndSortedRooms.length} of {roomStats.total} rooms
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAndSortedRooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onClick={() => {/* Handle room click */}}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedRooms.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No rooms found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}