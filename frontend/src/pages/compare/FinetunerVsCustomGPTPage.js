import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Rating,
  useTheme,
  alpha,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PageTransition from '../../components/common/PageTransition';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import SEOHead from '../../components/common/SEOHead';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Section Hero
const HeroSection = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 12, md: 16 },
        pb: { xs: 8, md: 12 },
        background: `linear-gradient(135deg, ${alpha('#84fab0', 0.1)} 0%, ${alpha('#8fd3f4', 0.1)} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={8}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <Typography
                  component="h1"
                  variant="h2"
                  sx={{
                    fontWeight: 900,
                    mb: 3,
                    background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                  }}
                >
                  Finetuner vs CustomGPT.ai
                  <br />
                  <Box component="span" sx={{ fontSize: '0.8em', fontWeight: 700 }}>
                    Complete Deep Dive
                  </Box>
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    color: alpha(theme.palette.text.secondary, 0.9),
                    lineHeight: 1.6,
                    maxWidth: '90%',
                  }}
                >
                  Compare dataset size limits, output quality, pricing models, and ease of use to make the right choice for your custom GPT needs.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                  <Chip label="Dataset Size" color="primary" variant="outlined" />
                  <Chip label="Output Quality" color="primary" variant="outlined" />
                  <Chip label="Cost Analysis" color="primary" variant="outlined" />
                  <Chip label="No-Code Builder" color="primary" variant="outlined" />
                </Box>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="large"
                    startIcon={<RocketLaunchIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                    }}
                  >
                    Try Finetuner Free
                  </Button>
                  <Button
                    href="#comparison-table"
                    variant="outlined"
                    size="large"
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                    }}
                  >
                    View Comparison
                  </Button>
                </Box>
              </motion.div>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    p: 3,
                    borderRadius: 4,
                    background: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}`,
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: '#84fab0',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        mb: 1,
                        mx: 'auto',
                      }}
                    >
                      FT
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Finetuner
                    </Typography>
                  </Box>
                  
                  <Typography variant="h4" sx={{ color: 'text.secondary', mx: 2 }}>
                    VS
                  </Typography>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: '#ff6b6b',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        mb: 1,
                        mx: 'auto',
                      }}
                    >
                      CGP
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      CustomGPT.ai
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Section aperçu rapide
const QuickOverviewSection = () => {
  const theme = useTheme();

  const comparison = [
    {
      feature: 'Dataset Size Limit',
      finetuner: 'Unlimited',
      customgpt: '100MB per bot',
      winner: 'finetuner',
    },
    {
      feature: 'Training Data Quality',
      finetuner: 'Professional curation',
      customgpt: 'Basic processing',
      winner: 'finetuner',
    },
    {
      feature: 'Model Ownership',
      finetuner: 'You own the model',
      customgpt: 'Platform-hosted',
      winner: 'finetuner',
    },
    {
      feature: 'Setup Time',
      finetuner: '10-15 minutes',
      customgpt: '5 minutes',
      winner: 'customgpt',
    },
    {
      feature: 'Cost per 1K tokens',
      finetuner: '$0.008',
      customgpt: '$0.02+',
      winner: 'finetuner',
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
      <Container maxWidth="lg">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, threshold: 0.2 }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 800,
                textAlign: 'center',
                mb: 2,
                background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Quick Overview
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                color: alpha(theme.palette.text.secondary, 0.8),
                mb: 6,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Key differences at a glance to help you decide quickly
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Grid container spacing={2}>
              {comparison.map((item, index) => (
                <Grid item xs={12} key={index}>
                  <Card
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      background: alpha(theme.palette.background.paper, 0.7),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                  >
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {item.feature}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: item.winner === 'finetuner' 
                              ? alpha('#84fab0', 0.1) 
                              : alpha(theme.palette.background.default, 0.5),
                            border: item.winner === 'finetuner' 
                              ? `2px solid #84fab0` 
                              : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                          }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 600, textAlign: 'center' }}>
                            {item.finetuner}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: item.winner === 'customgpt' 
                              ? alpha('#ff6b6b', 0.1) 
                              : alpha(theme.palette.background.default, 0.5),
                            border: item.winner === 'customgpt' 
                              ? `2px solid #ff6b6b` 
                              : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                          }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 600, textAlign: 'center' }}>
                            {item.customgpt}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={3} sx={{ textAlign: 'center' }}>
                        {item.winner === 'finetuner' ? (
                          <Chip 
                            label="Finetuner Wins" 
                            color="success" 
                            sx={{ fontWeight: 600 }}
                          />
                        ) : (
                          <Chip 
                            label="CustomGPT Wins" 
                            sx={{ 
                              bgcolor: '#ff6b6b', 
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

// Section CTA
const CTASection = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(135deg, ${alpha('#84fab0', 0.1)} 0%, ${alpha('#8fd3f4', 0.1)} 100%)`,
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, threshold: 0.2 }}
          variants={containerVariants}
        >
          <Box sx={{ textAlign: 'center' }}>
            <motion.div variants={itemVariants}>
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Ready to Build Your Custom AI?
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  color: alpha(theme.palette.text.secondary, 0.8),
                  maxWidth: 600,
                  mx: 'auto',
                }}
              >
                Join thousands of businesses using Finetuner to create powerful, cost-effective AI solutions with unlimited data and superior quality.
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                size="large"
                startIcon={<RocketLaunchIcon />}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #6fd99a 0%, #7bc3e8 100%)',
                  },
                }}
              >
                Start Free Trial
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
                No credit card required • Setup in 10 minutes
              </Typography>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

const FinetunerVsCustomGPTPage = () => {
  const theme = useTheme();

  useEffect(() => {
    // SEO meta tags dynamiques
    const updateMetaTag = (name, content, property = false) => {
      const attributeName = property ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attributeName}="${name}"]`);
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attributeName, name);
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('content', content);
    };

    // Meta tags principaux
    document.title = 'Finetuner vs CustomGPT.ai — Deep Dive | FineTuner';
    updateMetaTag('description', 'Compare dataset size, output quality & costs between Finetuner and CustomGPT.ai.');
    updateMetaTag('keywords', 'finetuner vs customgpt, custom gpt builder, no-code, comparison, dataset size, output quality, pricing');

    // Open Graph tags
    updateMetaTag('og:title', 'Finetuner vs CustomGPT.ai — Deep Dive', true);
    updateMetaTag('og:description', 'Compare dataset size, output quality & costs between Finetuner and CustomGPT.ai.', true);
    updateMetaTag('og:type', 'article', true);
    updateMetaTag('og:url', `${window.location.origin}/compare/finetuner-vs-customgpt`, true);
    updateMetaTag('og:image', `${window.location.origin}/assets/images/compare-finetuner-customgpt-og.jpg`, true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', 'Finetuner vs CustomGPT.ai — Deep Dive');
    updateMetaTag('twitter:description', 'Compare dataset size, output quality & costs between Finetuner and CustomGPT.ai.');
    updateMetaTag('twitter:image', `${window.location.origin}/assets/images/compare-finetuner-customgpt-twitter.jpg`);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}/compare/finetuner-vs-customgpt`;

    // Structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Finetuner vs CustomGPT.ai — Deep Dive",
      "description": "Compare dataset size, output quality & costs between Finetuner and CustomGPT.ai.",
      "url": `${window.location.origin}/compare/finetuner-vs-customgpt`,
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": window.location.origin
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Compare",
            "item": `${window.location.origin}/compare`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Finetuner vs CustomGPT.ai"
          }
        ]
      }
    };

    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);

  }, []);

  return (
    <PageTransition>
      <SEOHead path="/compare/finetuner-vs-customgpt" />
      <Box sx={{ minHeight: '100vh' }}>
        <Navbar />
        <HeroSection />
        <QuickOverviewSection />
        <CTASection />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default FinetunerVsCustomGPTPage; 