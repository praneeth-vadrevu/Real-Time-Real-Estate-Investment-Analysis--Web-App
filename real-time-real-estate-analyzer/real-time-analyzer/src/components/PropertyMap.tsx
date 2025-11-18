import React, { useCallback, useMemo } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

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

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 42.3601, // Boston, MA default
  lng: -71.0589,
};

// Static libraries array - must be defined outside component to prevent LoadScript reload
const GOOGLE_MAPS_LIBRARIES: ("places" | "drawing" | "geometry" | "visualization")[] = ['places'];

const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedProperty,
  onPropertySelect,
  mapHeight = '500px',
}) => {
  // Log immediately when component is called
  console.log('PropertyMap Component Called/Rendered:', {
    propertiesCount: properties?.length || 0,
    mapHeight,
    hasSelectedProperty: !!selectedProperty,
  });

  const [activeMarker, setActiveMarker] = React.useState<string | null>(null);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [mapError, setMapError] = React.useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = React.useState(false);

  // Get Google Maps API key from environment variable (remove quotes if present)
  const rawApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  const googleMapsApiKey = rawApiKey.replace(/^["']|["']$/g, '').trim();
  
  // Debug: Log API key status
  React.useEffect(() => {
    console.log('PropertyMap API Key Check:', {
      hasEnvVar: !!process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
      envVarValue: process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? 'set' : 'not set',
      envVarLength: process.env.REACT_APP_GOOGLE_MAPS_API_KEY?.length,
      rawApiKey: rawApiKey ? `${rawApiKey.substring(0, 10)}...` : 'empty',
      hasApiKey: !!googleMapsApiKey,
      apiKeyLength: googleMapsApiKey?.length,
      apiKeyPrefix: googleMapsApiKey ? `${googleMapsApiKey.substring(0, 10)}...` : 'empty',
    });
  }, []);

  // Geocoding state for properties without coordinates
  const [geocodedProperties, setGeocodedProperties] = React.useState<Property[]>(properties);
  const [isGeocoding, setIsGeocoding] = React.useState(false);
  
  // Debug: Log API key status
  React.useEffect(() => {
    console.log('PropertyMap Debug:', {
      hasApiKey: !!googleMapsApiKey,
      apiKeyLength: googleMapsApiKey?.length,
      propertiesCount: properties.length,
      propertiesWithCoords: properties.filter(p => p.lat && p.lon).length,
      geocodedCount: geocodedProperties.filter(p => p.lat && p.lon).length,
    });
  }, [googleMapsApiKey, properties, geocodedProperties]);

  // Update geocoded properties when properties change (if they have coordinates)
  React.useEffect(() => {
    const propsWithCoords = properties.filter(p => p.lat && p.lon);
    if (propsWithCoords.length > 0) {
      setGeocodedProperties(properties);
    }
  }, [properties]);

  // Geocode properties using Google Maps JavaScript API Geocoder (after map loads)
  React.useEffect(() => {
    // Wait for Google Maps API to load
    const waitForGoogleMaps = () => {
      if (typeof google === 'undefined' || !google.maps || !google.maps.Geocoder) {
        // Retry after a delay
        setTimeout(waitForGoogleMaps, 500);
        return;
      }

      // Only geocode if we have a map instance
      if (!map) {
        return;
      }

      const propertiesWithoutCoords = properties.filter(p => !p.lat || !p.lon);
      
      if (propertiesWithoutCoords.length === 0) {
        setGeocodedProperties(properties);
        return;
      }

      if (!googleMapsApiKey) {
        setGeocodedProperties(properties);
        return;
      }

      setIsGeocoding(true);
      const geocoded = [...properties];
      const geocoder = new google.maps.Geocoder();
      let completed = 0;
      const total = propertiesWithoutCoords.length;

      if (total === 0) {
        setGeocodedProperties(properties);
        setIsGeocoding(false);
        return;
      }

      // Geocode each property using Google Maps Geocoder
      propertiesWithoutCoords.forEach((property, index) => {
        if (property.address) {
          setTimeout(() => {
            geocoder.geocode({ address: property.address }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const location = results[0].geometry.location;
                const propIndex = geocoded.findIndex(p => p.zpid === property.zpid);
                if (propIndex !== -1) {
                  geocoded[propIndex] = {
                    ...geocoded[propIndex],
                    lat: location.lat(),
                    lon: location.lng(),
                  };
                }
              }
              
              completed++;
              
              if (completed === total) {
                setGeocodedProperties(geocoded);
                setIsGeocoding(false);
                
                // Update map bounds after geocoding
                setTimeout(() => {
                  const propsWithCoords = geocoded.filter(p => p.lat && p.lon);
                  if (propsWithCoords.length > 1 && map) {
                    const bounds = new google.maps.LatLngBounds();
                    propsWithCoords.forEach(p => {
                      if (p.lat && p.lon) {
                        bounds.extend(new google.maps.LatLng(p.lat, p.lon));
                      }
                    });
                    map.fitBounds(bounds);
                  } else if (propsWithCoords.length === 1 && map) {
                    map.setCenter({
                      lat: propsWithCoords[0].lat!,
                      lng: propsWithCoords[0].lon!,
                    });
                    map.setZoom(14);
                  }
                }, 100);
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
    };

    waitForGoogleMaps();
  }, [properties, map, googleMapsApiKey]);

  // Filter properties with valid coordinates
  const propertiesWithCoords = geocodedProperties.filter(p => p.lat && p.lon);

  // Calculate map center and bounds from properties
  // If no properties have coordinates, use default center or try to use first property's address
  const mapCenter = useMemo(() => {
    // If we have properties with coordinates, center on them
    if (propertiesWithCoords.length > 0) {
      if (propertiesWithCoords.length === 1) {
        return {
          lat: propertiesWithCoords[0].lat!,
          lng: propertiesWithCoords[0].lon!,
        };
      }
      // Calculate center of all properties
      const avgLat = propertiesWithCoords.reduce((sum, p) => sum + p.lat!, 0) / propertiesWithCoords.length;
      const avgLng = propertiesWithCoords.reduce((sum, p) => sum + p.lon!, 0) / propertiesWithCoords.length;
      return { lat: avgLat, lng: avgLng };
    }
    
    // If no coordinates but we have properties, use default center (will geocode later)
    if (properties.length > 0) {
      return defaultCenter;
    }
    
    // Default center (Boston, MA)
    return defaultCenter;
  }, [propertiesWithCoords, properties]);

  // Handle map load - fit bounds to properties
  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    
    // Listen for map errors (including ApiTargetBlockedMapError)
    google.maps.event.addListenerOnce(mapInstance, 'error', (error: any) => {
      console.error('GoogleMap instance error:', error);
      const errorStr = String(error);
      if (errorStr.includes('ApiTargetBlocked') || errorStr.includes('ApiTargetBlockedMapError')) {
        setMapError('API key restrictions are blocking the map. Please update your Google Maps API key restrictions to allow localhost:3000. See error message above for detailed instructions.');
      }
    });
    
    // Fit bounds initially for properties with coordinates
    const initialPropsWithCoords = properties.filter(p => p.lat && p.lon);
    if (initialPropsWithCoords.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      initialPropsWithCoords.forEach(p => {
        if (p.lat && p.lon) {
          bounds.extend(new google.maps.LatLng(p.lat, p.lon));
        }
      });
      mapInstance.fitBounds(bounds);
    } else if (initialPropsWithCoords.length === 1) {
      mapInstance.setCenter({
        lat: initialPropsWithCoords[0].lat!,
        lng: initialPropsWithCoords[0].lon!,
      });
      mapInstance.setZoom(14);
    }
    
    // Update bounds when geocoded properties are available
    const updateBounds = () => {
      const propsWithCoords = geocodedProperties.filter(p => p.lat && p.lon);
      if (propsWithCoords.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        propsWithCoords.forEach(p => {
          if (p.lat && p.lon) {
            bounds.extend(new google.maps.LatLng(p.lat, p.lon));
          }
        });
        mapInstance.fitBounds(bounds);
      } else if (propsWithCoords.length === 1) {
        mapInstance.setCenter({
          lat: propsWithCoords[0].lat!,
          lng: propsWithCoords[0].lon!,
        });
        mapInstance.setZoom(14);
      }
    };
    
    // Check periodically for geocoded properties
    const interval = setInterval(() => {
      if (geocodedProperties.length > 0 && geocodedProperties.some(p => p.lat && p.lon)) {
        updateBounds();
        clearInterval(interval);
      }
    }, 500);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [properties, geocodedProperties]);

  // Fit bounds to show all properties
  const onLoad = useCallback((map: google.maps.Map) => {
    handleMapLoad(map);
  }, [handleMapLoad]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

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

  const handleInfoWindowClose = () => {
    setActiveMarker(null);
  };


  // Check if API key is missing or empty
  if (!googleMapsApiKey || googleMapsApiKey === '' || googleMapsApiKey === 'your-google-maps-api-key-here') {
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
            Google Maps API key not configured
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>
            The REACT_APP_GOOGLE_MAPS_API_KEY environment variable is not set or is empty.
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
              <li>Add this line (no quotes around the key): <br/><code style={{ backgroundColor: '#e5e7eb', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', display: 'block', marginTop: '0.25rem' }}>REACT_APP_GOOGLE_MAPS_API_KEY=your-api-key-here</code></li>
              <li>Restart the React development server (stop with Ctrl+C, then run npm start again)</li>
              <li>Get your API key from: <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Google Cloud Console</a></li>
            </ol>
            <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '1rem', fontStyle: 'italic' }}>
              Note: Environment variables are only loaded when the server starts. You must restart after adding the key.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Don't show loading screen - show map instead and geocode in background

  // Show loading state while geocoding (but still show map)

  // Always show map if API key is available, even while geocoding
  // Check if API key is valid
  const hasValidApiKey = googleMapsApiKey && 
                         googleMapsApiKey !== '' && 
                         !googleMapsApiKey.includes('your-google-maps-api-key') &&
                         googleMapsApiKey.length > 20;
  
  if (!hasValidApiKey) {
    console.warn('Google Maps API key not configured or invalid:', {
      hasKey: !!googleMapsApiKey,
      keyLength: googleMapsApiKey?.length,
      isPlaceholder: googleMapsApiKey?.includes('your-google-maps-api-key'),
    });
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
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#6b7280', marginBottom: '0.5rem', fontWeight: 600 }}>
            Google Maps API key not configured
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file (no quotes)
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
            Current value: {googleMapsApiKey ? `${googleMapsApiKey.substring(0, 10)}...` : 'not set'}
          </p>
          <div style={{ 
            backgroundColor: '#f3f4f6', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            marginTop: '1rem',
            textAlign: 'left',
            maxWidth: '500px',
          }}>
            <p style={{ color: '#1f2937', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Setup Instructions:
            </p>
            <ol style={{ color: '#4b5563', fontSize: '0.875rem', lineHeight: '1.75', paddingLeft: '1.25rem', margin: 0 }}>
              <li>Create a .env file in: <code style={{ backgroundColor: '#e5e7eb', padding: '0.125rem 0.25rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>real-time-real-estate-analyzer/real-time-analyzer/.env</code></li>
              <li>Add this line (no quotes around the key): <br/><code style={{ backgroundColor: '#e5e7eb', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', display: 'block', marginTop: '0.25rem' }}>REACT_APP_GOOGLE_MAPS_API_KEY=your-api-key-here</code></li>
              <li>Restart the React development server (npm start)</li>
              <li>Get your API key from: <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Google Cloud Console</a></li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Always render the map, even if no properties have coordinates
  // The map will show with default center and markers will appear as coordinates become available
  console.log('PropertyMap rendering:', {
    hasApiKey: !!googleMapsApiKey,
    apiKeyValid: hasValidApiKey,
    propertiesCount: properties.length,
    propertiesWithCoords: propertiesWithCoords.length,
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
      <LoadScript 
        googleMapsApiKey={googleMapsApiKey}
        libraries={GOOGLE_MAPS_LIBRARIES}
        loadingElement={
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}></div>
            <p style={{ color: '#6b7280' }}>Loading Google Maps...</p>
          </div>
        }
        onError={(error: any) => {
          console.error('Google Maps LoadScript Error:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          
          // Check error message or error object
          const errorStr = String(error);
          const errorMessage = error?.message || (error as any)?.error || errorStr || 'Unknown error';
          
          // Handle specific error types
          let userFriendlyMessage = '';
          let detailedInstructions = '';
          
          if (errorMessage.includes('ApiTargetBlockedMapError') || errorMessage.includes('ApiTargetBlocked') || errorStr.includes('ApiTargetBlocked')) {
            userFriendlyMessage = 'API key restrictions are blocking the map from loading.';
            detailedInstructions = 'To fix this: 1) Go to Google Cloud Console → APIs & Services → Credentials, 2) Click on your API key, 3) Under "Application restrictions", select "HTTP referrers (web sites)" or "None" (for development), 4) If using HTTP referrers, add: http://localhost:3000/* and http://localhost:3000, 5) Save and wait a few minutes for changes to propagate.';
          } else if (errorMessage.includes('RefererNotAllowedMapError') || errorStr.includes('RefererNotAllowed')) {
            userFriendlyMessage = 'API key referrer restrictions are blocking localhost.';
            detailedInstructions = 'To fix this: 1) Go to Google Cloud Console → APIs & Services → Credentials, 2) Click on your API key, 3) Under "Application restrictions" → "Website restrictions", add: http://localhost:3000/* and http://localhost:3000, 4) Save and refresh the page.';
          } else if (errorMessage.includes('InvalidKeyMapError') || errorStr.includes('InvalidKey')) {
            userFriendlyMessage = 'Invalid API key.';
            detailedInstructions = 'Please check that your REACT_APP_GOOGLE_MAPS_API_KEY in the .env file is correct and matches the key in Google Cloud Console.';
          } else {
            userFriendlyMessage = `Failed to load Google Maps: ${errorMessage}`;
            detailedInstructions = 'Please check: 1) API key is valid, 2) Maps JavaScript API is enabled, 3) API key restrictions allow this domain (http://localhost:3000).';
          }
          
          setMapError(userFriendlyMessage + (detailedInstructions ? ' ' + detailedInstructions : ''));
          setIsMapLoaded(false);
        }}
        onLoad={() => {
          console.log('Google Maps LoadScript loaded successfully');
          setMapError(null);
          setIsMapLoaded(true);
        }}
      >
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
            <div style={{ 
              backgroundColor: '#f3f4f6', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginTop: '1rem',
              textAlign: 'left',
              width: '100%',
            }}>
              <p style={{ color: '#1f2937', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Quick Fix Steps:
              </p>
              <ol style={{ color: '#4b5563', fontSize: '0.875rem', lineHeight: '1.75', paddingLeft: '1.25rem', margin: 0 }}>
                <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Google Cloud Console → APIs & Services → Credentials</a></li>
                <li>Click on your Google Maps API key</li>
                <li>Under "Application restrictions", select "None" (for development) or "HTTP referrers (web sites)"</li>
                <li>If using HTTP referrers, add these referrers:
                  <ul style={{ marginTop: '0.25rem', paddingLeft: '1rem' }}>
                    <li><code style={{ backgroundColor: '#e5e7eb', padding: '0.125rem 0.25rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>http://localhost:3000/*</code></li>
                    <li><code style={{ backgroundColor: '#e5e7eb', padding: '0.125rem 0.25rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>http://localhost:3000</code></li>
                  </ul>
                </li>
                <li>Under "API restrictions", ensure "Maps JavaScript API" is enabled</li>
                <li>Click "Save" and wait 1-2 minutes for changes to propagate</li>
                <li>Refresh this page</li>
              </ol>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '1rem' }}>
              Check browser console (F12) for more details
            </p>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={propertiesWithCoords.length > 0 ? 12 : (properties.length > 0 ? 10 : 8)}
            onLoad={(map) => {
              console.log('GoogleMap loaded:', map);
              setIsMapLoaded(true);
              onLoad(map);
            }}
            onUnmount={onUnmount}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: true,
            }}
          >
            {/* Always show map, even if no properties have coordinates yet */}
            {propertiesWithCoords.length === 0 && properties.length > 0 && (
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
            
            {propertiesWithCoords.map((property) => (
              <Marker
                key={property.zpid}
                position={{
                  lat: property.lat!,
                  lng: property.lon!,
                }}
                onClick={() => handleMarkerClick(property.zpid)}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  scaledSize: new google.maps.Size(32, 32),
                }}
              >
                {activeMarker === property.zpid && (
                  <InfoWindow onCloseClick={handleInfoWindowClose}>
                    <div style={{ padding: '0.5rem', maxWidth: '250px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
                        {formatPrice(property.price)}
                      </div>
                      <div style={{ marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                        {property.address}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        <span>{property.bedrooms} bd</span>
                        <span style={{ margin: '0 0.25rem' }}>•</span>
                        <span>{property.bathrooms} ba</span>
                        <span style={{ margin: '0 0.25rem' }}>•</span>
                        <span>{property.livingArea?.toLocaleString()} sqft</span>
                      </div>
                      {property.propertyType && (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          {property.propertyType}
                        </div>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}
          </GoogleMap>
        )}
      </LoadScript>
    </div>
  );
};

export default PropertyMap;

