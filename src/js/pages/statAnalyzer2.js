// =====================================
// SD XML Analyzer
// Customs Kit
// =====================================

console.log('SD XML Analyzer started');

// -------------------------
// Elements
// -------------------------

const xmlInput = document.getElementById('xmlInput');
const analyzeBtn = null;
const clearBtn = document.getElementById('clearBtn');
const resultContainer = document.getElementById('resultXml');
const dropArea = document.querySelector('.container_02');

// -------------------------
// Data
// -------------------------

let selectedFiles = [];
let declaration = null;
let declarations = [];
let progressWrapper = null;

function showProgress(text, value) {
  const wrapper = document.getElementById('progressWrapper');
  const textBox = document.getElementById('progressText');
  const bar = document.getElementById('progressBar');
  if (!wrapper || !textBox || !bar) return;
  wrapper.style.display = 'block';
  textBox.textContent = text;
  bar.style.width = value + '%';
}
function hideProgress() {
  const wrapper = document.getElementById('progressWrapper');
  if (wrapper) {
    setTimeout(() => {
      wrapper.style.display = 'none';
    }, 1500);
  }
}

// -------------------------
// File Select
// -------------------------

xmlInput.addEventListener('change', async () => {
  selectedFiles = [...xmlInput.files];
  if (!selectedFiles.length) return;
  declarations = [];
  declaration = null;
  resultContainer.innerHTML = '';
  for (let i = 0; i < selectedFiles.length; i++) {
    showProgress(
      `Обработка ${i + 1}/${selectedFiles.length}`,
      ((i + 1) / selectedFiles.length) * 100,
    );
    const text = await selectedFiles[i].text();
    startAnalyze(text);
  }
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.style.display = 'flex';
  }
  showProgress('Готово', 100);
  setTimeout(() => {
    hideProgress();
  }, 1500);
});

// -------------------------
// Drag & Drop
// -------------------------

['dragenter', 'dragover'].forEach((eventName) => {
  dropArea.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropArea.classList.add('drag-over');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  dropArea.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropArea.classList.remove('drag-over');
  });
});

dropArea.addEventListener('drop', (event) => {
  const file = event.dataTransfer.files[0];
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.xml')) {
    alert('Выберите XML файл.');
    return;
  }
  setSelectedFile(file);
});

// -------------------------
// Clear
// -------------------------

clearBtn?.addEventListener('click', clearPage);

// -------------------------
// Helpers
// -------------------------

function setSelectedFiles(files) {
  analyzeBtn.style.display = 'inline-block';
  clearBtn.style.display = 'inline-block';
  resultContainer.innerHTML = `
    <div class="xml-result-card">
        <h3>
            Выбрано XML файлов:
            ${files.length}
        </h3>
        <p>
            Готово к анализу
        </p>
    </div>
    `;
}

function clearPage() {
  selectedFiles = [];
  declarations = [];
  declaration = null;
  xmlInput.value = '';
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.style.display = 'none';
  }
  const exportAllExcelBtn = document.getElementById('exportAllExcelBtn');
  const exportZipExcelBtn = document.getElementById('exportZipExcelBtn');
  if (exportAllExcelBtn) {
    exportAllExcelBtn.style.display = 'none';
  }
  if (exportZipExcelBtn) {
    exportZipExcelBtn.style.display = 'none';
  }
  resultContainer.innerHTML = '';
  const progressWrapper = document.getElementById('progressWrapper');
  if (progressWrapper) {
    progressWrapper.style.display = 'none';
  }
} // XML PARSER
// =====================================

function startAnalyze(xmlText) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'application/xml');
  const parserError = xml.querySelector('parsererror');
  if (parserError) {
    alert('XML содержит ошибки.');
    return;
  }
  declaration = {
    company: '',
    totalGoods: 0,
    invoiceTotal: 0,
    invoiceCurrency: '',
    statisticTotal: 0,
    goods: [],
  };
  readDeclaration(xml);
  declarations.push({ ...declaration });
  renderDeclarationCard();
}

// =====================================

function readDeclaration(xml) {
  declaration.company = getValue(xml, 'ShortName');
  declaration.totalGoods = toNumber(getValue(xml, 'TotalGoodsNumber'));
  const goods = findAll(xml, 'Stat_CUGoods');
  goods.forEach((node) => {
    declaration.goods.push(readGood(node));
  });
  calculateTotals();
}
// =====================================

function readGood(node) {
  return {
    number: getValue(node, 'GoodsNumeric'),
    code: getValue(node, 'GoodsTNVEDCode'),
    description: getValue(node, 'GoodsDescription'),
    liabilityDate: getValue(node, 'LiabilityDate'),
    invoice: toNumber(getValue(node, 'InvoicedCost')),
    currency: getValue(node, 'CurrencyCode'),
    statistic: toNumber(getValue(node, 'StatisticValueAmount')),
    net: toNumber(getValue(node, 'NetWeightQuantity')),
    net2: toNumber(getValue(node, 'NetWeightQuantity2')),
    gross: toNumber(getValue(node, 'GrossWeightQuantity')),
    quantity: toNumber(getValue(node, 'GoodsQuantity')),
    unit: getValue(node, 'MeasureUnitQualifierName'),
    dispatchCountry: getValue(node, 'DispatchCountryName'),
    originCountry: getValue(node, 'OriginCountryName'),
    destinationCountry: getValue(node, 'DestinationCountryName'),
    documents: readDocuments(node),
  };
}

function readDocuments(node) {
  const documents = findAll(node, 'PresentedDocuments');
  if (!documents.length) {
    return '';
  }
  return documents
    .map((doc) => {
      const number = getValue(doc, 'PrDocumentNumber');
      const date = getValue(doc, 'PrDocumentDate');
      const code = getValue(doc, 'PresentedDocumentModeCode');
      return `${number} от ${date} (${code})`;
    })
    .join('\n');
}
// =====================================

function calculateTotals() {
  declaration.invoiceTotal = 0;
  declaration.statisticTotal = 0;
  declaration.goods.forEach((good) => {
    declaration.invoiceTotal += good.invoice;
    declaration.statisticTotal += good.statistic;
    if (!declaration.invoiceCurrency) {
      declaration.invoiceCurrency = good.currency;
    }
  });
}

// =====================================
// XML Helpers
// =====================================

function findAll(parent, tagName) {
  return [...parent.getElementsByTagName('*')].filter(
    (node) => node.localName === tagName,
  );
}

// =====================================

function find(parent, tagName) {
  return [...parent.getElementsByTagName('*')].find(
    (node) => node.localName === tagName,
  );
}

// =====================================

function getValue(parent, tagName) {
  const node = find(parent, tagName);
  if (!node) return '';
  return node.textContent.trim();
}

// =====================================

function toNumber(value) {
  if (!value) return 0;
  value = value.replace(',', '.');
  const number = Number(value);
  if (isNaN(number)) return 0;
  return number;
}

// =====================================

function format(value) {
  return Number(value).toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// =====================================
// DECLARATION CARD
// =====================================

function renderDeclarationCard() {
  const resultContainer = document.getElementById('resultXml');
  if (!resultContainer) return;
  const exportAllExcelBtn = document.getElementById('exportAllExcelBtn');
  const exportZipExcelBtn = document.getElementById('exportZipExcelBtn');
  if (exportAllExcelBtn && exportZipExcelBtn) {
    if (declarations.length > 1) {
      exportAllExcelBtn.style.display = 'flex';
      exportZipExcelBtn.style.display = 'flex';
    } else {
      exportAllExcelBtn.style.display = 'none';
      exportZipExcelBtn.style.display = 'none';
    }
  }
  resultContainer.innerHTML = '';
  declarations.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'xml-output';
    card.innerHTML = `
<div class="xml-text">
<div class="xml-reg">
${escapeHtml(item.company || 'Субъект не найден')}
</div>
<div class="xml-sender">
Количество товаров:
${item.goods.length}
<br>
Фактурная стоимость:
${format(item.invoiceTotal)}
${item.invoiceCurrency}
<br>
Статистическая стоимость:
${format(item.statisticTotal)}
USD
</div>
</div>
<div class="xml-actions">
<span class="icon-wrapper" title="Скачать Excel">
<img src="/customs-kit/download.png" class="icon-btn icon-download" data-index="${index}" data-action="download">
</span>
<span class="icon-wrapper" title="Просмотр">
<img src="/customs-kit/zoom.png" class="icon-btn icon-preview" data-index="${index}" data-action="open">
</span>
</div>
`;
    resultContainer.appendChild(card);
  });
  initCardButtons();
  initExportButtons();
}

function initExportButtons() {
  const exportAllExcelBtn = document.getElementById('exportAllExcelBtn');
  const exportZipExcelBtn = document.getElementById('exportZipExcelBtn');

  if (exportAllExcelBtn) {
    exportAllExcelBtn.onclick = () => {
      downloadAllExcel();
    };
  }

  if (exportZipExcelBtn) {
    exportZipExcelBtn.onclick = () => {
      downloadSeparateExcelZip();
    };
  }
}
// CARD BUTTONS
// =====================================

function initCardButtons() {
  const downloadButtons = document.querySelectorAll('[data-action="download"]');
  const openButtons = document.querySelectorAll('[data-action="open"]');
  downloadButtons.forEach((btn) => {
    btn.onclick = () => {
      const index = Number(btn.dataset.index);
      declaration = declarations[index];
      downloadExcel();
    };
  });
  openButtons.forEach((btn) => {
    btn.onclick = () => {
      const index = Number(btn.dataset.index);
      declaration = declarations[index];
      openGoodsModal();
    };
  });
}

// =====================================
// OPEN MODAL
// =====================================

function openGoodsModal() {
  if (!declaration) return;
  const overlay = document.getElementById('xmlModalOverlay');
  const company = document.getElementById('modalCompany');
  const count = document.getElementById('modalGoodsCount');
  const summary = document.getElementById('modalSummary');
  if (!overlay) return;
  company.textContent = declaration.company || '';
  count.textContent = `Товаров: ${declaration.goods.length}`;
  summary.textContent = `${format(declaration.invoiceTotal)} ${declaration.invoiceCurrency} | ${format(declaration.statisticTotal)} USD`;
  renderGoods();
  overlay.classList.add('active');
}

function initModalButtons() {
  const closeBtn = document.getElementById('modalCloseFooterBtn');
  const downloadBtn = document.getElementById('modalDownloadBtn');
  const overlay = document.getElementById('xmlModalOverlay');

  if (closeBtn) {
    closeBtn.onclick = () => {
      overlay.classList.remove('active');
    };
  }

  if (downloadBtn) {
    downloadBtn.onclick = () => {
      downloadExcel();
    };
  }

  if (overlay) {
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    };
  }
}

initModalButtons();

// =====================================
// CLOSE MODAL
// =====================================

document
  .getElementById('modalCloseFooterBtn')
  ?.addEventListener('click', () => {
    document.getElementById('xmlModalOverlay').classList.remove('active');
  });

// =====================================
// SECURITY
// =====================================

function escapeHtml(value) {
  if (!value) return '';
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// =====================================
// GOODS CALCULATIONS
// =====================================

function calculateGoodsMetrics(good) {
  return {
    // Фактурная стоимость / кг нетто
    invoiceNet: safeDivide(good.invoice, good.net),
    // Фактурная стоимость / кг нетто без упаковки
    invoiceNet2: safeDivide(good.invoice, good.net2),
    // Статистическая стоимость / кг нетто
    statisticNet: safeDivide(good.statistic, good.net),
    // Статистическая стоимость / кг нетто без упаковки
    statisticNet2: safeDivide(good.statistic, good.net2),
    // кг нетто / единица
    netPerUnit: safeDivide(good.net, good.quantity),
    // кг нетто без упаковки / единица
    net2PerUnit: safeDivide(good.net2, good.quantity),
  };
}

// =====================================
// SAFE DIVISION
// =====================================

function safeDivide(value1, value2) {
  if (!value1 || !value2 || value2 === 0) {
    return null;
  }
  return Number(value1 / value2).toFixed(2);
}

// =====================================
// METRICS HTML
// =====================================

function createMetricsHtml(good) {
  const metrics = calculateGoodsMetrics(good);
  return `
<div class="goods-calculations">
<h4>
Контрольные расчеты
</h4>
<p>
Фактурная стоимость / кг нетто:
<strong>
${metrics.invoiceNet ? metrics.invoiceNet + ' ' + good.currency + '/кг' : '-'}
</strong>
</p>
<p>
Фактурная стоимость / кг нетто без упаковки:
<strong>
${metrics.invoiceNet2 ? metrics.invoiceNet2 + ' ' + good.currency + '/кг' : '-'}
</strong>
</p>
<p>
Статистическая стоимость / кг нетто:
<strong>
${metrics.statisticNet ? metrics.statisticNet + ' USD/кг' : '-'}
</strong>
</p>
<p>
Статистическая стоимость / кг нетто без упаковки:
<strong>
${metrics.statisticNet2 ? metrics.statisticNet2 + ' USD/кг' : '-'}
</strong>
</p>
<p>
Вес нетто / единица:
<strong>
${metrics.netPerUnit ? metrics.netPerUnit + ' кг/' + good.unit : '-'}
</strong>
</p>
<p>
Вес нетто без упаковки / единица:
<strong>
${metrics.net2PerUnit ? metrics.net2PerUnit + ' кг/' + good.unit : '-'}
</strong>
</p>
</div>
`;
}

// =====================================
// GOODS MODAL RENDER
// =====================================

function renderGoods() {
  const container = document.getElementById('modalGoodsBody');
  if (!container) return;
  const differentNet = declaration.goods.some(
    (good) => Number(good.net) !== Number(good.net2),
  );
  let header = `
    <tr>
      <th>№</th>
      <th>Наименование</th>
      <th>Нетто / ед.</th>
      <th>Факт. стоимость / кг</th>
      <th>Стат. стоимость / кг</th>
      ${
        differentNet
          ? `
            <th>Нетто 2 / ед.</th>

            <th>Факт. стоимость / кг Н2</th>

            <th>Стат. стоимость / кг Н2</th>
          `
          : ''
      }
    </tr>
  `;
  let rows = declaration.goods
    .map((good, index) => {
      const net1 = Number(good.net) || 0;
      const net2 = Number(good.net2) || 0;
      const invoice = Number(good.invoice) || 0;
      const statistic = Number(good.statistic) || 0;
      const quantity = Number(good.quantity) || 0;
      const netPerUnit = quantity && net1 ? (net1 / quantity).toFixed(2) : '-';
      const invoicePerKg = net1 ? (invoice / net1).toFixed(2) : '-';
      const statisticPerKg = net1 ? (statistic / net1).toFixed(2) : '-';
      const net2PerUnit = quantity && net2 ? (net2 / quantity).toFixed(2) : '-';
      const invoicePerKgNet2 = net2 ? (invoice / net2).toFixed(2) : '-';
      const statisticPerKgNet2 = net2 ? (statistic / net2).toFixed(2) : '-';
      return `
        <tr>
          <td>
            ${escapeHtml(good.number || index + 1)}
          </td>
          <td>
            ${escapeHtml(good.description || '')}
          </td>
          <td>
            ${netPerUnit}
            кг/${escapeHtml(good.unit || '')}
          </td>
          <td>
            ${invoicePerKg}
            ${escapeHtml(good.currency || '')}/кг
          </td>
          <td>
            ${statisticPerKg}
            USD/кг
          </td>
          ${
            differentNet
              ? `
                <td>
                  ${net2PerUnit}
                  кг/${escapeHtml(good.unit || '')}
                </td>
                <td>
                  ${invoicePerKgNet2}
                  ${escapeHtml(good.currency || '')}/кг
                </td>
                <td>
                  ${statisticPerKgNet2}
                  USD/кг
                </td>
              `
              : ''
          }
        </tr>
      `;
    })
    .join('');
  container.innerHTML = `
    <table class="files-table">
      <thead>
        ${header}
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}
// =====================================
// MODAL CONTROL
// =====================================

function closeModal() {
  const overlay = document.getElementById('xmlModalOverlay');
  if (!overlay) return;
  overlay.classList.remove('active');
}

// =====================================
// FOOTER CLOSE BUTTON
// =====================================

document
  .getElementById('modalCloseFooterBtn')
  ?.addEventListener('click', closeModal);

// =====================================
// CLICK OUTSIDE MODAL
// =====================================

document
  .getElementById('xmlModalOverlay')
  ?.addEventListener('click', (event) => {
    if (event.target.id === 'xmlModalOverlay') {
      closeModal();
    }
  });

// =====================================
// ESC CLOSE
// =====================================

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

// =====================================
// DOWNLOAD PLACEHOLDER
// =====================================

document.getElementById('downloadBtn')?.addEventListener('click', () => {
  alert('Экспорт данных будет добавлен позже.');
});

// =====================================
// SAFE FORMAT
// =====================================

function safeText(value) {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  return value;
}

// =====================================
// CHECK DECLARATION
// =====================================

function validateDeclaration() {
  if (!declaration) {
    alert('XML еще не обработан.');
    return false;
  }
  if (declaration.goods.length === 0) {
    alert('В XML не найдены товары.');
    return false;
  }
  return true;
}
function downloadExcel() {
  if (!declaration || !declaration.goods.length) {
    return;
  }
  const rows = declaration.goods.map((good, index) => {
    return {
      Организация: declaration.company || '',
      '№ товара': good.number || index + 1,
      'Код ТН ВЭД': good.code || '',
      Наименование: good.description || '',
      'Отгрузка (поступление)': formatExcelDate(good.liabilityDate),
      'Вес нетто': good.net,
      'Вес нетто 2': good.net2,
      'Вес брутто': good.gross,
      Количество: good.quantity,
      Единица: good.unit,
      Валюта: good.currency,
      'Фактурная стоимость': good.invoice,
      'Статистическая стоимость USD': good.statistic,
      'Страна отправления': good.dispatchCountry || '',
      'Страна происхождения': good.originCountry || '',
      'Страна назначения': good.destinationCountry || '',
      Документы: good.documents
        .map((doc) => `${doc.code} ${doc.number} ${formatExcelDate(doc.date)}`)
        .join('\n'),
    };
  });
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Stat_CUGoods');
  XLSX.writeFile(workbook, `${declaration.company || 'SD_XML'}_Excel.xlsx`);
}
