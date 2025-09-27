import React, { useState } from 'react';
import './../styles/HomePage.css';

function HomePage({ setCurrentPage }) {
  const [selectedNews, setSelectedNews] = useState(null);

  // Данные новостей (первые 3 из NewsPage)
  const newsData = [
    {
      id: 1,
      title: 'Пингвины захватили мир',
      author: 'Серикова А.С.',
      time: '15.05.2025 14:30',
      image: '#', 
      fullText: 'Сегодня произошло невероятное событие - пингвины вышли из тени и начали захватывать мир своими милыми лапками. Это исторический момент для всего человечества.\n\nУлицы города заполнились этими удивительными созданиями, которые демонстрируют удивительную организованность в движении. ЦОДД Смоленска внимательно следит за ситуацией и разрабатывает новые маршруты для комфортного передвижения всех участников дорожного движения.',
      imageAlt: 'Пингвины на дороге'
    },
    {
      id: 2,
      title: 'Мерч с Арсением Чайкиным!',
      author: 'Серикова А.С.',
      time: '15.05.2025 14:30',
      image: '#',
      fullText: 'Новая коллекция мерча с Арсением Чайкиным уже в продаже! Успейте приобрести эксклюзивные товары по специальным ценам.\n\nВ коллекцию вошли футболки, бейсболки и стикеры с уникальными дизайнами. Все средства от продажи пойдут на развитие дорожной инфраструктуры города. Мерч можно приобрести в центральном офисе ЦОДД Смоленска.',
      imageAlt: 'Новый мерч ЦОДД'
    },
    {
      id: 3,
      title: 'Обновление дорожной разметки',
      author: 'ГОНЧАРОВ ДЕНИС',
      time: '15.05.2025 14:30',
      image: '#',
      fullText: 'В центре города завершены работы по обновлению дорожной разметки. Теперь движение стало более безопасным и организованным.\n\nРаботы проводились в ночное время для минимизации неудобств для участников дорожного движения. Использованы современные светоотражающие материалы, которые обеспечивают лучшую видимость в темное время суток и в условиях плохой погоды.',
      imageAlt: 'Обновленная дорожная разметка'
    }
  ];

  const openNews = (news) => {
    setSelectedNews(news);
    document.body.style.overflow = 'hidden';
  };

  const closeNews = () => {
    setSelectedNews(null);
    document.body.style.overflow = 'auto';
  };

  const handleEscapeKey = (e) => {
    if (e.keyCode === 27) {
      closeNews();
    }
  };

  const openTelegramBot = () => {
    window.open('https://t.me/moreiwi', '_blank', 'noopener,noreferrer');
  };

  React.useEffect(() => {
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

  const scrollToServices = () => {
    const servicesSection = document.getElementById('services-section');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };


  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('section') === 'services') {
      setTimeout(scrollToServices, 100);
    }
  }, []);

   return (
    <>
      <div className="home-page">
        <div className="hero-section">
          <div className="hero-background">
            <img 
              src="/smolensk.svg" 
              alt="Город Смоленск" 
              className="hero-bg-image"
            />
            <div className="hero-overlay"></div>
          </div>
          <div className="hero-content">
            <div className="hero-text-container">
              <h1 className="hero-title">
                Центр организации<br />дорожного движения
              </h1>
              <div className="hero-subtitle">
                Смоленск
              </div>
            </div>
          </div>
        </div>

     
        <section className="news-section-home">
          <div className="news-header">
            <h2 className="news-title-home">Последние новости</h2>
            <button 
              className="all-news-button"
              onClick={() => setCurrentPage('news')}
            >
              Все новости
            </button>
          </div>
          
          <div className="news-grid-home">
            {newsData.map((news) => (
              <div 
                key={news.id}
                className="news-card-home"
                onClick={() => openNews(news)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && openNews(news)}
              >
                <div className="news-image-container-home">
                  {news.image && news.image !== '#' ? (
                    <img 
                      src={news.image} 
                      alt={news.imageAlt} 
                      className="news-image-home"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="news-image-placeholder-home" style={{ display: news.image && news.image !== '#' ? 'none' : 'flex' }}>
                    <span className="news-emoji-home">📰</span>
                    <span className="news-category-home">Новость ЦОДД</span>
                  </div>
                </div>
                
                <div className="news-card-content-home">
                  <h3 className="news-card-title-home">{news.title}</h3>
                  <div className="news-meta-home">
                    <span className="news-author-home">
                      <span className="author-icon-home">👤</span>
                      {news.author}
                    </span>
                    <span className="news-time-home">
                      <span className="time-icon-home">🕒</span>
                      {news.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        
        <section id="services-section" className="services-section-home">
          <div className="services-header">
            <h2 className="services-title-home">Сервис</h2>
          </div>
          
          <div className="service-banner-home">
            <div 
              className="service-banner-content"
              onClick={openTelegramBot}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && openTelegramBot()}
            >
              <div className="service-banner-left">
                <div className="telegram-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.535-.196 1.006.128.832.941z"/>
                  </svg>
                </div>
                <div className="service-banner-text">
                  <h3 className="service-banner-title">Телеграм-бот ЦОДД Смоленск</h3>
                  <p className="service-banner-description">
                    Получайте актуальную информацию о дорожной ситуации, планируйте маршруты 
                    и получайте уведомления о изменениях в режиме реального времени
                  </p>
                </div>
              </div>
              <div className="service-banner-right">
                <span className="service-banner-badge">Сервис</span>
                <span className="service-banner-arrow">→</span>
              </div>
            </div>
          </div>
        </section>
      </div>

     
      {selectedNews && (
        <div className="news-modal-overlay-home" onClick={closeNews}>
          <div className="news-modal-home" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-home" 
              onClick={closeNews}
              aria-label="Закрыть новость"
            >
              <span>×</span>
            </button>
            <div className="modal-image-container-home">
              {selectedNews.image && selectedNews.image !== '#' ? (
                <img 
                  src={selectedNews.image} 
                  alt={selectedNews.imageAlt} 
                  className="modal-image-home"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="modal-image-placeholder-home" style={{ display: selectedNews.image && selectedNews.image !== '#' ? 'none' : 'flex' }}>
                <span className="modal-emoji-home">📰</span>
                <span className="news-category-home">ЦОДД Смоленск</span>
              </div>
            </div>
            <div className="modal-content-home">
              <h2 className="modal-title-home">{selectedNews.title}</h2>
              <div className="modal-meta-home">
                <span className="modal-author-home">
                  <span className="author-icon-home">👤</span>
                  Автор: {selectedNews.author}
                </span>
                <span className="modal-time-home">
                  <span className="time-icon-home">🕒</span>
                  Опубликовано: {selectedNews.time}
                </span>
              </div>
              <div className="modal-text-home">
                {formatText(selectedNews.fullText)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HomePage;