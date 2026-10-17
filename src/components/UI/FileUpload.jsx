function FileUpload({ onFilesSelected, multiple = false }) {
  const inputId = 'xml-file-upload';

  function handleChange(e) {
    const files = Array.from(e.target.files);

    if (onFilesSelected) {
      onFilesSelected(files);
    }
  }

  return (
    <>
      <input
        type="file"
        id={inputId}
        multiple={multiple}
        accept=".xml,application/xml"
        hidden
        onChange={handleChange}
      />

      <label htmlFor={inputId} className="file-button">
        📂 Выбрать XML-файлы
      </label>
    </>
  );
}

export default FileUpload;
