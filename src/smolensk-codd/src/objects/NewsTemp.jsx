import React, { useEffect, useState } from 'react';
import './../styles/newsPage.css';

const NewsTemp = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  
  const newsData = [
    {
      id: 1,
      title: 'Пингвины захватили мир',
      author: 'Серикова А.С.',
      time: '15.05.2025 14:30',
      image: '#',
      fullText: 'Сегодня произошло невероятное событие - пингвины вышли из тени и начали захватывать мир своими милыми лапками. Это исторический момент для всего человечества.',
      imageAlt: 'пенгуииин'
    },
    {
      id: 2,
      title: 'Мерч с Арсением Чайкиным!',
      author: 'Серикова А.С.',
      time: '15.05.2025 14:30',
      image: '#',
      fullText: 'Новая коллекция мерча с Арсением Чайкиным уже в продаже! Успейте приобрести эксклюзивные товары по специальным ценам.',
      imageAlt: 'мерч'
    },
    {
      id: 3,
      title: 'Обновление дорожной разметки',
      author: 'ГОНЧАРОВ ДЕНИС',
      time: '15.05.2025 14:30',
      image: '#',
      fullText: 'В центре города завершены работы по обновлению дорожной разметки. Теперь движение стало более безопасным и организованным.',
      imageAlt: 'дорожная разметка'
    },
    {
      id: 4,
      title: 'ГОМЕС РЕЛИЗНУЛИ СВОЙ ПЕРВЫЙ ТРЕК',
      author: 'Гомес',
      time: '33.13.2029 14:30',
      image: '#',
      fullText: 'Легендарная группа ГОМЕС выпустила свой дебютный трек, который уже стал хитом на всех музыкальных площадках.',
      imageAlt: 'музыка'
    },
    {
      id: 5,
      title: 'Новые пончики в городском кафе',
      author: 'Загайнов А.С',
      time: '15.05.2025 14:30',
      image: '#',
      fullText: 'В центре Смоленска открылось новое кафе, где представлены уникальные сорта пончиков с разнообразными начинками.',
      imageAlt: 'пончики'
    },
    {
      id: 6,
      title: 'Обновление системы дорожного движения',
      author: 'Серикова А.С.',
      time: '15.05.2025 14:30',
      image: '#',
      fullText: 'ЦОДД Смоленска внедряет новую интеллектуальную систему управления дорожным движением, которая снизит заторы на 30%.',
      imageAlt: 'дорожное движение'
    },
    {
      id: 7,
      title: 'Трушный предатель',
      author: 'НАЙТИ АЙТИ',
      time: '25.09.2025 13:00',
      image: '#',
      fullText: 'В рамках городского IT-форума обсуждались вопросы кибербезопасности и защиты данных в современных условиях.',
      imageAlt: 'IT-форум'
    },
    {
      id: 8,
      title: 'Ремонт моста завершен',
      author: 'Серикова А.С.',
      time: '15.05.2025 14:30',
      image: '#',
      fullText: 'Досрочно завершен капитальный ремонт центрального моста через Днепр. Движение открыто для всех видов транспорта.',
      imageAlt: 'ремонт моста'
    },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, []);

  const openNews = (newsItem) => {
    setSelectedNews(newsItem);
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
            
            <div className="news-grid">
              {newsData.map((item, index) => (
                <div 
                  key={item.id} 
                  className="news-card"
                  onClick={() => openNews(item)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && openNews(item)}
                >
                  <div className="news-image-container">
                    <div className="news-image-placeholder">
                      <span className="news-emoji">🚗</span>
                      <span className="news-category">Дорожная безопасность</span>
                    </div>
                  </div>
                  <div className="news-card-content">
                    <h3 className="news-card-title">{item.title}</h3>
                    <div className="news-meta">
                      <span className="news-author">
                        <span className="author-icon">👤</span>
                        {item.author}
                      </span>
                      <span className="news-time">
                        <span className="time-icon">🕒</span>
                        {item.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              <div className="modal-image-placeholder">
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
};

export default NewsTemp;