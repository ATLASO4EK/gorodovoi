import React, { useEffect, useState } from 'react';
import NewsCategory from './../objects/NewsTemp.jsx';
import NewsEditor from './../objects/NewsEditor.jsx';
import LoginModal from './../objects/LoginModal.jsx';
import './../styles/newsPage.css';

function NewsPage({ onNewsUpdate, news }) { 
  const [isVisible, setIsVisible] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });


  useEffect(() => {
    localStorage.setItem('isAdmin', isAdmin.toString());
  }, [isAdmin]);


  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
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

  const handleEscapeKey = (e) => {
    if (e.keyCode === 27) closeNews();
  };

  useEffect(() => {
    if (selectedNews) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [selectedNews]);

  const formatText = (text) => {
    return text.split('\n').map((paragraph, index) => (
      <p key={index}>{paragraph}</p>
    ));
  };


  const handleOpenLogin = () => {
    setIsLoginModalOpen(true);
  };

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

  const handleOpenEditor = () => {
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
 
    if (onNewsUpdate) {
      onNewsUpdate();
    }
  };

const handleNewsUpdate = () => {
  console.log('NewsPage: handleNewsUpdate вызван');
  if (onNewsUpdate) {
    onNewsUpdate();
  }
};

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
                    <button 
                      className="editor-open-button"
                      onClick={handleOpenEditor}
                    >
                      Редактор
                    </button>
                    <button 
                      className="logout-button"
                      onClick={handleLogout}
                    >
                      Выход
                    </button>
                  </>
                ) : (
                  <button 
                    className="editor-access-button"
                    onClick={handleOpenLogin}
                  >
                    Вход
                  </button>
                )}
              </div>
            </div>
            <p className="news-subtitle">Актуальная информация о работе Центра организации дорожного движения</p>
            
            <NewsCategory
              category="Последние новости"
              NewsTemps={news}
              onNewsOpen={openNews}
            />
          </div>
        </section>
      </div>

      {selectedNews && (
        <div className="news-modal-overlay" onClick={closeNews}>
          <div className="news-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={closeNews}
              aria-label="Закрыть новость"
            >
              <span>×</span>
            </button>
            <div className="modal-image-container">
              {selectedNews.image && selectedNews.image !== '#' ? (
                <img 
                  src={selectedNews.image} 
                  alt={selectedNews.imageAlt} 
                  className="modal-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="modal-image-placeholder" style={{ display: selectedNews.image && selectedNews.image !== '#' ? 'none' : 'flex' }}>
                <span className="modal-emoji">📰</span>
                <span className="modal-image-text">ЦОДД Смоленск</span>
              </div>
            </div>
            <div className="modal-content">
              <h2 className="modal-title">{selectedNews.title}</h2>
              <div className="modal-meta">
                <span className="modal-author">
                  <span className="author-icon">👤</span>
                  Автор: {selectedNews.author}
                </span>
                <span className="modal-time">
                  <span className="time-icon">🕒</span>
                  Опубликовано: {selectedNews.time}
                </span>
              </div>
              <div className="modal-text">
                {formatText(selectedNews.fullText)}
              </div>
            </div>
          </div>
        </div>
      )}

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

{isEditorOpen && (
  <NewsEditor 
    news={news}
    onSave={handleCloseEditor}
    onClose={handleCloseEditor}
    isAdmin={isAdmin}
    onNewsUpdate={handleNewsUpdate} 
  />
)}
    </>
  );
}

export default NewsPage;