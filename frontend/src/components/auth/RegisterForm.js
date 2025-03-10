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
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      terms: false,
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required('Le nom est requis'),
      email: Yup.string()
        .email('Adresse email invalide')
        .required('L\'email est requis'),
      password: Yup.string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial'
        )
        .required('Le mot de passe est requis'),
      terms: Yup.boolean()
        .oneOf([true], 'Vous devez accepter les conditions d\'utilisation')
        .required('Vous devez accepter les conditions d\'utilisation'),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        await register(values.email, values.password, values.name);
        navigate('/dashboard');
      } catch (error) {
        console.error('Register error:', error);
        setErrors({ submit: error.message });
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
          Créer un compte
        </Typography>
        
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Rejoignez FinTune et commencez à créer vos datasets
        </Typography>

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
        >
          S'inscrire avec Google
        </Button>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OU
          </Typography>
        </Divider>

        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Nom complet"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />

            <TextField
              fullWidth
              label="Adresse email"
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
              label="Mot de passe"
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
                  J'accepte les{' '}
                  <Link href="#" underline="hover">
                    Conditions d{"'"}utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link href="#" underline="hover">
                    Politique de confidentialité
                  </Link>
                </Typography>
              }
            />
            {formik.touched.terms && formik.errors.terms && (
              <Typography variant="caption" color="error">
                {formik.errors.terms}
              </Typography>
            )}
          </Stack>

          {formik.errors.submit && (
            <Typography color="error" variant="body2" sx={{ mt: 2, mb: 2 }}>
              {formik.errors.submit}
            </Typography>
          )}

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={formik.isSubmitting}
            sx={{ mt: 3, mb: 3, py: 1.5 }}
          >
            Créer mon compte
          </LoadingButton>

          <Typography variant="body2" align="center">
            Vous avez déjà un compte?{' '}
            <Link
              variant="subtitle2"
              component="span"
              onClick={() => navigate('/login')}
              sx={{ cursor: 'pointer' }}
            >
              Se connecter
            </Link>
          </Typography>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm; 