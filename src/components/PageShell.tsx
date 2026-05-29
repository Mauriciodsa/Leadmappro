import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

type PageShellProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
};

export default function PageShell({ title, subtitle, icon, action, children }: PageShellProps) {
  return (
    <Box className="page-enter" sx={{ minHeight: '100%', p: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {icon && (
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '8px',
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
                background: 'rgba(0, 127, 115, 0.1)',
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Typography variant="h4" sx={{ fontSize: { xs: 28, md: 34 }, lineHeight: 1.1 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.75, maxWidth: 720 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {action}
      </Box>
      {children}
    </Box>
  );
}
