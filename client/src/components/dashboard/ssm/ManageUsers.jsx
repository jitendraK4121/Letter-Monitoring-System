import React, { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  styled
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';

const Container = styled(Paper)(({ theme }) => ({
  padding: '20px',
  margin: '20px 0',
  '& .header-container': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  '& .title': {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333'
  }
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  padding: '12px 16px',
  '&.header': {
    backgroundColor: '#6F67B6',
    color: 'white',
    fontSize: '0.9rem'
  }
}));

const StyledTableRow = styled(TableRow)({
  '&:nth-of-type(odd)': {
    backgroundColor: '#f5f5f5',
  },
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
});

const ActionButton = styled(IconButton)({
  padding: '8px',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
});

const CreateButton = styled(Button)({
  backgroundColor: '#6F67B6',
  color: 'white',
  '&:hover': {
    backgroundColor: '#5a5494',
  },
  padding: '8px 16px',
  borderRadius: '8px',
});

const StatusIcon = styled(CheckCircleIcon)({
  color: '#4CAF50',
  fontSize: '1.5rem'
});

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user',
    email: ''
  });
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching users with token:', token);

      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      console.log('Fetched users:', data);
      setUsers(data.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchUsers();
    // Refresh users list every 10 seconds
    const interval = setInterval(fetchUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateUser = async () => {
    try {
      setError('');
      
      // Validate required fields
      if (!newUser.username || !newUser.password || !newUser.name || !newUser.role) {
        setError('Please fill in all required fields');
        return;
      }

      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newUser)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      // Clear form and close dialog
      setNewUser({
        username: '',
        password: '',
        name: '',
        role: 'user',
        email: ''
      });
      setOpenDialog(false);
      setError('');
      
      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      setError(error.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete user');
      }

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.message);
    }
  };

  return (
    <Container elevation={2}>
      <Box className="header-container">
        <Typography className="title">Manage Users</Typography>
        <CreateButton
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Create New User
        </CreateButton>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell className="header">Name</StyledTableCell>
              <StyledTableCell className="header">Username</StyledTableCell>
              <StyledTableCell className="header">Role</StyledTableCell>
              <StyledTableCell className="header">Email</StyledTableCell>
              <StyledTableCell className="header">Status</StyledTableCell>
              <StyledTableCell className="header">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <StyledTableRow key={user._id}>
                <StyledTableCell>{user.name}</StyledTableCell>
                <StyledTableCell>{user.username}</StyledTableCell>
                <StyledTableCell>{user.role}</StyledTableCell>
                <StyledTableCell>{user.email || '--'}</StyledTableCell>
                <StyledTableCell>
                  {user.active ? (
                    <StatusIcon titleAccess="Active" />
                  ) : (
                    <CancelIcon color="error" titleAccess="Inactive" />
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  <ActionButton
                    onClick={() => handleDelete(user._id)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </ActionButton>
                </StyledTableCell>
              </StyledTableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <TextField
              label="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
            <TextField
              label="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              required
            />
            <TextField
              label="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
            <TextField
              select
              label="Role"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              required
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="ssm">SSM</MenuItem>
              <MenuItem value="gm">GM</MenuItem>
            </TextField>
            <TextField
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateUser} 
            variant="contained"
            sx={{ backgroundColor: '#6F67B6' }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageUsers; 