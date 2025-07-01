const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Log connection details in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Using database:', conn.connection.name);
      console.log('Connection state:', conn.connection.readyState === 1 ? 'Connected' : 'Not connected');
    }

    // Create indexes for better performance
    await Promise.all([
      conn.connection.collection('users').createIndex({ email: 1 }, { unique: true }),
      conn.connection.collection('courses').createIndex({ title: 1 })
    ]).catch(err => console.log('Index creation warning:', err));

  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB; 