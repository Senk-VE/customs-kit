console.log('SD XML Analyzer started');

let selectedFiles = [];
let declarations = [];
let currentDeclaration = null;

const xmlInput = document.getElementById('xmlInput');
const resultContainer = document.getElementById('resultXml');

const clearBtn = document.getElementById('clearBtn');
const exportAllExcelBtn = document.getElementById('exportAllExcelBtn');
const exportZipExcelBtn = document.getElementById('exportZipExcelBtn');

if (xmlInput) {
  xmlInput.addEventListener('change', async () => {
    selectedFiles = [...xmlInput.files];

    if (!selectedFiles.length) return;

    if (clearBtn) {
      clearBtn.style.display = 'flex';
    }

    if (exportAllExcelBtn) {
      exportAllExcelBtn.style.display = 'flex';
    }

    if (exportZipExcelBtn) {
      exportZipExcelBtn.style.display = 'flex';
    }

    declarations = [];
    resultContainer.innerHTML = '';

    for (let i = 0; i < selectedFiles.length; i++) {
      showProgress(
        `Обработка ${i + 1}/${selectedFiles.length}`,
        ((i + 1) / selectedFiles.length) * 100,
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      const text = await selectedFiles[i].text();

      await startAnalyze(text);
    }

    showProgress('Готово', 100);
  });
}

if (clearBtn) {
  clearBtn.onclick = () => {
    clearPage();
  };
}
function startAnalyze(xmlText) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'application/xml');
  const parserError = xml.querySelector('parsererror');
  if (parserError) {
    alert('XML содержит ошибки');
    return;
  }
  currentDeclaration = {
    company: '',
    goods: [],
  };
  readDeclaration(xml);
  declarations.push({ ...currentDeclaration });
  renderDeclarationCards();
}

function readDeclaration(xml) {
  currentDeclaration.company = getValue(xml, 'ShortName');
  const goods = findAll(xml, 'Stat_CUGoods');
  goods.forEach((node) => {
    currentDeclaration.goods.push(readGood(node));
  });
}

function readGood(node) {
  return {
    number: getValue(node, 'GoodsNumeric'),
    code: getValue(node, 'GoodsTNVEDCode'),
    description: getValue(node, 'GoodsDescription'),
    liabilityDate: getValue(node, 'LiabilityDate'),
    net: getValue(node, 'NetWeightQuantity'),
    net2: getValue(node, 'NetWeightQuantity2'),
    gross: getValue(node, 'GrossWeightQuantity'),
    quantity: getValue(node, 'GoodsQuantity'),
    unit: getValue(node, 'MeasureUnitQualifierName'),
    invoice: getValue(node, 'InvoicedCost'),
    currency: getValue(node, 'CurrencyCode'),
    statistic: getValue(node, 'StatisticValueAmount'),
    dispatchCountry: getValue(node, 'DispatchCountryName'),
    originCountry: getValue(node, 'OriginCountryName'),
    destinationCountry: getValue(node, 'DestinationCountryName'),
    documents: readDocuments(node),
  };
}

function readDocuments(node) {
  const documents = [];
  const nodes = node.querySelectorAll('Document');
  nodes.forEach((doc) => {
    documents.push({
      code: getValue(doc, 'DocumentCode'),
      number: getValue(doc, 'DocumentNumber'),
      date: getValue(doc, 'DocumentDate'),
    });
  });
  return documents;
}

function renderDeclarationCards() {
  if (!resultContainer) return;
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
Количество товаров: ${item.goods.length}
</div>
</div>
<div class="xml-actions">
<span class="icon-wrapper" title="Скачать Excel">
<img src="/customs-kit/download.png" class="icon-btn icon-download" data-download="${index}">
</span>
<span class="icon-wrapper" title="Просмотр">
<img src="/customs-kit/zoom.png" class="icon-btn icon-preview" data-open="${index}">
</span>
</div>
`;

    resultContainer.appendChild(card);
  });

  initCardButtons();
  initExportButtons();
}

function initCardButtons() {
  const downloadButtons = document.querySelectorAll('[data-download]');
  const openButtons = document.querySelectorAll('[data-open]');

  downloadButtons.forEach((btn) => {
    btn.onclick = () => {
      const index = Number(btn.dataset.download);
      currentDeclaration = declarations[index];
      downloadExcel(currentDeclaration);
    };
  });

  openButtons.forEach((btn) => {
    btn.onclick = () => {
      const index = Number(btn.dataset.open);
      currentDeclaration = declarations[index];
      openGoodsModal();
    };
  });
}

function initExportButtons() {
  const exportAllExcelBtn = document.getElementById('exportAllExcelBtn');
  const exportZipExcelBtn = document.getElementById('exportZipExcelBtn');

  if (exportAllExcelBtn) {
    exportAllExcelBtn.style.display = declarations.length > 1 ? 'flex' : 'none';
    exportAllExcelBtn.onclick = () => {
      downloadAllExcel();
    };
  }

  if (exportZipExcelBtn) {
    exportZipExcelBtn.style.display = declarations.length > 1 ? 'flex' : 'none';
    exportZipExcelBtn.onclick = () => {
      downloadSeparateExcelZip();
    };
  }
}

function openGoodsModal() {
  if (!currentDeclaration) return;

  const overlay = document.getElementById('xmlModalOverlay');
  const company = document.getElementById('modalCompany');
  const count = document.getElementById('modalGoodsCount');
  const summary = document.getElementById('modalSummary');

  if (company) {
    company.textContent = currentDeclaration.company || '';
  }

  if (count) {
    count.textContent = `Товаров: ${currentDeclaration.goods.length}`;
  }

  if (summary) {
    summary.textContent = '';
  }

  renderGoods();

  if (overlay) {
    overlay.classList.add('active');
  }
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
      downloadExcel(currentDeclaration);
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

id = '0x4k9p';
function downloadExcel(data) {
  if (!data || !data.goods || !data.goods.length) {
    return;
  }

  const rows = data.goods.map((good, index) => {
    const row = {
      Организация: data.company || '',
      '№ товара': good.number || index + 1,
      'Код ТН ВЭД': good.code || '',
      Наименование: good.description || '',
      'Отгрузка (поступление)': formatExcelDate(good.liabilityDate),
      'Страна отправления': good.dispatchCountry || '',
      'Страна происхождения': good.originCountry || '',
      'Страна назначения': good.destinationCountry || '',
      'Вес нетто': good.net || '',
      'Вес нетто 2': good.net2 || '',
      'Вес брутто': good.gross || '',
      Количество: good.quantity || '',
      Единица: good.unit || '',
      Валюта: good.currency || '',
      'Фактурная стоимость': good.invoice || '',
      'Статистическая стоимость': good.statistic || '',
    };

    good.documents.forEach((doc, i) => {
      const num = i + 1;
      row[`Код документа ${num}`] = doc.code || '';
      row[`Номер документа ${num}`] = doc.number || '';
      row[`Дата документа ${num}`] = formatExcelDate(doc.date);
    });

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Stat_CUGoods');

  XLSX.writeFile(workbook, `${data.company || 'SD_XML'}.xlsx`);
}

function downloadAllExcel() {
  if (!declarations.length) return;

  const rows = [];

  declarations.forEach((data) => {
    data.goods.forEach((good, index) => {
      const row = {
        Организация: data.company || '',
        '№ товара': good.number || index + 1,
        'Код ТН ВЭД': good.code || '',
        Наименование: good.description || '',
        'Отгрузка (поступление)': formatExcelDate(good.liabilityDate),
        'Страна отправления': good.dispatchCountry || '',
        'Страна происхождения': good.originCountry || '',
        'Страна назначения': good.destinationCountry || '',
        'Вес нетто': good.net || '',
        'Вес нетто 2': good.net2 || '',
        'Вес брутто': good.gross || '',
        Количество: good.quantity || '',
        Единица: good.unit || '',
        Валюта: good.currency || '',
        'Фактурная стоимость': good.invoice || '',
        'Статистическая стоимость': good.statistic || '',
      };

      good.documents.forEach((doc, i) => {
        const num = i + 1;
        row[`Код документа ${num}`] = doc.code || '';
        row[`Номер документа ${num}`] = doc.number || '';
        row[`Дата документа ${num}`] = formatExcelDate(doc.date);
      });

      rows.push(row);
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Stat_CUGoods');

  XLSX.writeFile(workbook, 'Stat_CUGoods_All.xlsx');
}

function downloadSeparateExcelZip() {
  if (!declarations.length) return;

  const zip = new JSZip();

  declarations.forEach((data, index) => {
    const rows = data.goods.map((good, i) => {
      const row = {
        Организация: data.company || '',
        '№ товара': good.number || i + 1,
        'Код ТН ВЭД': good.code || '',
        Наименование: good.description || '',
        'Отгрузка (поступление)': formatExcelDate(good.liabilityDate),
        'Страна отправления': good.dispatchCountry || '',
        'Страна происхождения': good.originCountry || '',
        'Страна назначения': good.destinationCountry || '',
        'Вес нетто': good.net || '',
        'Вес нетто 2': good.net2 || '',
        'Вес брутто': good.gross || '',
        Количество: good.quantity || '',
        Единица: good.unit || '',
        Валюта: good.currency || '',
        'Фактурная стоимость': good.invoice || '',
        'Статистическая стоимость': good.statistic || '',
      };

      good.documents.forEach((doc, num) => {
        row[`Код документа ${num + 1}`] = doc.code || '';
        row[`Номер документа ${num + 1}`] = doc.number || '';
        row[`Дата документа ${num + 1}`] = formatExcelDate(doc.date);
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stat_CUGoods');

    const buffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const filename = `${data.company || 'SD_XML'}_${index + 1}.xlsx`;

    zip.file(filename, buffer);
  });

  zip.generateAsync({ type: 'blob' }).then((content) => {
    const now = new Date();
    const time =
      String(now.getHours()).padStart(2, '0') +
      '-' +
      String(now.getMinutes()).padStart(2, '0') +
      '-' +
      String(now.getSeconds()).padStart(2, '0');

    saveAs(content, `SD_XML_${time}.zip`);
  });
}

function formatExcelDate(date) {
  if (!date) return '';

  if (date.includes('.')) {
    return date;
  }

  const parts = date.split('-');

  if (parts.length !== 3) {
    return date;
  }

  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

function clearPage() {
  selectedFiles = [];
  declarations = [];
  currentDeclaration = null;

  if (xmlInput) {
    xmlInput.value = '';
  }

  if (resultContainer) {
    resultContainer.innerHTML = '';
  }

  const exportAllExcelBtn = document.getElementById('exportAllExcelBtn');
  const exportZipExcelBtn = document.getElementById('exportZipExcelBtn');

  if (exportAllExcelBtn) {
    exportAllExcelBtn.style.display = 'none';
  }

  if (exportZipExcelBtn) {
    exportZipExcelBtn.style.display = 'none';
  }

  if (clearBtn) {
    clearBtn.style.display = 'none';
  }

  const progressWrapper = document.getElementById('progressWrapper');

  if (progressWrapper) {
    progressWrapper.style.display = 'none';
  }
}

function showProgress(text, percent) {
  const wrapper = document.getElementById('progressWrapper');
  const progressText = document.getElementById('progressText');
  const progressBar = document.getElementById('progressBar');

  if (wrapper) {
    wrapper.style.display = 'block';
  }

  if (progressText) {
    progressText.textContent = text;
  }

  if (progressBar) {
    progressBar.style.width = `${percent}%`;
  }
}

function hideProgress() {
  const wrapper = document.getElementById('progressWrapper');

  if (wrapper) {
    wrapper.style.display = 'none';
  }
}

function getValue(node, tag) {
  const element = node.querySelector(tag);

  if (!element) {
    return '';
  }

  return element.textContent.trim();
}

function findAll(node, tag) {
  return Array.from(node.querySelectorAll(tag));
}

function escapeHtml(value) {
  if (!value) {
    return '';
  }

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function format(value) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  return Number(value).toLocaleString('ru-RU');
}

function toNumber(value) {
  if (!value) {
    return 0;
  }

  const number = String(value).replace(/\s/g, '').replace(',', '.');

  const result = Number(number);

  return isNaN(result) ? 0 : result;
}

function renderGoods() {
  const body = document.getElementById('modalGoodsBody');

  if (!body || !currentDeclaration) {
    return;
  }

  const differentNet = currentDeclaration.goods.some(
    (good) => Number(good.net) !== Number(good.net2),
  );

  const tableHead = document.querySelector('#modalGoodsHead tr');

  if (tableHead) {
    tableHead.innerHTML = `
      <th>№</th>
      <th>Наименование</th>
      <th>Нетто/ед.</th>
      <th>Факт./нетто</th>
      <th>Стат./нетто</th>
      ${
        differentNet
          ? `
            <th>Нетто2/ед.</th>
            <th>Факт./нетто2</th>
            <th>Стат./нетто2</th>
          `
          : ''
      }
    `;
  }

  body.innerHTML = '';

  currentDeclaration.goods.forEach((good, index) => {
    const net = Number(good.net) || 0;
    const net2 = Number(good.net2) || 0;
    const quantity = Number(good.quantity) || 0;
    const invoice = Number(good.invoice) || 0;
    const statistic = Number(good.statistic) || 0;

    const netPerUnit = quantity ? (net / quantity).toFixed(2) : '-';

    const invoicePerNet = net ? (invoice / net).toFixed(2) : '-';

    const statisticPerNet = net ? (statistic / net).toFixed(2) : '-';

    const net2Different = net !== net2;

    const net2PerUnit =
      net2Different && quantity ? (net2 / quantity).toFixed(2) : '—';

    const invoicePerNet2 =
      net2Different && net2 ? (invoice / net2).toFixed(2) : '—';

    const statisticPerNet2 =
      net2Different && net2 ? (statistic / net2).toFixed(2) : '—';

    body.innerHTML += `
      <tr>
        <td>${escapeHtml(good.number || index + 1)}</td>

        <td>
          ${escapeHtml(good.description || '')}
        </td>

        <td>
          ${netPerUnit}
          кг/${escapeHtml(good.unit || '')}
        </td>

        <td>
          ${invoicePerNet}
          ${escapeHtml(good.currency || '')}/кг
        </td>

        <td>
          ${statisticPerNet}
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
                ${invoicePerNet2}
                ${escapeHtml(good.currency || '')}/кг
              </td>

              <td>
                ${statisticPerNet2}
                USD/кг
              </td>
            `
            : ''
        }
      </tr>
    `;
  });
}
const modalCloseFooterBtn = document.getElementById('modalCloseFooterBtn');

if (modalCloseFooterBtn) {
  modalCloseFooterBtn.onclick = () => {
    const overlay = document.getElementById('xmlModalOverlay');

    if (overlay) {
      overlay.classList.remove('active');
    }
  };
}

const modalDownloadBtn = document.getElementById('modalDownloadBtn');

if (modalDownloadBtn) {
  modalDownloadBtn.onclick = () => {
    downloadExcel(currentDeclaration);
  };
}

window.addEventListener('DOMContentLoaded', () => {
  const exportAllExcelBtn = document.getElementById('exportAllExcelBtn');
  const exportZipExcelBtn = document.getElementById('exportZipExcelBtn');

  if (exportAllExcelBtn) {
    exportAllExcelBtn.style.display = 'none';
  }

  if (exportZipExcelBtn) {
    exportZipExcelBtn.style.display = 'none';
  }

  if (clearBtn) {
    clearBtn.style.display = 'none';
  }
});
