import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, IconButton, Paper, Snackbar, TextField, Typography } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import LaunchIcon from '@mui/icons-material/Launch';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PageShell from '../components/PageShell';
import { type Product, newId, normalizeProduct, readProducts, writeProducts } from '../services/localStore';
import { imageFileToDataUrl } from '../services/imageUpload';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const maxProductImages = 10;

export default function Catalogo() {
  const [products, setProducts] = useState<Product[]>(() => readProducts());
  const [message, setMessage] = useState('');

  function persistProducts(nextProducts: Product[]) {
    const normalized = nextProducts.map(normalizeProduct);
    setProducts(normalized);
    writeProducts(normalized);
  }

  function addProduct() {
    persistProducts([
      ...products,
      { id: newId('product'), name: 'Novo produto', code: '', category: '', price: 0, description: '', imageUrl: '', siteUrl: '', imageUrls: [] },
    ]);
  }

  function updateProduct(id: string, patch: Partial<Product>) {
    persistProducts(products.map((product) => (product.id === id ? { ...product, ...patch } : product)));
  }

  function removeProduct(id: string) {
    persistProducts(products.filter((product) => product.id !== id));
  }

  async function handleProductImagesChange(id: string, files?: FileList | null) {
    if (!files?.length) return;

    const product = products.find((item) => item.id === id);
    if (!product) return;

    const availableSlots = maxProductImages - product.imageUrls.length;
    if (availableSlots <= 0) {
      setMessage('Este item ja possui o limite de 10 fotos.');
      return;
    }

    try {
      const selectedFiles = Array.from(files).slice(0, availableSlots);
      const uploadedImages = await Promise.all(selectedFiles.map(imageFileToDataUrl));
      const imageUrls = [...product.imageUrls, ...uploadedImages].slice(0, maxProductImages);
      updateProduct(id, { imageUrls, imageUrl: imageUrls[0] || '' });
      if (files.length > availableSlots) setMessage(`Foram adicionadas ${availableSlots} fotos. O limite por item e 10.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Nao foi possivel carregar a imagem.');
    }
  }

  function removeProductImage(product: Product, imageIndex: number) {
    const imageUrls = product.imageUrls.filter((_imageUrl, index) => index !== imageIndex);
    updateProduct(product.id, { imageUrls, imageUrl: imageUrls[0] || '' });
  }

  function productMessage(product: Product) {
    return encodeURIComponent(
      `${product.name}\nCodigo: ${product.code || '-'}\nCategoria: ${product.category || '-'}\nValor: ${money.format(product.price || 0)}\nSite: ${product.siteUrl || '-'}\n\n${product.description}`,
    );
  }

  return (
    <PageShell
      title="Catalogo"
      subtitle="Cadastre produtos, equipamentos ou servicos com site, fotos e envio rapido ao cliente."
      icon={<InventoryIcon />}
      action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={addProduct}>
          Novo item
        </Button>
      }
    >
      <Paper elevation={0} sx={{ p: { xs: 1.5, md: 3 }, borderRadius: '8px', border: '1px solid rgba(24, 33, 47, 0.08)' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
          {products.map((product) => {
            const coverImage = product.imageUrls[0] || product.imageUrl;
            return (
              <Card key={product.id} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
                <Box
                  sx={{
                    aspectRatio: '4 / 3',
                    background: coverImage ? `url(${coverImage}) center/cover` : '#eef3f7',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'text.secondary',
                    borderBottom: '1px solid rgba(24, 33, 47, 0.08)',
                  }}
                >
                  {!coverImage && <InventoryIcon sx={{ fontSize: 48 }} />}
                </Box>
                <CardContent sx={{ display: 'grid', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                    <Box
                      sx={{ minWidth: 0 }}
                    >
                      <Typography variant="h6" sx={{ lineHeight: 1.2, wordBreak: 'break-word' }}>
                        {product.name || 'Novo produto'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {product.category || 'Sem categoria'} {product.code ? `- ${product.code}` : ''}
                      </Typography>
                    </Box>
                    <IconButton color="error" onClick={() => removeProduct(product.id)} aria-label="Excluir produto">
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  {product.imageUrls.length > 0 && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 1, mt: 1.5 }}>
                      {product.imageUrls.map((imageUrl, index) => (
                        <Box
                          key={`${imageUrl.slice(0, 24)}-${index}`}
                          sx={{
                            minHeight: 72,
                            borderRadius: '8px',
                            background: `url(${imageUrl}) center/cover`,
                            border: index === 0 ? '2px solid' : '1px solid rgba(24, 33, 47, 0.12)',
                            borderColor: index === 0 ? 'primary.main' : 'rgba(24, 33, 47, 0.12)',
                            position: 'relative',
                          }}
                        >
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeProductImage(product, index)}
                            aria-label="Remover foto"
                            sx={{ position: 'absolute', top: 2, right: 2, background: 'rgba(255,255,255,0.9)' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip size="small" color="success" label="Item salvo" />
                    <Chip size="small" label={`${product.imageUrls.length}/10 fotos`} />
                  </Box>

                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <TextField label="Nome" value={product.name} onChange={(e) => updateProduct(product.id, { name: e.target.value })} fullWidth />
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                      <TextField label="Codigo" value={product.code} onChange={(e) => updateProduct(product.id, { code: e.target.value })} />
                      <TextField label="Categoria" value={product.category} onChange={(e) => updateProduct(product.id, { category: e.target.value })} />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Button variant="outlined" component="label" startIcon={<PhotoCameraIcon />} size="small" disabled={product.imageUrls.length >= maxProductImages}>
                        Adicionar fotos
                        <input hidden multiple accept="image/*" type="file" onChange={(e) => handleProductImagesChange(product.id, e.target.files)} />
                      </Button>
                      {product.siteUrl && (
                        <Button variant="outlined" startIcon={<LaunchIcon />} size="small" href={product.siteUrl} target="_blank" rel="noreferrer">
                          Abrir site
                        </Button>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '160px 1fr' }, gap: 1.5, mt: 1.5 }}>
                    <TextField
                      label="Preco"
                      type="number"
                      value={product.price || ''}
                      placeholder="0,00"
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateProduct(product.id, { price: Number(e.target.value) })}
                    />
                    <TextField label="URL do site" value={product.siteUrl} onChange={(e) => updateProduct(product.id, { siteUrl: e.target.value })} />
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
            );
          })}
        </Box>
      </Paper>

      <Snackbar open={!!message} autoHideDuration={5000} onClose={() => setMessage('')}>
        <Alert severity="warning">{message}</Alert>
      </Snackbar>
    </PageShell>
  );
}
