import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  styled
} from '@mui/material';
import axios from 'axios';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const ReportContainer = styled(Paper)(({ theme }) => ({
  padding: '30px',
  margin: '20px 0',
  '& .report-title': {
    color: '#333',
    marginBottom: '30px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'center'
  }
}));

const StatsCard = styled(Card)(({ color }) => ({
  height: '100%',
  '& .MuiCardContent-root': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  '& .icon': {
    fontSize: '48px',
    color: color,
    marginBottom: '10px'
  },
  '& .stat-value': {
    fontSize: '24px',
    fontWeight: 'bold',
    color: color
  },
  '& .stat-label': {
    color: '#666',
    marginTop: '5px'
  }
}));

const TableTitle = styled(Typography)({
  fontSize: '1.2rem',
  fontWeight: 'bold',
  marginTop: '30px',
  marginBottom: '15px',
  color: '#333'
});

const Reports = () => {
  const [stats, setStats] = useState({
    totalLetters: 0,
    pendingLetters: 0,
    closedLetters: 0,
    averageResponseTime: 0
  });
  const [recentLetters, setRecentLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const [statsResponse, lettersResponse] = await Promise.all([
        axios.get('/api/letters/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/letters/recent', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsResponse.data);
      setRecentLetters(lettersResponse.data.letters || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <ReportContainer elevation={2}>
      <Typography className="report-title">Reports & Analytics</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#6F67B6">
            <CardContent>
              <EmailIcon className="icon" />
              <Typography className="stat-value">{stats.totalLetters}</Typography>
              <Typography className="stat-label">Total Letters</Typography>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#ff9800">
            <CardContent>
              <PendingIcon className="icon" />
              <Typography className="stat-value">{stats.pendingLetters}</Typography>
              <Typography className="stat-label">Pending Letters</Typography>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#4caf50">
            <CardContent>
              <CheckCircleIcon className="icon" />
              <Typography className="stat-value">{stats.closedLetters}</Typography>
              <Typography className="stat-label">Closed Letters</Typography>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#2196f3">
            <CardContent>
              <AccessTimeIcon className="icon" />
              <Typography className="stat-value">{stats.averageResponseTime}</Typography>
              <Typography className="stat-label">Avg. Response Time (days)</Typography>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      <TableTitle>Recent Letters</TableTitle>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reference</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentLetters.map((letter) => (
              <TableRow key={letter._id}>
                <TableCell>{letter.reference}</TableCell>
                <TableCell>{letter.title}</TableCell>
                <TableCell>{letter.createdBy?.username || 'Unknown'}</TableCell>
                <TableCell>{formatDate(letter.date)}</TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      color: letter.status === 'closed' ? '#4caf50' : '#ff9800',
                      fontWeight: 500
                    }}
                  >
                    {letter.status === 'closed' ? 'Closed' : 'Pending'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {recentLetters.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No recent letters found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </ReportContainer>
  );
};

export default Reports; 