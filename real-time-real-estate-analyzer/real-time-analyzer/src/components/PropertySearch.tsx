import React, { useState, useEffect, useRef } from 'react';
import PropertyMap from './PropertyMap';

interface PropertySearchProps {
  onPropertySelect: (zpid: string) => Promise<void>;
  onCancel: () => void;
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

interface SearchSuggestion {
  type: 'address' | 'city' | 'neighborhood' | 'zipcode';
  text: string;
  subtitle?: string;
}

export default function PropertySearch({ onPropertySelect, onCancel }: PropertySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PropertyResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [loadingPropertyId, setLoadingPropertyId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Generate search suggestions based on input
  const generateSuggestions = (query: string): SearchSuggestion[] => {
    if (!query || query.length < 2) return [];

    const suggestions: SearchSuggestion[] = [];
    const lowerQuery = query.toLowerCase();

    // Common cities and neighborhoods
    const locations = [
      { city: 'Boston', state: 'MA', neighborhoods: ['Back Bay', 'Beacon Hill', 'South End', 'Jamaica Plain', 'Dorchester', 'Roxbury'] },
      { city: 'Cambridge', state: 'MA', neighborhoods: ['Harvard Square', 'Central Square', 'Kendall Square'] },
      { city: 'Los Angeles', state: 'CA', neighborhoods: ['Beverly Hills', 'Santa Monica', 'Hollywood', 'Downtown', 'Venice'] },
      { city: 'New York', state: 'NY', neighborhoods: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'] },
      { city: 'San Francisco', state: 'CA', neighborhoods: ['Mission District', 'Castro', 'Pacific Heights', 'Marina'] },
      { city: 'Chicago', state: 'IL', neighborhoods: ['Loop', 'Lincoln Park', 'Wicker Park', 'River North'] },
      { city: 'Miami', state: 'FL', neighborhoods: ['South Beach', 'Brickell', 'Coconut Grove', 'Wynwood'] },
    ];

    // Check if query matches a specific address pattern (contains numbers and street keywords)
    const addressPattern = /\d+.*?(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|way|place|pl|court|ct)/i;
    if (addressPattern.test(query)) {
      suggestions.push({
        type: 'address',
        text: query,
        subtitle: 'Search for specific property address'
      });
    }

    // Check if it's a ZIP code (5 digits)
    if (/^\d{5}$/.test(query)) {
      suggestions.push({
        type: 'zipcode',
        text: query,
        subtitle: 'Search by ZIP code'
      });
    }

    // Match cities
    locations.forEach(loc => {
      if (loc.city.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          type: 'city',
          text: `${loc.city}, ${loc.state}`,
          subtitle: `Search all properties in ${loc.city}`
        });

        // Add neighborhoods for matched city
        loc.neighborhoods.forEach(neighborhood => {
          if (neighborhood.toLowerCase().includes(lowerQuery) || lowerQuery.includes(loc.city.toLowerCase())) {
            suggestions.push({
              type: 'neighborhood',
              text: `${neighborhood}, ${loc.city}, ${loc.state}`,
              subtitle: `Search ${neighborhood} neighborhood`
            });
          }
        });
      }
    });

    // Match neighborhoods directly
    locations.forEach(loc => {
      loc.neighborhoods.forEach(neighborhood => {
        if (neighborhood.toLowerCase().includes(lowerQuery)) {
          suggestions.push({
            type: 'neighborhood',
            text: `${neighborhood}, ${loc.city}, ${loc.state}`,
            subtitle: `Search ${neighborhood} neighborhood`
          });
        }
      });
    });

    // If query looks like an address but not complete, suggest completing it
    if (/^\d+/.test(query) && query.length > 2) {
      const baseAddress = query.trim();
      suggestions.push({
        type: 'address',
        text: baseAddress,
        subtitle: 'Type full address to search specific property'
      });
    }

    // Remove duplicates
    const unique = suggestions.filter((item, index, self) =>
      index === self.findIndex((t) => t.text === item.text)
    );

    return unique.slice(0, 8); // Limit to 8 suggestions
  };

  // Update suggestions when query changes
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const newSuggestions = generateSuggestions(searchQuery);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedSuggestionIndex(-1);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query?: string) => {
    const searchText = query || searchQuery;
    
    if (!searchText.trim()) {
      setError('Please enter a location to search');
      return;
    }

    setIsSearching(true);
    setError(null);
    setShowSuggestions(false);

    try {
      // Call your backend API
      const response = await fetch(
        `http://localhost:8080/api/properties/search?location=${encodeURIComponent(searchText)}&status=for_sale&page=1`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      
      // Handle different response formats
      let properties = Array.isArray(data) ? data : (data.properties || data.results || []);
      
      // Map properties to ensure they have the correct structure with coordinates
      const propertiesWithCoords = properties.map((prop: any) => ({
        zpid: prop.zpid || prop.id || '',
        address: prop.address || '',
        price: prop.price || prop.unformattedPrice || 0,
        bedrooms: prop.bedrooms || prop.beds || 0,
        bathrooms: prop.bathrooms || prop.baths || 0,
        livingArea: prop.livingArea || prop.sqft || prop.area || 0,
        propertyType: prop.propertyType || '',
        imgSrc: prop.imgSrc || prop.image || prop.img || '',
        status: prop.status || prop.listingStatus || '',
        lat: prop.lat || prop.latitude || undefined,
        lon: prop.lon || prop.lng || prop.longitude || undefined,
      })).filter((prop: any) => prop.zpid); // Filter out invalid properties
      
      setSearchResults(propertiesWithCoords);

      if (data.length === 0) {
        setError('No properties found for this location. Try a different search.');
      }
    } catch (err) {
      setError('Failed to search properties. Please make sure the backend server is running.');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    handleSearch(suggestion.text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handlePropertyClick = async (zpid: string) => {
    setSelectedProperty(zpid);
    setLoadingPropertyId(zpid);
    try {
      await onPropertySelect(zpid);
    } catch (err) {
      console.error('Error selecting property:', err);
      setError('Failed to load property details. Please try again.');
    } finally {
      setLoadingPropertyId(null);
    }
  };

  const handleMapPropertySelect = (zpid: string) => {
    setSelectedProperty(zpid);
    handlePropertyClick(zpid);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={`property-search-container ${viewMode === 'map' ? 'map-view-active' : ''}`}>
      <div className="property-form-header">
        <div>
          <h2>Add New Property</h2>
          {/* View Mode Toggle Buttons */}
          {searchResults.length > 0 && (
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              marginTop: '1rem',
              alignItems: 'center'
            }}>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: viewMode === 'list' ? '#3b82f6' : 'white',
                  color: viewMode === 'list' ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontWeight: viewMode === 'list' ? '600' : '400',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (viewMode !== 'list') {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (viewMode !== 'list') {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: viewMode === 'map' ? '#3b82f6' : 'white',
                  color: viewMode === 'map' ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontWeight: viewMode === 'map' ? '600' : '400',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (viewMode !== 'map') {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (viewMode !== 'map') {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                Map View
              </button>
            </div>
          )}
        </div>
        <button onClick={onCancel} className="close-button">×</button>
      </div>

      {/* Search Bar */}
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <div className="search-input-group">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Enter address, neighborhood, city, or ZIP code..."
              className="search-input"
            />
            <button 
              onClick={() => handleSearch()} 
              disabled={isSearching}
              className="btn-primary search-button"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div ref={suggestionsRef} className="suggestions-dropdown">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`suggestion-item ${index === selectedSuggestionIndex ? 'selected' : ''}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                >
                  <div className="suggestion-icon">
                    {suggestion.type === 'address' && (
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                      </svg>
                    )}
                    {suggestion.type === 'city' && (
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
                      </svg>
                    )}
                    {suggestion.type === 'neighborhood' && (
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                      </svg>
                    )}
                    {suggestion.type === 'zipcode' && (
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </div>
                  <div className="suggestion-content">
                    <div className="suggestion-text">{suggestion.text}</div>
                    {suggestion.subtitle && (
                      <div className="suggestion-subtitle">{suggestion.subtitle}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Search Tips */}
        <div className="search-tips">
          <p><strong>Search Examples:</strong></p>
          <ul>
            <li><strong>Specific Address:</strong> "123 Main St, Boston, MA"</li>
            <li><strong>Neighborhood:</strong> "Jamaica Plain, Boston" or "Beverly Hills, Los Angeles"</li>
            <li><strong>City:</strong> "Boston, MA" or "Los Angeles, CA"</li>
            <li><strong>ZIP Code:</strong> "02130" or "90210"</li>
          </ul>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <>
          {viewMode === 'list' && (
            <div className="search-results">
              <h3 className="results-title">
                Found {searchResults.length} {searchResults.length === 1 ? 'property' : 'properties'}
              </h3>
              <div className="results-grid">
                {searchResults.map((property) => (
                  <div 
                    key={property.zpid} 
                    className={`result-card ${selectedProperty === property.zpid ? 'selected' : ''}`}
                    onClick={() => handlePropertyClick(property.zpid)}
                    style={{ cursor: 'pointer' }}
                  >
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
                      
                      <button 
                        className="btn-primary select-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePropertyClick(property.zpid);
                        }}
                        disabled={loadingPropertyId === property.zpid}
                      >
                        {loadingPropertyId === property.zpid ? 'Loading...' : 'Select Property'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'map' && (
            <div className="map-view-container">
              <PropertyMap
                properties={searchResults}
                selectedProperty={selectedProperty}
                onPropertySelect={handleMapPropertySelect}
                mapHeight="100%"
              />
            </div>
          )}
        </>
      )}

      {/* Initial State */}
      {!isSearching && searchResults.length === 0 && !error && (
        <div className="search-empty-state">
          <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3>Search for Properties</h3>
          <p>Enter a location to find properties available for analysis</p>
        </div>
      )}
    </div>
  );
}

