import React, { useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Stack,
  Chip,
  Paper,
  useTheme,
  alpha,
  Avatar,
  LinearProgress,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import SEOHead from '../../components/common/SEOHead';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupIcon from '@mui/icons-material/Group';
import MicIcon from '@mui/icons-material/Mic';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import HeadphonesIcon from '@mui/icons-material/Headphones';

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

  return (
    <Box
      sx={{
        pt: { xs: 12, md: 16 },
        pb: { xs: 8, md: 12 },
        background: `linear-gradient(135deg, ${alpha("#0a043c", 1)} 0%, ${alpha("#03001e", 1)} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background effects */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: `radial-gradient(circle at 20% 20%, ${theme.palette.primary.main} 0%, transparent 50%), 
                      radial-gradient(circle at 80% 80%, ${theme.palette.secondary.main} 0%, transparent 50%)`,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Chip
                  label="🎓 Education Technology"
                  sx={{
                    mb: 3,
                    px: 2,
                    py: 0.5,
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    color: theme.palette.primary.light,
                    fontWeight: 600,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    fontWeight: 900,
                    lineHeight: 1.1,
                    mb: 3,
                    background: 'linear-gradient(145deg, #ffffff, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Trainer Voice for{' '}
                  <Box component="span" sx={{ color: '#00d4ff' }}>
                    E-Learning Modules
                  </Box>
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    color: alpha('#ffffff', 0.9),
                    lineHeight: 1.6,
                    maxWidth: '90%',
                    fontWeight: 400,
                  }}
                >
                  Auto-narrate courses in the familiar voice of your star instructor. 
                  Scale personalized learning without recording hours.
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
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: '50px',
                      background: 'linear-gradient(45deg, #00d4ff, #a78bfa)',
                      boxShadow: '0 8px 25px rgba(0, 212, 255, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 35px rgba(0, 212, 255, 0.4)',
                      },
                    }}
                  >
                    Start Voice Training
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: '50px',
                      borderColor: alpha('#ffffff', 0.3),
                      color: '#ffffff',
                      '&:hover': {
                        borderColor: '#ffffff',
                        backgroundColor: alpha('#ffffff', 0.1),
                      },
                    }}
                  >
                    View Demo
                  </Button>
                </Stack>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                variants={itemVariants}
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 500,
                    height: 400,
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${alpha('#00d4ff', 0.1)}, ${alpha('#a78bfa', 0.1)})`,
                    border: `1px solid ${alpha('#00d4ff', 0.2)}`,
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {/* Voice waveform visualization */}
                  <Box sx={{ textAlign: 'center' }}>
                    <VolumeUpIcon sx={{ fontSize: 80, color: '#00d4ff', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                      "Welcome to Module 1..."
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3 }}>
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scaleY: [0.3, 1.5, 0.8, 1.2, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                          style={{
                            width: 4,
                            height: 40,
                            backgroundColor: '#00d4ff',
                            borderRadius: 2,
                            opacity: 0.7,
                          }}
                        />
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7) }}>
                      AI-generated with instructor's voice
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

// Stats Section
const StatsSection = () => {
  const theme = useTheme();

  const stats = [
    {
      number: '10x',
      label: 'Faster Course Production',
      icon: SpeedIcon,
      description: 'Create narrated modules instantly',
    },
    {
      number: '95%',
      label: 'Voice Similarity Score',
      icon: RecordVoiceOverIcon,
      description: 'Indistinguishable from original',
    },
    {
      number: '50+',
      label: 'Languages Supported',
      icon: GroupIcon,
      description: 'Clone voice in multiple languages',
    },
    {
      number: '3 min',
      label: 'Setup Time',
      icon: AccessTimeIcon,
      description: 'From voice sample to production',
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div variants={itemVariants}>
                  <Card
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.4)})`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    >
                      <stat.icon fontSize="large" />
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: 'primary.main' }}>
                      {stat.number}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

// Benefits Section
const BenefitsSection = () => {
  const theme = useTheme();

  const benefits = [
    {
      icon: RecordVoiceOverIcon,
      title: 'Voice Consistency',
      description: 'Maintain the same instructor voice across all course modules, ensuring brand consistency and learner familiarity.',
    },
    {
      icon: SpeedIcon,
      title: 'Instant Production',
      description: 'Generate narrated content in minutes instead of booking studio time and managing recording schedules.',
    },
    {
      icon: GroupIcon,
      title: 'Multilingual Scaling',
      description: 'Clone your instructor\'s voice in 50+ languages without hiring native speakers for each market.',
    },
    {
      icon: AutoFixHighIcon,
      title: 'Perfect Quality',
      description: 'No background noise, perfect pronunciation, and consistent tone throughout all your educational content.',
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'grey.50' }}>
      <Container maxWidth="lg">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                textAlign: 'center',
                mb: 2,
                fontWeight: 900,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Why Instructors Choose Voice Cloning
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                mb: 6,
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Scale your teaching impact while maintaining the personal connection learners love
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div variants={itemVariants}>
                  <Card
                    sx={{
                      height: '100%',
                      p: 4,
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      >
                        <benefit.icon fontSize="large" />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                          {benefit.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                          {benefit.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

// Demo Section
const DemoSection = () => {
  const theme = useTheme();

  const voiceSamples = [
    {
      instructor: 'Dr. Sarah Chen',
      subject: 'Data Science',
      duration: '2:34',
      sample: 'Welcome to advanced machine learning concepts...',
    },
    {
      instructor: 'Prof. Michael Rodriguez',
      subject: 'Business Strategy',
      duration: '1:47',
      sample: 'In today\'s competitive landscape, strategic thinking...',
    },
    {
      instructor: 'Dr. Amelia Foster',
      subject: 'Psychology',
      duration: '3:12',
      sample: 'Understanding cognitive behavioral patterns helps us...',
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                textAlign: 'center',
                mb: 2,
                fontWeight: 900,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Hear the Difference
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                mb: 6,
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Real instructor voices cloned for their course modules
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {voiceSamples.map((sample, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div variants={itemVariants}>
                  <Card
                    sx={{
                      height: '100%',
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.6)})`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 15px 30px ${alpha(theme.palette.primary.main, 0.1)}`,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          mr: 2,
                          bgcolor: theme.palette.primary.main,
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {sample.instructor}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {sample.subject}
                        </Typography>
                      </Box>
                    </Box>

                    <Paper
                      sx={{
                        p: 2,
                        mb: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2 }}>
                        "{sample.sample}"
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PlayArrowIcon />}
                          sx={{ borderRadius: '20px' }}
                        >
                          Play
                        </Button>
                        <Typography variant="caption" color="text.secondary">
                          {sample.duration}
                        </Typography>
                      </Box>
                    </Paper>

                    <Chip
                      label="AI Generated"
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        fontWeight: 600,
                      }}
                    />
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

// Process Section
const ProcessSection = () => {
  const theme = useTheme();

  const steps = [
    {
      icon: MicIcon,
      title: 'Upload Voice Sample',
      description: 'Provide 5-10 minutes of clean instructor audio',
      details: 'Any existing lecture or recording works perfectly',
    },
    {
      icon: SmartToyIcon,
      title: 'AI Voice Training',
      description: 'Our AI learns your instructor\'s unique voice patterns',
      details: 'Training completes in under 3 minutes',
    },
    {
      icon: CloudUploadIcon,
      title: 'Upload Course Script',
      description: 'Add your lesson content as text or document',
      details: 'Supports Word, PDF, or plain text formats',
    },
    {
      icon: HeadphonesIcon,
      title: 'Generate Narration',
      description: 'AI creates perfect narration in your instructor\'s voice',
      details: 'Download high-quality audio files instantly',
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'grey.50' }}>
      <Container maxWidth="lg">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                textAlign: 'center',
                mb: 2,
                fontWeight: 900,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              How It Works
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                mb: 6,
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              From voice sample to narrated course in 4 simple steps
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} md={3} key={index}>
                <motion.div variants={itemVariants}>
                  <Card
                    sx={{
                      height: '100%',
                      p: 3,
                      textAlign: 'center',
                      position: 'relative',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -15,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                      }}
                    >
                      {index + 1}
                    </Box>

                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 3,
                        mt: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    >
                      <step.icon fontSize="large" />
                    </Avatar>

                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                      {step.description}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      {step.details}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
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
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        color: 'white',
        textAlign: 'center',
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 900,
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              Ready to Scale Your Training?
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                opacity: 0.9,
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Join 500+ educators who've transformed their course production with AI voice cloning
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ justifyContent: 'center' }}
            >
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: '50px',
                  backgroundColor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha('#ffffff', 0.9),
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<PlayArrowIcon />}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: '50px',
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: alpha('#ffffff', 0.1),
                  },
                }}
              >
                Watch Demo
              </Button>
            </Stack>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

// Main Component
const InstructorVoicePage = () => {
  useEffect(() => {
    const updateMetaTag = (name, content, property = false) => {
      const metaTag = document.querySelector(property ? `meta[property="${name}"]` : `meta[name="${name}"]`);
      if (metaTag) {
        metaTag.setAttribute('content', content);
      }
    };

    // Update meta tags for better SEO
    updateMetaTag('description', 'Auto-narrate courses in the familiar voice of your star instructor. Scale personalized learning without recording hours with AI voice cloning technology.');
    updateMetaTag('keywords', 'instructor voice cloning, elearning narration, voice synthesis, course automation, training modules, AI voice generation');
    updateMetaTag('og:description', 'Auto-narrate courses in the familiar voice of your star instructor. Scale personalized learning without recording hours with AI voice cloning technology.', true);

    return () => {
      // Reset meta tags when component unmounts
      updateMetaTag('description', '');
      updateMetaTag('keywords', '');
      updateMetaTag('og:description', '', true);
    };
  }, []);

  return (
    <PageTransition>
      <SEOHead path="/use-cases/instructor-voice" />
      <Box sx={{ minHeight: '100vh' }}>
        <Navbar />
        <HeroSection />
        <StatsSection />
        <BenefitsSection />
        <DemoSection />
        <ProcessSection />
        <CTASection />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default InstructorVoicePage; 