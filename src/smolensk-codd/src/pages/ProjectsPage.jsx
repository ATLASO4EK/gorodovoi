import { useEffect, useState } from 'react';
import './../styles/ProjectsPage.css';
import Exception from '../Exception';

const ProjectsPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [projectsData, setProjectsData] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [ProjectComponent, setProjectComponent] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadProjectSafely = async () => {
      try {
        const module = await import("../objects/Project.jsx");
        if (isMounted) setProjectComponent(() => module.default);
      } catch (error) {
        console.error("Не удалось импортировать Project.jsx, используется Exception.jsx:", error);
        try {
          const fallbackModule = await import("../Exception.jsx");
          if (isMounted) setProjectComponent(() => fallbackModule.default);
        } catch (fallbackError) {
          console.error("Ошибка при загрузке Exception.jsx как fallback:", fallbackError);
          if (isMounted)
            setProjectComponent(() => ({ message }) => (
              <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
                <h2>{message || "Ошибка: компонент Job недоступен"}</h2>
              </div>
            ));
        }
      }
    };

    loadProjectSafely();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setIsVisible(true), 100);

    fetch('/src/assets/projectsData.json')
      .then((res) => {
        if (!res.ok) throw new Error('Файл не найден');
        return res.json();
      })
      .then((data) => {
        if (!data || !Array.isArray(data)) throw new Error('Некорректный формат JSON');
        setProjectsData(data);
      })
      .catch((err) => {
        console.warn('Ошибка загрузки проектов:', err.message);
        setHasError(true);
      });
  }, []);

  const handleProjectClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const hasProjects = projectsData && Array.isArray(projectsData) && projectsData.length > 0;

  if (!ProjectComponent) {
    return (
      <div className="banners-container" style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Загрузка баннеров...</p>
      </div>
    );
  }
  return (
    <div className={`projects-container ${isVisible ? 'visible' : ''}`}>
      <section className="projects-section">
        <div className="projects-content">
          <h1 className="projects-title">Наши проекты</h1>
          <p className="projects-subtitle">
            Активные программы и инициативы по улучшению дорожной ситуации в Смоленске. 
            Мы работаем для вашего комфорта и безопасности на дорогах.
          </p>

          {hasError || !hasProjects ? (
            <Exception message="Проекты временно недоступны. Попробуйте позже." />
          ) : (
            <div className="projects-grid">
              {projectsData.map((project) => (
                <ProjectComponent
                  key={project.id}
                  project={project}
                  onClick={handleProjectClick}
                />
              ))}
            </div>
          )}
          <div className="projects-info">
            <p>Все проекты реализуются в рамках государственных программ и федерального законодательства</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectsPage;
