import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  FormControlLabel,
  Checkbox,
  styled
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { enUS } from 'date-fns/locale';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: '30px',
  margin: '20px 0',
  '& .form-title': {
    color: '#333',
    marginBottom: '10px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  '& .mandatory-text': {
    color: '#ff1744',
    fontSize: '0.875rem',
    marginBottom: '30px',
    textAlign: 'right'
  }
}));

const FormRow = styled(Box)({
  display: 'flex',
  gap: '20px',
  marginBottom: '20px',
  '& > div': {
    flex: 1
  }
});

const UploadButton = styled(Button)({
  backgroundColor: '#6F67B6',
  color: 'white',
  padding: '10px 20px',
  '&:hover': {
    backgroundColor: '#5a5494',
  },
  '& .MuiSvgIcon-root': {
    marginRight: '8px'
  }
});

const ButtonContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '15px',
  marginTop: '30px'
});

const FilePreview = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginTop: '10px',
  padding: '8px',
  backgroundColor: '#f5f5f5',
  borderRadius: '4px',
  '& .file-name': {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }
});

const AddNewLetter = () => {
  const [formData, setFormData] = useState({
    officeDakReceiptNo: '',
    rbDoLetterNo: '',
    receivedFrom: '',
    isDoLetter: false,
    receivingDate: null,
    letterDate: null,
    letterSubject: '',
    file: null
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      file: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = {
        title: formData.letterSubject,
        reference: formData.rbDoLetterNo,
        content: `From: ${formData.receivedFrom}\nOffice Dak Receipt No: ${formData.officeDakReceiptNo}\nIs DO Letter: ${formData.isDoLetter ? 'Yes' : 'No'}`,
        date: formData.receivingDate,
        isPublic: true,
        dakReceiptNo: formData.officeDakReceiptNo,
        rbLetterNo: formData.rbDoLetterNo,
        rbLetterDate: formData.letterDate
      };

      // Create FormData for file upload if there's a file
      if (formData.file) {
        const fileData = new FormData();
        fileData.append('file', formData.file);
        // You'll need to implement file upload endpoint separately
        // await axios.post('/api/upload', fileData);
        
        formDataToSend.attachments = [{
          filename: formData.file.name,
          path: `/uploads/${formData.file.name}` // This should match your server's upload path
        }];
      }

      const response = await fetch('http://localhost:5000/api/letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formDataToSend)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create letter');
      }

      // Clear form after successful submission
      handleClear();
      
      // Show success message
      alert('Letter created successfully and distributed to all users');
    } catch (error) {
      console.error('Error creating letter:', error);
      alert(`Failed to create letter: ${error.message}`);
    }
  };

  const handleClear = () => {
    setFormData({
      officeDakReceiptNo: '',
      rbDoLetterNo: '',
      receivedFrom: '',
      isDoLetter: false,
      receivingDate: null,
      letterDate: null,
      letterSubject: '',
      file: null
    });
    // Also clear the file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
      <FormContainer elevation={2}>
        <Typography className="form-title">ADD NEW LETTER</Typography>
        <Typography className="mandatory-text">*Marked fields are mandatory.</Typography>
        
        <form onSubmit={handleSubmit}>
          <FormRow>
            <TextField
              required
              fullWidth
              label="OFFICE DAK RECEIPT NO."
              name="officeDakReceiptNo"
              value={formData.officeDakReceiptNo}
              onChange={handleInputChange}
              variant="outlined"
            />
            <DatePicker
              label="RECEIVING DATE"
              value={formData.receivingDate}
              onChange={(date) => handleDateChange('receivingDate', date)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  fullWidth
                  variant="outlined"
                />
              )}
            />
          </FormRow>

          <FormRow>
            <TextField
              required
              fullWidth
              label="RB D.O/LETTER NO."
              name="rbDoLetterNo"
              value={formData.rbDoLetterNo}
              onChange={handleInputChange}
              variant="outlined"
            />
            <DatePicker
              label="RB D.O/LETTER DATE"
              value={formData.letterDate}
              onChange={(date) => handleDateChange('letterDate', date)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  fullWidth
                  variant="outlined"
                />
              )}
            />
          </FormRow>

          <FormRow>
            <TextField
              required
              fullWidth
              label="RECEIVED FROM"
              name="receivedFrom"
              value={formData.receivedFrom}
              onChange={handleInputChange}
              variant="outlined"
            />
            <TextField
              required
              fullWidth
              label="LETTER SUBJECT"
              name="letterSubject"
              value={formData.letterSubject}
              onChange={handleInputChange}
              variant="outlined"
            />
          </FormRow>

          <FormRow>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isDoLetter}
                    onChange={handleInputChange}
                    name="isDoLetter"
                    color="primary"
                  />
                }
                label="IS DO LETTER"
              />
            </Box>
            <Box>
              <input
                accept="application/pdf"
                type="file"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <UploadButton
                  component="span"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                >
                  Upload PDF
                </UploadButton>
              </label>
              {formData.file && (
                <FilePreview>
                  <Typography className="file-name">
                    {formData.file.name}
                  </Typography>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, file: null }));
                      document.getElementById('file-upload').value = '';
                    }}
                  >
                    <DeleteIcon />
                  </Button>
                </FilePreview>
              )}
            </Box>
          </FormRow>

          <ButtonContainer>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClear}
              startIcon={<DeleteIcon />}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              startIcon={<SaveIcon />}
              sx={{ backgroundColor: '#6F67B6', '&:hover': { backgroundColor: '#5a5494' } }}
            >
              Submit
            </Button>
          </ButtonContainer>
        </form>
      </FormContainer>
    </LocalizationProvider>
  );
};

export default AddNewLetter; 