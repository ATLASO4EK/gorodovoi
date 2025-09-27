import React from 'react';
import './../styles/ProjectsPage.css';

function Project({ project, onClick }) {
  return (
    <div 
      className="project-card"
      onClick={() => onClick(project.link)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick(project.link)}
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