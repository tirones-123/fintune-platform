import React from 'react';
import { Box, Container, Grid, Link, Typography, IconButton, Divider } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';

const footerLinks = [
  {
    title: 'Produit',
    links: [
      { name: 'Fonctionnalités', href: '/#features' },
      { name: 'Tarifs', href: '/#pricing' },
      { name: 'Témoignages', href: '/#testimonials' },
      { name: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { name: 'Documentation', href: '/docs' },
      { name: 'Tutoriels', href: '/tutorials' },
      { name: 'Blog', href: '/blog' },
      { name: 'API', href: '/api' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { name: 'À propos', href: '/about' },
      { name: 'Carrières', href: '/careers' },
      { name: 'Contact', href: '/contact' },
      { name: 'Partenaires', href: '/partners' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { name: 'Conditions d\'utilisation', href: '/terms' },
      { name: 'Politique de confidentialité', href: '/privacy' },
      { name: 'Cookies', href: '/cookies' },
      { name: 'Mentions légales', href: '/legal' },
    ],
  },
];

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        py: 6,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                FinTune
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Plateforme de génération automatique de datasets pour fine-tuning de modèles d{"'"}IA.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  sx={{
                    color: '#1877F2',
                    '&:hover': { bgcolor: 'rgba(24, 119, 242, 0.1)' },
                  }}
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    color: '#1DA1F2',
                    '&:hover': { bgcolor: 'rgba(29, 161, 242, 0.1)' },
                  }}
                >
                  <TwitterIcon />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    color: '#0A66C2',
                    '&:hover': { bgcolor: 'rgba(10, 102, 194, 0.1)' },
                  }}
                >
                  <LinkedInIcon />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    color: '#E4405F',
                    '&:hover': { bgcolor: 'rgba(228, 64, 95, 0.1)' },
                  }}
                >
                  <InstagramIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>

          {footerLinks.map((section) => (
            <Grid item xs={6} sm={3} md={2} key={section.title}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {section.title}
              </Typography>
              <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                {section.links.map((link) => (
                  <Box component="li" key={link.name} sx={{ py: 0.5 }}>
                    <Link
                      href={link.href}
                      color="text.secondary"
                      sx={{
                        textDecoration: 'none',
                        '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                      }}
                    >
                      {link.name}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} FinTune. Tous droits réservés.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              justifyContent: 'center',
            }}
          >
            <Link href="#" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              Français
            </Link>
            <Link href="#" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              English
            </Link>
            <Link href="#" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              Español
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 