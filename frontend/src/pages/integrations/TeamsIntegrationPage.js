import React, { useEffect } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Avatar, Stack, useTheme, alpha, Chip, List, ListItem, ListItemIcon, ListItemText, Paper, Stepper, Step, StepLabel, StepContent, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import PageTransition from '../../components/common/PageTransition';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import SEOHead from '../../components/common/SEOHead';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GroupsIcon from '@mui/icons-material/Groups';
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
import BusinessIcon from '@mui/icons-material/Business';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import VideoCallIcon from '@mui/icons-material/VideoCall';

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
        background: `linear-gradient(180deg, ${alpha("#464EB8", 0.1)} 0%, ${alpha("#6264A7", 0.05)} 100%)`,
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
                  <GroupsIcon sx={{ fontSize: 40, color: '#464EB8', mr: 2 }} />
                  <Typography variant="h4" sx={{ color: '#464EB8', fontWeight: 700 }}>
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
                    background: 'linear-gradient(145deg, #464EB8, #6264A7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 3,
                  }}
                >
                  Enterprise AI Assistant
                  <br />
                  for Microsoft Teams
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
                  Deploy <strong style={{ color: '#464EB8' }}>enterprise-grade AI chatbots</strong> directly in Teams channels. Streamline knowledge sharing and boost productivity with fine-tuned responses.
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
                      background: 'linear-gradient(45deg, #464EB8, #6264A7)',
                    }}
                  >
                    Deploy to Teams
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      borderRadius: '50px',
                      borderColor: '#464EB8',
                      color: '#464EB8',
                    }}
                    onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                  >
                    See How It Works
                  </Button>
                </Stack>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SecurityIcon sx={{ color: '#464EB8', fontSize: 24 }} />
                  <Typography variant="body2" color="text.secondary">
                    <strong style={{ color: '#464EB8' }}>Enterprise-ready</strong> • SOC 2 compliant • Azure AD integration • Admin controls
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
                  background: alpha('#464EB8', 0.1),
                  p: 3,
                }}
              >
                {/* Mock Teams Interface */}
                <Box
                  sx={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    p: 3,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bg: '#464EB8', mr: 2 }} />
                    <Typography variant="h6" sx={{ color: '#000', fontWeight: 600 }}>
                      #general
                    </Typography>
                    <Typography variant="caption" sx={{ ml: 'auto', color: '#666' }}>
                      Microsoft Teams
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                      @sarah.manager • Today at 2:30 PM
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#000', mb: 2 }}>
                      @FineTuner Bot What's our Q4 budget allocation process?
                    </Typography>
                    
                    <Box sx={{ bg: '#f8f9fa', p: 2, borderRadius: '8px', borderLeft: '4px solid #464EB8' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <SmartToyIcon sx={{ fontSize: 16, color: '#464EB8', mr: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#464EB8' }}>
                          FineTuner Enterprise Bot
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#333' }}>
                        The Q4 budget allocation follows our standard process: 1) Department heads submit requests by Oct 15th 2) Finance reviews and consolidates 3) Leadership approval by Nov 1st 4) Final allocations communicated by Nov 15th. You can find the detailed guidelines in our Finance SharePoint.
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    🔒 Response based on internal company policies and procedures
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
      title: 'Connect Your Teams Tenant',
      description: 'Secure Azure AD integration with your Microsoft 365 environment. Admin approval ensures compliance.',
      icon: <IntegrationInstructionsIcon />,
      time: '2 min',
    },
    {
      title: 'Upload Company Knowledge',
      description: 'Import from SharePoint, OneDrive, or upload directly. Support for all enterprise document formats.',
      icon: <CloudUploadIcon />,
      time: '5 min',
    },
    {
      title: 'Fine-tune Enterprise Model',
      description: 'AI processes your company data and creates a specialized model trained on your business context.',
      icon: <TuneIcon />,
      time: '3 min',
    },
    {
      title: 'Deploy to Channels',
      description: 'Add the bot to specific channels with granular permissions and usage controls.',
      icon: <BoltIcon />,
      time: '1 min',
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
          Enterprise Teams Integration in 4 Steps
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
          From Azure AD connection to deployed Teams bot in under 15 minutes. Enterprise security and compliance built-in.
        </Typography>

        <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
          {steps.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  p: 3,
                  height: 320,
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.8),
                  border: `2px solid ${alpha('#464EB8', 0.3)}`,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    borderColor: alpha('#464EB8', 0.6),
                    boxShadow: `0 20px 40px ${alpha('#464EB8', 0.2)}`,
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -15,
                    left: 20,
                    background: '#464EB8',
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
                      bgcolor: alpha('#464EB8', 0.1),
                      color: '#464EB8',
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

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            🚀 <strong style={{ color: '#464EB8' }}>Total deployment time: Under 15 minutes</strong>
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
              background: 'linear-gradient(45deg, #464EB8, #6264A7)',
            }}
          >
            Start Teams Integration
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

// Enterprise Features Section
const EnterpriseFeaturesSection = () => {
  const theme = useTheme();

  const features = [
    {
      title: 'Azure AD Integration',
      description: 'Seamless single sign-on with your existing Microsoft 365 identity and access management.',
      icon: <SecurityIcon />,
      color: '#2B579A',
    },
    {
      title: 'Admin Controls',
      description: 'Granular permissions, usage monitoring, and compliance controls for IT administrators.',
      icon: <AdminPanelSettingsIcon />,
      color: '#464EB8',
    },
    {
      title: 'SharePoint Integration',
      description: 'Direct access to SharePoint documents and OneDrive files for comprehensive knowledge base.',
      icon: <DocumentScannerIcon />,
      color: '#0078D4',
    },
    {
      title: 'Channel Management',
      description: 'Deploy to specific channels with custom permissions and role-based access controls.',
      icon: <GroupIcon />,
      color: '#6264A7',
    },
    {
      title: 'Enterprise Security',
      description: 'SOC 2 Type II compliance, data encryption, and enterprise-grade security controls.',
      icon: <SecurityIcon />,
      color: '#8B5CF6',
    },
    {
      title: 'Meeting Integration',
      description: 'AI assistant available during Teams meetings for real-time information and support.',
      icon: <VideoCallIcon />,
      color: '#0F4C75',
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
          Enterprise-Grade Teams Features
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
      title: 'HR Support & Policies',
      description: 'Instant answers about company policies, benefits, procedures, and HR guidelines.',
      example: '@FineTuner What\'s our remote work policy?',
      icon: <SupportAgentIcon />,
      color: '#464EB8',
      benefits: ['24/7 policy assistance', 'Reduced HR workload', 'Consistent information']
    },
    {
      title: 'IT Helpdesk Automation',
      description: 'Technical support, troubleshooting guides, and system documentation assistance.',
      example: '@FineTuner How do I reset my VPN connection?',
      icon: <SearchIcon />,
      color: '#6264A7',
      benefits: ['Faster issue resolution', 'Reduced ticket volume', 'Self-service support']
    },
    {
      title: 'Sales Enablement',
      description: 'Product information, competitive analysis, pricing, and sales process guidance.',
      example: '@FineTuner What are the key differentiators for Enterprise plan?',
      icon: <BusinessIcon />,
      color: '#2B579A',
      benefits: ['Faster deal closure', 'Consistent messaging', 'Real-time support']
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(180deg, ${alpha("#464EB8", 0.05)} 0%, ${alpha("#6264A7", 0.02)} 100%)`,
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
            color: '#464EB8',
          }}
        >
          Enterprise Teams Use Cases
        </Typography>

        <Grid container spacing={6}>
          {useCases.map((useCase, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.9),
                  border: `1px solid ${alpha(useCase.color, 0.3)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 16px 32px ${alpha(useCase.color, 0.2)}`,
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: alpha(useCase.color, 0.1),
                    color: useCase.color,
                    mb: 3,
                  }}
                >
                  {useCase.icon}
                </Avatar>

                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: useCase.color }}>
                  {useCase.title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                  {useCase.description}
                </Typography>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: '8px',
                    background: alpha(useCase.color, 0.05),
                    border: `1px solid ${alpha(useCase.color, 0.2)}`,
                    fontFamily: 'monospace',
                    mb: 3,
                  }}
                >
                  <Typography variant="body2" sx={{ color: useCase.color, fontWeight: 600 }}>
                    {useCase.example}
                  </Typography>
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                  Key Benefits:
                </Typography>
                <List dense>
                  {useCase.benefits.map((benefit, idx) => (
                    <ListItem key={idx} sx={{ px: 0, py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 20 }}>
                        <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={benefit} 
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

// Security & Compliance Section
const SecurityComplianceSection = () => {
  const theme = useTheme();

  const securityFeatures = [
    {
      title: 'Data Residency',
      description: 'Choose your data location with options for US, EU, and other regions to meet compliance requirements.',
      icon: '🌍',
    },
    {
      title: 'Encryption at Rest & Transit',
      description: 'AES-256 encryption for data storage and TLS 1.3 for all data transmission.',
      icon: '🔐',
    },
    {
      title: 'Audit Logging',
      description: 'Comprehensive audit trails for all bot interactions and administrative actions.',
      icon: '📊',
    },
    {
      title: 'Role-Based Access Control',
      description: 'Granular permissions based on Azure AD roles and custom access policies.',
      icon: '👥',
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
          Enterprise Security & Compliance
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
          Built for enterprise IT requirements with comprehensive security controls, compliance certifications, and data governance features.
        </Typography>

        <Grid container spacing={4}>
          {securityFeatures.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.8),
                  border: `1px solid ${alpha('#464EB8', 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 24px ${alpha('#464EB8', 0.1)}`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Typography variant="h4" sx={{ flexShrink: 0 }}>
                    {feature.icon}
                  </Typography>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#464EB8' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Paper sx={{ p: 4, bgcolor: alpha('#464EB8', 0.05), border: `1px solid ${alpha('#464EB8', 0.2)}` }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#464EB8' }}>
              🏆 Enterprise Certifications
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              SOC 2 Type II • ISO 27001 • GDPR Compliant • HIPAA Ready • Microsoft 365 Certified
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

// Benefits Section
const BenefitsSection = () => {
  const theme = useTheme();

  const benefits = [
    'Integrate with existing Teams workflows',
    'Reduce internal support ticket volume by 60%',
    'Enable 24/7 knowledge access for global teams',
    'Maintain enterprise security and compliance',
    'Scale knowledge sharing across departments',
    'Minimize training time for new employees',
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: alpha('#464EB8', 0.05),
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
              Why Choose Teams Integration?
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mb: 4,
                color: 'text.secondary',
                lineHeight: 1.7,
              }}
            >
              Transform your Teams workspace into an intelligent knowledge hub that empowers employees and reduces IT overhead.
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
                border: `1px solid ${alpha('#464EB8', 0.3)}`,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#464EB8', mb: 3 }}>
                Enterprise-Ready Features
              </Typography>

              <List>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Azure AD single sign-on" />
                </ListItem>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="SharePoint & OneDrive integration" />
                </ListItem>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Granular admin controls" />
                </ListItem>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Compliance and audit logging" />
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
        background: alpha('#464EB8', 0.05),
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
            Ready to Transform Your Teams Experience?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: 'text.secondary',
            }}
          >
            Deploy enterprise AI assistance in Microsoft Teams. Secure, compliant, and ready for your organization.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              startIcon={<GroupsIcon />}
              sx={{
                py: 2,
                px: 5,
                fontSize: '1.2rem',
                fontWeight: 700,
                borderRadius: '50px',
                background: 'linear-gradient(45deg, #464EB8, #6264A7)',
              }}
            >
              Start Teams Integration
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
                borderColor: '#464EB8',
                color: '#464EB8',
              }}
            >
              Enterprise Demo
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

const TeamsIntegrationPage = () => {
  useEffect(() => {
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
    
    document.title = 'Microsoft Teams AI Integration | Enterprise Chatbot | FineTuner';
    updateMetaTag('description', 'Deploy enterprise AI assistants in Microsoft Teams. Azure AD integration, SharePoint access, admin controls. Transform Teams into intelligent workspace with fine-tuned chatbots.');
    updateMetaTag('keywords', 'microsoft teams chatbot, teams AI integration, azure ad integration, sharepoint chatbot, enterprise teams bot, office 365 ai assistant');
    
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', 'https://finetuner.ai/integrations/teams');
    
    updateMetaTag('og:title', 'Microsoft Teams AI Integration | Enterprise Chatbot | FineTuner', true);
    updateMetaTag('og:description', 'Deploy enterprise AI assistants in Microsoft Teams. Azure AD integration, SharePoint access, admin controls. Transform Teams workspace.', true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:url', 'https://finetuner.ai/integrations/teams', true);
    updateMetaTag('og:image', 'https://finetuner.ai/assets/images/teams-integration-og.jpg', true);
    
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', 'Microsoft Teams AI Integration | Enterprise Chatbot | FineTuner');
    updateMetaTag('twitter:description', 'Deploy enterprise AI assistants in Microsoft Teams. Azure AD integration, SharePoint access, admin controls. Transform Teams workspace.');
    updateMetaTag('twitter:image', 'https://finetuner.ai/assets/images/teams-integration-twitter.jpg');
    
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "FineTuner Microsoft Teams Integration",
      "description": "Deploy enterprise AI assistants in Microsoft Teams. Azure AD integration, SharePoint access, admin controls. Transform Teams into intelligent workspace.",
      "url": "https://finetuner.ai/integrations/teams",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Microsoft Teams",
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
      "offers": {
        "@type": "Offer",
        "price": "29",
        "priceCurrency": "USD",
        "priceValidUntil": "2024-12-31"
      },
      "featureList": [
        "Azure AD integration",
        "SharePoint integration",
        "Admin controls",
        "Enterprise security",
        "Channel management",
        "Meeting integration",
        "Audit logging"
      ]
    });
    document.head.appendChild(schemaScript);
    
    return () => {
      if (schemaScript.parentNode) {
        schemaScript.parentNode.removeChild(schemaScript);
      }
    };
  }, []);

  return (
    <PageTransition>
      <SEOHead path="/integrations/teams" />
      <Box sx={{ minHeight: '100vh' }}>
        <Navbar />
        <HeroSection />
        <HowItWorksSection />
        <EnterpriseFeaturesSection />
        <UseCasesSection />
        <SecurityComplianceSection />
        <BenefitsSection />
        <CTASection />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default TeamsIntegrationPage;