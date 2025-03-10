import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Pricing from '../components/landing/Pricing';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
  return (
    <Box>
      <Navbar />
      <Hero />
      <Box id="features">
        <Features />
      </Box>
      <Box id="pricing">
        <Pricing />
      </Box>
      <Footer />
    </Box>
  );
};

export default LandingPage; 