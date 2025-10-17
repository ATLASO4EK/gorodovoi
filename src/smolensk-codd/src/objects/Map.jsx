import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default markers in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map = ({ routePoints }) => {
  const mapRef = useRef(null);
  const routingControlsRef = useRef([]);
  const markersRef = useRef([]);

  useEffect(() => {
    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([54.783, 32.05], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear previous routing controls
    routingControlsRef.current.forEach(control => {
      if (control) {
        try {
          map.removeControl(control);
        } catch (err) {
          console.warn('Error removing routing control:', err);
        }
      }
    });
    routingControlsRef.current = [];

    // Clear previous markers
    markersRef.current.forEach(marker => {
      if (marker && map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    });
    markersRef.current = [];

    // Add routes with leaflet-routing-machine
    routePoints.forEach((route, routeIndex) => {
      if (route.points && route.points.length >= 2) {
        const waypoints = route.points.map(point => 
          L.latLng(point.lat, point.lon)
        );

        try {
          // Create routing control for road-based routing
          const routingControl = L.Routing.control({
            waypoints: waypoints,
            lineOptions: {
              styles: [
                { 
                  color: route.color || '#e6194b', 
                  weight: 6,
                  opacity: 0.8
                }
              ],
              extendToWaypoints: true,
              missingRouteTolerance: 0
            },
            show: false, // Hide instructions panel
            addWaypoints: false,
            routeWhileDragging: false,
            draggableWaypoints: false,
            fitSelectedRoutes: false,
            showAlternatives: false,
            createMarker: function() { return null; } // Disable default markers
          });

          // Add to map and store reference
          routingControl.addTo(map);
          routingControlsRef.current.push(routingControl);

          // Add custom markers for each point
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
            
            markersRef.current.push(marker);
          });

          // Add popup to the route line (we'll add it when the route is ready)
          routingControl.on('routesfound', function(e) {
            const routes = e.routes;
            if (routes && routes.length > 0) {
              const routeLine = routes[0].coordinates;
              
              // Create a polyline for the actual route to attach popup
              const routePolyline = L.polyline(routeLine, {
                color: route.color || '#e6194b',
                weight: 6,
                opacity: 0
              }).addTo(map);
              
              routePolyline.bindPopup(`
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
              
              markersRef.current.push(routePolyline);
            }
          });

        } catch (error) {
          console.warn('Error creating routing control, falling back to polyline:', error);
          
          // Fallback: create simple polyline if routing fails
          const polyline = L.polyline(
            waypoints,
            {
              color: route.color || '#e6194b',
              weight: 6,
              opacity: 0.8
            }
          ).addTo(map);
          
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
          markersRef.current.push(polyline);
        }
      }
    });

    // Fit map to show all routes after a delay to allow routing to complete
    setTimeout(() => {
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
    }, 2000); // Increased delay for routing to complete

  }, [routePoints]);

  return <div id="map" style={{ width: '100%', height: '100%' }} />;
};

export default Map;