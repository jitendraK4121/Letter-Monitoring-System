import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import CloseIcon from '@mui/icons-material/Close';
import LockResetIcon from '@mui/icons-material/LockReset';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LettersList from './gm/LettersList';

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

const LogoImage = styled('img')({
  height: '40px',
  width: '40px',
  objectFit: 'contain',
  borderRadius: '50%',
  padding: '2px',
  background: 'white'
});

const Sidebar = styled(Box)({
  width: '250px',
  background: '#6F67B6',
  color: 'white',
  height: '100%',
  position: 'sticky',
  top: 0,
  left: 0,
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
  overflowY: 'auto',
  background: '#ffffff',
  borderRadius: '8px',
  margin: '20px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
  background: '#B7D5F3',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  marginBottom: '4px',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    top: 0,
    left: 0
  }
});

const GMDashboard = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const username = localStorage.getItem('username');
  const userRole = localStorage.getItem('userRole');

  // Capitalize first letter of username for display
  const displayName = username ? username.charAt(0).toUpperCase() + username.slice(1) : '';
  const roleDisplay = `${displayName} (GM)`;

  const renderContent = () => {
    switch (activeTab) {
      case 'inbox':
        return <LettersList type="inbox" />;
      case 'closed':
        return <LettersList type="closed" />;
      case 'changePassword':
        return <div>Change Password Component</div>;
      case 'reports':
        return <div>Reports Component</div>;
      default:
        return <LettersList type="inbox" />;
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
              style={{ width: '100%', height: '100%', borderRadius: '50%' }}
            />
          </UserAvatar>
          <Typography className="welcome-text">Welcome, {roleDisplay}</Typography>
        </UserInfo>
      </Header>

      <DashboardContainer>
        <Sidebar>
          <SidebarItem 
            active={activeTab === 'inbox'} 
            onClick={() => setActiveTab('inbox')}
          >
            <InboxIcon />
            <Typography>Inbox</Typography>
          </SidebarItem>
          <SidebarItem 
            active={activeTab === 'closed'} 
            onClick={() => setActiveTab('closed')}
          >
            <CloseIcon />
            <Typography>Closed</Typography>
          </SidebarItem>
          <SidebarItem 
            active={activeTab === 'changePassword'} 
            onClick={() => setActiveTab('changePassword')}
          >
            <LockResetIcon />
            <Typography>Change Password</Typography>
          </SidebarItem>
          <SidebarItem 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')}
          >
            <AssessmentIcon />
            <Typography>Reports</Typography>
          </SidebarItem>
        </Sidebar>

        <MainContent>
          {renderContent()}
        </MainContent>
      </DashboardContainer>
    </Box>
  );
};

export default GMDashboard;