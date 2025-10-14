// Страница Контактов
import { useEffect, useState } from 'react';
import './../styles/ContactsPage.css';

import Contact from '../objects/Contact';
import Exception from '../objects/Exception';

const ContactsPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [contactsData, setContactsData] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setIsVisible(true), 100);
    
    // 🔹 Исправленный путь к данным
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

              <div className="contacts-grid">
                {contactsData[activeTab]?.map((contact, index) => (
                  <div className="contact-card" key={index}>
                    <Contact
                      title={contact.title || 'Без названия'}
                      description={contact.description || 'Описание отсутствует'}
                      phone={contact.phone}
                      email={contact.email}
                      address={contact.address}
                      hours={contact.hours}
                      icon={contact.icon || ' '}
                      onContact={contact.onContact}
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