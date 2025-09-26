import React, { useEffect, useState } from 'react';
import NewsCategory from './../objects/NewsTemp';
import NewsTemp from './../objects/NewsTemp';
import './../styles/newsPage.css';

import URL from './../config'


function NewsPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  
  const [newsList, setNewsList] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch(URL + 'News');
      const data = await response.json();

      // допустим сервер вернул массив массивов:
      // [ [0, "Wed...", "Иван...", "Заголовок", "Короткий текст", "Полный текст", "img1"], ... ]

      const mappedNews = data.map(item => ({
        id: item[0],
        time: item[1],
        author: item[2],
        title: item[3],
        shortText: item[4],
        fullText: item[5],
        image: item[6],
        imageAlt: item[3], // можно использовать заголовок как alt
      }));

      setNewsList(mappedNews);      console.log(data)
    } catch (error) {
      console.error("Ошибка загрузки новостей:", error);
    }
  };
  fetchData();
}, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, []);

  const openNews = (NewsTemp) => {
    setSelectedNews(NewsTemp);
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.classList.add('modal-open');
  };

  const closeNews = () => {
    setSelectedNews(null);
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.classList.remove('modal-open');
  };

  const handleEscapeKey = (e) => {
    if (e.keyCode === 27) {
      closeNews();
    }
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

  return (
    <>
      <div className={`news-container ${isVisible ? 'visible' : ''}`}>
        <section className="news-section">
          <div className="news-content">
            <h1 className="news-title">Новости ЦОДД Смоленска</h1>
            <p className="news-subtitle">Актуальная информация о работе Центра организации дорожного движения</p>
            
            <NewsCategory
              category="Последние новости"
              NewsTemps={newsList}
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
    </>
  );
}

export default NewsPage;