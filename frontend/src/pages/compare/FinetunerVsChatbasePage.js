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
import SpeedIcon from '@mui/icons-material/Speed';
import AccuracyIcon from '@mui/icons-material/GpsFixed';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
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
                  Finetuner vs Chatbase
                  <br />
                  <Box component="span" sx={{ fontSize: '0.8em', fontWeight: 700 }}>
                    Docs → Chatbot Platform Comparison
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
                  See which platform answers docs questions faster and more accurately. Compare response speed, answer quality, and setup complexity for your knowledge base.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                  <Chip label="Response Speed" color="primary" variant="outlined" />
                  <Chip label="Answer Accuracy" color="primary" variant="outlined" />
                  <Chip label="Knowledge Base" color="primary" variant="outlined" />
                  <Chip label="GPT-3.5 vs Fine-tuned" color="primary" variant="outlined" />
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
                  </Box>
                  
                  <Typography variant="h4" sx={{ color: 'text.secondary', mx: 2 }}>
                    VS
                  </Typography>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: '#ff9500',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        mb: 1,
                        mx: 'auto',
                      }}
                    >
                      CB
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Chatbase
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

// Section comparaison rapide
const QuickComparisonSection = () => {
  const theme = useTheme();

  const comparison = [
    {
      feature: 'Response Speed',
      finetuner: '~1.2s average',
      chatbase: '~2.8s average',
      winner: 'finetuner',
      icon: <SpeedIcon />,
    },
    {
      feature: 'Answer Accuracy',
      finetuner: '95% on domain docs',
      chatbase: '78% GPT-3.5 baseline',
      winner: 'finetuner',
      icon: <AccuracyIcon />,
    },
    {
      feature: 'Document Size Limit',
      finetuner: 'Unlimited',
      chatbase: '11M chars per bot',
      winner: 'finetuner',
      icon: <DataUsageIcon />,
    },
    {
      feature: 'Model Customization',
      finetuner: 'Full fine-tuning',
      chatbase: 'GPT-3.5 only',
      winner: 'finetuner',
      icon: <AutoAwesomeIcon />,
    },
    {
      feature: 'Setup Time',
      finetuner: '15 minutes',
      chatbase: '5 minutes',
      winner: 'chatbase',
      icon: <PlayArrowIcon />,
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
              Head-to-Head Comparison
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
              Key performance metrics for documentation-based chatbots
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
                            background: item.winner === 'chatbase' 
                              ? alpha('#ff9500', 0.15) 
                              : alpha(theme.palette.background.default, 0.5),
                            border: item.winner === 'chatbase' 
                              ? `2px solid #ff9500` 
                              : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {item.chatbase}
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
                            label="🏆 Chatbase Wins" 
                            sx={{ 
                              bgcolor: '#ff9500', 
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
                Build Faster, More Accurate Doc Bots
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
                Join companies getting 95% accuracy on domain-specific questions with fine-tuned models that respond 2x faster than GPT-3.5 baseline.
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
                Start Building Your Doc Bot
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
                Free trial • No credit card • 15-minute setup
              </Typography>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

const FinetunerVsChatbasePage = () => {
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
    document.title = 'Finetuner vs Chatbase (Docs → Chatbot) | FineTuner';
    updateMetaTag('description', 'See which platform answers docs questions faster and more accurately.');
    updateMetaTag('keywords', 'finetuner vs chatbase, knowledge base chat, gpt-3.5, documentation bot, accuracy, response speed');

    // Open Graph tags
    updateMetaTag('og:title', 'Finetuner vs Chatbase (Docs → Chatbot)', true);
    updateMetaTag('og:description', 'See which platform answers docs questions faster and more accurately.', true);
    updateMetaTag('og:type', 'article', true);
    updateMetaTag('og:url', `${window.location.origin}/compare/finetuner-vs-chatbase`, true);
    updateMetaTag('og:image', `${window.location.origin}/assets/images/compare-finetuner-chatbase-og.jpg`, true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', 'Finetuner vs Chatbase (Docs → Chatbot)');
    updateMetaTag('twitter:description', 'See which platform answers docs questions faster and more accurately.');
    updateMetaTag('twitter:image', `${window.location.origin}/assets/images/compare-finetuner-chatbase-twitter.jpg`);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}/compare/finetuner-vs-chatbase`;

    // Structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Finetuner vs Chatbase (Docs → Chatbot)",
      "description": "See which platform answers docs questions faster and more accurately.",
      "url": `${window.location.origin}/compare/finetuner-vs-chatbase`,
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
            "name": "Finetuner vs Chatbase"
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
      <SEOHead path="/compare/finetuner-vs-chatbase" />
      <Box sx={{ minHeight: '100vh' }}>
        <Navbar />
        <HeroSection />
        <QuickComparisonSection />
        <CTASection />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default FinetunerVsChatbasePage; 