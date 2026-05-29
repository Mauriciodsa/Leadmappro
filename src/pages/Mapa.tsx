import { Box, Button, Paper, Typography } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import PlaceIcon from '@mui/icons-material/Place';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { readClientes } from '../services/localStore';

export default function Mapa() {
  const navigate = useNavigate();
  const clientes = readClientes();

  return (
    <PageShell
      title="Mapa"
      subtitle="Use o cadastro completo de clientes para organizar regiões, visitas e coordenadas."
      icon={<MapIcon />}
      action={
        <Button variant="contained" onClick={() => navigate('/clientes')}>
          Cadastrar cliente
        </Button>
      }
    >
      <Paper
        elevation={0}
        sx={{
          minHeight: 560,
          borderRadius: '8px',
          border: '1px solid rgba(24, 33, 47, 0.08)',
          overflow: 'hidden',
          background:
            'linear-gradient(90deg, rgba(47,95,152,0.1) 1px, transparent 1px), linear-gradient(0deg, rgba(47,95,152,0.1) 1px, transparent 1px), #f8fafc',
          backgroundSize: '42px 42px',
          position: 'relative',
        }}
      >
        {(clientes.length ? clientes.slice(0, 8) : [{ id: 'demo', nome: 'Cliente demonstrativo', cidade: 'Sua cidade', estado: 'UF' }]).map((cliente, index) => {
          const top = `${22 + (index % 4) * 15}%`;
          const left = `${24 + (index % 3) * 24}%`;
          return (
            <Box key={cliente.id} sx={{ position: 'absolute', top, left, transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <PlaceIcon sx={{ color: 'primary.main', fontSize: 38, filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.18))' }} />
              <Typography variant="caption" sx={{ display: 'block', px: 1, py: 0.5, borderRadius: '8px', background: '#fff', fontWeight: 800 }}>
                {cliente.nome}
              </Typography>
            </Box>
          );
        })}
        <Box sx={{ position: 'absolute', left: 24, bottom: 24, p: 2, maxWidth: 420, borderRadius: '8px', background: '#fff' }}>
          <Typography sx={{ fontWeight: 900 }}>Base para mapa real</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            O cadastro de clientes agora possui endereço, cidade, estado, CEP, latitude e longitude para futura integração com Google Maps.
          </Typography>
        </Box>
      </Paper>
    </PageShell>
  );
}
