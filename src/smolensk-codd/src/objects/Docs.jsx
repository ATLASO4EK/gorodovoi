import { useState } from 'react';
import './../styles/Docs.css';


const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

function Docs({ title, description, type, size, date, file }) {
  const [showModal, setShowModal] = useState(false);

  const handlePreview = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  return (
    <>
      <div className="doc-card">
        <div className="doc-card-content">
          <div className="doc-icon">
            <DocumentIcon />
          </div>
          <div className="doc-info">
            <h3 className="doc-title">{title}</h3>
            <div className="doc-meta">
              <span className="doc-type">{type}</span>
              <span className="doc-size">{size}</span>
              {date && <span className="doc-date">{date}</span>}
            </div>
            <p className="doc-description">{description}</p>
            <div className="doc-actions">
              <button className="doc-preview" onClick={handlePreview}>
                <EyeIcon />
                Просмотр документа
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="doc-modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{title}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <iframe 
                src={file + '#view=FitH'} 
                className="pdf-viewer" 
                title={`Просмотр: ${title}`}
                loading="lazy"
              />
              <div className="modal-actions">
                <div className="file-info">
                  <strong>Формат:</strong> {type} • <strong>Размер:</strong> {size}
                  {date && <> • <strong>Обновлено:</strong> {date}</>}
                </div>
                <a href={file} className="download-full" download>
                  <DownloadIcon />
                  Скачать документ
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Docs;