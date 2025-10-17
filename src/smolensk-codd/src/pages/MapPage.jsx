import { useState, useEffect } from 'react';
import Map from '../objects/Map';
import '../styles/MapPage.css';

const VehicleDropdown = ({ vehicles, value, onChange, disabled }) => {
  const sortedVehicles = [...vehicles].sort((a, b) => (a[1] > b[1] ? 1 : -1));

  return (
    <select value={value} onChange={onChange} disabled={disabled}>
      <option value="">-- Выберите автомобиль --</option>
      {sortedVehicles.length > 0 ? (
        sortedVehicles.map((vehicle, index) => (
          <option key={index} value={vehicle[1]}>
            {vehicle[1]} {vehicle[2] ? `(Маршрут: ${vehicle[2]})` : ''}
          </option>
        ))
      ) : (
        <option value="" disabled>
          -- Нет данных --
        </option>
      )}
    </select>
  );
};

const MapPage = () => {
  const [activeTab, setActiveTab] = useState('scenario3');

  // Общие состояния
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectorsData, setDetectorsData] = useState({});

  const [period, setPeriod] = useState({ start: '2025-10-15T10:00', end: '2025-10-15T12:00' });
  const [routePoints, setRoutePoints] = useState([]);
  const [topRoutes, setTopRoutes] = useState([]);

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [jointAnalysis, setJointAnalysis] = useState(null);
  const [jointRoutes, setJointRoutes] = useState([]);
  const [minNodes, setMinNodes] = useState(3);
  const [filteredMatchingVehicles, setFilteredMatchingVehicles] = useState([]);

  const colors = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
    '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe'
  ];

  useEffect(() => {
    loadDetectors();
    loadVehicles();
  }, []);

  const loadDetectors = async () => {
    try {
      const res = await fetch('/api/v1/tracks_traffic/detectors');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const detectors = {};
      Array.isArray(data) &&
        data.forEach(det => {
          if (Array.isArray(det) && det.length >= 4) {
            detectors[det[1].toUpperCase()] = { lat: parseFloat(det[2]), lon: parseFloat(det[3]) };
          }
        });
      setDetectorsData(detectors);
    } catch (err) {
      console.warn('Failed to load detectors:', err);
    }
  };

  const loadVehicles = async () => {
    try {
      const res = await fetch('/api/v1/tracks_traffic/realtime_routes');
      const data = await res.json();
      console.log('Vehicles API response:', data);
      
      if (Array.isArray(data)) {
        setVehicles(data);
      } else if (data.ok && Array.isArray(data.data)) {
        setVehicles(data.data);
      } else {
        console.warn('Unexpected vehicles format:', data);
        setVehicles([]);
      }
    } catch (err) {
      console.error('Error loading vehicles:', err);
    }
  };

  const loadTopRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
      const startFormatted = period.start.replace('T', ' ');
      const endFormatted = period.end.replace('T', ' ');

      const res = await fetch(`/api/v1/tracks_traffic/clustering?start_ts=${startFormatted}&end_ts=${endFormatted}&top_n=10`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      
      if (!json.ok) {
        throw new Error(json.error || 'Ошибка от сервера');
      }

      const top = json.data || [];
      setTopRoutes(top);

      const routes = top
        .map((route, index) => {
          const points = route.route
            .split(',')
            .map(name => detectorsData[name.trim().toUpperCase()])
            .filter(Boolean);

          return points.length >= 2 ? { 
            route: route.route, 
            stats: route, 
            points, 
            color: colors[index % colors.length] 
          } : null;
        })
        .filter(Boolean);

      setRoutePoints(routes);
      if (!routes.length) setError('Не найдено маршрутов с валидными точками детекторов.');
    } catch (err) {
      console.error(err);
      setError(`Ошибка загрузки: ${err.message}`);
      setRoutePoints([]);
      setTopRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  // СЦЕНАРИЙ 1 - Совместное движение (ПЕРЕПИСАННЫЙ)
  const loadJointAnalysis = async () => {
    if (!selectedVehicle) {
      setError('Выберите автомобиль для анализа');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Получаем анализ совместного движения
      const url = `/api/v1/tracks_traffic/coop_analytics?identificator=${encodeURIComponent(selectedVehicle)}&min_nodes=${minNodes}`;
      console.log('Request URL:', url);

      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const analysisData = await res.json();
      console.log('Joint analysis data:', analysisData);

      // Проверяем, что получили данные в ожидаемом формате
      if (!analysisData.matching_identificators || !analysisData.count_detectors || !analysisData.time_spent_seconds) {
        throw new Error('Неверный формат данных от сервера');
      }

      setJointAnalysis(analysisData);

      // 2. Фильтруем автомобили по минимальному количеству узлов
      const matchingVehicles = analysisData.matching_identificators || [];
      const filteredVehicles = matchingVehicles.filter(vehicle => {
        const nodeCount = analysisData.count_detectors[vehicle];
        return nodeCount >= minNodes;
      });

      console.log('Filtered vehicles:', filteredVehicles);
      setFilteredMatchingVehicles(filteredVehicles);

      // 3. Загружаем маршруты для выбранного и отфильтрованных автомобилей
      const allVehicles = [selectedVehicle, ...filteredVehicles];
      const routes = [];

      for (const vehicle of allVehicles) {
        try {
          const vehicleUrl = `/api/v1/tracks_traffic/realtime_routes?identificator=${encodeURIComponent(vehicle)}`;
          console.log('Fetching vehicle route:', vehicleUrl);

          const vehicleRes = await fetch(vehicleUrl);
          if (!vehicleRes.ok) {
            console.warn(`Failed to load route for vehicle ${vehicle}`);
            continue;
          }

          const vehicleData = await vehicleRes.json();
          console.log(`Vehicle ${vehicle} data:`, vehicleData);

          let routeStr = '';
          
          // Обрабатываем разные форматы ответа
          if (Array.isArray(vehicleData) && vehicleData.length > 0) {
            // Формат: [[id, identificator, route]]
            routeStr = vehicleData[0][2] || '';
          } else if (vehicleData.data && Array.isArray(vehicleData.data) && vehicleData.data.length > 0) {
            // Формат: {data: [[id, identificator, route]]}
            routeStr = vehicleData.data[0][2] || '';
          }

          if (routeStr) {
            const points = routeStr
              .split(',')
              .map(name => {
                const cleanName = name.trim().toUpperCase();
                const detector = detectorsData[cleanName];
                return detector ? { lat: detector.lat, lon: detector.lon } : null;
              })
              .filter(p => p !== null);

            if (points.length >= 2) {
              const nodeCount = analysisData.count_detectors[vehicle] || 0;
              const timeSpent = analysisData.time_spent_seconds[vehicle] || 0;
              
              routes.push({
                vehicle,
                points,
                color: vehicle === selectedVehicle ? '#000000' : colors[(routes.length - 1) % colors.length],
                isMain: vehicle === selectedVehicle,
                nodeCount,
                timeSpent
              });
            }
          }
        } catch (vehicleError) {
          console.warn(`Error processing vehicle ${vehicle}:`, vehicleError);
        }
      }

      console.log('Final joint routes:', routes);
      setJointRoutes(routes);

      if (routes.length === 0) {
        setError('Не удалось построить маршруты совместного движения');
      }

    } catch (err) {
      console.error('Error loading joint analysis:', err);
      setError(`Ошибка загрузки: ${err.message}`);
      setJointAnalysis(null);
      setJointRoutes([]);
      setFilteredMatchingVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // Преобразование jointRoutes в формат для карты
  const getJointRoutePoints = () => {
    return jointRoutes.map(route => ({
      route: `${route.vehicle} (узлов: ${route.nodeCount}, время: ${route.timeSpent}сек)`,
      points: route.points,
      color: route.color,
      stats: {
        vehicles_count: 1,
        intensity_per_hour: 0,
        avg_speed: 0,
        avg_travel_time_sec: route.timeSpent
      },
      isMain: route.isMain,
      nodeCount: route.nodeCount,
      timeSpent: route.timeSpent
    }));
  };

  // Функция для фильтрации результатов (Сценарий 2)
  const filterResults = (durationFilter, nodesFilter) => {
    const filtered = jointRoutes.filter(route => {
      const matchesDuration = !durationFilter || route.timeSpent >= durationFilter;
      const matchesNodes = !nodesFilter || route.nodeCount >= nodesFilter;
      return matchesDuration && matchesNodes;
    });
    
    // Здесь можно обновить отображаемые маршруты
    // В реальной реализации нужно будет управлять состоянием отфильтрованных маршрутов
    console.log('Filtered results:', filtered);
    return filtered;
  };

  return (
    <div className="map-page">
      <div className="tabs">
        <button className={activeTab === 'scenario1' ? 'active' : ''} onClick={() => setActiveTab('scenario1')}>
          Совместное движение
        </button>
        <button className={activeTab === 'scenario3' ? 'active' : ''} onClick={() => setActiveTab('scenario3')}>
          Топ маршрутов
        </button>
      </div>

      {activeTab === 'scenario1' && (
        <div className="scenario-content">
          <h2>Базовый анализ совместного движения</h2>

          <div className="controls">
            <div className="vehicle-controls">
              <label>
                Выберите автомобиль:
                <VehicleDropdown
                  vehicles={vehicles}
                  value={selectedVehicle}
                  onChange={e => setSelectedVehicle(e.target.value)}
                  disabled={loading}
                />
              </label>

              <label>
                Минимальное совпадение узлов:
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={minNodes}
                  onChange={e => setMinNodes(parseInt(e.target.value) || 1)}
                  disabled={loading}
                />
              </label>

              <button onClick={loadJointAnalysis} disabled={!selectedVehicle || loading} className="load-button">
                {loading ? 'Анализ...' : 'Найти совместные движения'}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {jointAnalysis && (
            <div className="analysis-results">
              <h3>Результаты анализа совместного движения</h3>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{filteredMatchingVehicles.length}</div>
                  <div className="stat-label">Совпавших автомобилей</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {jointAnalysis.count_detectors && jointAnalysis.count_detectors[selectedVehicle] 
                      ? jointAnalysis.count_detectors[selectedVehicle] 
                      : 'N/A'}
                  </div>
                  <div className="stat-label">Детекторов у выбранного</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {jointAnalysis.time_spent_seconds && jointAnalysis.time_spent_seconds[selectedVehicle] 
                      ? `${jointAnalysis.time_spent_seconds[selectedVehicle]} сек` 
                      : 'N/A'}
                  </div>
                  <div className="stat-label">Общее время движения</div>
                </div>
              </div>

              {filteredMatchingVehicles.length > 0 && (
                <div className="matching-vehicles">
                  <h4>Совпавшие автомобили (отфильтровано: {filteredMatchingVehicles.length})</h4>
                  <div className="vehicles-list">
                    {filteredMatchingVehicles.slice(0, 20).map((vehicle, index) => (
                      <div key={vehicle} className="vehicle-item">
                        <span className="vehicle-tag" style={{ 
                          borderLeft: `4px solid ${colors[index % colors.length]}` 
                        }}>
                          {vehicle}
                        </span>
                        <span className="vehicle-stats">
                          Узлов: {jointAnalysis.count_detectors[vehicle]}, 
                          Время: {jointAnalysis.time_spent_seconds[vehicle]} сек
                        </span>
                      </div>
                    ))}
                    {filteredMatchingVehicles.length > 20 && (
                      <div className="vehicle-more">
                        ... и еще {filteredMatchingVehicles.length - 20} автомобилей
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="map-container">
            <Map routePoints={getJointRoutePoints()} />
          </div>
        </div>
      )}

      {activeTab === 'scenario3' && (
        <div className="scenario-content">
          <h2>Топ маршрутов</h2>

          <div className="controls">
            <div className="time-controls">
              <label>
                Начало периода:
                <input type="datetime-local" value={period.start} onChange={e => setPeriod({ ...period, start: e.target.value })} disabled={loading} />
              </label>
              <label>
                Конец периода:
                <input type="datetime-local" value={period.end} onChange={e => setPeriod({ ...period, end: e.target.value })} disabled={loading} />
              </label>
            </div>
            <button onClick={loadTopRoutes} disabled={loading} className="load-button">
              {loading ? 'Загрузка...' : 'Показать маршруты'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {topRoutes.length > 0 && (
            <div className="routes-section">
              <h3>Топ-10 самых загруженных маршрутов</h3>
              <div className="table-container">
                <table className="routes-table">
                  <thead>
                    <tr>
                      <th>Цвет</th>
                      <th>Маршрут</th>
                      <th>ТС</th>
                      <th>Интенсивность</th>
                      <th>Скорость (км/ч)</th>
                      <th>Время (сек)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topRoutes.map((route, index) => (
                      <tr key={index}>
                        <td>
                          <div className="color-indicator" style={{ backgroundColor: colors[index % colors.length] }} />
                        </td>
                        <td>{route.route}</td>
                        <td>{route.vehicles_count}</td>
                        <td>{route.intensity_per_hour.toFixed(2)}</td>
                        <td>{route.avg_speed.toFixed(2)}</td>
                        <td>{route.avg_travel_time_sec}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="map-container">
            <Map routePoints={routePoints} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;