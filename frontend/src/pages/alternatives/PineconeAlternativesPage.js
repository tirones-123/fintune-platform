import React, { useEffect } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Avatar, Stack, useTheme, alpha, Chip, List, ListItem, ListItemIcon, ListItemText, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Rating } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import PageTransition from '../../components/common/PageTransition';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import CloudIcon from '@mui/icons-material/Cloud';
import CodeIcon from '@mui/icons-material/Code';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ScaleIcon from '@mui/icons-material/Scale';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import PublicIcon from '@mui/icons-material/Public';
import BusinessIcon from '@mui/icons-material/Business';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

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
          <Grid item xs={12} md={8} sx={{ mx: 'auto', textAlign: 'center' }}>
            <motion.div
              initial="hidden"
              animate={controls}
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <Chip
                  label="Updated for 2025"
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
                  7 Pinecone Alternatives for
                  <br />
                  Vector & Fine-Tuning (2025)
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
                  Discover <strong style={{ color: '#00d4ff' }}>7 options to replace Pinecone</strong> and level‑up search quality. From open-source to enterprise solutions.
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
                    Try Vector Fine-Tuning Free
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
                    onClick={() => document.getElementById('alternatives-comparison').scrollIntoView({ behavior: 'smooth' })}
                  >
                    Compare All 7 Options
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

  const alternatives = [
    {
      name: 'Milvus',
      description: 'Open-source vector database with enterprise features',
      rating: 4.5,
      pricing: 'Free / Cloud',
      bestFor: 'Large-scale applications',
      logo: '🔍',
      color: '#00B4D8',
    },
    {
      name: 'Weaviate',
      description: 'GraphQL-native vector search engine',
      rating: 4.3,
      pricing: 'Free / $25+/mo',
      bestFor: 'AI-first applications',
      logo: '🕸️',
      color: '#61D836',
    },
    {
      name: 'Qdrant',
      description: 'High-performance vector similarity engine',
      rating: 4.4,
      pricing: 'Free / $0.30/GB',
      bestFor: 'Real-time search',
      logo: '⚡',
      color: '#FF6B6B',
    },
    {
      name: 'Chroma',
      description: 'AI-native open-source embedding database',
      rating: 4.2,
      pricing: 'Free / Enterprise',
      bestFor: 'LLM applications',
      logo: '🎨',
      color: '#4ECDC4',
    },
    {
      name: 'FAISS',
      description: 'Facebook\'s similarity search library',
      rating: 4.0,
      pricing: 'Free',
      bestFor: 'Research & prototyping',
      logo: '📚',
      color: '#45B7D1',
    },
    {
      name: 'Vespa',
      description: 'Yahoo\'s big data serving engine',
      rating: 4.1,
      pricing: 'Free / Cloud',
      bestFor: 'Big data applications',
      logo: '🌐',
      color: '#96CEB4',
    },
    {
      name: 'FineTuner',
      description: 'Vector search with fine-tuning capabilities',
      rating: 4.6,
      pricing: '$29/mo',
      bestFor: 'Custom AI models',
      logo: '🎯',
      color: '#bf00ff',
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
            mb: 2,
          }}
        >
          7 Best Pinecone Alternatives (2025)
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
          Compare features, pricing, and use cases to find the perfect vector database for your project.
        </Typography>

        <Grid container spacing={3}>
          {alternatives.map((alt, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <Card
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${alpha(alt.color, 0.3)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    borderColor: alpha(alt.color, 0.6),
                    boxShadow: `0 20px 40px ${alpha(alt.color, 0.2)}`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h3" sx={{ mr: 2 }}>
                    {alt.logo}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: alt.color }}>
                      {alt.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Rating value={alt.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                        {alt.rating}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                  {alt.description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Starting at
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {alt.pricing}
                    </Typography>
                  </Box>
                  <Chip
                    label={alt.bestFor}
                    size="small"
                    sx={{ backgroundColor: alpha(alt.color, 0.1), color: alt.color }}
                  />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// Detailed Alternatives Section
const DetailedAlternativesSection = () => {
  const theme = useTheme();

  const detailedAlternatives = [
    {
      name: 'Milvus',
      logo: '🔍',
      color: '#00B4D8',
      description: 'Milvus is an open-source vector database designed for scalable similarity search and AI applications. Built for production workloads.',
      pros: [
        'Excellent scalability and performance',
        'Rich ecosystem and integrations',
        'Active open-source community',
        'Multiple deployment options',
      ],
      cons: [
        'Complex setup and maintenance',
        'Steep learning curve',
        'Resource intensive',
      ],
      useCase: 'Best for large-scale production applications requiring high performance and scalability.',
      pricing: 'Free open-source, Zilliz Cloud starts at $0.05/GB',
    },
    {
      name: 'Weaviate',
      logo: '🕸️',
      color: '#61D836',
      description: 'Weaviate is a GraphQL-native vector search engine that combines vector embeddings with structured data.',
      pros: [
        'GraphQL API for easy integration',
        'Built-in text and image vectorization',
        'Excellent documentation',
        'Cloud and self-hosted options',
      ],
      cons: [
        'Limited querying capabilities',
        'Smaller community than alternatives',
        'Performance limitations at scale',
      ],
      useCase: 'Ideal for AI-first applications and developers who prefer GraphQL APIs.',
      pricing: 'Free tier available, Weaviate Cloud starts at $25/month',
    },
    {
      name: 'Qdrant',
      logo: '⚡',
      color: '#FF6B6B',
      description: 'Qdrant is a high-performance vector similarity search engine written in Rust, optimized for real-time applications.',
      pros: [
        'Exceptional query performance',
        'Real-time filtering capabilities',
        'Rust-based reliability',
        'Simple API design',
      ],
      cons: [
        'Newer project with evolving features',
        'Limited ecosystem compared to others',
        'Smaller community support',
      ],
      useCase: 'Perfect for real-time search applications requiring ultra-fast query responses.',
      pricing: 'Free self-hosted, Qdrant Cloud at $0.30/GB + compute',
    },
    {
      name: 'Chroma',
      logo: '🎨',
      color: '#4ECDC4',
      description: 'Chroma is an AI-native open-source embedding database designed specifically for LLM applications.',
      pros: [
        'Designed for LLM workflows',
        'Simple Python API',
        'Active development',
        'Lightweight and fast',
      ],
      cons: [
        'Limited advanced features',
        'Young project with potential changes',
        'Primarily Python-focused',
      ],
      useCase: 'Excellent choice for LLM applications and rapid prototyping.',
      pricing: 'Free open-source, enterprise support available',
    },
  ];

  return (
    <Box
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
          Top Pinecone Alternatives Reviewed
        </Typography>

        <Grid container spacing={6}>
          {detailedAlternatives.map((alt, index) => (
            <Grid item xs={12} key={index}>
              <Card
                sx={{
                  p: 4,
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.8),
                  border: `1px solid ${alpha(alt.color, 0.3)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: `0 10px 30px ${alpha(alt.color, 0.2)}`,
                  },
                }}
              >
                <Grid container spacing={4}>
                  <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h2" sx={{ mr: 2 }}>
                        {alt.logo}
                      </Typography>
                      <Box>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: alt.color }}>
                          {alt.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                          {alt.description}
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'success.main' }}>
                          Pros
                        </Typography>
                        <List dense>
                          {alt.pros.map((pro, idx) => (
                            <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                              </ListItemIcon>
                              <ListItemText primary={pro} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'warning.main' }}>
                          Cons
                        </Typography>
                        <List dense>
                          {alt.cons.map((con, idx) => (
                            <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <CancelIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                              </ListItemIcon>
                              <ListItemText primary={con} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: '12px',
                        background: alpha(alt.color, 0.1),
                        border: `1px solid ${alpha(alt.color, 0.3)}`,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: alt.color }}>
                        Best For
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 3 }}>
                        {alt.useCase}
                      </Typography>

                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Pricing
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {alt.pricing}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// Comparison Table
const ComparisonTableSection = () => {
  const theme = useTheme();

  const comparisons = [
    {
      feature: 'Open Source',
      milvus: '✅',
      weaviate: '✅',
      qdrant: '✅',
      chroma: '✅',
      faiss: '✅',
      vespa: '✅',
      finetuner: '❌',
    },
    {
      feature: 'Cloud Managed',
      milvus: '✅',
      weaviate: '✅',
      qdrant: '✅',
      chroma: '❌',
      faiss: '❌',
      vespa: '✅',
      finetuner: '✅',
    },
    {
      feature: 'Real-time Search',
      milvus: '✅',
      weaviate: '✅',
      qdrant: '✅',
      chroma: '⚠️',
      faiss: '❌',
      vespa: '✅',
      finetuner: '✅',
    },
    {
      feature: 'Fine-tuning Support',
      milvus: '❌',
      weaviate: '❌',
      qdrant: '❌',
      chroma: '❌',
      faiss: '❌',
      vespa: '❌',
      finetuner: '✅',
    },
    {
      feature: 'Ease of Setup',
      milvus: '⚠️',
      weaviate: '✅',
      qdrant: '✅',
      chroma: '✅',
      faiss: '⚠️',
      vespa: '⚠️',
      finetuner: '✅',
    },
    {
      feature: 'Scalability',
      milvus: '✅',
      weaviate: '✅',
      qdrant: '✅',
      chroma: '⚠️',
      faiss: '⚠️',
      vespa: '✅',
      finetuner: '✅',
    },
  ];

  return (
    <Box
      id="alternatives-comparison"
      sx={{
        py: { xs: 8, md: 12 },
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
          Pinecone Alternatives Comparison
        </Typography>

        <TableContainer
          component={Paper}
          sx={{
            borderRadius: '16px',
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            overflowX: 'auto',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '1rem', minWidth: 120 }}>
                  Feature
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#00B4D8', minWidth: 80 }}>
                  Milvus
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#61D836', minWidth: 80 }}>
                  Weaviate
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#FF6B6B', minWidth: 80 }}>
                  Qdrant
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#4ECDC4', minWidth: 80 }}>
                  Chroma
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#45B7D1', minWidth: 80 }}>
                  FAISS
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#96CEB4', minWidth: 80 }}>
                  Vespa
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#bf00ff', minWidth: 80 }}>
                  FineTuner
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparisons.map((row, index) => (
                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: alpha(theme.palette.action.hover, 0.1) } }}>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                    {row.feature}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: '1.2rem' }}>{row.milvus}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '1.2rem' }}>{row.weaviate}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '1.2rem' }}>{row.qdrant}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '1.2rem' }}>{row.chroma}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '1.2rem' }}>{row.faiss}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '1.2rem' }}>{row.vespa}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '1.2rem' }}>{row.finetuner}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            ✅ = Full Support | ⚠️ = Limited Support | ❌ = Not Available
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

// Detailed Evaluation Section
const DetailedEvaluationSection = () => {
  const theme = useTheme();

  const evaluationCriteria = [
    {
      title: 'Performance & Speed',
      description: 'Query latency, throughput, and scalability under load',
      alternatives: [
        { name: 'Pinecone', score: 9, notes: 'Excellent performance, managed infrastructure' },
        { name: 'Milvus', score: 8, notes: 'High performance, requires optimization' },
        { name: 'Weaviate', score: 7, notes: 'Good performance with GraphQL overhead' },
        { name: 'FineTuner', score: 9, notes: 'Optimized for fine-tuned models' },
      ],
    },
    {
      title: 'Ease of Setup',
      description: 'Time to deployment and configuration complexity',
      alternatives: [
        { name: 'Pinecone', score: 9, notes: 'Fully managed, instant setup' },
        { name: 'Milvus', score: 6, notes: 'Requires infrastructure management' },
        { name: 'Weaviate', score: 7, notes: 'Docker deployment available' },
        { name: 'FineTuner', score: 10, notes: 'No-code setup with fine-tuning' },
      ],
    },
    {
      title: 'Cost Efficiency',
      description: 'Pricing structure and total cost of ownership',
      alternatives: [
        { name: 'Pinecone', score: 7, notes: 'Usage-based, can get expensive' },
        { name: 'Milvus', score: 8, notes: 'Open source, but requires hosting' },
        { name: 'Weaviate', score: 8, notes: 'Flexible pricing options' },
        { name: 'FineTuner', score: 9, notes: 'Predictable monthly pricing' },
      ],
    },
    {
      title: 'AI Integration',
      description: 'Built-in AI capabilities and model fine-tuning',
      alternatives: [
        { name: 'Pinecone', score: 6, notes: 'Vector storage only, no fine-tuning' },
        { name: 'Milvus', score: 5, notes: 'Requires external ML tools' },
        { name: 'Weaviate', score: 7, notes: 'Some built-in vectorization' },
        { name: 'FineTuner', score: 10, notes: 'Complete AI fine-tuning platform' },
      ],
    },
  ];

  const getScoreColor = (score) => {
    if (score >= 9) return '#4CAF50';
    if (score >= 7) return '#FF9800';
    return '#F44336';
  };

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
          Detailed Performance Evaluation
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
          We've evaluated each Pinecone alternative across critical factors that matter most for production deployments. Here's how they compare in real-world scenarios.
        </Typography>

        <Grid container spacing={4}>
          {evaluationCriteria.map((criterion, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.8),
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  {criterion.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                  {criterion.description}
                </Typography>

                <List dense>
                  {criterion.alternatives.map((alt, idx) => (
                    <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {alt.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="h6" sx={{ color: getScoreColor(alt.score), fontWeight: 700 }}>
                                {alt.score}/10
                              </Typography>
                            </Box>
                          </Box>
                        }
                        secondary={alt.notes}
                        secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
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
            These evaluations are based on extensive testing with real workloads and customer feedback. Results may vary depending on your specific use case and requirements.
          </Typography>
          <Button
            component="a"
            href="https://github.com/finetuner-ai/benchmark-suite"
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
            View Benchmark Results
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

// Implementation Guide Section
const ImplementationGuideSection = () => {
  const theme = useTheme();

  const implementations = [
    {
      scenario: 'E-commerce Product Search',
      description: 'Implement semantic product search with fine-tuned embeddings for better relevance.',
      bestOption: 'FineTuner',
      reason: 'Combines vector search with product-specific fine-tuning for higher conversion rates.',
      steps: [
        'Upload product catalog and search behavior data',
        'Fine-tune embeddings for your product categories',
        'Deploy semantic search API',
        'A/B test against keyword search'
      ],
      timeToValue: '1-2 weeks',
    },
    {
      scenario: 'Document Q&A System',
      description: 'Build a knowledge base that answers questions from internal documents.',
      bestOption: 'Weaviate or FineTuner',
      reason: 'Both offer good text processing, but FineTuner provides better customization for domain-specific queries.',
      steps: [
        'Process and chunk document content',
        'Generate embeddings for document sections',
        'Set up question-answering pipeline',
        'Implement relevance scoring'
      ],
      timeToValue: '2-3 weeks',
    },
    {
      scenario: 'Real-time Recommendation Engine',
      description: 'Power personalized recommendations with vector similarity search.',
      bestOption: 'Pinecone or Milvus',
      reason: 'High-performance requirements favor specialized vector databases.',
      steps: [
        'Collect user interaction data',
        'Train user and item embeddings',
        'Deploy real-time inference API',
        'Implement online learning pipeline'
      ],
      timeToValue: '3-4 weeks',
    },
    {
      scenario: 'Customer Support Automation',
      description: 'Automate support responses with context-aware AI agents.',
      bestOption: 'FineTuner',
      reason: 'Only solution that combines vector search with conversational AI fine-tuning.',
      steps: [
        'Import support tickets and knowledge base',
        'Fine-tune conversational model',
        'Set up automated response system',
        'Configure escalation rules'
      ],
      timeToValue: '1 week',
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
          Implementation Scenarios & Best Practices
        </Typography>

        <Grid container spacing={4}>
          {implementations.map((impl, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: '16px',
                  background: alpha(theme.palette.background.paper, 0.6),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                  {impl.scenario}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                  {impl.description}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Recommended Solution:
                  </Typography>
                  <Chip 
                    label={impl.bestOption} 
                    sx={{ 
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: 'success.main',
                      fontWeight: 600
                    }} 
                  />
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontStyle: 'italic' }}>
                    {impl.reason}
                  </Typography>
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Implementation Steps:
                </Typography>
                <List dense sx={{ mb: 3 }}>
                  {impl.steps.map((step, idx) => (
                    <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <Box
                          sx={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            backgroundColor: theme.palette.primary.main,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
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

                <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Time to Value: <strong>{impl.timeToValue}</strong>
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
            Need help choosing the right implementation approach for your specific use case? Our solution architects can provide personalized recommendations and implementation support.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              component={RouterLink}
              to="/use-cases/support-chatbot"
              variant="outlined"
              size="large"
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1rem',
                borderRadius: '50px',
              }}
            >
              Explore Use Cases
            </Button>
            <Button
              component="a"
              href="https://calendly.com/finetuner/architecture-consultation"
              target="_blank"
              rel="noopener noreferrer"
              variant="text"
              size="large"
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1rem',
                borderRadius: '50px',
              }}
            >
              Schedule Architecture Review
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

// Why FineTuner Section
const WhyFineTunerSection = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(180deg, ${alpha("#050224", 1)} 0%, ${alpha("#0a043c", 1)} 100%)`,
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
                color: 'white',
              }}
            >
              Why FineTuner Stands Out
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mb: 4,
                color: alpha('#ffffff', 0.8),
                lineHeight: 1.7,
              }}
            >
              While other alternatives focus purely on vector search, FineTuner combines vector databases with fine-tuning capabilities for truly custom AI solutions.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TuneIcon sx={{ color: '#bf00ff', mr: 2 }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    Built-in Fine-tuning
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7) }}>
                  Train custom models on your data, not just store vectors
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SpeedIcon sx={{ color: '#00d4ff', mr: 2 }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    5-Minute Setup
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7) }}>
                  Get started without complex infrastructure setup
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SearchIcon sx={{ color: '#4ECDC4', mr: 2 }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    Semantic Search
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7) }}>
                  Advanced vector search with contextual understanding
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoneyIcon sx={{ color: '#61D836', mr: 2 }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    Predictable Pricing
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7) }}>
                  $29/month flat rate, no hidden costs or token charges
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 4,
                borderRadius: '16px',
                background: alpha('#ffffff', 0.1),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha('#bf00ff', 0.3)}`,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#bf00ff', mb: 3 }}>
                Perfect For:
              </Typography>

              <List>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: '#00d4ff' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Teams wanting vector search + custom AI models"
                    primaryTypographyProps={{ color: 'white' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: '#00d4ff' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Companies needing domain-specific search"
                    primaryTypographyProps={{ color: 'white' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: '#00d4ff' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Projects requiring both storage and training"
                    primaryTypographyProps={{ color: 'white' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: '#00d4ff' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Organizations wanting managed solutions"
                    primaryTypographyProps={{ color: 'white' }}
                  />
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
            Ready to Move Beyond Basic Vector Search?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: 'text.secondary',
            }}
          >
            Try FineTuner's vector database with built-in fine-tuning. Start building custom AI models in minutes.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              startIcon={<TuneIcon />}
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
              component={RouterLink}
              to="/compare/finetuner-vs-openai"
              variant="outlined"
              size="large"
              sx={{
                py: 2,
                px: 5,
                fontSize: '1.2rem',
                borderRadius: '50px',
              }}
            >
              Compare with OpenAI
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

const PineconeAlternativesPage = () => {
  // SEO meta tags management
  useEffect(() => {
    // Save original title
    const originalTitle = document.title;
    
    // Update title - keeping under 60 characters
    document.title = '7 Best Pinecone Alternatives for Vector & AI (2025)';
    
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
    const metaDescription = updateMetaTag('description', '7 best Pinecone alternatives for 2025: Milvus, Weaviate, Qdrant, Chroma & more. Compare features, pricing, performance for vector databases & AI.');
    const metaKeywords = updateMetaTag('keywords', 'pinecone alternatives, milvus, weaviate, qdrant, chroma, vector database, AI embeddings, similarity search, semantic search');
    
    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', 'https://finetuner.ai/alternatives/pinecone');
    
    // Open Graph tags
    const ogTitle = updateMetaTag('og:title', '7 Best Pinecone Alternatives for Vector & AI (2025)', true);
    const ogDescription = updateMetaTag('og:description', '7 best Pinecone alternatives for 2025: Milvus, Weaviate, Qdrant, Chroma & more. Compare features, pricing, performance.', true);
    const ogType = updateMetaTag('og:type', 'article', true);
    const ogUrl = updateMetaTag('og:url', 'https://finetuner.ai/alternatives/pinecone', true);
    const ogImage = updateMetaTag('og:image', 'https://finetuner.ai/assets/images/pinecone-alternatives-og.jpg', true);
    
    // Twitter Card tags
    const twitterCard = updateMetaTag('twitter:card', 'summary_large_image');
    const twitterTitle = updateMetaTag('twitter:title', '7 Best Pinecone Alternatives for Vector & AI (2025)');
    const twitterDescription = updateMetaTag('twitter:description', '7 best Pinecone alternatives for 2025: Milvus, Weaviate, Qdrant, Chroma & more. Compare features, pricing, performance.');
    const twitterImage = updateMetaTag('twitter:image', 'https://finetuner.ai/assets/images/pinecone-alternatives-twitter.jpg');
    
    // Schema.org structured data - Enhanced with more details
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "7 Pinecone Alternatives for Vector & Fine-Tuning (2025)",
      "description": "7 best Pinecone alternatives for 2025: Milvus, Weaviate, Qdrant, Chroma & more. Compare features, pricing, performance for vector databases & AI.",
      "url": "https://finetuner.ai/alternatives/pinecone",
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
        "url": "https://finetuner.ai/assets/images/pinecone-alternatives-og.jpg"
      },
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": 7,
        "itemListElement": [
          {
            "@type": "SoftwareApplication",
            "position": 1,
            "name": "Milvus",
            "description": "Open-source vector database with high performance"
          },
          {
            "@type": "SoftwareApplication", 
            "position": 2,
            "name": "Weaviate",
            "description": "GraphQL-based vector search engine"
          },
          {
            "@type": "SoftwareApplication",
            "position": 3, 
            "name": "Qdrant",
            "description": "Rust-based vector similarity search engine"
          },
          {
            "@type": "SoftwareApplication",
            "position": 4,
            "name": "Chroma",
            "description": "Developer-friendly AI-native embedding database"
          },
          {
            "@type": "SoftwareApplication",
            "position": 5,
            "name": "FAISS",
            "description": "Facebook's library for similarity search"
          },
          {
            "@type": "SoftwareApplication",
            "position": 6,
            "name": "Vespa",
            "description": "Big data serving engine with vector search"
          },
          {
            "@type": "SoftwareApplication",
            "position": 7,
            "name": "FineTuner",
            "description": "Vector database with built-in fine-tuning capabilities"
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
        <DetailedAlternativesSection />
        <ComparisonTableSection />
        <DetailedEvaluationSection />
        <ImplementationGuideSection />
        <WhyFineTunerSection />
        <CTASection />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default PineconeAlternativesPage; 