/**
 * Encodes a file for JSON APIs that expect Java `byte[]` (Jackson base64).
 */
export async function fileToApiByteArray(file) {
  if (!(file instanceof File)) {
    return null;
  }

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (bytes.length === 0) {
    return null;
  }

  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}