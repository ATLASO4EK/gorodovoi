// Страница Баннеров (Партнёры и проекты)
import React, { useEffect, useState } from 'react';
import './../styles/BannersPage.css';

import Banner from '../objects/Banner';
import Exception from '../objects/Exception'; 

const BannerPage = () => { 
  const [isVisible, setIsVisible] = useState(false);
  const [bannersData, setBannersData] = useState([]);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setIsVisible(true), 100);
    // Путь к данным здесь \/
    fetch('/src/assets/bannersData.json')
      .then((res) => {
        if (!res.ok) throw new Error('Файл не найден');
        return res.json();
      })
      .then((data) => {
        if (!data || !Array.isArray(data)) throw new Error('Некорректный формат JSON');
        setBannersData(data);
      })
      .catch((err) => {
        console.warn('Ошибка загрузки баннеров:', err.message);
        setHasError(true);
      });
  }, []);

  const hasBanners = bannersData && Array.isArray(bannersData) && bannersData.length > 0;

  return (
    <div className={`banners-container ${isVisible ? 'visible' : ''}`}>
      <section className="banners-section">
        <div className="banners-content">
          {/* === ЗАГОЛОВОК === */}
          <h1 className="banners-title">Партнёры и проекты</h1>
          <p className="banners-subtitle">
            Дружественные проекты и организации, с которыми сотрудничает ЦОДД Смоленска для улучшения городской среды
          </p>
          {/* === ПРОВЕРКА=== */}
          {hasError || !hasBanners ? (
            <Exception message="Проекты временно недоступны. Попробуйте позже." />
          ) : (
            <div className="banners-grid">
              {/* === ОСНОВНАЯ ЧАСТЬ === */}
              {bannersData.map((banner, index) => (
                <Banner
                  key={index}
                  title={banner.title || 'Без названия'}
                  category={banner.category || 'Партнёрский проект'}
                  description={banner.description || 'Описание отсутствует'}
                  link={banner.link || '#'}
                  icon={banner.icon || ''}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BannerPage; 