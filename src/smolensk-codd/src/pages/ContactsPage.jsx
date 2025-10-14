// Страница Контактов
import { useEffect, useState } from 'react';
import './../styles/ContactsPage.css';
import Exception from '../Exception';

const ContactsPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [contactsData, setContactsData] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ContactComponent, setContactComponent] = useState(null);

  // === Безопасный импорт Contact ===
  useEffect(() => {
    let isMounted = true;

    const loadContactSafely = async () => {
      try {
        const module = await import('../objects/Contact.jsx');
        if (isMounted) setContactComponent(() => module.default);
      } catch (error) {
        console.error('Не удалось импортировать Contact.jsx, используется Exception.jsx вместо него:', error);
        try {
          const fallbackModule = await import('../Exception.jsx');
          if (isMounted) setContactComponent(() => fallbackModule.default);
        } catch (fallbackError) {
          console.error('Не удалось импортировать Exception.jsx как fallback:', fallbackError);
          if (isMounted)
            setContactComponent(() => ({ message }) => (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'red',
                  fontFamily: 'sans-serif',
                }}
              >
                <h2>{message || 'Ошибка: компонент Contact недоступен'}</h2>
              </div>
            ));
        }
      }
    };

    loadContactSafely();
    return () => {
      isMounted = false;
    };
  }, []);

  // === Загрузка данных контактов ===
  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setIsVisible(true), 100);

    fetch('/src/assets/contactsData.json')
      .then((res) => {
        if (!res.ok) throw new Error('Файл не найден');
        return res.json();
      })
      .then((data) => {
        if (!data || typeof data !== 'object') throw new Error('Некорректный формат JSON');
        setContactsData(data);
        setHasError(false);
      })
      .catch((err) => {
        console.error('Ошибка загрузки контактов:', err.message);
        setHasError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const hasContacts =
    contactsData &&
    typeof contactsData === 'object' &&
    contactsData[activeTab] &&
    Array.isArray(contactsData[activeTab]) &&
    contactsData[activeTab].length > 0;

  // === Если Contact ещё не загружен ===
  if (!ContactComponent) {
    return (
      <div className="contacts-container" style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Загрузка контактов...</p>
      </div>
    );
  }

  return (
    <div className={`contacts-container ${isVisible ? 'visible' : ''}`}>
      <section className="contacts-section">
        <div className="contacts-content">
          {/* === ЗАГОЛОВОК === */}
          <h1 className="contacts-title">Контакты ЦОДД Смоленска</h1>
          <p className="contacts-subtitle">
            Мы всегда на связи, чтобы сделать дороги Смоленска безопаснее и комфортнее для вас
          </p>

          {/* === ПРОВЕРКА ЗАГРУЗКИ === */}
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Загрузка контактов...</p>
            </div>
          ) : hasError ? (
            <Exception message="Контактные данные временно недоступны. Попробуйте позже." />
          ) : !hasContacts ? (
            <Exception message="Контакты для выбранной категории не найдены." />
          ) : (
            <>
              {/* === ТАБЫ === */}
              <div className="contacts-tabs">
                <button
                  className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
                  onClick={() => setActiveTab('general')}
                  type="button"
                >
                  <span className="tab-icon">📞</span>
                  Основные контакты
                </button>
                <button
                  className={`tab-button ${activeTab === 'departments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('departments')}
                  type="button"
                >
                  <span className="tab-icon">🏛️</span>
                  Отделы и службы
                </button>
                <button
                  className={`tab-button ${activeTab === 'addresses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('addresses')}
                  type="button"
                >
                  <span className="tab-icon">📍</span>
                  Адреса и филиалы
                </button>
              </div>

              {/* === КОНТАКТЫ === */}
              <div className="contacts-grid">
                {contactsData[activeTab]?.map((contact, index) => (
                  <div className="contact-card" key={index}>
                    <ContactComponent
                      title={contact.title || 'Без названия'}
                      description={contact.description || 'Описание отсутствует'}
                      phone={contact.phone}
                      email={contact.email}
                      address={contact.address}
                      hours={contact.hours}
                      icon={contact.icon || ' '}
                      onContact={contact.onContact}
                      message="Ошибка: компонент Contact недоступен"
                    />

                    <div className="contact-card-actions">
                      {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="action-button primary">
                          <span className="button-icon">📞</span>
                          Позвонить
                        </a>
                      )}
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="action-button secondary">
                          <span className="button-icon">✉️</span>
                          Написать
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* === ЭКСТРЕННЫЙ РАЗДЕЛ === */}
          <div className="emergency-section">
            <div className="emergency-banner">
              <div className="emergency-icon">🚨</div>
              <div className="emergency-content">
                <h3 className="emergency-title">Экстренная связь</h3>
                <p className="emergency-description">
                  При авариях, неисправностях светофоров или опасных ситуациях на дороге
                </p>
                <div className="emergency-contacts">
                  <a href="tel:112" className="emergency-phone">
                    112
                  </a>
                  <a href="tel:+74812123461" className="emergency-phone">
                    +7 (4812) 12-34-61
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactsPage;
