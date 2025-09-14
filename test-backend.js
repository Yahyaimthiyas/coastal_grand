// Simple test script to verify backend is working
const fetch = require('node-fetch');

const API_BASE_URL = 'https://coastal-grand-back.onrender.com';

async function testBackend() {
  console.log('🧪 Testing Backend API...\n');

  try {
    // Test 1: Get all hotels
    console.log('1. Testing GET /api/hotels');
    const hotelsResponse = await fetch(`${API_BASE_URL}/api/hotels`);
    if (hotelsResponse.ok) {
      const hotels = await hotelsResponse.json();
      console.log(`✅ Success: Found ${hotels.length} hotels`);
      console.log(`   First hotel: ${hotels[0]?.name || 'N/A'}\n`);
    } else {
      console.log(`❌ Failed: ${hotelsResponse.status} ${hotelsResponse.statusText}\n`);
    }

    // Test 2: Get specific hotel
    console.log('2. Testing GET /api/hotel/1');
    const hotelResponse = await fetch(`${API_BASE_URL}/api/hotel/1`);
    if (hotelResponse.ok) {
      const hotel = await hotelResponse.json();
      console.log(`✅ Success: Hotel ${hotel.name}`);
      console.log(`   Location: ${hotel.location}`);
      console.log(`   Total Rooms: ${hotel.totalRooms || 'N/A'}\n`);
    } else {
      console.log(`❌ Failed: ${hotelResponse.status} ${hotelResponse.statusText}\n`);
    }

    // Test 3: Get rooms for hotel 1
    console.log('3. Testing GET /api/rooms/1');
    const roomsResponse = await fetch(`${API_BASE_URL}/api/rooms/1`);
    if (roomsResponse.ok) {
      const rooms = await roomsResponse.json();
      console.log(`✅ Success: Found ${rooms.length} rooms`);
      console.log(`   First room: ${rooms[0]?.number || 'N/A'}\n`);
    } else {
      console.log(`❌ Failed: ${roomsResponse.status} ${roomsResponse.statusText}\n`);
    }

    // Test 4: Get activity for hotel 1
    console.log('4. Testing GET /api/activity/1');
    const activityResponse = await fetch(`${API_BASE_URL}/api/activity/1`);
    if (activityResponse.ok) {
      const activities = await activityResponse.json();
      console.log(`✅ Success: Found ${activities.length} activities`);
      if (activities.length > 0) {
        console.log(`   Latest activity: ${activities[0]?.action || 'N/A'}\n`);
      }
    } else {
      console.log(`❌ Failed: ${activityResponse.status} ${activityResponse.statusText}\n`);
    }

    console.log('🎉 Backend API tests completed!');

  } catch (error) {
    console.error('❌ Error testing backend:', error.message);
    console.log('\n💡 Make sure the backend server is running:');
    console.log('   cd backend && npm start');
  }
}

// Run the test
testBackend();
