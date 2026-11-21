// Prepara a foto de perfil no navegador antes do envio: confere o arquivo, corrige a rotação da câmera,
// recorta no centro em quadrado e regrava como JPG de 512px. Regravar descarta o EXIF (GPS, aparelho,
// data) antes de a foto sair do computador (LGPD, art. 6º, III); a API limpa de novo por garantia.

// a foto aparece no máximo a 64px; 512px sobra para telas de alta densidade (mesmo tamanho do app)
const OUTPUT_SIZE = 512;
const MIN_SIDE = 128;
// limite do arquivo escolhido; depois de reduzida a foto fica bem abaixo dos 5 MB da API
const MAX_INPUT_BYTES = 20 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const PHOTO_INPUT_ACCEPT = ACCEPTED_TYPES.join(",");

export class PhotoValidationError extends Error {}

async function decode(file: File): Promise<ImageBitmap> {
  try {
    // "from-image" respeita a orientação gravada pela câmera do celular
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new PhotoValidationError("Não foi possível abrir a imagem. Use uma foto JPG, PNG ou WEBP.");
  }
}

export async function prepareProfilePhoto(file: File): Promise<Blob> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new PhotoValidationError("Formato não aceito. Use uma foto JPG, PNG ou WEBP.");
  }
  if (file.size === 0) throw new PhotoValidationError("O arquivo está vazio.");
  if (file.size > MAX_INPUT_BYTES) throw new PhotoValidationError("A foto precisa ter até 20 MB.");

  const image = await decode(file);
  try {
    const side = Math.min(image.width, image.height);
    if (side < MIN_SIDE) {
      throw new PhotoValidationError(`A foto é pequena demais. Use uma com pelo menos ${MIN_SIDE} x ${MIN_SIDE} pixels.`);
    }

    const size = Math.min(OUTPUT_SIZE, side);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");
    if (!context) throw new PhotoValidationError("Seu navegador não conseguiu processar a foto.");

    // fundo branco para PNG com transparência (o JPG não tem transparência)
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size, size);
    context.imageSmoothingQuality = "high";
    context.drawImage(
      image,
      (image.width - side) / 2,
      (image.height - side) / 2,
      side,
      side,
      0,
      0,
      size,
      size,
    );

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) throw new PhotoValidationError("Seu navegador não conseguiu processar a foto.");
    return blob;
  } finally {
    image.close();
  }
}
