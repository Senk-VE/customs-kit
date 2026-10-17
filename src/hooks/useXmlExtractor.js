import { useState } from 'react';
import xmlParser from '../utils/xmlParser';
import JSZip from 'jszip';

function useXmlExtractor() {
  const [files, setFiles] = useState([]);
  const [xmlData, setXmlData] = useState([]);
  const [selectedPreview, setSelectedPreview] = useState(null);

  const [progress, setProgress] = useState({
    visible: true,
    text: 'Нет загруженных файлов',
    percent: 0,
  });

  async function saveFile(blob, filename) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'ZIP archive',
            accept: {
              'application/zip': ['.zip'],
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

      console.error('Ошибка сохранения файла:', error);
    }
  }

  async function handleFilesSelected(selectedFiles) {
    setFiles(selectedFiles);

    const result = [];

    setProgress({
      visible: true,
      text: 'Подготовка файлов...',
      percent: 0,
    });

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      setProgress({
        visible: true,
        text: `Обработка ${i + 1}/${selectedFiles.length}`,
        percent: ((i + 1) / selectedFiles.length) * 100,
      });

      try {
        const xml = await xmlParser(file);

        console.log('Обработан XML:', xml);

        result.push(xml);
      } catch (error) {
        console.error('Ошибка XML:', error);
      }
    }

    setXmlData(result);

    setProgress({
      visible: true,
      text: `Обработано файлов: ${result.length}`,
      percent: 100,
    });
  }

  async function handleDownload(item) {
    try {
      const blob = await item.zip.generateAsync({
        type: 'blob',
      });

      await saveFile(blob, `${item.regNumber}.zip`);
    } catch (error) {
      console.error('Ошибка скачивания:', error);
    }
  }

  async function handleDownloadAll() {
    try {
      const masterZip = new JSZip();

      for (let i = 0; i < xmlData.length; i++) {
        const item = xmlData[i];

        const content = await item.zip.generateAsync({
          type: 'uint8array',
        });

        const innerZip = await JSZip.loadAsync(content);

        const folderName = `declaration_${i + 1}_${item.regNumber.replaceAll(
          '/',
          '-',
        )}`;

        const folder = masterZip.folder(folderName);

        for (const [name, file] of Object.entries(innerZip.files)) {
          if (!file.dir) {
            const blob = await file.async('blob');

            const cleanName = name.split('/').pop();

            folder.file(cleanName, blob);
          }
        }
      }

      const blob = await masterZip.generateAsync({
        type: 'blob',
      });

      await saveFile(blob, `xml_documents_${Date.now()}.zip`);
    } catch (error) {
      console.error('Ошибка общего архива:', error);
    }
  }

  function handleClear() {
    setFiles([]);

    setXmlData([]);

    setSelectedPreview(null);

    setProgress({
      visible: true,
      text: 'Нет загруженных файлов',
      percent: 0,
    });
  }

  function openPreview(item) {
    setSelectedPreview(item);
  }

  function closePreview() {
    setSelectedPreview(null);
  }

  return {
    files,
    xmlData,
    selectedPreview,
    progress,

    handleFilesSelected,
    handleDownload,
    handleDownloadAll,
    handleClear,

    openPreview,
    closePreview,
  };
}

export default useXmlExtractor;
