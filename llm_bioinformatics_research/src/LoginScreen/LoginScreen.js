import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, IconButton, Link } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import config from './../config.json';
import './LoginScreen.css';

function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const port = config.port;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      setLoginError('Both email/username and password are required.');
      return;
    }

    try {
      const response = await fetch('http://localhost:' + port + '/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
        localStorage.setItem('authToken', data.token);
        navigate('/home');
      } else {
        setLoginError(data.message || 'Invalid email/username or password');
      }
    } catch (error) {
      console.error('Failed to login:', error);
      setLoginError('An error occurred while trying to log in. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm" className="login-container">
      <Box className="login-box">
        <Typography variant="h4" gutterBottom data-testid="login-heading">
          Login
        </Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            id="identifier"
            label="Email or Username"
            type="text"
            variant="outlined"
            fullWidth
            margin="normal"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            inputProps={{
              'data-testid': 'identifier-input',
            }}
          />
          <TextField
            id="password"
            label="Password"
            type={passwordVisible ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  edge="end"
                >
                  {passwordVisible ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
            inputProps={{
              'data-testid': 'password-input',
            }}
          />
          {loginError && (
            <Typography variant="body2" color="error" className="login-error" data-testid="login-error">
              {loginError}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="login-button"
            data-testid="login-button"
          >
            Login
          </Button>
          <Box className="login-links">
            <Link href="#" variant="body2">
              Forgot Password?
            </Link>
          </Box>
          <Box className="signup-link">
            <Link component={RouterLink} to="/signup" variant="body2">
              Sign Up
            </Link>
          </Box>
        </form>
      </Box>
    </Container>
  );
}

export default LoginScreen;