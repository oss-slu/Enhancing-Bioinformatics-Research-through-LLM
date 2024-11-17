import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import config from '../../config.json';
import './ResetPassword.css';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const port = config.port;
  const token = searchParams.get("token");

  const validatePassword = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter.';
    if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter.';
    if (!/\d/.test(password)) return 'Password must include at least one number.';
    if (!/[@$!%*#?&]/.test(password)) return 'Password must include at least one special character.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages at the start of a new submission
    setMessage('');
    setError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validate password
    const passwordValidationError = validatePassword(newPassword);
    setPasswordError(passwordValidationError);
    if (passwordValidationError) return;

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    } else {
      setConfirmPasswordError('');
    }

    try {
      const response = await fetch(`http://localhost:${port}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      if (response.status === 200) {
        setMessage(data.message);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setError("Failed to reset password. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm" className="reset-container">
      <Box className="reset-box">
        <Typography variant="h4" className="reset-heading">
          Reset Password
        </Typography>
        <form onSubmit={handleSubmit} noValidate className="reset-form">
          <TextField
            label="New Password"
            type={passwordVisible ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
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
          />
          <TextField
            label="Confirm Password"
            type={confirmPasswordVisible ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!confirmPasswordError}
            helperText={confirmPasswordError}
            InputProps={{
              endAdornment: (
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  edge="end"
                >
                  {confirmPasswordVisible ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          <div className="message-space">
            {error && <Typography className="error-message">{error}</Typography>}
            {message && <Typography className="success-message">{message}</Typography>}
          </div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="reset-button"
          >
            Reset Password
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default ResetPassword;