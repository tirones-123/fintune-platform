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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SpeedIcon from '@mui/icons-material/Speed';
import CodeIcon from '@mui/icons-material/Code';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import BuildIcon from '@mui/icons-material/Build';
import CloudIcon from '@mui/icons-material/Cloud';
import SecurityIcon from '@mui/icons-material/Security';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import SupportIcon from '@mui/icons-material/Support';

const HeroSection = () => {
  const theme = useTheme();
  return (
    <Box sx={{ pt: { xs: 12, md: 16 }, pb: { xs: 8, md: 12 }, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)` }}>
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography component="h1" variant="h2" sx={{ fontWeight: 900, mb: 3, background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
              Finetuner vs Botpress KB
            </Typography>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary, mb: 4, maxWidth: '800px', mx: 'auto', lineHeight: 1.6 }}>
              In-depth comparison of cost, control, and maintenance between Botpress Knowledge Base and Finetuner for building intelligent chatbots.
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 4, height: '100%', border: `2px solid ${theme.palette.primary.main}`, position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: -1, right: 16, bgcolor: 'primary.main', color: 'white', px: 2, py: 0.5, borderRadius: '0 0 8px 8px', fontSize: '0.875rem', fontWeight: 700 }}>
                  Recommended
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2, width: 56, height: 56 }}>
                    <TrendingUpIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>FineTuner</Typography>
                    <Typography color="text.secondary">Next-gen AI Platform</Typography>
                  </Box>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Founded:</strong> 2023 • Paris, France
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Focus:</strong> Advanced fine-tuning for custom AI models
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  <strong>Best for:</strong> Businesses needing precise, domain-specific AI responses
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 4, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#007bff', mr: 2, width: 56, height: 56 }}>
                    <CodeIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>Botpress</Typography>
                    <Typography color="text.secondary">Open-Source Bot Builder</Typography>
                  </Box>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Founded:</strong> 2017 • Montreal, Canada
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Focus:</strong> Visual chatbot builder with open-source foundation
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  <strong>Best for:</strong> Developers wanting full control and customization
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
    { aspect: 'Setup Complexity', finetuner: 'Simple (5 min)', botpress: 'Technical (30+ min)', winner: 'finetuner', icon: SpeedIcon },
    { aspect: 'Knowledge Base Quality', finetuner: 'Advanced Fine-tuning', botpress: 'Basic RAG', winner: 'finetuner', icon: ChatIcon },
    { aspect: 'Monthly Cost (5K messages)', finetuner: '$29', botpress: '$109+', winner: 'finetuner', icon: MonetizationOnIcon },
    { aspect: 'Maintenance Required', finetuner: 'Minimal', botpress: 'High (Dev required)', winner: 'finetuner', icon: BuildIcon },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: theme.palette.background.default }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 800, mb: 2, color: theme.palette.primary.main }}>
          Quick Overview
        </Typography>
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary', mb: 6, maxWidth: '600px', mx: 'auto' }}>
          Key differences at a glance
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
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Botpress</Typography>
                    <Typography variant="h6" sx={{ color: comp.winner === 'botpress' ? theme.palette.success.main : 'text.primary', fontWeight: comp.winner === 'botpress' ? 700 : 500 }}>
                      {comp.botpress}
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
      category: 'Implementation & Setup', 
      features: [
        { feature: 'Time to Deploy', finetuner: '5 minutes', botpress: '30+ minutes', winner: 'finetuner' },
        { feature: 'Technical Skills Required', finetuner: 'None', botpress: 'JavaScript/Programming', winner: 'finetuner' },
        { feature: 'Knowledge Base Upload', finetuner: 'Drag & Drop', botpress: 'Manual Configuration', winner: 'finetuner' },
        { feature: 'Integration Complexity', finetuner: 'Copy-paste embed', botpress: 'API Development', winner: 'finetuner' },
      ]
    },
    { 
      category: 'AI Capabilities', 
      features: [
        { feature: 'Response Accuracy', finetuner: '95%+ (Fine-tuned)', botpress: '80-85% (RAG)', winner: 'finetuner' },
        { feature: 'Context Understanding', finetuner: 'Deep (Model-level)', botpress: 'Surface (Vector search)', winner: 'finetuner' },
        { feature: 'Domain Expertise', finetuner: 'Specialized per industry', botpress: 'Generic responses', winner: 'finetuner' },
        { feature: 'Learning from Feedback', finetuner: 'Continuous improvement', botpress: 'Manual updates only', winner: 'finetuner' },
      ]
    },
    { 
      category: 'Cost & Pricing', 
      features: [
        { feature: 'Startup Cost', finetuner: '$0 (Free tier)', botpress: '$89/month minimum', winner: 'finetuner' },
        { feature: '5K messages/month', finetuner: '$29', botpress: '$109+', winner: 'finetuner' },
        { feature: '50K messages/month', finetuner: '$99', botpress: '$495+', winner: 'finetuner' },
        { feature: 'Hidden Costs', finetuner: 'None', botpress: 'Dev time, hosting', winner: 'finetuner' },
      ]
    },
    { 
      category: 'Maintenance & Control', 
      features: [
        { feature: 'Ongoing Maintenance', finetuner: 'Automated', botpress: 'Dev team required', winner: 'finetuner' },
        { feature: 'Updates Frequency', finetuner: 'Continuous', botpress: 'Manual deployments', winner: 'finetuner' },
        { feature: 'Customization Level', finetuner: 'AI behavior tuning', botpress: 'Full code control', winner: 'botpress' },
        { feature: 'Self-hosting Option', finetuner: 'No', botpress: 'Yes (Open source)', winner: 'botpress' },
      ]
    },
  ];

  const getRatingColor = (rating) => {
    if (rating >= 90) return theme.palette.success.main;
    if (rating >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 800, mb: 2, color: theme.palette.primary.main }}>
          Detailed Comparison
        </Typography>
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary', mb: 6 }}>
          Feature-by-feature analysis across 4 key categories
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
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Botpress</TableCell>
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
                      <TableCell align="center" sx={{ color: feature.winner === 'botpress' ? theme.palette.success.main : 'text.secondary', fontWeight: feature.winner === 'botpress' ? 600 : 400 }}>
                        {feature.botpress}
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={feature.winner === 'finetuner' ? 'FineTuner' : 'Botpress'} 
                          size="small" 
                          sx={{ 
                            bgcolor: feature.winner === 'finetuner' ? theme.palette.success.main : '#007bff', 
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

const PricingComparisonSection = () => {
  const theme = useTheme();
  
  const pricingData = [
    { volume: '1,000 messages/month', finetuner: '$0', botpress: '$89', savings: '$89' },
    { volume: '5,000 messages/month', finetuner: '$29', botpress: '$109', savings: '$80' },
    { volume: '25,000 messages/month', finetuner: '$79', botpress: '$200+', savings: '$121+' },
    { volume: '50,000 messages/month', finetuner: '$99', botpress: '$495', savings: '$396' },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 800, mb: 2, color: theme.palette.primary.main }}>
          Pricing Comparison
        </Typography>
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary', mb: 6 }}>
          Total cost of ownership analysis
        </Typography>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%', border: `2px solid ${theme.palette.primary.main}` }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
                FineTuner Pricing
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon sx={{ color: theme.palette.success.main }} /></ListItemIcon>
                  <ListItemText primary="Pay-per-use model" secondary="No monthly minimums" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon sx={{ color: theme.palette.success.main }} /></ListItemIcon>
                  <ListItemText primary="Free tier included" secondary="1,000 messages monthly" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon sx={{ color: theme.palette.success.main }} /></ListItemIcon>
                  <ListItemText primary="All features included" secondary="No hidden add-ons" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon sx={{ color: theme.palette.success.main }} /></ListItemIcon>
                  <ListItemText primary="Auto-scaling" secondary="Grows with your business" />
                </ListItem>
              </List>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#007bff' }}>
                Botpress Pricing
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><MonetizationOnIcon sx={{ color: '#ff9800' }} /></ListItemIcon>
                  <ListItemText primary="$89/month minimum" secondary="Plus per-message costs" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><MonetizationOnIcon sx={{ color: '#ff9800' }} /></ListItemIcon>
                  <ListItemText primary="Add-on costs" secondary="Storage, collaborators, bots" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><MonetizationOnIcon sx={{ color: '#ff9800' }} /></ListItemIcon>
                  <ListItemText primary="Development costs" secondary="JavaScript developer needed" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><MonetizationOnIcon sx={{ color: '#ff9800' }} /></ListItemIcon>
                  <ListItemText primary="Hosting costs" secondary="If self-hosting chosen" />
                </ListItem>
              </List>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
            Monthly Cost Comparison
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <TableCell sx={{ fontWeight: 700 }}>Usage Volume</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>FineTuner</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Botpress</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Savings</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pricingData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 600 }}>{row.volume}</TableCell>
                    <TableCell align="center" sx={{ color: theme.palette.success.main, fontWeight: 600, fontSize: '1.1rem' }}>
                      {row.finetuner}
                    </TableCell>
                    <TableCell align="center" sx={{ color: theme.palette.error.main, fontWeight: 600, fontSize: '1.1rem' }}>
                      {row.botpress}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={`Save ${row.savings}`} 
                        sx={{ bgcolor: theme.palette.success.main, color: 'white', fontWeight: 600 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Container>
    </Box>
  );
};

const UseCaseComparisonSection = () => {
  const theme = useTheme();
  
  const useCases = [
    {
      title: 'Customer Support Automation',
      description: 'Handle common customer inquiries',
      finetuner: 95,
      botpress: 75,
      finetunerBenefits: ['Understands complex queries', 'Maintains context across conversations', 'Learns from feedback'],
      botpressBenefits: ['Basic FAQ responses', 'Rule-based routing', 'Manual training required']
    },
    {
      title: 'Technical Documentation Q&A',
      description: 'Answer questions about products/services',
      finetuner: 92,
      botpress: 70,
      finetunerBenefits: ['Deep technical understanding', 'Accurate code examples', 'Version-aware responses'],
      botpressBenefits: ['Keyword matching', 'Basic document search', 'Limited context awareness']
    },
    {
      title: 'Sales & Lead Qualification',
      description: 'Qualify leads and provide product info',
      finetuner: 88,
      botpress: 65,
      finetunerBenefits: ['Personalized responses', 'Lead scoring integration', 'Natural conversations'],
      botpressBenefits: ['Form-based qualification', 'Basic product catalog', 'Limited personalization']
    },
    {
      title: 'Internal Knowledge Base',
      description: 'Employee training and HR queries',
      finetuner: 90,
      botpress: 72,
      finetunerBenefits: ['Policy-aware responses', 'Role-based information', 'Compliance adherence'],
      botpressBenefits: ['Basic HR workflows', 'Document retrieval', 'Manual policy updates']
    }
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 800, mb: 2, color: theme.palette.primary.main }}>
          Use Case Performance
        </Typography>
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary', mb: 6 }}>
          Real-world application effectiveness comparison
        </Typography>

        <Grid container spacing={4}>
          {useCases.map((useCase, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ p: 4, height: '100%' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  {useCase.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {useCase.description}
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>FineTuner</Typography>
                    <Typography variant="body2" fontWeight={600} color="primary.main">{useCase.finetuner}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={useCase.finetuner} 
                    sx={{ height: 8, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.1), mb: 2 }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>Botpress</Typography>
                    <Typography variant="body2" fontWeight={600} color="#007bff">{useCase.botpress}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={useCase.botpress} 
                    sx={{ height: 8, borderRadius: 4, bgcolor: alpha('#007bff', 0.1), '& .MuiLinearProgress-bar': { bgcolor: '#007bff' } }}
                  />
                </Box>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2" fontWeight={600}>View Detailed Benefits</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, mb: 1 }}>
                      FineTuner Advantages:
                    </Typography>
                    {useCase.finetunerBenefits.map((benefit, i) => (
                      <Typography key={i} variant="body2" sx={{ mb: 0.5, pl: 2 }}>
                        • {benefit}
                      </Typography>
                    ))}
                    
                    <Typography variant="subtitle2" sx={{ color: '#007bff', mb: 1, mt: 2 }}>
                      Botpress Capabilities:
                    </Typography>
                    {useCase.botpressBenefits.map((benefit, i) => (
                      <Typography key={i} variant="body2" sx={{ mb: 0.5, pl: 2 }}>
                        • {benefit}
                      </Typography>
                    ))}
                  </AccordionDetails>
                </Accordion>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

const DecisionGuideSection = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 800, mb: 2, color: theme.palette.primary.main }}>
          Decision Guide
        </Typography>
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary', mb: 6 }}>
          Choose the right platform for your specific needs
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%', border: `2px solid ${theme.palette.primary.main}` }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 64, height: 64, mx: 'auto', mb: 2 }}>
                  <TrendingUpIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  Choose FineTuner If:
                </Typography>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon sx={{ color: theme.palette.success.main }} /></ListItemIcon>
                  <ListItemText primary="You want quick deployment" secondary="Get started in 5 minutes without coding" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon sx={{ color: theme.palette.success.main }} /></ListItemIcon>
                  <ListItemText primary="Cost efficiency matters" secondary="Save 60-80% compared to Botpress" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon sx={{ color: theme.palette.success.main }} /></ListItemIcon>
                  <ListItemText primary="You need high accuracy" secondary="95%+ response accuracy with fine-tuning" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon sx={{ color: theme.palette.success.main }} /></ListItemIcon>
                  <ListItemText primary="Minimal maintenance" secondary="Automated updates and improvements" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon sx={{ color: theme.palette.success.main }} /></ListItemIcon>
                  <ListItemText primary="Non-technical team" secondary="No programming knowledge required" />
                </ListItem>
              </List>
              
              <Button 
                component={RouterLink} 
                to="/register" 
                variant="contained" 
                size="large" 
                fullWidth 
                sx={{ mt: 3, py: 1.5, fontWeight: 700 }}
                endIcon={<ArrowForwardIcon />}
              >
                Start with FineTuner
              </Button>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%' }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: '#007bff', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                  <CodeIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#007bff' }}>
                  Choose Botpress If:
                </Typography>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemIcon><BuildIcon sx={{ color: '#007bff' }} /></ListItemIcon>
                  <ListItemText primary="Full code control needed" secondary="Want to modify every aspect of the bot" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CodeIcon sx={{ color: '#007bff' }} /></ListItemIcon>
                  <ListItemText primary="Development team available" secondary="Have JavaScript developers on staff" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CloudIcon sx={{ color: '#007bff' }} /></ListItemIcon>
                  <ListItemText primary="Self-hosting required" secondary="Need to host on your own infrastructure" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><SecurityIcon sx={{ color: '#007bff' }} /></ListItemIcon>
                  <ListItemText primary="Open-source requirement" secondary="Must have access to source code" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><GroupIcon sx={{ color: '#007bff' }} /></ListItemIcon>
                  <ListItemText primary="Complex integrations" secondary="Need custom API integrations" />
                </ListItem>
              </List>
              
              <Button 
                variant="outlined" 
                size="large" 
                fullWidth 
                sx={{ mt: 3, py: 1.5, fontWeight: 700, borderColor: '#007bff', color: '#007bff' }}
                href="https://botpress.com"
                target="_blank"
              >
                Learn More About Botpress
              </Button>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Card sx={{ p: 4, bgcolor: alpha(theme.palette.warning.main, 0.1), border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}` }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: theme.palette.warning.dark }}>
              💡 Expert Recommendation
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: '800px', mx: 'auto' }}>
              For most businesses, FineTuner offers the best balance of cost, performance, and ease of use. 
              Choose Botpress only if you have specific technical requirements that justify the additional complexity and cost.
            </Typography>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

const CTASection = () => {
  const theme = useTheme();
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`, color: 'white' }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
            Ready to Build Smarter Chatbots?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of businesses who chose FineTuner for faster deployment, better accuracy, and lower costs than Botpress.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button component={RouterLink} to="/register" variant="contained" size="large" sx={{ bgcolor: 'white', color: 'primary.main', px: 4, py: 1.5, borderRadius: 3, fontWeight: 700 }} endIcon={<ArrowForwardIcon />}>
              Start Free Trial
            </Button>
            <Button variant="outlined" size="large" sx={{ borderColor: 'white', color: 'white', px: 4, py: 1.5, borderRadius: 3, fontWeight: 700 }} startIcon={<SupportIcon />}>
              Book Demo
            </Button>
          </Stack>
          <Typography variant="body2" sx={{ mt: 3, opacity: 0.8 }}>
            Free forever • No credit card required • 5-minute setup
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

const FinetunerVsBotpressPage = () => {
  useEffect(() => {
    // SEO Meta tags
    const updateMetaTag = (name, content, property = false) => {
      const existingTag = document.querySelector(property ? `meta[property="${name}"]` : `meta[name="${name}"]`);
      if (existingTag) {
        existingTag.setAttribute('content', content);
      } else {
        const metaTag = document.createElement('meta');
        if (property) {
          metaTag.setAttribute('property', name);
        } else {
          metaTag.setAttribute('name', name);
        }
        metaTag.setAttribute('content', content);
        document.head.appendChild(metaTag);
      }
    };

    // Basic meta tags
    document.title = 'Finetuner vs Botpress KB | FineTuner';
    updateMetaTag('description', 'Evaluate cost, control and maintenance between Botpress Knowledge Base and Finetuner.');
    updateMetaTag('keywords', 'finetuner vs botpress, open-source bot, knowledge base, chatbot comparison, ai platform');
    
    // Open Graph tags
    updateMetaTag('og:title', 'Finetuner vs Botpress KB | Complete Comparison', true);
    updateMetaTag('og:description', 'Evaluate cost, control and maintenance between Botpress Knowledge Base and Finetuner.', true);
    updateMetaTag('og:type', 'article', true);
    updateMetaTag('og:url', 'https://finetuner.ai/compare/finetuner-vs-botpress', true);
    updateMetaTag('og:image', 'https://finetuner.ai/assets/images/compare-botpress-og.jpg', true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', 'Finetuner vs Botpress KB | Complete Comparison');
    updateMetaTag('twitter:description', 'Evaluate cost, control and maintenance between Botpress Knowledge Base and Finetuner.');
    updateMetaTag('twitter:image', 'https://finetuner.ai/assets/images/compare-botpress-twitter.jpg');
    
    // Canonical URL
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.setAttribute('href', 'https://finetuner.ai/compare/finetuner-vs-botpress');
    } else {
      const canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', 'https://finetuner.ai/compare/finetuner-vs-botpress');
      document.head.appendChild(canonicalLink);
    }

    // Schema.org structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Finetuner vs Botpress KB | Complete Comparison",
      "description": "Evaluate cost, control and maintenance between Botpress Knowledge Base and Finetuner.",
      "url": "https://finetuner.ai/compare/finetuner-vs-botpress",
      "mainEntity": {
        "@type": "ComparisonTable",
        "name": "Finetuner vs Botpress Comparison",
        "description": "Detailed comparison of features, pricing, and capabilities"
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://finetuner.ai"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Compare",
            "item": "https://finetuner.ai/compare"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Finetuner vs Botpress",
            "item": "https://finetuner.ai/compare/finetuner-vs-botpress"
          }
        ]
      }
    };

    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.textContent = JSON.stringify(structuredData);
    } else {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, []);

  return (
    <PageTransition>
      <Box sx={{ minHeight: '100vh' }}>
        <Navbar />
        <HeroSection />
        <QuickOverviewSection />
        <ComparisonTableSection />
        <PricingComparisonSection />
        <UseCaseComparisonSection />
        <DecisionGuideSection />
        <CTASection />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default FinetunerVsBotpressPage; 