import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
      }}
    >
      <Box
        sx={{
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link component={RouterLink} to="/" underline="none">
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
            FinTune
          </Typography>
        </Link>
        <Typography variant="body2">
          Pas encore de compte?{' '}
          <Link component={RouterLink} to="/register" variant="subtitle2">
            S'inscrire
          </Link>
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ py: 10, flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <LoginForm />
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} FinTune. Tous droits réservés.
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage; 