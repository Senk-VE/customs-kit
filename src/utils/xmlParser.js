import JSZip from 'jszip';
import { extractZipFromBase64 } from './zipExtractor';

function getText(parent, tag) {
  return parent.getElementsByTagName(tag)[0]?.textContent?.trim() || '';
}

async function xmlParser(file) {
  const xmlText = await file.text();

  const parser = new DOMParser();

  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  const regNumber =
    getText(xmlDoc, 'RegNumber') || file.name.replace('.xml', '');

  const sender =
    xmlDoc
      .getElementsByTagName('Sender')[0]
      ?.getElementsByTagName('Name')[0]
      ?.textContent?.trim() || '—';

  const documents = Array.from(xmlDoc.getElementsByTagName('Document'));

  const filesInfo = [];

  let totalSize = 0;

  const zip = new JSZip();

  for (let i = 0; i < documents.length; i++) {
    const documentNode = documents[i];

    const size = Number(getText(documentNode, 'Size') || 0);

    totalSize += size;

    filesInfo.push({
      index: i + 1,

      name: getText(documentNode, 'Name') || '—',

      size,

      docNumber: getText(documentNode, 'DocNumber') || '—',

      docDate: getText(documentNode, 'DocDate') || '—',

      docCode: getText(documentNode, 'DocCode') || '—',

      docType: getText(documentNode, 'DocType') || '—',
    });

    const zipNode = documentNode.getElementsByTagName('ZIP')[0];

    if (!zipNode) continue;

    try {
      const extracted = await extractZipFromBase64(zipNode.textContent);

      const content = await extracted.zip.generateAsync({
        type: 'uint8array',
      });

      const innerZip = await JSZip.loadAsync(content);

      for (const [name, entry] of Object.entries(innerZip.files)) {
        if (!entry.dir) {
          const blob = await entry.async('blob');

          zip.file(name, blob);
        }
      }
    } catch (error) {
      console.error('Ошибка извлечения ZIP:', error);
    }
  }

  return {
    regNumber,

    sender,

    zip,

    files: filesInfo,

    totalSize,
  };
}

export default xmlParser;
