import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Drawer,
  styled,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  Link
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { API_URL } from '../../../config';

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: '400px',
  padding: '20px',
  '& .header': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  '& .title': {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    color: '#333'
  }
}));

const DetailRow = styled(Box)({
  marginBottom: '15px',
  '& .label': {
    fontWeight: 'bold',
    color: '#666',
    marginBottom: '4px'
  },
  '& .value': {
    color: '#333'
  }
});

const RemarkBox = styled(Box)({
  marginTop: '20px',
  '& .MuiTextField-root': {
    marginBottom: '10px'
  }
});

const MarkToContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '15px',
  '& .MuiFormControl-root': {
    flex: 1
  }
});

const StyledSelect = styled(Select)({
  backgroundColor: '#007bff',
  color: 'white',
  '& .MuiSelect-select': {
    padding: '8px 14px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#007bff',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#0056b3',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#0056b3',
  },
  '& .MuiSelect-icon': {
    color: 'white',
  }
});

const SubmitButton = styled(Button)({
  backgroundColor: '#6F67B6',
  color: 'white',
  '&:hover': {
    backgroundColor: '#5a5494',
  }
});

const LetterDetailsSidebar = ({ open, onClose, letter, onUpdate }) => {
  const [remark, setRemark] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    if (users.length > 0) return; // Don't fetch if we already have users
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      console.log('Users API response:', data); // Debug log
      
      if (data.status === 'success' && Array.isArray(data.data?.users)) {
        // Only get regular users
        const regularUsers = data.data.users;
        console.log('Regular users:', regularUsers); // Debug log
        setUsers(regularUsers);
      } else {
        console.error('Invalid API response format:', data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkToSubmit = async () => {
    if (isSubmitting || selectedUsers.length === 0) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/letters/${letter._id}/mark-to`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ users: selectedUsers })
      });

      if (!response.ok) throw new Error('Failed to mark users');

      const data = await response.json();
      console.log('Mark to response:', data);

      // Clear selection
      setSelectedUsers([]);
      
      // Call the onUpdate callback to refresh the letter list
      if (onUpdate) {
        onUpdate();
      }

      // Show success message
      alert('Users marked successfully');
    } catch (error) {
      console.error('Error marking users:', error);
      alert('Failed to mark users. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendRemark = async () => {
    if (!remark.trim()) return;

    try {
      const response = await fetch(`${API_URL}/letters/${letter._id}/remark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ remark })
      });

      if (!response.ok) {
        throw new Error('Failed to send remark');
      }

      // Clear the remark field after successful submission
      setRemark('');
      // You might want to refresh the letter details here
    } catch (error) {
      console.error('Error sending remark:', error);
      // Handle error (show message to user)
    }
  };

  // Reset selected users when letter changes
  useEffect(() => {
    setSelectedUsers([]);
  }, [letter?._id]);

  if (!letter) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
    >
      <SidebarContainer>
        <Box className="header">
          <Typography className="title">Letter Details</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DetailRow>
          <Typography className="label">Letter ID</Typography>
          <Typography className="value">{letter.reference}</Typography>
        </DetailRow>

        <DetailRow>
          <Typography className="label">Office Dak Receipt No</Typography>
          <Typography className="value">{letter.dakReceiptNo || 'N/A'}</Typography>
        </DetailRow>

        <DetailRow>
          <Typography className="label">RB Letter No</Typography>
          <Typography className="value">{letter.rbLetterNo || 'N/A'}</Typography>
        </DetailRow>

        <DetailRow>
          <Typography className="label">RB Letter Date</Typography>
          <Typography className="value">
            {letter.rbLetterDate ? new Date(letter.rbLetterDate).toLocaleDateString() : 'N/A'}
          </Typography>
        </DetailRow>

        <DetailRow>
          <Typography className="label">Received From</Typography>
          <Typography className="value">{letter.createdBy?.username || 'Unknown'}</Typography>
        </DetailRow>

        <DetailRow>
          <Typography className="label">Receiving Date</Typography>
          <Typography className="value">
            {letter.date ? new Date(letter.date).toLocaleDateString() : 'N/A'}
          </Typography>
        </DetailRow>

        <MarkToContainer>
          <Typography className="label" style={{ minWidth: '80px' }}>Mark To:</Typography>
          <FormControl fullWidth>
            <StyledSelect
              multiple
              value={selectedUsers}
              onChange={(e) => setSelectedUsers(e.target.value)}
              onOpen={() => {
                console.log('Dropdown opened - fetching users');
                fetchUsers();
              }}
              input={<OutlinedInput />}
              renderValue={(selected) => {
                if (loading) return 'Loading users...';
                const selectedUsernames = selected.map(userId => 
                  users.find(user => user._id === userId)?.username
                ).filter(Boolean).join(', ');
                return selectedUsernames || 'Select users';
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 224,
                    width: 250
                  }
                }
              }}
            >
              {loading ? (
                <MenuItem disabled>Loading users...</MenuItem>
              ) : users.length === 0 ? (
                <MenuItem disabled>No users available</MenuItem>
              ) : (
                users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.username} ({user.name})
                  </MenuItem>
                ))
              )}
            </StyledSelect>
          </FormControl>
          <SubmitButton
            variant="contained"
            onClick={handleMarkToSubmit}
            disabled={selectedUsers.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </SubmitButton>
        </MarkToContainer>

        <DetailRow>
          <Typography className="label">Document</Typography>
          <Typography className="value">
            {letter.attachments?.length > 0 ? (
              <Link 
                href={`${API_URL}/uploads/${letter.attachments[0]}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Document
              </Link>
            ) : 'No document attached'}
          </Typography>
        </DetailRow>

        <RemarkBox>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Write your remark..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSendRemark}
            fullWidth
            sx={{
              backgroundColor: '#6F67B6',
              '&:hover': { backgroundColor: '#5a5494' }
            }}
          >
            Send Remark
          </Button>
        </RemarkBox>
      </SidebarContainer>
    </Drawer>
  );
};

export default LetterDetailsSidebar; 