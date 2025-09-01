import React from 'react';
import ModernFrontend from './components/ModernFrontend';

const AppMockup: React.FC = () => {
  const handleStartGame = () => {
    alert('Game would start here! This is a mockup of the modern frontend.');
  };

  const handleShowInfo = () => {
    alert('Info modal would open here! This showcases the modern UI design.');
  };

  return (
    <ModernFrontend 
      onStartGame={handleStartGame}
      onShowInfo={handleShowInfo}
    />
  );
};

export default AppMockup;