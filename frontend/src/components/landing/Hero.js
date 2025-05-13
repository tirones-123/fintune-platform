import React from 'react';
import { Box, Button, Container, Grid, Typography, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { keyframes } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// Animation de flottement
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

// Animation de pulse
const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

// Composant de particule décorative
const Particle = ({ size, top, left, delay, color }) => (
  <Box
    sx={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: color,
      top: top,
      left: left,
      opacity: 0.6,
      animation: `${pulse} 3s infinite ease-in-out`,
      animationDelay: delay,
      filter: 'blur(8px)',
    }}
  />
);

// Composant de cercle décoratif
const Circle = ({ size, top, left, borderColor, delay }) => (
  <Box
    sx={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      border: `2px solid ${borderColor}`,
      top: top,
      left: left,
      opacity: 0.3,
      animation: `${float} 6s infinite ease-in-out`,
      animationDelay: delay,
    }}
  />
);

const Hero = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        pt: { xs: 10, md: 12 },
        pb: { xs: 1, md: 3 },
      }}
    >
      {/* Éléments décoratifs */}
      <Particle size={80} top="15%" left="10%" delay="0s" color={theme.palette.primary.main} />
      <Particle size={120} top="60%" left="5%" delay="1s" color={theme.palette.secondary.main} />
      <Particle size={60} top="80%" left="30%" delay="0.5s" color={theme.palette.accent.main} />
      <Particle size={100} top="10%" left="85%" delay="1.5s" color={theme.palette.primary.light} />
      <Particle size={70} top="50%" left="80%" delay="0.7s" color={theme.palette.secondary.light} />
      
      <Circle size={200} top="-100px" left="-100px" borderColor={theme.palette.primary.main} delay="0s" />
      <Circle size={300} top="60%" left="85%" borderColor={theme.palette.secondary.main} delay="1s" />
      <Circle size={150} top="30%" left="70%" borderColor={theme.palette.accent.main} delay="0.5s" />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={8} alignItems="center" sx={{ position: 'relative' }}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5 }}
            >
              <motion.div variants={{
                hidden: { opacity: 0, scale: 0.5 },
                visible: { opacity: 1, scale: 1 },
              }}>
                <Typography
                  component="h1"
                  variant="h2"
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', md: '3.75rem' },
                    lineHeight: 1.1,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.accent.main} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2,
                  }}
                >
                  {t('landing.hero.titleLine1')}
                  <br />
                  {t('landing.hero.titleLine2')}
                  <Box component="span" sx={{ color: '#00d4ff' }}> </Box>
                </Typography>
              </motion.div>

              <motion.div variants={{
                hidden: { opacity: 0, scale: 0.5 },
                visible: { opacity: 1, scale: 1 },
              }} style={{ marginBottom: '32px' }}>
                <Typography
                  variant="h5"
                  color="text.secondary"
                  paragraph
                  sx={{ 
                    mb: 4,
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    lineHeight: 1.6,
                    maxWidth: '90%'
                  }}
                >
                  {t('landing.hero.subtitle.part1')}
                  <span style={{ color: '#74AA9C', fontWeight: 'bold' }}>ChatGPT</span>
                  {t('landing.hero.subtitle.part2')}
                  <span style={{ color: '#D09A74', fontWeight: 'bold' }}>Claude</span>
                  {t('landing.hero.subtitle.part3')}
                </Typography>
              </motion.div>

              <motion.div variants={{
                hidden: { opacity: 0, scale: 0.5 },
                visible: { opacity: 1, scale: 1 },
              }}>
                <Stack spacing={2} direction="row" sx={{ mt: 5, display: 'flex', gap: 3, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="large"
                    sx={{ 
                      minWidth: 200, 
                      py: 1.8,
                      px: 4,
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 24px rgba(59, 130, 246, 0.4)',
                      }
                    }}
                    aria-label={t('landing.hero.ctaAriaLabel')}
                  >
                    {t('landing.hero.ctaButton')}
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    size="large"
                    sx={{ 
                      minWidth: 180, 
                      py: 1.8,
                      borderWidth: 2,
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}
                  >
                    Se connecter
                  </Button>
                </Stack>
              </motion.div>
              
              <motion.div variants={{
                hidden: { opacity: 0, scale: 0.5 },
                visible: { opacity: 1, scale: 1 },
              }} sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {[...Array(3)].map((_, i) => (
                    <Box
                      key={i}
                      component="img"
                      src={`/static/images/avatar-${i + 1}.jpg`}
                      alt={`User ${i + 1}`}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: '2px solid white',
                        ml: i > 0 ? -1.5 : 0,
                      }}
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Rejoint par <b>1,200+</b> utilisateurs ce mois-ci
                </Typography>
              </motion.div>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
                animation: `${float} 6s infinite ease-in-out`,
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    width: '80%',
                    height: '80%',
                    borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                    background: `linear-gradient(135deg, ${theme.palette.primary.lighter} 0%, ${theme.palette.primary.light} 100%)`,
                    filter: 'blur(40px)',
                    opacity: 0.6,
                    zIndex: -1,
                  }
                }}
              >
                <Box
                  component="img"
                  src="/static/images/hero-illustration.svg"
                  alt="FineTuner Platform Illustration"
                  sx={{
                    width: '100%',
                    maxWidth: 550,
                    height: 'auto',
                    borderRadius: 4,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(20px)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
                    }
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero; 