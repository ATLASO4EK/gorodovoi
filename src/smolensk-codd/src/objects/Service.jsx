import '../styles/HomePage.css';

/*
  Объект-Шаблон Сервиса

  Принимает:          Пример:
  id: str/int;        id: 1,
  title: str;         title: 'Телеграм-бот ЦОДД',
  description: str;   description: 'Быстрый доступ к сервисам и информации',
  badge: str;         badge: 'Новинка',
  icon: str;          icon: 'telegram',
  action: str;        action: 'openTelegramBot'

  Использование: pages/HomePage.jsx => servicesData (assets/Service.js)
*/

function Service({ id, title, description, badge, icon, action, link, onAction }) {
  const getServiceIcon = (iconName) => {
    switch (iconName) {
      case 'telegram':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 
                     12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 
                     9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 
                     1.394c-.16.16-.295.295-.605.295l.213-3.053 
                     5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 
                     4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458
                     c.535-.196 1.006.128.832.941z"/>
          </svg>
        );
      case 'parking':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 21h14c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-4V5
                     c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 
                     2 2zM7 5h4v6H7V5zm0 8h10v6H7v-6z"/>
          </svg>
        );
      case 'map':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9
                     c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 
                     18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5
                     c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  // Обработка клика
  const handleClick = () => {
    if (link) {
      // если есть ссылка — открываем её
      window.open(link, '_blank', 'noopener,noreferrer');
    } else if (onAction && action) {
      // если есть действие — вызываем колбэк
      onAction(action);
    } else {
      console.log('Нет действия или ссылки для сервиса:', title);
    }
  };

  return (
    <div
      className="service-banner-home"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="service-banner-content">
        <div className="service-banner-left">
          <div className="service-icon">
            {getServiceIcon(icon)}
          </div>
          <div className="service-banner-text">
            <h3 className="service-banner-title">{title}</h3>
            <p className="service-banner-description">{description}</p>
          </div>
        </div>
        <div className="service-banner-right">
          <span className="service-banner-badge">{badge}</span>
          <span className="service-banner-arrow">→</span>
        </div>
      </div>
    </div>
  );
}

export default Service;