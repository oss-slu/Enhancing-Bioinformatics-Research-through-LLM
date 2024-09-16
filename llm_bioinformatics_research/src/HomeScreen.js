import React from 'react';
import { Container, Box, Typography, Paper, TextField, AppBar, Toolbar, Button, Grid } from '@mui/material';
import { blue, grey } from '@mui/material/colors';

function HomeScreen() {
  return (
    <>
      <AppBar position="static" sx={{ bgcolor: blue[500] }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Better Bioinformatics
          </Typography>
          <Button sx={{ color: 'white' }}>Home</Button>
          <Button sx={{ color: 'white' }}>Guidelines</Button>
          <Button sx={{ color: 'white' }}>API documentation</Button>
          <Button sx={{ color: 'white' }}>User Profile</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3, mb: 10 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                height: '100%',
                bgcolor: grey[100],
                border: '1px solid',
                borderColor: grey[400],
              }}
            >
              <Typography variant="h6">Code Snippet (Input)</Typography>
              <TextField
                multiline
                fullWidth
                rows={10}
                placeholder="Enter code here..."
                variant="outlined"
                sx={{ mt: 2 }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                height: '100%',
                bgcolor: grey[100],
                border: '1px solid',
                borderColor: grey[400],
              }}
            >
              <Typography variant="h6">API Recommendation Panel</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} />

          <Grid item xs={12} sx={{ mt: 3 }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                minHeight: '300px',
                bgcolor: grey[100],
                border: '1px solid',
                borderColor: grey[400],
              }}
            >
              <Typography variant="h6">Error detection and Correction Panel</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Box
        component="footer"
        sx={{
          p: 2,
          bgcolor: grey[200],
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
      >
        <Typography>Footer</Typography>
      </Box>
    </>
  );
}

export default HomeScreen;
