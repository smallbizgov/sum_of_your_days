import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import HourglassFullOutlinedIcon from '@mui/icons-material/HourglassFullOutlined';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  color?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  showText = true, 
  color = 'primary.main' 
}) => {
  const iconSizes = {
    small: 32,
    medium: 48,
    large: 64,
  };

  const textSizes = {
    small: 'h6',
    medium: 'h5',
    large: 'h4',
  };

  return (
    <Stack direction="row" alignItems="center" spacing={showText ? 2 : 0}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: iconSizes[size],
          height: iconSizes[size],
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${color === 'primary.main' ? '#22d3ee' : color} 0%, ${color === 'primary.main' ? '#a855f7' : color} 100%)`,
          boxShadow: '0 8px 32px rgba(34, 211, 238, 0.3)',
        }}
      >
        <HourglassFullOutlinedIcon
          sx={{
            fontSize: iconSizes[size] * 0.6,
            color: 'white',
          }}
        />
      </Box>
      {showText && (
        <Typography
          variant={textSizes[size] as any}
          component="span"
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #22d3ee 0%, #a855f7 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          Sum of Your Days
        </Typography>
      )}
    </Stack>
  );
};

export default Logo;