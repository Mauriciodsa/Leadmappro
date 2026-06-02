import { useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, IconButton, MenuItem, Paper, TextField, Typography } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PageShell from '../components/PageShell';
import { type BankRate, newId, readRates, writeRates } from '../services/localStore';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function toCents(value: number) {
  return Math.round((Number.isFinite(value) ? value : 0) * 100);
}

function fromCents(value: number) {
  return value / 100;
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(value, 99.99));
}

export default function Financeiro() {
  const [rates, setRates] = useState<BankRate[]>(() => readRates());
  const [selectedRateId, setSelectedRateId] = useState(rates[0]?.id || '');
  const [netValue, setNetValue] = useState(1000);

  const selectedRate = rates.find((rate) => rate.id === selectedRateId) || rates[0];

  const result = useMemo(() => {
    if (!selectedRate) return { gross: 0, percentFee: 0, fixedFee: 0, totalFee: 0, installment: 0, checkedNet: 0 };

    const desiredNetCents = toCents(Math.max(netValue, 0));
    const fixedFeeCents = toCents(Math.max(selectedRate.fixedFee, 0));
    const percent = clampPercent(selectedRate.percent) / 100;
    const grossCents = Math.ceil((desiredNetCents + fixedFeeCents) / (1 - percent));
    const percentFeeCents = Math.round(grossCents * percent);
    const totalFeeCents = percentFeeCents + fixedFeeCents;
    const checkedNetCents = grossCents - totalFeeCents;
    const installments = Math.max(Math.round(selectedRate.installments || 1), 1);

    return {
      gross: fromCents(grossCents),
      percentFee: fromCents(percentFeeCents),
      fixedFee: fromCents(fixedFeeCents),
      totalFee: fromCents(totalFeeCents),
      installment: fromCents(Math.ceil(grossCents / installments)),
      checkedNet: fromCents(checkedNetCents),
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
      subtitle="Cadastre taxas reais da maquininha/banco e calcule o valor bruto necessario para receber o liquido desejado."
      icon={<CalculateIcon />}
      action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={addRate}>
          Nova taxa
        </Button>
      }
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 400px' }, gap: 2.5 }}>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
          <Typography variant="h6">Simulacao de repasse preciso</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
            <TextField
              label="Valor liquido desejado"
              type="number"
              value={netValue || ''}
              placeholder="0,00"
              onFocus={(e) => e.target.select()}
              onChange={(e) => setNetValue(Math.max(Number(e.target.value), 0))}
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
                  Taxa total
                </Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {money.format(result.totalFee)}
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

          <Alert severity="info" sx={{ mt: 2 }}>
            Conferencia: liquido calculado {money.format(result.checkedNet)}. Taxa percentual {money.format(result.percentFee)} + taxa fixa{' '}
            {money.format(result.fixedFee)}.
          </Alert>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
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
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1, mt: 1.5 }}>
                  <TextField
                    label="Parcelas"
                    type="number"
                    value={rate.installments || ''}
                    placeholder="1"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateRate(rate.id, { installments: Math.max(Math.round(Number(e.target.value)), 1) })}
                  />
                  <TextField
                    label="Percentual"
                    type="number"
                    value={rate.percent || ''}
                    placeholder="0"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateRate(rate.id, { percent: clampPercent(Number(e.target.value)) })}
                  />
                  <TextField
                    label="Taxa fixa"
                    type="number"
                    value={rate.fixedFee || ''}
                    placeholder="0,00"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateRate(rate.id, { fixedFee: Math.max(Number(e.target.value), 0) })}
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
