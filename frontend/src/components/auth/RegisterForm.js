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
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import { useTranslation, Trans } from 'react-i18next';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      terms: false,
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required(t('register.validation.nameRequired')),
      email: Yup.string()
        .email(t('register.validation.invalidEmail'))
        .required(t('register.validation.emailRequired')),
      password: Yup.string()
        .min(8, t('register.validation.passwordMinLength'))
        .required(t('register.validation.passwordRequired')),
      terms: Yup.boolean()
        .oneOf([true], t('register.validation.termsRequired'))
        .required(t('register.validation.termsRequired')),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setErrorMessage('');
        await register(values.email, values.password, values.name);
        setSuccessMessage(t('register.successMessage'));
        resetForm();
        // La redirection est gérée par la fonction register dans AuthContext
      } catch (error) {
        console.error('Register error:', error);
        setErrorMessage(t('register.error.generic', 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.'));
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
          {t('register.title')}
        </Typography>
        
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
          {t('register.subtitle')}
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
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
          {t('register.googleCta')}
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
              label={t('register.nameLabel')}
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />

            <TextField
              fullWidth
              label={t('register.emailLabel')}
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
              label={t('register.passwordLabel')}
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
                      aria-label={t('register.togglePasswordVisibility')}
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="terms"
                  checked={formik.values.terms}
                  onChange={formik.handleChange}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  <Trans
                    i18nKey="register.termsAcceptance"
                    components={{
                      0: <Link component={RouterLink} to="/terms-of-service" underline="hover" />, 
                      1: <Link component={RouterLink} to="/privacy-policy" underline="hover" />
                    }}
                  />
                </Typography>
              }
            />
            {formik.touched.terms && formik.errors.terms && (
              <Typography variant="caption" color="error">
                {formik.errors.terms}
              </Typography>
            )}
          </Stack>

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={formik.isSubmitting}
            sx={{ mt: 3, mb: 3, py: 1.5 }}
          >
            {t('register.submitButton')}
          </LoadingButton>

          <Typography variant="body2" align="center">
            {t('register.alreadyAccount')}{' '}
            <Link
              variant="subtitle2"
              component="span"
              onClick={() => navigate('/login')}
              sx={{ cursor: 'pointer' }}
            >
              {t('register.loginLink')}
            </Link>
          </Typography>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm; 