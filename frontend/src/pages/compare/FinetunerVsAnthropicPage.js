import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import SEOHead from '../../components/common/SEOHead';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import TuneIcon from '@mui/icons-material/Tune';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import BuildIcon from '@mui/icons-material/Build';
import CloudIcon from '@mui/icons-material/Cloud';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import SupportIcon from '@mui/icons-material/Support';
import CodeIcon from '@mui/icons-material/Code';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const HeroSection = () => {
  const theme = useTheme();
  return (
    <Box sx={{ pt: { xs: 12, md: 16 }, pb: { xs: 8, md: 12 }, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)` }}>
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography component="h1" variant="h2" sx={{ fontWeight: 900, mb: 3, background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
              Finetuner vs Anthropic Claude
            </Typography>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary, mb: 4, maxWidth: '800px', mx: 'auto', lineHeight: 1.6 }}>
              Custom fine-tuned models vs Anthropic's Constitutional AI approach. Compare accuracy, cost, and control for your business needs.
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 4, height: '100%', border: `2px solid ${theme.palette.primary.main}`, position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: -1, right: 16, bgcolor: 'primary.main', color: 'white', px: 2, py: 0.5, borderRadius: '0 0 8px 8px', fontSize: '0.875rem', fontWeight: 700 }}>
                  Custom AI
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2, width: 56, height: 56 }}>
                    <TuneIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>FineTuner</Typography>
                    <Typography color="text.secondary">Custom Fine-Tuning Platform</Typography>
                  </Box>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Approach:</strong> Domain-specific fine-tuning with your data
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Strength:</strong> Specialized models for your exact use case
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  <strong>Best for:</strong> Businesses needing precise, consistent outputs
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 4, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#FF6B35', mr: 2, width: 56, height: 56 }}>
                    <SmartToyIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>Anthropic Claude</Typography>
                    <Typography color="text.secondary">Constitutional AI Assistant</Typography>
                  </Box>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Approach:</strong> Constitutional AI with built-in safety
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Strength:</strong> Safe, helpful, and honest responses
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  <strong>Best for:</strong> General AI assistance with safety focus
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

const QuickOverviewSection = () => {
  const theme = useTheme();
  const comparisons = [
    { aspect: 'Customization Level', finetuner: 'Full Custom Training', anthropic: 'Prompt Engineering Only', winner: 'finetuner', icon: TuneIcon },
    { aspect: 'Response Consistency', finetuner: '95%+', anthropic: '80-85%', winner: 'finetuner', icon: AutoAwesomeIcon },
    { aspect: 'Setup Complexity', finetuner: 'Medium (requires training)', anthropic: 'Simple (API calls)', winner: 'anthropic', icon: SpeedIcon },
    { aspect: 'Cost Predictability', finetuner: 'Fixed monthly pricing', anthropic: 'Variable token costs', winner: 'finetuner', icon: MonetizationOnIcon },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: theme.palette.background.default }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 800, mb: 2, color: theme.palette.primary.main }}>
          Key Differences at a Glance
        </Typography>
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary', mb: 6, maxWidth: '600px', mx: 'auto' }}>
          Compare the fundamental approaches: custom fine-tuning vs constitutional AI
        </Typography>

        <Grid container spacing={3}>
          {comparisons.map((comp, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ p: 3, height: '100%', position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <comp.icon sx={{ mr: 2, color: theme.palette.primary.main }} />
                  <Typography variant="h6" fontWeight={600}>{comp.aspect}</Typography>
                  {comp.winner === 'finetuner' && (
                    <Chip label="FineTuner Wins" size="small" sx={{ ml: 'auto', bgcolor: theme.palette.success.main, color: 'white' }} />
                  )}
                  {comp.winner === 'anthropic' && (
                    <Chip label="Claude Wins" size="small" sx={{ ml: 'auto', bgcolor: '#FF6B35', color: 'white' }} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>FineTuner</Typography>
                    <Typography variant="h6" sx={{ color: comp.winner === 'finetuner' ? theme.palette.success.main : 'text.primary', fontWeight: comp.winner === 'finetuner' ? 700 : 500 }}>
                      {comp.finetuner}
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ mx: 2, color: 'text.disabled' }}>vs</Typography>
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Claude</Typography>
                    <Typography variant="h6" sx={{ color: comp.winner === 'anthropic' ? '#FF6B35' : 'text.primary', fontWeight: comp.winner === 'anthropic' ? 700 : 500 }}>
                      {comp.anthropic}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

const ComparisonTableSection = () => {
  const theme = useTheme();
  const comparisonData = [
    { 
      category: 'AI Capabilities & Performance', 
      features: [
        { feature: 'Model Customization', finetuner: 'Full fine-tuning on your data', anthropic: 'Prompt engineering only', winner: 'finetuner' },
        { feature: 'Response Consistency', finetuner: '95%+ (domain-specific)', anthropic: '80-85% (general)', winner: 'finetuner' },
        { feature: 'Domain Expertise', finetuner: 'Deep specialization possible', anthropic: 'General knowledge only', winner: 'finetuner' },
        { feature: 'Safety & Ethics', finetuner: 'Customizable guidelines', anthropic: 'Built-in Constitutional AI', winner: 'anthropic' },
        { feature: 'Context Understanding', finetuner: 'Trained on your context', anthropic: 'General context handling', winner: 'finetuner' },
      ]
    },
    { 
      category: 'Technical Implementation', 
      features: [
        { feature: 'Setup Time', finetuner: '1-2 weeks (training)', anthropic: 'Immediate (API)', winner: 'anthropic' },
        { feature: 'Technical Requirements', finetuner: 'Data preparation needed', anthropic: 'Simple API integration', winner: 'anthropic' },
        { feature: 'Model Ownership', finetuner: 'Full ownership of trained model', anthropic: 'No model ownership', winner: 'finetuner' },
        { feature: 'Offline Deployment', finetuner: 'Possible with enterprise plan', anthropic: 'Cloud-only', winner: 'finetuner' },
        { feature: 'API Reliability', finetuner: 'Dedicated infrastructure', anthropic: 'Shared infrastructure', winner: 'finetuner' },
      ]
    },
    { 
      category: 'Cost & Pricing', 
      features: [
        { feature: 'Pricing Model', finetuner: 'Fixed monthly subscription', anthropic: 'Pay-per-token usage', winner: 'finetuner' },
        { feature: 'Cost Predictability', finetuner: 'Fully predictable', anthropic: 'Variable based on usage', winner: 'finetuner' },
        { feature: 'Enterprise Scaling', finetuner: 'Cost-effective at scale', anthropic: 'Expensive for high volume', winner: 'finetuner' },
        { feature: 'Small Project Cost', finetuner: 'Higher minimum cost', anthropic: 'Pay-as-you-go friendly', winner: 'anthropic' },
      ]
    },
    { 
      category: 'Support & Maintenance', 
      features: [
        { feature: 'Model Updates', finetuner: 'Continuous improvement', anthropic: 'Automatic updates', winner: 'tie' },
        { feature: 'Support Quality', finetuner: 'Dedicated fine-tuning experts', anthropic: 'General AI support', winner: 'finetuner' },
        { feature: 'Documentation', finetuner: 'Specialized fine-tuning docs', anthropic: 'Comprehensive general docs', winner: 'tie' },
        { feature: 'Community', finetuner: 'Growing fine-tuning community', anthropic: 'Large general AI community', winner: 'anthropic' },
      ]
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 800, mb: 2, color: theme.palette.primary.main }}>
          Detailed Feature Comparison
        </Typography>
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary', mb: 6 }}>
          In-depth analysis across AI capabilities, implementation, and business factors
        </Typography>

        {comparisonData.map((category, categoryIndex) => (
          <Box key={categoryIndex} sx={{ mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}>
              {category.category}
            </Typography>
            <TableContainer component={Card} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Feature</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>FineTuner</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Anthropic Claude</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Winner</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {category.features.map((feature, index) => (
                    <TableRow key={index} sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        {feature.feature}
                      </TableCell>
                      <TableCell align="center" sx={{ color: feature.winner === 'finetuner' ? theme.palette.success.main : 'text.secondary', fontWeight: feature.winner === 'finetuner' ? 600 : 400 }}>
                        {feature.finetuner}
                      </TableCell>
                      <TableCell align="center" sx={{ color: feature.winner === 'anthropic' ? '#FF6B35' : 'text.secondary', fontWeight: feature.winner === 'anthropic' ? 600 : 400 }}>
                        {feature.anthropic}
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={feature.winner === 'finetuner' ? 'FineTuner' : feature.winner === 'anthropic' ? 'Claude' : 'Tie'} 
                          size="small" 
                          sx={{ 
                            bgcolor: feature.winner === 'finetuner' ? theme.palette.success.main : feature.winner === 'anthropic' ? '#FF6B35' : theme.palette.grey[400], 
                            color: 'white',
                            fontWeight: 600
                          }} 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
      </Container>
    </Box>
  );
};

const UseCaseComparisonSection = () => {
  const theme = useTheme();
  
  const useCases = [
    {
      title: 'Customer Support Automation',
      finetunerFit: 95,
      claudeFit: 75,
      description: 'Automated customer service with company-specific knowledge',
      finetunerAdvantage: 'Perfect knowledge of your products, policies, and tone',
      claudeAdvantage: 'Strong general conversation abilities and safety features',
    },
    {
      title: 'Content Generation',
      finetunerFit: 90,
      claudeFit: 85,
      description: 'Brand-consistent content creation and copywriting',
      finetunerAdvantage: 'Exact brand voice replication and style consistency',
      claudeAdvantage: 'Creative writing capabilities with built-in safety',
    },
    {
      title: 'Technical Documentation',
      finetunerFit: 95,
      claudeFit: 70,
      description: 'API docs, code examples, and technical explanations',
      finetunerAdvantage: 'Deep understanding of your technical stack and terminology',
      claudeAdvantage: 'Good general technical knowledge and explanation skills',
    },
    {
      title: 'Data Analysis & Insights',
      finetunerFit: 85,
      claudeFit: 80,
      description: 'Business intelligence and data interpretation',
      finetunerAdvantage: 'Trained on your specific data patterns and KPIs',
      claudeAdvantage: 'Strong analytical reasoning and mathematical capabilities',
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: alpha(theme.palette.secondary.main, 0.02) }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 800, mb: 2, color: theme.palette.primary.main }}>
          Use Case Performance Analysis
        </Typography>
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary', mb: 6 }}>
          How each platform performs across different business scenarios
        </Typography>

        {useCases.map((useCase, index) => (
          <Card key={index} sx={{ mb: 3, p: 3 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {useCase.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {useCase.description}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>FineTuner Suitability</Typography>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      {useCase.finetunerFit}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={useCase.finetunerFit}
                    sx={{ height: 8, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>Advantage:</strong> {useCase.finetunerAdvantage}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>Claude Suitability</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#FF6B35' }}>
                      {useCase.claudeFit}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={useCase.claudeFit}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      bgcolor: alpha('#FF6B35', 0.1),
                      '& .MuiLinearProgress-bar': { bgcolor: '#FF6B35' }
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>Advantage:</strong> {useCase.claudeAdvantage}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        ))}
      </Container>
    </Box>
  );
};

const DecisionGuideSection = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 800, mb: 2, color: theme.palette.primary.main }}>
          Which Platform Should You Choose?
        </Typography>
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary', mb: 6 }}>
          Decision framework based on your specific needs and requirements
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', p: 4, border: `2px solid ${theme.palette.primary.main}`, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
                Choose FineTuner If:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><TuneIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="You need domain-specific expertise"
                    secondary="Your use case requires deep knowledge of your business, products, or industry"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><AutoAwesomeIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Consistency is critical"
                    secondary="Brand voice, terminology, and response style must be exactly right every time"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><MonetizationOnIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="You want predictable costs"
                    secondary="Fixed monthly pricing without surprise token charges"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><SecurityIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Data control is important"
                    secondary="You want your data to train your own model, not improve a shared model"
                  />
                </ListItem>
              </List>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', p: 4 }}>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#FF6B35' }} gutterBottom>
                Choose Anthropic Claude If:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><SpeedIcon sx={{ color: '#FF6B35' }} /></ListItemIcon>
                  <ListItemText 
                    primary="You need immediate deployment"
                    secondary="Simple API integration without training time or data preparation"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><SmartToyIcon sx={{ color: '#FF6B35' }} /></ListItemIcon>
                  <ListItemText 
                    primary="General AI assistance is sufficient"
                    secondary="Your use case doesn't require specialized domain knowledge"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CloudIcon sx={{ color: '#FF6B35' }} /></ListItemIcon>
                  <ListItemText 
                    primary="You prefer pay-as-you-use"
                    secondary="Variable usage patterns make per-token pricing more economical"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><SupportIcon sx={{ color: '#FF6B35' }} /></ListItemIcon>
                  <ListItemText 
                    primary="Safety is the top priority"
                    secondary="Built-in Constitutional AI provides maximum safety guarantees"
                  />
                </ListItem>
              </List>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6, p: 4, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon color="warning" />
            Expert Recommendation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            For most business applications requiring specialized knowledge and consistent outputs, 
            <strong> FineTuner provides superior results</strong>. The investment in custom training 
            pays off through higher accuracy, better user experience, and more reliable performance. 
            Choose Claude for general AI assistance where safety is paramount and specialized knowledge isn't required.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

const CTASection = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)` }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            Ready to Build Custom AI for Your Business?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}>
            Experience the power of fine-tuned AI models that understand your business inside and out. 
            Start your free trial and see the difference custom training makes.
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center">
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              startIcon={<TuneIcon />}
              sx={{ px: 4, py: 1.5, borderRadius: 3 }}
            >
              Start Custom Training
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ px: 4, py: 1.5, borderRadius: 3 }}
              onClick={() => window.open('/help', '_blank')}
            >
              Compare All Features
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            No credit card required • Custom models in 24-48 hours • Expert training support included
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

const FinetunerVsAnthropicPage = () => {
  useEffect(() => {
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

    document.title = 'Finetuner vs Anthropic Claude | Custom AI vs Constitutional AI';
    updateMetaTag('description', 'Compare Finetuner custom fine-tuning vs Anthropic Claude Constitutional AI. Detailed analysis of accuracy, cost, safety, and business applications for 2024.');
    updateMetaTag('keywords', 'finetuner vs anthropic, claude comparison, custom ai vs constitutional ai, fine-tuning vs prompt engineering, business ai comparison');
    
    const canonicalLink = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    if (!document.querySelector('link[rel="canonical"]')) {
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', 'https://finetuner.ai/compare/finetuner-vs-anthropic');
    
    updateMetaTag('og:title', 'Finetuner vs Anthropic Claude | Custom AI vs Constitutional AI', true);
    updateMetaTag('og:description', 'Compare Finetuner custom fine-tuning vs Anthropic Claude Constitutional AI. Detailed analysis of accuracy, cost, safety, and business applications.', true);
    updateMetaTag('og:type', 'article', true);
    updateMetaTag('og:url', 'https://finetuner.ai/compare/finetuner-vs-anthropic', true);
    updateMetaTag('og:image', 'https://finetuner.ai/assets/images/compare-finetuner-vs-anthropic-og.jpg', true);
    
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', 'Finetuner vs Anthropic Claude | Custom AI vs Constitutional AI');
    updateMetaTag('twitter:description', 'Compare Finetuner custom fine-tuning vs Anthropic Claude Constitutional AI. Detailed analysis of accuracy, cost, safety, and business applications.');
    updateMetaTag('twitter:image', 'https://finetuner.ai/assets/images/compare-finetuner-vs-anthropic-twitter.jpg');
    
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Finetuner vs Anthropic Claude — Custom AI vs Constitutional AI",
      "description": "Compare Finetuner custom fine-tuning vs Anthropic Claude Constitutional AI. Detailed analysis of accuracy, cost, safety, and business applications for 2024.",
      "url": "https://finetuner.ai/compare/finetuner-vs-anthropic",
      "datePublished": "2024-01-15",
      "dateModified": new Date().toISOString().split('T')[0],
      "author": { "@type": "Organization", "name": "FineTuner", "url": "https://finetuner.ai" },
      "publisher": { "@type": "Organization", "name": "FineTuner", "logo": { "@type": "ImageObject", "url": "https://finetuner.ai/assets/images/logo.png" }},
      "image": { "@type": "ImageObject", "url": "https://finetuner.ai/assets/images/compare-finetuner-vs-anthropic-og.jpg" }
    });
    document.head.appendChild(schemaScript);

    return () => {
      document.head.removeChild(schemaScript);
    };
  }, []);

  return (
    <PageTransition>
      <SEOHead path="/compare/finetuner-vs-anthropic" />
      <Box sx={{ minHeight: '100vh' }}>
        <Navbar />
        <HeroSection />
        <QuickOverviewSection />
        <ComparisonTableSection />
        <UseCaseComparisonSection />
        <DecisionGuideSection />
        <CTASection />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default FinetunerVsAnthropicPage;