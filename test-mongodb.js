// Test MongoDB Connection
const mongoose = require('mongoose');

// Test local MongoDB connection
const mongoUrl = 'mongodb://localhost:27017/hotel_db';

console.log('Testing MongoDB connection...');
console.log('URL:', mongoUrl);

mongoose.connect(mongoUrl)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
    console.log('Database:', mongoose.connection.db.databaseName);
    
    // Test basic operations
    return mongoose.connection.db.admin().ping();
  })
  .then(() => {
    console.log('✅ MongoDB ping successful!');
    console.log('✅ MongoDB is ready for the hotel management system');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('\n🔧 Solutions:');
    console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
    console.log('2. Start MongoDB service: net start MongoDB');
    console.log('3. Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo');
    process.exit(1);
  });
