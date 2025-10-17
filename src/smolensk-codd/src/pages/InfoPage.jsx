// Страница с Информацией о ЦОДД

import { useEffect, useState } from 'react';
import './../styles/info.css';
import Exception from '../Exception';

const InfoPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [infoData, setInfoData] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setIsVisible(true), 100);
    // Путь к данным здесь \/
    fetch('/src/assets/infoData.json')
      .then((res) => {
        if (!res.ok) throw new Error('Файл не найден');
        return res.json();
      })
      .then((data) => {
        if (!data || typeof data !== 'object') throw new Error('Некорректный формат JSON');
        setInfoData(data);
      })
      .catch((err) => {
        console.warn('Ошибка загрузки данных:', err.message);
        setHasError(true);
      });
  }, []);

  const hasInfo =
    infoData &&
    typeof infoData === 'object' &&
    infoData.about &&
    infoData.goals &&
    infoData.activities;

  return (
    <div className={`info-container ${isVisible ? 'visible' : ''}`}>
      <section className="info-section">
        <div className="info-content">
          {/* === ЗАГЛУШКА === */}
          {hasError || !hasInfo ? (
            <Exception message="Информация временно недоступна. Попробуйте позже." />
          ) : (
            <>
              {/* === О НАС === */}
              <h1 className="info-title">{infoData.about.title || 'О нас'}</h1>
              <div className="content-block">
                <div className="text-content">
                  {Array.isArray(infoData.about.paragraphs)
                    ? infoData.about.paragraphs.map((p, index) => <p key={index}>{p}</p>)
                    : <p>Информация отсутствует</p>}
                </div>
              </div>

              {/* === ЦЕЛИ === */}
              <div className="goals-section">
                <h2 className="section-title">{infoData.goals.title || 'Цели деятельности'}</h2>
                <div className="goals-grid">
                  {Array.isArray(infoData.goals.items)
                    ? infoData.goals.items.map((goal, index) => (
                        <div className="goal-item" key={index}>
                          <div className="goal-icon">✓</div>
                          <p>{goal}</p>
                        </div>
                      ))
                    : <p>Данные о целях отсутствуют</p>}
                </div>
              </div>

              {/* === ВИДЫ ДЕЯТЕЛЬНОСТИ === */}
              <div className="activities-section">
                <h2 className="section-title">{infoData.activities.title || 'Основные виды деятельности'}</h2>
                <div className="activities-list">
                  {Array.isArray(infoData.activities.items)
                    ? infoData.activities.items.map((activity, index) => (
                        <div className="activity-item" key={index}>
                          <span className="activity-number">{index + 1}</span>
                          <p>{activity}</p>
                        </div>
                      ))
                    : <p className="section-title">Данные о деятельности отсутствуют</p>}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default InfoPage;
