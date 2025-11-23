import React, { useState } from 'react';
import { FiSearch, FiChevronDown, FiDownload, FiPlus, FiChevronRight, FiCheck } from 'react-icons/fi';
import { useProperties, SavedProperty } from '../context/PropertiesContext';
import PropertyMap from './PropertyMap';

interface DashboardProps {
  onAddProperty?: (strategy: 'rental' | 'brrrr' | 'flip' | 'wholesale') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onAddProperty }) => {
  const { properties, toggleShortlist, deleteProperty } = useProperties();
  const [selectedStrategy, setSelectedStrategy] = useState<'rental' | 'brrrr' | 'flip' | 'wholesale' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'both'>('both');
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  // Filter properties by strategy and search query
  const filteredProperties = properties.filter(prop => {
    const matchesStrategy = selectedStrategy === 'all' || prop.strategy === selectedStrategy;
    const matchesSearch = searchQuery === '' || 
      prop.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.state.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStrategy && matchesSearch;
  });

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStrategyLabel = (strategy: string) => {
    switch (strategy) {
      case 'rental': return 'Rental';
      case 'brrrr': return 'BRRRR';
      case 'flip': return 'Flip';
      case 'wholesale': return 'Wholesale';
      default: return strategy;
    }
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'rental': return '#3b82f6';
      case 'brrrr': return '#10b981';
      case 'flip': return '#f59e0b';
      case 'wholesale': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getAddPropertyText = (strategy: string) => {
    switch (strategy) {
      case 'rental': return 'Add Rental Property';
      case 'brrrr': return 'Add BRRRR Property';
      case 'flip': return 'Add Flip Property';
      case 'wholesale': return 'Add Wholesale Property';
      case 'all': return 'Add Property';
      default: return 'Add Property';
    }
  };

  // Convert SavedProperty to Property format for PropertyMap
  const mapPropertiesForMap = (props: typeof filteredProperties) => {
    return props.map(prop => ({
      zpid: prop.id,
      address: prop.address || `${prop.city}, ${prop.state} ${prop.zipCode}`,
      price: prop.purchasePrice || prop.price || 0,
      bedrooms: prop.bedrooms || 0,
      bathrooms: prop.bathrooms || 0,
      livingArea: prop.livingArea || 0,
      propertyType: prop.propertyType || '',
      imgSrc: prop.image || '',
      status: 'saved',
      lat: prop.lat,
      lon: prop.lon,
    }));
  };

  const mapProperties = mapPropertiesForMap(filteredProperties);

  const handleDeleteProperty = (id: string) => {
    if (window.confirm('Are you sure you want to remove this property from your list?')) {
      deleteProperty(id);
      setPropertyToDelete(null);
    }
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div className="content-header">
        <div className="header-top">
          <div>
            <h1 className="header-title">My Properties Dashboard</h1>
            <p className="header-description">
              View and manage all your selected and shortlisted properties
            </p>
          </div>
          <div className="header-actions">
            <button className="btn-primary">
              <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>Compare</span>
            </button>
            <div className="dropdown" style={{ position: 'relative' }}>
              <button
                className="btn-primary"
                onClick={() => {
                  if (onAddProperty) {
                    const strategy = selectedStrategy === 'all' ? 'rental' : selectedStrategy;
                    onAddProperty(strategy as 'rental' | 'brrrr' | 'flip' | 'wholesale');
                  }
                }}
              >
                <FiPlus style={{ width: '1rem', height: '1rem' }} />
                <span>{getAddPropertyText(selectedStrategy)}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-item">
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value as any)}
              className="filter-select"
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Strategies</option>
              <option value="rental">Rentals</option>
              <option value="brrrr">BRRRRs</option>
              <option value="flip">Flips</option>
              <option value="wholesale">Wholesale</option>
            </select>
          </div>
          
          <div className="filter-item" style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Search properties..."
              className="filter-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '1rem', height: '1rem' }} />
          </div>

          <button className="filter-button">
            <FiDownload style={{ width: '1rem', height: '1rem' }} />
            <span>Export</span>
          </button>

          <div className="sort-container">
            <span className="sort-label">Sort by:</span>
            <span className="sort-value">Name</span>
            <FiChevronDown style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
          </div>
        </div>

        {/* View Mode Toggle - Always visible */}
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#f3f4f6', padding: '0.25rem', borderRadius: '0.5rem' }}>
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
                fontWeight: viewMode === 'list' ? '600' : '400',
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
                fontWeight: viewMode === 'both' ? '600' : '400',
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
                fontWeight: viewMode === 'map' ? '600' : '400',
              }}
            >
              Map
            </button>
          </div>
        </div>
      </div>

      {/* Property Cards and Map */}
      <div style={{ marginTop: '1.5rem' }}>
        {(viewMode === 'list' || viewMode === 'both') && (
          <div className="property-cards" style={{ marginBottom: viewMode === 'both' ? '2rem' : '0' }}>
            {properties.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3>Search for your new dream rental/flip property</h3>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3>No properties found</h3>
                <p>Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div>
                {filteredProperties.map((property) => (
              <div key={property.id} className="property-card">
                <div className="property-card-content">
                  {/* Property Image */}
                  <div className="property-image">
                    <img
                      src={property.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=200&fit=crop'}
                      alt={property.address}
                      className="property-img"
                    />
                    <div className="status-badge">
                      <FiCheck style={{ width: '0.75rem', height: '0.75rem', color: 'white' }} />
                    </div>
                    <button
                      className="shortlist-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleShortlist(property.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '3rem',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '2rem',
                        height: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                      }}
                    >
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill={property.isShortlisted ? '#fbbf24' : 'none'} 
                        stroke={property.isShortlisted ? '#fbbf24' : '#6b7280'} 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    </button>
                    <button
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProperty(property.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: 'rgba(220, 38, 38, 0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '2rem',
                        height: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        color: 'white',
                      }}
                      title="Remove property"
                    >
                      <svg 
                        style={{ width: '1rem', height: '1rem' }} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                        />
                      </svg>
                    </button>
                    <div
                      className="strategy-badge"
                      style={{
                        position: 'absolute',
                        bottom: '0.5rem',
                        left: '0.5rem',
                        backgroundColor: getStrategyColor(property.strategy),
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {getStrategyLabel(property.strategy)}
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="property-details">
                    <div className="property-header">
                      <div>
                        <h3 className="property-address">{property.address}</h3>
                        <div className="property-info">
                          <span>{property.city}, {property.state} {property.zipCode}</span>
                          {property.propertyType && <span>{property.propertyType}</span>}
                          {property.bedrooms && property.bathrooms && (
                            <span>{property.bedrooms} bd / {property.bathrooms} ba</span>
                          )}
                          {property.livingArea && <span>{property.livingArea.toLocaleString()} sqft</span>}
                        </div>
                      </div>
                    </div>

                    {/* Financial Metrics */}
                    {property.cashFlow || property.capRate || property.coc ? (
                      <div className="property-metrics">
                        {property.cashFlow && (
                          <div className="metric">
                            {formatPrice(property.cashFlow)}/mo Cash Flow
                          </div>
                        )}
                        {property.capRate && (
                          <div className="metric">
                            {property.capRate.toFixed(1)}% Cap Rate
                          </div>
                        )}
                        {property.coc && (
                          <div className="metric">
                            {property.coc.toFixed(1)}% COC
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Purchase Price */}
                  <div className="property-price">
                    <div className="price-value">
                      {formatPrice(property.purchasePrice || property.price)}
                    </div>
                    <div className="price-label">Purchase Price</div>
                    <FiChevronRight className="price-arrow" />
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Property Card */}
            <div 
              className="add-property-card"
              onClick={() => {
                if (onAddProperty) {
                  const strategy = selectedStrategy === 'all' ? 'rental' : selectedStrategy;
                  onAddProperty(strategy as 'rental' | 'brrrr' | 'flip' | 'wholesale');
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="add-property-content">
                <div className="add-icon-container">
                  <div className="add-icon-bg">
                    <svg style={{ width: '2rem', height: '2rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div className="add-icon-plus">
                    <FiPlus style={{ width: '0.75rem', height: '0.75rem', color: 'white' }} />
                  </div>
                </div>
                <div className="add-text">
                  <h3 className="add-title">Add {selectedStrategy === 'all' ? 'a New' : getStrategyLabel(selectedStrategy)} Property</h3>
                  <p className="add-description">
                    Click here to analyze a new {selectedStrategy === 'all' ? 'property' : getStrategyLabel(selectedStrategy).toLowerCase()} property or copy an existing one.
                  </p>
                </div>
                <div>
                  <FiPlus className="add-large-icon" />
                </div>
              </div>
            </div>
              </div>
            )}
          </div>
        )}

        {/* Map View - Always show when map or both view is selected */}
        {(viewMode === 'map' || viewMode === 'both') && (
          <div style={{ 
            marginTop: viewMode === 'both' ? '2rem' : '0',
            height: viewMode === 'both' ? '550px' : 'calc(100vh - 250px)',
            minHeight: viewMode === 'both' ? '550px' : '600px',
            width: '90%',
            maxWidth: '1200px',
            margin: viewMode === 'both' ? '0 auto' : '0 auto',
            borderRadius: '0.5rem',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}>
            <PropertyMap
              properties={mapProperties}
              selectedProperty={selectedProperty}
              onPropertySelect={setSelectedProperty}
              mapHeight={viewMode === 'both' ? '550px' : '100%'}
            />
          </div>
        )}

        {/* Empty State - Only show when no properties at all and in map view */}
        {properties.length === 0 && viewMode === 'map' && (
          <div className="property-cards">
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3>Search for your new dream rental/flip property</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

