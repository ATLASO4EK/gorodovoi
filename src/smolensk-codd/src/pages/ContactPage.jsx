import React, { useEffect, useState } from 'react';
import './../styles/ContactsPage.css';

const ContactsPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    window.scrollTo(0, 0);
    
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, []);

  const contactData = {
    general: [
      {
        id: 1,
        title: 'Единый справочный телефон',
        description: 'По этому номеру вы можете получить информацию о дорожной ситуации, работе светофоров и общественного транспорта',
        phone: '+7 (4812) 12-34-56',
        hours: 'Круглосуточно',
        icon: '📞'
      },
      {
        id: 2,
        title: 'Приемная ЦОДД',
        description: 'По вопросам сотрудничества и официальным обращениям',
        phone: '+7 (4812) 12-34-57',
        hours: 'Пн-Пт: 9:00-18:00',
        email: 'reception@codd-smolensk.ru',
        icon: '🏢'
      }
    ],
    departments: [
      {
        id: 1,
        title: 'Отдел организации дорожного движения',
        description: 'Планирование и оптимизация дорожного движения',
        phone: '+7 (4812) 12-34-58',
        hours: 'Пн-Пт: 9:00-18:00',
        icon: '🚦'
      },
      {
        id: 2,
        title: 'Техническая поддержка',
        description: 'Неисправности светофоров, дорожных знаков и оборудования',
        phone: '+7 (4812) 12-34-59',
        hours: 'Круглосуточно',
        icon: '🔧'
      },
      {
        id: 3,
        title: 'Горячая линия для водителей',
        description: 'Консультации по вопросам ПДД и дорожной ситуации',
        phone: '+7 (4812) 12-34-60',
        hours: 'Пн-Вс: 7:00-23:00',
        icon: '🚗'
      }
    ],
    addresses: [
      {
        id: 1,
        title: 'Главный офис',
        address: 'г. Смоленск, ул. Ленина, д. 15, офис 304',
        hours: 'Пн-Пт: 9:00-18:00',
        coordinates: [54.782635, 32.045251],
        icon: '📍'
      },
      {
        id: 2,
        title: 'Оперативный центр',
        address: 'г. Смоленск, ул. Багратиона, д. 8',
        hours: 'Круглосуточно',
        coordinates: [54.789432, 32.051267],
        icon: '🎮'
      }
    ]
  };

  return (
    <>
      <div className={`contacts-container ${isVisible ? 'visible' : ''}`}>
        <section className="contacts-section">
          <div className="contacts-content">
            <h1 className="contacts-title">Контакты ЦОДД Смоленска</h1>
            <p className="contacts-subtitle">
              Мы всегда на связи, чтобы сделать дороги Смоленска безопаснее и комфортнее для вас
            </p>
            
            <div className="contacts-tabs">
              <button 
                className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                <span className="tab-icon">📞</span>
                Основные контакты
              </button>
              <button 
                className={`tab-button ${activeTab === 'departments' ? 'active' : ''}`}
                onClick={() => setActiveTab('departments')}
              >
                <span className="tab-icon">🏛️</span>
                Отделы и службы
              </button>
              <button 
                className={`tab-button ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <span className="tab-icon">📍</span>
                Адреса и филиалы
              </button>
            </div>

            <div className="contacts-grid">
              {contactData[activeTab].map((item) => (
                <div key={item.id} className="contact-card">
                  <div className="contact-card-header">
                    <div className="contact-icon">{item.icon}</div>
                    <h3 className="contact-card-title">{item.title}</h3>
                  </div>
                  <div className="contact-card-content">
                    <p className="contact-description">{item.description}</p>
                    
                    {item.phone && (
                      <div className="contact-info">
                        <span className="info-label">Телефон:</span>
                        <a href={`tel:${item.phone}`} className="info-value phone-link">
                          {item.phone}
                        </a>
                      </div>
                    )}
                    
                    {item.email && (
                      <div className="contact-info">
                        <span className="info-label">Email:</span>
                        <a href={`mailto:${item.email}`} className="info-value email-link">
                          {item.email}
                        </a>
                      </div>
                    )}
                    
                    {item.address && (
                      <div className="contact-info">
                        <span className="info-label">Адрес:</span>
                        <span className="info-value">{item.address}</span>
                      </div>
                    )}
                    
                    <div className="contact-info">
                      <span className="info-label">Режим работы:</span>
                      <span className="info-value hours">{item.hours}</span>
                    </div>
                  </div>
                  
                  <div className="contact-card-actions">
                    {item.phone && (
                      <a href={`tel:${item.phone}`} className="action-button primary">
                        <span className="button-icon">📞</span>
                        Позвонить
                      </a>
                    )}
                    {item.email && (
                      <a href={`mailto:${item.email}`} className="action-button secondary">
                        <span className="button-icon">✉️</span>
                        Написать
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="emergency-section">
              <div className="emergency-banner">
                <div className="emergency-icon">🚨</div>
                <div className="emergency-content">
                  <h3 className="emergency-title">Экстренная связь</h3>
                  <p className="emergency-description">
                    При авариях, неисправностях светофоров или опасных ситуациях на дороге
                  </p>
                  <div className="emergency-contacts">
                    <a href="tel:112" className="emergency-phone">112</a>
                    <a href="tel:+7 (4812) 12-34-61" className="emergency-phone">+7 (4812) 12-34-61</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactsPage;