import React, { useState, useEffect } from 'react';
import './../styles/HomePage.css';
import servicesData from '../assets/servicesData.json';
import Exception from '../Exception.jsx';
import Service from '../objects/Service.jsx';
import { NewsTemp } from '../objects/NewsTemp.jsx';


const URL = import.meta.env.VITE_API_BASE || "";

function HomePage({ setCurrentPage, forceNewsUpdate }) { 
  const [selectedNews, setSelectedNews] = useState(null);
  const [latestNews, setLatestNews] = useState([]);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const response = await fetch(URL + 'api/v1/News');
        if (!response.ok) throw new Error(`Ошибка запроса: ${response.status}`);

        const data = await response.json();
        const mappedNews = data.map(item => ({
          id: item[0],
          time: item[1],
          author: item[2],
          title: item[3],
          shortText: item[4],
          fullText: item[5],
          image: item[6],
          imageAlt: item[3],
        }));

        const sortedNews = mappedNews.sort((a, b) => new Date(b.time) - new Date(a.time));
        setLatestNews(sortedNews.slice(0, 3));
        setError(false);
      } catch (error) {
        console.error("Ошибка загрузки новостей:", error);
        setError(true);
      }
    };
    fetchLatestNews();
  }, [updateCounter]);

  useEffect(() => {
    if (forceNewsUpdate) {
      setUpdateCounter(prev => prev + 1);
    }
  }, [forceNewsUpdate]);

  const openNews = (news) => {
    setSelectedNews(news);
    document.body.style.overflow = 'hidden';
  };

  const closeNews = () => {
    setSelectedNews(null);
    document.body.style.overflow = 'auto';
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

  const formatText = (text) => text.split('\n').map((p, i) => <p key={i}>{p}</p>);

  const scrollToServices = () => {
    const servicesSection = document.getElementById('services-section');
    if (servicesSection) servicesSection.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('section') === 'services') setTimeout(scrollToServices, 100);
  }, []);

  const handleServiceAction = (service) => {
    switch (service.action) {
      case 'openTelegramBot': window.open('https://t.me/CODD_roads_bot', '_blank'); break;
      case 'openParkingApplication': console.log('Открытие формы заявки на парковку'); break;
      case 'openRoadWorksMap': console.log('Открытие карты дорожных работ'); break;
      default: console.log('Действие не определено');
    }
  };

  return (
    <>
      <div className={`home-page ${isVisible ? 'visible' : ''}`}>
        <div className="hero-section">
          <div className="hero-background">
            <img src="/smolensk.PNG" alt="Город Смоленск" className="hero-bg-image" />
            <div className="hero-overlay"></div>
          </div>
          <div className="hero-content">
            <div className="hero-text-container">
              <h1 className="hero-title">
                Центр организации<br />дорожного движения
              </h1>
              <div className="hero-subtitle">Смоленск</div>
            </div>
          </div>
        </div>

        {/* === НОВОСТИ === */}
        <section className="news-section-home">
          <div className="news-header">
            <h2 className="news-title-home">Последние новости</h2>
            <button className="all-news-button" onClick={() => setCurrentPage('news')}>
              Все новости
            </button>
          </div>

          {error ? (
            <div className="news-error-container">
              <Exception message="Не удалось загрузить последние новости 😞" />
            </div>
          ) : (
            <div className="news-container-home">
  <div className="news-scroll-wrapper">
    <div className="news-grid-home">
      {latestNews.map((news) => (
        <NewsTemp
          key={news.id}
          id={news.id}
          author={news.author}
          title={news.title}
          time={news.time}
          image={news.image}
          imageAlt={news.imageAlt}
          fullText={news.fullText}
          onOpen={() => openNews(news)}
        />
      ))}
    </div>
  </div>
</div>

          )}
        </section>

        {/* === СЕРВИСЫ === */}
        <section id="services-section" className="services-section-home">
          <div className="services-header">
            <h2 className="services-title-home">Сервисы</h2>
          </div>
          <div className="services-grid-home">
            {servicesData.map((service) => (
              <Service key={service.id} {...service} onAction={handleServiceAction} />
            ))}
          </div>
        </section>
      </div>

      {/* === МОДАЛКА НОВОСТИ === */}
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
                style={{ display: selectedNews.image && selectedNews.image !== '#' ? 'none' : 'flex' }}
              >
                <span className="modal-emoji-home">📰</span>
                <span className="news-category-home">ЦОДД Смоленск</span>
              </div>
            </div>
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
    </>
  );
}

export default HomePage;
