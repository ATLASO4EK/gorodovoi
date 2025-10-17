// src/components/Header.jsx
import React, { useState } from 'react'
import './Header.css'

/**
 * Компонент шапки сайта ЦОДД
 * @param {Function} setCurrentPage - Функция для изменения текущей страницы
 */
const Header = ({ setCurrentPage }) => {
  // Состояние для управления мобильным меню
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  /**
   * Переключение состояния мобильного меню
   */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  /**
   * Обработчик навигации по страницам
   * @param {string} page - Ключ целевой страницы
   */
  const handleNavigation = (page) => {
    // Особый случай для страницы "Сервис" - плавный скролл к секции
    if (page === 'services') {
      setCurrentPage('home');
      
      // Задержка для гарантированной загрузки домашней страницы
      setTimeout(() => {
        const servicesSection = document.getElementById('services-section');
        if (servicesSection) {
          servicesSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);
    } else {
      // Стандартная навигация для других страниц
      setCurrentPage(page);
    }
    // Закрываем меню после навигации
    setIsMenuOpen(false);
  }

  // Основные пункты меню для десктопной версии
  const mainMenuItems = [
    { name: 'Главная', page: 'home' },
    { name: 'Мониторинг и аналитика', page: 'monitoring' },
    { name: 'Сервис', page: 'services' }
  ]

  // Дополнительные пункты меню для мобильной версии
  const additionalMenuItems = [
    { name: 'О ЦОДД', page: 'about' },
    { name: 'Команда', page: 'team' },
    { name: 'Проекты', page: 'projects' },
    { name: 'Новости', page: 'news' },
    { name: 'Документы', page: 'documents' },
    { name: 'Вакансии', page: 'vacancies' },
    { name: 'Контакты', page: 'contacts' },
    { name: 'Баннеры', page: 'banners' },
    { name: 'Услуги', page: 'services-list' }
  ]

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-content">
          {/* Логотип */}
          <div className="logo">
            <img 
              src="./public/logo.png" 
              alt="Логотип ЦОДД" 
              className="logo-img" 
            /> 
          </div>
          
          {/* Десктопное меню */}
          <div className="nav-buttons">
            {mainMenuItems.map((item, index) => (
              <button 
                key={index} 
                className="nav-button"
                onClick={() => handleNavigation(item.page)}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Мобильное меню (бургер) */}
          <div className="burger-menu">
            {/* Кнопка бургер-меню */}
            <button 
              className={`burger-button ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label="Открыть меню"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            
            {/* Выпадающее меню */}
            <div className={`dropdown-menu ${isMenuOpen ? 'active' : ''}`}>
              {/* Основные пункты для мобильной версии */}
              <div className="mobile-nav-buttons">
                {mainMenuItems.map((item, index) => (
                  <button 
                    key={index} 
                    className="dropdown-item main-item"
                    onClick={() => handleNavigation(item.page)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
    
              {/* Дополнительные пункты меню */}
              {additionalMenuItems.map((item, index) => (
                <button 
                  key={index} 
                  className="dropdown-item"
                  onClick={() => handleNavigation(item.page)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header