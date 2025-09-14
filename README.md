# RFID Hotel Management System

A modern, mobile-first RFID key card management system for hotels with role-based access control.

## Features

### 🏨 Hotel Management (New!)
- **Multi-Hotel Support**: Administrators can manage multiple hotels from a single dashboard
- **Hotel Overview**: View all hotels as interactive cards with key metrics
- **Hotel-Specific Dashboards**: Click any hotel to access its dedicated management interface
- **Search & Filter**: Easily find hotels by name or location
- **Real-time Status**: See hotel operational status, occupancy rates, and active key cards

### 🔐 Role-Based Access Control
- **Administrator**: Full system access, hotel management, user management
- **Staff**: Hotel-specific operations, guest management, key card operations
- **Guest**: View own key card information and status

### 🏷️ Key Card Management
- **RFID Card Tracking**: Monitor all key cards across hotels
- **Real-time Status**: Active, inactive, and maintenance status
- **Guest Association**: Link cards to specific guests and rooms
- **Expiry Management**: Automatic expiry date tracking

### 📊 Dashboard Features
- **Modern UI**: Built with Next.js 15, TypeScript, and Tailwind CSS
- **Responsive Design**: Mobile-first approach for all devices
- **Dark/Light Theme**: Toggle between themes
- **Real-time Updates**: Live activity feeds and status updates
- **Advanced Analytics**: Comprehensive charts and performance metrics
- **Mobile Responsive**: All analytics and charts work perfectly on mobile devices

### 📈 Advanced Analytics (New!)
- **Occupancy Trends**: Line charts showing monthly occupancy rates
- **Revenue Analytics**: Area charts for revenue tracking and analysis
- **Guest Demographics**: Pie charts for guest type distribution
- **Service Ratings**: Radar charts for service quality metrics
- **Performance KPIs**: Real-time performance indicators with progress tracking
- **Department Analytics**: Department-specific efficiency and satisfaction metrics
- **Seasonal Analysis**: Seasonal performance trends and patterns
- **Real-time Monitoring**: Live system status, alerts, and environmental conditions
- **Interactive Charts**: Multiple chart types including line, bar, area, pie, radar, and scatter plots
- **Mobile-Optimized**: All charts are fully responsive and touch-friendly

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rfid-hotel-management
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
pnpm build
pnpm start
```

## Usage

### For Administrators

1. **Login** with administrator credentials
2. **View All Hotels**: See a grid of all managed hotels with key metrics
3. **Select a Hotel**: Click any hotel card to access its specific dashboard
4. **Manage Hotel**: 
   - View hotel overview and statistics
   - Manage staff members
   - Monitor key cards
   - Track activity logs
5. **Navigate Back**: Use the "Back to Hotels" button to return to the overview

### Hotel Dashboard Features

When viewing a specific hotel, administrators can:

- **Overview Tab**: Recent activity, quick actions, and daily metrics preview
- **Analytics Tab**: Comprehensive analytics dashboard with multiple chart types
  - **Overview**: Key metrics and room type distribution
  - **Performance**: KPI tracking and department performance
  - **Live**: Real-time monitoring and system alerts
  - **Occupancy**: Detailed occupancy trends and analysis
  - **Revenue**: Revenue tracking and financial analytics
  - **Guests**: Guest analytics and demographics
  - **Services**: Service quality ratings and performance
  - **Activity**: Daily activity patterns and system usage
- **Rooms Tab**: Room management and status tracking
- **Staff Tab**: Manage hotel staff members
- **Key Cards Tab**: Monitor and manage RFID key cards
- **Activity Tab**: View detailed activity logs

### Key Metrics Displayed

- **Total Rooms**: Number of rooms in the hotel
- **Active Cards**: Currently active RFID key cards
- **Occupancy Rate**: Current hotel occupancy percentage
- **Last Activity**: Most recent system activity

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts (responsive charting library)
- **Data Visualization**: Multiple chart types (line, bar, area, pie, radar, scatter)
- **Package Manager**: pnpm

## Project Structure

```
rfid-hotel-management/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication pages
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── dashboards/       # Dashboard components
│   │   ├── admin-dashboard.tsx
│   │   ├── hotels-overview.tsx    # New!
│   │   ├── hotel-dashboard.tsx    # New!
│   │   ├── staff-dashboard.tsx
│   │   └── guest-dashboard.tsx
│   ├── auth/            # Authentication components
│   └── ui/              # UI components
├── lib/                 # Utility functions
└── public/             # Static assets
```

## Development

### Key Components

- **HotelsOverview**: Displays all hotels as interactive cards
- **HotelDashboard**: Hotel-specific management interface
- **AdminDashboard**: Main admin interface with hotel selection

### Adding New Hotels

To add new hotels, modify the `mockHotels` array in `components/dashboards/hotels-overview.tsx`:

```typescript
const mockHotels = [
  {
    id: "7",
    name: "New Hotel Name",
    location: "Hotel Location",
    rating: 4.5,
    totalRooms: 100,
    activeCards: 75,
    totalCards: 90,
    status: "active",
    occupancy: 80,
    lastActivity: "1 minute ago",
    image: "/placeholder.jpg",
  },
  // ... more hotels
]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 