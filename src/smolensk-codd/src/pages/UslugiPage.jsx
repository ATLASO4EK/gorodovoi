import { useState, useEffect, useRef } from 'react';
import Usluga from '../objects/Usluga';
import '../styles/UslugiPage.css';

const ServicesIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
);

const ClientsIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const QualityIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const ProjectIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <path d="M16 13H8"/>
    <path d="M16 17H8"/>
    <path d="M10 9H9H8"/>
  </svg>
);

const CraneIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 21V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v18"/>
    <path d="M6 15H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/>
    <circle cx="12" cy="12" r="1"/>
    <circle cx="12" cy="16" r="1"/>
    <circle cx="12" cy="8" r="1"/>
  </svg>
);

const TowTruckIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 17V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v13"/>
    <path d="M10 17H2v-4h8"/>
    <circle cx="16" cy="17" r="2"/>
    <circle cx="6" cy="17" r="2"/>
    <path d="M14 7h4"/>
    <path d="M14 11h4"/>
    <path d="M14 15h4"/>
  </svg>
);

function UslugiPage() {
  const [stats, setStats] = useState({ services: 0, clients: 0, quality: 100 });
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setStats({
      services: 3,
      clients: 1500,
      quality: 100
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const servicesData = [
    {
      title: "Разработка проектно-сметной документации для строительства светофорных объектов",
      description: "Профессиональная разработка полного комплекта проектной и сметной документации для установки и модернизации светофорных объектов в соответствии с ГОСТами и требованиями безопасности.",
      price: "от 50 000 ₽",
      features: [
        "Полный комплекс проектных работ",
        "Согласование в государственных органах",
        "Сметная документация по госстандартам",
        "Технический надзор за реализацией",
        "Гарантия прохождения экспертизы"
      ],
      icon: <ProjectIcon />
    },
    {
      title: "Аренда автовышки",
      description: "Предоставляем в аренду современные автовышки для работ по обслуживанию и ремонту светофоров, дорожных знаков и систем видеонаблюдения.",
      price: "от 15 000 ₽/сутки",
      features: [
        "Высота подъема до 30 метров",
        "Профессиональные операторы",
        "Круглосуточная доступность",
        "Страхование ответственности",
        "Срочный выезд в течение 2 часов"
      ],
      icon: <CraneIcon />
    },
    {
      title: "Вызов эвакуатора",
      description: "Быстрый и безопасный эвакуатор для транспортировки автомобилей, создающих помехи дорожному движению или требующих срочного перемещения.",
      price: "от 3 000 ₽",
      features: [
        "Круглосуточная служба эвакуации",
        "Прибытие в течение 30 минут",
        "Безопасная погрузка и транспортировка",
        "Официальные документы",
        "Хранение на спецстоянке"
      ],
      icon: <TowTruckIcon />
    }
  ];

  return (
    <div 
      className={`uslugi-section ${isVisible ? 'visible' : ''}`} 
      ref={containerRef}
    >
      <div className="uslugi-container">
        <div className="uslugi-header">
          <h1>Услуги ЦОДД Смоленска</h1>
          <p className="uslugi-subtitle">
            Профессиональные услуги для обеспечения безопасности и комфорта дорожного движения. 
            Мы работаем для создания современной и эффективной транспортной инфраструктуры города.
          </p>
        </div>

        <div className="uslugi-stats">
          <div className="stat-item">
            <div className="stat-icon">
              <ServicesIcon />
            </div>
            <div className="stat-number">{stats.services}+</div>
            <div className="stat-label">Профессиональных услуг</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <ClientsIcon />
            </div>
            <div className="stat-number">{stats.clients}+</div>
            <div className="stat-label">Довольных клиентов</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <QualityIcon />
            </div>
            <div className="stat-number">{stats.quality}%</div>
            <div className="stat-label">Гарантия качества</div>
          </div>
        </div>

        <div className="uslugi-grid">
          {servicesData.map((service, index) => (
            <Usluga 
              key={index}
              title={service.title}
              description={service.description}
              price={service.price}
              features={service.features}
              icon={service.icon}
              index={index}
            />
          ))}
        </div>

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