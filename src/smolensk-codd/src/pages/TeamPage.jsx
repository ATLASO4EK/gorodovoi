import { useState, useEffect } from 'react';
import './../styles/team.css';
import Exception from '../Exception';
import { MissionIcon } from '../assets/Icons';

const TeamPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [TeamComponent, setTeamComponent] = useState(null);

  // Статистика команды
  const teamStats = [
    { number: '50+', label: 'специалистов в команде' },
    { number: '24/7', label: 'работаем для вашей безопасности' },
    { number: '1000+', label: 'решенных задач ежедневно' },
  ];

  // Безопасная загрузка компонента TeamMember
  useEffect(() => {
    let isMounted = true;

    const loadTeamSafely = async () => {
      try {
        const module = await import('../objects/TeamMember.jsx');
        if (isMounted) setTeamComponent(() => module.default);
      } catch (error) {
        console.error('Не удалось импортировать TeamMember.jsx, используется Exception.jsx вместо него:', error);
        try {
          const fallbackModule = await import('../Exception.jsx');
          if (isMounted) setTeamComponent(() => fallbackModule.default);
        } catch (fallbackError) {
          console.error('Не удалось импортировать Exception.jsx как fallback:', fallbackError);
          if (isMounted)
            setTeamComponent(() => ({ message }) => (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'red',
                  fontFamily: 'sans-serif',
                }}
              >
                <h2>{message || 'Ошибка: компонент TeamMember недоступен'}</h2>
              </div>
            ));
        }
      }
    };

    loadTeamSafely();
    return () => {
      isMounted = false;
    };
  }, []);

  // Загрузка данных команды
  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setIsVisible(true), 100);

    fetch('/src/assets/teamData.json')
      .then((res) => {
        if (!res.ok) throw new Error('Файл не найден');
        return res.json();
      })
      .then((data) => {
        if (!data || typeof data !== 'object') throw new Error('Некорректный формат JSON');
        setTeamData(data);
      })
      .catch((err) => {
        console.warn('Ошибка загрузки команды:', err.message);
        setHasError(true);
      });
  }, []);

  // Пока компонент TeamMember не загружен
  if (!TeamComponent) {
    return (
      <div className="team-container" style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Загрузка данных о команде...</p>
      </div>
    );
  }

  // Если ошибка при загрузке JSON
  if (hasError || !teamData) {
    return <Exception message="Информация о команде временно недоступна. Попробуйте позже." />;
  }

  const hasMembers =
    teamData.members && Array.isArray(teamData.members) && teamData.members.length > 0;

  return (
    <div className={`team-container ${isVisible ? 'visible' : ''}`}>
      <header className="team-header">
        <h1>Наша команда</h1>
        <p className="team-subtitle">
          Профессионалы, которые заботятся о вашей безопасности на дорогах
        </p>
      </header>

      {/* Раздел миссии */}
      {teamData.mission && (
        <section className="mission-section">
          <div className="mission-icon">
            <MissionIcon />
          </div>
          <div className="mission-content">
            <h2>{teamData.mission.title || 'Наша миссия'}</h2>
            <p>{teamData.mission.text || 'Информация временно недоступна.'}</p>
          </div>
        </section>
      )}

      {/* Раздел участников команды */}
      <section className="team-members">
        {hasMembers ? (
          teamData.members.map((member, index) => (
            <TeamComponent
              key={index}
              name={member.name}
              position={member.position}
              description={member.description}
              achievements={member.achievements}
              photo={member.photo}
              fallbackPhoto={member.fallbackPhoto}
              badge={member.badge}
              message="Ошибка: компонент TeamMember недоступен"
            />
          ))
        ) : (
          <Exception message="Информация о членах команды временно отсутствует." />
        )}
      </section>

      {/* Статистика */}
      <section className="team-stats">
        {teamStats.map((stat, index) => (
          <div key={index} className="stat-item">
            <div className="stat-number">{stat.number}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default TeamPage;
