import React, { useEffect } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Avatar, Stack, useTheme, alpha, Chip, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import PageTransition from '../../components/common/PageTransition';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import SEOHead from '../../components/common/SEOHead';
import ThumbsUpDownIcon from '@mui/icons-material/ThumbsUpDown';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CreateIcon from '@mui/icons-material/Create';
import ShareIcon from '@mui/icons-material/Share';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';

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
                  label="Social Media AI"
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
                  Social-Media Post Factory with GPT-4
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
                  Generate <strong style={{ color: '#00d4ff' }}>scroll-stopping posts</strong> matched to your audience and channel in seconds. From LinkedIn thought leadership to viral Twitter threads.
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
                    onClick={() => document.getElementById('examples-section').scrollIntoView({ behavior: 'smooth' })}
                  >
                    See Examples
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
                    background: 'radial-gradient(circle, rgba(191, 0, 255, 0.2) 0%, transparent 70%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <ThumbsUpDownIcon sx={{ fontSize: 120, color: '#bf00ff' }} />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: alpha('#00d4ff', 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShareIcon sx={{ fontSize: 40, color: '#00d4ff' }} />
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
    { value: '5x', label: 'Faster content production', icon: <SpeedIcon /> },
    { value: '200%', label: 'Higher engagement rates', icon: <TrendingUpIcon /> },
    { value: '85%', label: 'Time savings on social media', icon: <AccessTimeIcon /> },
    { value: '10M+', label: 'Social impressions generated', icon: <VisibilityIcon /> },
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
      title: 'Platform-specific optimization',
      description: 'AI trained on each platform\'s best practices: LinkedIn professional tone, Twitter brevity, Instagram visuals.',
      icon: <AutoFixHighIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Audience-matched content',
      description: 'Generate posts that resonate with your specific audience demographics, interests, and engagement patterns.',
      icon: <SmartToyIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Multi-format mastery',
      description: 'From carousel posts to Twitter threads, video scripts to LinkedIn articles—all formats optimized for engagement.',
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
          Why choose AI-powered social media?
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

// Examples Section
const ExamplesSection = () => {
  const theme = useTheme();

  const socialExamples = [
    {
      platform: 'LinkedIn',
      icon: <LinkedInIcon />,
      color: '#0077B5',
      type: 'Thought Leadership',
      content: `🎯 The AI revolution isn't coming—it's here.

But here's what most companies are missing:

They're using AI to automate tasks, not to amplify human creativity.

The real competitive advantage? 👇

✅ AI that learns YOUR voice
✅ AI that understands YOUR audience  
✅ AI that scales YOUR expertise

That's the difference between replacement and amplification.

What's your take? Are you using AI to replace or amplify?`,
      engagement: '2.4K likes, 189 comments',
    },
    {
      platform: 'Twitter',
      icon: <TwitterIcon />,
      color: '#1DA1F2',
      type: 'Thread',
      content: `1/7 🧵 Why most AI content feels soulless:

It's trained on everything, but specialized in nothing.

Here's how we fixed this with fine-tuning...`,
      engagement: '847 retweets, 3.2K likes',
    },
    {
      platform: 'Instagram',
      icon: <InstagramIcon />,
      color: '#E4405F',
      type: 'Carousel Post',
      content: `Caption: Behind the scenes of creating content that actually converts 📈

Swipe to see our 5-step framework that turned our followers into customers ➡️

#ContentMarketing #SocialMediaTips #EntrepreneurLife`,
      engagement: '1.2K likes, 87 comments',
    },
  ];

  return (
    <Box
      id="examples-section"
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
          Real Posts Generated by AI
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
          See how our AI creates platform-specific content that drives real engagement and conversions.
        </Typography>

        <Grid container spacing={4}>
          {socialExamples.map((example, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.1),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(example.color, 0.3)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: example.color, mr: 2 }}>
                    {example.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                      {example.platform}
                    </Typography>
                    <Chip 
                      label={example.type} 
                      size="small" 
                      sx={{ 
                        bgcolor: alpha(example.color, 0.2),
                        color: example.color,
                      }} 
                    />
                  </Box>
                </Box>

                <Paper 
                  sx={{ 
                    p: 3, 
                    mb: 3,
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    borderRadius: '12px',
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {example.content}
                  </Typography>
                </Paper>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: 'success.light', fontWeight: 600 }}>
                    📊 {example.engagement}
                  </Typography>
                  <Chip 
                    label="AI Generated" 
                    size="small" 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      color: theme.palette.primary.light,
                    }} 
                  />
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
            Generate Your Posts Now
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
      title: 'Upload your best content',
      description: 'Import your top-performing posts, brand voice guidelines, and audience insights from each platform.',
      icon: <CloudUploadIcon />,
    },
    {
      title: 'Train platform-specific models',
      description: 'AI learns your unique style for LinkedIn, Twitter, Instagram, and Facebook—optimized for each platform\'s algorithm.',
      icon: <SmartToyIcon />,
    },
    {
      title: 'Generate & schedule posts',
      description: 'Create engaging content in seconds, then schedule across all platforms or integrate with your favorite social media tools.',
      icon: <ShareIcon />,
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

// Platform Features Section
const PlatformFeaturesSection = () => {
  const theme = useTheme();

  const platforms = [
    {
      name: 'LinkedIn',
      icon: <LinkedInIcon />,
      color: '#0077B5',
      features: [
        'Professional tone optimization',
        'Industry-specific content',
        'Thought leadership posts',
        'Company page content',
        'LinkedIn article drafts',
      ],
      speciality: 'B2B & Professional',
    },
    {
      name: 'Twitter',
      icon: <TwitterIcon />,
      color: '#1DA1F2',
      features: [
        'Thread creation & structure',
        'Viral content patterns',
        'Hashtag optimization',
        'Character limit optimization',
        'Retweet-worthy hooks',
      ],
      speciality: 'Viral & Real-time',
    },
    {
      name: 'Instagram',
      icon: <InstagramIcon />,
      color: '#E4405F',
      features: [
        'Visual storytelling captions',
        'Hashtag research & placement',
        'Story content ideas',
        'Carousel post scripts',
        'Reel descriptions',
      ],
      speciality: 'Visual & Lifestyle',
    },
    {
      name: 'Facebook',
      icon: <FacebookIcon />,
      color: '#1877F2',
      features: [
        'Community engagement focus',
        'Event promotion content',
        'Long-form storytelling',
        'Group-specific content',
        'Video descriptions',
      ],
      speciality: 'Community & Sharing',
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
            mb: 3,
          }}
        >
          Platform-Specific Optimization
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            mb: 8,
            maxWidth: 700,
            mx: 'auto',
          }}
        >
          Each platform has its own culture, algorithm, and audience. Our AI understands these nuances and adapts your content accordingly.
        </Typography>

        <Grid container spacing={4}>
          {platforms.map((platform, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.8),
                  border: `1px solid ${alpha(platform.color, 0.3)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 24px ${alpha(platform.color, 0.2)}`,
                    borderColor: platform.color,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: platform.color, mr: 2 }}>
                    {platform.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {platform.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: platform.color, fontWeight: 600 }}>
                      {platform.speciality}
                    </Typography>
                  </Box>
                </Box>

                <List dense>
                  {platform.features.map((feature, idx) => (
                    <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <CheckCircleIcon sx={{ fontSize: 14, color: platform.color }} />
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
            Ready to dominate social media?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: 'text.secondary',
            }}
          >
            Join thousands of creators and brands generating viral content with FineTuner's AI-powered social media factory.
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
              Talk to Social Expert
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

const SocialMediaPage = () => {
  return (
    <PageTransition>
      <SEOHead path="/use-cases/social-media" />
      
      <Box sx={{ minHeight: '100vh', background: `linear-gradient(180deg, ${alpha("#0a043c", 1)} 0%, ${alpha("#03001e", 1)} 100%)` }}>
        <Navbar />
        <HeroSection />
        <StatsSection />
        <BenefitsSection />
        <ExamplesSection />
        <TutorialSection />
        <PlatformFeaturesSection />
        <CTASection />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default SocialMediaPage; 