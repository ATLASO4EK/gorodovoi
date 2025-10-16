import { useEffect, useState } from 'react';
import './../styles/NewsPage.css';

function NewsPage({ onNewsUpdate, news }) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');

  // Компоненты, подгружаемые динамически
  const [NewsTempComponent, setNewsTempComponent] = useState(null);
  const [NewsEditorComponent, setNewsEditorComponent] = useState(null);
  const [LoginModalComponent, setLoginModalComponent] = useState(null);

  // ---------- Динамические импорты ----------
  useEffect(() => {
    let isMounted = true;

    const loadSafely = async (path, setter) => {
      try {
        const mod = await import(/* @vite-ignore */ path);
        if (isMounted) setter(() => mod.default);
      } catch (error) {
        console.error(`Не удалось импортировать ${path}:`, error);
        try {
          const fallback = await import('../Exception.jsx');
          if (isMounted) setter(() => fallback.default);
        } catch (fallbackError) {
          console.error('Ошибка при загрузке Exception.jsx:', fallbackError);
          if (isMounted)
            setter(() => ({ message }) => (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'red',
                  fontFamily: 'sans-serif',
                }}
              >
                <h2>{message || 'Ошибка: компонент недоступен'}</h2>
              </div>
            ));
        }
      }
    };

    // Загружаем три компонента
    loadSafely('../objects/NewsTemp.jsx', setNewsTempComponent);
    loadSafely('../objects/NewsEditor.jsx', setNewsEditorComponent);
    loadSafely('../objects/LoginModal.jsx', setLoginModalComponent);

    return () => {
      isMounted = false;
    };
  }, []);

  // ---------- Отображение ----------
  const sortedNews = [...news].sort((a, b) => {
    const dateA = a.date || a.timestamp || a.time;
    const dateB = b.date || b.timestamp || b.time;
    if (dateA && dateB) return new Date(dateB) - new Date(dateA);
    if (a.id && b.id) return b.id - a.id;
    return 0;
  });

  useEffect(() => {
    localStorage.setItem('isAdmin', isAdmin.toString());
  }, [isAdmin]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const openNews = (newsItem) => {
    setSelectedNews(newsItem);
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('modal-open');
  };

  const closeNews = () => {
    setSelectedNews(null);
    document.body.style.overflow = 'auto';
    document.documentElement.classList.remove('modal-open');
  };

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.keyCode === 27) closeNews();
    };

    if (selectedNews) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [selectedNews]);

  const formatText = (text) =>
    text
      ? text.split('\n').map((p, i) => (p.trim() ? <p key={i}>{p}</p> : null))
      : null;

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    setIsAdmin(true);
    setIsEditorOpen(true);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setIsEditorOpen(false);
    localStorage.setItem('isAdmin', 'false');
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    onNewsUpdate?.();
  };

  // Пока компоненты не загружены — показываем экран ожидания
  if (!NewsTempComponent || !NewsEditorComponent || !LoginModalComponent) {
    return (
      <div className="news-container" style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Загрузка страницы новостей...</p>
      </div>
    );
  }

  // --------- Основная верстка ----------
  return (
    <>
      <div className={`news-container ${isVisible ? 'visible' : ''}`}>
        <section className="news-section">
          <div className="news-content">
            <div className="news-header">
              <h1 className="news-title">Новости ЦОДД Смоленска</h1>
              <div className="news-header-controls">
                {isAdmin ? (
                  <>
                    <button className="editor-open-button" onClick={() => setIsEditorOpen(true)}>
                      Редактор
                    </button>
                    <button className="logout-button" onClick={handleLogout}>
                      Выход
                    </button>
                  </>
                ) : (
                  <button className="editor-access-button" onClick={() => setIsLoginModalOpen(true)}>
                    Вход
                  </button>
                )}
              </div>
            </div>
            <p className="news-subtitle">
              Актуальная информация о работе Центра организации дорожного движения
            </p>

            {/* Отображаем новости через динамически подгруженный компонент */}
            <NewsTempComponent
              category="Последние новости"
              NewsTemps={sortedNews}
              onNewsOpen={openNews}
            />
          </div>
        </section>
      </div>

      {selectedNews && (
        <div className="news-modal-overlay-home" onClick={closeNews}>
          <div className="news-modal-home" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-home" onClick={closeNews} aria-label="Закрыть новость">
              <span>×</span>
            </button>
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
                style={{
                  display:
                    selectedNews.image && selectedNews.image !== '#'
                      ? 'none'
                      : 'flex',
                }}
              >
                <span className="modal-emoji-home">📰</span>
                <span className="news-category-home">ЦОДД Смоленск</span>
              </div>
            </div>
            <div className="modal-content-home">
              <h2 className="modal-title-home">{selectedNews.title}</h2>
              <div className="modal-meta-home">
                <span className="modal-author-home">
                  <span className="author-icon-home">👤</span>
                  Автор: {selectedNews.author || 'Неизвестный автор'}
                </span>
                <span className="modal-time-home">
                  <span className="time-icon-home">🕒</span>
                  Опубликовано: {selectedNews.time || 'Дата не указана'}
                </span>
              </div>
              <div className="modal-text-home">{formatText(selectedNews.fullText)}</div>
            </div>
          </div>
        </div>
      )}

      <LoginModalComponent
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {isEditorOpen && (
        <NewsEditorComponent
          news={news}
          onSave={handleCloseEditor}
          onClose={handleCloseEditor}
          isAdmin={isAdmin}
          onNewsUpdate={onNewsUpdate}
        />
      )}
    </>
  );
}

export default NewsPage;
