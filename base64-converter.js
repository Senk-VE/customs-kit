let currentPreviewZip = null;
let currentPreviewRegNumber = null;

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('xmlInput');
  const parseBtn = document.getElementById('parseBtn');

  // кнопка "скачать все" скрыта по умолчанию
  parseBtn.style.display = 'none';

  createProgressBar();

  input.addEventListener('change', () => {
    toggleDownloadAllButton();
    extractFileFromXmlWithProgress();
  });

  parseBtn.addEventListener('click', downloadAllAsOneZipWithProgress);
});

/* ================== utils ================== */

function sanitizeName(name) {
  return name
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function getUniqueName(name, usedSet) {
  const base = sanitizeName(name.replace(/\.pdf$/i, ''));
  const ext = name.toLowerCase().endsWith('.pdf') ? '.pdf' : '';
  let finalName = base + ext;
  let counter = 1;

  while (usedSet.has(finalName.toLowerCase())) {
    finalName = `${base} (${counter})${ext}`;
    counter++;
  }

  usedSet.add(finalName.toLowerCase());
  return finalName;
}

/* ================== progress bar ================== */

function createProgressBar() {
  const container = document.querySelector('.container_02');

  const wrapper = document.createElement('div');
  wrapper.id = 'progressWrapper';
  wrapper.style.display = 'none';
  wrapper.style.marginTop = '10px';

  wrapper.innerHTML = `
    <div id="progressText" style="font-size:14px;margin-bottom:4px;"></div>
    <div style="height:6px;background:#e0e0e0;border-radius:3px;">
      <div id="progressBar"
        style="height:100%;width:0%;background:#4caf50;border-radius:3px;transition:width .2s;">
      </div>
    </div>
  `;

  container.appendChild(wrapper);
}

function showProgress(text, percent) {
  const wrapper = document.getElementById('progressWrapper');
  const bar = document.getElementById('progressBar');
  const label = document.getElementById('progressText');

  wrapper.style.display = 'block';
  label.textContent = text;
  bar.style.width = `${percent}%`;
}

function hideProgress() {
  document.getElementById('progressWrapper').style.display = 'none';
}

/* ================== button visibility ================== */

function toggleDownloadAllButton() {
  const input = document.getElementById('xmlInput');
  const parseBtn = document.getElementById('parseBtn');
  parseBtn.style.display = input.files.length ? 'inline-block' : 'none';
}

/* ================== XML → ZIP ================== */

async function extractPdfFromXml(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  const regNumberRaw =
    xmlDoc.getElementsByTagName('RegNumber')[0]?.textContent || 'XML';

  const senderName =
    xmlDoc.getElementsByTagName('Sender')[0]?.getElementsByTagName('Name')[0]
      ?.textContent || 'Sender Name не найден';

  const regNumber = sanitizeName(regNumberRaw);
  const documents = xmlDoc.getElementsByTagName('Document');

  const filesMeta = [];
  let totalSizeMb = 0;

  for (let i = 0; i < documents.length; i++) {
    const d = documents[i];

    const size = parseFloat(
      d.getElementsByTagName('Size')[0]?.textContent || '0',
    );

    totalSizeMb += size;

    filesMeta.push({
      index: i + 1,
      fileName: d.getElementsByTagName('Name')[0]?.textContent || '—',
      sizeMb: size,
      docNumber: d.getElementsByTagName('DocNumber')[0]?.textContent || '—',
      docDate: d.getElementsByTagName('DocDate')[0]?.textContent || '—',
      docCode: d.getElementsByTagName('DocCode')[0]?.textContent || '—',
      docType: d.getElementsByTagName('DocType')[0]?.textContent || '—',
    });
  }

  const packageMeta = {
    regNumber,
    senderName,
    totalFiles: filesMeta.length,
    totalSizeMb,
    files: filesMeta,
  };

  const zip = new JSZip();
  const usedNames = new Set();

  for (const doc of documents) {
    const zipTag = doc.getElementsByTagName('ZIP')[0];
    if (!zipTag) continue;

    try {
      const binary = atob(zipTag.textContent.trim());
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const innerZip = await JSZip.loadAsync(bytes);

      for (const innerFile of Object.values(innerZip.files)) {
        if (innerFile.dir) continue;
        if (!innerFile.name.toLowerCase().endsWith('.pdf')) continue;

        const originalName = innerFile.name.split('/').pop();
        const safeName = getUniqueName(originalName, usedNames);
        const pdfBlob = await innerFile.async('blob');

        zip.file(safeName, pdfBlob);
      }
    } catch (err) {
      console.error('Ошибка обработки ZIP:', err);
    }
  }

  return { zip, regNumber, senderName, packageMeta };
}

/* ================== attach XML (with progress) ================== */

async function extractFileFromXmlWithProgress() {
  const input = document.getElementById('xmlInput');
  const resultDiv = document.getElementById('resultXml');
  resultDiv.innerHTML = '';

  const total = input.files.length;
  if (!total) {
    hideProgress();
    return;
  }

  for (let i = 0; i < total; i++) {
    showProgress(
      `Обработка XML: ${i + 1} из ${total}`,
      ((i + 1) / total) * 100,
    );

    const xmlText = await input.files[i].text();
    const { zip, regNumber, senderName, packageMeta } =
      await extractPdfFromXml(xmlText);

    const block = document.createElement('div');
    block.innerHTML = `
      <p class="xml-output">
        ${regNumber}<br>
        ${senderName}<br>
        <img src="download.png" alt="скачать" class="icon-btn">
        <img src="zoom.png" alt="просмотр" class="icon-btn icon-preview">
      </p>
    `;
    block.querySelector('.icon-preview').addEventListener('click', () => {
      currentPreviewZip = zip;
      currentPreviewRegNumber = regNumber;

      openPreviewModal(packageMeta);
    });

    block
      .querySelector('img[alt="скачать"]')
      .addEventListener('click', async () => {
        const blob = await zip.generateAsync({ type: 'blob' });
        await saveZipCrossBrowser(blob, `${regNumber}.zip`);
      });

    resultDiv.appendChild(block);
    await new Promise((r) => setTimeout(r, 40)); // даём UI обновиться
  }

  showProgress('XML готовы к скачиванию', 100);
}

/* ================== download all ================== */

async function downloadAllAsOneZipWithProgress() {
  const input = document.getElementById('xmlInput');
  const total = input.files.length;
  if (!total) return;

  const masterZip = new JSZip();
  const usedFolders = new Set();

  for (let i = 0; i < total; i++) {
    showProgress(
      `Подготовка архива: ${i + 1} из ${total}`,
      ((i + 1) / total) * 100,
    );

    const xmlText = await input.files[i].text();
    const { zip, regNumber } = await extractPdfFromXml(xmlText);

    let folder = regNumber;
    let c = 1;
    while (usedFolders.has(folder.toLowerCase())) {
      folder = `${regNumber} (${c++})`;
    }
    usedFolders.add(folder.toLowerCase());

    const content = await zip.generateAsync({ type: 'uint8array' });
    const innerZip = await JSZip.loadAsync(content);

    for (const [name, file] of Object.entries(innerZip.files)) {
      if (!file.dir) {
        const blob = await file.async('blob');
        masterZip.file(`${folder}/${name}`, blob);
      }
    }
  }

  showProgress('Архив готов, начинается скачивание…', 100);

  const stamp = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
  const blob = await masterZip.generateAsync({ type: 'blob' });

  await saveZipCrossBrowser(blob, `xml-documents_${stamp}.zip`);
}

/* ================== save ================== */

async function saveZipCrossBrowser(blob, fileName) {
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          { description: 'ZIP', accept: { 'application/zip': ['.zip'] } },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch {
      return;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function openPreviewModal(meta) {
  const overlay = document.getElementById('xmlModalOverlay');
  const body = document.getElementById('modalFilesBody');

  document.getElementById('modalRegNumber').textContent = meta.regNumber;
  document.getElementById('modalSender').textContent = meta.senderName;
  document.getElementById('modalSummary').textContent =
    `Файлов: ${meta.totalFiles} · Общий размер: ${meta.totalSizeMb.toFixed(
      2,
    )} MB`;

  body.innerHTML = '';

  meta.files.forEach((f) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${f.index}</td>
      <td>${f.fileName}</td>
      <td>${f.sizeMb ? f.sizeMb.toFixed(2) + ' MB' : '—'}</td>
      <td>${f.docNumber}</td>
      <td>${f.docDate}</td>
      <td>${f.docCode} / ${f.docType}</td>
    `;
    body.appendChild(tr);
  });

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePreviewModal() {
  const overlay = document.getElementById('xmlModalOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

const closeBtn = document.getElementById('modalCloseBtn');
if (closeBtn) closeBtn.onclick = closePreviewModal;

document.getElementById('modalCloseFooterBtn').onclick = closePreviewModal;

document.getElementById('xmlModalOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'xmlModalOverlay') closePreviewModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePreviewModal();
});
document.getElementById('modalDownloadBtn').onclick = async () => {
  if (!currentPreviewZip) return;

  const blob = await currentPreviewZip.generateAsync({ type: 'blob' });
  await saveZipCrossBrowser(blob, `${currentPreviewRegNumber}.zip`);
};
