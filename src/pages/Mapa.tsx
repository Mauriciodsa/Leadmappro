import { useState } from 'react';
import { Box, Button, Chip, IconButton, Paper, Typography } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import PlaceIcon from '@mui/icons-material/Place';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { type ClienteLocal, readClientes } from '../services/localStore';

const tileSize = 256;
const defaultCenter = { lat: -23.55052, lng: -46.633308 };
const minZoom = 5;
const maxZoom = 18;

function parseCoordinate(value: string) {
  const parsed = Number(String(value || '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function lngToTileX(lng: number, zoom: number) {
  return ((lng + 180) / 360) * 2 ** zoom;
}

function latToTileY(lat: number, zoom: number) {
  const latRad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 2 ** zoom;
}

function clampLat(lat: number) {
  return Math.max(-85, Math.min(85, lat));
}

type MappedCliente = ClienteLocal & {
  lat: number;
  lng: number;
};

function isMappedCliente(cliente: MappedCliente | null): cliente is MappedCliente {
  return cliente !== null;
}

export default function Mapa() {
  const navigate = useNavigate();
  const clientes = readClientes();

  const mappedClientes = clientes
    .map((cliente) => {
      const lat = parseCoordinate(cliente.latitude);
      const lng = parseCoordinate(cliente.longitude);
      return lat === null || lng === null ? null : { ...cliente, lat: clampLat(lat), lng };
    })
    .filter(isMappedCliente);

  const center = mappedClientes.length
    ? {
        lat: mappedClientes.reduce((sum, cliente) => sum + cliente.lat, 0) / mappedClientes.length,
        lng: mappedClientes.reduce((sum, cliente) => sum + cliente.lng, 0) / mappedClientes.length,
      }
    : defaultCenter;

  const initialZoom = mappedClientes.length > 1 ? 11 : 13;
  const [zoom, setZoom] = useState(initialZoom);
  const centerTileX = lngToTileX(center.lng, zoom);
  const centerTileY = latToTileY(center.lat, zoom);
  const tileStartX = Math.floor(centerTileX) - 2;
  const tileStartY = Math.floor(centerTileY) - 2;
  const offsetX = (centerTileX - Math.floor(centerTileX)) * tileSize;
  const offsetY = (centerTileY - Math.floor(centerTileY)) * tileSize;

  const missingCoordinates = clientes.filter((cliente) => !cliente.latitude || !cliente.longitude);

  function changeZoom(direction: 1 | -1) {
    setZoom((currentZoom) => Math.max(minZoom, Math.min(maxZoom, currentZoom + direction)));
  }

  function resetZoom() {
    setZoom(initialZoom);
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    changeZoom(event.deltaY < 0 ? 1 : -1);
  }

  return (
    <PageShell
      title="Mapa"
      subtitle="Visualize clientes cadastrados em um mapa real usando latitude e longitude."
      icon={<MapIcon />}
      action={
        <Button variant="contained" onClick={() => navigate('/clientes')}>
          Cadastrar cliente
        </Button>
      }
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 340px' }, gap: 2.5 }}>
        <Paper
          elevation={0}
          sx={{
            minHeight: { xs: 520, md: 680 },
            borderRadius: '8px',
            border: '1px solid rgba(24, 33, 47, 0.08)',
            overflow: 'hidden',
            background: '#dbe7ee',
            position: 'relative',
          }}
          onWheel={handleWheel}
        >
          <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            {Array.from({ length: 5 }).map((_row, rowIndex) =>
              Array.from({ length: 5 }).map((_col, colIndex) => {
                const x = tileStartX + colIndex;
                const y = tileStartY + rowIndex;
                return (
                  <Box
                    component="img"
                    key={`${x}-${y}`}
                    src={`https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`}
                    alt=""
                    sx={{
                      position: 'absolute',
                      width: tileSize,
                      height: tileSize,
                      left: `calc(50% + ${(colIndex - 2) * tileSize - offsetX}px)`,
                      top: `calc(50% + ${(rowIndex - 2) * tileSize - offsetY}px)`,
                    }}
                  />
                );
              }),
            )}
          </Box>

          {mappedClientes.map((cliente) => {
            const pointX = (lngToTileX(cliente.lng, zoom) - centerTileX) * tileSize;
            const pointY = (latToTileY(cliente.lat, zoom) - centerTileY) * tileSize;
            return (
              <Box
                key={cliente.id}
                sx={{
                  position: 'absolute',
                  left: `calc(50% + ${pointX}px)`,
                  top: `calc(50% + ${pointY}px)`,
                  transform: 'translate(-50%, -100%)',
                  textAlign: 'center',
                  zIndex: 2,
                }}
              >
                <PlaceIcon sx={{ color: 'error.main', fontSize: 42, filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.26))' }} />
                <Box sx={{ mt: -0.5, px: 1, py: 0.5, borderRadius: '8px', background: '#fff', minWidth: 120, boxShadow: '0 8px 18px rgba(0,0,0,0.16)' }}>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 900 }}>
                    {cliente.nome}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                    {[cliente.cidade, cliente.estado].filter(Boolean).join('/')}
                  </Typography>
                </Box>
              </Box>
            );
          })}

          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 4,
              display: 'grid',
              overflow: 'hidden',
              borderRadius: '8px',
              border: '1px solid rgba(24, 33, 47, 0.16)',
              background: '#fff',
              boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
            }}
          >
            <IconButton
              onClick={() => changeZoom(1)}
              disabled={zoom >= maxZoom}
              aria-label="Aumentar zoom"
              sx={{ width: 44, height: 44, borderRadius: 0, borderBottom: '1px solid rgba(24, 33, 47, 0.12)' }}
            >
              <AddIcon />
            </IconButton>
            <IconButton
              onClick={() => changeZoom(-1)}
              disabled={zoom <= minZoom}
              aria-label="Diminuir zoom"
              sx={{ width: 44, height: 44, borderRadius: 0 }}
            >
              <RemoveIcon />
            </IconButton>
          </Box>

          <Button
            variant="contained"
            size="small"
            onClick={resetZoom}
            sx={{
              position: 'absolute',
              top: 16,
              left: 68,
              zIndex: 4,
              minHeight: 44,
              background: '#fff',
              color: 'text.primary',
              '&:hover': { background: '#f6f8fb' },
            }}
          >
            Centralizar
          </Button>

          <Box sx={{ position: 'absolute', left: 16, bottom: 16, p: 1.5, borderRadius: '8px', background: 'rgba(255,255,255,0.94)', zIndex: 3 }}>
            <Typography sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MyLocationIcon color="primary" /> {mappedClientes.length} cliente(s) no mapa
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Zoom {zoom} - dados de mapa por OpenStreetMap.
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
          <Typography variant="h6">Cobertura da base</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
            <Chip color="success" label={`${mappedClientes.length} com coordenadas`} />
            <Chip color={missingCoordinates.length ? 'warning' : 'default'} label={`${missingCoordinates.length} sem coordenadas`} />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
            Para marcar um cliente no mapa, cadastre latitude e longitude no perfil dele. Isso evita erro de geocodificacao e deixa a posicao precisa.
          </Typography>
          {missingCoordinates.length > 0 && (
            <Box sx={{ mt: 2, display: 'grid', gap: 1 }}>
              {missingCoordinates.slice(0, 8).map((cliente) => (
                <Box key={cliente.id} sx={{ p: 1.25, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
                  <Typography sx={{ fontWeight: 800 }}>{cliente.nome}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {[cliente.endereco, cliente.cidade, cliente.estado].filter(Boolean).join(', ') || 'Endereco incompleto'}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </PageShell>
  );
}
