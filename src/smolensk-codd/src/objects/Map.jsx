import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map = ({ routePoints }) => {
  const mapRef = useRef(null);
  const layersRef = useRef([]);

  useEffect(() => {
    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([54.783, 32.05], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear previous layers
    layersRef.current.forEach(layer => {
      if (layer && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
    layersRef.current = [];

    // Add routes as simple polylines
    routePoints.forEach((route, routeIndex) => {
      if (route.points && route.points.length >= 2) {
        // Create polyline
        const polyline = L.polyline(
          route.points.map(point => [point.lat, point.lon]),
          {
            color: route.color || '#e6194b',
            weight: 6,
            opacity: 0.8,
            smoothFactor: 1
          }
        ).addTo(map);

        // Add popup to polyline
        polyline.bindPopup(`
          <div style="min-width: 250px">
            <h4>${route.isMain ? '🚗 Основной автомобиль' : '🚙 Совпавший автомобиль'}</h4>
            <p><strong>Транспорт:</strong> ${route.route}</p>
            ${route.stats ? `
              <p><strong>ТС в маршруте:</strong> ${route.stats.vehicles_count || 'N/A'}</p>
              <p><strong>Интенсивность:</strong> ${route.stats.intensity_per_hour?.toFixed(2) || 'N/A'}</p>
              <p><strong>Средняя скорость:</strong> ${route.stats.avg_speed?.toFixed(2) || 'N/A'} км/ч</p>
              <p><strong>Время в пути:</strong> ${route.stats.avg_travel_time_sec || 'N/A'} сек</p>
            ` : ''}
            ${route.nodeCount ? `<p><strong>Совпавших узлов:</strong> ${route.nodeCount}</p>` : ''}
            ${route.timeSpent ? `<p><strong>Время вместе:</strong> ${route.timeSpent} сек</p>` : ''}
            <div style="display: flex; align-items: center; margin-top: 8px;">
              <div style="width: 20px; height: 20px; background: ${route.color || '#e6194b'}; margin-right: 8px; border-radius: 2px;"></div>
              <span>Цвет маршрута</span>
            </div>
          </div>
        `);

        layersRef.current.push(polyline);

        // Add markers for each point
        route.points.forEach((point, pointIndex) => {
          const isFirst = pointIndex === 0;
          const isLast = pointIndex === route.points.length - 1;
          
          let iconHtml = '📍';
          if (isFirst) iconHtml = '🚗';
          if (isLast && route.points.length > 1) iconHtml = '🏁';

          const marker = L.marker([point.lat, point.lon], {
            icon: L.divIcon({
              html: iconHtml,
              className: 'custom-marker',
              iconSize: [24, 24]
            })
          })
            .addTo(map)
            .bindPopup(`
              <div>
                <strong>${isFirst ? 'Начало' : isLast ? 'Конец' : 'Точка'} маршрута</strong><br/>
                <strong>Детектор:</strong> ${route.route.split(',')[pointIndex] || `Точка ${pointIndex + 1}`}<br/>
                <strong>Координаты:</strong> ${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}
              </div>
            `);
          
          layersRef.current.push(marker);
        });
      }
    });

    // Fit map to show all routes
    if (routePoints.length > 0 && routePoints.some(route => route.points && route.points.length > 0)) {
      const allPoints = routePoints.flatMap(route => 
        route.points ? route.points.map(point => [point.lat, point.lon]) : []
      );
      
      if (allPoints.length > 0) {
        try {
          const bounds = L.latLngBounds(allPoints);
          map.fitBounds(bounds.pad(0.1));
        } catch (error) {
          console.warn('Error fitting bounds:', error);
        }
      }
    }

  }, [routePoints]);

  return <div id="map" style={{ width: '100%', height: '100%' }} />;
};

export default Map;