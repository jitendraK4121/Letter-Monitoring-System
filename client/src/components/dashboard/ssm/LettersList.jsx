import React, { useState, useEffect, useMemo } from 'react';
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
  TextField,
  InputAdornment,
  styled
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { format } from 'date-fns';
import debounce from 'lodash/debounce';
import { API_URL } from '../../../config';

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
  const [totalStats, setTotalStats] = useState({ total: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Memoize filtered letters to prevent unnecessary recalculations
  const filteredLetters = useMemo(() => {
    return letters.filter(letter => 
      letter.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, letters]);

  const fetchLetters = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/letters`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch letters');
      }

      const data = await response.json();
      
      // Calculate stats and filter in one pass
      const allLetters = data.letters;
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

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
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

      <StatsContainer>
        <StatBox elevation={1}>
          <Typography className="stat-number">{totalStats.total}</Typography>
          <Typography className="stat-label">Total Letters</Typography>
        </StatBox>
        <StatBox elevation={1}>
          <Typography className="stat-number">{totalStats.closed}</Typography>
          <Typography className="stat-label">Closed Letters</Typography>
        </StatBox>
        <StatBox elevation={1}>
          <Typography className="stat-number">{totalStats.total - totalStats.closed}</Typography>
          <Typography className="stat-label">Pending Letters</Typography>
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
              </TableRow>
            ))}
            {filteredLetters.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
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