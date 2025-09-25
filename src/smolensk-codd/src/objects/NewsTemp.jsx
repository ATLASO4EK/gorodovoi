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
      fullText: 'блаблаабаллвьыашщооауйагшйурагйай1234567890-',
      imageAlt: 'пенгуииин'
    },
    {
      id: 2,
      title: 'Мерч с Арсением чайкиным!',
      author: 'Серикова А.С.',
      time: '15.05.2025 14:30',
      image: '#',
      fullText: 'блаблаабаллвьыашщооауйагшйурагйцй1234567890-',
      imageAlt: 'пенгуииин'
    },
    {
      id: 3,
      title: 'СВО!НОВОСТИ ОТ ВАШЕГО ДЕНИСКИ',
      author: 'ГОНЧАРОВ ДЕНИС.',
      time: '15.05.2025 14:30',
      image: '#',
      fullText: 'блаблзщшгнекуцй1234567890-',
      imageAlt: 'пенгуииин'
    },
    {
      id: 4,
      title: 'ГОМЕС РЕЛИЗНУЛИ СВОЙ ПЕРВЫЙ ТРЕК',
      author: 'Гомес',
      time: '15.05.2029 14:30',
      image: '#',
      fullText: 'митьбюбьтимсчяывапролджэхзщшгнекуцй1234567890-',
      imageAlt: 'пенгуииин'
    },
    {
      id: 5,
      title: 'НАстя Zерикова выступила на СВО со словами поддержки и с песней ZOVZOVZOV',
      author: 'Загайнов.А.С',
      time: '15.05.2025 14:30',
      image: '#',
      fullText: 'бюбьтимсчяывапролджэхзщшгнекуцй1234567890-',
      imageAlt: 'пенгуииин'
    },
    {
      id: 6,
      title: 'настя пдф',
      author: 'Серикова А.С.',
      time: '15.05.2025 14:30',
      image: '#',
      fullText: 'тьбюбьтимсчяывапролджэхзщшгнекуцй1234567890-',
      imageAlt: 'пенгуииин'
    },
    {
      id: 7,
      title: 'Мерч с Арсением чайкиным!',
      author: 'Серикова А.С.',
      time: '15.05.2025 14:30',
      image: '#',
      fullText: 'щшгнекуцй1234567890-',
      imageAlt: 'пенгуииин'
    },
    {
      id: 8,
      title: 'Мерч с Арсением чайкиным!',
      author: 'Серикова А.С.',
      time: '15.05.2025 14:30',
      image: '#',
      fullText: 'блаблаабаллвьыашщо',
      imageAlt: 'пенгуииин'
    },
  ];

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openNews = (newsItem) => {
    setSelectedNews(newsItem);
    document.body.style.overflow = 'hidden';
  };

  const closeNews = () => {
    setSelectedNews(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className={`news-container ${isVisible ? 'visible' : ''}`}>
      <section className="news-section">
        <div className="news-content">
          <h1 className="news-title">Новости</h1>
          
          <div className="news-grid">
            {newsData.map((item, index) => (
              <div 
                key={item.id} 
                className="news-card"
                onClick={() => openNews(item)}
              >
                <div className="news-image-container">
                  <div className="news-image-placeholder">
                    <span>Говно тонет!</span>
                  </div>
                </div>
                <div className="news-card-content">
                  <h3 className="news-card-title">{item.title}</h3>
                  <div className="news-meta">
                    <span className="news-author">{item.author}</span>
                    <span className="news-time">{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedNews && (
        <div className="news-modal-overlay" onClick={closeNews}>
          <div className="news-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeNews}>×</button>
            <div className="modal-image-container">
              <div className="modal-image-placeholder">
                <span>Нет. Говно не тонет</span>
              </div>
            </div>
            <div className="modal-content">
              <h2 className="modal-title">{selectedNews.title}</h2>
              <div className="modal-meta">
                <span className="modal-author">Автор: {selectedNews.author}</span>
                <span className="modal-time">Опубликовано: {selectedNews.time}</span>
              </div>
              <div className="modal-text">
                <p>{selectedNews.fullText}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsTemp;