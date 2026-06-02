import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import { supabase } from '../services/supabase';
import PageShell from '../components/PageShell';
import { type ClienteLocal, emptyCliente, newId, normalizeCliente, readClientes, readSectors, writeClientes } from '../services/localStore';

export default function Clientes() {
  const [clientes, setClientes] = useState<ClienteLocal[]>(() => readClientes());
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editCliente, setEditCliente] = useState<ClienteLocal | undefined>(undefined);
  const [formData, setFormData] = useState<ClienteLocal>({ ...emptyCliente });
  const sectors = readSectors();

  useEffect(() => {
    let active = true;

    async function loadClientes() {
      const { data, error } = await supabase.from('clientes').select('*').order('nome');
      if (!active) return;
      if (!error && data?.length) {
        const normalized = data.map((cliente) => normalizeCliente(cliente));
        setClientes(normalized);
        writeClientes(normalized);
      }
      setLoading(false);
    }

    loadClientes();
    return () => {
      active = false;
    };
  }, []);

  function persistClientes(nextClientes: ClienteLocal[]) {
    setClientes(nextClientes);
    writeClientes(nextClientes);
  }

  function handleOpenForm(cliente?: ClienteLocal) {
    if (cliente) {
      setFormData(normalizeCliente(cliente));
      setEditCliente(cliente);
    } else {
      setFormData({ ...emptyCliente, id: newId('cliente') });
      setEditCliente(undefined);
    }
    setOpenForm(true);
  }

  async function handleSave() {
    if (!formData.nome || !formData.telefone) return;

    const payload = normalizeCliente({ ...formData, id: formData.id || newId('cliente') });
    const nextClientes = editCliente
      ? clientes.map((cliente) => (cliente.id === editCliente.id ? payload : cliente))
      : [...clientes, payload];

    persistClientes(nextClientes);
    setOpenForm(false);

    if (editCliente?.id) {
      await supabase.from('clientes').update(payload).eq('id', editCliente.id);
    } else {
      await supabase.from('clientes').insert([payload]);
    }
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    persistClientes(clientes.filter((cliente) => cliente.id !== id));
    await supabase.from('clientes').delete().eq('id', id);
  }

  return (
    <PageShell
      title="Clientes"
      subtitle="Cadastro completo para CRM, mapa, equipamentos, lembretes por setor e observacoes comerciais."
      icon={<PeopleIcon />}
      action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
          Novo cliente
        </Button>
      }
    >
      <Paper elevation={0} sx={{ borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ minHeight: 260, display: 'grid', placeItems: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: '#f6f8fb' }}>
                  <TableCell sx={{ fontWeight: 800 }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Telefone</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Cidade/UF</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Lembrete</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>
                    Acoes
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography sx={{ fontWeight: 800 }}>Nenhum cliente cadastrado</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        Use o botao "Novo cliente" para iniciar sua base.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  clientes.map((cliente) => (
                    <TableRow key={cliente.id} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 800 }}>{cliente.nome}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {cliente.email || cliente.empresa || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>{cliente.telefone}</TableCell>
                      <TableCell>{[cliente.cidade, cliente.estado].filter(Boolean).join('/') || '-'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          <Chip size="small" label={cliente.status} />
                          {cliente.nossoCliente && <Chip size="small" color="success" label="Nosso cliente" />}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {cliente.lembreteTexto ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                              {cliente.lembreteSetor || 'Geral'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {[cliente.lembreteData, cliente.lembreteTexto].filter(Boolean).join(' - ')}
                            </Typography>
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleOpenForm(cliente)} aria-label="Editar cliente">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(cliente.id)} aria-label="Excluir cliente">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="md">
        <DialogTitle>{editCliente ? 'Editar cliente' : 'Novo cliente'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, pt: 1 }}>
            <TextField label="Nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} fullWidth required />
            <TextField label="Telefone" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} fullWidth required />
            <TextField label="E-mail" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} fullWidth />
            <TextField label="CPF/CNPJ" value={formData.documento} onChange={(e) => setFormData({ ...formData, documento: e.target.value })} fullWidth />
            <TextField label="Empresa" value={formData.empresa} onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} fullWidth />
            <TextField label="Origem do lead" value={formData.origem} onChange={(e) => setFormData({ ...formData, origem: e.target.value })} fullWidth />
            <TextField select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} fullWidth>
              {['Lead', 'Em negociacao', 'Cliente', 'Pos-venda', 'Inativo'].map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={<Switch checked={formData.nossoCliente} onChange={(e) => setFormData({ ...formData, nossoCliente: e.target.checked })} />}
              label="Ja e nosso cliente"
              sx={{ alignSelf: 'center' }}
            />
            <TextField label="CEP" value={formData.cep} onChange={(e) => setFormData({ ...formData, cep: e.target.value })} fullWidth />
            <TextField label="Endereco" value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} fullWidth />
            <TextField label="Cidade" value={formData.cidade} onChange={(e) => setFormData({ ...formData, cidade: e.target.value })} fullWidth />
            <TextField label="Estado" value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} fullWidth />
            <TextField label="Latitude" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} fullWidth />
            <TextField label="Longitude" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} fullWidth />
            <TextField
              label="Equipamentos que possui"
              value={formData.equipamentos}
              onChange={(e) => setFormData({ ...formData, equipamentos: e.target.value })}
              fullWidth
              multiline
              rows={2}
              sx={{ gridColumn: { sm: '1 / -1' } }}
              placeholder="Ex.: roteador, cameras, rastreador, sistema atual, maquinas..."
            />
            <TextField
              select
              label="Setor do lembrete"
              value={formData.lembreteSetor}
              onChange={(e) => setFormData({ ...formData, lembreteSetor: e.target.value })}
              fullWidth
            >
              <MenuItem value="">Geral</MenuItem>
              {sectors.map((sector) => (
                <MenuItem key={sector.id} value={sector.name}>
                  {sector.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Data do lembrete"
              type="date"
              value={formData.lembreteData}
              onChange={(e) => setFormData({ ...formData, lembreteData: e.target.value })}
              fullWidth
            />
            <TextField
              label="Lembrete"
              value={formData.lembreteTexto}
              onChange={(e) => setFormData({ ...formData, lembreteTexto: e.target.value })}
              fullWidth
              multiline
              rows={2}
              sx={{ gridColumn: { sm: '1 / -1' } }}
              placeholder="Ex.: Cobrar cliente com boleto atrasado."
            />
            <TextField
              label="Observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              fullWidth
              multiline
              rows={3}
              sx={{ gridColumn: { sm: '1 / -1' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
