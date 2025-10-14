// objects/TrafficJams.jsx
import React, { useState, useEffect } from 'react';
import './../styles/TrafficJams.css';

const TrafficJams = () => {
  const [jamsData, setJamsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchJamsData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const URL = import.meta.env.VITE_API_BASE || "";
      console.log('Fetching jams data from:', URL + 'api/v1/jams');
      
      const response = await fetch(URL + 'api/v1/jams');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received jams data:', data);
      
      // Проверяем разные форматы данных
      if (Array.isArray(data)) {
        setJamsData(data);
      } else {
        // Если API возвращает другой формат, создаем тестовые данные
        console.warn('Unexpected data format, using sample data');
        const now = new Date().getHours();
        const sampleData = [
          [now, 2],
          [now + 1, 4],
          [now + 2, 7],
          [now + 3, 3]
        ];
        setJamsData(sampleData);
      }
    } catch (err) {
      console.error('Ошибка загрузки пробок:', err);
      
      // Создаем тестовые данные при ошибке
      const now = new Date().getHours();
      const sampleData = [
        [now, 2],
        [now + 1, 4],
        [now + 2, 7],
        [now + 3, 3]
      ];
      setJamsData(sampleData);
      setError('Реальные данные временно недоступны. Показаны тестовые данные.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchJamsData();
    }
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const getJamLevel = (score) => {
    if (score <= 3) return { level: 'Низкая', color: '#4CAF50', emoji: '🟢' };
    if (score <= 6) return { level: 'Средняя', color: '#FF9800', emoji: '🟡' };
    return { level: 'Высокая', color: '#F44336', emoji: '🔴' };
  };

  const formatTime = (hour) => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (hour === currentHour) return 'Сейчас';
    if (hour === currentHour + 1) return 'Через 1 час';
    if (hour === currentHour + 2) return 'Через 2 часа';
    if (hour === currentHour + 3) return 'Через 3 часа';
    
    return `${hour}:00`;
  };

  return (
    <>
      {/* Кнопка для открытия меню пробок */}
      <button 
        className="traffic-jams-button"
        onClick={toggleMenu}
        aria-label="Показать информацию о пробках"
      >
        <span className="traffic-jams-icon">🚦</span>
        <span className="traffic-jams-text">Пробки</span>
      </button>

      {/* Модальное окно с информацией о пробках */}
      {isOpen && (
        <div className="traffic-jams-overlay" onClick={toggleMenu}>
          <div className="traffic-jams-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="traffic-jams-close"
              onClick={toggleMenu}
              aria-label="Закрыть"
            >
              <span>×</span>
            </button>

            <div className="traffic-jams-header">
              <h2 className="traffic-jams-title">Пробки в Смоленске</h2>
              <p className="traffic-jams-subtitle">
                Прогноз загруженности дорог на ближайшие 4 часа
              </p>
            </div>

            {isLoading && (
              <div className="traffic-jams-loading">
                <div className="loading-spinner"></div>
                <p>Загрузка данных...</p>
              </div>
            )}

            {error && (
              <div className="traffic-jams-error">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            {!isLoading && jamsData.length > 0 && (
              <div className="traffic-jams-content">
                <div className="jams-grid">
                  {jamsData.map(([hour, score], index) => {
                    const jamInfo = getJamLevel(score);
                    return (
                      <div key={index} className="jam-item">
                        <div className="jam-time">{formatTime(hour)}</div>
                        <div 
                          className="jam-indicator"
                          style={{ backgroundColor: jamInfo.color }}
                        >
                          <span className="jam-emoji">{jamInfo.emoji}</span>
                          <span className="jam-score">{score} баллов</span>
                        </div>
                        <div className="jam-level" style={{ color: jamInfo.color }}>
                          {jamInfo.level}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="traffic-jams-legend">
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#4CAF50' }}></span>
                    <span>Низкая (0-3 балла)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#FF9800' }}></span>
                    <span>Средняя (4-6 баллов)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#F44336' }}></span>
                    <span>Высокая (7-10 баллов)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TrafficJams;