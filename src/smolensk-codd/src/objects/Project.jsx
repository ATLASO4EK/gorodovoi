/*Объект-Шаблон Проекта*/
import './../styles/ProjectsPage.css';

  /*
  Принимает:          Пример:
  title: str;         "title": "Национальный проект \"Безопасные качественные дороги\"",
  description: str;   "description": "Участие Смоленской области в федеральной программе ремонта дорог",
  link: str;          "link": "https://bkdrf.ru/region/smolenskaya-oblast",
  icon: str;          "icon": "🛣️"

  Использование: pages/ProjectsPage.jsx => projectsData (assets/projectsData.json)
  */

function Project({ project, onClick }) {
  return (
    <div 
      className="project-card"
      onClick={() => onClick(project.link)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(project.link)}
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
  );
}

export default Project;