'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
const modernMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#bdbdbd' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#181818' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#2c2c2c' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8a8a8a' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#373737' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3c3c3c' }],
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [{ color: '#4e4e4e' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#000000' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3d3d3d' }],
  },
];
interface LocationMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address?: string;
  zoom?: number;
  height?: string;
  showInfoWindow?: boolean;
  darkMode?: boolean;
  className?: string;
}
declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps?: () => void;
  }
}
export function LocationMap({
  latitude,
  longitude,
  title,
  address,
  zoom = 15,
  height = '400px',
  showInfoWindow = true,
  darkMode = true,
  className,
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Google Maps API key chua duoc cau hinh.');
      return;
    }
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      const handleLoad = () => {
        setIsLoaded(true);
      };
      existingScript.addEventListener('load', handleLoad);
      return () => {
        existingScript.removeEventListener('load', handleLoad);
      };
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=vi`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError('Khong the tai Google Maps.');
    document.head.appendChild(script);
    return () => {};
  }, []);
  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;
    const position = { lat: latitude, lng: longitude };
    const map = new google.maps.Map(mapRef.current, {
      center: position,
      zoom,
      styles: darkMode ? modernMapStyles : undefined,
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: false,
      zoomControl: true,
    });
    mapInstanceRef.current = map;
    const marker = new google.maps.Marker({
      position,
      map,
      title,
      animation: google.maps.Animation.DROP,
    });
    markerRef.current = marker;
    if (showInfoWindow) {
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      const infoContent = `
        <div style="padding: 8px; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${title}</h3>
          ${address ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${address}</p>` : ''}
          <a href="${directionsUrl}"
             target="_blank"
             rel="noopener noreferrer"
             style="color: #1a73e8; text-decoration: none; font-size: 14px; display: inline-flex; align-items: center; gap: 4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.71 11.29l-9-9a1 1 0 00-1.42 0l-9 9a1 1 0 000 1.42l9 9a1 1 0 001.42 0l9-9a1 1 0 000-1.42zM14 14.5V12h-4v3H8v-4a1 1 0 011-1h5V7.5l3.5 3.5-3.5 3.5z"/>
            </svg>
            Chi duong
          </a>
        </div>
      `;
      const infoWindow = new google.maps.InfoWindow({
        content: infoContent,
      });
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
      setTimeout(() => {
        infoWindow.open(map, marker);
      }, 500);
    }
  }, [latitude, longitude, title, address, zoom, darkMode, showInfoWindow]);
  useEffect(() => {
    if (isLoaded && !mapInstanceRef.current) {
      initMap();
    }
  }, [isLoaded, initMap]);
  const prevLatLng = useRef({ lat: latitude, lng: longitude });
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const hasChanged =
        prevLatLng.current.lat !== latitude || prevLatLng.current.lng !== longitude;
      if (hasChanged) {
        const position = { lat: latitude, lng: longitude };
        mapInstanceRef.current.setCenter(position);
        markerRef.current.setPosition(position);
        prevLatLng.current = position;
      }
    }
  }, [latitude, longitude]);
  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800',
          className
        )}
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }
  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      {!isLoaded && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
          style={{ height }}
        >
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      )}
      <div ref={mapRef} style={{ height, width: '100%' }} />
    </div>
  );
}
interface StaticMapProps {
  latitude: number;
  longitude: number;
  title?: string;
  address?: string;
  width?: number;
  height?: number;
  zoom?: number;
  className?: string;
}
export function StaticMap({
  latitude,
  longitude,
  title,
  address,
  width = 600,
  height = 300,
  zoom = 15,
  className,
}: StaticMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  if (!apiKey) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800',
          className
        )}
        style={{ height: `${height}px` }}
      >
        <p className="text-sm text-muted-foreground">Google Maps chua duoc cau hinh.</p>
      </div>
    );
  }
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&maptype=roadmap&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;
  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
        <img
          src={staticMapUrl}
          alt={title || 'Location map'}
          width={width}
          height={height}
          className="h-auto w-full object-cover"
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          {title && <h4 className="font-semibold text-white">{title}</h4>}
          {address && <p className="text-sm text-white/80">{address}</p>}
          <span className="mt-2 inline-flex items-center gap-1 text-sm text-white/90">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.71 11.29l-9-9a1 1 0 00-1.42 0l-9 9a1 1 0 000 1.42l9 9a1 1 0 001.42 0l9-9a1 1 0 000-1.42zM14 14.5V12h-4v3H8v-4a1 1 0 011-1h5V7.5l3.5 3.5-3.5 3.5z" />
            </svg>
            Chi duong
          </span>
        </div>
      </a>
    </div>
  );
}
