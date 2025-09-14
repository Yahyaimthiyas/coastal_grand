"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useHotelData } from "@/hooks/useHotelData"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  Shield,
  Battery,
  Thermometer,
  Users,
  CreditCard,
  Building2,
  Bell,
  Eye,
  Zap,
} from "lucide-react"

// Mock real-time data
const realtimeData = [
  { time: "00:00", occupancy: 78, energy: 65, temperature: 22, humidity: 45 },
  { time: "02:00", occupancy: 75, energy: 60, temperature: 21, humidity: 47 },
  { time: "04:00", occupancy: 72, energy: 55, temperature: 20, humidity: 50 },
  { time: "06:00", occupancy: 70, energy: 50, temperature: 19, humidity: 52 },
  { time: "08:00", occupancy: 85, energy: 75, temperature: 22, humidity: 48 },
  { time: "10:00", occupancy: 92, energy: 85, temperature: 23, humidity: 46 },
  { time: "12:00", occupancy: 95, energy: 90, temperature: 24, humidity: 44 },
  { time: "14:00", occupancy: 93, energy: 88, temperature: 24, humidity: 43 },
  { time: "16:00", occupancy: 90, energy: 82, temperature: 23, humidity: 45 },
  { time: "18:00", occupancy: 88, energy: 78, temperature: 22, humidity: 47 },
  { time: "20:00", occupancy: 85, energy: 72, temperature: 21, humidity: 49 },
  { time: "22:00", occupancy: 82, energy: 68, temperature: 20, humidity: 51 },
]

const systemAlerts = [
  {
    id: 1,
    type: "warning",
    title: "High Energy Usage",
    description: "Energy consumption is 15% above normal levels",
    time: "2 minutes ago",
    icon: Zap,
  },
  {
    id: 2,
    type: "info",
    title: "New Guest Check-in",
    description: "Room 205 has been occupied by John Smith",
    time: "5 minutes ago",
    icon: Users,
  },
  {
    id: 3,
    type: "success",
    title: "System Update Complete",
    description: "RFID system has been successfully updated",
    time: "10 minutes ago",
    icon: CheckCircle,
  },
  {
    id: 4,
    type: "error",
    title: "Network Connectivity Issue",
    description: "Temporary connection loss in East Wing",
    time: "15 minutes ago",
    icon: Wifi,
  },
]

const systemStatus = [
  { name: "RFID System", status: "online", uptime: "99.9%", icon: CreditCard },
  { name: "Security Cameras", status: "online", uptime: "99.8%", icon: Eye },
  { name: "HVAC System", status: "online", uptime: "99.7%", icon: Thermometer },
  { name: "Network", status: "warning", uptime: "98.5%", icon: Wifi },
  { name: "Power Backup", status: "online", uptime: "100%", icon: Battery },
  { name: "Fire Alarm", status: "online", uptime: "100%", icon: AlertTriangle },
]

const liveMetrics = [
  { name: "Current Occupancy", value: "78%", trend: "up", change: "+2.3%" },
  { name: "Energy Usage", value: "65 kW", trend: "down", change: "-5.1%" },
  { name: "Temperature", value: "22°C", trend: "stable", change: "0.0%" },
  { name: "Humidity", value: "45%", trend: "up", change: "+1.2%" },
  { name: "Active Key Cards", value: "89", trend: "up", change: "+3" },
  { name: "Staff Online", value: "12", trend: "stable", change: "0" },
]

interface RealtimeMonitoringProps {
  hotelId: string
}

export function RealtimeMonitoring({ hotelId }: RealtimeMonitoringProps) {
  const { hotel, rooms, activities, loading, error } = useHotelData(hotelId)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-600 bg-green-100 dark:bg-green-900/20"
      case "warning":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20"
      case "error":
        return "text-red-600 bg-red-100 dark:bg-red-900/20"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20"
    }
  }

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "error":
        return "destructive"
      case "warning":
        return "default"
      case "success":
        return "default"
      case "info":
        return "secondary"
      default:
        return "default"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <Activity className="h-4 w-4 text-green-600" />
      case "down":
        return <Activity className="h-4 w-4 text-red-600" />
      case "stable":
        return <Activity className="h-4 w-4 text-blue-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const chartConfig = {
    occupancy: {
      label: "Occupancy Rate",
      color: "#3b82f6",
    },
    energy: {
      label: "Energy Usage",
      color: "#10b981",
    },
    temperature: {
      label: "Temperature",
      color: "#f59e0b",
    },
    humidity: {
      label: "Humidity",
      color: "#8b5cf6",
    },
  }

  return (
    <div className="space-y-6">
      {/* Real-time Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Real-time Monitoring</h2>
          <p className="text-muted-foreground">Live system status and performance metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${isLive ? "bg-green-500" : "bg-red-500"} flex-shrink-0`} />
            <span className="text-sm font-medium">{isLive ? "Live" : "Offline"}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {currentTime.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isLive ? "Pause" : "Resume"}
          </Button>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {liveMetrics.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <div className="flex items-center space-x-1 text-xs">
                    {getTrendIcon(metric.trend)}
                    <span className={metric.trend === "up" ? "text-green-600" : metric.trend === "down" ? "text-red-600" : "text-blue-600"}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Real-time status of hotel systems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemStatus.map((system) => {
                const IconComponent = system.icon
                return (
                  <div key={system.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(system.status)}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{system.name}</p>
                        <p className="text-sm text-muted-foreground">Uptime: {system.uptime}</p>
                      </div>
                    </div>
                    <Badge variant={system.status === "online" ? "default" : system.status === "warning" ? "outline" : "destructive"}>
                      {system.status}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Live Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Live Alerts</CardTitle>
            <CardDescription>Recent system notifications and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemAlerts.map((alert) => {
                const IconComponent = alert.icon
                return (
                  <Alert key={alert.id} variant={getAlertVariant(alert.type) as any}>
                    <IconComponent className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                      </div>
                    </AlertDescription>
                  </Alert>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy and Energy Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Occupancy & Energy Usage</CardTitle>
            <CardDescription>Real-time occupancy and energy consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart data={realtimeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="occupancy"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Environmental Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Environmental Conditions</CardTitle>
            <CardDescription>Temperature and humidity monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={realtimeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="temperature" fill="hsl(var(--chart-3))" name="Temperature (°C)" />
                <Bar dataKey="humidity" fill="hsl(var(--chart-4))" name="Humidity (%)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common monitoring and control actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Shield className="h-6 w-6" />
              <span>Security Check</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Thermometer className="h-6 w-6" />
              <span>HVAC Control</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Zap className="h-6 w-6" />
              <span>Energy Report</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Bell className="h-6 w-6" />
              <span>Alert Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 