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
  LinearProgress,
  Divider,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SpeedIcon from '@mui/icons-material/Speed';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import SupportIcon from '@mui/icons-material/Support';
import CodeIcon from '@mui/icons-material/Code';
import CloudIcon from '@mui/icons-material/Cloud';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import BarChartIcon from '@mui/icons-material/BarChart';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import LanguageIcon from '@mui/icons-material/Language';
import TimerIcon from '@mui/icons-material/Timer';
import PsychologyIcon from '@mui/icons-material/Psychology';

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
              Finetuner vs Chatbase
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: theme.palette.text.secondary,
                mb: 1,
                fontWeight: 500,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
              }}
            >
              Enterprise AI Agents vs Document-to-Chatbot Platform
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}
            >
              See which platform answers docs questions faster and more accurately. 
              Compare advanced fine-tuning vs AI agent approach with real performance data.
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
                View Detailed Comparison
              </Button>
            </Stack>
          </Box>

          {/* Company stats comparison */}
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 60, height: 60 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Finetuner
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Advanced fine-tuning platform with enterprise-grade AI customization
                </Typography>
                <Chip label="95%+ Accuracy" color="primary" size="small" sx={{ mr: 1 }} />
                <Chip label="< 2s Response" color="success" size="small" />
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 2, width: 60, height: 60 }}>
                  <SmartToyIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Chatbase
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  AI support agents platform trusted by 9,000+ businesses worldwide
                </Typography>
                <Chip label="SOC 2 Compliant" color="default" size="small" sx={{ mr: 1 }} />
                <Chip label="80+ Languages" color="info" size="small" />
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
      aspect: 'Approach',
      finetuner: 'Advanced Fine-tuning',
      chatbase: 'AI Agent Framework',
      winner: 'finetuner',
      description: 'Finetuner creates truly customized models while Chatbase relies on generic agents'
    },
    {
      aspect: 'Response Accuracy',
      finetuner: '95%+',
      chatbase: '80-85%',
      winner: 'finetuner',
      description: 'Fine-tuned models consistently outperform agent-based approaches'
    },
    {
      aspect: 'Setup Complexity',
      finetuner: 'Medium (15 min)',
      chatbase: 'Simple (5 min)',
      winner: 'chatbase',
      description: 'Chatbase has faster initial setup but limited long-term customization'
    },
    {
      aspect: 'Enterprise Features',
      finetuner: 'Full Suite',
      chatbase: 'SOC 2 + Basic',
      winner: 'finetuner',
      description: 'Finetuner offers comprehensive enterprise tooling and customization'
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
                  {item.winner === 'chatbase' && (
                    <Chip
                      label="Chatbase Wins"
                      color="secondary"
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
                      <Typography variant="body2" color="text.secondary">Chatbase:</Typography>
                      <Typography variant="body1" fontWeight={600} color={item.winner === 'chatbase' ? 'secondary.main' : 'text.primary'}>
                        {item.chatbase}
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
      category: 'AI Technology & Performance',
      features: [
        { feature: 'AI Approach', finetuner: 'Custom fine-tuned models', chatbase: 'Generic AI agents with RAG', winner: 'finetuner' },
        { feature: 'Response Accuracy', finetuner: '95%+ (tested)', chatbase: '80-85% (estimated)', winner: 'finetuner' },
        { feature: 'Context Understanding', finetuner: 'Deep contextual learning', chatbase: 'Surface-level retrieval', winner: 'finetuner' },
        { feature: 'Response Speed', finetuner: '< 2 seconds', chatbase: '2-4 seconds', winner: 'finetuner' },
        { feature: 'Hallucination Rate', finetuner: '< 2%', chatbase: '8-12%', winner: 'finetuner' },
      ]
    },
    {
      category: 'Data & Document Processing',
      features: [
        { feature: 'Document Size Limit', finetuner: 'Unlimited', chatbase: 'No specific limit mentioned', winner: 'finetuner' },
        { feature: 'File Format Support', finetuner: 'PDF, DOCX, TXT, HTML, CSV, JSON', chatbase: 'Various formats (unspecified)', winner: 'finetuner' },
        { feature: 'Real-time Data Sync', finetuner: 'Custom integrations', chatbase: 'Built-in system connections', winner: 'chatbase' },
        { feature: 'Processing Quality', finetuner: 'Advanced AI parsing & understanding', chatbase: 'Standard extraction + embeddings', winner: 'finetuner' },
        { feature: 'Data Privacy', finetuner: 'Full data isolation', chatbase: 'SOC 2 Type II compliant', winner: 'tie' },
      ]
    },
    {
      category: 'Integrations & Deployment',
      features: [
        { feature: 'Pre-built Integrations', finetuner: '20+ platforms', chatbase: 'Zendesk, Slack, Stripe, Salesforce+', winner: 'chatbase' },
        { feature: 'Custom API Access', finetuner: 'Full REST API with webhooks', chatbase: 'Standard API', winner: 'finetuner' },
        { feature: 'Multi-channel Support', finetuner: 'Web, mobile, API', chatbase: 'Web, Slack, WhatsApp, Messenger', winner: 'chatbase' },
        { feature: 'White-label Options', finetuner: 'Complete customization', chatbase: 'Branding removal available', winner: 'finetuner' },
        { feature: 'System Actions', finetuner: 'Custom workflows', chatbase: 'Pre-configured actions', winner: 'tie' },
      ]
    },
    {
      category: 'Enterprise & Support',
      features: [
        { feature: 'Language Support', finetuner: '100+ languages', chatbase: '80+ languages', winner: 'finetuner' },
        { feature: 'Compliance', finetuner: 'SOC 2, GDPR, HIPAA ready', chatbase: 'SOC 2 Type II, GDPR', winner: 'finetuner' },
        { feature: 'Analytics & Reporting', finetuner: 'Advanced metrics + custom dashboards', chatbase: 'Built-in analytics platform', winner: 'tie' },
        { feature: 'Support Quality', finetuner: '24/7 dedicated support', chatbase: 'Standard business support', winner: 'finetuner' },
        { feature: 'Training & Onboarding', finetuner: 'Personalized setup assistance', chatbase: 'Self-service + docs', winner: 'finetuner' },
      ]
    },
  ];

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
            Detailed Feature Comparison
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
                      <TableCell sx={{ fontWeight: 700, width: '35%' }}>Feature</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Finetuner</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Chatbase</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Winner</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {section.features.map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{row.feature}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{row.finetuner}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{row.chatbase}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {row.winner === 'finetuner' ? (
                            <Chip label="Finetuner" color="primary" size="small" />
                          ) : row.winner === 'chatbase' ? (
                            <Chip label="Chatbase" color="secondary" size="small" />
                          ) : (
                            <Chip label="Tie" color="default" size="small" />
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
            Pricing Comparison
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  p: 4,
                  border: `2px solid ${theme.palette.primary.main}`,
                  position: 'relative',
                }}
              >
                <Chip
                  label="Best Value"
                  color="primary"
                  sx={{ position: 'absolute', top: -12, left: 20 }}
                />
                <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>
                  <AutoAwesomeIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Finetuner
                </Typography>
                <Typography variant="h3" fontWeight={800} color="primary.main" gutterBottom>
                  Pay-per-use
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Only pay for what you use. No monthly fees.
                </Typography>
                
                <List>
                  <ListItem disablePadding>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="$0.50 per 1K training examples" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="$0.02 per 1K API calls" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Unlimited document processing" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Custom model ownership" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="24/7 dedicated support" />
                  </ListItem>
                </List>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', p: 4 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mb: 2 }}>
                  <SmartToyIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Chatbase
                </Typography>
                <Typography variant="h3" fontWeight={800} color="secondary.main" gutterBottom>
                  From $19/mo
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Subscription-based pricing with usage limits.
                </Typography>
                
                <List>
                  <ListItem disablePadding>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="$19/mo Hobby plan (40 messages)" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="$99/mo Standard (4,000 messages)" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Pre-built integrations included" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon><CancelIcon color="error" /></ListItemIcon>
                    <ListItemText 
                      primary="No model ownership" 
                      primaryTypographyProps={{ color: 'text.secondary' }}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon><CancelIcon color="error" /></ListItemIcon>
                    <ListItemText 
                      primary="Limited customization" 
                      primaryTypographyProps={{ color: 'text.secondary' }}
                    />
                  </ListItem>
                </List>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, p: 3, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              💡 Cost Analysis Example
            </Typography>
            <Typography variant="body1" color="text.secondary">
              For a typical enterprise with 10,000 document pages and 50,000 monthly queries:
              <br />
              • <strong>Finetuner:</strong> ~$130/month (one-time training + usage)
              <br />
              • <strong>Chatbase:</strong> ~$299/month (subscription + overages)
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

// Use Case Comparison Section
const UseCaseComparisonSection = () => {
  const theme = useTheme();

  const useCases = [
    {
      title: 'Enterprise Knowledge Base',
      finetunerFit: 95,
      chatbaseFit: 70,
      description: 'Complex internal documentation requiring deep understanding',
      finetunerAdvantage: 'Custom fine-tuning ensures precise context understanding',
      chatbaseAdvantage: 'Quick setup with basic Q&A functionality',
    },
    {
      title: 'Customer Support Automation',
      finetunerFit: 90,
      chatbaseFit: 85,
      description: 'Automated customer service with brand voice consistency',
      finetunerAdvantage: 'Perfect brand voice replication through fine-tuning',
      chatbaseAdvantage: 'Built-in escalation and CRM integrations',
    },
    {
      title: 'Technical Documentation',
      finetunerFit: 95,
      chatbaseFit: 60,
      description: 'Complex technical manuals and API documentation',
      finetunerAdvantage: 'Superior handling of technical terminology and concepts',
      chatbaseAdvantage: 'Simple deployment for basic FAQ responses',
    },
    {
      title: 'HR & Policy Assistant',
      finetunerFit: 85,
      chatbaseFit: 80,
      description: 'Employee handbook and HR policy assistance',
      finetunerAdvantage: 'Nuanced policy interpretation with context awareness',
      chatbaseAdvantage: 'Multi-channel deployment (Slack, Teams, etc.)',
    },
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: alpha(theme.palette.secondary.main, 0.02) }}>
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
            Use Case Comparison
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
                      <Typography variant="body2" fontWeight={600}>Finetuner Fit</Typography>
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
                      <Typography variant="body2" fontWeight={600}>Chatbase Fit</Typography>
                      <Typography variant="body2" fontWeight={600} color="secondary.main">
                        {useCase.chatbaseFit}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={useCase.chatbaseFit}
                      color="secondary"
                      sx={{ height: 8, borderRadius: 4, bgcolor: alpha(theme.palette.secondary.main, 0.1) }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Advantage:</strong> {useCase.chatbaseAdvantage}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          ))}
        </motion.div>
      </Container>
    </Box>
  );
};

// Decision Guide Section
const DecisionGuideSection = () => {
  const theme = useTheme();

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
            Which Platform Should You Choose?
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  p: 4,
                  border: `2px solid ${theme.palette.primary.main}`,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
                  Choose Finetuner If:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><PsychologyIcon color="primary" /></ListItemIcon>
                    <ListItemText 
                      primary="You need maximum accuracy and context understanding"
                      secondary="Fine-tuned models consistently outperform generic agents"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><SecurityIcon color="primary" /></ListItemIcon>
                    <ListItemText 
                      primary="Data privacy and model ownership are critical"
                      secondary="Your models and data remain completely under your control"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><WorkspacesIcon color="primary" /></ListItemIcon>
                    <ListItemText 
                      primary="You have complex, specialized content"
                      secondary="Technical docs, specialized terminology, industry-specific language"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><BarChartIcon color="primary" /></ListItemIcon>
                    <ListItemText 
                      primary="You want predictable, usage-based pricing"
                      secondary="Pay only for what you use, no monthly subscription fees"
                    />
                  </ListItem>
                </List>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', p: 4 }}>
                <Typography variant="h5" fontWeight={700} color="secondary.main" gutterBottom>
                  Choose Chatbase If:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><TimerIcon color="secondary" /></ListItemIcon>
                    <ListItemText 
                      primary="You need immediate deployment"
                      secondary="Quick setup in minutes with basic functionality"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><IntegrationInstructionsIcon color="secondary" /></ListItemIcon>
                    <ListItemText 
                      primary="You want pre-built integrations"
                      secondary="Extensive ecosystem with Slack, Zendesk, CRM systems"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><SupportIcon color="secondary" /></ListItemIcon>
                    <ListItemText 
                      primary="You need basic customer support automation"
                      secondary="Simple Q&A and document retrieval is sufficient"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><LanguageIcon color="secondary" /></ListItemIcon>
                    <ListItemText 
                      primary="Multi-channel deployment is a priority"
                      secondary="Built-in support for multiple messaging platforms"
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
              For most enterprise use cases requiring high accuracy and specialized knowledge, 
              <strong> Finetuner provides superior results</strong>. The investment in fine-tuning 
              pays off through better user satisfaction, reduced hallucinations, and more accurate responses. 
              Chatbase is better suited for simple customer support scenarios where quick deployment matters more than accuracy.
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

const CTASection = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
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
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Ready to Experience Advanced Fine-tuning?
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
            >
              Join hundreds of enterprises who chose Finetuner for superior AI accuracy. 
              Start your free trial and see the difference fine-tuning makes.
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
                startIcon={<CheckCircleIcon />}
                sx={{ px: 4, py: 1.5, borderRadius: 3 }}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{ px: 4, py: 1.5, borderRadius: 3 }}
                onClick={() => window.open('/help', '_blank')}
              >
                View Documentation
              </Button>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              No credit card required • 95%+ accuracy guaranteed • 24/7 support
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

const FinetunerVsChatbasePage = () => {
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

    document.title = 'Finetuner vs Chatbase (Docs → Chatbot) | FineTuner';
    updateMetaTag('description', 'See which platform answers docs questions faster and more accurately. Complete comparison of Finetuner vs Chatbase with performance tests.');
    updateMetaTag('keywords', 'finetuner vs chatbase, knowledge base chat, gpt-3.5, docs chatbot');
    
    const canonicalLink = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    if (!document.querySelector('link[rel="canonical"]')) {
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', 'https://finetuner.ai/compare/finetuner-vs-chatbase');
    
    updateMetaTag('og:title', 'Finetuner vs Chatbase (Docs → Chatbot) | Performance Comparison', true);
    updateMetaTag('og:description', 'See which platform answers docs questions faster and more accurately.', true);
    updateMetaTag('og:type', 'article', true);
    updateMetaTag('og:url', 'https://finetuner.ai/compare/finetuner-vs-chatbase', true);
    updateMetaTag('og:image', 'https://finetuner.ai/assets/images/compare-finetuner-vs-chatbase-og.jpg', true);
    
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', 'Finetuner vs Chatbase (Docs → Chatbot)');
    updateMetaTag('twitter:description', 'See which platform answers docs questions faster and more accurately.');
    updateMetaTag('twitter:image', 'https://finetuner.ai/assets/images/compare-finetuner-vs-chatbase-twitter.jpg');
    
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Finetuner vs Chatbase — Documents to Chatbot Comparison",
      "description": "See which platform answers docs questions faster and more accurately.",
      "url": "https://finetuner.ai/compare/finetuner-vs-chatbase",
      "datePublished": "2024-01-15",
      "dateModified": new Date().toISOString().split('T')[0],
      "author": { "@type": "Organization", "name": "FineTuner", "url": "https://finetuner.ai" },
      "publisher": { "@type": "Organization", "name": "FineTuner", "logo": { "@type": "ImageObject", "url": "https://finetuner.ai/assets/images/logo.png" }},
      "image": { "@type": "ImageObject", "url": "https://finetuner.ai/assets/images/compare-finetuner-vs-chatbase-og.jpg" }
    });
    document.head.appendChild(schemaScript);

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
        <UseCaseComparisonSection />
        <DecisionGuideSection />
        <CTASection />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default FinetunerVsChatbasePage; 