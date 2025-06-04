import React, { useEffect } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Avatar, Stack, useTheme, alpha, Chip, List, ListItem, ListItemIcon, ListItemText, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import PageTransition from '../../components/common/PageTransition';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CodeIcon from '@mui/icons-material/Code';
import NoCodeIcon from '@mui/icons-material/Mouse';
import SupportIcon from '@mui/icons-material/Support';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import CloudIcon from '@mui/icons-material/Cloud';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VerifiedIcon from '@mui/icons-material/Verified';
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
          <Grid item xs={12} md={8} sx={{ mx: 'auto', textAlign: 'center' }}>
            <motion.div
              initial="hidden"
              animate={controls}
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <Chip
                  label="Comparison Guide"
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
                  Finetuner vs OpenAI Fine-Tuning
                  <br />
                  Full Breakdown
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
                    maxWidth: 800,
                    mx: 'auto',
                  }}
                >
                  Side-by-side comparison of <strong style={{ color: '#00d4ff' }}>UX, cost, and support</strong> so you can choose the right fine-tuning solution in minutes.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
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
                    Try Finetuner Free
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
                    onClick={() => document.getElementById('comparison-table').scrollIntoView({ behavior: 'smooth' })}
                  >
                    See Full Comparison
                  </Button>
                </Stack>
              </motion.div>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Quick Overview Section
const QuickOverviewSection = () => {
  const theme = useTheme();

  const overview = [
    {
      title: 'Finetuner',
      subtitle: 'No-Code Fine-Tuning Platform',
      pros: ['User-friendly interface', 'No coding required', 'Built-in data processing', 'Visual monitoring'],
      cons: ['Newer platform', 'Limited to supported models'],
      logo: '🎯',
      color: '#bf00ff',
    },
    {
      title: 'OpenAI Fine-Tuning',
      subtitle: 'Direct API Fine-Tuning',
      pros: ['Direct from source', 'Full API control', 'Advanced customization', 'Established platform'],
      cons: ['Requires coding skills', 'Complex setup', 'Manual data prep', 'No visual interface'],
      logo: '🤖',
      color: '#10a37f',
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
          Quick Overview
        </Typography>

        <Grid container spacing={4}>
          {overview.map((item, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${alpha(item.color, 0.3)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    borderColor: alpha(item.color, 0.6),
                    boxShadow: `0 20px 40px ${alpha(item.color, 0.2)}`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h3" sx={{ mr: 2 }}>
                    {item.logo}
                  </Typography>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: item.color }}>
                      {item.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {item.subtitle}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'success.main' }}>
                    Pros
                  </Typography>
                  <List dense>
                    {item.pros.map((pro, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText primary={pro} />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'warning.main' }}>
                    Cons
                  </Typography>
                  <List dense>
                    {item.cons.map((con, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CancelIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText primary={con} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// Detailed Comparison Table
const ComparisonTableSection = () => {
  const theme = useTheme();

  const comparisons = [
    {
      category: 'User Experience',
      finetuner: { value: 'Visual drag-and-drop interface', rating: 5, icon: <NoCodeIcon /> },
      openai: { value: 'Code-based API calls', rating: 2, icon: <CodeIcon /> },
    },
    {
      category: 'Setup Time',
      finetuner: { value: '5 minutes', rating: 5, icon: <SpeedIcon /> },
      openai: { value: '2-4 hours', rating: 2, icon: <SpeedIcon /> },
    },
    {
      category: 'Coding Required',
      finetuner: { value: 'No coding needed', rating: 5, icon: <CheckCircleIcon /> },
      openai: { value: 'Python/API knowledge required', rating: 2, icon: <CodeIcon /> },
    },
    {
      category: 'Data Preparation',
      finetuner: { value: 'Automated processing', rating: 5, icon: <CheckCircleIcon /> },
      openai: { value: 'Manual JSONL formatting', rating: 2, icon: <CancelIcon /> },
    },
    {
      category: 'Monitoring & Analytics',
      finetuner: { value: 'Built-in dashboard', rating: 5, icon: <TrendingUpIcon /> },
      openai: { value: 'Basic logs only', rating: 2, icon: <CancelIcon /> },
    },
    {
      category: 'Support',
      finetuner: { value: 'Dedicated human support', rating: 5, icon: <SupportIcon /> },
      openai: { value: 'Community forums', rating: 3, icon: <PersonIcon /> },
    },
    {
      category: 'Pricing Model',
      finetuner: { value: 'Flat monthly rate', rating: 4, icon: <AttachMoneyIcon /> },
      openai: { value: 'Pay-per-token usage', rating: 3, icon: <AttachMoneyIcon /> },
    },
  ];

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success.main';
    if (rating >= 3) return 'warning.main';
    return 'error.main';
  };

  return (
    <Box
      id="comparison-table"
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
            mb: 8,
          }}
        >
          Detailed Feature Comparison
        </Typography>

        <TableContainer
          component={Paper}
          sx={{
            borderRadius: '16px',
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  Feature
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#bf00ff' }}>
                  🎯 Finetuner
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#10a37f' }}>
                  🤖 OpenAI
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparisons.map((row, index) => (
                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: alpha(theme.palette.action.hover, 0.1) } }}>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                    {row.category}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <Box sx={{ color: getRatingColor(row.finetuner.rating) }}>
                        {row.finetuner.icon}
                      </Box>
                      <Typography variant="body2" sx={{ color: getRatingColor(row.finetuner.rating) }}>
                        {row.finetuner.value}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <Box sx={{ color: getRatingColor(row.openai.rating) }}>
                        {row.openai.icon}
                      </Box>
                      <Typography variant="body2" sx={{ color: getRatingColor(row.openai.rating) }}>
                        {row.openai.value}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

// Pricing Comparison
const PricingComparisonSection = () => {
  const theme = useTheme();

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
          Pricing Comparison
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 4,
                height: '100%',
                borderRadius: '16px',
                background: alpha(theme.palette.background.paper, 0.6),
                border: `2px solid ${alpha('#bf00ff', 0.3)}`,
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#bf00ff', mb: 1 }}>
                  🎯 Finetuner
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  $29/month
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Flat rate, unlimited fine-tuning
                </Typography>
              </Box>

              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Unlimited fine-tuning jobs" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="No per-token charges" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Predictable monthly costs" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Visual interface included" />
                </ListItem>
              </List>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 4,
                height: '100%',
                borderRadius: '16px',
                background: alpha(theme.palette.background.paper, 0.6),
                border: `2px solid ${alpha('#10a37f', 0.3)}`,
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#10a37f', mb: 1 }}>
                  🤖 OpenAI
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  $50-500+
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Pay-per-token, variable costs
                </Typography>
              </Box>

              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Direct OpenAI access" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CancelIcon sx={{ color: 'warning.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Unpredictable token costs" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CancelIcon sx={{ color: 'warning.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Additional dev time costs" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CancelIcon sx={{ color: 'warning.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="No interface - build your own" />
                </ListItem>
              </List>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Who Should Choose What
const RecommendationSection = () => {
  const theme = useTheme();

  const recommendations = [
    {
      title: 'Choose Finetuner if:',
      color: '#bf00ff',
      icon: '🎯',
      items: [
        'You want to get started quickly (under 10 minutes)',
        'You prefer no-code solutions',
        'You need predictable monthly pricing',
        'You want built-in monitoring and analytics',
        'You value dedicated human support',
        'You\'re a business user or non-technical team',
      ],
    },
    {
      title: 'Choose OpenAI if:',
      color: '#10a37f',
      icon: '🤖',
      items: [
        'You have strong Python/API development skills',
        'You need maximum control over the process',
        'You\'re comfortable with variable token pricing',
        'You can build your own monitoring tools',
        'You prefer direct API access',
        'You\'re a technical developer or ML engineer',
      ],
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
          Which One Should You Choose?
        </Typography>

        <Grid container spacing={4}>
          {recommendations.map((rec, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.1),
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${alpha(rec.color, 0.3)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h3" sx={{ mr: 2 }}>
                    {rec.icon}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: rec.color }}>
                    {rec.title}
                  </Typography>
                </Box>

                <List>
                  {rec.items.map((item, idx) => (
                    <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                      <ListItemIcon>
                        <CheckCircleIcon sx={{ color: rec.color }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{ color: 'text.primary' }}
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

// Add after RecommendationSection - New Expert Tips Section
const ExpertTipsSection = () => {
  const theme = useTheme();

  const tips = [
    {
      title: 'Start with Clear Use Cases',
      description: 'Define specific problems you want to solve before choosing between FineTuner and OpenAI fine-tuning. This helps determine which approach offers better value.',
      category: 'Planning',
      icon: '🎯',
    },
    {
      title: 'Consider Your Technical Resources',
      description: 'OpenAI fine-tuning requires ML expertise for optimal results. FineTuner abstracts complexity, making it suitable for teams without deep AI knowledge.',
      category: 'Technical',
      icon: '⚙️',
    },
    {
      title: 'Evaluate Long-term Costs',
      description: 'While OpenAI may seem cheaper initially, factor in development time, maintenance, and scaling costs. FineTuner\'s predictable pricing often proves more economical.',
      category: 'Financial',
      icon: '💰',
    },
    {
      title: 'Test with Small Datasets First',
      description: 'Start with a pilot project using a subset of your data. This helps evaluate performance and user adoption before full deployment.',
      category: 'Implementation',
      icon: '🧪',
    },
    {
      title: 'Plan for Data Security',
      description: 'Consider where your data will be processed and stored. FineTuner offers more control over data handling compared to OpenAI\'s shared infrastructure.',
      category: 'Security',
      icon: '🔒',
    },
    {
      title: 'Monitor Performance Metrics',
      description: 'Track response accuracy, user satisfaction, and cost per query. These metrics help justify your choice and optimize performance over time.',
      category: 'Analytics',
      icon: '📊',
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
          Expert Tips for Choosing the Right Solution
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
          Making the right choice between FineTuner and OpenAI fine-tuning requires careful consideration of your specific needs, resources, and goals. Here are expert recommendations to guide your decision.
        </Typography>

        <Grid container spacing={4}>
          {tips.map((tip, index) => (
            <Grid item xs={12} md={6} key={index}>
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
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h4" sx={{ mr: 2 }}>
                    {tip.icon}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <Chip 
                      label={tip.category} 
                      size="small" 
                      sx={{ 
                        mb: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main'
                      }} 
                    />
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {tip.title}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  {tip.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
            Need personalized guidance for your specific use case? Our AI experts can help you evaluate your requirements and recommend the best approach for your business.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              component="a"
              href="https://calendly.com/finetuner/expert-consultation"
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              size="large"
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1rem',
                borderRadius: '50px',
              }}
            >
              Schedule Expert Consultation
            </Button>
            <Button
              component={RouterLink}
              to="/alternatives/pinecone"
              variant="outlined"
              size="large"
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1rem',
                borderRadius: '50px',
              }}
            >
              Compare More Alternatives
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

// Add new Migration Guide Section
const MigrationGuideSection = () => {
  const theme = useTheme();

  const migrationSteps = [
    {
      from: 'OpenAI',
      to: 'FineTuner',
      title: 'Migrating from OpenAI Fine-Tuning',
      steps: [
        'Export your training data from OpenAI format',
        'Create a new FineTuner project',
        'Upload your data using our import wizard',
        'Review and adjust training parameters',
        'Launch fine-tuning job',
        'Test and deploy your new model'
      ],
      timeEstimate: '2-4 hours',
      complexity: 'Easy',
      benefits: ['No coding required', 'Better monitoring', 'Cost savings', 'Easier deployment'],
    },
    {
      from: 'Custom',
      to: 'FineTuner',
      title: 'Migrating from Custom Solutions',
      steps: [
        'Analyze your current data pipeline',
        'Map your data to FineTuner format',
        'Set up automated data ingestion',
        'Configure model parameters',
        'Run parallel testing',
        'Gradually shift traffic to FineTuner'
      ],
      timeEstimate: '1-2 weeks',
      complexity: 'Moderate',
      benefits: ['Reduced maintenance', 'Better scalability', 'Team collaboration', 'Enterprise support'],
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
          Migration Made Simple
        </Typography>

        <Grid container spacing={6}>
          {migrationSteps.map((migration, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.6),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                  {migration.title}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Chip 
                    label={`${migration.timeEstimate}`} 
                    size="small" 
                    sx={{ bgcolor: alpha('#4ECDC4', 0.1), color: '#4ECDC4' }}
                  />
                  <Chip 
                    label={migration.complexity} 
                    size="small" 
                    sx={{ 
                      bgcolor: migration.complexity === 'Easy' ? alpha('#4CAF50', 0.1) : alpha('#FF9800', 0.1),
                      color: migration.complexity === 'Easy' ? '#4CAF50' : '#FF9800'
                    }}
                  />
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Migration Steps:
                </Typography>
                <List dense sx={{ mb: 3 }}>
                  {migration.steps.map((step, idx) => (
                    <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {idx + 1}
                        </Box>
                      </ListItemIcon>
                      <ListItemText 
                        primary={step} 
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Key Benefits:
                </Typography>
                <List dense>
                  {migration.benefits.map((benefit, idx) => (
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

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Our migration specialists provide hands-on support to ensure a smooth transition with zero downtime.
          </Typography>
          <Button
            component="a"
            href="https://docs.finetuner.ai/migration"
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
            View Migration Documentation
          </Button>
        </Box>
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
            Ready to Start Fine-Tuning?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: 'text.secondary',
            }}
          >
            Try Finetuner free for 14 days. No credit card required, no coding needed.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              startIcon={<VerifiedIcon />}
              sx={{
                py: 2,
                px: 5,
                fontSize: '1.2rem',
                fontWeight: 700,
                borderRadius: '50px',
              }}
            >
              Start Free Trial
            </Button>
            <Button
              href="https://platform.openai.com/docs/guides/fine-tuning"
              target="_blank"
              variant="outlined"
              size="large"
              sx={{
                py: 2,
                px: 5,
                fontSize: '1.2rem',
                borderRadius: '50px',
              }}
            >
              Explore OpenAI Docs
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

const FinetunerVsOpenAIPage = () => {
  // SEO meta tags management
  useEffect(() => {
    // Save original title
    const originalTitle = document.title;
    
    // Update title - keeping under 60 characters
    document.title = 'FineTuner vs OpenAI Fine-Tuning | Complete 2024 Guide';
    
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
    const metaDescription = updateMetaTag('description', 'Compare FineTuner vs OpenAI fine-tuning: pricing, ease of use, performance. Complete 2024 breakdown with expert recommendations and migration guide.');
    const metaKeywords = updateMetaTag('keywords', 'finetuner vs openai, fine-tuning comparison, openai alternative, AI model training, custom AI, machine learning comparison');
    
    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', 'https://finetuner.ai/compare/finetuner-vs-openai');
    
    // Open Graph tags
    const ogTitle = updateMetaTag('og:title', 'FineTuner vs OpenAI Fine-Tuning | Complete 2024 Guide', true);
    const ogDescription = updateMetaTag('og:description', 'Compare FineTuner vs OpenAI fine-tuning: pricing, ease of use, performance. Complete 2024 breakdown with expert recommendations.', true);
    const ogType = updateMetaTag('og:type', 'article', true);
    const ogUrl = updateMetaTag('og:url', 'https://finetuner.ai/compare/finetuner-vs-openai', true);
    const ogImage = updateMetaTag('og:image', 'https://finetuner.ai/assets/images/finetuner-vs-openai-og.jpg', true);
    
    // Twitter Card tags
    const twitterCard = updateMetaTag('twitter:card', 'summary_large_image');
    const twitterTitle = updateMetaTag('twitter:title', 'FineTuner vs OpenAI Fine-Tuning | Complete 2024 Guide');
    const twitterDescription = updateMetaTag('twitter:description', 'Compare FineTuner vs OpenAI fine-tuning: pricing, ease of use, performance. Complete 2024 breakdown with expert recommendations.');
    const twitterImage = updateMetaTag('twitter:image', 'https://finetuner.ai/assets/images/finetuner-vs-openai-twitter.jpg');
    
    // Schema.org structured data - Enhanced with more details
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "FineTuner vs OpenAI Fine-Tuning — Complete 2024 Comparison",
      "description": "Compare FineTuner vs OpenAI fine-tuning: pricing, ease of use, performance. Complete 2024 breakdown with expert recommendations and migration guide.",
      "url": "https://finetuner.ai/compare/finetuner-vs-openai",
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
        "url": "https://finetuner.ai/assets/images/finetuner-vs-openai-og.jpg"
      },
      "mainEntity": {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Which is cheaper: FineTuner or OpenAI fine-tuning?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "FineTuner starts at $29/month with predictable pricing, while OpenAI fine-tuning costs $50-500+ monthly depending on usage and requires additional development resources."
            }
          },
          {
            "@type": "Question",
            "name": "Is FineTuner easier to use than OpenAI fine-tuning?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, FineTuner provides a no-code interface that requires no ML expertise, while OpenAI fine-tuning requires technical knowledge and custom development."
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
        <QuickOverviewSection />
        <ComparisonTableSection />
        <PricingComparisonSection />
        <RecommendationSection />
        <ExpertTipsSection />
        <MigrationGuideSection />
        <CTASection />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default FinetunerVsOpenAIPage; 