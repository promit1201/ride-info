import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/lib/supabase';

// You'll need to get a Mapbox token from https://mapbox.com/
const MAPBOX_TOKEN = 'pk.your-mapbox-token';

interface Vehicle {
  id: string;
  type: 'bus' | 'auto' | 'cab';
  name: string;
  route: string;
  current_location: { lat: number; lng: number };
  stands: string[];
  price: number;
  duration: string;
  next_available: string;
}

interface MapViewComponentProps {
  vehicles?: Vehicle[];
  showRoute?: boolean;
  routeCoordinates?: [number, number][];
  className?: string;
}

const MapViewComponent: React.FC<MapViewComponentProps> = ({
  vehicles = [],
  showRoute = false,
  routeCoordinates = [],
  className = "w-full h-96"
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [77.5946, 12.9716], // Bangalore coordinates as default
      zoom: 12
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Add vehicle markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.vehicle-marker');
    existingMarkers.forEach(marker => marker.remove());

    vehicles.forEach(vehicle => {
      const el = document.createElement('div');
      el.className = 'vehicle-marker';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      
      // Different colors for different vehicle types
      const colors = {
        bus: '#3b82f6',
        auto: '#f59e0b', 
        cab: '#10b981'
      };
      el.style.backgroundColor = colors[vehicle.type];
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false
      }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold">${vehicle.name}</h3>
          <p class="text-sm text-muted-foreground">${vehicle.route}</p>
          <p class="text-sm">₹${vehicle.price} • ${vehicle.duration}</p>
          <p class="text-xs text-green-600">Next: ${vehicle.next_available}</p>
        </div>
      `);

      new mapboxgl.Marker(el)
        .setLngLat([vehicle.current_location.lng, vehicle.current_location.lat])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('mouseenter', () => popup.addTo(map.current!));
      el.addEventListener('mouseleave', () => popup.remove());
    });
  }, [vehicles, mapLoaded]);

  // Add route
  useEffect(() => {
    if (!map.current || !mapLoaded || !showRoute || routeCoordinates.length === 0) return;

    // Add route source and layer
    if (!map.current.getSource('route')) {
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
          }
        }
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });

      // Fit map to route bounds
      const bounds = new mapboxgl.LngLatBounds();
      routeCoordinates.forEach(coord => bounds.extend(coord));
      map.current.fitBounds(bounds, { padding: 50 });
    }

    return () => {
      if (map.current?.getLayer('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }
    };
  }, [showRoute, routeCoordinates, mapLoaded]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted rounded-lg`}>
        <div className="text-center">
          <p className="text-muted-foreground">Map requires Mapbox token</p>
          <p className="text-sm text-muted-foreground">Add your token to see live vehicle tracking</p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className={className} />;
};

export default MapViewComponent;