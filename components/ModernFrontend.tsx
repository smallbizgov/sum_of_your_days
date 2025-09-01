import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Box } from '@mui/material';
import theme from '../theme';
import Header from './Header';
import HeroSection from './HeroSection';
import Footer from './Footer';

interface ModernFrontendProps {
  onStartGame?: () => void;
  onShowInfo?: () => void;
}

const ModernFrontend: React.FC<ModernFrontendProps> = ({ 
  onStartGame, 
  onShowInfo 
}) => {
  const handleStartGame = () => {
    console.log('Starting game...');
    if (onStartGame) {
      onStartGame();
    }
  };

  const handleShowInfo = () => {
    console.log('Showing info...');
    if (onShowInfo) {
      onShowInfo();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header onStartGame={handleStartGame} onShowInfo={handleShowInfo} />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <HeroSection onStartGame={handleStartGame} />
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default ModernFrontend;