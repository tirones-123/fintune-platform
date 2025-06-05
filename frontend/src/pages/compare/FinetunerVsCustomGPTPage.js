import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import BuildIcon from '@mui/icons-material/Build';
import CodeIcon from '@mui/icons-material/Code';
import CloudIcon from '@mui/icons-material/Cloud';
import SecurityIcon from '@mui/icons-material/Security';
import SupportIcon from '@mui/icons-material/Support';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

// Hero Section
const HeroSection = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: { xs: 12, md: 16 },
        pb: { xs: 8, md: 12 },
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              component="h1"
              variant="h2"
              sx={{
                fontWeight: 900,
                mb: 3,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              Finetuner vs CustomGPT.ai
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}
            >
              Compare dataset size, output quality & costs between Finetuner and CustomGPT.ai.
              Get the complete breakdown to make the right choice for your AI project.
            </Typography>
            
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                size="large"
                startIcon={<TrendingUpIcon />}
                sx={{ px: 4, py: 1.5, borderRadius: 3 }}
              >
                Try Finetuner Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{ px: 4, py: 1.5, borderRadius: 3 }}
                onClick={() => document.getElementById('comparison-table')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Comparison
              </Button>
            </Stack>
          </Box>

          {/* Quick stats */}
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 60, height: 60 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Finetuner
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Advanced fine-tuning platform with unlimited dataset size and enterprise-grade security
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 2, width: 60, height: 60 }}>
                  <BuildIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  CustomGPT.ai
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No-code chatbot builder with limited dataset capacity and basic customization
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

// Quick Overview Section
const QuickOverviewSection = () => {
  const theme = useTheme();

  const overviewData = [
    {
      aspect: 'Dataset Size',
      finetuner: 'Unlimited',
      customgpt: 'Up to 5MB',
      winner: 'finetuner',
      description: 'Finetuner handles massive datasets while CustomGPT is severely limited'
    },
    {
      aspect: 'Output Quality',
      finetuner: 'Enterprise-grade',
      customgpt: 'Basic',
      winner: 'finetuner',
      description: 'Advanced fine-tuning produces higher quality, more accurate responses'
    },
    {
      aspect: 'Cost Efficiency',
      finetuner: '$0.50/1K tokens',
      customgpt: '$89/month',
      winner: 'finetuner',
      description: 'Pay-per-use vs fixed monthly costs - better for most use cases'
    },
    {
      aspect: 'Setup Time',
      finetuner: '15 minutes',
      customgpt: '5 minutes',
      winner: 'customgpt',
      description: 'CustomGPT has simpler initial setup but limited capabilities'
    },
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            fontWeight={800}
            gutterBottom
            sx={{ mb: 6 }}
          >
            Quick Overview: Key Differences
          </Typography>

          <Grid container spacing={3}>
            {overviewData.map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    p: 3,
                    border: item.winner === 'finetuner' ? `2px solid ${theme.palette.primary.main}` : 'none',
                    position: 'relative',
                  }}
                >
                  {item.winner === 'finetuner' && (
                    <Chip
                      label="Finetuner Wins"
                      color="primary"
                      size="small"
                      sx={{ position: 'absolute', top: 16, right: 16 }}
                    />
                  )}
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {item.aspect}
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Finetuner:</Typography>
                      <Typography variant="body1" fontWeight={600} color={item.winner === 'finetuner' ? 'primary.main' : 'text.primary'}>
                        {item.finetuner}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">CustomGPT:</Typography>
                      <Typography variant="body1" fontWeight={600} color={item.winner === 'customgpt' ? 'secondary.main' : 'text.primary'}>
                        {item.customgpt}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {item.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

// Detailed Comparison Table
const ComparisonTableSection = () => {
  const theme = useTheme();

  const comparisonData = [
    {
      category: 'Dataset & Training',
      features: [
        { feature: 'Maximum Dataset Size', finetuner: 'Unlimited', customgpt: '5MB limit', winner: 'finetuner' },
        { feature: 'File Format Support', finetuner: 'PDF, TXT, DOCX, CSV, JSON', customgpt: 'TXT, PDF only', winner: 'finetuner' },
        { feature: 'Training Quality', finetuner: 'Advanced fine-tuning', customgpt: 'Basic embedding', winner: 'finetuner' },
        { feature: 'Custom Instructions', finetuner: 'Full control', customgpt: 'Limited templates', winner: 'finetuner' },
      ]
    },
    {
      category: 'Performance & Output',
      features: [
        { feature: 'Response Accuracy', finetuner: '95%+', customgpt: '75-85%', winner: 'finetuner' },
        { feature: 'Context Retention', finetuner: 'Excellent', customgpt: 'Good', winner: 'finetuner' },
        { feature: 'Response Speed', finetuner: '< 2 seconds', customgpt: '2-4 seconds', winner: 'finetuner' },
        { feature: 'Multi-language Support', finetuner: '100+ languages', customgpt: 'English + 10', winner: 'finetuner' },
      ]
    },
    {
      category: 'Integration & Deployment',
      features: [
        { feature: 'API Access', finetuner: 'Full REST API', customgpt: 'Basic API', winner: 'finetuner' },
        { feature: 'Custom Integrations', finetuner: 'Unlimited', customgpt: 'Pre-built only', winner: 'finetuner' },
        { feature: 'White-label Options', finetuner: 'Available', customgpt: 'Not available', winner: 'finetuner' },
        { feature: 'Embedding Options', finetuner: 'Multiple platforms', customgpt: 'Widget only', winner: 'finetuner' },
      ]
    },
    {
      category: 'Pricing & Support',
      features: [
        { feature: 'Starting Price', finetuner: 'Pay-per-use', customgpt: '$89/month', winner: 'finetuner' },
        { feature: 'Free Tier', finetuner: 'Yes (generous)', customgpt: 'Limited trial', winner: 'finetuner' },
        { feature: 'Enterprise Support', finetuner: '24/7 dedicated', customgpt: 'Email only', winner: 'finetuner' },
        { feature: 'Setup Assistance', finetuner: 'Included', customgpt: 'Extra cost', winner: 'finetuner' },
      ]
    },
  ];

  const getRatingIcon = (winner, platform) => {
    if (winner === platform) {
      return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />;
    }
    return <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />;
  };

  return (
    <Box id="comparison-table" sx={{ py: { xs: 6, md: 10 }, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            fontWeight={800}
            gutterBottom
            sx={{ mb: 6 }}
          >
            Feature-by-Feature Comparison
          </Typography>

          {comparisonData.map((section, sectionIndex) => (
            <Card key={sectionIndex} sx={{ mb: 4, overflow: 'hidden' }}>
              <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  {section.category}
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: '40%' }}>Feature</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Finetuner</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>CustomGPT.ai</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Winner</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {section.features.map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{row.feature}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{row.finetuner}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{row.customgpt}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {row.winner === 'finetuner' ? (
                            <Chip label="Finetuner" color="primary" size="small" />
                          ) : (
                            <Chip label="CustomGPT" color="default" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          ))}
        </motion.div>
      </Container>
    </Box>
  );
};

// Pricing Comparison Section
const PricingComparisonSection = () => {
  const theme = useTheme();

  const pricingPlans = [
    {
      name: 'Finetuner',
      subtitle: 'Pay-per-use model',
      price: '$0.50',
      period: 'per 1K tokens',
      features: [
        'Unlimited dataset size',
        'Advanced fine-tuning',
        'Full API access',
        'Enterprise security',
        '24/7 support',
        'White-label options',
        'Custom integrations',
        'Free tier included'
      ],
      popular: true,
      cta: 'Start Free Trial',
      link: '/register',
    },
    {
      name: 'CustomGPT.ai',
      subtitle: 'Fixed monthly pricing',
      price: '$89',
      period: 'per month',
      features: [
        '5MB dataset limit',
        'Basic chatbot builder',
        'Limited API access',
        'Standard security',
        'Email support only',
        'No white-labeling',
        'Pre-built integrations',
        'Limited trial only'
      ],
      popular: false,
      cta: 'Visit CustomGPT',
      external: true,
    },
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            fontWeight={800}
            gutterBottom
            sx={{ mb: 2 }}
          >
            Pricing Comparison
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Finetuner's pay-per-use model vs CustomGPT's fixed monthly costs
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: plan.popular ? `3px solid ${theme.palette.primary.main}` : 'none',
                    transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Recommended"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontWeight: 700,
                      }}
                    />
                  )}
                  
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight={800} gutterBottom>
                      {plan.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {plan.subtitle}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', mb: 2 }}>
                      <Typography variant="h3" fontWeight={900} color="primary">
                        {plan.price}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                        {plan.period}
                      </Typography>
                    </Box>
                  </Box>

                  <List sx={{ flexGrow: 1 }}>
                    {plan.features.map((feature, featureIndex) => (
                      <ListItem key={featureIndex} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature}
                          primaryTypographyProps={{ fontSize: '0.95rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    variant={plan.popular ? 'contained' : 'outlined'}
                    size="large"
                    fullWidth
                    component={plan.external ? 'a' : RouterLink}
                    to={!plan.external ? plan.link : undefined}
                    href={plan.external ? 'https://customgpt.ai' : undefined}
                    target={plan.external ? '_blank' : undefined}
                    sx={{
                      mt: 3,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 700,
                    }}
                  >
                    {plan.cta}
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Cost Calculator */}
          <Card sx={{ mt: 6, p: 4, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
              Cost Calculator Example
            </Typography>
            <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 3 }}>
              For a typical business chatbot handling 10,000 queries per month:
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Finetuner Cost
                  </Typography>
                  <Typography variant="h4" fontWeight={900}>
                    $25
                  </Typography>
                  <Typography variant="body2">
                    Pay only for actual usage
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    CustomGPT Cost
                  </Typography>
                  <Typography variant="h4" fontWeight={900}>
                    $89
                  </Typography>
                  <Typography variant="body2">
                    Fixed monthly fee regardless of usage
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Card>
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
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              component="h2"
              fontWeight={800}
              gutterBottom
              sx={{ mb: 3 }}
            >
              Ready to Experience Better AI?
            </Typography>
            <Typography
              variant="h6"
              sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}
            >
              Join thousands of businesses that chose Finetuner over CustomGPT for unlimited datasets, 
              better performance, and cost-effective pricing.
            </Typography>
            
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
              alignItems="center"
            >
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: alpha('#ffffff', 0.9),
                  },
                }}
                endIcon={<ArrowForwardIcon />}
              >
                Start Your Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 700,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: alpha('#ffffff', 0.1),
                  },
                }}
              >
                View Live Demo
              </Button>
            </Stack>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

// Main Component
const FinetunerVsCustomGPTPage = () => {
  useEffect(() => {
    // SEO Meta tags
    const updateMetaTag = (name, content, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
      return element;
    };

    // Basic meta tags
    document.title = 'Finetuner vs CustomGPT.ai — Deep Dive | FineTuner';
    updateMetaTag('description', 'Compare dataset size, output quality & costs between Finetuner and CustomGPT.ai. Complete 2024 breakdown with pricing analysis and feature comparison.');
    updateMetaTag('keywords', 'finetuner vs customgpt, custom gpt builder, no-code, comparison, ai chatbot, fine-tuning');
    
    // Canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    if (!document.querySelector('link[rel="canonical"]')) {
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', 'https://finetuner.ai/compare/finetuner-vs-customgpt');
    
    // Open Graph tags
    updateMetaTag('og:title', 'Finetuner vs CustomGPT.ai — Deep Dive | Complete 2024 Comparison', true);
    updateMetaTag('og:description', 'Compare dataset size, output quality & costs between Finetuner and CustomGPT.ai. Complete breakdown with pricing analysis.', true);
    updateMetaTag('og:type', 'article', true);
    updateMetaTag('og:url', 'https://finetuner.ai/compare/finetuner-vs-customgpt', true);
    updateMetaTag('og:image', 'https://finetuner.ai/assets/images/compare-finetuner-vs-customgpt-og.jpg', true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', 'Finetuner vs CustomGPT.ai — Deep Dive | Complete 2024 Comparison');
    updateMetaTag('twitter:description', 'Compare dataset size, output quality & costs between Finetuner and CustomGPT.ai. Complete breakdown with pricing analysis.');
    updateMetaTag('twitter:image', 'https://finetuner.ai/assets/images/compare-finetuner-vs-customgpt-twitter.jpg');
    
    // Schema.org structured data
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Finetuner vs CustomGPT.ai — Deep Dive Comparison",
      "description": "Compare dataset size, output quality & costs between Finetuner and CustomGPT.ai. Complete 2024 breakdown with pricing analysis and feature comparison.",
      "url": "https://finetuner.ai/compare/finetuner-vs-customgpt",
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
      "image": {
        "@type": "ImageObject",
        "url": "https://finetuner.ai/assets/images/compare-finetuner-vs-customgpt-og.jpg"
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://finetuner.ai/compare/finetuner-vs-customgpt"
      }
    });
    document.head.appendChild(schemaScript);

    // Cleanup
    return () => {
      document.head.removeChild(schemaScript);
    };
  }, []);

  return (
    <PageTransition>
      <Box sx={{ minHeight: '100vh' }}>
        <Navbar />
        <HeroSection />
        <QuickOverviewSection />
        <ComparisonTableSection />
        <PricingComparisonSection />
        <CTASection />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default FinetunerVsCustomGPTPage; 