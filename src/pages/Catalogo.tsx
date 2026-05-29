import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, IconButton, Paper, Snackbar, TextField, Typography } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PageShell from '../components/PageShell';
import { type Product, newId, readProducts, writeProducts } from '../services/localStore';
import { imageFileToDataUrl } from '../services/imageUpload';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Catalogo() {
  const [products, setProducts] = useState<Product[]>(() => readProducts());
  const [message, setMessage] = useState('');

  function persistProducts(nextProducts: Product[]) {
    setProducts(nextProducts);
    writeProducts(nextProducts);
  }

  function addProduct() {
    persistProducts([
      ...products,
      { id: newId('product'), name: 'Novo produto', code: '', category: '', price: 0, description: '', imageUrl: '' },
    ]);
  }

  function updateProduct(id: string, patch: Partial<Product>) {
    persistProducts(products.map((product) => (product.id === id ? { ...product, ...patch } : product)));
  }

  function removeProduct(id: string) {
    persistProducts(products.filter((product) => product.id !== id));
  }

  async function handleProductImageChange(id: string, file?: File) {
    if (!file) return;

    try {
      const imageUrl = await imageFileToDataUrl(file);
      updateProduct(id, { imageUrl });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Nao foi possivel carregar a imagem.');
    }
  }

  function productMessage(product: Product) {
    return encodeURIComponent(
      `${product.name}\nCodigo: ${product.code || '-'}\nCategoria: ${product.category || '-'}\nValor: ${money.format(product.price || 0)}\n\n${product.description}`,
    );
  }

  return (
    <PageShell
      title="Catalogo"
      subtitle="Cadastre produtos, equipamentos ou servicos para enviar rapidamente ao cliente."
      icon={<InventoryIcon />}
      action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={addProduct}>
          Novo item
        </Button>
      }
    >
      <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, 1fr)' }, gap: 2 }}>
          {products.map((product) => (
            <Card key={product.id} sx={{ borderRadius: '8px' }}>
              <CardContent>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '140px 1fr auto' }, gap: 1.5 }}>
                  <Box
                    sx={{
                      minHeight: 128,
                      borderRadius: '8px',
                      background: product.imageUrl ? `url(${product.imageUrl}) center/cover` : '#eef3f7',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'text.secondary',
                      border: '1px solid rgba(24, 33, 47, 0.08)',
                    }}
                  >
                    {!product.imageUrl && <InventoryIcon />}
                  </Box>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <TextField label="Nome" value={product.name} onChange={(e) => updateProduct(product.id, { name: e.target.value })} fullWidth />
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                      <TextField label="Codigo" value={product.code} onChange={(e) => updateProduct(product.id, { code: e.target.value })} />
                      <TextField label="Categoria" value={product.category} onChange={(e) => updateProduct(product.id, { category: e.target.value })} />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Button variant="outlined" component="label" startIcon={<PhotoCameraIcon />} size="small">
                        Upload da foto
                        <input hidden accept="image/*" type="file" onChange={(e) => handleProductImageChange(product.id, e.target.files?.[0])} />
                      </Button>
                      {product.imageUrl && (
                        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} size="small" onClick={() => updateProduct(product.id, { imageUrl: '' })}>
                          Remover
                        </Button>
                      )}
                    </Box>
                  </Box>
                  <IconButton color="error" onClick={() => removeProduct(product.id)} aria-label="Excluir produto">
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '160px 1fr' }, gap: 1.5, mt: 1.5 }}>
                  <TextField
                    label="Preco"
                    type="number"
                    value={product.price}
                    onChange={(e) => updateProduct(product.id, { price: Number(e.target.value) })}
                  />
                  <TextField label="URL da imagem" value={product.imageUrl} onChange={(e) => updateProduct(product.id, { imageUrl: e.target.value })} />
                </Box>
                <TextField
                  label="Descricao"
                  value={product.description}
                  onChange={(e) => updateProduct(product.id, { description: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  sx={{ mt: 1.5 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, gap: 1 }}>
                  <Typography sx={{ fontWeight: 900 }}>{money.format(product.price || 0)}</Typography>
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<WhatsAppIcon />}
                    href={`https://wa.me/?text=${productMessage(product)}`}
                    target="_blank"
                  >
                    Enviar
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Paper>

      <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage('')}>
        <Alert severity="warning">{message}</Alert>
      </Snackbar>
    </PageShell>
  );
}
