import React, { useEffect, useState } from 'react';
import './../styles/BannersPage.css';

const BannersPage = () => {
  const [isVisible, setIsVisible] = useState(false);


  const bannersData = [
    {
      id: 1,
      title: 'Правительство Смоленской области',
      description: 'Официальный портал органов государственной власти Смоленской области',
      link: 'https://www.admin-smolensk.ru/',
      icon: '🏛️'
    },
    {
      id: 2,
      title: 'Национальные проекты России',
      description: 'Информация о реализации национальных проектов на территории Смоленской области',
      link: 'https://национальныепроекты.рф/',
      icon: '🇷🇺'
    },
    {
      id: 3,
      title: 'ГИБДД Смоленской области',
      description: 'Информация о дорожной безопасности и правилах дорожного движения',
      link: 'https://гибдд.рф/',
      icon: '🚓'
    },
    {
      id: 4,
      title: 'Портал госуслуг Смоленской области',
      description: 'Электронные услуги и сервисы для жителей Смоленской области',
      link: 'https://pgu.admin-smolensk.ru/?/fi/main#/',
      icon: '💻'
    },
    {
      id: 5,
      title: 'Безопасные дороги',
      description: 'Федеральный проект по улучшению дорожной инфраструктуры',
      link: 'https://bkdrf.ru/',
      icon: '🛣️'
    },
    {
      id: 6,
      title: 'Туризм в Смоленской области',
      description: 'Достопримечательности и туристические маршруты региона',
      link: 'https://crt67.ru/',
      icon: '🏰'
    }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, []);

  const handleBannerClick = (banner) => {
    if (banner.link) {
      window.open(banner.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`banners-container ${isVisible ? 'visible' : ''}`}>
      <section className="banners-section">
        <div className="banners-content">
          <h1 className="banners-title">Партнеры и проекты</h1>
          <p className="banners-subtitle">
            Дружественные проекты и организации, с которыми сотрудничает ЦОДД Смоленска для улучшения городской среды
          </p>
          
          <div className="banners-grid">
            {bannersData.map((banner) => (
              <div 
                key={banner.id} 
                className="banner-card"
                onClick={() => handleBannerClick(banner)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && handleBannerClick(banner)}
              >
                <div className="banner-image-container">
                  <div className="banner-image-placeholder">
                    <span className="banner-icon">{banner.icon}</span>
                    <span className="banner-category">Партнерский проект</span>
                  </div>
                </div>
                <div className="banner-card-content">
                  <h3 className="banner-card-title">{banner.title}</h3>
                  <p className="banner-description">{banner.description}</p>
                  <div className="banner-link">
                    <span className="link-arrow">→</span>
                    Перейти к проекту
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BannersPage;