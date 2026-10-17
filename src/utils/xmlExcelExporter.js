import * as XLSX from 'xlsx';

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

async function saveFile(blob, filename) {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: filename,
      types: [
        {
          description: 'Excel file',
          accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
              ['.xlsx'],
          },
        },
      ],
    });

    const writable = await handle.createWritable();

    await writable.write(blob);

    await writable.close();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Сохранение отменено пользователем');
      return;
    }

    console.error('Ошибка сохранения Excel:', error);
  }
}

function createRows(data) {
  return data.goods.map((good, index) => {
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
      row[`Код документа ${i + 1}`] = doc.code || '';
      row[`Номер документа ${i + 1}`] = doc.number || '';
      row[`Дата документа ${i + 1}`] = formatExcelDate(doc.date);
    });

    return row;
  });
}

function createWorkbook(rows) {
  const worksheet = XLSX.utils.json_to_sheet(rows);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Stat_CUGoods');

  return workbook;
}

export async function downloadExcel(data) {
  if (!data?.goods?.length) return;

  const rows = createRows(data);

  const workbook = createWorkbook(rows);

  const buffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  await saveFile(blob, `${data.company || 'SD_XML'}.xlsx`);
}

export async function downloadAllExcel(declarations) {
  if (!declarations.length) return;

  const rows = [];

  declarations.forEach((data) => {
    rows.push(...createRows(data));
  });

  const workbook = createWorkbook(rows);

  const buffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  await saveFile(blob, 'Stat_CUGoods_All.xlsx');
}
