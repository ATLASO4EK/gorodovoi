import React from 'react';
import Info from './objects/info/info.jsx';
import Team from './objects/team/team.jsx';
import DocsCategory from './DocsCategory.jsx';
import placeholder from '/placeholder.pdf';

function HomePage() {
  return (
    <>
      <div className="home-page">
        <div className="hero-section">
          <img 
            src="/smolensk.svg" 
            alt="Город Смоленск" 
            className="city-image"
          />
          <div className="hero-text">
            Центр организации<br />дорожного движения
          </div>
        </div>
      </div>
      
      <Info/>
      <Team/>
      <DocsCategory
        category="Первая категория Документов - 00.00.2025"
        docs={[
          { title: "Текстёнок", file: placeholder },
          { title: "Текстёлка", file: placeholder },
          { title: "ТЕКСТИЩЕ", file: placeholder }
        ]}
      />
      <DocsCategory
        category="Вторая категория Документов"
        docs={[
          { title: "Отчёт штрафов там дороги и налоги", file: placeholder },
          { title: "Количество трупов пенгуинов за 2008 год", file: placeholder },
          { title: "Длинноеназвание документа которое я не буду писать", file: placeholder },
          { title: "🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏", file: placeholder }
        ]}
      />
    </>
  );
}

export default HomePage;