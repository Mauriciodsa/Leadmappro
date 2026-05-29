import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PageShell from '../components/PageShell';
import { type BankRate, newId, readRates, writeRates } from '../services/localStore';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Financeiro() {
  const [rates, setRates] = useState<BankRate[]>(() => readRates());
  const [selectedRateId, setSelectedRateId] = useState(rates[0]?.id || '');
  const [netValue, setNetValue] = useState(1000);

  const selectedRate = rates.find((rate) => rate.id === selectedRateId) || rates[0];

  const result = useMemo(() => {
    if (!selectedRate) return { gross: 0, fee: 0, installment: 0 };
    const percent = Math.min(selectedRate.percent, 99.9) / 100;
    const gross = (netValue + selectedRate.fixedFee) / (1 - percent);
    return {
      gross,
      fee: gross - netValue,
      installment: gross / Math.max(selectedRate.installments, 1),
    };
  }, [netValue, selectedRate]);

  function persistRates(nextRates: BankRate[]) {
    setRates(nextRates);
    writeRates(nextRates);
    if (!nextRates.some((rate) => rate.id === selectedRateId)) {
      setSelectedRateId(nextRates[0]?.id || '');
    }
  }

  function addRate() {
    const nextRate: BankRate = {
      id: newId('rate'),
      label: 'Nova taxa',
      installments: 1,
      percent: 0,
      fixedFee: 0,
    };
    persistRates([...rates, nextRate]);
    setSelectedRateId(nextRate.id);
  }

  function updateRate(id: string, patch: Partial<BankRate>) {
    persistRates(rates.map((rate) => (rate.id === id ? { ...rate, ...patch } : rate)));
  }

  function removeRate(id: string) {
    persistRates(rates.filter((rate) => rate.id !== id));
  }

  return (
    <PageShell
      title="Calculadora financeira"
      subtitle="Cadastre taxas do banco/maquininha e calcule quanto cobrar para receber o valor líquido completo."
      icon={<CalculateIcon />}
      action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={addRate}>
          Nova taxa
        </Button>
      }
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' }, gap: 2.5 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
          <Typography variant="h6">Simulação de repasse</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
            <TextField
              label="Valor líquido desejado"
              type="number"
              value={netValue}
              onChange={(e) => setNetValue(Number(e.target.value))}
              fullWidth
            />
            <TextField
              select
              label="Taxa aplicada"
              value={selectedRateId}
              onChange={(e) => setSelectedRateId(e.target.value)}
              fullWidth
            >
              {rates.map((rate) => (
                <MenuItem key={rate.id} value={rate.id}>
                  {rate.label} - {rate.percent}% {rate.installments}x
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mt: 3 }}>
            <Card sx={{ borderRadius: '8px' }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                  Cobrar do cliente
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, color: 'primary.main' }}>
                  {money.format(result.gross)}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: '8px' }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                  Taxa repassada
                </Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {money.format(result.fee)}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: '8px' }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                  Parcela estimada
                </Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {money.format(result.installment)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
          <Typography variant="h6">Taxas cadastradas</Typography>
          <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            {rates.map((rate) => (
              <Box key={rate.id} sx={{ p: 2, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField label="Nome" value={rate.label} onChange={(e) => updateRate(rate.id, { label: e.target.value })} fullWidth />
                  <IconButton color="error" onClick={() => removeRate(rate.id)} aria-label="Excluir taxa">
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mt: 1.5 }}>
                  <TextField
                    label="Parcelas"
                    type="number"
                    value={rate.installments}
                    onChange={(e) => updateRate(rate.id, { installments: Math.max(Number(e.target.value), 1) })}
                  />
                  <TextField
                    label="%"
                    type="number"
                    value={rate.percent}
                    onChange={(e) => updateRate(rate.id, { percent: Number(e.target.value) })}
                  />
                  <TextField
                    label="Fixo"
                    type="number"
                    value={rate.fixedFee}
                    onChange={(e) => updateRate(rate.id, { fixedFee: Number(e.target.value) })}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </PageShell>
  );
}
