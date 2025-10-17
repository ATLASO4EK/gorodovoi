import { useEffect, useState, useRef } from 'react';
import '../styles/MapPage.css';
import Map from '../objects/Map';
import Papa from 'papaparse';

const MapPage = () => {
  const [markers, setMarkers] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [minDuration, setMinDuration] = useState(0);
  const [minNodes, setMinNodes] = useState(0);

  const [start1, setStart1] = useState('');
  const [end1, setEnd1] = useState('');
  const [start2, setStart2] = useState('');
  const [end2, setEnd2] = useState('');

  const [jointMovements, setJointMovements] = useState([]);
  const [routesInterval1, setRoutesInterval1] = useState([]);
  const [routesInterval2, setRoutesInterval2] = useState([]);

  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Анимация появления страницы
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Загрузка CSV с детекторами
  useEffect(() => {
    fetch('/src/assets/testdata.csv')
      .then(res => res.text())
      .then(text => {
        const result = Papa.parse(text, { header: true, delimiter: ';', skipEmptyLines: true });
        const points = result.data
          .filter(p => p.Latitude && p.Longitude)
          .map(p => ({
            ...p,
            Latitude: parseFloat(p.Latitude),
            Longitude: parseFloat(p.Longitude),
            visible: true
          }));
        setMarkers(points);
      })
      .catch(console.error);
  }, []);

  // Заглушка: имитация совместного движения (сценарий 2)
  useEffect(() => {
    if (!selectedVehicle) {
      setJointMovements([]);
      return;
    }
    // Здесь позже будет API-запрос
    const filtered = markers
      .filter(m => m.ID_детектора !== selectedVehicle)
      .map((m, i) => ({
        id: i,
        vehicle: m.Name,
        duration: Math.floor(Math.random() * 20 + 5),
        matchedNodes: Math.floor(Math.random() * 10 + 1),
      }))
      .filter(e => e.duration >= minDuration && e.matchedNodes >= minNodes);
    setJointMovements(filtered);
  }, [selectedVehicle, minDuration, minNodes, markers]);

  // Заглушка: маршруты для интервалов (сценарий 4)
  useEffect(() => {
    const generateRoutes = (color) =>
      markers.filter(m => m.visible).slice(0, 5).map((m, i) => ({
        id: `${color}-${i}`,
        path: markers.slice(i, i + 2).map(p => [p.Latitude, p.Longitude]),
        color
      }));

    setRoutesInterval1(generateRoutes('blue'));
    setRoutesInterval2(generateRoutes('red'));
  }, [markers]);

  return (
    <div ref={containerRef} className={`map-page ${isVisible ? 'visible' : ''}`}>
      <div className="map-stats">
        <div className="stat-label">Карта города Смоленска</div>
      </div>

      {/* Панель фильтров и сценариев */}
      <div className="filters-panel">
        {/* Сценарий 2 */}
        <h4>Совместное движение (Сценарий 2)</h4>
        <label>Целевой автомобиль:</label>
        <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
          <option value="">--Выберите--</option>
          {markers.map(m => <option key={m.ID_детектора} value={m.ID_детектора}>{m.Name}</option>)}
        </select>

        <label>Мин. длительность (мин):</label>
        <input type="number" value={minDuration} onChange={e => setMinDuration(+e.target.value)} />

        <label>Мин. совпадений узлов:</label>
        <input type="number" value={minNodes} onChange={e => setMinNodes(+e.target.value)} />

        <div className="events-list">
          {jointMovements.map(event => (
            <div key={event.id}>
              {event.vehicle} | {event.duration} мин | {event.matchedNodes} узлов
            </div>
          ))}
        </div>

        {/* Сценарий 4 */}
        <h4>Сравнение потоков (Сценарий 4)</h4>
        <div>
          <label>Интервал 1</label>
          <input type="time" value={start1} onChange={e => setStart1(e.target.value)} />
          <input type="time" value={end1} onChange={e => setEnd1(e.target.value)} />

          <label>Интервал 2</label>
          <input type="time" value={start2} onChange={e => setStart2(e.target.value)} />
          <input type="time" value={end2} onChange={e => setEnd2(e.target.value)} />
        </div>
      </div>

      {/* Сравнение маршрутов */}
      <div className="routes-comparison">
        {routesInterval1.map(r => <div key={r.id} style={{ color: r.color }}>Маршрут {r.id}</div>)}
        {routesInterval2.map(r => <div key={r.id} style={{ color: r.color }}>Маршрут {r.id}</div>)}
      </div>

      <div className="map-content">
        {/* Карта */}
        <div className="map-container">
          <Map markers={markers} setMarkers={setMarkers} />
        </div>

        {/* Топ детекторов */}
        <div className="top-routes-sidebar">
          <h3>Топ детекторов</h3>
          {markers.length > 0 ? (
            markers.map((m, idx) => (
              <div key={idx} className="top-route-item">
                <input
                  type="checkbox"
                  checked={m.visible}
                  onChange={() =>
                    setMarkers(prev => prev.map((item, i) =>
                      i === idx ? { ...item, visible: !item.visible } : item
                    ))
                  }
                />
                <span>{m.Name} ({m.Latitude.toFixed(6)}, {m.Longitude.toFixed(6)})</span>
              </div>
            ))
          ) : (
            <div>Нет данных о детекторах</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
