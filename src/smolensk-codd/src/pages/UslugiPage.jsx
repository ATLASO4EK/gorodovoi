import { useEffect, useState, useRef } from 'react';
import '../styles/UslugiPage.css';
import Exception from '../Exception';

// ===== SVG ИКОНКИ =====
const ServicesIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
);
const ClientsIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const QualityIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
);

function UslugiPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [uslugiData, setUslugiData] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [UslugiComponent, setUslugiComponent] = useState(null);
  const [stats, setStats] = useState({ services: 0, clients: 0, quality: 100 });
  const containerRef = useRef(null);

  // === Безопасный импорт компонента ===
  useEffect(() => {
    let isMounted = true;

    const loadUslugiSafely = async () => {
      try {
        const module = await import('../objects/Usluga.jsx');
        if (isMounted) setUslugiComponent(() => module.default);
      } catch (error) {
        console.error('Ошибка импорта Usluga.jsx, используется Exception:', error);
        try {
          const fallback = await import('../Exception.jsx');
          if (isMounted) setUslugiComponent(() => fallback.default);
        } catch (fallbackError) {
          console.error('Не удалось импортировать Exception.jsx:', fallbackError);
          if (isMounted)
            setUslugiComponent(() => () => (
              <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>
                <h2>Ошибка: компонент Uslugi недоступен</h2>
              </div>
            ));
        }
      }
    };

    loadUslugiSafely();
    return () => (isMounted = false);
  }, []);

  // === Загрузка JSON ===
  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setIsVisible(true), 100);

    fetch('src/assets/uslugiData.json')
      .then((res) => {
        if (!res.ok) throw new Error('Файл uslugiData.json не найден');
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Некорректный формат JSON');
        setUslugiData(data);
        setStats({
          services: data.length,
          clients: 1500,
          quality: 100,
        });
      })
      .catch((err) => {
        console.error('Ошибка загрузки JSON:', err.message);
        setHasError(true);
      });
  }, []);

  // === Анимация появления ===
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const hasUslugi = uslugiData && Array.isArray(uslugiData) && uslugiData.length > 0;

  // === Пока компонент не загружен ===
  if (!UslugiComponent) {
    return (
      <div className="uslugi-container" style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Загрузка услуг...</p>
      </div>
    );
  }

  return (
    <div className={`uslugi-section ${isVisible ? 'visible' : ''}`} ref={containerRef}>
      <div className="uslugi-container">
        <div className="uslugi-header">
          <h1>Услуги ЦОДД Смоленска</h1>
          <p className="uslugi-subtitle">
            Профессиональные услуги для обеспечения безопасности и комфорта дорожного движения.
          </p>
        </div>

        {/* === Статистика === */}
        <div className="uslugi-stats">
          <div className="stat-item">
            <div className="stat-icon"><ServicesIcon /></div>
            <div className="stat-number">{stats.services}+</div>
            <div className="stat-label">Профессиональных услуг</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><ClientsIcon /></div>
            <div className="stat-number">{stats.clients}+</div>
            <div className="stat-label">Довольных клиентов</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><QualityIcon /></div>
            <div className="stat-number">{stats.quality}%</div>
            <div className="stat-label">Гарантия качества</div>
          </div>
        </div>

        {/* === Список услуг === */}
        {hasError || !hasUslugi ? (
          <Exception message="Не удалось загрузить услуги. Попробуйте позже." />
        ) : (
          <div className="uslugi-grid">
            {uslugiData.map((service, index) => (
              <UslugiComponent
                key={index}
                title={service.title || 'Без названия'}
                description={service.description || 'Описание отсутствует'}
                price={service.price || 'Цена не указана'}
                features={service.features || []}
                icon={service.icon || null}
              />
            ))}
          </div>
        )}

        {/* === Инфо-блок === */}
        <section className="uslugi-info-section">
          <div className="info-content">
            <h2>Почему выбирают наши услуги?</h2>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon">🏆</div>
                <h3>Профессионализм</h3>
                <p>Опытная команда специалистов с многолетним стажем работы в сфере организации дорожного движения</p>
              </div>
              <div className="info-item">
                <div className="info-icon">⚡</div>
                <h3>Оперативность</h3>
                <p>Быстрое выполнение работ и срочный выезд по заявкам в любое время суток</p>
              </div>
              <div className="info-item">
                <div className="info-icon">🛡️</div>
                <h3>Надежность</h3>
                <p>Гарантия качества работ и полное соблюдение требований безопасности</p>
              </div>
              <div className="info-item">
                <div className="info-icon">💎</div>
                <h3>Прозрачность</h3>
                <p>Честные цены, детальные сметы и полная отчетность по выполненным работам</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default UslugiPage;
