import React, { useEffect, useRef, useState } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Avatar, Stack, useTheme, alpha, Chip, IconButton, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalculateIcon from '@mui/icons-material/Calculate';

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
        pt: { xs: 4, md: 8 }, // Réduction de l'espace en haut
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
                  <Box component="span" sx={{ color: '#00d4ff' }}> </Box>
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
                  Transformez instantanément vos contenus PDF, YouTube et sites web en assistants IA ultra-performants type <span style={{ color: '#74AA9C', fontWeight: 'bold' }}>ChatGPT</span> ou <span style={{ color: '#D09A74', fontWeight: 'bold' }}>Claude</span>.
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
                      py: { xs: 1.5, sm: 2 },          // un peu moins haut sur mobile
                      px: { xs: 3, sm: 5 },            // moins large
                      fontSize: { xs: '1rem', md:'1.2rem' },
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
                  Premiers pas en 60 secondes. Aucune expertise requise.
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
          width: { xs: 70, sm: isIALogo ? 80 : 60 }, // Plus grand sur mobile
          height: { xs: 70, sm: isIALogo ? 80 : 60 }, // Plus grand sur mobile
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
        <Icon sx={{ fontSize: { xs: isIALogo ? 50 : 35, sm: isIALogo ? 45 : 30 }, color: color }} />
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
const NeonConnectionLine = ({ startRef, endRef, color, delay, thickness = 2, containerRef }) => { // Ajout de containerRef
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState({ x: 0, y: 0 });
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const lineRef = useRef(null);

  useEffect(() => {
    const updatePositions = () => {
      // Utiliser containerRef si disponible, sinon le parent direct comme fallback
      const parentElement = containerRef?.current || startRef.current?.parentElement;
      if (startRef.current && endRef.current && parentElement) {
        const startRect = startRef.current.getBoundingClientRect();
        const endRect = endRef.current.getBoundingClientRect();
        const parentRect = parentElement.getBoundingClientRect();

        // Calculer les centres des éléments par rapport au parent fourni ou trouvé
        setStartPos({
          x: startRect.left - parentRect.left + startRect.width / 2,
          y: startRect.top - parentRect.top + startRect.height / 2,
        });
        setEndPos({
          x: endRect.left - parentRect.left + endRect.width / 2,
          y: endRect.top - parentRect.top + endRect.height / 2,
        });
      } else {
        console.log("Refs not ready:", startRef.current, endRef.current);
      }
    };

    updatePositions();
    // Recalculer si la fenêtre est redimensionnée
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, [startRef, endRef, containerRef]);

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
        py: { xs: 8, md: 12 }, // Réduction du padding
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
                Qu'est-ce que FineTuner ?
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
                  FineTuner est votre passerelle vers une IA véritablement personnalisée. En quelques clics, transformez vos contenus uniques (textes, PDF, vidéos YouTube...) en modèles d'IA surpuissants type ChatGPT ou Claude.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: alpha(theme.palette.text.secondary, 0.8), lineHeight: 1.7 }}
                >
                  Le tout s'opère directement sur <strong style={{ color: theme.palette.primary.light }}>votre propre compte OpenAI ou Anthropic</strong>. Oubliez la configuration manuelle complexe : vous récupérez un modèle fine-tuné, prêt à être intégré et à refléter l'ADN de votre marque ou projet.
                </Typography>
              </Box>
              {/* Ajout du CTA ici */}
              <motion.div variants={itemVariants} style={{ marginTop: theme.spacing(4), textAlign: 'center' }}>
                 <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ /* Styles similaires au bouton Hero */ }}
                  >
                    Essayer FineTuner Gratuitement
                  </Button>
              </motion.div>
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
    <Box id="process-section"
      ref={ref}
      sx={{
        py: { xs: 8, md: 14 }, // Réduction du padding
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
        {/* Ajout du CTA ici */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={controls} 
          variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.8 } } }}
          style={{ marginTop: theme.spacing(6), textAlign: 'center' }}
        >
           <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<RocketLaunchIcon />}
              sx={{
                py: { xs: 1.5, sm: 2 },
                px: { xs: 3, sm: 5 },
                fontSize: { xs: '1rem', md: '1.2rem' },
                borderRadius: '50px',
              }}
            >
              Lancez votre premier projet
            </Button>
        </motion.div>
      </Container>
    </Box>
  );
};

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
        py: { xs: 8, md: 14 }, // Réduction du padding
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
         {/* Ajout du CTA ici */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={controls} 
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.6 } } }}
            style={{ marginTop: theme.spacing(6), textAlign: 'center' }}
         >
           <Button
              component={RouterLink}
              to="/register"
              variant="outlined"
              size="large"
              sx={{
                py: { xs: 1.2, sm: 1.6 },
                px: { xs: 3, sm: 5 },
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                borderRadius: '50px',
              }}
            >
              Voir ce que vous pouvez créer
            </Button>
         </motion.div>
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
        py: { xs: 10, md: 16 }, // Réduction du padding
        position: 'relative',
        overflow: 'hidden',
        background: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><path d="M0 0 H100 V100 H0 Z" fill="url(%23gradCTA)"/><defs><radialGradient id="gradCTA" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${encodeURIComponent(alpha('#0a043c', 1))}"/><stop offset="100%" stop-color="${encodeURIComponent(alpha('#03001e', 1))}"/></radialGradient></defs></svg>')`,
        backgroundColor: '#03001e', // Couleur de fallback
      }}
    >
      {/* Effet de "warp speed" ou tunnel lumineux */}
      {/*
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
      */}

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
                  FineTuner orchestre tout : conversion, préparation, entraînement. Vous vous concentrez sur l'essentiel : uploader votre contenu et voir votre IA prendre vie.
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
                    py: { xs: 1.5, sm: 2 },          // un peu moins haut sur mobile
                    px: { xs: 3, sm: 5 },            // moins large
                    fontSize: { xs: '1rem', md:'1.2rem' },
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
  const gridContainerRef = useRef(null); // Ref pour le conteneur Grid
  
  // --- Simplification --- 
  // Sélection d'icônes représentatives
  const simplifiedPlatforms = [
    { icon: ApiIcon, label: "API REST", color: '#ff9a8b', delay: 0.5 },
    { icon: WebIcon, label: "Web Apps", color: '#a18cd1', delay: 0.7 },
    { icon: SmartphoneIcon, label: "Mobile Apps", color: '#fbc2eb', delay: 0.9 },
    { icon: ElectricBoltIcon, label: "Zapier", color: '#ff7eb3', delay: 1.1 },
    { icon: ChatIcon, label: "Slack", color: '#4a154b', delay: 1.3 },
    { icon: BusinessCenterIcon, label: "CRM", color: '#00a1e0', delay: 1.5 }, 
  ];
  
  // Initialisation individuelle des refs
  const platformRef0 = useRef(null);
  const platformRef1 = useRef(null);
  const platformRef2 = useRef(null);
  const platformRef3 = useRef(null);
  const platformRef4 = useRef(null);
  const platformRef5 = useRef(null);
  const platformRefs = [platformRef0, platformRef1, platformRef2, platformRef3, platformRef4, platformRef5];

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 10, md: 16 }, // Padding déjà réduit
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${alpha("#0a043c", 1)} 0%, ${alpha("#03001e", 1)} 100%)`, 
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Titres (inchangés) */}
        <Box sx={{ mb: 12, textAlign: 'center' }}>
             {/* ... Titres ... */}
             <Typography
              variant="h6"
              component="p"
              sx={{ color: "#84fab0", fontWeight: 700, textTransform: "uppercase", mb: 2, letterSpacing: 2, textShadow: '0 0 8px #84fab0' }}
            >
              Intégration Universelle
            </Typography>
             <Typography
              variant="h2"
              component="h2"
              sx={{ fontWeight: 900, mb: 3, background: 'linear-gradient(145deg, #84fab0, #5ee7df)', WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Exo 2', sans-serif", textShadow: '0 0 20px rgba(132, 250, 176, 0.4)' }}
            >
              Déployez Votre IA Partout
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 750, mx: "auto", fontSize: "1.1rem", lineHeight: 1.8, color: alpha(theme.palette.text.secondary, 0.8) }}
            >
              Votre modèle fine-tuné est prêt à s'intégrer avec vos outils préférés via API.
            </Typography>
        </Box>

        {/* Visualisation Simplifiée */}
        <Grid container spacing={6} alignItems="center" sx={{position: 'relative'}} ref={gridContainerRef}>
          {/* Colonne Gauche: Module Central */}
          <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
              <motion.div
                ref={centerRef}
                initial={{ opacity: 0, scale: 0.3 }}
                animate={controls}
                variants={{ visible: { opacity: 1, scale: 1, transition: { duration: 1, delay: 0.3, ease: 'backOut' } } }}
                style={{
                  position: 'relative', // Rendre relatif pour le flux normal
                  width: 200, // Taille ajustée
                  height: 200,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(191, 0, 255, 0.4) 100%)',
                  boxShadow: `0 0 30px ${alpha('#bf00ff', 0.6)}, 0 0 50px ${alpha('#00d4ff', 0.4)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <HubIcon sx={{ fontSize: 90, color: '#fff', opacity: 0.8 }} />
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
          </Grid>

          {/* Colonne Droite: Icônes Simplifiées */}
          <Grid item xs={12} md={7}>
            <motion.div 
              variants={containerVariants} // Utiliser containerVariants pour stagger
              initial="hidden"
              animate={controls} // Animer avec le reste de la section
            >
              <Grid container spacing={3} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                {simplifiedPlatforms.map((platform, index) => (
                    <Grid item key={platform.label} xs={6} sm={4} md={4}>
                      <motion.div 
                        variants={itemVariants} // Appliquer l'animation item par item
                      >
                        {/* Utiliser une Box simple pour l'icône et le texte */}
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Avatar sx={{ bgcolor: alpha(platform.color, 0.1), color: platform.color, width: 60, height: 60, mb: 1, mx: 'auto' }}>
                            <platform.icon sx={{ fontSize: 30 }} />
                          </Avatar>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            {platform.label}
                          </Typography>
                        </Box>
                       </motion.div>
                    </Grid>
                ))}
              </Grid>
            </motion.div>
          </Grid>
          
          {/* Lignes de connexion - passage de containerRef */}
          {platformRefs.map((platformRef, index) => (
            <NeonConnectionLine
              key={`line-${simplifiedPlatforms[index].label}`}
              startRef={centerRef} 
              endRef={platformRef}
              containerRef={gridContainerRef} // Passage de la ref du conteneur
              color={simplifiedPlatforms[index].color}
              delay={simplifiedPlatforms[index].delay + 0.2}
              thickness={2}
            />
          ))}
        </Grid>
        {/* Ajout du CTA ici */}
        <motion.div 
          variants={itemVariants} 
          initial="hidden" 
          animate={controls}
          style={{ marginTop: theme.spacing(8), textAlign: 'center' }} // Marge un peu plus grande
        >
           <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: { xs: 1.5, sm: 2 },
                px: { xs: 3, sm: 5 },
                fontSize: { xs: '1rem', md: '1.2rem' },
                borderRadius: '50px',
              }}
            >
              Intégrer votre IA partout
            </Button>
        </motion.div>
      </Container>
    </Box>
  );
};

const FAQSection = () => {
  const theme = useTheme();
  const faqs = [
    {
      question: "Qu'est-ce que FineTuner ?",
      answer: "FineTuner est une plateforme SaaS (Software as a Service) conçue pour simplifier radicalement la création d'assistants IA personnalisés. Vous importez vos propres données (documents PDF, transcriptions de vidéos YouTube, pages web, bases de connaissances, etc.) et notre plateforme les transforme en un dataset optimisé. Ensuite, nous gérons le processus complexe de fine-tuning (ré-entraînement spécialisé) sur des modèles de langage de pointe comme ceux d'OpenAI (GPT) ou Anthropic (Claude). Le résultat est une IA qui parle avec votre voix, connaît votre domaine et peut être intégrée via API dans vos applications, sites web, ou outils internes."
    },
    {
      question: "Dois-je avoir un compte OpenAI ou Anthropic ?",
      answer: "Oui, c'est essentiel. FineTuner agit comme un orchestrateur et un facilitateur. Le modèle fine-tuné est entraîné et hébergé directement sur **votre propre compte** OpenAI ou Anthropic. Cela garantit que vous gardez la pleine propriété et le contrôle de votre modèle IA spécialisé. Nous vous guidons pour connecter votre compte de manière sécurisée via vos clés API, et nous nous chargeons de toutes les étapes techniques du fine-tuning sur leur infrastructure."
    },
    {
      question: "Quels types de contenus puis-je importer ?",
      answer: "FineTuner est très flexible. Vous pouvez importer divers formats : fichiers PDF, documents texte (.txt, .md), coller du texte brut, fournir des URL de pages web que nous allons scraper, ou encore des liens vers des vidéos YouTube (nous extrayons automatiquement la transcription). Notre système analyse, nettoie et structure ces informations pour créer le meilleur dataset possible pour l'entraînement de votre IA."
    },
    {
      question: "Comment fonctionne la tarification ?",
      answer: "Notre modèle est basé sur l'utilisation ('Pay-as-you-go') pour une flexibilité maximale. Les 10 000 premiers caractères de contenu que vous nous soumettez pour traitement (conversion, préparation du dataset) sont gratuits. Au-delà de ce quota gratuit, chaque caractère supplémentaire est facturé à 0,000365€ HT. Il n'y a aucun abonnement mensuel fixe ni engagement. Vous ne payez que pour le volume de données que vous traitez réellement, ce qui est idéal pour démarrer ou pour des besoins variables."
    },
    {
      question: "Puis-je intégrer mon IA sur d'autres plateformes ?",
      answer: "Absolument. Une fois votre modèle fine-tuné sur votre compte OpenAI/Anthropic, vous obtenez un identifiant unique pour ce modèle. Vous pouvez ensuite l'appeler via leur API standard. Cela signifie que vous pouvez l'intégrer où vous voulez : chatbots sur votre site web, applications mobiles, systèmes de support client, outils d'automatisation (Zapier, Make), CRM, plateformes d'e-learning, et bien plus encore. FineTuner vous fournit le modèle prêt à l'emploi, l'intégration dépend ensuite de vos outils."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "La sécurité et la confidentialité de vos données sont notre priorité absolue. Vos contenus importés sont utilisés uniquement dans le but de créer votre dataset et de fine-tuner VOTRE modèle, sur VOTRE compte fournisseur (OpenAI/Anthropic). Nous ne revendons jamais vos données et n'utilisons pas vos informations pour entraîner d'autres modèles. Vous conservez la pleine propriété intellectuelle de vos contenus et du modèle fine-tuné résultant."
    },
    {
      question: "Ai-je besoin de compétences techniques ?",
      answer: "Pas du tout ! C'est tout l'intérêt de FineTuner. Nous avons conçu l'interface pour qu'elle soit intuitive et facile à utiliser, même sans aucune connaissance en programmation ou en intelligence artificielle. Vous téléchargez vos contenus, vous cliquez sur quelques boutons pour lancer le processus, et nous nous occupons de toute la complexité technique en arrière-plan. Vous récupérez simplement l'identifiant de votre modèle prêt à être utilisé."
    },
  ];
  return (
    <Box id="faq-section"
      sx={{
        py: { xs: 7, md: 11 }, // Réduction du padding
        background: `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.8)}, ${alpha(theme.palette.background.paper, 0.5)})`,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: theme.palette.primary.main }}>
            FAQ
          </Typography>
          <Typography variant="h6" color={theme.palette.text.secondary}>
            Questions fréquentes sur FineTuner et l'IA personnalisée
          </Typography>
        </Box>
        {faqs.map((faq, idx) => (
          <Accordion 
            key={idx} 
            sx={{
              mb: 2, 
              borderRadius: 3, // Consistent with theme shape
              boxShadow: 'none',
              '&:before': { display: 'none' },
              background: alpha(theme.palette.background.paper, 0.6),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: alpha(theme.palette.primary.main, 0.3),
                background: alpha(theme.palette.background.paper, 0.7),
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`faq-content-${idx}`}
              id={`faq-header-${idx}`}
              sx={{
                fontWeight: 700, 
                fontSize: '1.1rem', 
                color: theme.palette.text.primary,
                // Remove background for glassmorphism
                py: 1, // Add some padding
              }}
            >
              {faq.question}
            </AccordionSummary>
            <AccordionDetails 
              sx={{
                // Remove background, inherit from Accordion
                color: theme.palette.text.secondary, 
                fontSize: '1rem',
                pt: 0, // Adjust padding
                pb: 2,
                px: 2,
              }}
            >
              {faq.answer}
            </AccordionDetails>
          </Accordion>
        ))}
        {/* Ajout du CTA ici */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }} // Animation simple pour le CTA FAQ
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ marginTop: theme.spacing(5), textAlign: 'center' }}
        >
           <Button
              component={RouterLink}
              to="/register"
              variant="outlined"
              size="large"
              startIcon={<RocketLaunchIcon />}
              sx={{
                py: { xs: 1.2, sm: 1.6 },
                px: { xs: 3, sm: 5 },
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                borderRadius: '50px',
              }}
            >
              Prêt à commencer ?
            </Button>
        </motion.div>
      </Container>
    </Box>
  );
};

const LandingPage = () => {
  const theme = useTheme();
  return (
    <PageTransition>
      <Box sx={{ minHeight: '100vh', background: `linear-gradient(180deg, ${alpha("#0a043c", 1)} 0%, ${alpha("#03001e", 1)} 100%)` }}>
        <Navbar />
        <Hero />
        {/* Section vidéo de présentation */}
        <Box sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'transparent',
          py: { xs: 2, md: 4 },
        }}>
          <Box sx={{
            width: '100%',
            maxWidth: 900,
            boxShadow: 3,
            borderRadius: 4,
            overflow: 'hidden',
            background: 'rgba(0,0,0,0.04)',
          }}>
            <video
              src="/assets/videos/presentation_landing.webm"
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: 'inherit',
                background: '#000',
              }}
            />
          </Box>
        </Box>
        <IntroductionSection />
        <ProcessSection />
        <ChatExamplesSection />
        <DeploymentSection /> 
        <FAQSection />
        <FinalCTASection />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default LandingPage; 