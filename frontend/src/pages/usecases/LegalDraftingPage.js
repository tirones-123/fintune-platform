import React, { useEffect } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Avatar, Stack, useTheme, alpha, Chip, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import PageTransition from '../../components/common/PageTransition';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import SEOHead from '../../components/common/SEOHead';
import GavelIcon from '@mui/icons-material/Gavel';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';

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
                  label="LegalTech AI"
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
                  Draft Legal Contracts 4× Faster
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
                  Generate <strong style={{ color: '#00d4ff' }}>GDPR-compliant clauses</strong> in seconds from your own precedent library using fine-tuned AI models.
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
                    onClick={() => document.getElementById('roi-section').scrollIntoView({ behavior: 'smooth' })}
                  >
                    Calculate Savings
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
                  <GavelIcon sx={{ fontSize: 120, color: '#bf00ff' }} />
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
                    <DescriptionIcon sx={{ fontSize: 40, color: '#00d4ff' }} />
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
    { value: '4×', label: 'Faster contract drafting', icon: <SpeedIcon /> },
    { value: '100%', label: 'GDPR compliance guaranteed', icon: <VerifiedUserIcon /> },
    { value: '75%', label: 'Reduction in legal review time', icon: <AccessTimeIcon /> },
    { value: '€50k+', label: 'Annual savings per lawyer', icon: <AttachMoneyIcon /> },
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
      title: 'Precedent-based AI training',
      description: 'Train models on your firm\'s successful contract templates and clause libraries for consistent, proven language.',
      icon: <SmartToyIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: 'GDPR compliance automation',
      description: 'Built-in compliance checks ensure every generated clause meets current data protection regulations.',
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Seamless workflow integration',
      description: 'Works with your existing legal software including DocuSign, LexisNexis, and document management systems.',
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
          Why choose AI-powered legal drafting?
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

// ROI Section
const ROISection = () => {
  const theme = useTheme();

  const roiData = [
    { label: 'Average hourly rate (senior lawyer)', value: '€350', negative: true },
    { label: 'Hours to draft complex contract manually', value: '8 hrs', negative: true },
    { label: 'Hours with AI assistance', value: '2 hrs', positive: true },
    { label: 'Time savings per contract', value: '6 hrs', positive: true },
    { label: 'Cost savings per contract', value: '€2,100', highlight: true },
  ];

  return (
    <Box
      id="roi-section"
      sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(180deg, ${alpha("#050224", 1)} 0%, ${alpha("#0a043c", 1)} 100%)`,
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontWeight: 800,
            textAlign: 'center',
            mb: 6,
            color: 'white',
          }}
        >
          Calculate your return on investment
        </Typography>

        <Paper
          sx={{
            p: 4,
            borderRadius: '16px',
            background: alpha(theme.palette.background.paper, 0.1),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          <List>
            {roiData.map((item, index) => (
              <ListItem
                key={index}
                sx={{
                  py: 2,
                  borderBottom: index < roiData.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '1.1rem',
                    color: 'text.primary',
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: item.positive ? 'success.main' : item.negative ? 'error.main' : item.highlight ? 'primary.main' : 'text.primary',
                  }}
                >
                  {item.value}
                </Typography>
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              startIcon={<AttachMoneyIcon />}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: '50px',
              }}
            >
              Start Saving on Legal Costs
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

// Tutorial Section
const TutorialSection = () => {
  const theme = useTheme();

  const steps = [
    {
      title: 'Upload your precedents',
      description: 'Import contract templates, successful clauses, and legal precedents from your firm\'s knowledge base.',
      icon: <CloudUploadIcon />,
    },
    {
      title: 'Train your legal AI',
      description: 'Our platform creates specialized datasets and fine-tunes models on your legal language and style.',
      icon: <SmartToyIcon />,
    },
    {
      title: 'Generate compliant contracts',
      description: 'Draft contracts with AI assistance, ensuring consistency with your precedents and regulatory compliance.',
      icon: <DescriptionIcon />,
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
      title: 'Corporate M&A Contracts',
      description: 'Generate acquisition agreements, due diligence clauses, and regulatory compliance sections.',
      features: ['Regulatory compliance', 'Due diligence automation', 'Risk assessment clauses'],
      icon: '🏢',
    },
    {
      title: 'Employment Agreements',
      description: 'Create GDPR-compliant employment contracts with personalized terms and conditions.',
      features: ['GDPR compliance', 'Custom benefit packages', 'Termination clauses'],
      icon: '👥',
    },
    {
      title: 'SaaS Terms of Service',
      description: 'Draft comprehensive ToS and privacy policies for software companies and startups.',
      features: ['Privacy policy generation', 'Data processing clauses', 'Liability limitations'],
      icon: '⚙️',
    },
    {
      title: 'Real Estate Contracts',
      description: 'Generate purchase agreements, lease contracts, and property management terms.',
      features: ['Property-specific clauses', 'Local law compliance', 'Financial terms'],
      icon: '🏠',
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
          Legal Use Cases
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
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {useCase.title}
                  </Typography>
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
            Ready to accelerate your legal drafting?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: 'text.secondary',
            }}
          >
            Join leading law firms that have already transformed their contract drafting with FineTuner.
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
              Talk to Legal Expert
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

const LegalDraftingPage = () => {
  return (
    <PageTransition>
      <SEOHead path="/use-cases/legal-drafting" />
      
      <Box sx={{ minHeight: '100vh', background: `linear-gradient(180deg, ${alpha("#0a043c", 1)} 0%, ${alpha("#03001e", 1)} 100%)` }}>
        <Navbar />
        <HeroSection />
        <StatsSection />
        <BenefitsSection />
        <ROISection />
        <TutorialSection />
        <UseCasesSection />
        <CTASection />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default LegalDraftingPage; 