import React, { useEffect } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Avatar, Stack, useTheme, alpha, Chip, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import PageTransition from '../../components/common/PageTransition';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import SEOHead from '../../components/common/SEOHead';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SpeedIcon from '@mui/icons-material/Speed';
import BrushIcon from '@mui/icons-material/Brush';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CreateIcon from '@mui/icons-material/Create';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';

// Animation variants
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

// Hero Section
const HeroSection = () => {
  const theme = useTheme();
  const controls = useAnimation();

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 12, md: 16 },
        pb: { xs: 8, md: 12 },
        background: `linear-gradient(180deg, ${alpha("#0a043c", 1)} 0%, ${alpha("#03001e", 1)} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial="hidden"
              animate={controls}
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <Chip
                  label="Brand Voice AI"
                  color="primary"
                  sx={{ mb: 3, fontWeight: 600 }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  component="h1"
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                    background: 'linear-gradient(145deg, #bf00ff, #00d4ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 3,
                  }}
                >
                  Brand-Voice Copy Generator
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                    lineHeight: 1.7,
                    color: alpha(theme.palette.text.secondary, 0.9),
                    mb: 4,
                  }}
                >
                  Instantly rewrite any text in <strong style={{ color: '#00d4ff' }}>your exact brand voice</strong>—no manual editing needed. Train AI on your style guide and content.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: '50px',
                    }}
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      borderRadius: '50px',
                    }}
                    onClick={() => document.getElementById('demo-section').scrollIntoView({ behavior: 'smooth' })}
                  >
                    See Live Demo
                  </Button>
                </Stack>
              </motion.div>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                height: { xs: 300, md: 400 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Box
                  sx={{
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <RecordVoiceOverIcon sx={{ fontSize: 120, color: '#00d4ff' }} />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: alpha('#bf00ff', 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CreateIcon sx={{ fontSize: 40, color: '#bf00ff' }} />
                  </Box>
                </Box>
              </motion.div>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Stats Section
const StatsSection = () => {
  const theme = useTheme();
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  const stats = [
    { value: '10x', label: 'Faster content creation', icon: <SpeedIcon /> },
    { value: '95%', label: 'Brand consistency accuracy', icon: <BrushIcon /> },
    { value: '70%', label: 'Reduction in content review time', icon: <AccessTimeIcon /> },
    { value: '300%', label: 'Increase in content output', icon: <TrendingUpIcon /> },
  ];

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 8, md: 12 },
        background: alpha(theme.palette.background.paper, 0.5),
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={controls}
                variants={{
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, delay: index * 0.1 },
                  },
                }}
              >
                <Card
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    background: alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// Benefits Section
const BenefitsSection = () => {
  const theme = useTheme();

  const benefits = [
    {
      title: 'Style guide automation',
      description: 'Train AI models on your brand guidelines, tone of voice documentation, and successful content examples.',
      icon: <BrushIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Instant content adaptation',
      description: 'Transform any text—emails, social posts, blogs, ads—into your signature brand voice with one click.',
      icon: <AutoFixHighIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Multi-channel consistency',
      description: 'Maintain consistent brand voice across all platforms: social media, email campaigns, website copy, and more.',
      icon: <IntegrationInstructionsIcon sx={{ fontSize: 40 }} />,
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontWeight: 800,
            textAlign: 'center',
            mb: 8,
            background: 'linear-gradient(145deg, #bf00ff, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Why choose AI-powered brand voice?
        </Typography>

        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 3 }}>
                  {benefit.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  {benefit.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {benefit.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// Demo Section
const DemoSection = () => {
  const theme = useTheme();

  const beforeAfterExamples = [
    {
      brand: 'Startup Tech Company',
      tone: 'Innovative & Friendly',
      before: 'Our product helps businesses manage their data efficiently.',
      after: 'We\'re revolutionizing how teams unlock the power of their data—making complex analytics as simple as a conversation!',
    },
    {
      brand: 'Luxury Fashion Brand',
      tone: 'Elegant & Sophisticated',
      before: 'Check out our new collection of handbags.',
      after: 'Discover our latest curated collection—where timeless craftsmanship meets contemporary elegance in every exquisite detail.',
    },
    {
      brand: 'Fitness Coach',
      tone: 'Motivational & Direct',
      before: 'Exercise is important for your health.',
      after: 'Your body is your temple—and today\'s the day you build something extraordinary. Let\'s crush those goals together!',
    },
  ];

  return (
    <Box
      id="demo-section"
      sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(180deg, ${alpha("#050224", 1)} 0%, ${alpha("#0a043c", 1)} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontWeight: 800,
            textAlign: 'center',
            mb: 3,
            color: 'white',
          }}
        >
          See the Brand Voice Magic in Action
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            color: alpha(theme.palette.text.secondary, 0.8),
            mb: 8,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          Watch how the same generic message transforms into unique brand voices across different industries.
        </Typography>

        <Grid container spacing={4}>
          {beforeAfterExamples.map((example, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.1),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
                    {example.brand}
                  </Typography>
                  <Chip 
                    label={example.tone} 
                    size="small" 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      color: theme.palette.primary.light,
                    }} 
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'error.light' }}>
                    Before (Generic):
                  </Typography>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      "{example.before}"
                    </Typography>
                  </Paper>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'success.light' }}>
                    After (Brand Voice):
                  </Typography>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                      "{example.after}"
                    </Typography>
                  </Paper>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            size="large"
            startIcon={<CreateIcon />}
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: '50px',
            }}
          >
            Try Your Brand Voice Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

// Tutorial Section
const TutorialSection = () => {
  const theme = useTheme();

  const steps = [
    {
      title: 'Upload your brand assets',
      description: 'Import style guides, successful content, brand guidelines, and tone of voice documentation.',
      icon: <CloudUploadIcon />,
    },
    {
      title: 'Train your voice model',
      description: 'Our AI analyzes your content patterns, vocabulary, and tone to create a custom brand voice model.',
      icon: <SmartToyIcon />,
    },
    {
      title: 'Generate on-brand content',
      description: 'Input any text and instantly transform it to match your exact brand voice and style guidelines.',
      icon: <CreateIcon />,
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontWeight: 800,
            textAlign: 'center',
            mb: 8,
          }}
        >
          How does it work?
        </Typography>

        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    margin: '0 auto 24px auto',
                  }}
                >
                  {step.icon}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  {index + 1}. {step.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {step.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// Use Cases Section
const UseCasesSection = () => {
  const theme = useTheme();

  const useCases = [
    {
      title: 'Social Media Content',
      description: 'Transform generic posts into engaging, on-brand social media content that resonates with your audience.',
      features: ['Platform-specific adaptation', 'Hashtag optimization', 'Engagement boost'],
      icon: '📱',
      persona: 'Social Media Manager',
    },
    {
      title: 'Email Campaigns',
      description: 'Convert standard email templates into compelling, brand-consistent campaigns that drive conversions.',
      features: ['Subject line optimization', 'CTA enhancement', 'Personalization'],
      icon: '✉️',
      persona: 'Email Marketer',
    },
    {
      title: 'Blog & Website Copy',
      description: 'Rewrite website content to perfectly capture your brand voice while maintaining SEO effectiveness.',
      features: ['SEO optimization', 'User experience focus', 'Brand consistency'],
      icon: '📝',
      persona: 'Content Writer',
    },
    {
      title: 'Ad Copy & Landing Pages',
      description: 'Create high-converting ad copy and landing pages that speak directly to your target audience.',
      features: ['Conversion optimization', 'A/B test variations', 'Audience targeting'],
      icon: '🎯',
      persona: 'Performance Marketer',
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, background: alpha(theme.palette.background.paper, 0.3) }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontWeight: 800,
            textAlign: 'center',
            mb: 8,
          }}
        >
          Marketing Use Cases
        </Typography>

        <Grid container spacing={4}>
          {useCases.map((useCase, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.8),
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 24px ${alpha(theme.palette.common.black, 0.1)}`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h4" sx={{ mr: 2 }}>
                    {useCase.icon}
                  </Typography>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {useCase.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      {useCase.persona}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                  {useCase.description}
                </Typography>

                <List dense>
                  {useCase.features.map((feature, idx) => (
                    <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature} 
                        primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// CTA Section
const CTASection = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: alpha(theme.palette.primary.main, 0.05),
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 800,
              mb: 3,
            }}
          >
            Ready to unlock your brand's true voice?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: 'text.secondary',
            }}
          >
            Join hundreds of brands that have already streamlined their content creation with FineTuner.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              sx={{
                py: 2,
                px: 5,
                fontSize: '1.2rem',
                fontWeight: 700,
                borderRadius: '50px',
              }}
            >
              Free Trial - No Credit Card
            </Button>
            <Button
              component={RouterLink}
              to="/contact"
              variant="outlined"
              size="large"
              sx={{
                py: 2,
                px: 5,
                fontSize: '1.2rem',
                borderRadius: '50px',
              }}
            >
              Talk to Brand Expert
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

const BrandVoicePage = () => {
  return (
    <PageTransition>
      <SEOHead path="/use-cases/brand-voice" />
      
      <Box sx={{ minHeight: '100vh', background: `linear-gradient(180deg, ${alpha("#0a043c", 1)} 0%, ${alpha("#03001e", 1)} 100%)` }}>
        <Navbar />
        <HeroSection />
        <StatsSection />
        <BenefitsSection />
        <DemoSection />
        <TutorialSection />
        <UseCasesSection />
        <CTASection />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default BrandVoicePage; 