import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  Chip,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CostIcon from '@mui/icons-material/AttachMoney';
import ControlIcon from '@mui/icons-material/Settings';
import MaintenanceIcon from '@mui/icons-material/Build';
import CloudIcon from '@mui/icons-material/Cloud';
import CodeIcon from '@mui/icons-material/Code';
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
                  Finetuner vs Botpress KB
                  <br />
                  <Box component="span" sx={{ fontSize: '0.8em', fontWeight: 700 }}>
                    Open-Source vs Managed Platform
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
                  Evaluate cost, control and maintenance between Botpress Knowledge Base and Finetuner. Compare self-hosted complexity vs cloud simplicity.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                  <Chip label="Total Cost" color="primary" variant="outlined" />
                  <Chip label="Control Level" color="primary" variant="outlined" />
                  <Chip label="Maintenance" color="primary" variant="outlined" />
                  <Chip label="Open-Source vs Cloud" color="primary" variant="outlined" />
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
                    href="#comparison-details"
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
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Managed Cloud
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
                        bgcolor: '#5865F2',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        mb: 1,
                        mx: 'auto',
                      }}
                    >
                      BP
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Botpress
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Open-Source
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

// Section comparaison détaillée
const DetailedComparisonSection = () => {
  const theme = useTheme();

  const comparison = [
    {
      feature: 'Total Cost of Ownership',
      finetuner: '$29/month all-inclusive',
      botpress: '$500-2000/month (hosting + dev)',
      winner: 'finetuner',
      icon: <CostIcon />,
    },
    {
      feature: 'Setup & Deployment',
      finetuner: '10 minutes, zero DevOps',
      botpress: '2-5 days + infrastructure',
      winner: 'finetuner',
      icon: <CloudIcon />,
    },
    {
      feature: 'Code Control',
      finetuner: 'API access, limited custom',
      botpress: 'Full source code control',
      winner: 'botpress',
      icon: <ControlIcon />,
    },
    {
      feature: 'Maintenance Required',
      finetuner: 'Zero maintenance',
      botpress: 'Updates, security, scaling',
      winner: 'finetuner',
      icon: <MaintenanceIcon />,
    },
    {
      feature: 'Development Time',
      finetuner: '1 week to production',
      botpress: '4-12 weeks + custom dev',
      winner: 'finetuner',
      icon: <CodeIcon />,
    },
  ];

  return (
    <Box id="comparison-details" sx={{ py: { xs: 8, md: 12 }, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
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
              Cost, Control & Maintenance Analysis
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                color: alpha(theme.palette.text.secondary, 0.8),
                mb: 6,
                maxWidth: 700,
                mx: 'auto',
              }}
            >
              Complete breakdown of ownership costs, technical control, and ongoing maintenance requirements
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Grid container spacing={3}>
              {comparison.map((item, index) => (
                <Grid item xs={12} key={index}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: alpha(theme.palette.background.paper, 0.7),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 25px ${alpha(theme.palette.common.black, 0.15)}`,
                      },
                    }}
                  >
                    <Grid container alignItems="center" spacing={3}>
                      <Grid item xs={12} sm={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ color: '#84fab0' }}>{item.icon}</Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {item.feature}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: item.winner === 'finetuner' 
                              ? alpha('#84fab0', 0.15) 
                              : alpha(theme.palette.background.default, 0.5),
                            border: item.winner === 'finetuner' 
                              ? `2px solid #84fab0` 
                              : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {item.finetuner}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: item.winner === 'botpress' 
                              ? alpha('#5865F2', 0.15) 
                              : alpha(theme.palette.background.default, 0.5),
                            border: item.winner === 'botpress' 
                              ? `2px solid #5865F2` 
                              : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {item.botpress}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                        {item.winner === 'finetuner' ? (
                          <Chip 
                            label="🏆 Finetuner Wins" 
                            sx={{ 
                              bgcolor: '#84fab0', 
                              color: 'white',
                              fontWeight: 600,
                              px: 1,
                            }}
                          />
                        ) : (
                          <Chip 
                            label="🏆 Botpress Wins" 
                            sx={{ 
                              bgcolor: '#5865F2', 
                              color: 'white',
                              fontWeight: 600,
                              px: 1,
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
                Skip the DevOps, Focus on Business
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
                Get enterprise-grade knowledge base AI in production this week, not next quarter. Zero infrastructure headaches, zero maintenance costs.
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
                Launch Your KB Bot Today
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
                No servers to manage • Production-ready in 10 minutes
              </Typography>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

const FinetunerVsBotpressPage = () => {
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
    document.title = 'Finetuner vs Botpress KB | FineTuner';
    updateMetaTag('description', 'Evaluate cost, control and maintenance between Botpress Knowledge Base and Finetuner.');
    updateMetaTag('keywords', 'finetuner vs botpress, open-source bot, knowledge base, self-hosted, maintenance, devops');

    // Open Graph tags
    updateMetaTag('og:title', 'Finetuner vs Botpress KB', true);
    updateMetaTag('og:description', 'Evaluate cost, control and maintenance between Botpress Knowledge Base and Finetuner.', true);
    updateMetaTag('og:type', 'article', true);
    updateMetaTag('og:url', `${window.location.origin}/compare/finetuner-vs-botpress`, true);
    updateMetaTag('og:image', `${window.location.origin}/assets/images/compare-finetuner-botpress-og.jpg`, true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', 'Finetuner vs Botpress KB');
    updateMetaTag('twitter:description', 'Evaluate cost, control and maintenance between Botpress Knowledge Base and Finetuner.');
    updateMetaTag('twitter:image', `${window.location.origin}/assets/images/compare-finetuner-botpress-twitter.jpg`);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}/compare/finetuner-vs-botpress`;

    // Structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Finetuner vs Botpress KB",
      "description": "Evaluate cost, control and maintenance between Botpress Knowledge Base and Finetuner.",
      "url": `${window.location.origin}/compare/finetuner-vs-botpress`,
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
            "name": "Finetuner vs Botpress"
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
      <SEOHead path="/compare/finetuner-vs-botpress" />
      <Box sx={{ minHeight: '100vh' }}>
        <Navbar />
        <HeroSection />
        <DetailedComparisonSection />
        <CTASection />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default FinetunerVsBotpressPage; 