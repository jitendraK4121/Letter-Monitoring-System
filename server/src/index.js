require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const userRoutes = require('./routes/user.routes');
const letterRoutes = require('./routes/letter.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to LMS API',
    endpoints: {
      auth: '/api/auth',
      courses: '/api/courses',
      users: '/api/users'
    }
  });
});

// API status route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/letters', letterRoutes);

// Error handling
app.use(errorHandler);

// Database connection
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 