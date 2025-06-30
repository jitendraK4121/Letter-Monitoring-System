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
  Checkbox,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  Alert,
  styled
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

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
  justifyContent: 'space-between',
  alignItems: 'center'
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [filteredLetters, setFilteredLetters] = useState([]);

  useEffect(() => {
    fetchLetters();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchLetters, 30000);
    return () => clearInterval(interval);
  }, [type]);

  useEffect(() => {
    const filtered = letters.filter(letter => 
      letter.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.createdBy?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLetters(filtered);
  }, [searchTerm, letters]);

  const fetchLetters = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/letters', {
        headers: {
          'Authorization': `Bearer ${token}`
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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching letters:', error);
      setError('Failed to fetch letters. Please try again later.');
      setLoading(false);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedLetters(filteredLetters.map(letter => letter._id));
    } else {
      setSelectedLetters([]);
    }
  };

  const handleSelectLetter = (letterId) => {
    setSelectedLetters(prev => {
      if (prev.includes(letterId)) {
        return prev.filter(id => id !== letterId);
      } else {
        return [...prev, letterId];
      }
    });
  };

  const handleCloseSelected = async () => {
    if (selectedLetters.length === 0) return;

    try {
      setError('');
      const token = localStorage.getItem('token');
      
      // Close all selected letters
      const closePromises = selectedLetters.map(letterId =>
        fetch(`http://localhost:5000/api/letters/${letterId}/close`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to close letter ${letterId}`);
          }
          return response.json();
        })
      );

      await Promise.all(closePromises);
      
      setSuccess(`Successfully closed ${selectedLetters.length} letter(s)`);
      setSelectedLetters([]);
      
      // Fetch letters again to update both inbox and closed lists
      fetchLetters();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error closing letters:', error);
      setError('Failed to close selected letters. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container elevation={2}>
      <Typography className="title">
        {type === 'inbox' ? 'Inbox Letters' : 'Closed Letters'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <SearchContainer>
        <TextField
          placeholder="Search letters..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: '300px' }}
        />
        {type === 'inbox' && selectedLetters.length > 0 && (
          <Button
            variant="contained"
            onClick={handleCloseSelected}
            sx={{
              backgroundColor: '#6F67B6',
              '&:hover': { backgroundColor: '#5a5494' }
            }}
          >
            Close Selected ({selectedLetters.length})
          </Button>
        )}
      </SearchContainer>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell padding="checkbox" className="header">
                <Checkbox
                  indeterminate={selectedLetters.length > 0 && selectedLetters.length < filteredLetters.length}
                  checked={filteredLetters.length > 0 && selectedLetters.length === filteredLetters.length}
                  onChange={handleSelectAll}
                />
              </StyledTableCell>
              <StyledTableCell className="header">Reference No.</StyledTableCell>
              <StyledTableCell className="header">Title</StyledTableCell>
              <StyledTableCell className="header">Created By</StyledTableCell>
              <StyledTableCell className="header">Date</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLetters.map((letter) => (
              <TableRow 
                key={letter._id}
                selected={selectedLetters.includes(letter._id)}
                hover
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedLetters.includes(letter._id)}
                    onChange={() => handleSelectLetter(letter._id)}
                  />
                </TableCell>
                <TableCell>{letter.reference}</TableCell>
                <TableCell>{letter.title}</TableCell>
                <TableCell>{letter.createdBy?.username || 'Unknown'}</TableCell>
                <TableCell>{formatDate(letter.date)}</TableCell>
              </TableRow>
            ))}
            {filteredLetters.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
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