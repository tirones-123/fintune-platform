import React, { useEffect } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Avatar, Stack, useTheme, alpha, Chip, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import PageTransition from '../../components/common/PageTransition';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import SEOHead from '../../components/common/SEOHead';
import QuizIcon from '@mui/icons-material/Quiz';
import SpeedIcon from '@mui/icons-material/Speed';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DescriptionIcon from '@mui/icons-material/Description';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import UpdateIcon from '@mui/icons-material/Update';
import CodeIcon from '@mui/icons-material/Code';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
                  label="No-Code Knowledge Base AI"
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
                  Instant Internal FAQ Bot with GPT-4
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
                  Turn your documentation into a <strong style={{ color: '#00d4ff' }}>self-updating FAQ bot</strong> in under 10 minutes. No coding required, just upload your docs and let AI handle the rest.
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
                    Create Your Bot Now
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
                    borderRadius: '20px',
                    background: 'radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    border: `2px solid ${alpha('#00d4ff', 0.3)}`,
                  }}
                >
                  <QuizIcon sx={{ fontSize: 120, color: '#00d4ff' }} />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: alpha('#bf00ff', 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <DescriptionIcon sx={{ fontSize: 30, color: '#bf00ff' }} />
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 20,
                      left: 20,
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: alpha('#84fab0', 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SmartToyIcon sx={{ fontSize: 30, color: '#84fab0' }} />
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
    { value: '<10min', label: 'Setup time', icon: <SpeedIcon /> },
    { value: '90%', label: 'Questions answered instantly', icon: <QuizIcon /> },
    { value: '24/7', label: 'Always available', icon: <AccessTimeIcon /> },
    { value: '0', label: 'Code required', icon: <CodeIcon /> },
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
      title: 'No-code setup in minutes',
      description: 'Upload your docs, PDFs, or knowledge base and get an instant FAQ bot. No technical skills required.',
      icon: <CloudUploadIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Self-updating knowledge',
      description: 'The bot learns from new documents and conversations, keeping answers current without manual updates.',
      icon: <UpdateIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Intelligent search & response',
      description: 'Advanced GPT-4 fine-tuning ensures accurate, contextual answers that understand employee intent.',
      icon: <SearchIcon sx={{ fontSize: 40 }} />,
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
          Why teams love our Internal FAQ Bot
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
          See it in action
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
          Watch how easy it is to create an intelligent FAQ bot from your documentation
        </Typography>

        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                background: alpha(theme.palette.background.paper, 0.1),
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                p: 4,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, color: 'white' }}>
                Live Demo Chat
              </Typography>
              
              {/* Simulated chat interface */}
              <Box sx={{ height: 300, overflowY: 'auto', mb: 3 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Box sx={{ 
                      background: theme.palette.primary.main, 
                      color: 'white', 
                      p: 2, 
                      borderRadius: '12px 12px 4px 12px',
                      maxWidth: '80%'
                    }}>
                      What's our vacation policy?
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Box sx={{ 
                      background: alpha(theme.palette.background.paper, 0.8), 
                      p: 2, 
                      borderRadius: '12px 12px 12px 4px',
                      maxWidth: '80%'
                    }}>
                      According to the HR documentation, employees receive 25 days of paid vacation annually. You can request vacation through the HR portal at least 2 weeks in advance.
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Box sx={{ 
                      background: theme.palette.primary.main, 
                      color: 'white', 
                      p: 2, 
                      borderRadius: '12px 12px 4px 12px',
                      maxWidth: '80%'
                    }}>
                      How do I submit expenses?
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Box sx={{ 
                      background: alpha(theme.palette.background.paper, 0.8), 
                      p: 2, 
                      borderRadius: '12px 12px 12px 4px',
                      maxWidth: '80%'
                    }}>
                      You can submit expenses through the Finance portal. Upload receipts, fill in the expense form, and submit for approval. Reimbursement takes 5-7 business days.
                    </Box>
                  </Box>
                </Stack>
              </Box>
              
              <Box sx={{ 
                display: 'flex',
                background: alpha(theme.palette.background.default, 0.5),
                borderRadius: '25px',
                p: 1
              }}>
                <Typography variant="body2" sx={{ 
                  color: alpha(theme.palette.text.secondary, 0.6), 
                  flexGrow: 1, 
                  px: 2, 
                  py: 1 
                }}>
                  Ask anything about company policies...
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
                Built from these documents:
              </Typography>
              
              {['HR_Handbook.pdf', 'Finance_Policies.docx', 'IT_Guidelines.md', 'Company_Benefits.pdf'].map((doc, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  p: 2,
                  background: alpha(theme.palette.background.paper, 0.1),
                  borderRadius: '8px'
                }}>
                  <DescriptionIcon sx={{ color: theme.palette.primary.main }} />
                  <Typography variant="body1" sx={{ color: 'white' }}>
                    {doc}
                  </Typography>
                  <CheckCircleIcon sx={{ color: 'success.main', ml: 'auto' }} />
                </Box>
              ))}
            </Stack>
          </Grid>
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
      title: 'HR Knowledge Base',
      description: 'Instant answers about policies, benefits, procedures, and company guidelines.',
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      examples: ['Vacation policies', 'Expense submission', 'Benefits enrollment', 'Remote work guidelines'],
    },
    {
      title: 'IT Support Documentation',
      description: 'Technical troubleshooting, setup guides, and system documentation at your fingertips.',
      icon: <IntegrationInstructionsIcon sx={{ fontSize: 40 }} />,
      examples: ['Software installation', 'VPN setup', 'Password reset', 'Hardware requests'],
    },
    {
      title: 'Sales Playbooks',
      description: 'Product information, pricing, competitive analysis, and sales processes.',
      icon: <BusinessCenterIcon sx={{ fontSize: 40 }} />,
      examples: ['Product features', 'Pricing tiers', 'Competitor comparison', 'Sales scripts'],
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
          Popular use cases for Internal FAQ Bots
        </Typography>

        <Grid container spacing={4}>
          {useCases.map((useCase, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.6),
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 24px ${alpha(theme.palette.common.black, 0.1)}`,
                  },
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 3 }}>
                  {useCase.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  {useCase.title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                  {useCase.description}
                </Typography>
                
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Common questions:
                </Typography>
                <List dense>
                  {useCase.examples.map((example, idx) => (
                    <ListItem key={idx} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <CheckCircleIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={example} 
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

// Setup Process Section
const SetupProcessSection = () => {
  const theme = useTheme();

  const steps = [
    {
      title: 'Upload your documents',
      description: 'Drag & drop PDFs, Word docs, or paste text. We support all major document formats.',
      icon: <CloudUploadIcon />,
      time: '2 min',
    },
    {
      title: 'AI processes everything',
      description: 'Our fine-tuning engine automatically creates an optimized knowledge base from your content.',
      icon: <SmartToyIcon />,
      time: '5 min',
    },
    {
      title: 'Deploy your bot',
      description: 'Get an instant embed code, API, or integration link. Start answering questions immediately.',
      icon: <IntegrationInstructionsIcon />,
      time: '2 min',
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
          From documents to bot in under 10 minutes
        </Typography>

        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box sx={{ textAlign: 'center', position: 'relative' }}>
                {index < steps.length - 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 40,
                      right: { xs: '50%', md: -60 },
                      transform: { xs: 'translateX(50%) rotate(90deg)', md: 'none' },
                      color: 'primary.main',
                      fontSize: '2rem',
                      zIndex: 1,
                    }}
                  >
                    →
                  </Box>
                )}
                
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    margin: '0 auto 24px auto',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  {step.icon}
                </Avatar>
                
                <Chip 
                  label={step.time} 
                  size="small" 
                  sx={{ 
                    mb: 2,
                    bgcolor: 'success.main',
                    color: 'white',
                    fontWeight: 600,
                  }} 
                />
                
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

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
            Total time: &lt;10 minutes
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
            No coding, no complex setup, no technical knowledge required
          </Typography>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            size="large"
            startIcon={<SpeedIcon />}
            sx={{
              py: 2,
              px: 5,
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: '50px',
            }}
          >
            Start Your 10-Minute Setup
          </Button>
        </Box>
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
            Ready to eliminate repetitive questions?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: 'text.secondary',
            }}
          >
            Join thousands of teams who've automated their internal knowledge sharing with FineTuner.
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
              Get Started Free
            </Button>
            <Button
              component="a"
              href="#demo-section"
              variant="outlined"
              size="large"
              sx={{
                py: 2,
                px: 5,
                fontSize: '1.2rem',
                borderRadius: '50px',
              }}
            >
              Try the Demo
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

const InternalFaqPage = () => {
  return (
    <PageTransition>
      <SEOHead path="/use-cases/internal-faq" />
      <Box sx={{ minHeight: '100vh', background: `linear-gradient(180deg, ${alpha("#0a043c", 1)} 0%, ${alpha("#03001e", 1)} 100%)` }}>
        <Navbar />
        <HeroSection />
        <StatsSection />
        <BenefitsSection />
        <DemoSection />
        <UseCasesSection />
        <SetupProcessSection />
        <CTASection />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default InternalFaqPage; 