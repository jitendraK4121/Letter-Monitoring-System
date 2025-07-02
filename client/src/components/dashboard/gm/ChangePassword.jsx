import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  styled,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import axios from 'axios';

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: '30px',
  margin: '20px 0',
  maxWidth: '500px',
  marginLeft: 'auto',
  marginRight: 'auto',
  '& .form-title': {
    color: '#333',
    marginBottom: '30px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'center'
  }
}));

const FormField = styled(Box)({
  marginBottom: '20px'
});

const SubmitButton = styled(Button)({
  backgroundColor: '#6F67B6',
  width: '100%',
  padding: '12px',
  marginTop: '20px',
  '&:hover': {
    backgroundColor: '#5a5494',
  }
});

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [selectedUser, setSelectedUser] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'gm' || userRole === 'ssm';

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter users based on role permissions
      let filteredUsers = response.data;
      if (userRole === 'ssm') {
        // SSM can only change regular user passwords
        filteredUsers = response.data.filter(user => user.role === 'user');
      }
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (isAdmin && !selectedUser) {
      setError('Please select a user');
      return false;
    }

    if (!isAdmin && !formData.currentPassword) {
      setError('Current password is required');
      return false;
    }

    if (!formData.newPassword || (!isAdmin && !formData.confirmPassword)) {
      setError('All password fields are required');
      return false;
    }

    if (!isAdmin && formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match');
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const baseURL = 'http://localhost:5000/api/auth';
      const endpoint = isAdmin ? `${baseURL}/change-user-password` : `${baseURL}/change-password`;
      const payload = isAdmin 
        ? {
            userId: selectedUser,
            newPassword: formData.newPassword
          }
        : {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          };

      const response = await axios.post(
        endpoint,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('Password changed successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSelectedUser('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <FormContainer elevation={2}>
      <Typography className="form-title">
        {isAdmin ? 'Change User Password' : 'Change Your Password'}
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <form onSubmit={handleSubmit}>
        {isAdmin && (
          <FormField>
            <FormControl fullWidth>
              <InputLabel>Select User</InputLabel>
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                label="Select User"
              >
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name} ({user.username})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormField>
        )}
        
        {!isAdmin && (
        <FormField>
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            variant="outlined"
          />
        </FormField>
        )}
        
        <FormField>
          <TextField
            fullWidth
            type="password"
            label="New Password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            variant="outlined"
          />
        </FormField>
        
        {!isAdmin && (
        <FormField>
          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            variant="outlined"
          />
        </FormField>
        )}

        <SubmitButton
          variant="contained"
          type="submit"
        >
          Change Password
        </SubmitButton>
      </form>
    </FormContainer>
  );
};

export default ChangePassword; 