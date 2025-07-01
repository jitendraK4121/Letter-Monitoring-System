const config = {
  development: {
    apiUrl: 'http://localhost:5000/api'
  },
  production: {
    apiUrl: 'https://lms-backend-3f2e.onrender.com/api'
  }
};

const environment = process.env.NODE_ENV || 'development';
export const API_URL = config[environment].apiUrl; 