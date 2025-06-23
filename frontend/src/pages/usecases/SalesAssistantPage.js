import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Divider,
  Avatar,
  Rating,
} from '@mui/material';
import {
  TrendingUp,
  Speed,
  AutoGraph,
  Chat,
  PersonAdd,
  Analytics,
  CheckCircle,
  PlayArrow,
  Timer,
  AttachMoney,
  Groups,
  Psychology,
  RocketLaunch,
  Star,
  Phone,
  Email,
  Schedule
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import SEOHead from '../../components/common/SEOHead';

const SalesAssistantPage = () => {
  const theme = useTheme();

  const benefits = [
    {
      icon: <TrendingUp color="primary" />,
      title: '3x Faster Lead Qualification',
      description: 'Automatically score and qualify leads based on your sales methodology and historical data'
    },
    {
      icon: <AutoGraph color="primary" />,
      title: '45% Higher Conversion Rates',
      description: 'Personalized outreach and follow-ups increase prospect engagement and closing rates'
    },
    {
      icon: <Timer color="primary" />,
      title: '60% Time Savings',
      description: 'Automate repetitive tasks like data entry, scheduling, and initial prospect research'
    },
    {
      icon: <AttachMoney color="primary" />,
      title: 'Increased Deal Size',
      description: 'AI-powered upselling and cross-selling recommendations based on customer profiles'
    }
  ];

  const features = [
    {
      title: 'Lead Scoring & Qualification',
      description: 'Automatically evaluate prospects using your custom criteria and sales playbook',
      icon: <Analytics color="primary" />
    },
    {
      title: 'Personalized Outreach',
      description: 'Generate customized emails, LinkedIn messages, and call scripts for each prospect',
      icon: <Email color="primary" />
    },
    {
      title: 'Meeting Scheduling',
      description: 'Intelligent calendar management and automated meeting setup with prospects',
      icon: <Schedule color="primary" />
    },
    {
      title: 'CRM Integration',
      description: 'Seamlessly sync with Salesforce, HubSpot, Pipedrive, and other CRM systems',
      icon: <Groups color="primary" />
    },
    {
      title: 'Deal Intelligence',
      description: 'Real-time insights on deal progress, risk factors, and next best actions',
      icon: <Psychology color="primary" />
    },
    {
      title: 'Competitive Analysis',
      description: 'Automated research on competitors and market positioning for each deal',
      icon: <RocketLaunch color="primary" />
    }
  ];

  const setupSteps = [
    {
      title: 'Upload Your Sales Materials',
      description: 'Import your sales playbooks, product sheets, case studies, and successful email templates',
      time: '5 minutes'
    },
    {
      title: 'Connect Your CRM',
      description: 'Integrate with Salesforce, HubSpot, or your existing CRM system for seamless data flow',
      time: '3 minutes'
    },
    {
      title: 'Configure Lead Scoring',
      description: 'Set up your qualification criteria, ideal customer profile, and scoring methodology',
      time: '10 minutes'
    },
    {
      title: 'Train Your Assistant',
      description: 'The AI learns from your historical deals, successful tactics, and sales approach',
      time: '2 minutes'
    },
    {
      title: 'Deploy & Test',
      description: 'Start with a small batch of leads to validate performance before full deployment',
      time: '5 minutes'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'VP Sales, TechFlow Inc',
      avatar: '/api/placeholder/64/64',
      rating: 5,
      quote: 'Our sales team closed 40% more deals in Q3 after implementing the AI sales assistant. The lead qualification alone saves us 15 hours per week.'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Sales Director, Growth Labs',
      avatar: '/api/placeholder/64/64',
      rating: 5,
      quote: 'The personalized outreach feature is incredible. Response rates improved from 8% to 23% almost immediately.'
    },
    {
      name: 'Jennifer Walsh',
      role: 'Head of Revenue, CloudScale',
      avatar: '/api/placeholder/64/64',
      rating: 5,
      quote: 'ROI was positive within 30 days. The AI handles all our initial prospect research and creates perfect cold email sequences.'
    }
  ];

  const useCases = [
    {
      title: 'SaaS Sales Teams',
      description: 'Qualify inbound leads, nurture trial users, and accelerate enterprise sales cycles',
      metrics: '3x faster lead qualification, 45% higher trial-to-paid conversion'
    },
    {
      title: 'Real Estate Agents',
      description: 'Nurture property inquiries, schedule viewings, and follow up with interested buyers',
      metrics: '60% more qualified appointments, 25% increase in closing rate'
    },
    {
      title: 'Insurance Brokers',
      description: 'Educate prospects on policies, handle objections, and schedule consultations',
      metrics: '50% reduction in time-to-quote, 35% more policies sold'
    },
    {
      title: 'B2B Service Providers',
      description: 'Qualify project inquiries, send proposals, and nurture long sales cycles',
      metrics: '2x more qualified opportunities, 30% shorter sales cycles'
    }
  ];

  return (
    <>
      <SEOHead 
        title="AI Sales Assistant Chatbot - Boost Sales by 45% | FineTuner"
        description="Create an AI sales assistant that qualifies leads 3x faster, increases conversion rates by 45%, and saves 60% of your sales team's time. Ready in under 30 minutes."
        keywords="AI sales assistant, sales chatbot, lead qualification, sales automation, CRM integration, sales AI, lead scoring"
        canonicalUrl="https://finetuner.ai/use-cases/sales-assistant"
      />
      
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "AI Sales Assistant Chatbot - Boost Sales by 45%",
            "description": "Learn how AI sales assistants help sales teams qualify leads faster, increase conversion rates, and automate repetitive sales tasks.",
            "author": {
              "@type": "Organization",
              "name": "FineTuner"
            },
            "publisher": {
              "@type": "Organization",
              "name": "FineTuner",
              "logo": {
                "@type": "ImageObject",
                "url": "https://finetuner.ai/logo.png"
              }
            },
            "datePublished": "2024-01-15",
            "dateModified": "2024-01-15"
          })}
        </script>
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Hero Section */}
          <Box textAlign="center" mb={8}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                color: 'transparent',
                mb: 2
              }}
            >
              AI Sales Assistant That Actually Closes Deals
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
              Transform your sales process with an AI assistant that qualifies leads 3x faster, 
              increases conversion rates by 45%, and handles repetitive tasks so your team can focus on closing deals.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
              <Chip icon={<TrendingUp />} label="3x Faster Qualification" color="primary" />
              <Chip icon={<AutoGraph />} label="45% Higher Conversion" color="secondary" />
              <Chip icon={<Timer />} label="60% Time Savings" />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<PlayArrow />}
                href="/register"
              >
                Build Your Sales Assistant
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                href="#demo"
              >
                See Live Demo
              </Button>
            </Box>
          </Box>

          {/* Results Section */}
          <Alert severity="success" sx={{ mb: 6, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <strong>Real Results from Sales Teams:</strong>
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" color="success.main" fontWeight="bold">3x</Typography>
                <Typography variant="body2">Faster Lead Qualification</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" color="success.main" fontWeight="bold">45%</Typography>
                <Typography variant="body2">Higher Conversion Rate</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" color="success.main" fontWeight="bold">60%</Typography>
                <Typography variant="body2">Time Savings</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" color="success.main" fontWeight="bold">30%</Typography>
                <Typography variant="body2">Larger Deal Size</Typography>
              </Grid>
            </Grid>
          </Alert>

          {/* Benefits Grid */}
          <Typography variant="h3" gutterBottom sx={{ mb: 4 }}>
            Why Sales Teams Choose AI Assistants
          </Typography>

          <Grid container spacing={4} sx={{ mb: 8 }}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%', p: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      {benefit.icon}
                      <Typography variant="h6">{benefit.title}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Features Section */}
          <Typography variant="h3" gutterBottom sx={{ mb: 4 }}>
            Complete Sales Automation Suite
          </Typography>

          <Grid container spacing={3} sx={{ mb: 8 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      {feature.icon}
                      <Typography variant="h6">{feature.title}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Setup Process */}
          <Typography variant="h3" gutterBottom sx={{ mb: 4 }}>
            Get Started in Under 30 Minutes
          </Typography>

          <Card sx={{ mb: 8 }}>
            <CardContent>
              <Stepper orientation="vertical" sx={{ '& .MuiStepContent-root': { pl: 4 } }}>
                {setupSteps.map((step, index) => (
                  <Step key={index} active completed={false}>
                    <StepLabel>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Typography variant="h6">{step.title}</Typography>
                        <Chip label={step.time} size="small" color="primary" />
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {step.description}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          {/* Use Cases */}
          <Typography variant="h3" gutterBottom sx={{ mb: 4 }}>
            Success Stories Across Industries
          </Typography>

          <Grid container spacing={3} sx={{ mb: 8 }}>
            {useCases.map((useCase, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{useCase.title}</Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {useCase.description}
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight="bold" color="success.dark">
                        Results: {useCase.metrics}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Testimonials */}
          <Typography variant="h3" gutterBottom sx={{ mb: 4 }}>
            What Sales Leaders Say
          </Typography>

          <Grid container spacing={3} sx={{ mb: 8 }}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar src={testimonial.avatar} alt={testimonial.name} />
                      <Box>
                        <Typography variant="subtitle2">{testimonial.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                    <Rating value={testimonial.rating} readOnly size="small" sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      "{testimonial.quote}"
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Call to Action */}
          <Card sx={{ textAlign: 'center', background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
            <CardContent sx={{ py: 6 }}>
              <Typography variant="h4" gutterBottom>
                Ready to 3x Your Sales Performance?
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
                Join 500+ sales teams using AI assistants to qualify leads faster, close more deals, 
                and focus on what they do best - building relationships with customers.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<PlayArrow />}
                  href="/register"
                >
                  Start Free Trial
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  href="/help"
                >
                  Schedule Demo
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Setup in 30 minutes • No credit card required • 14-day free trial
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </>
  );
};

export default SalesAssistantPage;