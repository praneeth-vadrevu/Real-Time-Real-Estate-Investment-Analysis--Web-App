import React from 'react';
import { FiPlus, FiHome } from 'react-icons/fi';

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

interface PropertyPopupProps {
  property: Property;
  onClose: () => void;
  onAddToList: (property: Property) => void;
  isAlreadyAdded?: boolean;
}

export default function PropertyPopup({ property, onClose, onAddToList, isAlreadyAdded = false }: PropertyPopupProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToList = () => {
    onAddToList(property);
    onClose();
  };

  return (
    <div 
      className="property-popup-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem',
      }}
    >
      <div 
        className="property-popup-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            backgroundColor: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '2rem',
            height: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            zIndex: 10,
          }}
        >
          <svg style={{ width: '1.25rem', height: '1.25rem', color: '#374151' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Property Image */}
        {property.imgSrc && (
          <div style={{
            width: '100%',
            height: '250px',
            overflow: 'hidden',
            borderTopLeftRadius: '0.75rem',
            borderTopRightRadius: '0.75rem',
          }}>
            <img
              src={property.imgSrc}
              alt={property.address}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {property.status && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}>
                {property.status}
              </div>
            )}
          </div>
        )}

        {/* Property Details */}
        <div style={{ padding: '1.5rem' }}>
          {/* Price */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              fontSize: '1.875rem',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '0.5rem',
            }}>
              {formatPrice(property.price)}
            </div>
          </div>

          {/* Address */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}>
            <svg style={{ width: '1.25rem', height: '1.25rem', color: '#6b7280', marginTop: '0.125rem', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '0.25rem',
              }}>
                {property.address}
              </div>
            </div>
          </div>

          {/* Property Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '0.25rem',
              }}>
                {property.bedrooms}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
              }}>
                Bedrooms
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '0.25rem',
              }}>
                {property.bathrooms}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
              }}>
                Bathrooms
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '0.25rem',
              }}>
                {property.livingArea?.toLocaleString() || 'N/A'}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
              }}>
                Sq Ft
              </div>
            </div>
          </div>

          {/* Property Type */}
          {property.propertyType && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              padding: '0.75rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.5rem',
            }}>
              <FiHome style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                {property.propertyType}
              </span>
            </div>
          )}

          {/* Add to My List Button */}
          <button
            onClick={handleAddToList}
            disabled={isAlreadyAdded}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              backgroundColor: isAlreadyAdded ? '#10b981' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isAlreadyAdded ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isAlreadyAdded) {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (!isAlreadyAdded) {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            {isAlreadyAdded ? (
              <>
                <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Already in My List
              </>
            ) : (
              <>
                <FiPlus style={{ width: '1.25rem', height: '1.25rem' }} />
                Add to My List
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

