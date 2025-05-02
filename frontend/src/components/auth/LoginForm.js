import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import { useTranslation } from 'react-i18next';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      remember: true,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email(t('login.validation.invalidEmail'))
        .required(t('login.validation.emailRequired')),
      password: Yup.string()
        .required(t('login.validation.passwordRequired')),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setErrorMessage('');
        await login(values.email, values.password);
        navigate('/dashboard');
      } catch (error) {
        console.error('Login error:', error);
        setErrorMessage(t('login.error.invalidCredentials', 'Identifiants incorrects. Veuillez réessayer.'));
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card sx={{ maxWidth: 480, mx: 'auto', boxShadow: 5 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {t('login.title')}
        </Typography>
        
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
          {t('login.subtitle')}
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <Button
          fullWidth
          size="large"
          color="inherit"
          variant="outlined"
          sx={{ 
            mb: 3,
            py: 1.5,
            borderColor: 'divider',
            '&:hover': { borderColor: 'primary.main' }
          }}
          startIcon={<GoogleIcon />}
          onClick={() => window.location.href = '/api/auth/google/login'}
        >
          {t('login.googleCta')}
        </Button>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {t('common.orDivider')}
          </Typography>
        </Divider>

        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label={t('login.emailLabel')}
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

            <TextField
              fullWidth
              label={t('login.passwordLabel')}
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={t('login.togglePasswordVisibility')}
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              my: 2,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  name="remember"
                  checked={formik.values.remember}
                  onChange={formik.handleChange}
                  color="primary"
                />
              }
              label={t('login.rememberMe')}
            />
            <Link
              href="#"
              variant="body2"
              color="primary"
              underline="hover"
              sx={{ cursor: 'pointer' }}
            >
              {t('login.forgotPassword')}
            </Link>
          </Box>

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={formik.isSubmitting}
            sx={{ mt: 2, mb: 3, py: 1.5 }}
          >
            {t('login.submitButton')}
          </LoadingButton>

          <Typography variant="body2" align="center">
            {t('login.noAccount')}{' '}
            <Link
              variant="subtitle2"
              component="span"
              onClick={() => navigate('/register')}
              sx={{ cursor: 'pointer' }}
            >
              {t('login.createAccountLink')}
            </Link>
          </Typography>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm; 