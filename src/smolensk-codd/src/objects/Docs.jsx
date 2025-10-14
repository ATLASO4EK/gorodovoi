/*Объект-Шаблон Документа*/

/*
  Принимает:          Пример:
  title: str;         title: "Устав ЦОДД Смоленск",
  description: str;   description: "Основной документ, определяющий порядок деятельности и полномочия центра организации дорожного движения",
  type: str;          type: "PDF",
  size: str;          size: "2.4 МБ",
  date: str;          date: "2024 г.",
  file: str;          file: "/docs/Chart-CODD-Smolensk.pdf"

  Использование: pages/DocsPage.jsx => documentsData
*/

import { useState } from 'react';
import './../styles/Docs.css';
import { DocumentIcon, EyeIcon, DownloadIcon, CloseIcon } from '../assets/DocsIcons';

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