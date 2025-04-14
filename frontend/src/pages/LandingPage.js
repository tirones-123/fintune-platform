import React, { useEffect, useRef, useState } from 'react';
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

// --- Section How It Works (Refonte Futuriste) --- //
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
      icon: <CloudUploadIcon sx={{ fontSize: 50 }} />,
      title: "1. Upload",
      description: "Connectez vos sources : PDF, YouTube, Sites Web, Texte...",
      gradient: "linear-gradient(135deg, #FF9A8B 0%, #FF6A88 100%)", // Rose/Orange
      delay: 0.2,
    },
    {
      icon: <SyncAltIcon sx={{ fontSize: 50 }} />,
      title: "2. Transformation IA",
      description: "Notre moteur IA traite et structure vos données en format optimal.",
      gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)", // Mauve/Rose pâle
      delay: 0.4,
    },
    {
      icon: <PsychologyIcon sx={{ fontSize: 50 }} />,
      title: "3. Fine-Tuning",
      description: "Entraînement sur mesure via OpenAI ou Anthropic.",
      gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)", // Vert/Bleu pâle
      delay: 0.6,
    },
    {
      icon: <ChatIcon sx={{ fontSize: 50 }} />,
      title: "4. Déploiement",
      description: "Votre assistant IA est prêt : utilisez-le ou intégrez-le via API.",
      gradient: "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)", // Cyan/Lavande
      delay: 0.8,
    },
  ];

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 12, md: 20 },
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(rgba(3, 0, 30, 0.95), rgba(3, 0, 30, 0.95)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%2300d4ff;stop-opacity:0.1" /><stop offset="100%" style="stop-color:%23bf00ff;stop-opacity:0.1" /></linearGradient></defs><rect width="100" height="100" fill="url(%23g)"/><path d="M0 50 L50 0 L100 50 L50 100 Z" fill="rgba(255,255,255,0.02)"/></svg>')`,
        backgroundSize: 'auto, 200px 200px', // Motif + dégradé
      }}
    >
      {/* Ligne de connexion verticale animée (décorative) */}
      <motion.div
        initial={{ height: 0 }}
        animate={inView ? { height: '80%' } : { height: 0 }}
        transition={{ duration: 2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          width: '2px',
          background: 'linear-gradient(to bottom, transparent, #00d4ff, #bf00ff, transparent)',
          boxShadow: '0 0 10px #00d4ff, 0 0 10px #bf00ff',
          zIndex: 1,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        <Box sx={{ mb: 12, textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
          >
            <Typography
              variant="h6"
              component="p"
              sx={{
                color: "#00d4ff", // Cyan néon
                fontWeight: 700,
                textTransform: "uppercase",
                mb: 2,
                letterSpacing: 2,
                textShadow: '0 0 10px #00d4ff',
              }}
            >
              Processus Simplifié
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
              sx={{
                fontWeight: 900,
                mb: 3,
                background: 'linear-gradient(145deg, #bf00ff, #00d4ff)',
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Exo 2', sans-serif",
                textShadow: '0 0 20px rgba(191, 0, 255, 0.4)',
              }}
            >
              De Zéro à l'IA en 4 Étapes
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
              sx={{
                maxWidth: 700,
                mx: "auto",
                fontSize: "1.1rem",
                lineHeight: 1.8,
                color: alpha(theme.palette.text.secondary, 0.8),
              }}
            >
              Suivez notre flux de travail optimisé pour transformer vos données brutes en une intelligence artificielle sur-mesure, prête à révolutionner votre business.
            </Typography>
          </motion.div>
        </Box>

        <Grid container spacing={5} justifyContent="center">
          {steps.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={controls}
                variants={{
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      duration: 0.8,
                      delay: step.delay + 0.2,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  },
                }}
                whileHover={{ y: -10, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 4,
                    borderRadius: '24px', // Bords plus arrondis
                    position: "relative",
                    overflow: "visible", // Permet aux éléments de déborder légèrement
                    background: alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: "blur(15px)",
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.4)}`,
                    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-10px',
                      left: '-10px',
                      right: '-10px',
                      bottom: '-10px',
                      borderRadius: 'inherit',
                      border: `2px solid transparent`,
                      backgroundImage: `linear-gradient(${alpha(theme.palette.background.paper, 0)}, ${alpha(theme.palette.background.paper, 0)}), ${step.gradient}`,
                      backgroundOrigin: 'border-box',
                      backgroundClip: 'content-box, border-box',
                      zIndex: -1,
                      opacity: 0.6,
                      filter: 'blur(8px)',
                      transition: 'opacity 0.4s ease',
                    },
                    '&:hover::before': {
                      opacity: 1,
                    },
                  }}
                >
                  {/* Icone stylisée */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={controls}
                    variants={{
                       visible: { scale: 1, transition: { delay: step.delay + 0.4, type: 'spring', stiffness: 150 } }
                    }}
                  >
                    <Box
                      sx={{
                        width: 90,
                        height: 90,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                        background: step.gradient,
                        color: "white",
                        boxShadow: `0 0 25px ${alpha(theme.palette.common.black, 0.5)}, 0 0 15px ${alpha(step.gradient.split(' ')[2].split(',')[0], 0.7)} inset`,
                        border: '3px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      {step.icon}
                    </Box>
                  </motion.div>

                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      mb: 1.5,
                      fontWeight: 700,
                      color: 'text.primary',
                    }}
                  >
                    {step.title}
                  </Typography>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ flexGrow: 1, color: alpha(theme.palette.text.secondary, 0.8) }}
                  >
                    {step.description}
                  </Typography>

                   {/* Indicateur de progression (décoratif) */}
                   <Box sx={{ width: '60%', height: '4px', background: alpha(step.gradient.split(' ')[2].split(',')[0], 0.3), borderRadius: '2px', mt: 3, position: 'relative', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={controls}
                        variants={{
                          visible: { width: '100%', transition: { delay: step.delay + 0.6, duration: 1 } }
                        }}
                        style={{ height: '100%', background: step.gradient, position: 'absolute', top: 0, left: 0 }}
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

// --- Section Avantages (Refonte Futuriste) --- //
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
      icon: <ScienceIcon sx={{ fontSize: 35 }} />,
      title: "Simplicité Radicale",
      description: "Interface drag-and-drop. Zéro ligne de code. Focalisez sur votre contenu, pas la technique.",
      color: "#00d4ff", // Cyan
    },
    {
      icon: <DatasetIcon sx={{ fontSize: 35 }}/>,
      title: "Qualité de Données Pro",
      description: "Génération automatique de datasets Q/R optimisés pour une performance IA maximale.",
      color: "#a18cd1", // Mauve
    },
    {
      icon: <SmartToyIcon sx={{ fontSize: 35 }}/>,
      title: "Modèles IA de Pointe",
      description: "Accès direct aux dernières versions OpenAI et Anthropic (Claude).",
      color: "#fbc2eb", // Rose pâle
    },
    {
      icon: <CloudUploadIcon sx={{ fontSize: 35 }}/>,
      title: "Polyvalence Totale",
      description: "PDF, YouTube, Sites Web, Texte... Importez n'importe quel format sans effort.",
      color: "#84fab0", // Vert pâle
    },
    {
      icon: <ChatIcon sx={{ fontSize: 35 }}/>,
      title: "Test & Intégration Faciles",
      description: "Validez votre IA via chat intégré ou déployez-la via notre API robuste.",
      color: "#ff9a8b", // Orange/Rose
    },
    {
      icon: <CheckCircleIcon sx={{ fontSize: 35 }}/>,
      title: "Sécurité & Confidentialité",
      description: "Vos données restent vôtres. Chiffrement et conformité RGPD garantis.",
      color: "#5ee7df", // Turquoise
    },
  ];

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 12, md: 20 },
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(rgba(3, 0, 30, 0.97), rgba(3, 0, 30, 0.97)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><path d="M50 0 L100 50 L50 100 L0 50 Z" fill="rgba(255, 255, 255, 0.01)"/></svg>')`,
        backgroundSize: 'auto, 150px 150px',
      }}
    >
       {/* Vagues lumineuses animées */}
       <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 }}>
          <motion.svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 1440 800" 
            preserveAspectRatio="xMidYMid slice"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={alpha('#00d4ff', 0.3)} />
                <stop offset="100%" stopColor={alpha('#bf00ff', 0.3)} />
              </linearGradient>
              <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={alpha('#bf00ff', 0.2)} />
                <stop offset="100%" stopColor={alpha('#00d4ff', 0.2)} />
              </linearGradient>
            </defs>
            <motion.path 
              fill="none" 
              stroke="url(#waveGradient1)"
              strokeWidth="2"
              initial={{ pathLength: 0, pathOffset: 1 }}
              animate={{ pathLength: 1, pathOffset: 0 }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              d="M0,400 Q360,300 720,400 T1440,400"
              style={{ filter: 'blur(2px)' }}
            />
            <motion.path 
              fill="none" 
              stroke="url(#waveGradient2)"
              strokeWidth="3"
              initial={{ pathLength: 0, pathOffset: 1 }}
              animate={{ pathLength: 1, pathOffset: 0 }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.5 }}
              d="M0,450 Q360,550 720,450 T1440,450"
              style={{ filter: 'blur(3px)' }}
            />
          </motion.svg>
       </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ mb: 12, textAlign: 'center' }}>
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
          >
            <Typography
              variant="h6"
              component="p"
              sx={{
                color: "#bf00ff", // Violet néon
                fontWeight: 700,
                textTransform: "uppercase",
                mb: 2,
                letterSpacing: 2,
                textShadow: '0 0 10px #bf00ff',
              }}
            >
              Votre Avantage Compétitif
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
              sx={{
                fontWeight: 900,
                mb: 3,
                background: 'linear-gradient(145deg, #00d4ff, #bf00ff)',
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Exo 2', sans-serif",
                textShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
              }}
            >
              Pourquoi FinTune Domine
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
              sx={{
                maxWidth: 700,
                mx: 'auto',
                fontSize: '1.1rem',
                lineHeight: 1.8,
                color: alpha(theme.palette.text.secondary, 0.8),
              }}
            >
              Allez au-delà des chatbots génériques. Créez une IA qui connaît VRAIMENT votre métier, vos produits, vos clients.
            </Typography>
           </motion.div>
        </Box>

        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={controls}
                variants={{
                  visible: {
                    opacity: 1,
                    scale: 1,
                    transition: {
                      duration: 0.8,
                      delay: 0.2 + index * 0.1,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  },
                }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                transition={{ type: "spring", stiffness: 250 }}
                style={{ height: '100%' }}
              >
                <Card
                  sx={{
                    height: '100%',
                    p: 3.5,
                    borderRadius: '20px',
                    position: 'relative',
                    overflow: 'hidden',
                    background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.7)}, ${alpha(theme.palette.background.paper, 0.5)})`,
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${alpha(benefit.color, 0.3)}`,
                    boxShadow: `0 8px 30px ${alpha(theme.palette.common.black, 0.2)}`,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                      borderColor: alpha(benefit.color, 0.8),
                      boxShadow: `0 0 25px ${alpha(benefit.color, 0.4)}, 0 12px 40px ${alpha(theme.palette.common.black, 0.3)}`,
                    }
                  }}
                >
                  {/* Icone néon */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(benefit.color, 0.15),
                        color: benefit.color,
                        width: 52,
                        height: 52,
                        mr: 2,
                        boxShadow: `0 0 15px ${alpha(benefit.color, 0.5)}`,
                      }}
                    >
                      {benefit.icon}
                    </Avatar>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                      }}
                    >
                      {benefit.title}
                    </Typography>
                  </Box>

                  <Typography variant="body1" sx={{ color: alpha(theme.palette.text.secondary, 0.9), flexGrow: 1 }}>
                    {benefit.description}
                  </Typography>

                  {/* Ligne décorative */}
                  <Box sx={{ height: '2px', background: `linear-gradient(90deg, ${alpha(benefit.color, 0.5)}, transparent)`, mt: 2.5, width: '70%' }} />
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// --- Section CTA (Refonte Futuriste) --- //
const CTA = () => {
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
        py: { xs: 10, md: 16 },
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(to bottom, ${alpha("#03001e", 1)}, ${alpha("#0a043c", 1)})`,
      }}
    >
       {/* Effet de grille laser animée */}
       <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 }}>
         <motion.div 
            style={{ position: 'absolute', inset: 0 }}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear'
            }}
          > 
            <Box sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(to right, ${alpha('#00d4ff', 0.1)} 1px, transparent 1px),
                linear-gradient(to bottom, ${alpha('#00d4ff', 0.1)} 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              maskImage: 'radial-gradient(ellipse at center, white 30%, transparent 70%)',
            }} />
            <Box sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(to right, ${alpha('#bf00ff', 0.1)} 1px, transparent 1px),
                linear-gradient(to bottom, ${alpha('#bf00ff', 0.1)} 1px, transparent 1px)
              `,
              backgroundSize: '70px 70px',
              maskImage: 'radial-gradient(ellipse at center, white 40%, transparent 80%)',
              animation: 'grid-pan 15s linear infinite reverse' // Animation CSS pour le déplacement
            }} />
         </motion.div>
       </Box>

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
          }}
        >
          <Box
            sx={{
              textAlign: 'center',
              p: { xs: 5, md: 8 },
              borderRadius: '24px',
              position: 'relative',
              background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.6)})`,
              backdropFilter: 'blur(15px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              boxShadow: `0 15px 50px ${alpha(theme.palette.common.black, 0.3)}`,
            }}
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
                textShadow: '0 0 15px rgba(191, 0, 255, 0.4)',
              }}
            >
              Prêt à Augmenter Votre Potentiel IA ?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 5,
                maxWidth: 600,
                mx: 'auto',
                color: alpha(theme.palette.text.secondary, 0.9),
                lineHeight: 1.7,
              }}
            >
              Rejoignez la révolution du fine-tuning. Créez votre premier assistant IA personnalisé en quelques minutes.
            </Typography>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 2.5,
                px: 6,
                fontSize: '1.3rem',
                fontWeight: 700,
                borderRadius: '50px',
                background: 'linear-gradient(45deg, #bf00ff, #00d4ff)',
                color: 'white',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 10px 30px rgba(191, 0, 255, 0.4)',
                transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                '&:hover': {
                  transform: 'translateY(-5px) scale(1.05)',
                  boxShadow: '0 15px 35px rgba(0, 212, 255, 0.5)',
                  background: 'linear-gradient(45deg, #00d4ff, #bf00ff)',
                },
              }}
            >
              Lancez Votre Projet IA
            </Button>
             <Typography variant="caption" sx={{ display: 'block', mt: 2.5, color: alpha(theme.palette.text.secondary, 0.7) }}>
               Essai gratuit disponible. Libérez la puissance de vos données.
             </Typography>
          </Box>
        </motion.div>
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
        <HowItWorks />
        <Benefits />
        <CTA />
        <Footer />
      </Box>
    </PageTransition>
  );
};

export default LandingPage; 