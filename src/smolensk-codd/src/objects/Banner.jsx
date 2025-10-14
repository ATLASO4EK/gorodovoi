/*Объект-Шаблон Баннера*/
import '../styles/BannersPage.css';

  /*
  Принимает:          Пример:
  title: str;         title: 'Правительство Смоленской области',
  category: str;      category: 'Партнерский проект',
  description: str;   description: 'Официальный портал органов государственной власти Смоленской области',
  link: str;          link: 'https://www.admin-smolensk.ru/',
  icon: str;          icon: '🏛️'

  Использование: pages/BannerPage.jsx => bannersData (assets/bannersData.json)
  */

function Banner({ title, category, description, link, icon }) {
  const handleClick = () => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="banner-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="banner-image-container">
        <div className="banner-image-placeholder">
          <span className="banner-icon">{icon}</span>
          <span className="banner-category">{category}</span>
        </div>
      </div>
      <div className="banner-card-content">
        <h3 className="banner-card-title">{title}</h3>
        <p className="banner-description">{description}</p>
        <div className="banner-link">
          <span className="link-arrow">→</span>
          Перейти к проекту
        </div>
      </div>
    </div>
  );
}

export default Banner;