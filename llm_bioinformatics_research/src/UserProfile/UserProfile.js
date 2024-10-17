import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, TextField, MenuItem, Select, FormControl, InputLabel, AppBar, Toolbar, Avatar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { ManageAccounts, Settings, Logout } from '@mui/icons-material';
import blue from '@mui/material/colors/blue';
import './UserProfile.css';

const UserProfile = () => {
  const [section, setSection] = useState('profile'); // Default section is set to 'profile'
  const [user, setUser] = useState({
    image: '',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    location: 'New York, USA',
    theme: 'light',
    language: 'en'
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, image: reader.result }); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    navigate('/login'); // Placeholder for actual logout logic
  };

  return (
    <Box className="userProfile-container">
      <AppBar position="static" className="appBar">
        <Toolbar>
          <Typography variant="h4" className="title">
            User Profile
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/home')}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box className="button-section">

        <Button
          onClick={() => setSection('profile')}
          sx={{
            color: section === 'profile' ? 'white' : 'black',
            backgroundColor: section === 'profile' ? blue[500] : 'transparent',
            '&:hover': {
              backgroundColor: section === 'profile' ? blue[700] : 'lightgray',
            },
          }}
        >
          <ManageAccounts /> MyProfile
        </Button>

        <Button
          onClick={() => setSection('settings')}
          sx={{
            color: section === 'settings' ? 'white' : 'black',
            backgroundColor: section === 'settings' ? blue[500] : 'transparent',
            '&:hover': {
              backgroundColor: section === 'settings' ? blue[700] : 'lightgray',
            },
          }}
        >
          <Settings /> Settings
        </Button>

        <Button
          onClick={handleLogout}
          sx={{
            color: 'black','&:hover': {
            backgroundColor: 'lightgray',
            },
          }}
        >
          <Logout /> Logout
        </Button>
      </Box>

      {section === 'profile' && (
        <Box className="profile-section">
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              alt="User Image"
              src={user.image} 
              sx={{ width: '15vh', height: '15vh', mr: 2 }}
            />
            <IconButton
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'white',
                borderRadius: '50%',
                '&:hover': {
                  bgcolor: 'lightgray',
                },
                border: '1px solid black',
                width: '5vh',
                height: '5vh',
              }}
              component="label"
            >
              <EditIcon />
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </IconButton>
          </Box>

          <TextField
            label="Name"
            name="name"
            value={user.name}
            onChange={handleInputChange}
            className="input-field"
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            value={user.email}
            onChange={handleInputChange}
            className="input-field"
            margin="normal"
          />
          <TextField
            label="Phone Number"
            name="phone"
            value={user.phone}
            onChange={handleInputChange}
            className="input-field"
            margin="normal"
          />
          <TextField
            label="Location"
            name="location"
            value={user.location}
            onChange={handleInputChange}
            className="input-field"
            margin="normal"
          />
        </Box>
      )}

      {section === 'settings' && (
        <Box className="settings-section">
          <FormControl className="input-field" margin="normal">
            <InputLabel>Theme</InputLabel>
            <Select
              name="theme"
              value={user.theme}
              onChange={handleInputChange}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="system">System Default</MenuItem>
            </Select>
          </FormControl>
          <FormControl className="input-field" margin="normal">
            <InputLabel>Language</InputLabel>
            <Select
              name="language"
              value={user.language}
              onChange={handleInputChange}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
              <MenuItem value="fr">French</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}
    </Box>
  );
};

export default UserProfile;
