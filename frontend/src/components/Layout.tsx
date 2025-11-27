import type { ReactNode } from 'react';
import { AppBar, Box, Container, Toolbar, Typography, Button, Stack } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🎯' },
    { path: '/providers', label: 'Providers', icon: '⚡' },
    { path: '/server', label: 'Server', icon: '📊' },
    { path: '/history', label: 'History', icon: '📜' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 3,
      }}
    >
      <Container maxWidth="xl">
        <AppBar position="static" sx={{ borderRadius: 2, mb: 3 }}>
          <Toolbar sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: '1.5rem',
                mr: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              🎯 Tingly Box Dashboard
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                flexWrap: 'wrap',
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    color: isActive(item.path) ? 'white' : 'primary.main',
                    backgroundColor: isActive(item.path) ? 'primary.main' : 'transparent',
                    '&:hover': {
                      backgroundColor: isActive(item.path) ? 'primary.dark' : 'action.hover',
                    },
                  }}
                >
                  {item.icon} {item.label}
                </Button>
              ))}
            </Stack>
          </Toolbar>
        </AppBar>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
