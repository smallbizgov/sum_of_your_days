import React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Stack,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import Logo from './Logo';

interface HeaderProps {
  onStartGame?: () => void;
  onShowInfo?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onStartGame, onShowInfo }) => {
  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        <Logo size="small" />
        
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="text"
            color="inherit"
            startIcon={<InfoOutlinedIcon />}
            onClick={onShowInfo}
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              }
            }}
          >
            About
          </Button>
          
          <IconButton
            color="inherit"
            href="https://github.com"
            target="_blank"
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              }
            }}
          >
            <GitHubIcon />
          </IconButton>
          
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={onStartGame}
            sx={{
              background: 'linear-gradient(135deg, #22d3ee 0%, #a855f7 100%)',
              boxShadow: '0 4px 20px rgba(34, 211, 238, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 25px rgba(34, 211, 238, 0.6)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Start Game
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;