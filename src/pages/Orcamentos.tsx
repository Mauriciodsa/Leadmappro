import { useState } from 'react';
import { Box, Button, Card, CardContent, IconButton, MenuItem, Paper, TextField, Typography } from '@mui/material';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PageShell from '../components/PageShell';
import { type Quote, newId, readClientes, readProducts, readQuotes, writeQuotes } from '../services/localStore';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const emptyQuote: Quote = {
  id: '',
  client: '',
  product: '',
  exchangeConditions: '',
  paymentMethod: '',
  deadline: '',
  warranty: '',
  notes: '',
  total: 0,
  createdAt: '',
};

export default function Orcamentos() {
  const clientes = readClientes();
  const products = readProducts();
  const [quotes, setQuotes] = useState<Quote[]>(() => readQuotes());
  const [formData, setFormData] = useState<Quote>({ ...emptyQuote, id: newId('quote'), createdAt: new Date().toISOString() });

  function persistQuotes(nextQuotes: Quote[]) {
    setQuotes(nextQuotes);
    writeQuotes(nextQuotes);
  }

  function saveQuote() {
    if (!formData.client || !formData.product) return;
    persistQuotes([{ ...formData, id: formData.id || newId('quote'), createdAt: formData.createdAt || new Date().toISOString() }, ...quotes]);
    setFormData({ ...emptyQuote, id: newId('quote'), createdAt: new Date().toISOString() });
  }

  function removeQuote(id: string) {
    persistQuotes(quotes.filter((quote) => quote.id !== id));
  }

  function quoteText(quote: Quote) {
    return encodeURIComponent(
      `Orçamento LeadMap Pro\nCliente: ${quote.client}\nProduto/equipamento: ${quote.product}\nValor: ${money.format(quote.total || 0)}\nCondições de troca: ${quote.exchangeConditions || '-'}\nPagamento: ${quote.paymentMethod || '-'}\nPrazo: ${quote.deadline || '-'}\nGarantia: ${quote.warranty || '-'}\nObservações: ${quote.notes || '-'}`,
    );
  }

  return (
    <PageShell
      title="Orçamentos"
      subtitle="Monte propostas simples com cliente, produto, troca, pagamento, prazos e observações."
      icon={<RequestQuoteIcon />}
      action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={saveQuote}>
          Salvar orçamento
        </Button>
      }
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 420px' }, gap: 2.5 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
          <Typography variant="h6">Novo orçamento</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mt: 2 }}>
            <TextField select label="Cliente" value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} fullWidth>
              {clientes.map((cliente) => (
                <MenuItem key={cliente.id} value={cliente.nome}>
                  {cliente.nome}
                </MenuItem>
              ))}
              <MenuItem value="Cliente avulso">Cliente avulso</MenuItem>
            </TextField>
            <TextField select label="Produto ou equipamento" value={formData.product} onChange={(e) => setFormData({ ...formData, product: e.target.value })} fullWidth>
              {products.map((product) => (
                <MenuItem key={product.id} value={product.name}>
                  {product.name}
                </MenuItem>
              ))}
              <MenuItem value="Produto avulso">Produto avulso</MenuItem>
            </TextField>
            <TextField
              label="Valor total"
              type="number"
              value={formData.total}
              onChange={(e) => setFormData({ ...formData, total: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Método de pagamento"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              fullWidth
              placeholder="Pix, boleto, cartão 6x..."
            />
            <TextField label="Prazo" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} fullWidth />
            <TextField label="Garantia" value={formData.warranty} onChange={(e) => setFormData({ ...formData, warranty: e.target.value })} fullWidth />
            <TextField
              label="Condições de troca"
              value={formData.exchangeConditions}
              onChange={(e) => setFormData({ ...formData, exchangeConditions: e.target.value })}
              fullWidth
              multiline
              rows={3}
              sx={{ gridColumn: { md: '1 / -1' } }}
            />
            <TextField
              label="Observações"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
              sx={{ gridColumn: { md: '1 / -1' } }}
            />
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
          <Typography variant="h6">Orçamentos salvos</Typography>
          <Box sx={{ display: 'grid', gap: 1.5, mt: 2 }}>
            {quotes.map((quote) => (
              <Card key={quote.id} sx={{ borderRadius: '8px' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 900 }}>{quote.client}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {quote.product}
                      </Typography>
                    </Box>
                    <IconButton color="error" onClick={() => removeQuote(quote.id)} aria-label="Excluir orçamento">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {money.format(quote.total || 0)}
                  </Typography>
                  <Button variant="outlined" color="success" startIcon={<WhatsAppIcon />} href={`https://wa.me/?text=${quoteText(quote)}`} target="_blank" sx={{ mt: 1 }}>
                    Enviar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>
      </Box>
    </PageShell>
  );
}
