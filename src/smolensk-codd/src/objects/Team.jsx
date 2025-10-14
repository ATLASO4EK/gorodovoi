import { useState, useEffect } from 'react';
import './../styles/team.css'


const UserPlusIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 8V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GrowthIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 6H23V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MissionIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 6V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 16V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 12H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const UserIcon = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22H20.59Z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const Team = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const teamData = {
    director: {
      name: "Гильденков Андрей Михайлович",
      position: "Директор",
      photo: "/images/director.webp",
      fallbackPhoto: "/images/director.jpg",
      description: "Обеспечиваем безопасность и комфорт на дорогах нашего города",
      achievements: ["15+ лет опыта", "Эксперт в транспортной логистике", "Лидер команды профессионалов"]
    },
    mission: {
      title: "Наша миссия",
      text: "Мы работаем для того, чтобы дороги стали безопаснее, а передвижение по городу — комфортнее для каждого жителя. Ваша безопасность — наш главный приоритет."
    }
  };

  return (
    <div className={`team-container ${isVisible ? 'visible' : ''}`}>
      <div className="team-header">
        <h1>Наша команда</h1>
        <p className="team-subtitle">Профессионалы, которые заботятся о вашей безопасности на дорогах</p>
      </div>
      
      <div className="mission-section">
        <div className="mission-icon">
          <MissionIcon />
        </div>
        <div className="mission-content">
          <h2>{teamData.mission.title}</h2>
          <p>{teamData.mission.text}</p>
        </div>
      </div>

      <div className="team-members">
   

        <div className="member-card director" data-aos="zoom-in">
          <div className="member-badge">Руководитель</div>
          <div className="member-photo">
            <picture>
              <source srcSet={teamData.director.photo} type="image/webp" />
              <img 
                src={teamData.director.fallbackPhoto} 
                alt={teamData.director.name}
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="photo-fallback">
                <UserIcon />
              </div>
            </picture>
          </div>
          <div className="member-info">
            <div className="position-badge">{teamData.director.position}</div>
            <h3>{teamData.director.name}</h3>
            <p className="member-description">{teamData.director.description}</p>
            <div className="achievements">
              {teamData.director.achievements.map((achievement, index) => (
                <span key={index} className="achievement-tag">{achievement}</span>
              ))}
            </div>
          </div>
        </div>

   
    
      </div>


      <div className="team-stats">
        <div className="stat-item">
          
          <div className="stat-number">50+</div>
          <div className="stat-label">профессионалов в команде</div>
        </div>
        <div className="stat-item">
          
          <div className="stat-number">24/7</div>
          <div className="stat-label">работаем для вашей безопасности</div>
        </div>
        <div className="stat-item">
          
          <div className="stat-number">1000+</div>
          <div className="stat-label">решенных задач ежедневно</div>
        </div>
      </div>

    

    </div>
  );
};

export default Team;