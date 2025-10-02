import React, { useEffect, useState } from 'react';
import './../styles/ProjectsPage.css';

const ProjectsPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  const projectsData = [
    {
      id: 1,
      title: 'Национальный проект "Безопасные качественные дороги"',
      description: 'Участие Смоленской области в федеральной программе ремонта дорог',
      link: 'https://bkdrf.ru/region/smolenskaya-oblast',
      icon: '🛣️'
    },
    {
      id: 2,
      title: 'Система фотовидеофиксации нарушений ПДД',
      description: 'Развитие комплекса автоматической фиксации нарушений правил дорожного движения',
      link: 'https://гибдд.рф/r/67/news',
      icon: '📹'
    },
    {
      id: 3,
      title: 'Электронная парковка',
      description: 'Внедрение системы платной парковки в центральной части города',
      link: 'https://xn--90adear.xn--p1ai/parking',
      icon: '🅿️'
    },
    {
      id: 4,
      title: 'Паспорта дорожной безопасности',
      description: 'Разработка паспортов безопасности дорожного движения для образовательных учреждений',
      link: 'https://гибдд.рф/social/passport',
      icon: '🏫'
    },
    {
      id: 5,
      title: 'Программа "Детство без опасности"',
      description: 'Обучение детей правилам безопасного поведения на дорогах',
      link: 'https://xn--90adear.xn--p1ai/social/childhood',
      icon: '👶'
    },
    {
      id: 6,
      title: 'Интеллектуальная транспортная система',
      description: 'Внедрение умных светофоров и системы управления дорожным движением',
      link: 'https://www.mintrans.ru/documents/4/153',
      icon: '🚦'
    }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleProjectClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`projects-container ${isVisible ? 'visible' : ''}`}>
      <section className="projects-section">
        <div className="projects-content">
          <h1 className="projects-title">Наши проекты</h1>
          <p className="projects-subtitle">
            Активные программы и инициативы по улучшению дорожной ситуации в Смоленске. 
            Мы работаем для вашего комфорта и безопасности на дорогах.
          </p>
          
          <div className="projects-grid">
            {projectsData.map((project) => (
              <div 
                key={project.id} 
                className="project-card"
                onClick={() => handleProjectClick(project.link)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && handleProjectClick(project.link)}
              >
                <div className="project-icon-container">
                  <span className="project-icon">{project.icon}</span>
                </div>
                <div className="project-card-content">
                  <h3 className="project-card-title">{project.title}</h3>
                  <p className="project-card-description">{project.description}</p>
                  <div className="project-link">
                    Перейти к проекту <span className="link-arrow">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="projects-info">
            <p>Все проекты реализуются в рамках государственных программ и федерального законодательства</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectsPage;