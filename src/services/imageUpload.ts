const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1200;
const IMAGE_QUALITY = 0.86;

export async function imageFileToDataUrl(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selecione um arquivo de imagem.');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Use uma imagem de ate 4 MB.');
  }

  const image = await loadImage(file);
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Nao foi possivel processar a imagem.');
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Nao foi possivel ler a imagem.'));
    };
    image.src = objectUrl;
  });
}
