import React, { useEffect, useRef, useState } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Avatar, Stack, useTheme, alpha, Chip, IconButton } from '@mui/material';
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
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import BrushIcon from '@mui/icons-material/Brush';
import SchoolIcon from '@mui/icons-material/School';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SpeedIcon from '@mui/icons-material/Speed';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import TuneIcon from '@mui/icons-material/Tune';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ForumIcon from '@mui/icons-material/Forum';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import ApiIcon from '@mui/icons-material/Api';
import WebIcon from '@mui/icons-material/Web';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import HubIcon from '@mui/icons-material/Hub'; // Pour le centre
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import ContactsIcon from '@mui/icons-material/Contacts';
import SendIcon from '@mui/icons-material/Send';
import HomeIcon from '@mui/icons-material/Home';

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
  const controls = useAnimation();

  // Références pour les positions des éléments pour les lignes néon
  const pdfRef = useRef(null);
  const youtubeRef = useRef(null);
  const webRef = useRef(null);
  const aiCenterRef = useRef(null);

  // Références pour les logos 3D IA
  const openAiRef = useRef(null);
  const anthropicRef = useRef(null);

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  const glassmorphismStyle = {
    backdropFilter: 'blur(12px)',
    backgroundColor: alpha(theme.palette.background.paper, 0.5),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.3)}`,
    borderRadius: '16px',
  };

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 16, md: 24 }, // Plus d'espace en haut
        pb: { xs: 16, md: 24 }, // Plus d'espace en bas
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(180deg, ${alpha("#0a043c", 1)} 0%, ${alpha("#03001e", 1)} 100%)`,
      }}
    >
      {/* Fond d'étoiles animées */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: -2 }}>
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: Math.random() * 100 + 'vw', y: Math.random() * 100 + 'vh' }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              position: 'absolute',
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              background: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.1})`,
              borderRadius: '50%',
            }}
          />
        ))}
      </Box>

      {/* Nébuleuse animée en arrière-plan */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse' }}
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          width: '140%',
          height: '140%',
          background: 'radial-gradient(circle, rgba(121, 40, 202, 0.3) 0%, transparent 70%)',
          filter: 'blur(100px)',
          zIndex: -1,
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', delay: 5 }}
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-20%',
          width: '120%',
          height: '120%',
          background: 'radial-gradient(circle, rgba(0, 198, 255, 0.3) 0%, transparent 70%)',
          filter: 'blur(100px)',
          zIndex: -1,
        }}
      />

      <Container maxWidth="lg">
        <Grid container spacing={8} alignItems="center" sx={{ position: 'relative' }}>
          {/* Colonne texte */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial="hidden"
              animate={controls}
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <Typography
                  component="h1"
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '3rem', md: '4.5rem' },
                    lineHeight: 1.1,
                    background: 'linear-gradient(145deg, #bf00ff, #00d4ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 30px rgba(191, 0, 255, 0.5)',
                    mb: 4,
                    fontFamily: "'Exo 2', sans-serif", // Police plus futuriste
                    letterSpacing: '-1px',
                  }}
                >
                  Votre Contenu,
                  <br />
                  Votre IA.
                  <Box component="span" sx={{ color: '#00d4ff' }}> Amplifiée.</Box>
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants} style={{ marginBottom: '32px' }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                    lineHeight: 1.7,
                    maxWidth: '95%',
                    fontWeight: 400,
                    color: alpha(theme.palette.text.secondary, 0.9),
                    ...glassmorphismStyle, // Appliquer l'effet glassmorphism
                    p: 3,
                  }}
                >
                  Transformez instantanément PDF, YouTube et sites web en assistants IA ultra-performants type <span style={{ color: '#74AA9C', fontWeight: 'bold' }}>ChatGPT</span> ou <span style={{ color: '#D09A74', fontWeight: 'bold' }}>Claude</span>. Aucune expertise requise.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      py: 2,
                      px: 5,
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      borderRadius: '50px', // Plus arrondi
                      background: 'linear-gradient(45deg, #bf00ff, #00d4ff)',
                      position: 'relative',
                      overflow: 'hidden',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: 'white',
                      boxShadow: '0 10px 30px rgba(191, 0, 255, 0.4)',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      '&:hover': {
                        transform: 'translateY(-5px) scale(1.05)',
                        boxShadow: '0 15px 35px rgba(0, 212, 255, 0.5)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent)',
                        transition: 'all 0.7s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      },
                      '&:hover::before': {
                        left: '100%',
                      },
                    }}
                  >
                    Démarrez Gratuitement
                  </Button>
                </Stack>
                <Typography variant="caption" sx={{ display: 'block', mt: 2, color: alpha(theme.palette.text.secondary, 0.7) }}>
                  Premiers pas en 60 secondes. Sans carte de crédit.
                </Typography>
              </motion.div>
            </motion.div>
          </Grid>

          {/* Colonne visualisation 3D */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                height: { xs: 500, md: 650 }, // Hauteur augmentée
                width: '100%',
                perspective: '1200px',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Centre de traitement (effet noyau d'énergie) */}
              <motion.div
                ref={aiCenterRef}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) translateZ(50px)', // Léger décalage 3D
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0, 212, 255, 0.5) 0%, rgba(191, 0, 255, 0.3) 70%, transparent 100%)',
                  boxShadow: '0 0 50px rgba(0, 212, 255, 0.6), 0 0 80px rgba(191, 0, 255, 0.4)',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: '70%',
                    height: '70%',
                    border: '3px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: '50%',
                    borderTopColor: '#00d4ff',
                    borderRightColor: '#00d4ff',
                  }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    width: '85%',
                    height: '85%',
                    border: '2px dashed rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                  }}
                />
                 <SyncAltIcon sx={{ fontSize: 50, color: '#fff', position: 'absolute', animation: 'pulse 2s infinite' }} />
              </motion.div>

              {/* Sources de contenu flottantes */}
              <FloatingIcon
                ref={pdfRef}
                icon={PictureAsPdfIcon}
                label="PDF"
                color="#FF6B6B"
                initialPos={{ top: '15%', left: '10%', z: -50 }}
                delay={0.8}
                aiCenterRef={aiCenterRef}
              />
              <FloatingIcon
                ref={youtubeRef}
                icon={YouTubeIcon}
                label="YouTube"
                color="#FF0000"
                initialPos={{ top: '40%', left: '0%', z: -20 }}
                delay={1.0}
                 aiCenterRef={aiCenterRef}
             />
              <FloatingIcon
                ref={webRef}
                icon={LanguageIcon}
                label="Web"
                color="#4ECDC4"
                initialPos={{ top: '70%', left: '10%', z: -40 }}
                delay={1.2}
                 aiCenterRef={aiCenterRef}
             />

              {/* Logos IA 3D */}
              <FloatingIcon
                ref={openAiRef}
                icon={SmartToyIcon} // Remplacer par un logo OpenAI si disponible
                label="OpenAI"
                color="#74AA9C"
                initialPos={{ top: '30%', right: '5%', z: 80 }}
                delay={1.4}
                isIALogo
                 aiCenterRef={aiCenterRef}
             />
              <FloatingIcon
                ref={anthropicRef}
                icon={SmartToyIcon} // Remplacer par un logo Anthropic/Claude si disponible
                label="Claude"
                color="#D09A74"
                initialPos={{ top: '65%', right: '15%', z: 60 }}
                delay={1.6}
                isIALogo
                 aiCenterRef={aiCenterRef}
             />

              {/* Lignes de connexion Neon animées */}
              <NeonConnectionLine startRef={pdfRef} endRef={aiCenterRef} color="#FF6B6B" delay={1.8} />
              <NeonConnectionLine startRef={youtubeRef} endRef={aiCenterRef} color="#FF0000" delay={2.0} />
              <NeonConnectionLine startRef={webRef} endRef={aiCenterRef} color="#4ECDC4" delay={2.2} />
              <NeonConnectionLine startRef={aiCenterRef} endRef={openAiRef} color="#74AA9C" delay={2.4} thickness={3} />
              <NeonConnectionLine startRef={aiCenterRef} endRef={anthropicRef} color="#D09A74" delay={2.6} thickness={3} />

            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// --- Nouveau composant pour les icônes flottantes --- //
const FloatingIcon = React.forwardRef(({ icon: Icon, label, color, initialPos, delay, isIALogo = false, aiCenterRef }, ref) => {
  const theme = useTheme();
  const controls = useAnimation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      controls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, delay, ease: 'easeOut' }
      });
    }, 50); // Petit délai pour assurer le rendu initial
    return () => clearTimeout(timer);
  }, [controls, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={controls}
      whileHover={{ scale: 1.1, zIndex: 100 }} // Effet de survol
      transition={{ type: 'spring', stiffness: 300 }}
      style={{
        position: 'absolute',
        ...initialPos,
        transform: `translateZ(${initialPos.z}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        opacity: 0, // Initialement invisible
      }}
    >
      <Box
        sx={{
          width: isIALogo ? 80 : 60,
          height: isIALogo ? 80 : 60,
          borderRadius: isIALogo ? '20px' : '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
          background: `radial-gradient(circle, ${alpha(color, 0.3)} 0%, ${alpha(color, 0.1)} 100%)`,
          backdropFilter: 'blur(8px)',
          border: `1px solid ${alpha(color, 0.5)}`,
          boxShadow: `0 0 20px ${alpha(color, 0.6)}, 0 0 30px ${alpha(color, 0.3)} inset`,
          transition: 'all 0.3s ease',
        }}
      >
        <Icon sx={{ fontSize: isIALogo ? 45 : 30, color: color }} />
      </Box>
      <Typography
        variant="caption"
        sx={{
          color: alpha(theme.palette.text.primary, 0.8),
          fontWeight: 600,
          textShadow: `0 0 5px ${alpha(color, 0.5)}`,
          textAlign: 'center'
        }}
      >
        {label}
      </Typography>
    </motion.div>
  );
});

// --- Nouveau composant pour les lignes de connexion Neon --- //
const NeonConnectionLine = ({ startRef, endRef, color, delay, thickness = 2 }) => {
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState({ x: 0, y: 0 });
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const lineRef = useRef(null);

  useEffect(() => {
    const updatePositions = () => {
      if (startRef.current && endRef.current) {
        const startRect = startRef.current.getBoundingClientRect();
        const endRect = endRef.current.getBoundingClientRect();
        const parentRect = startRef.current.parentElement.getBoundingClientRect();

        // Calculer les centres des éléments par rapport au parent
        setStartPos({
          x: startRect.left - parentRect.left + startRect.width / 2,
          y: startRect.top - parentRect.top + startRect.height / 2,
        });
        setEndPos({
          x: endRect.left - parentRect.left + endRect.width / 2,
          y: endRect.top - parentRect.top + endRect.height / 2,
        });
      }
    };

    updatePositions();
    // Recalculer si la fenêtre est redimensionnée
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, [startRef, endRef]);

  useEffect(() => {
    if (inView && startPos.x !== 0) { // S'assurer que les positions sont calculées
      controls.start({
        pathLength: 1,
        opacity: 1,
        transition: { duration: 1.5, delay, ease: "easeInOut" }
      });
    }
  }, [controls, inView, startPos, delay]);

  return (
    <Box ref={ref} sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
      <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <motion.path
          ref={lineRef}
          d={`M${startPos.x},${startPos.y} Q${startPos.x + (endPos.x - startPos.x) * 0.2},${startPos.y + (endPos.y - startPos.y) * 0.8} ${endPos.x},${endPos.y}`}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="transparent"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={controls}
          style={{
            filter: `drop-shadow(0 0 6px ${alpha(color, 0.8)}) drop-shadow(0 0 10px ${alpha(color, 0.5)})`,
          }}
        />
        {/* Animation de flux lumineux */}
        <motion.circle
          r="4"
          fill={color}
          initial={{ opacity: 0 }}
          animate={{
            opacity: inView && startPos.x !== 0 ? [0, 1, 0] : 0,
            transition: { duration: 1.5, repeat: Infinity, ease: "linear", delay: delay + 0.5 }
          }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        >
          <animateMotion
            dur="1.5s"
            repeatCount="indefinite"
            path={`M${startPos.x},${startPos.y} Q${startPos.x + (endPos.x - startPos.x) * 0.2},${startPos.y + (endPos.y - startPos.y) * 0.8} ${endPos.x},${endPos.y}`}
            begin={`${delay + 0.5}s`}
          />
        </motion.circle>
      </svg>
    </Box>
  );
};

// --- Nouvelle Section: Introduction --- //
const IntroductionSection = () => {
  const theme = useTheme();
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  const glassmorphismStyle = {
    backdropFilter: 'blur(10px)',
    backgroundColor: alpha(theme.palette.background.default, 0.3),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    borderRadius: '20px',
    padding: theme.spacing(4),
    boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.37)}`,
  };

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 12, md: 18 },
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${alpha("#03001e", 1)} 0%, ${alpha("#050224", 1)} 100%)`, // Dégradé légèrement différent
      }}
    >
      {/* Effet de particules animées */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: Math.random() * 100 + 'vw', y: Math.random() * 100 + 'vh' }}
            animate={{
              opacity: [0, 0.5, 0],
              x: `+=${Math.random() * 100 - 50}px`,
              y: `+=${Math.random() * 100 - 50}px`,
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: Math.random() * 3,
            }}
            style={{
              position: 'absolute',
              width: Math.random() * 50 + 20,
              height: Math.random() * 50 + 20,
              background: `radial-gradient(circle, ${alpha(i % 2 === 0 ? '#00d4ff' : '#bf00ff', 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
              filter: 'blur(5px)',
            }}
          />
        ))}
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Colonne Visuelle (peut-être une autre animation 3D simple) */}
          <Grid item xs={12} md={5}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={controls}
              variants={{ visible: { opacity: 1, x: 0, transition: { duration: 0.8, delay: 0.3, ease: 'easeOut' } } }}
            >
              {/* Placeholder pour un visuel futuriste simple */}
              <Box sx={{
                height: { xs: 300, md: 400 },
                borderRadius: '24px',
                background: 'linear-gradient(145deg, rgba(0, 212, 255, 0.1), rgba(191, 0, 255, 0.1))' ,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px rgba(0, 212, 255, 0.2)',
              }}>
                <SmartToyIcon sx={{ fontSize: 100, color: '#00d4ff', opacity: 0.5 }} />
              </Box>
            </motion.div>
          </Grid>

          {/* Colonne Texte */}
          <Grid item xs={12} md={7}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={controls}
              variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.1, ease: 'easeOut' } } }}
            >
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontWeight: 900,
                  mb: 4,
                  background: 'linear-gradient(145deg, #00d4ff, #bf00ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: "'Exo 2', sans-serif",
                  textShadow: '0 0 15px rgba(0, 212, 255, 0.4)',
                }}
              >
                Qu'est-ce que FinTune ?
              </Typography>

              <Box sx={{ ...glassmorphismStyle }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    lineHeight: 1.7,
                    color: alpha(theme.palette.text.primary, 0.9),
                    fontWeight: 400,
                  }}
                >
                  FinTune est votre passerelle vers une IA véritablement personnalisée. En quelques clics, transformez vos contenus uniques (textes, PDF, vidéos YouTube...) en modèles d'IA surpuissants type ChatGPT ou Claude.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: alpha(theme.palette.text.secondary, 0.8), lineHeight: 1.7 }}
                >
                  Le tout s'opère directement sur <strong style={{ color: theme.palette.primary.light }}>votre propre compte OpenAI ou Anthropic</strong>. Oubliez la configuration manuelle complexe : vous récupérez un modèle fine-tuné, prêt à être intégré et à refléter l'ADN de votre marque ou projet.
                </Typography>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// --- Nouvelle Section: Processus "Comment ça marche ?" --- //
const ProcessSection = () => {
  const theme = useTheme();
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  const steps = [
    {
      icon: <CloudUploadIcon sx={{ fontSize: 40 }} />,
      title: "1. Connectez Votre Contenu",
      description: "Importez facilement PDF, textes, transcriptions vidéo... La source de votre future IA.",
      color: '#FF9A8B',
    },
    {
      icon: <SyncAltIcon sx={{ fontSize: 40 }} />,
      title: "2. Magie Technique en Coulisses",
      description: "Cliquez sur \"Lancer\". Notre plateforme prépare, formate et entraîne le modèle pour vous.",
      color: '#a18cd1',
    },
    {
      icon: <SmartToyIcon sx={{ fontSize: 40 }} />,
      title: "3. Votre Modèle, Votre Propriété",
      description: "Récupérez votre IA fine-tunée (ex: \"IA_Marketing_Fun\") sur votre compte OpenAI/Anthropic, prête à l'emploi.",
      color: '#84fab0',
    },
  ];

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 12, md: 20 },
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(rgba(5, 2, 36, 0.98), rgba(5, 2, 36, 0.98)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><path d="M50 0 L100 50 L50 100 Z" fill="${alpha('#00d4ff', 0.02)}"/><circle cx="50" cy="50" r="10" fill="${alpha('#bf00ff', 0.03)}"/></svg>')`,
        backgroundSize: 'auto, 120px 120px',
      }}
    >
      <Container maxWidth="lg">
        {/* Titres */}
        <Box sx={{ mb: 12, textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0 } } }}
          >
            <Typography
              variant="h6"
              component="p"
              sx={{ color: "#00d4ff", fontWeight: 700, textTransform: "uppercase", mb: 2, letterSpacing: 2, textShadow: '0 0 8px #00d4ff' }}
            >
              Votre Parcours vers l'IA Personnalisée
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 } } }}
          >
            <Typography
              variant="h2"
              component="h2"
              sx={{ fontWeight: 900, mb: 3, background: 'linear-gradient(145deg, #bf00ff, #00d4ff)', WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Exo 2', sans-serif", textShadow: '0 0 20px rgba(191, 0, 255, 0.4)' }}
            >
              Comment ça Fonctionne ?
            </Typography>
          </motion.div>
        </Box>

        {/* Cartes d'étapes avec lignes de connexion */}
        <Box sx={{ position: 'relative' }}>
          <Grid container spacing={5} alignItems="stretch">
            {steps.map((step, index) => (
              <Grid item xs={12} md={4} key={index} sx={{ zIndex: 2 }}>
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  animate={controls}
                  variants={{
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.8,
                        delay: 0.3 + index * 0.2, // Délai progressif
                        ease: [0.16, 1, 0.3, 1],
                      },
                    },
                  }}
                  style={{ height: '100%' }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      p: 4,
                      textAlign: 'center',
                      borderRadius: '24px',
                      position: 'relative',
                      overflow: 'hidden',
                      background: `linear-gradient(160deg, ${alpha(theme.palette.background.paper, 0.7)}, ${alpha(theme.palette.background.paper, 0.5)})`,
                      backdropFilter: 'blur(12px)',
                      border: `1px solid ${alpha(step.color, 0.4)}`,
                      boxShadow: `0 0 25px ${alpha(step.color, 0.2)}, 0 10px 30px ${alpha(theme.palette.common.black, 0.3)}`,
                      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        borderColor: alpha(step.color, 0.8),
                        boxShadow: `0 0 40px ${alpha(step.color, 0.4)}, 0 15px 40px ${alpha(theme.palette.common.black, 0.4)}`,
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 70,
                        height: 70,
                        bgcolor: alpha(step.color, 0.15),
                        color: step.color,
                        margin: '0 auto 24px auto',
                        boxShadow: `0 0 20px ${alpha(step.color, 0.5)}`,
                      }}
                    >
                      {step.icon}
                    </Avatar>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: alpha(theme.palette.text.secondary, 0.9) }}>
                      {step.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Lignes de connexion animées (simplifiées pour cette section) */}
          <motion.svg
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}
            initial="hidden"
            animate={controls}
            viewBox="0 0 1200 200" // Ajout d'un viewBox pour référence
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Ligne 1 -> 2 (Utilisation de coordonnées approximatives basées sur le viewBox) */}
            <motion.path
              d="M 400 100 Q 500 100 600 100" // Coordonnées numériques au lieu de %
              stroke={alpha(theme.palette.primary.main, 0.5)}
              strokeWidth="2"
              strokeDasharray="5 5"
              fill="transparent"
              variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1, transition: { duration: 1, delay: 0.8 } } }}
              style={{ filter: `drop-shadow(0 0 5px ${alpha(theme.palette.primary.main, 0.5)})` }}
            />
            {/* Ligne 2 -> 3 (Utilisation de coordonnées approximatives basées sur le viewBox) */}
            <motion.path
              d="M 600 100 Q 700 100 800 100" // Coordonnées numériques au lieu de %
              stroke={alpha(theme.palette.secondary.main, 0.5)}
              strokeWidth="2"
              strokeDasharray="5 5"
              fill="transparent"
              variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1, transition: { duration: 1, delay: 1.0 } } }}
              style={{ filter: `drop-shadow(0 0 5px ${alpha(theme.palette.secondary.main, 0.5)})` }}
            />
          </motion.svg>
        </Box>
      </Container>
    </Box>
  );
};

// --- Nouvelle Section: Cas d'Usage Créatifs --- //
const UseCasesSection = () => {
  const theme = useTheme();
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  const useCases = [
    {
      icon: <TheaterComedyIcon sx={{ fontSize: 45 }} />,
      title: "Incarnez un Personnage Culte",
      description: "Imaginez un chatbot façon \"Michael Scott\" pour des interactions client mémorables et décalées.",
      color: '#fbc2eb', // Rose pâle
    },
    {
      icon: <BrushIcon sx={{ fontSize: 45 }} />,
      title: "Voix de Marque Unique",
      description: "Ton ludique, élégant ou branché ? Créez une IA qui incarne parfaitement l'identité de votre marque.",
      color: '#a18cd1', // Mauve
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 45 }} />,
      title: "Formation & E-learning Engageants",
      description: "Un assistant qui explique vos cours façon personnage fictif pour captiver les apprenants.",
      color: '#84fab0', // Vert pâle
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 45 }} />,
      title: "Support Client Thématique",
      description: "Remplacez la FAQ par un chatbot humoristique ou au style de célébrité pour marquer les esprits.",
      color: '#5ee7df', // Turquoise
    },
  ];

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 12, md: 20 },
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(180deg, ${alpha("#050224", 1)} 0%, ${alpha("#0a043c", 1)} 100%)`, // Inversé par rapport à Intro
      }}
    >
       {/* Arrière-plan géométrique animé */}
       <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
         <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', width: '150%', height: '150%', top: '-25%', left: '-25%' }}
         >
          <Box sx={{
            width: '100%', height: '100%',
            backgroundImage: `
              repeating-linear-gradient(45deg, ${alpha('#bf00ff', 0.05)}, ${alpha('#bf00ff', 0.05)} 1px, transparent 1px, transparent 60px),
              repeating-linear-gradient(-45deg, ${alpha('#00d4ff', 0.05)}, ${alpha('#00d4ff', 0.05)} 1px, transparent 1px, transparent 60px)
            `,
            opacity: 0.5,
          }} />
         </motion.div>
       </Box>

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
         {/* Titres */}
         <Box sx={{ mb: 12, textAlign: "center" }}>
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={controls}
             variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0 } } }}
           >
             <Typography
               variant="h6"
               component="p"
               sx={{ color: "#bf00ff", fontWeight: 700, textTransform: "uppercase", mb: 2, letterSpacing: 2, textShadow: '0 0 8px #bf00ff' }}
             >
               Libérez Votre Créativité
             </Typography>
           </motion.div>
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={controls}
             variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 } } }}
           >
             <Typography
               variant="h2"
               component="h2"
               sx={{ fontWeight: 900, mb: 3, background: 'linear-gradient(145deg, #00d4ff, #bf00ff)', WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Exo 2', sans-serif", textShadow: '0 0 20px rgba(0, 212, 255, 0.4)' }}
             >
               Des Usages Uniques Pour Votre IA
             </Typography>
           </motion.div>
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } } }}
          >
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 700, mx: "auto", fontSize: "1.1rem", lineHeight: 1.8, color: alpha(theme.palette.text.secondary, 0.8) }}
            >
              Allez plus loin que le simple chatbot. Créez des expériences mémorables et différenciantes grâce à la personnalisation ultime.
            </Typography>
          </motion.div>
         </Box>

         {/* Grille des cas d'usage */}
         <Grid container spacing={4}>
           {useCases.map((useCase, index) => (
             <Grid item xs={12} sm={6} key={index}>
               <motion.div
                 initial={{ opacity: 0, scale: 0.9, y: 50 }}
                 animate={controls}
                 variants={{
                   visible: {
                     opacity: 1,
                     scale: 1,
                     y: 0,
                     transition: {
                       duration: 0.7,
                       delay: 0.3 + index * 0.15,
                       ease: [0.16, 1, 0.3, 1],
                     },
                   },
                 }}
                 whileHover={{ scale: 1.03, y: -5 }}
                 transition={{ type: 'spring', stiffness: 200 }}
                 style={{ height: '100%' }}
               >
                 <Card
                   sx={{
                     height: '100%',
                     p: 4,
                     display: 'flex',
                     flexDirection: 'column',
                     borderRadius: '20px',
                     position: 'relative',
                     overflow: 'hidden',
                     background: alpha(theme.palette.background.paper, 0.4),
                     backdropFilter: 'blur(10px)',
                     border: `1px solid ${alpha(useCase.color, 0.3)}`,
                     boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.2)}`,
                     transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': {
                        borderColor: alpha(useCase.color, 0.7),
                        boxShadow: `0 0 20px ${alpha(useCase.color, 0.3)}, 0 10px 30px ${alpha(theme.palette.common.black, 0.3)}`,
                      },
                      '&::before': { // Effet de lueur interne au survol
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 'inherit',
                        boxShadow: `inset 0 0 25px ${alpha(useCase.color, 0.4)}`,
                        opacity: 0,
                        transition: 'opacity 0.4s ease',
                        zIndex: 0,
                      },
                      '&:hover::before': {
                        opacity: 1,
                      },
                   }}
                 >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, zIndex: 1 }}>
                       <Avatar sx={{ width: 56, height: 56, bgcolor: alpha(useCase.color, 0.2), color: useCase.color, mr: 2, boxShadow: `0 0 15px ${alpha(useCase.color, 0.4)}` }}>
                         {useCase.icon}
                       </Avatar>
                       <Typography variant="h5" component="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
                         {useCase.title}
                       </Typography>
                     </Box>
                     <Typography variant="body1" sx={{ color: alpha(theme.palette.text.secondary, 0.9), flexGrow: 1, zIndex: 1 }}>
                       {useCase.description}
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

// --- Nouvelle Section: Avantages Clés --- //
const AdvantagesSection = () => {
  const theme = useTheme();
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  const advantages = [
    { icon: <SpeedIcon sx={{ fontSize: 30 }}/>, title: "Gain de Temps Massif", description: "Oubliez la préparation des données et l'entraînement manuel. Cliquez, c'est prêt.", color: "#84fab0" },
    { icon: <EmojiObjectsIcon sx={{ fontSize: 30 }}/>, title: "Expérience Utilisateur Unique", description: "Différenciez-vous avec une IA qui sort de l'ordinaire et engage vraiment.", color: "#5ee7df" },
    { icon: <TuneIcon sx={{ fontSize: 30 }}/>, title: "Flexibilité Totale", description: "Personnalité, style, tonalité... Sculptez l'IA selon vos besoins marketing ou pédagogiques.", color: "#fbc2eb" },
    { icon: <IntegrationInstructionsIcon sx={{ fontSize: 30 }}/>, title: "Intégration Transparente", description: "Utilisez votre modèle personnalisé via l'API OpenAI/Anthropic aussi simplement qu'un modèle standard.", color: "#a18cd1" },
    { icon: <AccessibilityNewIcon sx={{ fontSize: 30 }}/>, title: "Simplicité Maximale", description: "Conçu pour tous. Aucune compétence technique requise pour créer des expériences IA marquantes.", color: "#ff9a8b" },
  ];

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 12, md: 20 },
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(rgba(10, 4, 60, 0.97), rgba(10, 4, 60, 0.97)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><defs><filter id="f1" x="0" y="0"><feGaussianBlur in="SourceGraphic" stdDeviation="1" /></filter></defs><circle cx="50" cy="50" r="5" fill="${alpha('#00d4ff', 0.1)}" filter="url(%23f1)"/><path d="M0 0 L50 50 L0 100 Z" fill="${alpha('#bf00ff', 0.05)}"/></svg>')`,
        backgroundSize: 'auto, 100px 100px',
        borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      }}
    >
       {/* Lignes de circuit animées */}
       <Box sx={{ position: 'absolute', inset: 0, opacity: 0.1, zIndex: 0 }}>
         {/* Utilisation d'une base numérique (ex: 1000x1000) pour les coordonnées */}
         <motion.svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none">
           {[...Array(15)].map((_, i) => (
             <motion.path
               key={i}
               // Correction: Générer des coordonnées numériques entre 0 et 1000
               d={`M ${Math.random() * 1000} 0 V 1000`}
               stroke={i % 2 === 0 ? '#00d4ff' : '#bf00ff'}
               strokeWidth={Math.random() * 1 + 0.5}
               initial={{ pathLength: 0, opacity: 0 }}
               animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
               transition={{
                 duration: Math.random() * 5 + 5,
                 repeat: Infinity,
                 delay: Math.random() * 5,
                 ease: "easeInOut"
               }}
               style={{ filter: `drop-shadow(0 0 3px ${i % 2 === 0 ? '#00d4ff' : '#bf00ff'})` }}
             />
           ))}
            {[...Array(10)].map((_, i) => (
             <motion.path
               key={`h-${i}`}
                // Correction: Générer des coordonnées numériques entre 0 et 1000
               d={`M 0 ${Math.random() * 1000} H 1000`}
               stroke={i % 2 === 0 ? '#bf00ff' : '#00d4ff'}
               strokeWidth={Math.random() * 1 + 0.5}
               initial={{ pathLength: 0, opacity: 0 }}
               animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
               transition={{
                 duration: Math.random() * 5 + 6,
                 repeat: Infinity,
                 delay: Math.random() * 6,
                 ease: "easeInOut"
               }}
               style={{ filter: `drop-shadow(0 0 3px ${i % 2 === 0 ? '#bf00ff' : '#00d4ff'})` }}
             />
           ))}
         </motion.svg>
       </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
         {/* Titres */}
         <Box sx={{ mb: 12, textAlign: 'center' }}>
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={controls}
             variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0 } } }}
           >
             <Typography
               variant="h6"
               component="p"
               sx={{ color: "#84fab0", fontWeight: 700, textTransform: "uppercase", mb: 2, letterSpacing: 2, textShadow: '0 0 8px #84fab0' }}
             >
               La Différence FinTune
             </Typography>
           </motion.div>
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={controls}
             variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 } } }}
           >
             <Typography
               variant="h2"
               component="h2"
               sx={{ fontWeight: 900, mb: 3, background: 'linear-gradient(145deg, #84fab0, #5ee7df)', WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Exo 2', sans-serif", textShadow: '0 0 20px rgba(132, 250, 176, 0.4)' }}
             >
               Vos Avantages Stratégiques
             </Typography>
           </motion.div>
         </Box>

         {/* Grille des avantages */}
         <Grid container spacing={4} justifyContent="center">
           {advantages.slice(0, 3).map((advantage, index) => (
             <AdvantageCard key={index} advantage={advantage} index={index} controls={controls} />
           ))}
         </Grid>
         <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
           {advantages.slice(3).map((advantage, index) => (
            <AdvantageCard key={index + 3} advantage={advantage} index={index + 3} controls={controls} />
           ))}
         </Grid>

      </Container>
    </Box>
  );
};

// Composant Carte Avantage
const AdvantageCard = ({ advantage, index, controls }) => {
  const theme = useTheme();
  return (
    <Grid item xs={12} sm={6} md={4} >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={controls}
        variants={{
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.7,
              delay: 0.2 + index * 0.1,
              ease: [0.16, 1, 0.3, 1],
            },
          },
        }}
        whileHover={{ y: -8 }}
        transition={{ type: 'spring', stiffness: 250 }}
        style={{ height: '100%' }}
      >
        <Card
          sx={{
            height: '100%',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            borderRadius: '16px',
            background: alpha(theme.palette.background.paper, 0.1),
            backdropFilter: 'blur(8px)',
            border: `1px solid ${alpha(advantage.color, 0.3)}`,
            boxShadow: `0 5px 15px ${alpha(theme.palette.common.black, 0.2)}`,
            transition: 'all 0.3s ease',
             '&:hover': {
               borderColor: alpha(advantage.color, 0.8),
               background: alpha(theme.palette.background.paper, 0.2),
               boxShadow: `0 0 20px ${alpha(advantage.color, 0.3)}, 0 8px 25px ${alpha(theme.palette.common.black, 0.3)}`,
             }
          }}
        >
          <Avatar sx={{ width: 60, height: 60, bgcolor: alpha(advantage.color, 0.2), color: advantage.color, mb: 2, boxShadow: `0 0 15px ${alpha(advantage.color, 0.4)}` }}>
            {advantage.icon}
          </Avatar>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
            {advantage.title}
          </Typography>
          <Typography variant="body2" sx={{ color: alpha(theme.palette.text.secondary, 0.9), flexGrow: 1 }}>
            {advantage.description}
          </Typography>
        </Card>
      </motion.div>
    </Grid>
  );
}

// --- Nouvelle Section: Exemples de Chat Animés --- //

// Composant pour un seul message dans le chat avec design amélioré
const AnimatedChatMessage = ({ message, isUser, avatar, animationDelay, accentColor }) => {
  const theme = useTheme();
  const controls = useAnimation();
  const text = message;

  const textVariants = {
    hidden: { opacity: 0 },
    visible: (i) => ({
      opacity: 1,
      transition: {
        delay: i * 0.02, // Délai entre chaque caractère pour l'effet de frappe (plus rapide)
      },
    }),
  };

  useEffect(() => {
    const sequence = async () => {
      // Attend le délai initial avant de commencer l'animation
      await new Promise(res => setTimeout(res, animationDelay * 1000));
      // Démarre l'animation de frappe
      controls.start("visible");
    };
    sequence();
  }, [controls, animationDelay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: isUser ? 10 : -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.5, delay: animationDelay - 0.2 > 0 ? animationDelay - 0.2 : 0 }}
    >
      <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: isUser ? 'row-reverse' : 'row' }}>
          {avatar && (
            <Avatar 
              sx={{ 
                bgcolor: isUser ? alpha(theme.palette.primary.main, 0.8) : alpha(accentColor || theme.palette.secondary.main, 0.8), 
                width: 36, 
                height: 36, 
                m: 1,
                boxShadow: `0 2px 10px ${alpha(isUser ? theme.palette.primary.main : accentColor || theme.palette.secondary.main, 0.4)}`,
                border: `2px solid ${alpha(isUser ? theme.palette.primary.main : accentColor || theme.palette.secondary.main, 0.3)}`,
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}
            >
              {avatar}
            </Avatar>
          )}
          <Box
            sx={{
              p: 2,
              borderRadius: '18px',
              borderTopLeftRadius: isUser ? '18px' : '4px',
              borderTopRightRadius: isUser ? '4px' : '18px',
              maxWidth: '85%',
              background: isUser
                ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.dark, 0.8)})`
                : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.6)}, ${alpha(theme.palette.background.paper, 0.3)})`,
              color: isUser ? 'white' : 'text.primary',
              backdropFilter: !isUser ? 'blur(10px)' : 'none',
              border: !isUser ? `1px solid ${alpha(accentColor || theme.palette.divider, 0.2)}` : 'none',
              boxShadow: isUser
                ? `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
                : `0 6px 20px ${alpha(theme.palette.common.black, 0.15)}`,
              position: 'relative',
              '&::after': !isUser ? {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 'inherit',
                border: `1px solid ${alpha(accentColor || theme.palette.secondary.main, 0.3)}`,
                opacity: 0.6,
              } : {},
            }}
          >
            <Typography variant="body1" component="div" sx={{ wordBreak: 'break-word', lineHeight: 1.5, fontWeight: !isUser ? 500 : 400 }}>
              {text.split("").map((char, index) => (
                <motion.span key={index} custom={index} initial="hidden" animate={controls} variants={textVariants}>
                  {char}
                </motion.span>
              ))}
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

// Composant pour un exemple de conversation complet avec design amélioré
const ChatExample = ({ title, Icon, messages, initialDelay, accentColor }) => {
  const theme = useTheme();
  let cumulativeDelay = initialDelay;

  return (
    <Card
      sx={{
        p: 0,
        borderRadius: '24px',
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.5)}, ${alpha(theme.palette.background.default, 0.2)})`,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${alpha(accentColor || theme.palette.divider, 0.3)}`,
        boxShadow: `0 10px 40px 0 ${alpha(theme.palette.common.black, 0.3)}, 0 0 20px ${alpha(accentColor || theme.palette.primary.main, 0.2)}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2.5, 
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: `linear-gradient(90deg, ${alpha(accentColor || theme.palette.primary.light, 0.1)}, transparent)`,
      }}>
        <Avatar sx={{ 
          bgcolor: alpha(accentColor || theme.palette.primary.light, 0.2), 
          color: accentColor || theme.palette.primary.light,
          mr: 2,
          boxShadow: `0 0 10px ${alpha(accentColor || theme.palette.primary.light, 0.3)}`
        }}>
          <Icon />
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 600, color: alpha(theme.palette.text.primary, 0.9) }}>{title}</Typography>
      </Box>
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        p: 2.5,
        background: `radial-gradient(circle at center, ${alpha(accentColor || theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` 
      }}>
        {messages.map((msg, index) => {
          const delay = cumulativeDelay;
          // Estimer le temps d'animation basé sur la longueur du message + délai fixe
          cumulativeDelay += (msg.text.length * 0.02) + (msg.isUser ? 0.8 : 1.2); // Plus de délai après réponse IA
          return (
            <AnimatedChatMessage
              key={index}
              message={msg.text}
              isUser={msg.isUser}
              avatar={msg.avatar}
              animationDelay={delay}
              accentColor={accentColor}
            />
          );
        })}
      </Box>
      <Box sx={{ 
        p: 2, 
        display: 'flex',
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: alpha(theme.palette.background.paper, 0.3),
      }}>
        <Box sx={{ 
          flexGrow: 1,
          borderRadius: '50px',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          p: 1,
          pl: 2,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: alpha(theme.palette.background.default, 0.5)
        }}>
          <Typography variant="body2" sx={{ color: alpha(theme.palette.text.secondary, 0.6), flexGrow: 1 }}>
            Votre message...
          </Typography>
          <IconButton size="small" sx={{ color: accentColor || theme.palette.primary.main }}>
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
};

const ChatExamplesSection = () => {
  const theme = useTheme();
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  // Exemples de conversations
  const chatExamples = [
    {
      title: "Michael Scott Bot (The Office)",
      Icon: TheaterComedyIcon,
      initialDelay: 0.5,
      accentColor: '#fbc2eb', // Rose pour le côté fun
      messages: [
        { text: "Que penses-tu de ma présentation PowerPoint ?", isUser: true, avatar: 'U' },
        { text: "C'est... comment dire... C'est comme si PowerPoint avait rencontré un épisode de \"Threat Level Midnight\". Intense. Inoubliable. That's what she said!", isUser: false, avatar: 'MS' },
        { text: "Ok... et pour le team building de vendredi ?", isUser: true, avatar: 'U' },
        { text: "J'ai une idée GÉNIALE. On va tous... survivre dans la forêt ! Enfin, le parc d'à côté. Ça va créer des liens. Ou des procès. On verra !", isUser: false, avatar: 'MS' }
      ]
    },
    {
      title: "Support Technique Personnalisé",
      Icon: ContactSupportIcon,
      initialDelay: 1.0, // Démarrer un peu après le premier
      accentColor: '#84fab0', // Vert pour le côté assistance
      messages: [
        { text: "Bonjour, j'ai un problème avec l'API, erreur 403.", isUser: true, avatar: 'D' },
        { text: "Bonjour ! L'erreur 403 indique un souci d'authentification. Vérifiez que votre clé API est correcte et bien incluse dans l'en-tête 'Authorization: Bearer VOTRE_CLÉ'.", isUser: false, avatar: 'IA' },
        { text: "Ah oui, j'avais oublié le \"Bearer\". Merci !", isUser: true, avatar: 'D' },
        { text: "Pas de problème ! N'hésitez pas si vous avez d'autres questions. L'important est de toujours vérifier les détails, comme Pam le fait avec mes notes de frais !", isUser: false, avatar: 'IA' }
      ]
    },
    {
      title: "Assistant E-Learning Interactif",
      Icon: SchoolIcon,
      initialDelay: 1.5,
      accentColor: '#a18cd1', // Mauve pour l'éducation
      messages: [
        { text: "Peux-tu m'expliquer le concept de fine-tuning simplement ?", isUser: true, avatar: 'A' },
        { text: "Bien sûr ! Imagine un chef cuistot (le modèle de base). Le fine-tuning, c'est lui apprendre VOS recettes secrètes (vos données) pour qu'il cuisine exactement comme VOUS le voulez !", isUser: false, avatar: '🎓' },
        { text: "Super analogie ! Et comment ça marche ici ?", isUser: true, avatar: 'A' },
        { text: "Vous donnez les ingrédients (PDF, vidéos...), on apprend au chef (OpenAI/Claude) vos recettes (format Q/R), et hop ! Vous avez votre propre chef étoilé spécialisé !", isUser: false, avatar: '🎓' }
      ]
    }
  ];

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 12, md: 20 },
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(rgba(10, 4, 60, 0.9), rgba(10, 4, 60, 0.99)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="30" fill="none" stroke="${alpha('#00d4ff', 0.05)}" stroke-width="1"/><circle cx="50" cy="50" r="45" fill="none" stroke="${alpha('#bf00ff', 0.05)}" stroke-width="1"/></svg>')`,
        backgroundSize: 'auto, 200px 200px',
      }}
    >
       <Container maxWidth="lg">
         {/* Titres */}
         <Box sx={{ mb: 12, textAlign: 'center' }}>
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={controls}
             variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0 } } }}
           >
             <Typography
               variant="h6"
               component="p"
               sx={{ color: "#a18cd1", fontWeight: 700, textTransform: "uppercase", mb: 2, letterSpacing: 2, textShadow: '0 0 8px #a18cd1' }}
             >
               Voyez la Magie en Action
             </Typography>
           </motion.div>
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={controls}
             variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 } } }}
           >
             <Typography
               variant="h2"
               component="h2"
               sx={{ fontWeight: 900, mb: 3, background: 'linear-gradient(145deg, #a18cd1, #fbc2eb)', WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Exo 2', sans-serif", textShadow: '0 0 20px rgba(161, 140, 209, 0.4)' }}
             >
               L'IA Fine-Tunée en Conversation
             </Typography>
           </motion.div>
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } } }}
          >
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 750, mx: "auto", fontSize: "1.1rem", lineHeight: 1.8, color: alpha(theme.palette.text.secondary, 0.8) }}
            >
              Découvrez comment votre IA personnalisée peut répondre, aider ou même divertir, en adoptant le ton et les connaissances que VOUS lui avez donnés.
            </Typography>
          </motion.div>
         </Box>

         {/* Grille des exemples de chat */}
         <Grid container spacing={4} alignItems="stretch">
           {chatExamples.map((example, index) => (
             <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={controls}
                  variants={{
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        duration: 0.8,
                        delay: 0.3 + index * 0.2,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    },
                  }}
                  style={{ height: '100%' }}
                 >
                   <ChatExample
                    title={example.title}
                    Icon={example.Icon}
                    messages={example.messages}
                    initialDelay={example.initialDelay}
                    accentColor={example.accentColor}
                   />
               </motion.div>
             </Grid>
           ))}
         </Grid>
       </Container>
    </Box>
  );
};

// --- Nouvelle Section: Appel à l'Action Final (CTA) --- //
const FinalCTASection = () => {
  const theme = useTheme();
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 14, md: 22 },
        position: 'relative',
        overflow: 'hidden',
        background: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><path d="M0 0 H100 V100 H0 Z" fill="url(%23gradCTA)"/><defs><radialGradient id="gradCTA" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${encodeURIComponent(alpha('#0a043c', 1))}"/><stop offset="100%" stop-color="${encodeURIComponent(alpha('#03001e', 1))}"/></radialGradient></defs></svg>')`,
        backgroundColor: '#03001e', // Couleur de fallback
      }}
    >
      {/* Effet de "warp speed" ou tunnel lumineux */}
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, perspective: '500px' }}>
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={controls}
            variants={{ visible: { opacity: [0, 1, 0] } }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              delay: Math.random() * 2 + 0.5, // Délais variés
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '2px',
              height: '50%', // Lignes partant du centre
              background: `linear-gradient(to top, transparent, ${i % 3 === 0 ? '#00d4ff' : i % 3 === 1 ? '#bf00ff' : '#ffffff'}, transparent)`,
              transformOrigin: 'top center',
              transform: `translateX(-50%) translateY(-50%) rotate(${i * (360 / 50)}deg) translateZ(${Math.random() * -200 - 50}px) scaleY(2)`,
            }}
          />
        ))}
      </Box>

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] } }
          }}
        >
          <Box
            sx={{
              textAlign: 'center',
              p: { xs: 5, md: 8 },
              borderRadius: '24px',
              position: 'relative',
              background: alpha(theme.palette.background.paper, 0.1),
              backdropFilter: 'blur(15px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              boxShadow: `0 0 60px ${alpha('#00d4ff', 0.2)}, 0 0 80px ${alpha('#bf00ff', 0.1)}, 0 15px 50px ${alpha(theme.palette.common.black, 0.3)}`,
            }}
          >
             <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={controls}
              variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.4 } } }}
            >
                <Typography
                  variant="h6"
                  component="p"
                  sx={{ color: "#00d4ff", fontWeight: 700, textTransform: "uppercase", mb: 2, letterSpacing: 2, textShadow: '0 0 8px #00d4ff' }}
                >
                  Pourquoi c'est si Simple ?
                </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
              variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.5 } } }}
            >
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontWeight: 900,
                  mb: 3,
                  background: 'linear-gradient(145deg, #bf00ff, #00d4ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: "'Exo 2', sans-serif",
                  textShadow: '0 0 20px rgba(191, 0, 255, 0.4)',
                }}
              >
                Nous Gérons la Complexité.
                <br />
                Vous Libérez Votre Créativité.
              </Typography>
            </motion.div>

             <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
              variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.6 } } }}
            >
                <Typography
                  variant="h6"
                  sx={{ mb: 5, maxWidth: 650, mx: 'auto', color: alpha(theme.palette.text.secondary, 0.9), lineHeight: 1.7 }}
                >
                  FinTune orchestre tout : conversion, préparation, entraînement. Vous vous concentrez sur l'essentiel : uploader votre contenu et voir votre IA prendre vie.
                </Typography>
            </motion.div>

             <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={controls}
              variants={{ visible: { opacity: 1, scale: 1, transition: { duration: 0.8, delay: 0.7, type: 'spring', stiffness: 100 } } }}
            >
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="large"
                  startIcon={<RocketLaunchIcon />}
                  sx={{
                    py: 2.5,
                    px: 6,
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    borderRadius: '50px',
                    background: 'linear-gradient(45deg, #bf00ff, #00d4ff)',
                    color: 'white',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: '0 10px 40px rgba(191, 0, 255, 0.5)',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    '&:hover': {
                      transform: 'translateY(-6px) scale(1.05)',
                      boxShadow: '0 18px 50px rgba(0, 212, 255, 0.6)',
                      background: 'linear-gradient(45deg, #00d4ff, #bf00ff)',
                    },
                  }}
                >
                  Créez Votre IA Maintenant
                </Button>
                <Typography variant="caption" sx={{ display: 'block', mt: 2.5, color: alpha(theme.palette.text.secondary, 0.7) }}>
                  Inscription gratuite. Potentiel illimité.
                </Typography>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

// --- Nouvelle Section: Déploiement Partout --- //
const DeploymentSection = () => {
  const theme = useTheme();
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const centerRef = useRef(null);
  
  // Création des refs en dehors des callbacks - correctement au niveau du composant
  const platformRef0 = useRef(null);
  const platformRef1 = useRef(null);
  const platformRef2 = useRef(null);
  const platformRef3 = useRef(null);
  const platformRef4 = useRef(null);
  const platformRef5 = useRef(null);
  const platformRef6 = useRef(null);
  const platformRef7 = useRef(null);
  const platformRef8 = useRef(null);
  const platformRef9 = useRef(null);
  const platformRef10 = useRef(null);
  const platformRef11 = useRef(null);
  const platformRef12 = useRef(null);
  const platformRef13 = useRef(null);
  const platformRef14 = useRef(null);
  const platformRef15 = useRef(null);
  const platformRef16 = useRef(null);
  const platformRef17 = useRef(null);
  
  // Tableau pour faciliter l'accès aux refs
  const platformRefs = [
    platformRef0, platformRef1, platformRef2, platformRef3, platformRef4, 
    platformRef5, platformRef6, platformRef7, platformRef8, platformRef9, 
    platformRef10, platformRef11, platformRef12, platformRef13, platformRef14, 
    platformRef15, platformRef16, platformRef17
  ];

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  // Ajout de nombreuses plateformes organisées par catégories
  const targetPlatforms = [
    // APIs & Web
    { icon: ApiIcon, label: "API REST", color: '#ff9a8b', initialPos: { top: '10%', left: '20%', z: -30 }, delay: 0.5, category: 'API' },
    { icon: WebIcon, label: "Applications Web", color: '#a18cd1', initialPos: { top: '25%', right: '15%', z: -10 }, delay: 0.7, category: 'Web' },
    
    // Automatisation / No-code
    { icon: AutoFixHighIcon, label: "Make (Integromat)", color: '#84fab0', initialPos: { top: '45%', left: '8%', z: -20 }, delay: 0.9, category: 'Automatisation' },
    { icon: ElectricBoltIcon, label: "Zapier", color: '#ff7eb3', initialPos: { bottom: '35%', right: '10%', z: -40 }, delay: 1.1, category: 'Automatisation' },
    { icon: SettingsEthernetIcon, label: "n8n", color: '#5ee7df', initialPos: { top: '5%', right: '30%', z: -15 }, delay: 1.3, category: 'Automatisation' },
    
    // Appareils
    { icon: SmartphoneIcon, label: "Apps Mobiles", color: '#fbc2eb', initialPos: { bottom: '15%', left: '25%', z: -35 }, delay: 1.2, category: 'Appareils' },
    { icon: HomeIcon, label: "Objets Connectés", color: '#adda83', initialPos: { top: '60%', right: '20%', z: -45 }, delay: 1.4, category: 'Appareils' },
    
    // Cloud
    { icon: CloudQueueIcon, label: "Services Cloud", color: '#00d4ff', initialPos: { bottom: '5%', right: '35%', z: -25 }, delay: 1.0, category: 'Cloud' },
    
    // Réseaux sociaux
    { icon: FacebookIcon, label: "Facebook", color: '#1877f2', initialPos: { top: '20%', left: '7%', z: -50 }, delay: 1.5, category: 'Réseaux Sociaux' },
    { icon: TwitterIcon, label: "Twitter", color: '#1da1f2', initialPos: { bottom: '25%', right: '22%', z: -30 }, delay: 1.6, category: 'Réseaux Sociaux' },
    { icon: InstagramIcon, label: "Instagram", color: '#e1306c', initialPos: { top: '15%', right: '8%', z: -40 }, delay: 1.7, category: 'Réseaux Sociaux' },
    { icon: LinkedInIcon, label: "LinkedIn", color: '#0077b5', initialPos: { bottom: '20%', left: '17%', z: -45 }, delay: 1.8, category: 'Réseaux Sociaux' },
    
    // Messageries
    { icon: WhatsAppIcon, label: "WhatsApp", color: '#25d366', initialPos: { top: '35%', left: '15%', z: -15 }, delay: 1.9, category: 'Messageries' },
    { icon: ChatIcon, label: "Slack", color: '#4a154b', initialPos: { top: '50%', right: '12%', z: -35 }, delay: 2.0, category: 'Messageries' },
    { icon: ForumIcon, label: "Discord", color: '#5865f2', initialPos: { bottom: '45%', left: '12%', z: -20 }, delay: 2.1, category: 'Messageries' },
    
    // CRM
    { icon: BusinessCenterIcon, label: "Salesforce", color: '#00a1e0', initialPos: { bottom: '10%', right: '15%', z: -30 }, delay: 2.2, category: 'CRM' },
    { icon: ContactsIcon, label: "HubSpot", color: '#ff7a59', initialPos: { top: '55%', left: '25%', z: -25 }, delay: 2.3, category: 'CRM' },
  ];

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 14, md: 22 },
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${alpha("#0a043c", 1)} 0%, ${alpha("#03001e", 1)} 100%)`, 
      }}
    >
      {/* Effet de "warp speed" ou tunnel lumineux */}
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, perspective: '500px' }}>
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={controls}
            variants={{ visible: { opacity: [0, 1, 0] } }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              delay: Math.random() * 2 + 0.5, // Délais variés
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '2px',
              height: '50%', // Lignes partant du centre
              background: `linear-gradient(to top, transparent, ${i % 3 === 0 ? '#00d4ff' : i % 3 === 1 ? '#bf00ff' : '#ffffff'}, transparent)`,
              transformOrigin: 'top center',
              transform: `translateX(-50%) translateY(-50%) rotate(${i * (360 / 50)}deg) translateZ(${Math.random() * -200 - 50}px) scaleY(2)`,
            }}
          />
        ))}
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Titres */}
        <Box sx={{ mb: 12, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0 } } }}
          >
            <Typography
              variant="h6"
              component="p"
              sx={{ color: "#84fab0", fontWeight: 700, textTransform: "uppercase", mb: 2, letterSpacing: 2, textShadow: '0 0 8px #84fab0' }}
            >
              Intégration Universelle
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 } } }}
          >
            <Typography
              variant="h2"
              component="h2"
              sx={{ fontWeight: 900, mb: 3, background: 'linear-gradient(145deg, #84fab0, #5ee7df)', WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Exo 2', sans-serif", textShadow: '0 0 20px rgba(132, 250, 176, 0.4)' }}
            >
              Déployez Votre IA Partout
            </Typography>
          </motion.div>
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } } }}
          >
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 750, mx: "auto", fontSize: "1.1rem", lineHeight: 1.8, color: alpha(theme.palette.text.secondary, 0.8) }}
            >
              Votre modèle fine-tuné est prêt à s'intégrer avec tous vos outils préférés. De la messagerie aux CRM, des réseaux sociaux à l'automatisation no-code, utilisez-le partout où vous en avez besoin.
            </Typography>
          </motion.div>
        </Box>

        {/* Visualisation du déploiement */}
        <Box sx={{ height: { xs: 500, md: 650 }, position: 'relative', perspective: '1500px' }}>
          {/* Noyau central représentant le modèle IA */}
           <motion.div
                ref={centerRef} // Référence pour les lignes de connexion
                initial={{ opacity: 0, scale: 0.3 }}
                animate={controls}
                variants={{ visible: { opacity: 1, scale: 1, transition: { duration: 1, delay: 0.3, ease: 'backOut' } } }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) translateZ(0px)',
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(191, 0, 255, 0.4) 100%)',
                  boxShadow: `0 0 30px ${alpha('#bf00ff', 0.6)}, 0 0 50px ${alpha('#00d4ff', 0.4)}`,
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <HubIcon sx={{ fontSize: 70, color: '#fff', opacity: 0.8 }} />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    width: '110%',
                    height: '110%',
                    border: '2px dashed rgba(255,255,255,0.2)',
                    borderRadius: '50%'
                  }}
                />
             </motion.div>

             {/* Plateformes cibles flottantes */}
             {targetPlatforms.map((platform, index) => (
               <FloatingIcon
                 key={index}
                 icon={platform.icon}
                 label={platform.label}
                 color={platform.color}
                 initialPos={platform.initialPos}
                 delay={platform.delay}
                 isIALogo={false}
                 ref={platformRefs[index]}
                 aiCenterRef={centerRef}
               />
             ))}

              {/* Lignes de connexion animées depuis le centre */}
             {targetPlatforms.map((platform, index) => {
                if (index < platformRefs.length) {
                  return (
                    <NeonConnectionLine
                      key={`line-${index}`}
                      startRef={centerRef}
                      endRef={platformRefs[index]}
                      color={platform.color}
                      delay={platform.delay + 0.2}
                      thickness={2}
                    />
                  );
                }
                return null;
             })}
             
             {/* Légende des catégories */}
             <Box sx={{ position: 'absolute', bottom: 10, width: '100%', textAlign: 'center', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
               {['API', 'Web', 'Automatisation', 'Appareils', 'Cloud', 'Réseaux Sociaux', 'Messageries', 'CRM'].map((category, index) => (
                 <Chip 
                   key={category}
                   label={category}
                   size="small"
                   sx={{ 
                     background: alpha(theme.palette.primary.main, 0.1), 
                     backdropFilter: 'blur(5px)',
                     border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                     color: 'text.secondary',
                     '& .MuiChip-label': { fontWeight: 500 }
                   }}
                 />
               ))}
             </Box>
        </Box>
      </Container>
    </Box>
  );
};

const LandingPage = () => {
  return (
    <PageTransition>
      <Box sx={{ minHeight: '100vh', background: `linear-gradient(180deg, ${alpha("#0a043c", 1)} 0%, ${alpha("#03001e", 1)} 100%)` }}>
        <Navbar />
        <Hero />
        <IntroductionSection />
        <ProcessSection />
        <ChatExamplesSection />
        <DeploymentSection /> {/* Maintenant placé juste après les chats */}
        <UseCasesSection />
        <AdvantagesSection />
        <FinalCTASection />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default LandingPage; 