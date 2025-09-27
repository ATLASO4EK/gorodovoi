import { useState } from 'react'
import './Header.css'

const Header = ({ setCurrentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

const handleNavigation = (page) => {
    if (page === 'services') {
      
      setCurrentPage('home');
      
      setTimeout(() => {
        const servicesSection = document.getElementById('services-section');
        if (servicesSection) {
          servicesSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);
    } else if (page === 'monitoring') {
      //if admin setCurrentPage('home')
    }
      else {
      setCurrentPage(page);
    }
    setIsMenuOpen(false);
  }

  const mainMenuItems = [
    { name: 'Главная', page: 'home' },
    { name: 'Мониторинг и аналитика', page: 'monitoring' },
    { name: 'Сервисы', page: 'services' }
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

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-content">
          <div className="logo">
            <img src="./public/logo.png" alt="логотип ЦОДД" className="logo-img" /> 
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