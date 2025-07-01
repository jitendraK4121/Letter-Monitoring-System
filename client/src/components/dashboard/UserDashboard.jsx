import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Paper, List, ListItem, ListItemText, InputBase, IconButton, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InboxIcon from '@mui/icons-material/Inbox';
import LockResetIcon from '@mui/icons-material/LockReset';
import ChangePassword from './ChangePassword';

const DashboardContainer = styled(Box)({
  display: 'flex',
  minHeight: 'calc(100vh - 80px)', // Adjust for header height
  background: '#f0f2f5'
});

const Header = styled(Box)({
  background: '#6F67B6',
  color: 'white',
  padding: '10px 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  height: '80px',
  '& .railway-title': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& .hindi': {
      fontSize: '1.3rem',
      marginBottom: '4px',
      fontWeight: 500
    },
    '& .english': {
      fontSize: '1.4rem',
      fontWeight: 'bold'
    }
  }
});

const Sidebar = styled(Box)({
  width: '250px',
  background: '#6F67B6',
  color: 'white',
  height: '100%',
  '& .title': {
    padding: '15px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }
});

const SidebarItem = styled(Box)(({ active }) => ({
  padding: '15px 20px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: active ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)'
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.5rem'
  },
  '& .MuiTypography-root': {
    fontSize: '1rem',
    fontWeight: active ? 500 : 400
  }
}));

const MainContent = styled(Box)({
  flex: 1,
  padding: '20px',
  overflowY: 'auto'
});

const SearchBar = styled(Paper)({
  padding: '2px 4px',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  marginBottom: '20px',
  borderRadius: '20px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
});

const LetterList = styled(Paper)({
  width: '100%',
  marginTop: '20px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
});

const LetterItem = styled(ListItem)({
  padding: '12px 20px',
  borderBottom: '1px solid #eee',
  '&:hover': {
    backgroundColor: '#f5f5f5'
  },
  '& .MuiListItemText-primary': {
    fontWeight: 500,
    color: '#2c3e50'
  },
  '& .MuiListItemText-secondary': {
    color: '#7f8c8d'
  }
});

const LogoImage = styled('img')({
  height: '40px',
  width: '40px',
  objectFit: 'contain',
  borderRadius: '50%',
  padding: '2px',
  background: 'white'
});

const UserInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  '& .welcome-text': {
    fontFamily: '"Segoe UI", Arial, sans-serif',
    fontSize: '1.1rem',
    fontStyle: 'italic',
    color: 'white',
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
    textAlign: 'center',
    whiteSpace: 'nowrap'
  }
});

const UserAvatar = styled('div')({
  width: '45px',
  height: '45px',
  borderRadius: '50%',
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& img': {
    width: '100%',
    height: '100%',
    borderRadius: '50%'
  }
});

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [letters, setLetters] = useState([]);
  const username = localStorage.getItem('username');
  const userRole = localStorage.getItem('userRole');

  const fetchLetters = async () => {
    try {
      console.log('Fetching letters for user:', username, 'role:', userRole);
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
      setLetters(data.data.letters || []);
    } catch (error) {
      console.error('Error fetching letters:', error);
    }
  };

  // Fetch letters when component mounts and when activeTab changes to 'inbox'
  useEffect(() => {
    if (activeTab === 'inbox') {
      fetchLetters();
      // Set up auto-refresh every 5 seconds when in inbox
      const interval = setInterval(fetchLetters, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Also fetch when the component first mounts
  useEffect(() => {
    fetchLetters();
  }, []);

  const handleRefresh = () => {
    fetchLetters();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <SearchBar>
                <InputBase
                  sx={{ ml: 2, flex: 1 }}
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <IconButton sx={{ p: '10px' }}>
                  <SearchIcon />
                </IconButton>
              </SearchBar>
              <Button 
                variant="contained" 
                onClick={handleRefresh}
                sx={{ ml: 2, backgroundColor: '#6F67B6' }}
              >
                Refresh
              </Button>
            </Box>

            <LetterList>
              <List>
                {letters.length > 0 ? (
                  letters
                    .filter(letter => 
                      letter.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      letter.reference?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((letter) => (
                      <LetterItem key={letter._id} button>
                        <ListItemText
                          primary={letter.title}
                          secondary={`Reference: ${letter.reference} | Created by: ${letter.createdBy?.username || 'Unknown'} | Date: ${new Date(letter.date).toLocaleDateString()}`}
                        />
                      </LetterItem>
                    ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No letters found" />
                  </ListItem>
                )}
              </List>
            </LetterList>
          </>
        );
      case 'inbox':
        return (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <SearchBar>
                <InputBase
                  sx={{ ml: 2, flex: 1 }}
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <IconButton sx={{ p: '10px' }}>
                  <SearchIcon />
                </IconButton>
              </SearchBar>
              <Button 
                variant="contained" 
                onClick={handleRefresh}
                sx={{ ml: 2, backgroundColor: '#6F67B6' }}
              >
                Refresh
              </Button>
            </Box>

            <LetterList>
              <List>
                {letters.length > 0 ? (
                  letters
                    .filter(letter => 
                      letter.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      letter.reference?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((letter) => (
                      <LetterItem key={letter._id} button>
                        <ListItemText
                          primary={letter.title}
                          secondary={`Reference: ${letter.reference} | Created by: ${letter.createdBy?.username || 'Unknown'} | Date: ${new Date(letter.date).toLocaleDateString()}`}
                        />
                      </LetterItem>
                    ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No letters found" />
                  </ListItem>
                )}
              </List>
            </LetterList>
          </>
        );
      case 'changePassword':
        return <ChangePassword />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LogoImage 
            src="https://images.seeklogo.com/logo-png/61/1/indian-railways-logo-png_seeklogo-615883.png" 
            alt="Railway Logo"
          />
          <Typography variant="h6">Railway Board Letters</Typography>
        </Box>
        <Box className="railway-title">
          <Typography className="hindi">पूर्वी तट रेलवे</Typography>
          <Typography className="english">East Coast Railway</Typography>
        </Box>
        <UserInfo>
          <UserAvatar>
            <img 
              src="https://cdn-icons-png.flaticon.com/512/4128/4128176.png" 
              alt="User Avatar"
            />
          </UserAvatar>
          <Typography className="welcome-text">Welcome, Mr. {username}</Typography>
        </UserInfo>
      </Header>

      <DashboardContainer>
        <Sidebar>
          <SidebarItem 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
          >
            <DashboardIcon />
            <Typography>Dashboard</Typography>
          </SidebarItem>
          <SidebarItem 
            active={activeTab === 'inbox'} 
            onClick={() => setActiveTab('inbox')}
          >
            <InboxIcon />
            <Typography>Inbox {letters.length > 0 ? `(${letters.length})` : ''}</Typography>
          </SidebarItem>
          <SidebarItem 
            active={activeTab === 'changePassword'} 
            onClick={() => setActiveTab('changePassword')}
          >
            <LockResetIcon />
            <Typography>Change Password</Typography>
          </SidebarItem>
        </Sidebar>

        <MainContent>
          {renderContent()}
        </MainContent>
      </DashboardContainer>
    </Box>
  );
};

export default UserDashboard; 