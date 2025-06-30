import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  styled
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';

const Container = styled(Paper)(({ theme }) => ({
  padding: '20px',
  margin: '20px 0',
  '& .title': {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#333'
  }
}));

const SearchContainer = styled(Box)({
  marginBottom: '20px',
  display: 'flex',
  justifyContent: 'flex-end'
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  padding: '12px 16px',
  '&.header': {
    backgroundColor: '#6F67B6',
    color: 'white',
    fontSize: '0.9rem'
  }
}));

const LettersList = ({ type }) => {
  const [letters, setLetters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLetters, setFilteredLetters] = useState([]);

  const fetchLetters = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/letters', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch letters');
      }

      const data = await response.json();
      console.log('Fetched letters:', data);
      
      // Filter based on type (inbox/closed)
      const relevantLetters = data.data.letters.filter(letter => {
        if (type === 'inbox') {
          return letter.status === 'pending' || !letter.status;
        } else {
          return letter.status === 'closed';
        }
      });

      setLetters(relevantLetters);
      setFilteredLetters(relevantLetters);
    } catch (error) {
      console.error('Error fetching letters:', error);
    }
  };

  useEffect(() => {
    fetchLetters();
    // Set up auto-refresh every 5 seconds
    const interval = setInterval(fetchLetters, 5000);
    return () => clearInterval(interval);
  }, [type]);

  useEffect(() => {
    const filtered = letters.filter(letter => 
      letter.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLetters(filtered);
  }, [searchTerm, letters]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleView = (letterId) => {
    // Implement view functionality
    console.log('Viewing letter:', letterId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Container elevation={2}>
      <Typography className="title">
        {type === 'inbox' ? 'Inbox' : 'Closed Letters'}
      </Typography>
      
      <SearchContainer>
        <TextField
          placeholder="Search letters..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: '300px' }}
        />
      </SearchContainer>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell className="header">Sl No.</StyledTableCell>
              <StyledTableCell className="header">Reference No.</StyledTableCell>
              <StyledTableCell className="header">Title</StyledTableCell>
              <StyledTableCell className="header">Created By</StyledTableCell>
              <StyledTableCell className="header">Date</StyledTableCell>
              <StyledTableCell className="header">Status</StyledTableCell>
              <StyledTableCell className="header">View</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLetters.map((letter, index) => (
              <TableRow key={letter._id}>
                <StyledTableCell>{index + 1}</StyledTableCell>
                <StyledTableCell>{letter.reference}</StyledTableCell>
                <StyledTableCell>{letter.title}</StyledTableCell>
                <StyledTableCell>{letter.createdBy?.username || 'Unknown'}</StyledTableCell>
                <StyledTableCell>{formatDate(letter.date)}</StyledTableCell>
                <StyledTableCell>{letter.status || 'pending'}</StyledTableCell>
                <StyledTableCell>
                  <IconButton
                    onClick={() => handleView(letter._id)}
                    color="primary"
                    size="small"
                  >
                    <VisibilityIcon />
                  </IconButton>
                </StyledTableCell>
              </TableRow>
            ))}
            {filteredLetters.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No letters found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default LettersList; 