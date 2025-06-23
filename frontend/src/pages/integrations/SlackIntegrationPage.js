import React, { useEffect } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Avatar, Stack, useTheme, alpha, Chip, List, ListItem, ListItemIcon, ListItemText, Paper, Stepper, Step, StepLabel, StepContent, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import PageTransition from '../../components/common/PageTransition';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SlackIcon from '@mui/icons-material/Tag'; // Using Tag as placeholder for Slack
import ChatIcon from '@mui/icons-material/Chat';
import SpeedIcon from '@mui/icons-material/Speed';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TuneIcon from '@mui/icons-material/Tune';
import TimerIcon from '@mui/icons-material/Timer';
import SecurityIcon from '@mui/icons-material/Security';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BoltIcon from '@mui/icons-material/Bolt';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SlackIcon sx={{ fontSize: 40, color: '#4A154B', mr: 2 }} />
                  <Typography variant="h4" sx={{ color: '#4A154B', fontWeight: 700 }}>
                    × FineTuner
                  </Typography>
                </Box>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  component="h1"
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '2.8rem', md: '4rem' },
                    lineHeight: 1.1,
                    background: 'linear-gradient(145deg, #bf00ff, #00d4ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 3,
                  }}
                >
                  Deploy a Chatbot
                  <br />
                  in 5 Minutes
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: '1.2rem', md: '1.4rem' },
                    lineHeight: 1.7,
                    color: alpha(theme.palette.text.secondary, 0.9),
                    mb: 4,
                    maxWidth: 500,
                  }}
                >
                  <strong style={{ color: '#00d4ff' }}>Connect Slack, train on tickets</strong> and answer teammates instantly with slash commands and custom bots.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: '50px',
                      background: 'linear-gradient(45deg, #4A154B, #bf00ff)',
                    }}
                  >
                    Start 5-Min Setup
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
                    onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                  >
                    See How It Works
                  </Button>
                </Stack>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TimerIcon sx={{ color: '#00d4ff', fontSize: 24 }} />
                  <Typography variant="body2" color="text.secondary">
                    <strong style={{ color: '#00d4ff' }}>5 minutes setup</strong> • No coding required • Works with existing data
                  </Typography>
                </Box>
              </motion.div>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  background: alpha('#4A154B', 0.1),
                  p: 3,
                }}
              >
                {/* Mock Slack Interface */}
                <Box
                  sx={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    p: 3,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bg: '#4A154B', mr: 2 }} />
                    <Typography variant="h6" sx={{ color: '#000', fontWeight: 600 }}>
                      #support
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                      @john.doe • Today at 2:30 PM
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#000', mb: 2 }}>
                      /ask How do I reset my password?
                    </Typography>
                    
                    <Box sx={{ bg: '#f8f9fa', p: 2, borderRadius: '8px', borderLeft: '4px solid #bf00ff' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <SmartToyIcon sx={{ fontSize: 16, color: '#bf00ff', mr: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#bf00ff' }}>
                          Support Bot
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#333' }}>
                        To reset your password: 1) Go to login page 2) Click "Forgot Password" 3) Check your email for reset link. The link expires in 24 hours.
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    💡 Answered instantly from your knowledge base
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// How It Works Section
const HowItWorksSection = () => {
  const theme = useTheme();

  const steps = [
    {
      title: 'Connect Your Slack',
      description: 'Install the FineTuner app and authorize workspace access. Takes 30 seconds.',
      icon: <IntegrationInstructionsIcon />,
      time: '30 sec',
    },
    {
      title: 'Upload Knowledge Base',
      description: 'Add your support tickets, docs, or FAQs to train your bot.',
      icon: <CloudUploadIcon />,
      time: '2 min',
    },
    {
      title: 'Fine-tune the Model',
      description: 'Our AI processes your data and creates a custom bot trained on your content.',
      icon: <TuneIcon />,
      time: '2 min',
    },
    {
      title: 'Deploy Slash Commands',
      description: 'Set up /ask commands and start answering questions instantly.',
      icon: <BoltIcon />,
      time: '30 sec',
    },
  ];

  return (
    <Box
      id="how-it-works"
      sx={{
        py: { xs: 8, md: 12 },
        background: alpha(theme.palette.background.paper, 0.3),
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontWeight: 800,
            textAlign: 'center',
            mb: 2,
          }}
        >
          Slack Fine-Tuning in 4 Steps
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            mb: 8,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          From zero to deployed Slack bot in under 5 minutes. No coding, no complex setup.
        </Typography>

        <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
          {steps.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  p: 3,
                  height: 320, // Fixed height for consistency
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.8),
                  border: `2px solid ${alpha('#4A154B', 0.3)}`,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    borderColor: alpha('#4A154B', 0.6),
                    boxShadow: `0 20px 40px ${alpha('#4A154B', 0.2)}`,
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -15,
                    left: 20,
                    background: '#4A154B',
                    color: 'white',
                    borderRadius: '20px',
                    px: 2,
                    py: 0.5,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  Step {index + 1}
                </Box>

                <Box sx={{ mt: 2, mb: 3, textAlign: 'center', flexGrow: 0 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: alpha('#4A154B', 0.1),
                      color: '#4A154B',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {step.icon}
                  </Avatar>
                  <Chip
                    label={step.time}
                    size="small"
                    sx={{ 
                      bgcolor: alpha('#00d4ff', 0.1), 
                      color: '#00d4ff',
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Box sx={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, lineHeight: 1.3 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                    {step.description}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Connection lines between steps for desktop */}
        <Box 
          sx={{ 
            display: { xs: 'none', md: 'block' }, 
            position: 'relative', 
            mt: -20, 
            mb: 4,
            height: 2,
            background: `linear-gradient(to right, transparent 12%, ${alpha('#4A154B', 0.3)} 12%, ${alpha('#4A154B', 0.3)} 88%, transparent 88%)`,
            zIndex: 0,
          }} 
        />

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            🚀 <strong style={{ color: '#00d4ff' }}>Total setup time: Under 5 minutes</strong>
          </Typography>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            size="large"
            startIcon={<PlayArrowIcon />}
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: '50px',
              background: 'linear-gradient(45deg, #4A154B, #bf00ff)',
            }}
          >
            Start Your 5-Min Setup Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

// Features Section
const FeaturesSection = () => {
  const theme = useTheme();

  const features = [
    {
      title: 'Slash Commands',
      description: 'Use /ask [question] to get instant answers from your trained bot.',
      icon: <BoltIcon />,
      color: '#FF6B6B',
    },
    {
      title: 'Context-Aware Responses',
      description: 'Bot understands context and provides relevant, accurate answers.',
      icon: <AutoAwesomeIcon />,
      color: '#4ECDC4',
    },
    {
      title: 'Team Collaboration',
      description: 'Share knowledge instantly across teams and channels.',
      icon: <GroupIcon />,
      color: '#45B7D1',
    },
    {
      title: 'Smart Search',
      description: 'Find information from your knowledge base in seconds.',
      icon: <SearchIcon />,
      color: '#96CEB4',
    },
    {
      title: 'Custom Training',
      description: 'Train on your specific data for domain-expert responses.',
      icon: <TuneIcon />,
      color: '#FECA57',
    },
    {
      title: 'Secure Integration',
      description: 'Enterprise-grade security with Slack workspace permissions.',
      icon: <SecurityIcon />,
      color: '#6C5CE7',
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
          Powerful Slack Bot Features
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${alpha(feature.color, 0.3)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    borderColor: alpha(feature.color, 0.6),
                    boxShadow: `0 20px 40px ${alpha(feature.color, 0.2)}`,
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: alpha(feature.color, 0.1),
                    color: feature.color,
                    mb: 3,
                  }}
                >
                  {feature.icon}
                </Avatar>

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: feature.color }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {feature.description}
                </Typography>
              </Card>
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
      title: 'Customer Support',
      description: 'Train on support tickets and FAQs to provide instant customer help.',
      example: '/ask How do I cancel my subscription?',
      icon: <SupportAgentIcon />,
      color: '#4A154B',
    },
    {
      title: 'Internal Wiki',
      description: 'Make company knowledge searchable through simple Slack commands.',
      example: '/ask What\'s our vacation policy?',
      icon: <SearchIcon />,
      color: '#00B4D8',
    },
    {
      title: 'Technical Documentation',
      description: 'Answer developer questions about APIs, setup guides, and troubleshooting.',
      example: '/ask How to configure SSL certificates?',
      icon: <IntegrationInstructionsIcon />,
      color: '#FF6B6B',
    },
  ];

  return (
    <Box
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
            mb: 8,
            color: 'white',
          }}
        >
          Popular Slack Fine-Tuning Use Cases
        </Typography>

        <Grid container spacing={6}>
          {useCases.map((useCase, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: '16px',
                  background: alpha('#ffffff', 0.1),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(useCase.color, 0.3)}`,
                }}
              >
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: alpha(useCase.color, 0.2),
                    color: useCase.color,
                    mb: 3,
                  }}
                >
                  {useCase.icon}
                </Avatar>

                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>
                  {useCase.title}
                </Typography>
                <Typography variant="body1" sx={{ color: alpha('#ffffff', 0.8), mb: 3 }}>
                  {useCase.description}
                </Typography>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: '8px',
                    background: alpha('#000000', 0.3),
                    fontFamily: 'monospace',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#00d4ff' }}>
                    {useCase.example}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// Advanced Features Section
const AdvancedFeaturesSection = () => {
  const theme = useTheme();

  const advancedFeatures = [
    {
      title: 'Multi-Channel Deployment',
      description: 'Deploy your fine-tuned bot across multiple Slack channels simultaneously with channel-specific customizations.',
      benefits: ['Channel-specific responses', 'Department-based knowledge', 'Role-based permissions'],
      icon: <GroupIcon />,
      color: '#FF6B6B',
    },
    {
      title: 'Advanced Analytics',
      description: 'Track bot performance, user satisfaction, and identify knowledge gaps with comprehensive analytics dashboard.',
      benefits: ['Usage statistics', 'Response accuracy metrics', 'User feedback tracking'],
      icon: <SearchIcon />,
      color: '#4ECDC4',
    },
    {
      title: 'Continuous Learning',
      description: 'Your bot improves over time by learning from new conversations and updated documentation.',
      benefits: ['Automatic model updates', 'Performance optimization', 'Knowledge base expansion'],
      icon: <AutoAwesomeIcon />,
      color: '#45B7D1',
    },
    {
      title: 'Enterprise Security',
      description: 'Bank-grade security with compliance features for regulated industries and enterprise requirements.',
      benefits: ['SOC 2 compliance', 'Data encryption', 'Access controls'],
      icon: <SecurityIcon />,
      color: '#96CEB4',
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
          Advanced Slack Bot Capabilities
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            mb: 8,
            maxWidth: 700,
            mx: 'auto',
            lineHeight: 1.7,
          }}
        >
          Beyond basic slash commands, FineTuner offers enterprise-grade features that scale with your team's needs and provide deep insights into bot performance and user interactions.
        </Typography>

        <Grid container spacing={4}>
          {advancedFeatures.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.8),
                  border: `2px solid ${alpha(feature.color, 0.3)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    borderColor: alpha(feature.color, 0.6),
                    boxShadow: `0 20px 40px ${alpha(feature.color, 0.2)}`,
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: alpha(feature.color, 0.1),
                    color: feature.color,
                    mb: 3,
                  }}
                >
                  {feature.icon}
                </Avatar>

                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: feature.color }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                  {feature.description}
                </Typography>

                <List dense>
                  {feature.benefits.map((benefit, idx) => (
                    <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={benefit} 
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
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

// Industry-Specific Use Cases Section
const IndustryUseCasesSection = () => {
  const theme = useTheme();

  const industries = [
    {
      name: 'Technology Companies',
      description: 'Help developers and teams access technical documentation, API references, and troubleshooting guides instantly.',
      useCases: [
        'API documentation queries',
        'Deployment troubleshooting',
        'Code review guidelines',
        'Infrastructure monitoring alerts'
      ],
      example: '/ask How do I deploy to staging environment?',
      color: '#6C5CE7',
    },
    {
      name: 'Financial Services',
      description: 'Provide compliance information, policy clarifications, and process guidance while maintaining security standards.',
      useCases: [
        'Compliance policy queries',
        'Risk assessment procedures',
        'Trading guidelines',
        'Regulatory updates'
      ],
      example: '/ask What\'s the current KYC procedure for new clients?',
      color: '#00B894',
    },
    {
      name: 'Healthcare Organizations',
      description: 'Share medical protocols, patient care guidelines, and administrative procedures securely within teams.',
      useCases: [
        'Medical protocol lookup',
        'Patient care guidelines',
        'Administrative procedures',
        'Equipment troubleshooting'
      ],
      example: '/ask What\'s the protocol for emergency patient admission?',
      color: '#E84393',
    },
    {
      name: 'Educational Institutions',
      description: 'Assist faculty and students with academic policies, course information, and administrative procedures.',
      useCases: [
        'Academic policy queries',
        'Course enrollment procedures',
        'Faculty guidelines',
        'Student services information'
      ],
      example: '/ask How do I submit a grade change request?',
      color: '#F39C12',
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
          Industry-Specific Slack Fine-Tuning Solutions
        </Typography>

        <Grid container spacing={4}>
          {industries.map((industry, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.6),
                  border: `1px solid ${alpha(industry.color, 0.3)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: alpha(industry.color, 0.6),
                    boxShadow: `0 16px 32px ${alpha(industry.color, 0.2)}`,
                  },
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: industry.color }}>
                  {industry.name}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                  {industry.description}
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                  Common Use Cases:
                </Typography>
                <List dense sx={{ mb: 3 }}>
                  {industry.useCases.map((useCase, idx) => (
                    <ListItem key={idx} sx={{ px: 0, py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 20 }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: industry.color,
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={useCase} 
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: '8px',
                    background: alpha(industry.color, 0.1),
                    border: `1px solid ${alpha(industry.color, 0.2)}`,
                    fontFamily: 'monospace',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    Example Command:
                  </Typography>
                  <Typography variant="body2" sx={{ color: industry.color, fontWeight: 600 }}>
                    {industry.example}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
            Every industry has unique requirements for knowledge sharing and team collaboration. Our Slack fine-tuning solution adapts to your specific terminology, processes, and compliance needs.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              component={RouterLink}
              to="/use-cases/support-chatbot"
              variant="outlined"
              size="large"
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1rem',
                borderRadius: '50px',
              }}
            >
              Explore More Use Cases
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

// Benefits Section
const BenefitsSection = () => {
  const theme = useTheme();

  const benefits = [
    'Reduce support ticket volume by 40%',
    'Answer questions 24/7 instantly',
    'Improve team productivity',
    'Scale knowledge sharing',
    'No coding or maintenance required',
    'Works with existing Slack workflows',
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: alpha(theme.palette.primary.main, 0.05),
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 800,
                mb: 4,
              }}
            >
              Why Teams Choose Slack Fine-Tuning
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mb: 4,
                color: 'text.secondary',
                lineHeight: 1.7,
              }}
            >
              Transform your Slack workspace into a smart knowledge hub that answers questions instantly and reduces support overhead.
            </Typography>

            <Grid container spacing={2}>
              {benefits.map((benefit, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircleIcon sx={{ color: 'success.main', mr: 2 }} />
                    <Typography variant="body1">{benefit}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 4,
                borderRadius: '16px',
                background: alpha(theme.palette.background.paper, 0.8),
                border: `1px solid ${alpha('#4A154B', 0.3)}`,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#4A154B', mb: 3 }}>
                Setup Takes Just Minutes
              </Typography>

              <List>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="No technical expertise needed" />
                </ListItem>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Works with any data format" />
                </ListItem>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Secure workspace integration" />
                </ListItem>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Instant deployment and updates" />
                </ListItem>
              </List>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Final CTA Section
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
            Ready to Deploy Your Slack Bot?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: 'text.secondary',
            }}
          >
            Start your 5-minute setup now. Connect Slack, upload your data, and deploy a custom bot with slash commands.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              startIcon={<SlackIcon />}
              sx={{
                py: 2,
                px: 5,
                fontSize: '1.2rem',
                fontWeight: 700,
                borderRadius: '50px',
                background: 'linear-gradient(45deg, #4A154B, #bf00ff)',
              }}
            >
              Start Slack Integration
            </Button>
            <Button
              component={RouterLink}
              to="/use-cases/support-chatbot"
              variant="outlined"
              size="large"
              sx={{
                py: 2,
                px: 5,
                fontSize: '1.2rem',
                borderRadius: '50px',
              }}
            >
              See More Use Cases
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

const SlackIntegrationPage = () => {
  // SEO meta tags management
  useEffect(() => {
    // Save original title
    const originalTitle = document.title;
    
    // Update title - keeping under 60 characters
    document.title = 'Slack AI Chatbot Integration | 5-Min Setup | FineTuner';
    
    // Helper function to update or create meta tag
    const updateMetaTag = (name, content, property = false) => {
      const attributeName = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attributeName}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
      return element;
    };
    
    // Standard meta tags - optimized for 140-160 characters  
    const metaDescription = updateMetaTag('description', 'Deploy AI chatbots in Slack with 5-minute setup. Slash commands, custom training, team collaboration. Transform workplace knowledge sharing instantly.');
    const metaKeywords = updateMetaTag('keywords', 'slack chatbot, slack AI bot, slash commands, team collaboration, workplace automation, slack integration, knowledge sharing, fine-tuning');
    
    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', 'https://finetuner.ai/integrations/slack');
    
    // Open Graph tags
    const ogTitle = updateMetaTag('og:title', 'Slack AI Chatbot Integration | 5-Min Setup | FineTuner', true);
    const ogDescription = updateMetaTag('og:description', 'Deploy AI chatbots in Slack with 5-minute setup. Slash commands, custom training, team collaboration instantly.', true);
    const ogType = updateMetaTag('og:type', 'website', true);
    const ogUrl = updateMetaTag('og:url', 'https://finetuner.ai/integrations/slack', true);
    const ogImage = updateMetaTag('og:image', 'https://finetuner.ai/assets/images/slack-integration-og.jpg', true);
    
    // Twitter Card tags
    const twitterCard = updateMetaTag('twitter:card', 'summary_large_image');
    const twitterTitle = updateMetaTag('twitter:title', 'Slack AI Chatbot Integration | 5-Min Setup | FineTuner');
    const twitterDescription = updateMetaTag('twitter:description', 'Deploy AI chatbots in Slack with 5-minute setup. Slash commands, custom training, team collaboration instantly.');
    const twitterImage = updateMetaTag('twitter:image', 'https://finetuner.ai/assets/images/slack-integration-twitter.jpg');
    
    // Schema.org structured data - Enhanced with more details
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "FineTuner Slack Integration",
      "description": "Deploy AI chatbots in Slack with 5-minute setup. Slash commands, custom training, team collaboration instantly.",
      "url": "https://finetuner.ai/integrations/slack",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "datePublished": "2024-01-15",
      "dateModified": new Date().toISOString().split('T')[0],
      "author": {
        "@type": "Organization",
        "name": "FineTuner",
        "url": "https://finetuner.ai"
      },
      "publisher": {
        "@type": "Organization",
        "name": "FineTuner",
        "logo": {
          "@type": "ImageObject",
          "url": "https://finetuner.ai/assets/images/logo.png"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "89"
      },
      "offers": {
        "@type": "Offer",
        "price": "29",
        "priceCurrency": "USD",
        "priceValidUntil": "2024-12-31"
      },
      "featureList": [
        "5-minute setup",
        "Slash commands",
        "Custom bot training",
        "Knowledge base integration",
        "Team collaboration",
        "Multi-channel deployment",
        "Enterprise security"
      ],
      "mainEntity": {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How long does Slack integration take?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Complete Slack integration takes just 5 minutes: 30 seconds to connect, 2 minutes to upload data, 2 minutes for fine-tuning, and 30 seconds to deploy."
            }
          },
          {
            "@type": "Question", 
            "name": "Do I need coding skills for Slack bot setup?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No coding required. Our visual interface handles all technical aspects automatically."
            }
          }
        ]
      }
    });
    document.head.appendChild(schemaScript);
    
    // Cleanup function
    return () => {
      // Restore original title
      document.title = originalTitle;
      
      // Remove schema script
      if (schemaScript.parentNode) {
        schemaScript.parentNode.removeChild(schemaScript);
      }
    };
  }, []);

  return (
    <PageTransition>
      <Box sx={{ minHeight: '100vh', background: `linear-gradient(180deg, ${alpha("#0a043c", 1)} 0%, ${alpha("#03001e", 1)} 100%)` }}>
        <Navbar />
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <AdvancedFeaturesSection />
        <UseCasesSection />
        <IndustryUseCasesSection />
        <BenefitsSection />
        <CTASection />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default SlackIntegrationPage; 