import React, { useEffect, useRef } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Avatar, Stack, useTheme, alpha } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import PageTransition from '../components/common/PageTransition';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DatasetIcon from '@mui/icons-material/Dataset';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ChatIcon from '@mui/icons-material/Chat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import YouTubeIcon from '@mui/icons-material/YouTube';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import LanguageIcon from '@mui/icons-material/Language';
import ScienceIcon from '@mui/icons-material/Science';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import SmartToyIcon from '@mui/icons-material/SmartToy';

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

// Neon line component 
const NeonLine = ({ start, end, color, delay, duration, thickness = 2 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start({
        pathLength: [0, 1],
        opacity: [0.2, 1],
        transition: { duration: duration || 1.5, delay: delay || 0, ease: "easeInOut" }
      });
    }
  }, [controls, inView]);

  return (
    <motion.svg
      ref={ref}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'visible',
        zIndex: -1,
      }}
    >
      <motion.path
        d={`M${start.x},${start.y} C${start.x + (end.x - start.x) * 0.5},${start.y} ${end.x - (end.x - start.x) * 0.5},${end.y} ${end.x},${end.y}`}
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        fill="transparent"
        initial={{ pathLength: 0, opacity: 0.2 }}
        animate={controls}
        filter={`drop-shadow(0 0 5px ${color}) drop-shadow(0 0 10px ${color})`}
      />
    </motion.svg>
  );
};

// 3D Content Source Icon
const ContentSourceIcon = ({ icon: Icon, label, color, delay }) => {
  const theme = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{ position: 'relative' }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 2,
        }}
      >
        <Box
          sx={{
            borderRadius: '50%',
            backgroundColor: alpha(color, 0.1),
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 15px ${alpha(color, 0.5)}`,
            position: 'relative',
            mb: 1,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              border: `2px solid ${alpha(color, 0.7)}`,
              animation: 'pulse 2s infinite',
            },
          }}
        >
          <Icon sx={{ fontSize: 40, color }} />
        </Box>
        <Typography
          variant="subtitle1"
          sx={{
            color: 'text.primary',
            fontWeight: 600,
            textAlign: 'center'
          }}
        >
          {label}
        </Typography>
      </Box>
    </motion.div>
  );
};

// Section Hero
const Hero = () => {
  const theme = useTheme();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // Refs for neon line connections
  const pdfRef = useRef(null);
  const youtubeRef = useRef(null);
  const webRef = useRef(null);
  const aiRef = useRef(null);
  const heroRef = useRef(null);

  return (
    <Box
      ref={heroRef}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 12, md: 18 },
        pb: { xs: 14, md: 20 },
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Futuristic background with grid */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: (theme) => 
            theme.palette.mode === 'dark'
              ? 'linear-gradient(to bottom, #000428, #0c0434, #150c41, #1c144e, #221b5b)'
              : 'linear-gradient(to bottom, #f0f8ff, #e6f0fa, #dce9f5, #d3e1f0, #c9daeb)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: (theme) => 
              theme.palette.mode === 'dark'
                ? 'radial-gradient(circle at 20% 30%, rgba(120, 0, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0, 200, 255, 0.15) 0%, transparent 50%)'
                : 'radial-gradient(circle at 20% 30%, rgba(120, 0, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0, 200, 255, 0.1) 0%, transparent 50%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23${theme.palette.mode === 'dark' ? '808BF0' : '6F7BDF'}' stroke-opacity='0.05'%3E%3Cpath d='M0 0h60v60H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.2,
          },
          zIndex: -1,
        }}
      />

      {/* Glowing orbs with animation */}
      <Box
        component={motion.div}
        animate={{
          y: [0, -20, 0],
          opacity: [0.7, 1, 0.7],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        sx={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: { xs: 100, md: 200 },
          height: { xs: 100, md: 200 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(120, 0, 255, 0.3) 0%, rgba(120, 0, 255, 0) 70%)',
          filter: 'blur(30px)',
          zIndex: -1,
        }}
      />

      <Box
        component={motion.div}
        animate={{
          y: [0, 20, 0],
          opacity: [0.7, 1, 0.7],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: 'reverse',
          delay: 1,
        }}
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: { xs: 120, md: 250 },
          height: { xs: 120, md: 250 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 200, 255, 0.3) 0%, rgba(0, 200, 255, 0) 70%)',
          filter: 'blur(30px)',
          zIndex: -1,
        }}
      />

      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center" sx={{ position: 'relative' }}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <Typography
                  component="h1"
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', md: '3.75rem' },
                    lineHeight: 1.1,
                    background: 'linear-gradient(135deg, #7928CA, #00C6FF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: (theme) => 
                      theme.palette.mode === 'dark' 
                        ? '0 0 20px rgba(121, 40, 202, 0.5)' 
                        : 'none',
                    mb: 3,
                    fontFamily: "'Orbitron', sans-serif",
                    letterSpacing: '-0.5px',
                  }}
                >
                  Transformez vos contenus en IA fine-tunée
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="h5"
                  color="text.secondary"
                  paragraph
                  sx={{ 
                    mb: 4,
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    lineHeight: 1.6,
                    maxWidth: '95%',
                    fontWeight: 400,
                    backdropFilter: 'blur(5px)',
                    borderRadius: 2,
                    p: 2,
                    backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.5),
                    border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  Créez facilement un assistant sur-mesure basé sur vos propres informations, sans compétences techniques. Vous apportez le contenu, nous nous occupons du reste.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 5 }}>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="large"
                    sx={{ 
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      background: 'linear-gradient(45deg, #7928CA, #00C6FF)',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 8px 20px rgba(121, 40, 202, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 24px rgba(121, 40, 202, 0.4)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transition: 'all 0.6s',
                      },
                      '&:hover::before': {
                        left: '100%',
                      },
                    }}
                  >
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                        }}
                      >
                        <SmartToyIcon />
                      </motion.div>
                    </Box>
                    S'inscrire gratuitement
                  </Button>
                  
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    size="large"
                    sx={{ 
                      py: 2,
                      px: 4,
                      borderWidth: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      backdropFilter: 'blur(5px)',
                      backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.1),
                      '&:hover': {
                        borderWidth: 2,
                        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.2),
                      }
                    }}
                  >
                    Se connecter
                  </Button>
                </Stack>
              </motion.div>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                height: { xs: 400, md: 500 },
                width: '100%',
              }}
            >
              {/* 3D Data flow visualization */}
              <Box 
                sx={{
                  position: 'relative',
                  height: '100%',
                  width: '100%',
                  perspective: '1000px',
                }}
              >
                {/* Input sources */}
                <Box
                  ref={pdfRef}
                  sx={{
                    position: 'absolute',
                    top: '10%',
                    left: '5%',
                  }}
                >
                  <ContentSourceIcon 
                    icon={PictureAsPdfIcon} 
                    label="PDF" 
                    color="#FF5252" 
                    delay={0.2}
                  />
                </Box>
                
                <Box
                  ref={youtubeRef}
                  sx={{
                    position: 'absolute',
                    top: '30%',
                    left: '10%',
                  }}
                >
                  <ContentSourceIcon 
                    icon={YouTubeIcon} 
                    label="YouTube" 
                    color="#FF0000" 
                    delay={0.4}
                  />
                </Box>
                
                <Box
                  ref={webRef}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '5%',
                  }}
                >
                  <ContentSourceIcon 
                    icon={LanguageIcon} 
                    label="Sites Web" 
                    color="#4285F4" 
                    delay={0.6}
                  />
                </Box>

                {/* Processing center */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '30%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: (theme) => `0 0 30px ${alpha(theme.palette.primary.main, 0.5)}`,
                      zIndex: 2,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -10,
                        left: -10,
                        right: -10,
                        bottom: -10,
                        borderRadius: '50%',
                        border: (theme) => `4px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        borderTopColor: 'primary.main',
                        borderRightColor: 'primary.main',
                        animation: 'spin 3s linear infinite',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: -5,
                        left: -5,
                        right: -5,
                        bottom: -5,
                        borderRadius: '50%',
                        border: (theme) => `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                        borderTopColor: 'secondary.main',
                        borderLeftColor: 'secondary.main',
                        animation: 'spin-reverse 2s linear infinite',
                      },
                    }}
                  >
                    <SyncAltIcon 
                      sx={{ 
                        fontSize: 50, 
                        color: 'primary.main',
                        animation: 'pulse 2s infinite',
                      }} 
                    />
                  </Box>
                </motion.div>

                {/* Output AI model */}
                <Box
                  ref={aiRef}
                  sx={{
                    position: 'absolute',
                    bottom: '25%',
                    right: '15%',
                    transform: 'translate(0, -50%)',
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1 }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        width: 150,
                        height: 150,
                        borderRadius: '20px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.5)})`,
                        backdropFilter: 'blur(10px)',
                        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        boxShadow: (theme) => `0 10px 30px ${alpha(theme.palette.common.black, 0.2)}`,
                        p: 2,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          zIndex: -1,
                          background: 'linear-gradient(45deg, rgba(121, 40, 202, 0.4), rgba(0, 198, 255, 0.4))',
                          filter: 'blur(20px)',
                          opacity: 0.5,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          mb: 1,
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <SmartToyIcon sx={{ fontSize: 50, color: 'primary.main' }} />
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          textAlign: 'center',
                          mb: 0.5,
                        }}
                      >
                        IA Fine-tunée
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          textAlign: 'center',
                          fontSize: '0.7rem',
                        }}
                      >
                        OpenAI / Anthropic
                      </Typography>
                      
                      {/* Pulsing dots animation */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mt: 1, 
                        gap: 0.5 
                      }}>
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ 
                              scale: [1, 1.3, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{ 
                              duration: 1.5, 
                              repeat: Infinity, 
                              delay: i * 0.2
                            }}
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: theme.palette.primary.main
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </motion.div>
                </Box>

                {/* Neon connection lines */}
                <NeonLine 
                  start={{ x: 50, y: 65 }} 
                  end={{ x: 150, y: 150 }} 
                  color="#FF5252" 
                  delay={1.2} 
                  thickness={3}
                />
                <NeonLine 
                  start={{ x: 60, y: 160 }} 
                  end={{ x: 150, y: 150 }} 
                  color="#FF0000" 
                  delay={1.4} 
                  thickness={3}
                />
                <NeonLine 
                  start={{ x: 50, y: 250 }} 
                  end={{ x: 150, y: 150 }} 
                  color="#4285F4" 
                  delay={1.6} 
                  thickness={3}
                />
                <NeonLine 
                  start={{ x: 210, y: 150 }} 
                  end={{ x: 320, y: 250 }} 
                  color="#7928CA" 
                  delay={1.8} 
                  thickness={4}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Section How It Works
const HowItWorks = () => {
  const theme = useTheme();
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const steps = [
    {
      icon: <CloudUploadIcon sx={{ fontSize: 45 }} />,
      title: "Importez vos contenus",
      description: "PDF, vidéos YouTube, sites web, documents texte... Notre plateforme accepte tous vos contenus.",
      gradient: "linear-gradient(135deg, #FF9966, #FF5E62)",
      delay: 0.2,
    },
    {
      icon: <DatasetIcon sx={{ fontSize: 45 }} />,
      title: "Transformation automatique",
      description: "Vos contenus sont automatiquement transformés en datasets de questions/réponses optimisés pour l'IA.",
      gradient: "linear-gradient(135deg, #5D26C1, #a17fe0)",
      delay: 0.4,
    },
    {
      icon: <PsychologyIcon sx={{ fontSize: 45 }} />,
      title: "Fine-tuning & déploiement",
      description: "Entraînez votre modèle IA avec OpenAI ou Anthropic et déployez-le immédiatement.",
      gradient: "linear-gradient(135deg, #59C173, #5D26C1)",
      delay: 0.6,
    },
    {
      icon: <ChatIcon sx={{ fontSize: 45 }} />,
      title: "Utilisez votre assistant",
      description: "Utilisez directement votre IA personnalisée ou intégrez-la via API dans vos applications.",
      gradient: "linear-gradient(135deg, #00C6FF, #0072FF)",
      delay: 0.8,
    },
  ];

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 10, md: 16 },
        position: "relative",
        overflow: "hidden",
        backgroundColor: "background.paper",
      }}
    >
      {/* Futuristic background elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23${
            theme.palette.mode === "dark" ? "ffffff" : "000000"
          }' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Horizontal timeline line */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "5%",
          right: "5%",
          height: "2px",
          backgroundColor: alpha(theme.palette.primary.main, 0.3),
          display: { xs: "none", md: "block" },
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ scaleX: 0, transformOrigin: "left" }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            height: "100%",
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.7)}`,
          }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        <Box sx={{ mb: 10, textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
          >
            <Typography
              variant="h6"
              component="p"
              sx={{
                color: "primary.main",
                fontWeight: 600,
                textTransform: "uppercase",
                mb: 2,
                letterSpacing: 1,
              }}
            >
              4 étapes simples
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, delay: 0.1 },
              },
            }}
          >
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: "linear-gradient(90deg, #7928CA, #00C6FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Orbitron', sans-serif",
              }}
            >
              Comment ça fonctionne
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, delay: 0.2 },
              },
            }}
          >
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{
                maxWidth: 650,
                mx: "auto",
                fontSize: "1.1rem",
                lineHeight: 1.7,
              }}
            >
              Notre plateforme transforme vos contenus bruts en assistants IA personnalisés en seulement quelques minutes, sans code.
            </Typography>
          </motion.div>
        </Box>

        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={controls}
                variants={{
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.7,
                      delay: step.delay,
                    },
                  },
                }}
              >
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    p: 3,
                    borderRadius: 4,
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    background: (theme) =>
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.background.paper, 0.8)
                        : alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${alpha(
                      theme.palette.divider,
                      0.1
                    )}`,
                    boxShadow: (theme) =>
                      theme.palette.mode === "dark"
                        ? `0 10px 30px ${alpha(
                            theme.palette.common.black,
                            0.2
                          )}`
                        : `0 10px 30px ${alpha(
                            theme.palette.common.black,
                            0.1
                          )}`,
                    "&:hover": {
                      transform: "translateY(-10px)",
                      boxShadow: (theme) =>
                        theme.palette.mode === "dark"
                          ? `0 15px 40px ${alpha(
                              theme.palette.common.black,
                              0.3
                            )}`
                          : `0 15px 40px ${alpha(
                              theme.palette.common.black,
                              0.15
                            )}`,
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      background: step.gradient,
                    },
                  }}
                >
                  {/* Step number badge */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "0.8rem",
                      color: "white",
                      background: step.gradient,
                      boxShadow: `0 3px 10px ${alpha(
                        theme.palette.common.black,
                        0.2
                      )}`,
                      zIndex: 1,
                    }}
                  >
                    {index + 1}
                  </Box>

                  {/* Icon with gradient circle */}
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 3,
                      background: (theme) =>
                        alpha(theme.palette.background.paper, 0.6),
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        borderRadius: "inherit",
                        padding: "2px",
                        background: step.gradient,
                        WebkitMask:
                          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        color: "common.white",
                        background: step.gradient,
                        width: 65,
                        height: 65,
                        borderRadius: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {step.icon}
                    </Box>
                  </Box>

                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      mb: 2,
                      fontWeight: 700,
                      background: step.gradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {step.title}
                  </Typography>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 2, flexGrow: 1 }}
                  >
                    {step.description}
                  </Typography>

                  {/* Animated dot at the bottom */}
                  <Box
                    sx={{
                      display: { xs: "none", md: "flex" },
                      justifyContent: "center",
                      mt: 2,
                    }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: step.gradient,
                        boxShadow: `0 0 10px ${alpha(
                          theme.palette.primary.main,
                          0.7
                        )}`,
                      }}
                    />
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// Section Avantages
const Benefits = () => {
  const theme = useTheme();
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const benefits = [
    {
      icon: <ScienceIcon />,
      title: "Zéro compétence technique requise",
      description: "Notre interface intuitive vous guide pas à pas, du téléchargement initial au modèle fine-tuné prêt à l'emploi.",
      color: "#7928CA",
    },
    {
      icon: <DatasetIcon />,
      title: "Datasets de qualité supérieure",
      description: "Notre technologie génère des paires Q/R optimisées pour l'apprentissage, améliorant significativement les performances de votre IA.",
      color: "#00C6FF", 
    },
    {
      icon: <SmartToyIcon />,
      title: "Modèles de pointe",
      description: "Compatibilité native avec les modèles de OpenAI et Anthropic, constamment mis à jour avec les dernières innovations.",
      color: "#FF5E62",
    },
    {
      icon: <CloudUploadIcon />,
      title: "Traitement multiformat",
      description: "Support natif pour documents PDF, vidéos YouTube, sites web, et textes bruts sans prétraitement manuel.",
      color: "#59C173",
    },
    {
      icon: <ChatIcon />,
      title: "Chat intégré & API",
      description: "Testez votre modèle instantanément via notre interface de chat ou intégrez-le à vos applications via API.",
      color: "#5D26C1",
    },
    {
      icon: <CheckCircleIcon />,
      title: "Conformité & sécurité",
      description: "Vos données sont traitées avec les plus hauts standards de sécurité et de confidentialité. Aucun partage avec des tiers.",
      color: "#0072FF",
    },
  ];

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 10, md: 16 },
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'background.default',
      }}
    >
      {/* Futuristic circuit board background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          zIndex: 0,
          backgroundImage: (theme) =>
            theme.palette.mode === 'dark'
              ? "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='white' d='M11 18a7 7 0 100-14 7 7 0 000 14zm48 25a7 7 0 100-14 7 7 0 000 14zm-43-7a3 3 0 100-6 3 3 0 000 6zm63 31a3 3 0 100-6 3 3 0 000 6zM34 90a3 3 0 100-6 3 3 0 000 6zm56-76a3 3 0 100-6 3 3 0 000 6zM12 86a4 4 0 100-8 4 4 0 000 8zm28-65a4 4 0 100-8 4 4 0 000 8zm23-11a5 5 0 100-10 5 5 0 000 10zm-6 60a4 4 0 100-8 4 4 0 000 8zm29 22a5 5 0 100-10 5 5 0 000 10zM32 63a5 5 0 100-10 5 5 0 000 10zm57-13a5 5 0 100-10 5 5 0 000 10zm-9-21a2 2 0 100-4 2 2 0 000 4zM60 91a2 2 0 100-4 2 2 0 000 4zM35 41a2 2 0 100-4 2 2 0 000 4zM12 60a2 2 0 100-4 2 2 0 000 4z'/%3E%3C/svg%3E\")"
              : "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='black' d='M11 18a7 7 0 100-14 7 7 0 000 14zm48 25a7 7 0 100-14 7 7 0 000 14zm-43-7a3 3 0 100-6 3 3 0 000 6zm63 31a3 3 0 100-6 3 3 0 000 6zM34 90a3 3 0 100-6 3 3 0 000 6zm56-76a3 3 0 100-6 3 3 0 000 6zM12 86a4 4 0 100-8 4 4 0 000 8zm28-65a4 4 0 100-8 4 4 0 000 8zm23-11a5 5 0 100-10 5 5 0 000 10zm-6 60a4 4 0 100-8 4 4 0 000 8zm29 22a5 5 0 100-10 5 5 0 000 10zM32 63a5 5 0 100-10 5 5 0 000 10zm57-13a5 5 0 100-10 5 5 0 000 10zm-9-21a2 2 0 100-4 2 2 0 000 4zM60 91a2 2 0 100-4 2 2 0 000 4zM35 41a2 2 0 100-4 2 2 0 000 4zM12 60a2 2 0 100-4 2 2 0 000 4z'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Glowing orbs */}
      <Box
        component={motion.div}
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        sx={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: { xs: 150, md: 300 },
          height: { xs: 150, md: 300 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 198, 255, 0.15) 0%, rgba(0, 198, 255, 0) 70%)',
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />

      <Box
        component={motion.div}
        animate={{
          y: [0, 20, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: 'reverse',
          delay: 2,
        }}
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '10%',
          width: { xs: 150, md: 300 },
          height: { xs: 150, md: 300 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(121, 40, 202, 0.15) 0%, rgba(121, 40, 202, 0) 70%)',
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ mb: 10, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
          >
            <Typography
              variant="h6"
              component="p"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                textTransform: 'uppercase',
                mb: 2,
                letterSpacing: 1,
              }}
            >
              Pourquoi nous choisir
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 } },
            }}
          >
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(90deg, #7928CA, #00C6FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: "'Orbitron', sans-serif",
              }}
            >
              Avantages de notre plateforme
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } },
            }}
          >
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{
                maxWidth: 650,
                mx: 'auto',
                fontSize: '1.1rem',
                lineHeight: 1.7,
              }}
            >
              Transformez vos contenus en assistants IA performants avec une facilité sans précédent grâce à notre technologie de pointe.
            </Typography>
          </motion.div>
        </Box>

        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={controls}
                variants={{
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.7,
                      delay: 0.2 + index * 0.1,
                    },
                  },
                }}
              >
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 4,
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.background.paper, 0.8)
                        : alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    boxShadow: `0 10px 25px ${alpha(theme.palette.common.black, 0.1)}`,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 15px 30px ${alpha(theme.palette.common.black, 0.15)}`,
                    },
                  }}
                >
                  {/* Glowing circle background for icon */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 20,
                      left: 20,
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${alpha(benefit.color, 0.2)} 0%, ${alpha(
                        benefit.color,
                        0
                      )} 70%)`,
                      filter: `blur(10px)`,
                      zIndex: 0,
                    }}
                  />

                  <CardContent sx={{ p: 4, pt: 5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 3,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: alpha(benefit.color, 0.15),
                          color: benefit.color,
                          width: 56,
                          height: 56,
                          boxShadow: `0 0 20px ${alpha(benefit.color, 0.4)}`,
                          zIndex: 1,
                        }}
                      >
                        {benefit.icon}
                      </Avatar>
                      
                      {/* Horizontal line extending from icon */}
                      <Box
                        component={motion.div}
                        initial={{ scaleX: 0, originX: 0 }}
                        animate={controls}
                        variants={{
                          visible: {
                            scaleX: 1,
                            transition: {
                              duration: 0.8,
                              delay: 0.4 + index * 0.1,
                            },
                          },
                        }}
                        sx={{
                          height: '2px',
                          background: `linear-gradient(90deg, ${benefit.color}, transparent)`,
                          width: '100%',
                          ml: 2,
                          opacity: 0.5,
                        }}
                      />
                    </Box>

                    <Typography
                      variant="h6"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        mb: 1.5,
                        color: 'text.primary',
                      }}
                    >
                      {benefit.title}
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      {benefit.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// Section CTA
const CTA = () => {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'background.paper',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: (theme) => 
            theme.palette.mode === 'dark'
              ? 'radial-gradient(circle at 70% 50%, rgba(59, 130, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%)'
              : 'radial-gradient(circle at 70% 50%, rgba(59, 130, 246, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              textAlign: 'center',
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: (theme) => 
                theme.palette.mode === 'dark'
                  ? 'rgba(30, 41, 59, 0.7)'
                  : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              boxShadow: (theme) => 
                theme.palette.mode === 'dark'
                  ? '0 16px 40px rgba(0, 0, 0, 0.3)'
                  : '0 16px 40px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography
              variant="h3"
              component="h2"
              sx={{ 
                fontWeight: 700,
                mb: 2,
              }}
            >
              Prêt à créer votre modèle d'IA ?
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ 
                mb: 4,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Commencez gratuitement et découvrez la puissance du fine-tuning personnalisé
            </Typography>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                py: 1.8,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 24px rgba(59, 130, 246, 0.4)',
                }
              }}
            >
              Commencer maintenant
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

const LandingPage = () => {
  return (
    <PageTransition>
      <Box sx={{ minHeight: '100vh' }}>
        <Navbar />
        <Hero />
        <HowItWorks />
        <Benefits />
        <CTA />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default LandingPage; 