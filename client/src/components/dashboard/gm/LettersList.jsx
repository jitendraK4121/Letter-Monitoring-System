import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import LetterDetailsSidebar from './LetterDetailsSidebar';
import debounce from 'lodash/debounce';

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

const StatsContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'space-around',
  marginBottom: '20px',
  gap: '20px'
});

const StatBox = styled(Paper)({
  padding: '15px',
  textAlign: 'center',
  flex: 1,
  backgroundColor: '#f5f5f5',
  '& .stat-number': {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#6F67B6'
  },
  '& .stat-label': {
    fontSize: '14px',
    color: '#666'
  }
});

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
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalStats, setTotalStats] = useState({ total: 0, closed: 0 });

  // Memoize filtered letters to prevent unnecessary recalculations
  const filteredLetters = useMemo(() => {
    return letters.filter(letter => 
      letter.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.createdBy?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
      
      // Calculate stats and filter in one pass
      const allLetters = data.data.letters;
      const totalClosed = allLetters.reduce((count, letter) => 
        letter.status === 'closed' ? count + 1 : count, 0);
      
      setTotalStats({
        total: allLetters.length,
        closed: totalClosed
      });

      // Filter based on type
      const relevantLetters = allLetters.filter(letter => 
        type === 'inbox' 
          ? (letter.status === 'pending' || !letter.status)
          : letter.status === 'closed'
      );

      setLetters(relevantLetters);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching letters:', error);
      setError('Failed to fetch letters. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
    // Reduced polling frequency to 1 minute for better performance
    const interval = setInterval(fetchLetters, 60000);
    return () => clearInterval(interval);
  }, [type]);

  // Debounced search handler
  const debouncedSetSearchTerm = useMemo(
    () => debounce((value) => setSearchTerm(value), 300),
    []
  );

  const handleSearch = (event) => {
    debouncedSetSearchTerm(event.target.value);
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

  const handleRowClick = (letter) => {
    setSelectedLetter(letter);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedLetter(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Container>
      <Typography className="title">
          {type === 'inbox' ? 'Inbox' : 'Closed Letters'}
      </Typography>

        <StatsContainer>
          <StatBox>
            <Typography className="stat-number">{totalStats.total}</Typography>
            <Typography className="stat-label">Total Letters</Typography>
          </StatBox>
          <StatBox>
            <Typography className="stat-number">{totalStats.closed}</Typography>
            <Typography className="stat-label">Closed Letters</Typography>
          </StatBox>
        </StatsContainer>

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
              )
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
              Close Selected
          </Button>
        )}
      </SearchContainer>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
                  <StyledTableCell className="header" padding="checkbox">
                <Checkbox
                  indeterminate={selectedLetters.length > 0 && selectedLetters.length < filteredLetters.length}
                      checked={selectedLetters.length > 0 && selectedLetters.length === filteredLetters.length}
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
                hover
                onClick={() => handleRowClick(letter)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedLetters.includes(letter._id)}
                    onChange={() => handleSelectLetter(letter._id)}
                  />
                </TableCell>
                <TableCell>{letter.reference}</TableCell>
                <TableCell>{letter.title}</TableCell>
                    <TableCell>{letter.createdBy?.username}</TableCell>
                <TableCell>{formatDate(letter.date)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
        )}
      </Container>

      <LetterDetailsSidebar
        open={sidebarOpen}
        onClose={handleCloseSidebar}
        letter={selectedLetter}
        onUpdate={fetchLetters}
      />
    </Box>
  );
};

export default LettersList; 