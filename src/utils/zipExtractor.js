import JSZip from 'jszip';

export async function extractZipFromBase64(base64) {
  const clean = base64.trim();

  const binary = atob(clean);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const innerZip = await JSZip.loadAsync(bytes);

  const zip = new JSZip();

  const files = [];

  const usedNames = new Set();

  for (const file of Object.values(innerZip.files)) {
    if (file.dir) continue;

    const blob = await file.async('blob');

    let name = file.name.split('/').pop();

    if (usedNames.has(name)) {
      name = `${Date.now()}_${name}`;
    }

    usedNames.add(name);

    zip.file(name, blob);

    files.push({
      name,
      size: blob.size,
    });
  }

  return {
    zip,
    files,
  };
}
