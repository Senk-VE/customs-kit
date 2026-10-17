function XmlPreviewModal({ item, onClose, onDownload }) {
  if (!item) return null;

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{item.regNumber}</div>

            <div className="modal-subtitle">{item.sender}</div>

            <div className="modal-summary">
              Файлов: {item.files?.length || 0}
              {' · '}
              Размер: {item.totalSize?.toFixed(2) || '0.00'} MB
            </div>
          </div>

          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <table className="files-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Имя файла</th>
                <th>Размер</th>
                <th>Номер документа</th>
                <th>Дата</th>
                <th>Код - тип</th>
              </tr>
            </thead>

            <tbody>
              {item.files?.map((file) => (
                <tr key={file.index}>
                  <td>{file.index}</td>

                  <td>{file.name}</td>

                  <td>{file.size?.toFixed(2)} MB</td>

                  <td>{file.docNumber}</td>

                  <td>{file.docDate}</td>

                  <td>
                    {file.docCode}
                    {' - '}
                    {file.docType}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-footer">
          <button
            className="modal-download-btn"
            onClick={() => onDownload(item)}
          >
            📦 Скачать ZIP
          </button>

          <button className="hidden-btn" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

export default XmlPreviewModal;
