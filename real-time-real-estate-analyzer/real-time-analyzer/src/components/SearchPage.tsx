import React, { useState, useEffect } from 'react';
import PropertySearch from './PropertySearch';
import PropertyMap from './PropertyMap';
import { useProperties } from '../context/PropertiesContext';

interface SearchPageProps {
  searchType: 'properties' | 'lenders';
  onClose?: () => void;
  onPropertySelect?: (zpid: string, strategy?: 'rental' | 'brrrr' | 'flip' | 'wholesale') => void;
}

interface PropertyResult {
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

export default function SearchPage({ searchType, onClose, onPropertySelect }: SearchPageProps) {
  const { addProperty, properties } = useProperties();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PropertyResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  // Default to 'both' for properties search, 'list' for lenders
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'both'>(searchType === 'properties' ? 'both' : 'list');

  // Debug: Log when map should be rendered
  useEffect(() => {
    if (searchResults.length > 0 && (viewMode === 'map' || viewMode === 'both')) {
      console.log('SearchPage: PropertyMap should be rendered:', {
        propertiesCount: searchResults.length,
        viewMode,
        mapHeight: viewMode === 'both' ? '500px' : '100%',
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
        // Call backend API for property search
        const response = await fetch(
          `http://localhost:8080/api/properties/search?location=${encodeURIComponent(searchText)}&status=for_sale&page=1`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          if (response.status === 0 || response.status === 503 || response.status === 502) {
            throw new Error('BACKEND_NOT_RUNNING');
          }
          throw new Error(`Failed to fetch properties: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Handle different response formats
        let properties = Array.isArray(data) ? data : (data.properties || data.results || []);
        
        // Map properties to ensure they have the correct structure
        properties = properties.map((prop: any) => ({
          zpid: prop.zpid || prop.id || '',
          address: prop.address || '',
          price: prop.price || prop.unformattedPrice || 0,
          bedrooms: prop.bedrooms || prop.beds || 0,
          bathrooms: prop.bathrooms || prop.baths || 0,
          livingArea: prop.livingArea || prop.sqft || prop.area || 0,
          propertyType: prop.propertyType || '',
          imgSrc: prop.imgSrc || prop.image || prop.img || '',
          status: prop.status || prop.listingStatus || '',
          lat: prop.lat || prop.latitude || null,
          lon: prop.lon || prop.lng || prop.longitude || null,
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
      if (err.message === 'BACKEND_NOT_RUNNING' || err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
        setError('Backend server is not running. Please start the backend server on port 8080. Check the console for instructions.');
      } else {
        setError(err.message || 'Failed to search. Please check the console for details.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handlePropertySelect = async (zpid: string) => {
    try {
      // Check if property already exists
      const existingProperty = properties.find(p => p.zpid === zpid);
      if (existingProperty) {
        alert('This property is already in your My Properties list!');
        return;
      }

      // If onPropertySelect callback is provided, use it to open the form
      if (onPropertySelect) {
        onPropertySelect(zpid, 'rental'); // Default to rental strategy
        return;
      }

      // Fallback: If no callback, add directly (old behavior)
      const property = searchResults.find(p => p.zpid === zpid);
      if (property) {
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

        setSelectedProperty(zpid);
        alert('Property has been added to your My Properties list!');
      }
    } catch (error) {
      console.error('Error selecting property:', error);
      alert('Failed to select property. Please try again.');
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

        {/* View Mode Toggle - Always show when searching for properties */}
        {searchType === 'properties' && (
          <div style={{ 
            marginTop: '2rem', 
            display: 'flex', 
            gap: '0.5rem', 
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}>
            {searchResults.length > 0 ? (
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                Found {searchResults.length} {searchResults.length === 1 ? 'property' : 'properties'}
              </h2>
            ) : (
              <h2 style={{ margin: 0, color: '#6b7280', fontSize: '1rem', fontWeight: 'normal' }}>
                Search for properties to see them on the map
              </h2>
            )}
            <div style={{ 
              display: 'flex', 
              gap: '0.25rem', 
              backgroundColor: '#f3f4f6', 
              padding: '0.25rem', 
              borderRadius: '0.5rem',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  backgroundColor: viewMode === 'list' ? '#3b82f6' : 'transparent',
                  color: viewMode === 'list' ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: viewMode === 'list' ? '600' : '500',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (viewMode !== 'list') {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (viewMode !== 'list') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('both')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  backgroundColor: viewMode === 'both' ? '#3b82f6' : 'transparent',
                  color: viewMode === 'both' ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: viewMode === 'both' ? '600' : '500',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (viewMode !== 'both') {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (viewMode !== 'both') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                Both
              </button>
              <button
                onClick={() => setViewMode('map')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  backgroundColor: viewMode === 'map' ? '#3b82f6' : 'transparent',
                  color: viewMode === 'map' ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: viewMode === 'map' ? '600' : '500',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (viewMode !== 'map') {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (viewMode !== 'map') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                Map
              </button>
            </div>
          </div>
        )}

        {/* Search Results - List and Map */}
        <div style={{ marginTop: '1.5rem' }}>
          {/* Property List */}
          {searchResults.length > 0 && (viewMode === 'list' || viewMode === 'both') && (
            <div className="property-cards" style={{ marginBottom: viewMode === 'both' ? '2rem' : '0' }}>
              <div className="results-grid">
                {searchResults.map((property) => (
                  <div 
                    key={property.zpid} 
                    className="result-card"
                    style={{ 
                      cursor: 'pointer',
                      border: selectedProperty === property.zpid ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                      position: 'relative',
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
          )}

          {/* Google Map - Always show when searching for properties */}
          {searchType === 'properties' && (viewMode === 'map' || viewMode === 'both' || searchResults.length === 0) && (
            <div 
              key={`map-${searchResults.length}-${viewMode}`}
              style={{ 
                marginTop: (viewMode === 'both' && searchResults.length > 0) ? '2rem' : (viewMode === 'list' && searchResults.length > 0 ? '2rem' : (searchResults.length === 0 ? '2rem' : '0')),
                height: viewMode === 'both' ? '500px' : (viewMode === 'map' ? 'calc(100vh - 300px)' : '600px'),
                minHeight: '400px',
                width: '100%',
                border: '2px solid #3b82f6',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                backgroundColor: '#f9fafb',
                position: 'relative',
                display: 'block',
                visibility: 'visible',
              }}
            >
              <PropertyMap
                properties={searchResults}
                selectedProperty={selectedProperty}
                onPropertySelect={handlePropertySelect}
                mapHeight={viewMode === 'both' ? '500px' : (viewMode === 'map' ? '100%' : '600px')}
              />
            </div>
          )}
        </div>

        {/* Empty State - Only show when no results and not in map view */}
        {!isSearching && searchResults.length === 0 && !error && viewMode !== 'map' && (
          <div className="search-empty-state" style={{ marginTop: '3rem' }}>
            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3>Search for Properties</h3>
            <p>Enter a zipcode or area name to find properties available for analysis</p>
          </div>
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

