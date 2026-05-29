import { Box, Typography } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';

type LogoProps = {
  size?: 'small' | 'large';
  light?: boolean;
};

export default function Logo({ size = 'small', light = false }: LogoProps) {
  const isLarge = size === 'large';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: isLarge ? 1.5 : 1 }}>
      <Box
        sx={{
          width: isLarge ? 58 : 38,
          height: isLarge ? 58 : 38,
          borderRadius: '8px',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          background: 'linear-gradient(135deg, #007f73 0%, #2f5f98 100%)',
          boxShadow: '0 14px 28px rgba(0, 127, 115, 0.25)',
        }}
      >
        <MapIcon sx={{ fontSize: isLarge ? 34 : 22 }} />
      </Box>
      <Box>
        <Typography
          variant={isLarge ? 'h5' : 'subtitle1'}
          sx={{ color: light ? '#fff' : 'text.primary', fontWeight: 900, lineHeight: 1 }}
        >
          LeadMap Pro
        </Typography>
        {isLarge && (
          <Typography variant="body2" sx={{ color: light ? 'rgba(255,255,255,0.78)' : 'text.secondary', mt: 0.5 }}>
            CRM comercial com mapas e atendimento
          </Typography>
        )}
      </Box>
    </Box>
  );
}
