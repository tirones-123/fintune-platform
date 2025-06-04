import React, { useEffect } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Avatar, Stack, useTheme, alpha, Chip, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import PageTransition from '../../components/common/PageTransition';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import EuroIcon from '@mui/icons-material/Euro';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
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
                  label="AI Customer Support"
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
                  Transform your customer support with a fine-tuned chatbot
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
                  Reduce <strong style={{ color: '#00d4ff' }}>65% of your response time</strong> and improve customer satisfaction with an AI assistant trained on your specific data.
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
                    View ROI
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
                  <SupportAgentIcon sx={{ fontSize: 120, color: '#00d4ff' }} />
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
                    <SmartToyIcon sx={{ fontSize: 40, color: '#bf00ff' }} />
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
    { value: '65%', label: 'Response time reduction', icon: <SpeedIcon /> },
    { value: '24/7', label: 'Continuous availability', icon: <AccessTimeIcon /> },
    { value: '89%', label: 'Customer satisfaction rate', icon: <SentimentSatisfiedAltIcon /> },
    { value: '3x', label: 'ROI in 6 months', icon: <TrendingDownIcon /> },
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
  const { t } = useTranslation();

  const benefits = [
    {
      title: 'Intelligent ticket automation',
      description: 'Automatically sort and respond to recurring requests, freeing up your team for complex cases.',
      icon: <AutoFixHighIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Personalized and accurate responses',
      description: 'The chatbot uses your knowledge base to provide responses consistent with your brand.',
      icon: <SupportAgentIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Easy integration with your tools',
      description: 'Compatible with Zendesk, Intercom, Slack and more. Deploy in just a few clicks.',
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
          Why choose a fine-tuned support chatbot?
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
    { label: 'Average cost per ticket (human)', value: '$18', negative: true },
    { label: 'Average cost per ticket (AI)', value: '$2.4', positive: true },
    { label: 'Savings per ticket', value: '$15.6', positive: true },
    { label: 'Tickets processed per month', value: '5,000' },
    { label: 'Monthly savings', value: '$78,000', highlight: true },
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
              startIcon={<EuroIcon />}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: '50px',
              }}
            >
              Start Saving Money
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
      title: 'Import your data',
      description: 'FAQ, ticket history, product documentation - everything that helps your support team.',
      icon: <CloudUploadIcon />,
    },
    {
      title: 'Train your model',
      description: 'Our platform automatically creates an optimized dataset and launches fine-tuning.',
      icon: <SmartToyIcon />,
    },
    {
      title: 'Deploy to production',
      description: 'Integrate your chatbot with existing tools via API or ready-to-use widgets.',
      icon: <IntegrationInstructionsIcon />,
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

// Case Studies Section
const CaseStudiesSection = () => {
  const theme = useTheme();

  const caseStudies = [
    {
      company: 'TechStart Inc.',
      industry: 'SaaS Platform',
      challenge: 'Overwhelmed support team handling 2,000+ tickets monthly',
      solution: 'Implemented fine-tuned chatbot trained on knowledge base and past tickets',
      results: ['75% reduction in response time', '40% decrease in ticket volume', '$45,000 monthly savings'],
      metric: '75%',
      metricLabel: 'faster responses',
    },
    {
      company: 'E-commerce Pro',
      industry: 'Online Retail',
      challenge: 'Customer inquiries about orders, returns, and product specifications',
      solution: 'Custom chatbot integrated with order management and product catalog',
      results: ['24/7 instant support', '85% customer satisfaction', '60% fewer escalations'],
      metric: '24/7',
      metricLabel: 'availability',
    },
    {
      company: 'FinanceFlow',
      industry: 'Financial Services',
      challenge: 'Complex regulatory questions requiring accurate, compliant responses',
      solution: 'Highly specialized chatbot trained on compliance documents and procedures',
      results: ['100% compliance accuracy', '90% first-contact resolution', 'Enhanced customer trust'],
      metric: '100%',
      metricLabel: 'compliance rate',
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
            background: 'linear-gradient(145deg, #bf00ff, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Real Success Stories from Our Customers
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
          Discover how companies across different industries have transformed their customer support operations with FineTuner's AI-powered chatbots. These real-world examples demonstrate the tangible benefits of implementing fine-tuned customer support solutions.
        </Typography>

        <Grid container spacing={4}>
          {caseStudies.map((study, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.8),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                    {study.metric}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {study.metricLabel}
                  </Typography>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {study.company}
                </Typography>
                <Chip label={study.industry} size="small" sx={{ mb: 3 }} />

                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'error.main' }}>
                  Challenge:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  {study.challenge}
                </Typography>

                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'info.main' }}>
                  Solution:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  {study.solution}
                </Typography>

                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
                  Results:
                </Typography>
                <List dense>
                  {study.results.map((result, idx) => (
                    <ListItem key={idx} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={result} 
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Want to achieve similar results for your business? Our customer support fine-tuning experts can help you implement a solution tailored to your specific needs and industry requirements.
          </Typography>
          <Button
            component={RouterLink}
            to="/register"
            variant="outlined"
            size="large"
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.1rem',
              borderRadius: '50px',
            }}
          >
            Get Your Custom Quote
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

// Integration Options Section
const IntegrationOptionsSection = () => {
  const theme = useTheme();

  const integrations = [
    {
      name: 'Zendesk',
      description: 'Seamlessly integrate with your existing Zendesk setup to automatically handle common tickets and escalate complex issues.',
      features: ['Auto-ticket routing', 'Knowledge base sync', 'Agent handoff'],
      icon: '🎫',
    },
    {
      name: 'Intercom',
      description: 'Connect directly to your Intercom messenger to provide instant responses to customer inquiries.',
      features: ['Live chat integration', 'User context awareness', 'Conversation history'],
      icon: '💬',
    },
    {
      name: 'Slack',
      description: 'Enable internal support workflows with slash commands and automated responses for team collaboration.',
      features: ['Slash commands', 'Channel integration', 'Team notifications'],
      icon: '⚡',
    },
    {
      name: 'Website Widget',
      description: 'Deploy a customizable chat widget on your website that matches your brand and provides instant support.',
      features: ['Custom branding', 'Mobile responsive', 'Analytics tracking'],
      icon: '🌐',
    },
    {
      name: 'API Integration',
      description: 'Build custom integrations using our RESTful API to connect with any existing system or platform.',
      features: ['RESTful endpoints', 'Webhook support', 'Real-time responses'],
      icon: '⚙️',
    },
    {
      name: 'Microsoft Teams',
      description: 'Bring AI-powered support directly into your Microsoft Teams workspace for internal help desk operations.',
      features: ['Bot integration', 'Channel support', 'File sharing'],
      icon: '👥',
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
            mb: 3,
          }}
        >
          Integrate with Your Existing Tools
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            mb: 8,
            maxWidth: 800,
            mx: 'auto',
            lineHeight: 1.7,
          }}
        >
          FineTuner's customer support chatbots work seamlessly with popular support platforms and communication tools. No need to change your existing workflow – our AI enhances what you already use.
        </Typography>

        <Grid container spacing={4}>
          {integrations.map((integration, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  p: 3,
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h4" sx={{ mr: 2 }}>
                    {integration.icon}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {integration.name}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                  {integration.description}
                </Typography>

                <List dense>
                  {integration.features.map((feature, idx) => (
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

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
            Don't see your platform listed? Our API-first approach means we can integrate with virtually any system. Contact our technical team to discuss custom integration options for your specific requirements.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              component="a"
              href="https://docs.finetuner.ai/integrations"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="large"
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1rem',
                borderRadius: '50px',
              }}
            >
              View Integration Docs
            </Button>
            <Button
              component={RouterLink}
              to="/integrations/slack"
              variant="text"
              size="large"
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1rem',
                borderRadius: '50px',
              }}
            >
              Explore Slack Integration
            </Button>
          </Stack>
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
            Ready to transform your customer support?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: 'text.secondary',
            }}
          >
            Join hundreds of companies that have already automated their support with FineTuner.
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
              Talk to an Expert
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

const SupportChatbotPage = () => {
  // SEO meta tags management
  useEffect(() => {
    // Save original title
    const originalTitle = document.title;
    
    // Update title - keeping under 60 characters
    document.title = 'AI Customer Support Chatbot Fine-Tuning | FineTuner';
    
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
    const metaDescription = updateMetaTag('description', 'Transform customer support with AI fine-tuning. Reduce response time by 65%, improve satisfaction, and save $78,000 monthly. Get ROI calculator and tutorial.');
    const metaKeywords = updateMetaTag('keywords', 'customer support AI, chatbot fine-tuning, support automation, ticket reduction, AI customer service, support ROI, fine-tuned chatbot');
    
    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', 'https://finetuner.ai/use-cases/support-chatbot');
    
    // Open Graph tags
    const ogTitle = updateMetaTag('og:title', 'AI Customer Support Chatbot Fine-Tuning | FineTuner', true);
    const ogDescription = updateMetaTag('og:description', 'Transform customer support with AI fine-tuning. Reduce response time by 65%, improve satisfaction, and save $78,000 monthly.', true);
    const ogType = updateMetaTag('og:type', 'website', true);
    const ogUrl = updateMetaTag('og:url', 'https://finetuner.ai/use-cases/support-chatbot', true);
    const ogImage = updateMetaTag('og:image', 'https://finetuner.ai/assets/images/support-chatbot-og.jpg', true);
    
    // Twitter Card tags
    const twitterCard = updateMetaTag('twitter:card', 'summary_large_image');
    const twitterTitle = updateMetaTag('twitter:title', 'AI Customer Support Chatbot Fine-Tuning | FineTuner');
    const twitterDescription = updateMetaTag('twitter:description', 'Transform customer support with AI fine-tuning. Reduce response time by 65%, improve satisfaction, and save $78,000 monthly.');
    const twitterImage = updateMetaTag('twitter:image', 'https://finetuner.ai/assets/images/support-chatbot-twitter.jpg');
    
    // Schema.org structured data - Enhanced with more details
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "AI Customer Support Chatbot Fine-Tuning",
      "description": "Transform customer support with AI fine-tuning. Reduce response time by 65%, improve satisfaction, and save $78,000 monthly.",
      "url": "https://finetuner.ai/use-cases/support-chatbot",
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
      "mainEntity": {
        "@type": "SoftwareApplication",
        "name": "FineTuner Customer Support Chatbot",
        "applicationCategory": "BusinessApplication",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "127"
        },
        "offers": {
          "@type": "Offer",
          "price": "29",
          "priceCurrency": "USD",
          "priceValidUntil": "2024-12-31"
        },
        "featureList": [
          "65% response time reduction",
          "24/7 customer support",
          "Integration with existing tools",
          "Custom training on your data"
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
        <StatsSection />
        <BenefitsSection />
        <ROISection />
        <TutorialSection />
        <CaseStudiesSection />
        <IntegrationOptionsSection />
        <CTASection />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default SupportChatbotPage; 