// Страница Баннеров (Партнёры и проекты)
import { useEffect, useState } from 'react';
import './../styles/BannersPage.css';
import Exception from '../Exception';

const BannersPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [bannersData, setBannersData] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [BannerComponent, setBannerComponent] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadBannerSafely = async () => {
      try {
        const module = await import('../objects/Banner.jsx');
        if (isMounted) setBannerComponent(() => module.default);
      } catch (error) {
        console.error('Не удалось импортировать Banner.jsx, используется Exception.jsx вместо него:', error);
        try {
          const fallbackModule = await import('../Exception.jsx');
          if (isMounted) setBannerComponent(() => fallbackModule.default);
        } catch (fallbackError) {
          console.error('Не удалось импортировать Exception.jsx как fallback:', fallbackError);
          if (isMounted)
            setBannerComponent(() => ({ message }) => (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'red',
                  fontFamily: 'sans-serif',
                }}
              >
                <h2>{message || 'Ошибка: компонент Banner недоступен'}</h2>
              </div>
            ));
        }
      }
    };

    loadBannerSafely();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setIsVisible(true), 100);

    fetch('/src/assets/bannersData.json')
      .then((res) => {
        if (!res.ok) throw new Error('Файл не найден');
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Некорректный формат JSON');
        setBannersData(data);
      })
      .catch((err) => {
        console.warn('Ошибка загрузки баннеров:', err.message);
        setHasError(true);
      });
  }, []);

  const hasBanners = bannersData && Array.isArray(bannersData) && bannersData.length > 0;

  if (!BannerComponent) {
    return (
      <div className="banners-container" style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Загрузка баннеров...</p>
      </div>
    );
  }
  
  return (
    <div className={`banners-container ${isVisible ? 'visible' : ''}`}>
      <section className="banners-section">
        <div className="banners-content">
          <h1 className="banners-title">Партнёры и проекты</h1>
          <p className="banners-subtitle">
            Дружественные проекты и организации, с которыми сотрудничает ЦОДД Смоленска для улучшения городской среды
          </p>

          {hasError || !hasBanners ? (
            <Exception message="Проекты временно недоступны. Попробуйте позже." />
          ) : (
            <div className="banners-grid">
              {bannersData.map((banner, index) => (
                <BannerComponent
                  key={index}
                  title={banner.title || 'Без названия'}
                  category={banner.category || 'Партнёрский проект'}
                  description={banner.description || 'Описание отсутствует'}
                  link={banner.link || '#'}
                  icon={banner.icon || ''}
                  message="Ошибка: компонент Banner недоступен"
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BannersPage;
