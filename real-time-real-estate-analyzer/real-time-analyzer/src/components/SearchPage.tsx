import React, { useState, useEffect } from 'react';
import PropertyMap from './PropertyMap';
import PropertyPopup from './PropertyPopup';
import { useProperties } from '../context/PropertiesContext';

interface SearchPageProps {
  searchType: 'properties' | 'lenders';
  onClose?: () => void;
  onPropertySelect?: (zpid: string, strategy?: 'rental' | 'brrrr' | 'flip' | 'wholesale', searchLocation?: string) => void;
}

interface PropertyResult {
  zpid: string;
  propertyId?: string; // Backend field name
  address: string;
  streetAddress?: string; // Backend field name
  city?: string;
  state?: string;
  zip?: string; // Backend field name
  zipCode?: string;
  postalCode?: string;
  county?: string; // Backend field name
  countyFIPS?: string; // Backend field name
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

export default function SearchPage({ searchType, onClose, onPropertySelect }: SearchPageProps) {
  const { addProperty, properties } = useProperties();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PropertyResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupProperty, setPopupProperty] = useState<PropertyResult | null>(null);
  // Default to 'list' for properties search (only List and Map views)
  const [viewMode, setViewMode] = useState<'list' | 'map'>(searchType === 'properties' ? 'list' : 'list');

  // Debug: Log when map should be rendered
  useEffect(() => {
    if (searchResults.length > 0 && viewMode === 'map') {
      console.log('SearchPage: PropertyMap should be rendered:', {
        propertiesCount: searchResults.length,
        viewMode,
        mapHeight: '100%',
        propertiesWithCoords: searchResults.filter(p => p.lat && p.lon).length,
      });
    }
  }, [searchResults, viewMode]);

  const handleSearch = async (query?: string) => {
    const searchText = query || searchQuery;
    
    if (!searchText.trim()) {
      setError('Please enter a zipcode or area name');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      if (searchType === 'properties') {
        // Backend expects: GET /api/properties/search?location=...&status=...&page=...
        const searchTextTrimmed = searchText.trim();
        
        // Build query parameters - backend uses 'location' parameter
        const queryParams = new URLSearchParams({
          location: searchTextTrimmed,
          status: 'for_sale',
          page: '1'
        });
        
        // Try both ports - 8080 (actual backend config) and 8081 (integration guide)
        const ports = [8080, 8081];
        let response: Response | null = null;
        let lastError: Error | null = null;
        
        for (const port of ports) {
          try {
            console.log(`Attempting to fetch from port ${port}...`);
            const url = `http://localhost:${port}/api/properties/search?${queryParams.toString()}`;
            console.log(`Fetching from: ${url}`);
            
            response = await fetch(url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              signal: AbortSignal.timeout(10000), // 10 second timeout
            });
            
            console.log(`Response from port ${port}:`, response.status, response.statusText);
            
            if (response.ok) {
              break; // Success, exit loop
            } else {
              // If we get a 404, the endpoint might not exist on this port
              if (response.status === 404) {
                console.log(`Port ${port} returned 404, trying next port...`);
                continue;
              }
              // For other errors, try to get error message
              const errorText = await response.text().catch(() => '');
              console.error(`Port ${port} error:`, response.status, errorText);
              lastError = new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
            }
          } catch (err: any) {
            console.error(`Port ${port} fetch error:`, err);
            lastError = err;
            // Continue to next port
            continue;
          }
        }
        
        if (!response || !response.ok) {
          if (!response) {
            throw new Error('BACKEND_NOT_RUNNING');
          }
          if (response.status === 0 || response.status === 503 || response.status === 502 || response.status === 500) {
            throw new Error('BACKEND_NOT_RUNNING');
          }
          const errorText = await response.text().catch(() => '');
          throw new Error(`Failed to fetch properties: ${response.status} ${response.statusText}. ${errorText}`);
        }

        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError);
          throw new Error('Invalid response format from server');
        }
        
        // Handle different response formats
        let properties = Array.isArray(data) ? data : (data.properties || data.results || []);
        
        // Map properties to ensure they have the correct structure
        // Backend now provides: propertyId, address, streetAddress, city, state, zip, county, countyFIPS, listPrice
        properties = properties.map((prop: any) => ({
          zpid: prop.propertyId || prop.zpid || prop.id || '',
          address: prop.address || prop.streetAddress || '',
          streetAddress: prop.streetAddress || '',
          city: prop.city || '',
          state: prop.state || prop.stateCode || '',
          zip: prop.zip || '',
          zipCode: prop.zip || prop.zipCode || prop.postalCode || '',
          postalCode: prop.zip || prop.postalCode || prop.zipCode || '',
          county: prop.county || '',
          countyFIPS: prop.countyFIPS || '',
          price: prop.listPrice || prop.price || prop.unformattedPrice || 0,
          bedrooms: prop.bedrooms || prop.beds || 0,
          bathrooms: prop.bathrooms || prop.baths || 0,
          livingArea: prop.livingArea || prop.sqft || prop.area || 0,
          propertyType: prop.propertyType || '',
          imgSrc: prop.imgSrc || prop.image || prop.img || '',
          status: prop.status || prop.listingStatus || '',
          lat: prop.lat || prop.latitude || null,
          lon: prop.lon || prop.lng || prop.longitude || null,
          // Store backend field names for reference
          propertyId: prop.propertyId || prop.zpid || prop.id || '',
        })).filter((prop: any) => prop.zpid); // Filter out invalid properties

        setSearchResults(properties);

        if (properties.length === 0) {
          setError('No properties found for this location. Try a different search.');
        }
      } else {
        // For lenders, you can implement a similar search if you have a lenders API
        setError('Lender search functionality coming soon!');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      console.error('Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack,
      });
      
      // Check for various error types
      if (
        err.message === 'BACKEND_NOT_RUNNING' ||
        err.message?.includes('Failed to fetch') ||
        err.name === 'TypeError' ||
        err.name === 'NetworkError' ||
        err.name === 'AbortError' ||
        err.message?.includes('network') ||
        err.message?.includes('CORS')
      ) {
        setError(
          'Backend server is not running or not accessible.\n\n' +
          'Please:\n' +
          '1. Start the backend server on port 8080\n' +
          '2. Check if the server is running: http://localhost:8080\n' +
          '3. Verify CORS is enabled in the backend\n' +
          '4. Check the browser console for detailed error messages'
        );
      } else if (err.message?.includes('timeout')) {
        setError('Request timed out. The backend server may be slow or unresponsive.');
      } else {
        setError(err.message || 'Failed to search. Please check the console for details.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handlePropertySelect = (zpid: string) => {
    // Show popup when property is clicked
    const property = searchResults.find(p => p.zpid === zpid);
    if (property) {
      setPopupProperty(property);
      setShowPopup(true);
      setSelectedProperty(zpid);
    }
    
    // Pass the property's location data (city, state, zipCode) to the parent
    // If property has city/state/zipCode, use that; otherwise fall back to searchQuery
    let locationData = searchQuery;
    if (property && (property.city || property.state || property.zipCode || property.postalCode)) {
      const parts: string[] = [];
      if (property.city) parts.push(property.city);
      if (property.state) parts.push(property.state);
      if (property.zipCode || property.postalCode) parts.push(property.zipCode || property.postalCode || '');
      locationData = parts.join(', ');
    }
    
    if (onPropertySelect) {
      onPropertySelect(zpid, 'rental', locationData);
    }
  };

  const handleAddToList = (property: PropertyResult) => {
    try {
      // Check if property already exists
      const existingProperty = properties.find(p => p.zpid === property.zpid);
      if (existingProperty) {
        alert('This property is already in your My Properties list!');
        return;
      }

      // Parse address from property
      let streetAddress = '';
      let city = '';
      let state = '';
      let zipCode = '';

      if (property.address) {
        const addressParts = property.address.split(',').map((part: string) => part.trim());
        
        if (addressParts.length >= 3) {
          streetAddress = addressParts[0];
          city = addressParts[1];
          const lastPart = addressParts[2];
          const stateZipMatch = lastPart.match(/([A-Z]{2})\s+(\d{5})/);
          
          if (stateZipMatch) {
            state = stateZipMatch[1];
            zipCode = stateZipMatch[2];
          } else {
            const parts = lastPart.split(/\s+/).filter(p => p.length > 0);
            if (parts.length >= 2) {
              zipCode = parts[parts.length - 1];
              state = parts[parts.length - 2];
            }
          }
        } else if (addressParts.length === 2) {
          streetAddress = addressParts[0];
          const cityStatePart = addressParts[1];
          const match = cityStatePart.match(/^(.+?)\s+([A-Z]{2})\s+(\d{5})$/);
          if (match) {
            city = match[1];
            state = match[2];
            zipCode = match[3];
          }
        } else {
          streetAddress = property.address;
        }
      }

      // Add property to My Properties with default strategy 'rental'
      addProperty({
        zpid: property.zpid,
        strategy: 'rental',
        address: streetAddress || property.address || '',
        city: city || '',
        state: state || '',
        zipCode: zipCode || '',
        price: property.price || undefined,
        purchasePrice: property.price || undefined,
        image: property.imgSrc || undefined,
        propertyType: property.propertyType || '',
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        livingArea: property.livingArea || undefined,
        lat: property.lat,
        lon: property.lon,
        isShortlisted: false,
      });

      alert('Property has been added to your My Properties list!');
    } catch (error) {
      console.error('Error adding property:', error);
      alert('Failed to add property. Please try again.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (searchType === 'properties') {
    return (
      <div className="main-content">
        <div className="content-header">
          <div className="header-top">
            <div>
              <h1 className="header-title">Search Properties</h1>
              <p className="header-description">
                Enter a zipcode or area name to find properties available in your area
              </p>
            </div>
            {onClose && (
              <button onClick={onClose} className="btn-secondary">
                Back
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="search-bar-container" style={{ marginTop: '1.5rem' }}>
            <div className="search-input-wrapper">
              <div className="search-input-group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter zipcode or area name (e.g., 02130, Boston, MA)"
                  className="search-input"
                  style={{ flex: 1 }}
                />
                <button 
                  onClick={() => handleSearch()} 
                  disabled={isSearching}
                  className="btn-primary search-button"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="error-message" style={{ marginTop: '1rem' }}>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results Header */}
        {searchType === 'properties' && searchResults.length > 0 && (
          <div style={{ 
            marginTop: '2rem', 
            marginBottom: '1rem'
          }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
              Found {searchResults.length} {searchResults.length === 1 ? 'property' : 'properties'}
            </h2>
          </div>
        )}

        {/* Search Results - List and Map Side by Side */}
        {searchResults.length > 0 && (
          <div style={{ 
            marginTop: '1.5rem',
            display: 'flex',
            gap: '1.5rem',
            height: 'calc(100vh - 350px)',
            minHeight: '600px',
          }}>
            {/* Property List - Left Half */}
            <div style={{
              flex: '1',
              minWidth: 0,
              overflowY: 'auto',
              paddingRight: '0.5rem',
            }}>
              <div className="property-cards">
                <div className="results-grid" style={{ gridTemplateColumns: '1fr' }}>
                  {searchResults.map((property) => (
                    <div 
                      key={property.zpid} 
                      className="result-card"
                      style={{ 
                        cursor: 'pointer',
                        border: selectedProperty === property.zpid ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        position: 'relative',
                        marginBottom: '1rem',
                      }}
                      onClick={() => handlePropertySelect(property.zpid)}
                    >
                      {/* Add indicator if already in My Properties */}
                      {properties.find(p => p.zpid === property.zpid) && (
                        <div style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          backgroundColor: '#10b981',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          zIndex: 10,
                        }}>
                          ✓ Added
                        </div>
                      )}
                      {property.imgSrc && (
                        <div className="result-card-image">
                          <img src={property.imgSrc} alt={property.address} />
                          {property.status && (
                            <span className="result-status-badge">{property.status}</span>
                          )}
                        </div>
                      )}
                      
                      <div className="result-card-content">
                        <div className="result-price">{formatPrice(property.price)}</div>
                        <div className="result-address">{property.address}</div>
                        
                        <div className="result-details">
                          <span>{property.bedrooms} bd</span>
                          <span className="detail-separator">•</span>
                          <span>{property.bathrooms} ba</span>
                          <span className="detail-separator">•</span>
                          <span>{property.livingArea?.toLocaleString()} sqft</span>
                        </div>
                        
                        {property.propertyType && (
                          <div className="result-type">{property.propertyType}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Map View - Right Half */}
            <div style={{
              flex: '1',
              minWidth: 0,
              height: '100%',
              border: '2px solid #3b82f6',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              backgroundColor: '#f9fafb',
              position: 'relative',
            }}>
              <PropertyMap
                properties={searchResults}
                selectedProperty={selectedProperty}
                onPropertySelect={handlePropertySelect}
                mapHeight="100%"
              />
            </div>
          </div>
        )}

        {/* Empty State - Only show when no results */}
        {!isSearching && searchResults.length === 0 && !error && (
          <div className="search-empty-state" style={{ marginTop: '3rem' }}>
            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3>Search for Properties</h3>
            <p>Enter a zipcode or area name to find properties available for analysis</p>
          </div>
        )}

        {/* Property Popup */}
        {showPopup && popupProperty && (
          <PropertyPopup
            property={popupProperty}
            onClose={() => {
              setShowPopup(false);
              setPopupProperty(null);
              setSelectedProperty(null);
            }}
            onAddToList={handleAddToList}
            isAlreadyAdded={!!properties.find(p => p.zpid === popupProperty.zpid)}
          />
        )}
      </div>
    );
  }

  // Lenders search (placeholder)
  return (
    <div className="main-content">
      <div className="content-header">
        <div className="header-top">
          <div>
            <h1 className="header-title">Search Lenders</h1>
            <p className="header-description">
              Enter a zipcode or area name to find lenders in your area
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="btn-secondary">
              Back
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="search-bar-container" style={{ marginTop: '1.5rem' }}>
          <div className="search-input-wrapper">
            <div className="search-input-group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter zipcode or area name (e.g., 02130, Boston, MA)"
                className="search-input"
                style={{ flex: 1 }}
              />
              <button 
                onClick={() => handleSearch()} 
                disabled={isSearching}
                className="btn-primary search-button"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="error-message" style={{ marginTop: '1rem' }}>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Coming Soon Message */}
      <div className="search-empty-state" style={{ marginTop: '3rem' }}>
        <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3>Lender Search Coming Soon</h3>
        <p>This feature is under development. Check back soon!</p>
      </div>
    </div>
  );
}

