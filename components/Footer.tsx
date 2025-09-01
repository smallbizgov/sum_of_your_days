import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  IconButton,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import Logo from './Logo';

const Footer: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'center', md: 'flex-start' }}
            spacing={4}
          >
            <Stack spacing={2} alignItems={{ xs: 'center', md: 'flex-start' }}>
              <Logo size="small" />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 400, textAlign: { xs: 'center', md: 'left' } }}
              >
                A life simulation game that explores the profound impact of choices, 
                relationships, and time on the human experience.
              </Typography>
            </Stack>

            <Stack spacing={3}>
              <Typography variant="h6" color="text.primary">
                Connect
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton
                  href="https://github.com"
                  target="_blank"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <GitHubIcon />
                </IconButton>
                <IconButton
                  href="https://twitter.com"
                  target="_blank"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <TwitterIcon />
                </IconButton>
                <IconButton
                  href="https://linkedin.com"
                  target="_blank"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <LinkedInIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Stack>

          <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.1) }} />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="body2" color="text.secondary">
              © 2024 Sum of Your Days. All rights reserved.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Made with ❤️ for meaningful storytelling
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;