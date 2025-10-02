import React from 'react';
import './Footer.css';

const Footer = () => {
  const handleSocialClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-logo">
            <img src="./../public/logo.png" alt="ЦОДД Смоленской области" className="footer-logo-img" />
          </div>
          
          <div className="footer-info">
            <div className="footer-contacts">
              <p className="footer-contact">
                <strong>Приемная:</strong> +7(4812)33-99-69
              </p>
              <p className="footer-contact">
                г. Смоленск, ул. Большая Краснофлотская, д.70
              </p>
              <p className="footer-contact">
                Пн-Чт 08:00-17:00 Пт 08:00-15:00
              </p>
              <p className="footer-contact">
                <strong>Email:</strong> ref@codd67.ru
              </p>
            </div>
          </div>

          <div className="footer-social">
            <button 
              className="social-btn"
              onClick={() => handleSocialClick('https://vk.com/codd67?w=club226522548')}
              aria-label="ВКонтакте"
            >
              <span className="social-icon vk-icon">VK</span>
            </button>
            
            <button 
              className="social-btn"
              onClick={() => handleSocialClick('https://t.me/CODD_roads_bot')}
              aria-label="Телеграм"
            >
              <span className="social-icon tg-icon">TG</span>
            </button>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} ЦОДД Смоленской области</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;