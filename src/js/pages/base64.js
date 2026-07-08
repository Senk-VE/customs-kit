let currentPreviewZip = null;
let currentPreviewRegNumber = null;
let xmlDataCache = [];

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('xmlInput');
  const parseBtn = document.getElementById('parseBtn');
  const clearBtn = document.getElementById('clearBtn');
  const resultDiv = document.getElementById('resultXml');

  if (!input || !parseBtn || !resultDiv) return;

  createProgressBar();

  // initial UI state
  toggleDownloadAllButton();

  // ===== DRAG & DROP =====
  const dropZone = document.querySelector('.container_02');

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');

      if (!e.dataTransfer?.files?.length) return;

      const dt = new DataTransfer();
      for (const file of e.dataTransfer.files) {
        dt.items.add(file);
      }

      input.files = dt.files;

      toggleDownloadAllButton();
      extractFileFromXmlWithProgress();
    });
  }

  input.addEventListener('change', () => {
    toggleDownloadAllButton();
    extractFileFromXmlWithProgress();
  });

  parseBtn.addEventListener('click', downloadAllAsOneZipWithProgress);

  // ===== CLEAR BUTTON =====
  clearBtn?.addEventListener('click', () => {
    input.value = '';

    xmlDataCache = [];
    resultDiv.innerHTML = '';

    hideProgress();

    currentPreviewZip = null;
    currentPreviewRegNumber = null;

    closePreviewModal();

    toggleDownloadAllButton();
  });

  // ===== CLICK HANDLER =====
  resultDiv.addEventListener('click', async (e) => {
    const itemEl = e.target.closest('[data-index]');
    if (!itemEl) return;

    const index = itemEl.dataset.index;
    const item = xmlDataCache[index];
    if (!item) return;

    const previewBtn = e.target.closest('.icon-preview');
    const downloadBtn = e.target.closest('.icon-download');

    if (previewBtn) {
      currentPreviewZip = item.zip;
      currentPreviewRegNumber = item.regNumber;
      openPreviewModal(item.packageMeta);
    }

    if (downloadBtn) {
      try {
        const blob = await item.zip.generateAsync({ type: 'blob' });
        await saveZipCrossBrowser(blob, `${item.regNumber}.zip`);
      } catch (e) {
        console.error(e);
      }
    }
  });
});

// ================= PROGRESS =================

function createProgressBar() {
  const container = document.querySelector('.container_02');
  if (!container) return;

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

  if (!wrapper || !bar || !label) return;

  wrapper.style.display = 'block';
  label.textContent = text;
  bar.style.width = `${percent}%`;
}

function hideProgress() {
  const el = document.getElementById('progressWrapper');
  if (el) el.style.display = 'none';
}

// ================= UI =================

function toggleDownloadAllButton() {
  const input = document.getElementById('xmlInput');
  const parseBtn = document.getElementById('parseBtn');
  const clearBtn = document.getElementById('clearBtn');

  if (!input || !parseBtn || !clearBtn) return;

  const hasFiles = input.files.length > 0;

  parseBtn.style.display = hasFiles ? 'inline-block' : 'none';
  clearBtn.style.display = hasFiles ? 'inline-block' : 'none';
}

// ================= XML =================

function sanitizeName(name) {
  return name.replace(/[\\/:*?"<>|]/g, '-').trim();
}

async function extractPdfFromXml(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  const regNumber =
    xmlDoc.getElementsByTagName('RegNumber')[0]?.textContent || 'XML';

  const sender =
    xmlDoc.getElementsByTagName('Sender')[0]?.getElementsByTagName('Name')[0]
      ?.textContent || '—';

  const documents = xmlDoc.getElementsByTagName('Document');

  let totalSize = 0;
  const files = [];

  for (let i = 0; i < documents.length; i++) {
    const d = documents[i];

    const size = parseFloat(
      d.getElementsByTagName('Size')[0]?.textContent || 0,
    );
    totalSize += size;

    files.push({
      index: i + 1,
      name: d.getElementsByTagName('Name')[0]?.textContent || '—',
      size,
      docNumber: d.getElementsByTagName('DocNumber')[0]?.textContent || '—',
      docDate: d.getElementsByTagName('DocDate')[0]?.textContent || '—',
      docCode: d.getElementsByTagName('DocCode')[0]?.textContent || '—',
      docType: d.getElementsByTagName('DocType')[0]?.textContent || '—',
    });
  }

  const zip = new JSZip();
  const used = new Set();

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

      for (const f of Object.values(innerZip.files)) {
        if (f.dir) continue;

        const blob = await f.async('blob');
        let name = f.name.split('/').pop();

        if (used.has(name)) name = `${Date.now()}_${name}`;
        used.add(name);

        zip.file(name, blob);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return {
    zip,
    regNumber,
    sender,
    packageMeta: {
      regNumber,
      sender,
      totalSize,
      files,
    },
  };
}

// ================= LOAD =================

async function extractFileFromXmlWithProgress() {
  const input = document.getElementById('xmlInput');
  const resultDiv = document.getElementById('resultXml');

  if (!input || !resultDiv) return;

  resultDiv.innerHTML = '';
  xmlDataCache = [];

  const files = input.files;
  if (!files.length) return;

  for (let i = 0; i < files.length; i++) {
    showProgress(
      `Обработка ${i + 1}/${files.length}`,
      ((i + 1) / files.length) * 100,
    );

    const xmlText = await files[i].text();
    const { zip, regNumber, sender, packageMeta } =
      await extractPdfFromXml(xmlText);

    const block = document.createElement('div');
    block.dataset.index = i;

    block.innerHTML = `
<div class="xml-output">
  
  <div class="xml-text">
    <div class="xml-reg">${regNumber}</div>
    <div class="xml-sender">${sender}</div>
  </div>

  <div class="xml-actions">
    <span class="icon-wrapper" title="Скачать">
<img src="/customs-kit/download.png" class="icon-btn icon-download">
    <span class="icon-wrapper" title="Просмотр">
<img src="/customs-kit/zoom.png" class="icon-btn icon-preview">    
</span>
  </div>

</div>    `;

    resultDiv.appendChild(block);

    xmlDataCache[i] = {
      zip,
      regNumber,
      packageMeta,
    };
  }

  showProgress('Готово', 100);
}

// ================= DOWNLOAD ALL =================

async function downloadAllAsOneZipWithProgress() {
  const input = document.getElementById('xmlInput');
  if (!input?.files.length) return;

  const master = new JSZip();

  for (let i = 0; i < input.files.length; i++) {
    showProgress(
      `Архив ${i + 1}/${input.files.length}`,
      ((i + 1) / input.files.length) * 100,
    );

    const xmlText = await input.files[i].text();
    const { zip, regNumber } = await extractPdfFromXml(xmlText);

    const folder = sanitizeName(regNumber);
    const content = await zip.generateAsync({ type: 'uint8array' });

    const inner = await JSZip.loadAsync(content);

    for (const [name, file] of Object.entries(inner.files)) {
      if (!file.dir) {
        const blob = await file.async('blob');
        master.file(`${folder}/${name}`, blob);
      }
    }
  }

  showProgress('Скачивание...', 100);

  const blob = await master.generateAsync({ type: 'blob' });

  await saveZipCrossBrowser(
    blob,
    `xml_${new Date().toISOString().slice(0, 10)}.zip`,
  );
}

// ================= SAVE =================

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
    } catch (e) {
      if (e.name === 'AbortError') return;
      console.error(e);
      return;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ================= MODAL =================

function openPreviewModal(meta) {
  const overlay = document.getElementById('xmlModalOverlay');
  const body = document.getElementById('modalFilesBody');

  if (!overlay || !body) return;

  document.getElementById('modalRegNumber').textContent = meta.regNumber;
  document.getElementById('modalSender').textContent = meta.sender;

  document.getElementById('modalSummary').textContent =
    `Файлов: ${meta.files.length} · Общий размер: ${meta.totalSize.toFixed(2)} MB`;

  body.innerHTML = '';

  meta.files.forEach((f) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${f.index}</td>
      <td>${f.name}</td>
      <td>${f.size.toFixed(2)} MB</td>
      <td>${f.docNumber}</td>
      <td>${f.docDate}</td>
      <td>${f.docCode} - ${f.docType}</td>
    `;

    body.appendChild(tr);
  });

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePreviewModal() {
  const overlay = document.getElementById('xmlModalOverlay');
  if (!overlay) return;

  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

document
  .getElementById('modalCloseFooterBtn')
  ?.addEventListener('click', closePreviewModal);

document
  .getElementById('modalDownloadBtn')
  ?.addEventListener('click', async () => {
    if (!currentPreviewZip) return;

    const blob = await currentPreviewZip.generateAsync({ type: 'blob' });
    await saveZipCrossBrowser(blob, `${currentPreviewRegNumber}.zip`);
  });

document.getElementById('xmlModalOverlay')?.addEventListener('click', (e) => {
  if (e.target.id === 'xmlModalOverlay') closePreviewModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePreviewModal();
});
