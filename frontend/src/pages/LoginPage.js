import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  const { t } = useTranslation();

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
            FineTuner
          </Typography>
        </Link>
        <Typography variant="body2">
          {t('loginPage.noAccountPrompt')} {' '}
          <Link component={RouterLink} to="/register" variant="subtitle2">
            {t('loginPage.registerLink')}
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
          {t('common.copyright', { year: new Date().getFullYear() })}
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage; 