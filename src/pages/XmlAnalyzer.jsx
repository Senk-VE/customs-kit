import { useState } from 'react';
import ContentPanel from '../components/Layout/ContentPanel';
import FileUpload from '../components/UI/FileUpload';
import XmlDeclarationCard from '../components/XmlAnalyzer/XmlDeclarationCard';
import XmlGoodsModal from '../components/XmlAnalyzer/XmlGoodsModal';
import useXmlAnalyzer from '../hooks/useXmlAnalyzer';
import { downloadExcel, downloadAllExcel } from '../utils/xmlExcelExporter';

function XmlAnalyzer() {
  const {
    declarations,
    currentDeclaration,
    modalOpen,
    handleFiles,
    openModal,
    closeModal,
    clearAnalyzer,
  } = useXmlAnalyzer();

  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e) {
    e.preventDefault();

    const droppedFiles = [...e.dataTransfer.files].filter((file) =>
      file.name.toLowerCase().endsWith('.xml'),
    );

    if (droppedFiles.length) {
      handleFiles(droppedFiles);
    }
  }

  return (
    <div className="xml-results">
      <ContentPanel
        className={dragOver ? 'drag-over-panel' : ''}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => {
          setDragOver(false);
        }}
        onDrop={(e) => {
          setDragOver(false);
          handleDrop(e);
        }}
      >
        <h1>Контроль данных СД XML</h1>

        <p className="desktop-hint">
          Выберите или перетащите XML статистической декларации
        </p>

        <div className="button-container">
          <FileUpload multiple onFilesSelected={handleFiles} />

          <button
            className="export-btn"
            type="button"
            disabled={!declarations.length}
            onClick={() => downloadAllExcel(declarations)}
          >
            📄 Скачать все в общий Excel
          </button>

          <button
            className="hidden-btn"
            type="button"
            disabled={!declarations.length}
            onClick={clearAnalyzer}
          >
            Очистить
          </button>
        </div>

        <div className="xml-progress-slot">
          <div className="xml-progress">
            <div className="xml-progress-text">
              {declarations.length
                ? `Обработано файлов: ${declarations.length}`
                : 'Нет загруженных деклараций'}
            </div>

            <div className="xml-progress-track">
              <div
                className="xml-progress-bar"
                style={{
                  width: declarations.length ? '100%' : '0%',
                }}
              />
            </div>
          </div>
        </div>
      </ContentPanel>

      <div className="xml-extractor-results">
        {declarations.map((declaration, index) => (
          <XmlDeclarationCard
            key={index}
            declaration={declaration}
            index={index}
            onOpen={() => openModal(declaration)}
            onDownload={() => downloadExcel(declaration)}
          />
        ))}
      </div>

      {modalOpen && (
        <XmlGoodsModal
          declaration={currentDeclaration}
          onClose={closeModal}
          onDownload={downloadExcel}
        />
      )}
    </div>
  );
}

export default XmlAnalyzer;
