import React from 'react';
import './../styles/BannersPage.css';

function Banner({ title, description, link, icon }) {
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
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="banner-image-container">
        <div className="banner-image-placeholder">
          <span className="banner-icon">{icon}</span>
          <span className="banner-category">Партнерский проект</span>
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