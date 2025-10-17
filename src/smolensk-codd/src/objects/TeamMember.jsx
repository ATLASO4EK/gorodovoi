/*
  Компонент TeamMember
  Принимает:
  name: str;            name: 'Иван Иванов'
  position: str;        position: 'Руководитель автошколы'
  description: str;     description: 'Опытный инструктор с 10-летним стажем...'
  achievements: array;  achievements: ['10 лет опыта', 'Категория A,B']
  photo: str;           photo: '/images/team/director.webp'
  fallbackPhoto: str;   fallbackPhoto: '/images/team/director.jpg'
  badge: str;           badge: 'Руководитель' (опционально)
*/

import '../styles/team.css';
import { UserIcon } from '../assets/Icons';

function TeamMember({ name, position, description, achievements = [], photo, fallbackPhoto, badge }) {
  return (
    <div className="member-card" data-aos="zoom-in">
      {badge && <div className="member-badge">{badge}</div>}
      <div className="member-photo">
        <picture>
          <source srcSet={photo} type="image/webp" />
          <img
            src={fallbackPhoto}
            alt={name}
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
        {position && <div className="position-badge">{position}</div>}
        <h3>{name}</h3>
        {description && <p className="member-description">{description}</p>}
        {achievements.length > 0 && (
          <div className="achievements">
            {achievements.map((achievement, index) => (
              <span key={index} className="achievement-tag">{achievement}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamMember;
