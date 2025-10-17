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

  // Сценарий 3 - Топ маршрутов
  const [period, setPeriod] = useState({ start: '2025-10-15T10:00', end: '2025-10-15T12:00' });
  const [routePoints, setRoutePoints] = useState([]);
  const [topRoutes, setTopRoutes] = useState([]);

  // Сценарий 1 - Совместное движение
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [jointAnalysis, setJointAnalysis] = useState(null);
  const [jointRoutes, setJointRoutes] = useState([]);
  const [minNodes, setMinNodes] = useState(3);
  const [filteredMatchingVehicles, setFilteredMatchingVehicles] = useState([]);

  // Сценарий 4 - Сравнение периодов
  const [comparisonPeriods, setComparisonPeriods] = useState({
    periodA: { start: '2025-10-15T08:00', end: '2025-10-15T10:00' },
    periodB: { start: '2025-10-15T17:00', end: '2025-10-15T19:00' }
  });
  const [comparisonRoutes, setComparisonRoutes] = useState({ routesA: [], routesB: [] });
  const [comparisonData, setComparisonData] = useState({ dataA: [], dataB: [] });
  const [comparisonLoading, setComparisonLoading] = useState(false);

  const colors = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
    '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe'
  ];

  // Цвета для сравнения периодов (Период A - теплые тона, Период B - холодные тона)
  const comparisonColorsA = [
    '#ff6b6b', '#ff8e8e', '#ffaaaa', '#ff5252', '#ff3838',
    '#ff1c1c', '#ff0000', '#e60000', '#cc0000', '#b30000'
  ];

  const comparisonColorsB = [
    '#4d94ff', '#66a3ff', '#80b3ff', '#3385ff', '#1a75ff',
    '#0066ff', '#0052cc', '#0047b3', '#003d99', '#003380'
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

  // СЦЕНАРИЙ 3 - Топ маршрутов
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

  // СЦЕНАРИЙ 1 - Совместное движение
  const loadJointAnalysis = async () => {
    if (!selectedVehicle) {
      setError('Выберите автомобиль для анализа');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `/api/v1/tracks_traffic/coop_analytics?identificator=${encodeURIComponent(selectedVehicle)}&min_nodes=${minNodes}`;
      console.log('Request URL:', url);

      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const analysisData = await res.json();
      console.log('Joint analysis data:', analysisData);

      if (!analysisData.matching_identificators || !analysisData.count_detectors || !analysisData.time_spent_seconds) {
        throw new Error('Неверный формат данных от сервера');
      }

      setJointAnalysis(analysisData);

      const matchingVehicles = analysisData.matching_identificators || [];
      const filteredVehicles = matchingVehicles.filter(vehicle => {
        const nodeCount = analysisData.count_detectors[vehicle];
        return nodeCount >= minNodes;
      });

      console.log('Filtered vehicles:', filteredVehicles);
      setFilteredMatchingVehicles(filteredVehicles);

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
          
          if (Array.isArray(vehicleData) && vehicleData.length > 0) {
            routeStr = vehicleData[0][2] || '';
          } else if (vehicleData.data && Array.isArray(vehicleData.data) && vehicleData.data.length > 0) {
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

  // СЦЕНАРИЙ 4 - Сравнение периодов
  const loadComparison = async () => {
    setComparisonLoading(true);
    setError(null);

    try {
      // Загружаем данные для периода A
      const startA = comparisonPeriods.periodA.start.replace('T', ' ');
      const endA = comparisonPeriods.periodA.end.replace('T', ' ');
      
      const resA = await fetch(`/api/v1/tracks_traffic/clustering?start_ts=${startA}&end_ts=${endA}&top_n=10`);
      if (!resA.ok) throw new Error(`HTTP ${resA.status} для периода A`);
      
      const jsonA = await resA.json();
      if (!jsonA.ok) throw new Error(jsonA.error || 'Ошибка от сервера для периода A');

      // Загружаем данные для периода B
      const startB = comparisonPeriods.periodB.start.replace('T', ' ');
      const endB = comparisonPeriods.periodB.end.replace('T', ' ');
      
      const resB = await fetch(`/api/v1/tracks_traffic/clustering?start_ts=${startB}&end_ts=${endB}&top_n=10`);
      if (!resB.ok) throw new Error(`HTTP ${resB.status} для периода B`);
      
      const jsonB = await resB.json();
      if (!jsonB.ok) throw new Error(jsonB.error || 'Ошибка от сервера для периода B');

      const dataA = jsonA.data || [];
      const dataB = jsonB.data || [];

      setComparisonData({ dataA, dataB });

      // Создаем маршруты для отображения на карте
      const routesA = dataA
        .map((route, index) => {
          const points = route.route
            .split(',')
            .map(name => detectorsData[name.trim().toUpperCase()])
            .filter(Boolean);

          return points.length >= 2 ? {
            route: `[Утро] ${route.route}`,
            stats: route,
            points,
            color: comparisonColorsA[index % comparisonColorsA.length],
            period: 'A'
          } : null;
        })
        .filter(Boolean);

      const routesB = dataB
        .map((route, index) => {
          const points = route.route
            .split(',')
            .map(name => detectorsData[name.trim().toUpperCase()])
            .filter(Boolean);

          return points.length >= 2 ? {
            route: `[Вечер] ${route.route}`,
            stats: route,
            points,
            color: comparisonColorsB[index % comparisonColorsB.length],
            period: 'B'
          } : null;
        })
        .filter(Boolean);

      setComparisonRoutes({ routesA, routesB });

      if (routesA.length === 0 && routesB.length === 0) {
        setError('Не найдено маршрутов для сравнения в выбранные периоды');
      }

    } catch (err) {
      console.error('Error loading comparison:', err);
      setError(`Ошибка загрузки сравнения: ${err.message}`);
      setComparisonRoutes({ routesA: [], routesB: [] });
      setComparisonData({ dataA: [], dataB: [] });
    } finally {
      setComparisonLoading(false);
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

  // Получение всех маршрутов для сравнения
  const getComparisonRoutePoints = () => {
    return [...comparisonRoutes.routesA, ...comparisonRoutes.routesB];
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
        <button className={activeTab === 'scenario4' ? 'active' : ''} onClick={() => setActiveTab('scenario4')}>
          Сравнение периодов
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

      {activeTab === 'scenario4' && (
        <div className="scenario-content">
          <h2>Сравнение транспортных потоков в разное время</h2>

          <div className="controls">
            <div className="comparison-controls">
              <div className="period-group">
                <h4>Период A (Утренние часы)</h4>
                <div className="time-controls">
                  <label>
                    Начало:
                    <input 
                      type="datetime-local" 
                      value={comparisonPeriods.periodA.start} 
                      onChange={e => setComparisonPeriods({
                        ...comparisonPeriods,
                        periodA: { ...comparisonPeriods.periodA, start: e.target.value }
                      })} 
                      disabled={comparisonLoading} 
                    />
                  </label>
                  <label>
                    Конец:
                    <input 
                      type="datetime-local" 
                      value={comparisonPeriods.periodA.end} 
                      onChange={e => setComparisonPeriods({
                        ...comparisonPeriods,
                        periodA: { ...comparisonPeriods.periodA, end: e.target.value }
                      })} 
                      disabled={comparisonLoading} 
                    />
                  </label>
                </div>
              </div>

              <div className="period-group">
                <h4>Период B (Вечерние часы)</h4>
                <div className="time-controls">
                  <label>
                    Начало:
                    <input 
                      type="datetime-local" 
                      value={comparisonPeriods.periodB.start} 
                      onChange={e => setComparisonPeriods({
                        ...comparisonPeriods,
                        periodB: { ...comparisonPeriods.periodB, start: e.target.value }
                      })} 
                      disabled={comparisonLoading} 
                    />
                  </label>
                  <label>
                    Конец:
                    <input 
                      type="datetime-local" 
                      value={comparisonPeriods.periodB.end} 
                      onChange={e => setComparisonPeriods({
                        ...comparisonPeriods,
                        periodB: { ...comparisonPeriods.periodB, end: e.target.value }
                      })} 
                      disabled={comparisonLoading} 
                    />
                  </label>
                </div>
              </div>

              <button onClick={loadComparison} disabled={comparisonLoading} className="load-button">
                {comparisonLoading ? 'Сравнение...' : 'Сравнить периоды'}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {(comparisonData.dataA.length > 0 || comparisonData.dataB.length > 0) && (
            <div className="comparison-results">
              <div className="comparison-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#ff6b6b' }}></div>
                  <span>Период A (Утро) - Теплые тона</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#4d94ff' }}></div>
                  <span>Период B (Вечер) - Холодные тона</span>
                </div>
              </div>

              <div className="comparison-tables">
                {comparisonData.dataA.length > 0 && (
                  <div className="period-table">
                    <h3>Топ маршрутов - Период A</h3>
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
                          {comparisonData.dataA.map((route, index) => (
                            <tr key={index}>
                              <td>
                                <div className="color-indicator" style={{ backgroundColor: comparisonColorsA[index % comparisonColorsA.length] }} />
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

                {comparisonData.dataB.length > 0 && (
                  <div className="period-table">
                    <h3>Топ маршрутов - Период B</h3>
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
                          {comparisonData.dataB.map((route, index) => (
                            <tr key={index}>
                              <td>
                                <div className="color-indicator" style={{ backgroundColor: comparisonColorsB[index % comparisonColorsB.length] }} />
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
              </div>
            </div>
          )}

          <div className="map-container">
            <Map routePoints={getComparisonRoutePoints()} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;