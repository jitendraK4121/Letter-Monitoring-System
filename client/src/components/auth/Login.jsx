import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  styled
} from '@mui/material';

const LoginContainer = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#6F67B6'
});

const LoginBox = styled(Box)({
  background: 'white',
  padding: '40px',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
});

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#f8f8f8',
    borderRadius: '4px',
    '& fieldset': {
      borderColor: '#e0e0e0'
    },
    '&:hover fieldset': {
      borderColor: '#e0e0e0'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#e0e0e0'
    }
  },
  '& .MuiInputLabel-root': {
    color: '#666'
  }
});

const LoginButton = styled(Button)({
  backgroundColor: '#6F67B6',
  color: 'white',
  padding: '12px',
  borderRadius: '4px',
  fontSize: '1rem',
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#5a5494',
    boxShadow: 'none'
  }
});

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store the token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', formData.username);
      localStorage.setItem('userRole', data.role);

      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid credentials');
    }
  };

  return (
    <LoginContainer>
      <LoginBox>
        <Form onSubmit={handleSubmit}>
          <StyledTextField
            name="username"
            placeholder="User name"
            variant="outlined"
            fullWidth
            value={formData.username}
            onChange={handleChange}
            error={!!error}
            InputProps={{
              style: { height: '45px' }
            }}
          />
          
          <StyledTextField
            name="password"
            placeholder="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={formData.password}
            onChange={handleChange}
            error={!!error}
            helperText={error}
            InputProps={{
              style: { height: '45px' }
            }}
          />

          <LoginButton 
            type="submit"
            variant="contained"
            fullWidth
          >
            LOG IN NOW
          </LoginButton>
        </Form>
      </LoginBox>
    </LoginContainer>
  );
};

export default Login; 