import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const Map = ({ markers, setMarkers }) => {
  const mapRef = useRef(null);
  const routingRef = useRef(null);
  const markersLayerRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([54.783, 32.050], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '' }).addTo(mapRef.current);
    }
    const map = mapRef.current;

    // Очистка старых маркеров и маршрутов
    markersLayerRef.current.forEach(m => map.removeLayer(m));
    markersLayerRef.current = [];
    if (routingRef.current) {
      map.removeControl(routingRef.current);
      routingRef.current = null;
    }

    // Добавляем маркеры
    markers.forEach((m, idx) => {
      if (m.visible) {
        const marker = L.marker([m.Latitude, m.Longitude], { icon, draggable: true })
          .addTo(map)
          .bindPopup(m.Name);

        marker.on('dragend', e => {
          const { lat, lng } = e.target.getLatLng();
          setMarkers(prev => prev.map((item, i) =>
            i === idx ? { ...item, Latitude: lat, Longitude: lng } : item
          ));
        });

        markersLayerRef.current.push(marker);
      }
    });

    // Строим маршрут для всех видимых маркеров
    const waypoints = markers.filter(m => m.visible).map(m => L.latLng(m.Latitude, m.Longitude));
    if (waypoints.length >= 2) {
      routingRef.current = L.Routing.control({
        waypoints,
        routeWhileDragging: true,
        lineOptions: { styles: [{ color: 'blue', opacity: 0.7, weight: 5 }] },
        createMarker: () => null
      }).addTo(map);
    }
  }, [markers, setMarkers]);

  return <div id="map" style={{ height: '100vh', width: '100%' }} />;
};

export default Map;
