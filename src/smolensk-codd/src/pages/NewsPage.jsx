import { useEffect, useState } from 'react';
import './../styles/newsPage.css';

function NewsPage({ onNewsUpdate, news, isAdmin }) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [NewsTempComponent, setNewsTempComponent] = useState(null);
  const [NewsEditorComponent, setNewsEditorComponent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadSafely = async (path, setter) => {
      try {
        const mod = await import(/* @vite-ignore */ path);
        if (isMounted) setter(() => mod.default);
      } catch (error) {
        console.error(`Не удалось импортировать ${path}:`, error);
      }
    };
    loadSafely('../objects/NewsTemp.jsx', setNewsTempComponent);
    loadSafely('../objects/NewsEditor.jsx', setNewsEditorComponent);
    return () => (isMounted = false);
  }, []);

  const sortedNews = [...news].sort((a, b) => new Date(b.time) - new Date(a.time));

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const openNews = (item) => {
    setSelectedNews(item);
    document.body.style.overflow = 'hidden';
  };

  const closeNews = () => {
    setSelectedNews(null);
    document.body.style.overflow = 'auto';
  };

  const formatText = (text) =>
    text ? text.split('\n').map((p, i) => (p.trim() ? <p key={i}>{p}</p> : null)) : null;

  if (!NewsTempComponent || !NewsEditorComponent) {
    return <div className="news-container" style={{ textAlign: 'center', padding: '2rem' }}>Загрузка...</div>;
  }

  return (
    <>
      <div className={`news-container ${isVisible ? 'visible' : ''}`}>
        <section className="news-section">
          <div className="news-content">
            <div className="news-header">
              <h1 className="news-title">Новости ЦОДД Смоленска</h1>
              {isAdmin && (
                <button className="editor-open-button" onClick={() => setIsEditorOpen(true)}>
                  Редактор
                </button>
              )}
            </div>
            <NewsTempComponent category="Последние новости" NewsTemps={sortedNews} onNewsOpen={openNews} />
          </div>
        </section>
      </div>

      {/* === МОДАЛКА НОВОСТИ === */}
      {selectedNews && (
        <div className="news-modal-overlay-home" onClick={closeNews}>
          <div className="news-modal-home" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-home" onClick={closeNews}>×</button>

            {/* Блок изображения */}
            <div className="modal-image-container-home">
              {selectedNews.image && selectedNews.image !== '#' ? (
                <img
                  src={selectedNews.image}
                  alt={selectedNews.imageAlt || selectedNews.title}
                  className="modal-image-home"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="modal-image-placeholder-home"
                style={{ display: selectedNews.image && selectedNews.image !== '#' ? 'none' : 'flex' }}
              >
                <span className="modal-emoji-home">📰</span>
                <span className="news-category-home">ЦОДД Смоленск</span>
              </div>
            </div>

            {/* Контент новости */}
            <div className="modal-content-home">
              <h2 className="modal-title-home">{selectedNews.title}</h2>
              <div className="modal-meta-home">
                <span className="modal-author-home">
                  <span className="author-icon-home">👤</span> Автор: {selectedNews.author}
                </span>
                <span className="modal-time-home">
                  <span className="time-icon-home">🕒</span> Опубликовано: {selectedNews.time}
                </span>
              </div>
              <div className="modal-text-home">{formatText(selectedNews.fullText)}</div>
            </div>
          </div>
        </div>
      )}

      {isEditorOpen && (
        <NewsEditorComponent
          news={news}
          onSave={() => { setIsEditorOpen(false); onNewsUpdate?.(); }}
          onClose={() => setIsEditorOpen(false)}
          isAdmin={isAdmin}
          onNewsUpdate={onNewsUpdate}
        />
      )}
    </>
  );
}

export default NewsPage;
