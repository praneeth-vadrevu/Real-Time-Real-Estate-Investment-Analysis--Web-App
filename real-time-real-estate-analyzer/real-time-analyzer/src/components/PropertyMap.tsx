import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Property {
  zpid: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  livingArea: number;
  propertyType: string;
  imgSrc: string;
  status: string;
  lat?: number;
  lon?: number;
}

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: string | null;
  onPropertySelect?: (zpid: string) => void;
  mapHeight?: string;
}

const defaultCenter: [number, number] = [-71.0589, 42.3601]; // Boston, MA default [lng, lat]
const defaultZoom = 10;

const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedProperty,
  onPropertySelect,
  mapHeight = '500px',
}) => {
  console.log('PropertyMap Component Called/Rendered:', {
    propertiesCount: properties?.length || 0,
    mapHeight,
    hasSelectedProperty: !!selectedProperty,
  });

  // Get Mapbox access token from environment variable
  const rawToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || '';
  const mapboxToken = rawToken.replace(/^["']|["']$/g, '').trim();

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [center, setCenter] = useState<[number, number]>(defaultCenter);
  const [zoom, setZoom] = useState(defaultZoom);

  // Geocoding state for properties without coordinates
  const [geocodedProperties, setGeocodedProperties] = useState<Property[]>(properties);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Debug: Log API key status
  useEffect(() => {
    console.log('PropertyMap Mapbox Token Check:', {
      hasEnvVar: !!process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
      envVarValue: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN ? 'set' : 'not set',
      envVarLength: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN?.length,
      rawToken: rawToken ? `${rawToken.substring(0, 10)}...` : 'empty',
      hasToken: !!mapboxToken,
      tokenLength: mapboxToken?.length,
      tokenPrefix: mapboxToken ? `${mapboxToken.substring(0, 10)}...` : 'empty',
    });
  }, []);

  // Update geocoded properties when properties change (if they have coordinates)
  useEffect(() => {
    const propsWithCoords = properties.filter(p => p.lat && p.lon);
    if (propsWithCoords.length > 0) {
      setGeocodedProperties(properties);
    }
  }, [properties]);

  // Geocode properties using Mapbox Geocoding API
  useEffect(() => {
    const propertiesWithoutCoords = properties.filter(p => !p.lat || !p.lon);
    
    if (propertiesWithoutCoords.length === 0) {
      setGeocodedProperties(properties);
      return;
    }

    if (!mapboxToken) {
      setGeocodedProperties(properties);
      return;
    }

    setIsGeocoding(true);
    const geocoded = [...properties];
    let completed = 0;
    const total = propertiesWithoutCoords.length;

    if (total === 0) {
      setGeocodedProperties(properties);
      setIsGeocoding(false);
      return;
    }

    // Geocode each property using Mapbox Geocoding API
    propertiesWithoutCoords.forEach((property, index) => {
      if (property.address) {
        setTimeout(() => {
          fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(property.address)}.json?access_token=${mapboxToken}&limit=1`
          )
            .then(response => response.json())
            .then(data => {
              if (data.features && data.features.length > 0) {
                const [longitude, latitude] = data.features[0].center;
                const propIndex = geocoded.findIndex(p => p.zpid === property.zpid);
                if (propIndex !== -1) {
                  geocoded[propIndex] = {
                    ...geocoded[propIndex],
                    lat: latitude,
                    lon: longitude,
                  };
                }
              }
              
              completed++;
              
              if (completed === total) {
                setGeocodedProperties(geocoded);
                setIsGeocoding(false);
                
                // Update map bounds after geocoding
                if (mapRef.current) {
                  setTimeout(() => {
                    const propsWithCoords = geocoded.filter(p => p.lat && p.lon);
                    if (propsWithCoords.length > 0) {
                      const lats = propsWithCoords.map(p => p.lat!);
                      const lons = propsWithCoords.map(p => p.lon!);
                      
                      if (propsWithCoords.length === 1) {
                        mapRef.current!.setCenter([propsWithCoords[0].lon!, propsWithCoords[0].lat!]);
                        mapRef.current!.setZoom(14);
                      } else {
                        // Fit bounds
                        const bounds = new mapboxgl.LngLatBounds();
                        propsWithCoords.forEach(p => {
                          bounds.extend([p.lon!, p.lat!]);
                        });
                        mapRef.current!.fitBounds(bounds, { padding: 50 });
                      }
                    }
                  }, 100);
                }
              }
            })
            .catch(error => {
              console.error('Geocoding error:', error);
              completed++;
              if (completed === total) {
                setGeocodedProperties(geocoded);
                setIsGeocoding(false);
              }
            });
        }, index * 200); // Stagger requests to avoid rate limiting
      } else {
        completed++;
        if (completed === total) {
          setGeocodedProperties(geocoded);
          setIsGeocoding(false);
        }
      }
    });
  }, [properties, mapboxToken]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || !mapboxToken) return;

    // Set access token
    mapboxgl.accessToken = mapboxToken;

    // Calculate initial center from properties
    const propsWithCoords = properties.filter(p => p.lat && p.lon);
    let initialCenter = defaultCenter;
    let initialZoom = defaultZoom;

    if (propsWithCoords.length > 0) {
      if (propsWithCoords.length === 1) {
        initialCenter = [propsWithCoords[0].lon!, propsWithCoords[0].lat!];
        initialZoom = 14;
      } else {
        const lats = propsWithCoords.map(p => p.lat!);
        const lons = propsWithCoords.map(p => p.lon!);
        const avgLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length;
        const avgLon = lons.reduce((sum, lon) => sum + lon, 0) / lons.length;
        initialCenter = [avgLon, avgLat];
        initialZoom = 11;
      }
    }

    setCenter(initialCenter);
    setZoom(initialZoom);

    // Create map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCenter,
      zoom: initialZoom,
    });

    // Listen for map load
    mapRef.current.on('load', () => {
      console.log('Mapbox map loaded successfully');
      setIsMapLoaded(true);
      setMapError(null);
    });

    // Listen for map errors
    mapRef.current.on('error', (e) => {
      console.error('Mapbox map error:', e);
      setMapError('Failed to load Mapbox map. Please check your access token.');
      setIsMapLoaded(false);
    });

    // Listen for move events to update center and zoom
    mapRef.current.on('move', () => {
      if (mapRef.current) {
        const mapCenter = mapRef.current.getCenter();
        const mapZoom = mapRef.current.getZoom();
        setCenter([mapCenter.lng, mapCenter.lat]);
        setZoom(mapZoom);
      }
    });

    // Cleanup
    return () => {
      // Remove all markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      // Remove popup
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }

      // Remove map
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapboxToken]); // Only re-run if token changes

  // Update markers when properties change
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Remove existing popup
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    // Add markers for properties with coordinates
    const propertiesWithCoords = geocodedProperties.filter(p => p.lat && p.lon);
    
    propertiesWithCoords.forEach((property) => {
      // Create marker element
      const el = document.createElement('div');
      el.className = 'property-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#dc2626" stroke="#fff" stroke-width="2"/>
          <circle cx="12" cy="12" r="3" fill="#fff"/>
        </svg>
      `;

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([property.lon!, property.lat!])
        .addTo(mapRef.current!);

      // Add click handler
      el.addEventListener('click', () => {
        handleMarkerClick(property.zpid);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if we have multiple properties
    if (propertiesWithCoords.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      propertiesWithCoords.forEach(p => {
        bounds.extend([p.lon!, p.lat!]);
      });
      mapRef.current.fitBounds(bounds, { padding: 50 });
    } else if (propertiesWithCoords.length === 1) {
      mapRef.current.setCenter([propertiesWithCoords[0].lon!, propertiesWithCoords[0].lat!]);
      mapRef.current.setZoom(14);
    }
  }, [geocodedProperties, isMapLoaded]);

  // Update popup when active marker changes
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    // Remove existing popup
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    // Show popup for active marker
    if (activeMarker) {
      const property = geocodedProperties.find(p => p.zpid === activeMarker && p.lat && p.lon);
      if (property) {
        const popupContent = document.createElement('div');
        popupContent.style.padding = '0.5rem';
        popupContent.style.maxWidth = '250px';
        popupContent.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 0.5rem; color: #111827;">
            ${formatPrice(property.price)}
          </div>
          <div style="margin-bottom: 0.5rem; color: #374151; font-size: 0.875rem;">
            ${property.address}
          </div>
          <div style="font-size: 0.75rem; color: #6b7280;">
            <span>${property.bedrooms} bd</span>
            <span style="margin: 0 0.25rem">•</span>
            <span>${property.bathrooms} ba</span>
            <span style="margin: 0 0.25rem">•</span>
            <span>${property.livingArea?.toLocaleString()} sqft</span>
          </div>
          ${property.propertyType ? `<div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">${property.propertyType}</div>` : ''}
        `;

        popupRef.current = new mapboxgl.Popup({ closeOnClick: false })
          .setLngLat([property.lon!, property.lat!])
          .setDOMContent(popupContent)
          .addTo(mapRef.current);

        popupRef.current.on('close', () => {
          setActiveMarker(null);
        });
      }
    }
  }, [activeMarker, geocodedProperties, isMapLoaded]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleMarkerClick = (zpid: string) => {
    setActiveMarker(zpid);
    if (onPropertySelect) {
      onPropertySelect(zpid);
    }
  };

  // Check if access token is missing or empty
  if (!mapboxToken || mapboxToken === '' || mapboxToken === 'your-mapbox-access-token-here') {
    return (
      <div style={{
        height: mapHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: '0.5rem',
        border: '2px solid #fbbf24',
      }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '600px' }}>
          <p style={{ color: '#6b7280', marginBottom: '0.5rem', fontWeight: 600, fontSize: '1.125rem' }}>
            Mapbox Access Token not configured
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>
            The REACT_APP_MAPBOX_ACCESS_TOKEN environment variable is not set or is empty.
          </p>
          <div style={{ 
            backgroundColor: '#f3f4f6', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            marginTop: '1rem',
            textAlign: 'left',
            maxWidth: '500px',
            margin: '1rem auto 0',
          }}>
            <p style={{ color: '#1f2937', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Setup Instructions:
            </p>
            <ol style={{ color: '#4b5563', fontSize: '0.875rem', lineHeight: '1.75', paddingLeft: '1.25rem', margin: 0 }}>
              <li>Open the .env file in: <code style={{ backgroundColor: '#e5e7eb', padding: '0.125rem 0.25rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>real-time-real-estate-analyzer/real-time-analyzer/.env</code></li>
              <li>Add this line (no quotes around the token): <br/><code style={{ backgroundColor: '#e5e7eb', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', display: 'block', marginTop: '0.25rem' }}>REACT_APP_MAPBOX_ACCESS_TOKEN=your-access-token-here</code></li>
              <li>Restart the React development server (stop with Ctrl+C, then run npm start again)</li>
              <li>Get your access token from: <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Mapbox Account</a></li>
            </ol>
            <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '1rem', fontStyle: 'italic' }}>
              Note: Environment variables are only loaded when the server starts. You must restart after adding the token.
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log('PropertyMap rendering:', {
    hasToken: !!mapboxToken,
    tokenValid: !!mapboxToken && mapboxToken.length > 20,
    propertiesCount: properties.length,
    propertiesWithCoords: geocodedProperties.filter(p => p.lat && p.lon).length,
    mapHeight,
    isGeocoding,
    mapError,
    isMapLoaded,
  });

  return (
    <div 
      id="property-map-container"
      style={{ 
        height: mapHeight, 
        width: '100%', 
        borderRadius: '0.5rem', 
        overflow: 'hidden', 
        position: 'relative',
        backgroundColor: '#e5e7eb',
        border: '2px solid #3b82f6',
        minHeight: '400px',
      }}
    >
      {isGeocoding && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          backgroundColor: 'white',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}></div>
          <span style={{ fontSize: '0.875rem', color: '#374151' }}>
            Loading property locations...
          </span>
        </div>
      )}

      {mapError ? (
        <div style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '2rem',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}>
            <svg style={{ width: '24px', height: '24px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: '0.75rem', fontSize: '1.125rem' }}>
            Map Loading Error
          </p>
          <p style={{ color: '#374151', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: '1.5' }}>
            {mapError}
          </p>
        </div>
      ) : (
        <>
          {/* Show loading message if no coordinates yet */}
          {geocodedProperties.filter(p => p.lat && p.lon).length === 0 && properties.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              backgroundColor: 'white',
              padding: '1rem 1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textAlign: 'center',
              maxWidth: '300px',
            }}>
              <p style={{ color: '#374151', marginBottom: '0.5rem', fontWeight: 500 }}>
                {isGeocoding ? 'Loading property locations...' : 'Geocoding properties...'}
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Markers will appear once coordinates are available
              </p>
            </div>
          )}
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
        </>
      )}
    </div>
  );
};

export default PropertyMap;
