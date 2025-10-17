/* Хэдер/Навигация */
/* ! За сами переходы отвечает App.jsx ! */

import { useState } from 'react'
import './styles/Header.css'

const Header = ({ setCurrentPage, isAdmin, onLoginClick, onLogoutClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleNavigation = (page) => {
    if (page === 'services') {
      setCurrentPage('home')
      setTimeout(() => {
        const servicesSection = document.getElementById('services-section')
        if (servicesSection) {
          servicesSection.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
        }
      }, 100)
    } else {
      setCurrentPage(page)
    }
    setIsMenuOpen(false)
  }

  // Функция для выхода с автоматическим перенаправлением
  const handleLogout = () => {
    // Получаем текущую страницу
    const currentPage = window.location.pathname || 'home'
    
    // Если находимся на страницах, доступных только админу, перенаправляем на главную
    const adminOnlyPages = ['monitoring', 'news-editor', 'banners-editor', 'services-editor'] // добавьте сюда все страницы редактора
    
    if (adminOnlyPages.some(page => currentPage.includes(page))) {
      setCurrentPage('home')
    }
    
    // Вызываем оригинальную функцию выхода
    onLogoutClick()
    setIsMenuOpen(false)
  }

  const mainMenuItems = [
    { name: 'Главная', page: 'home' },
    { name: 'Сервис', page: 'services' }
  ]

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

  if (isAdmin) {
    mainMenuItems.push({name: 'Мониторинг и аналитика', page: 'monitoring'})
    additionalMenuItems.push({ name: 'Карта', page: 'map' })
  }

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-content">
          <div className="logo">
            <img src="public/logo.svg" alt="логотип ЦОДД" className="logo-img" /> 
          </div>
          
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

            {/* ✅ Кнопки доступа администратора */}
            <div className="admin-buttons">
              {isAdmin ? (
                <button className="logout-button" onClick={handleLogout}>
                  Выйти
                </button>
              ) : (
                <button className="login-button" onClick={onLoginClick}>
                  Вход
                </button>
              )}
            </div>
          </div>

          <div className="burger-menu">
            <button 
              className={`burger-button ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label="Открыть меню"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            
            <div className={`dropdown-menu ${isMenuOpen ? 'active' : ''}`}>
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

                <div className="mobile-admin-buttons">
                  {isAdmin ? (
                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      Выйти из редактора
                    </button>
                  ) : (
                    <button className="dropdown-item login-item" onClick={onLoginClick}>
                      Вход для редактора
                    </button>
                  )}
                </div>
              </div>

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