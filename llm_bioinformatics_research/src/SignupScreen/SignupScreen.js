import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, IconButton, Link } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';

function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [retypePasswordVisible, setRetypePasswordVisible] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [retypePasswordError, setRetypePasswordError] = useState('');

  const [usernameTakenError, setUsernameTakenError] = useState('');
  const [emailTakenError, setEmailTakenError] = useState('');

  const navigate = useNavigate();

  const validateUsername = (username) => {
    if (!username) {
      setUsernameError('Username is required.');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const validateEmail = (email) => {
    if (!email) {
      setEmailError('Email is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must include at least one uppercase letter.');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setPasswordError('Password must include at least one lowercase letter.');
      return false;
    }
    if (!/\d/.test(password)) {
      setPasswordError('Password must include at least one number.');
      return false;
    }
    if (!/[@$!%*#?&]/.test(password)) {
      setPasswordError('Password must include at least one special character.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateRetypePassword = (password, retypePassword) => {
    if (password !== retypePassword) {
      setRetypePasswordError('Passwords do not match.');
      return false;
    }
    setRetypePasswordError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isUsernameValid = validateUsername(username);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isRetypePasswordValid = validateRetypePassword(password, retypePassword);

    if (isUsernameValid && isEmailValid && isPasswordValid && isRetypePasswordValid) {
      try {
        const response = await fetch('http://localhost:5001/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_name: username, email: email, password: password }),
        });

        const data = await response.json();

        if (response.status === 201) {
          setSignupSuccess(true);
          setTimeout(() => navigate('/login'), 5001); 
        } else if (response.status === 400) {
          if (data.message === "Username is already in use") {
            setUsernameTakenError("This username is already taken.");
          }
          if (data.message === "Email is already in use") {
            setEmailTakenError("This email is already in use.");
          }
        } else {
          console.error('Signup failed:', data.message);
        }

      } catch (error) {
        console.error('Failed to connect to the server:', error);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Typography id="signup-heading" variant="h4" gutterBottom data-testid="signup-heading">Sign Up</Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField 
            id="username" 
            label="Username" 
            type="text" 
            variant="outlined" 
            fullWidth 
            margin="normal"
            value={username} 
            onChange={(e) => { 
              setUsername(e.target.value);
              setUsernameTakenError(''); 
            }} 
            error={!!usernameError || !!usernameTakenError} 
            helperText={usernameError || usernameTakenError}
            inputProps={{
              'data-testid': 'username-input',
            }}
          />
          <TextField 
            id="email" 
            label="Email" 
            type="email" 
            variant="outlined" 
            fullWidth 
            margin="normal"
            value={email} 
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailTakenError(''); 
            }} 
            error={!!emailError || !!emailTakenError} 
            helperText={emailError || emailTakenError}
            inputProps={{
              'data-testid': 'email-input',
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
            error={!!passwordError} 
            helperText={passwordError}
            inputProps={{
              'data-testid': 'password-input',
            }}
            InputProps={{ 
              endAdornment: (
                <IconButton 
                  aria-label="toggle password visibility" 
                  onClick={() => setPasswordVisible(!passwordVisible)} 
                  edge="end"
                  data-testid="toggle-password-visibility"
                >
                  {passwordVisible ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )
            }}
          />
          <TextField 
            id="retypePassword" 
            label="Confirm Password" 
            type={retypePasswordVisible ? 'text' : 'password'} 
            variant="outlined" 
            fullWidth 
            margin="normal"
            value={retypePassword} 
            onChange={(e) => setRetypePassword(e.target.value)} 
            error={!!retypePasswordError} 
            helperText={retypePasswordError}
            inputProps={{
              'data-testid': 'retypePassword-input',
            }}
            InputProps={{ 
              endAdornment: (
                <IconButton 
                  aria-label="toggle retype password visibility" 
                  onClick={() => setRetypePasswordVisible(!retypePasswordVisible)} 
                  edge="end"
                  data-testid="toggle-retype-password-visibility"
                >
                  {retypePasswordVisible ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )
            }}
          />
          <Button 
            id="signup-button" 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            sx={{ mt: 2 }}
            data-testid="signup-button"
          >
            Sign Up
          </Button>
          {signupSuccess && (
            <Typography 
              variant="body1" 
              color="success.main" 
              sx={{ mt: 2 }}
              data-testid="signup-success-message"
            >
              Successfully signed up! You will be redirected to the login page in 5 seconds.
            </Typography>
          )}
        </form>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<GoogleIcon />}
              sx={{
                mb: 2,
                borderColor: '#db4437',
                color: '#db4437',
                borderRadius: '50px',
                padding: '10px 20px',
                textTransform: 'none',
              }}
            >
              Sign in with Google
            </Button>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<GitHubIcon />}
              sx={{
                borderColor: '#000',
                color: '#000',
                borderRadius: '50px',
                padding: '10px 20px',
                textTransform: 'none',
              }}
            >
              Sign in with GitHub
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Login
            </Link>
          </Box>
      </Box>
    </Container>
  );
}

export default SignUpScreen;
