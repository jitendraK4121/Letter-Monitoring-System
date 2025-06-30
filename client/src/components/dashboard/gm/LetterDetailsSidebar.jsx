import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Drawer,
  styled
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

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

const LetterDetailsSidebar = ({ open, onClose, letter }) => {
  const [remark, setRemark] = useState('');

  const handleSendRemark = async () => {
    if (!remark.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/letters/${letter._id}/remark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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

        <DetailRow>
          <Typography className="label">Document</Typography>
          <Typography className="value">
            {letter.attachments?.length > 0 ? (
              <Button
                href={`http://localhost:5000/uploads/${letter.attachments[0]}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Document
              </Button>
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