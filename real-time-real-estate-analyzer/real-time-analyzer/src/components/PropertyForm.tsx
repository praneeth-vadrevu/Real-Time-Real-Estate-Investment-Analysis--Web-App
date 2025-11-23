import React, { useState, useEffect, useCallback } from 'react';
import { FiDownload, FiHome } from 'react-icons/fi';
import { useProperties } from '../context/PropertiesContext';
import PropertySearch from './PropertySearch';

interface PropertyFormProps {
  strategy: 'rental' | 'brrrr' | 'flip' | 'wholesale';
  onClose: () => void;
  selectedZpid?: string | null;
}

interface PropertyData {
  // Basic Information
  zpid?: string;
  
  // 1. Property Info
  address: string;
  city: string;
  state: string;
  zipCode: string;
  fairMarketValue: number | '';
  vacancyRate: number | '';
  managementRate: number | ''; // Management Rate as percentage
  advertisingCostPerVacancy: number | '';
  numberOfUnits: number | '';
  annualAppreciationRate: number | '';
  
  // 2. Purchase Info
  offerPrice: number | '';
  repairs: number | '';
  lendersFee: number | '';
  brokerFee: number | '';
  inspectionsOrEngineerReport: number | '';
  appraisals: number | '';
  misc: number | ''; // Site Visit, Title Ins, Corp, Assign Fee
  transferTax: number | '';
  legal: number | '';
  realPurchasePrice: number | ''; // RPP (calculated)
  
  // 3. Financing (Monthly)
  firstMtgPrincipleBorrowed: number | '';
  firstMtgInterestRate: number | ''; // Interest Rate as percentage
  firstMtgAmortizationPeriod: number | '';
  firstMtgTotalPrinciple: number | ''; // Incl. CMHC Fees
  firstMtgTotalMonthlyPayment: number | '';
  secondMtgInterestRate: number | ''; // 2nd Mortgage Interest Rate as percentage
  secondMtgAmortizationPeriod: number | '';
  cashRequiredToClose: number | '';
  
  // 4. Income (Annual)
  grossRents: number | '';
  
  // 5. Operating Expenses (Annual)
  propertyTaxes: number | '';
  insurance: number | '';
  repairsExpensePercent: number | ''; // Repairs as percentage
  electricity: number | '';
  waterSewer: number | '';
  management: number | ''; // Will be calculated from managementRate
  advertising: number | '';
  pestControl: number | '';
  security: number | '';
  evictions: number | '';
  
  // Legacy fields (for backward compatibility with API)
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  livingArea?: number;
  lotSize?: number;
  yearBuilt?: number;
  zestimate?: number;
  rentEstimate?: number;
  annualPropertyTax?: number;
  monthlyHoa?: number;
  arv?: number;
  rehabBudget?: number;
  daysOnMarket?: number;
  pricePerSqft?: number;
  heating?: string;
  cooling?: string;
  parkingFeatures?: string;
}

export default function PropertyForm({ strategy, onClose, selectedZpid }: PropertyFormProps) {
  const { addProperty, properties } = useProperties();
  const [inputMethod, setInputMethod] = useState<'select' | 'import' | 'manual' | 'search'>(selectedZpid ? 'manual' : 'select');
  const [isLoadingProperty, setIsLoadingProperty] = useState(false);
  const [propertyCoordinates, setPropertyCoordinates] = useState<{ lat?: number; lon?: number }>({});
  // Track which fields were auto-filled from Zillow API
  const [autoFilledFields, setAutoFilledFields] = useState<Set<keyof PropertyData>>(new Set());
  // Track if validation has been attempted (when analyze button is clicked)
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [formData, setFormData] = useState<PropertyData>({
    // Property Info
    address: '',
    city: '',
    state: '',
    zipCode: '',
    fairMarketValue: '',
    vacancyRate: 5,
    managementRate: 10,
    advertisingCostPerVacancy: 0,
    numberOfUnits: 1,
    annualAppreciationRate: 3,
    
    // Purchase Info
    offerPrice: '',
    repairs: 0,
    lendersFee: 0,
    brokerFee: 0,
    inspectionsOrEngineerReport: 0,
    appraisals: 0,
    misc: 0,
    transferTax: 0,
    legal: 0,
    realPurchasePrice: '',
    
    // Financing (Monthly)
    firstMtgPrincipleBorrowed: '',
    firstMtgInterestRate: '',
    firstMtgAmortizationPeriod: '',
    firstMtgTotalPrinciple: '',
    firstMtgTotalMonthlyPayment: '',
    secondMtgInterestRate: '',
    secondMtgAmortizationPeriod: '',
    cashRequiredToClose: '',
    
    // Income (Annual)
    grossRents: '',
    
    // Operating Expenses (Annual)
    propertyTaxes: '',
    insurance: 0,
    repairsExpensePercent: 5,
    electricity: 0,
    waterSewer: 0,
    management: 0, // Will be calculated
    advertising: 0,
    pestControl: 0,
    security: 0,
    evictions: 0,
  });

  const getStrategyTitle = () => {
    switch (strategy) {
      case 'rental': return 'Rental Property';
      case 'brrrr': return 'BRRRR Property';
      case 'flip': return 'Fix & Flip Property';
      case 'wholesale': return 'Wholesale Deal';
      default: return 'Property';
    }
  };

  const getStrategyDescription = () => {
    switch (strategy) {
      case 'rental': return 'Properties you plan to buy and hold for long-term cash flow, including short-term rentals.';
      case 'brrrr': return 'Properties you plan to buy, rehab, rent, refinance and repeat (BRRRR method).';
      case 'flip': return 'Properties you plan to buy, rehab and flip for a profit.';
      case 'wholesale': return 'Properties you plan to put under contract and wholesale to other investors.';
      default: return '';
    }
  };

  const handlePropertySelect = useCallback(async (zpid: string) => {
    try {
      setIsLoadingProperty(true);
      
      // Check if property already exists in properties list
      const existingProperty = properties.find(p => p.zpid === zpid);
      if (existingProperty) {
        alert('This property is already in your My Properties list!');
        setIsLoadingProperty(false);
        return;
      }

      // Call backend API to fetch property details from both Zillow and RealtyinUS APIs
      const response = await fetch(`http://localhost:8080/api/properties/${zpid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 0 || response.status === 503 || response.status === 502) {
          throw new Error('BACKEND_NOT_RUNNING');
        }
        throw new Error(`Failed to fetch property data: ${response.status} ${response.statusText}`);
      }

      const property = await response.json();
      
      // Debug: Log the raw address from API
      console.log('Raw address from API:', property.address);
      console.log('Property coordinates:', { lat: property.lat, lon: property.lon });
      
      // Parse address into components
      // First, check if API provides separate city, state, zipCode fields
      let streetAddress = '';
      let city = property.city || property.cityName || '';
      let state = property.state || property.stateCode || '';
      let zipCode = property.zipCode || property.zipcode || property.postalCode || property.postcode || '';

      // If separate fields not available, parse from address string
      if (property.address && (!city || !state || !zipCode)) {
        const addressParts = property.address.split(',').map((part: string) => part.trim());
        console.log('Address parts after split:', addressParts);
        
        if (addressParts.length >= 3) {
          // Format: "Street, City, State ZIP"
          streetAddress = addressParts[0];
          if (!city) city = addressParts[1];
          
          // Parse "State ZIP" - state is usually 2 letters, ZIP is 5 digits
          const lastPart = addressParts[2];
          console.log('Trying to parse state/ZIP from:', lastPart);
          const stateZipMatch = lastPart.match(/([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/);
          
          if (stateZipMatch) {
            if (!state) state = stateZipMatch[1];
            if (!zipCode) zipCode = stateZipMatch[2].substring(0, 5); // Take first 5 digits
            console.log('Regex matched! State:', state, 'ZIP:', zipCode);
          } else {
            console.log('Regex did not match, using fallback');
            // Fallback: split by space and take last as ZIP, second to last as state
            const parts = lastPart.split(/\s+/).filter(p => p.length > 0);
            console.log('Fallback parts:', parts);
            if (parts.length >= 2) {
              const lastPart = parts[parts.length - 1];
              const zipMatch = lastPart.match(/(\d{5})/);
              if (zipMatch && !zipCode) zipCode = zipMatch[1];
              if (!state && parts.length >= 2) {
                const stateCandidate = parts[parts.length - 2];
                if (stateCandidate.length === 2 && /^[A-Z]{2}$/.test(stateCandidate)) {
                  state = stateCandidate;
                }
              }
              console.log('Fallback result - State:', state, 'ZIP:', zipCode);
            }
          }
        } else if (addressParts.length === 2) {
          // Format: "Street, City State ZIP"
          streetAddress = addressParts[0];
          const cityStatePart = addressParts[1];
          console.log('Trying 2-part format. City/State/ZIP part:', cityStatePart);
          
          // Try to extract city, state, and ZIP
          const match = cityStatePart.match(/^(.+?)\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
          if (match) {
            if (!city) city = match[1].trim();
            if (!state) state = match[2];
            if (!zipCode) zipCode = match[3].substring(0, 5); // Take first 5 digits
            console.log('2-part regex matched! City:', city, 'State:', state, 'ZIP:', zipCode);
          } else {
            // Try to extract just city if state/zip pattern doesn't match
            const cityMatch = cityStatePart.match(/^(.+?)(?:\s+[A-Z]{2}\s+\d{5})?$/);
            if (cityMatch && !city) {
              city = cityMatch[1].trim();
            }
            // Try to extract state and zip separately
            const stateZipMatch = cityStatePart.match(/([A-Z]{2})\s+(\d{5})/);
            if (stateZipMatch) {
              if (!state) state = stateZipMatch[1];
              if (!zipCode) zipCode = stateZipMatch[2];
            }
            console.log('2-part regex did not match, partial extraction');
          }
        } else {
          // Single string - use as is, but try to extract state/zip if present
          streetAddress = property.address;
          const stateZipMatch = property.address.match(/([A-Z]{2})\s+(\d{5})/);
          if (stateZipMatch) {
            if (!state) state = stateZipMatch[1];
            if (!zipCode) zipCode = stateZipMatch[2];
          }
          console.log('Single string address, attempted parsing');
        }
      } else if (property.address && !streetAddress) {
        streetAddress = property.address;
      }
      
      // Debug: Log parsed address components
      console.log('Parsed address components:', { streetAddress, city, state, zipCode });
      console.log('API property object:', property);
      
      // Parse coordinates from API if available
      const apiLat = property.lat || property.latitude || null;
      const apiLon = property.lon || property.lng || property.longitude || null;
      
      console.log('API coordinates:', { apiLat, apiLon, property: property });
      
      // Parse coordinates for adding to properties
      let lat: number | undefined = undefined;
      let lon: number | undefined = undefined;
      
      if (apiLat != null && apiLon != null) {
        const parsedLat = typeof apiLat === 'number' ? apiLat : (apiLat !== '' ? parseFloat(String(apiLat)) : null);
        const parsedLon = typeof apiLon === 'number' ? apiLon : (apiLon !== '' ? parseFloat(String(apiLon)) : null);
        if (parsedLat != null && !isNaN(parsedLat) && parsedLon != null && !isNaN(parsedLon)) {
          lat = parsedLat;
          lon = parsedLon;
          setPropertyCoordinates({ lat, lon });
          console.log('Stored coordinates from API:', { lat, lon });
        }
      }

      // If we have coordinates but missing city/state/zip, try reverse geocoding
      if (lat && lon && (!city || !state || !zipCode) && typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
        try {
          console.log('Attempting reverse geocoding for city, state, zip...');
          const geocoder = new google.maps.Geocoder();
          const result = await new Promise<{ city: string; state: string; zipCode: string } | null>((resolve) => {
            geocoder.geocode({ location: { lat, lng: lon } }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                let foundCity = city;
                let foundState = state;
                let foundZipCode = zipCode;
                
                // Parse address components
                for (const component of results[0].address_components) {
                  const types = component.types;
                  if (types.includes('locality') || types.includes('sublocality') || types.includes('sublocality_level_1')) {
                    if (!foundCity) foundCity = component.long_name;
                  }
                  if (types.includes('administrative_area_level_1')) {
                    if (!foundState) foundState = component.short_name;
                  }
                  if (types.includes('postal_code')) {
                    if (!foundZipCode) foundZipCode = component.long_name.substring(0, 5);
                  }
                }
                
                console.log('Reverse geocoding result:', { foundCity, foundState, foundZipCode });
                resolve({ city: foundCity, state: foundState, zipCode: foundZipCode });
              } else {
                console.log('Reverse geocoding failed:', status);
                resolve(null);
              }
            });
          });
          
          if (result) {
            if (!city && result.city) city = result.city;
            if (!state && result.state) state = result.state;
            if (!zipCode && result.zipCode) zipCode = result.zipCode;
            console.log('Updated address from reverse geocoding:', { city, state, zipCode });
          }
        } catch (error) {
          console.warn('Reverse geocoding error:', error);
        }
      }
      
      // Track which fields were auto-filled from API
      const filledFields = new Set<keyof PropertyData>();
      
      // Helper to check if value exists and add to filledFields
      const setIfAvailable = (field: keyof PropertyData, value: any, defaultValue: any = '') => {
        if (value !== null && value !== undefined && value !== '') {
          filledFields.add(field);
          return value;
        }
        return defaultValue;
      };
      
      // Map API response to form data, tracking which fields were filled
      const newFormData: PropertyData = {
        zpid: setIfAvailable('zpid', property.zpid),
        
        // Property Info
        address: setIfAvailable('address', streetAddress),
        city: setIfAvailable('city', city),
        state: setIfAvailable('state', state),
        zipCode: setIfAvailable('zipCode', zipCode),
        fairMarketValue: setIfAvailable('fairMarketValue', property.zestimate || property.price, ''),
        vacancyRate: 5, // Default (not from API)
        managementRate: 10, // Default (not from API)
        advertisingCostPerVacancy: 0, // Default (not from API)
        numberOfUnits: 1, // Default (not from API)
        annualAppreciationRate: 3, // Default (not from API)
        
        // Purchase Info
        offerPrice: setIfAvailable('offerPrice', property.price, ''),
        repairs: 0, // Default (not from API)
        lendersFee: 0, // Default (not from API)
        brokerFee: 0, // Default (not from API)
        inspectionsOrEngineerReport: 0, // Default (not from API)
        appraisals: 0, // Default (not from API)
        misc: 0, // Default (not from API)
        transferTax: 0, // Default (not from API)
        legal: 0, // Default (not from API)
        realPurchasePrice: setIfAvailable('realPurchasePrice', property.price, ''),
        
        // Financing (Monthly) - Not available from API
        firstMtgPrincipleBorrowed: '',
        firstMtgInterestRate: '',
        firstMtgAmortizationPeriod: '',
        firstMtgTotalPrinciple: '',
        firstMtgTotalMonthlyPayment: '',
        secondMtgInterestRate: '',
        secondMtgAmortizationPeriod: '',
        cashRequiredToClose: '',
        
        // Income (Annual) - Can estimate from API
        grossRents: setIfAvailable('grossRents', property.rentEstimate ? property.rentEstimate * 12 : null, ''),
        
        // Operating Expenses (Annual) - Can estimate from API
        propertyTaxes: setIfAvailable('propertyTaxes', property.annualTax, ''),
        insurance: 0, // Default (not from API)
        repairsExpensePercent: 5, // Default percentage
        electricity: 0, // Default (not from API)
        waterSewer: 0, // Default (not from API)
        management: 0, // Will be calculated from managementRate
        advertising: 0, // Default (not from API)
        pestControl: 0, // Default (not from API)
        security: 0, // Default (not from API)
        evictions: 0, // Default (not from API)
        
        // Legacy fields (for reference)
        propertyType: property.propertyType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        livingArea: property.livingArea,
        lotSize: property.lotAreaValue,
        yearBuilt: property.yearBuilt,
        zestimate: property.zestimate,
        rentEstimate: property.rentEstimate,
        annualPropertyTax: property.annualTax,
        monthlyHoa: property.hoaMonthly,
        pricePerSqft: property.pricePerSqft,
        daysOnMarket: property.daysOnZillow,
        heating: property.heating?.join(', '),
        cooling: property.cooling?.join(', '),
        parkingFeatures: property.parkingFeatures?.join(', '),
        arv: (strategy === 'brrrr' || strategy === 'flip') ? (property.zestimate || property.price) : undefined,
        rehabBudget: (strategy === 'brrrr' || strategy === 'flip') ? 0 : undefined,
      };
      
      console.log('Setting form data:', newFormData);
      console.log('Auto-filled fields from Zillow API:', Array.from(filledFields));
      console.log('Fields requiring manual input:', Object.keys(newFormData).filter(key => !filledFields.has(key as keyof PropertyData)));
      
      // Set form data instead of directly adding to properties
      // This allows user to review and edit before submitting
      setFormData(newFormData);
      setAutoFilledFields(filledFields);
      setInputMethod('manual');
      setIsLoadingProperty(false);
    } catch (error: any) {
      console.error('Error fetching property:', error);
      setIsLoadingProperty(false);
      
      if (error.message === 'BACKEND_NOT_RUNNING' || error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        alert('Backend server is not running. Please start the backend server on port 8080.\n\nMake sure:\n1. The backend server is running on port 8080\n2. The server has access to Zillow and RealtyinUS APIs\n3. Check the console for detailed error messages');
      } else {
        alert(`Failed to fetch property data: ${error.message || 'Unknown error'}\n\nPlease make sure the backend server is running and has access to the property APIs.`);
      }
    }
  }, [properties, strategy]);

  // Load property data when selectedZpid is provided
  useEffect(() => {
    if (selectedZpid) {
      // Ensure inputMethod is set to 'manual' when a property is selected
      if (inputMethod !== 'manual') {
        setInputMethod('manual');
      }
      // Load the property data
      handlePropertySelect(selectedZpid);
    }
  }, [selectedZpid, handlePropertySelect]); // Removed inputMethod from dependencies to avoid race conditions

  const handleInputChange = (field: keyof PropertyData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Remove from auto-filled fields if user manually edits
    setAutoFilledFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
  };

  // Helper to check if field needs highlighting (only after validation is attempted)
  const isFieldMissingData = (field: keyof PropertyData): boolean => {
    // Only highlight if validation has been attempted (analyze button clicked)
    if (!validationAttempted) return false;
    
    // Check if field is empty (no value from API or user)
    const value = formData[field];
    
    // Fields that can have 0 as a valid value
    const fieldsThatCanBeZero = ['vacancyRate', 'numberOfUnits', 'annualAppreciationRate', 
      'repairs', 'lendersFee', 'brokerFee', 'inspectionsOrEngineerReport', 'appraisals', 
      'misc', 'transferTax', 'legal', 'insurance', 'repairsExpensePercent', 'electricity', 
      'waterSewer', 'management', 'advertising', 'pestControl', 'security', 'evictions', 
      'advertisingCostPerVacancy', 'managementRate'];
    
    if (typeof value === 'number' && value === 0 && fieldsThatCanBeZero.includes(field)) {
      return false; // 0 is valid for these fields
    }
    
    // Check if field is truly empty
    return value === '' || value === null || value === undefined || 
           (typeof value === 'number' && value === 0);
  };
  
  const handleSaveProperty = async () => {
    // Check if property already exists
    if (formData.zpid) {
      const existingProperty = properties.find(p => p.zpid === formData.zpid);
      if (existingProperty) {
        alert('This property is already in your My Properties list!');
        return;
      }
    }

    // Use coordinates from API import if available, otherwise geocode
    let lat: number | undefined = propertyCoordinates.lat;
    let lon: number | undefined = propertyCoordinates.lon;
    
    // Try to geocode the address if we have city, state, and zip but no coordinates yet
    if (formData.city && formData.state && formData.zipCode && !lat && !lon) {
      try {
        const fullAddress = `${formData.address || ''}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim();
        if (fullAddress && typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
          const geocoder = new google.maps.Geocoder();
          const result = await new Promise<{ lat: number; lon: number } | null>((resolve) => {
            geocoder.geocode({ address: fullAddress }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const location = results[0].geometry.location;
                resolve({ lat: location.lat(), lon: location.lng() });
              } else {
                resolve(null);
              }
            });
          });
          if (result) {
            lat = result.lat;
            lon = result.lon;
            setPropertyCoordinates({ lat, lon });
          }
        }
      } catch (err) {
        console.warn('Failed to geocode address:', err);
      }
    }
    
    // Save property to context
    addProperty({
      zpid: formData.zpid,
      strategy: strategy,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      price: typeof formData.offerPrice === 'number' ? formData.offerPrice : undefined,
      purchasePrice: typeof formData.realPurchasePrice === 'number' ? formData.realPurchasePrice : 
                     (typeof formData.offerPrice === 'number' ? formData.offerPrice : undefined),
      cashFlow: undefined, // Will be calculated later
      capRate: undefined, // Will be calculated later
      coc: undefined, // Will be calculated later
      image: undefined, // Will be set from API if available
      propertyType: formData.propertyType,
      bedrooms: formData.bedrooms,
      lat: lat,
      lon: lon,
      bathrooms: formData.bathrooms,
      livingArea: formData.livingArea,
      isShortlisted: false,
    });
    
    console.log('Property saved:', { strategy, data: formData });
    alert(`${getStrategyTitle()} has been saved to your My Properties list!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark validation as attempted to show missing field highlights
    setValidationAttempted(true);
    
    // Check for required fields (matching the required attributes in the form)
    const requiredFields: (keyof PropertyData)[] = [
      'address', 'city', 'state', 'zipCode', 'fairMarketValue', 
      'numberOfUnits', 'offerPrice', 'grossRents'
    ];
    
    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      // numberOfUnits has a default of 1, so check if it's less than 1
      if (field === 'numberOfUnits') {
        return !value || (typeof value === 'number' && value < 1);
      }
      return value === '' || value === null || value === undefined || 
             (typeof value === 'number' && value === 0);
    });
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields:\n${missingFields.map(f => f.toString()).join(', ')}`);
      return; // Don't proceed if required fields are missing
    }
    
    // Use coordinates from API import if available, otherwise geocode
    let lat: number | undefined = propertyCoordinates.lat;
    let lon: number | undefined = propertyCoordinates.lon;
    
    // Try to geocode the address if we have city, state, and zip but no coordinates yet
    if (formData.city && formData.state && formData.zipCode && !lat && !lon) {
      try {
        const fullAddress = `${formData.address || ''}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim();
        if (fullAddress && typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
          const geocoder = new google.maps.Geocoder();
          const result = await new Promise<{ lat: number; lon: number } | null>((resolve) => {
            geocoder.geocode({ address: fullAddress }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const location = results[0].geometry.location;
                resolve({ lat: location.lat(), lon: location.lng() });
              } else {
                resolve(null);
              }
            });
          });
          if (result) {
            lat = result.lat;
            lon = result.lon;
          }
        }
      } catch (err) {
        console.warn('Failed to geocode address:', err);
      }
    }
    
    // Save property to context
    addProperty({
      zpid: formData.zpid,
      strategy: strategy,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      price: typeof formData.offerPrice === 'number' ? formData.offerPrice : undefined,
      purchasePrice: typeof formData.realPurchasePrice === 'number' ? formData.realPurchasePrice : 
                     (typeof formData.offerPrice === 'number' ? formData.offerPrice : undefined),
      cashFlow: undefined, // Will be calculated later
      capRate: undefined, // Will be calculated later
      coc: undefined, // Will be calculated later
      image: undefined, // Will be set from API if available
      propertyType: formData.propertyType,
      bedrooms: formData.bedrooms,
      lat: lat,
      lon: lon,
      bathrooms: formData.bathrooms,
      livingArea: formData.livingArea,
      isShortlisted: false,
    });
    
    console.log('Form submitted:', { strategy, data: formData });
    alert(`${getStrategyTitle()} has been added to your dashboard!`);
    onClose();
  };

  // Show loading state while fetching property data
  if (isLoadingProperty && selectedZpid) {
    return (
      <div className="property-form-container">
        <div className="property-form-header">
          <h2>Loading Property Data</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '4rem 2rem',
          minHeight: '400px'
        }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '0.5rem' }}>Fetching property details...</p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center' }}>
            Loading data from Zillow and RealtyinUS APIs
          </p>
        </div>
      </div>
    );
  }

  // Selection Screen
  if (inputMethod === 'select') {
    return (
      <div className="property-form-container">
        <div className="property-form-header">
          <div>
            <h2>Add New {getStrategyTitle()}</h2>
            <p style={{ 
              marginTop: '0.5rem', 
              color: '#6b7280', 
              fontSize: '0.875rem',
              lineHeight: '1.5'
            }}>
              {getStrategyDescription()}
            </p>
          </div>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="input-method-selection">
          <div className="selection-card" onClick={() => setInputMethod('search')}>
            <div className="card-icon import-icon">
              <FiDownload style={{ width: '2.5rem', height: '2.5rem' }} />
            </div>
            <h3>Import</h3>
            <p>Search and select properties to automatically import data from Zillow</p>
            <div className="card-badge">Recommended</div>
          </div>

          <div className="selection-card" onClick={() => setInputMethod('manual')}>
            <div className="card-icon manual-icon">
              <svg style={{ width: '2.5rem', height: '2.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3>Enter Manually</h3>
            <p>Input all property details manually for custom analysis</p>
          </div>
        </div>
      </div>
    );
  }

  // Property Search Screen
  if (inputMethod === 'search') {
    return (
      <PropertySearch
        onPropertySelect={handlePropertySelect}
        onCancel={() => setInputMethod('select')}
      />
    );
  }

  // Manual Entry Form
  return (
    <div className="property-form-container">
      <div className="property-form-header">
        <div>
          <h2>{formData.zpid ? 'Review' : 'Enter'} {getStrategyTitle()} Details</h2>
          <p style={{ 
            marginTop: '0.5rem', 
            color: '#6b7280', 
            fontSize: '0.875rem',
            lineHeight: '1.5'
          }}>
            {getStrategyDescription()}
          </p>
        </div>
        <button onClick={onClose} className="close-button">×</button>
      </div>

      <form onSubmit={handleSubmit} className="property-form">
        {/* 1. Property Info Section */}
        <div className="form-section">
          <div className="section-header">
            <FiHome className="section-icon" />
            <h3>1. Property Info</h3>
          </div>
          <div className="form-grid">
            <div className={`form-group full-width ${isFieldMissingData('address') ? 'field-missing-data' : ''}`}>
              <label>Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main Street, City, State ZIP"
                className={isFieldMissingData('address') ? 'field-missing-data' : ''}
                required
              />
            </div>
            <div className={`form-group ${isFieldMissingData('city') || isFieldMissingData('state') ? 'field-missing-data' : ''}`}>
              <label>City, State</label>
              <input
                type="text"
                value={formData.city && formData.state ? `${formData.city}, ${formData.state}` : (formData.city || formData.state || '')}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  // Parse "City, State" format
                  if (value.includes(',')) {
                    const parts = value.split(',').map(p => p.trim());
                    const city = parts[0] || '';
                    const state = parts[1] || '';
                    setFormData(prev => ({ ...prev, city, state }));
                    // Remove from auto-filled fields if user manually edits
                    setAutoFilledFields(prev => {
                      const newSet = new Set(prev);
                      newSet.delete('city');
                      newSet.delete('state');
                      return newSet;
                    });
                  } else {
                    // If no comma, treat as city only
                    setFormData(prev => ({ ...prev, city: value, state: '' }));
                    setAutoFilledFields(prev => {
                      const newSet = new Set(prev);
                      newSet.delete('city');
                      newSet.delete('state');
                      return newSet;
                    });
                  }
                }}
                placeholder="Boston, MA"
                className={isFieldMissingData('city') || isFieldMissingData('state') ? 'field-missing-data' : ''}
                required
              />
            </div>
            <div className={`form-group ${isFieldMissingData('zipCode') ? 'field-missing-data' : ''}`}>
              <label>ZIP Code</label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                maxLength={5}
                className={isFieldMissingData('zipCode') ? 'field-missing-data' : ''}
                required
              />
            </div>
            <div className={`form-group ${isFieldMissingData('fairMarketValue') ? 'field-missing-data' : ''}`}>
              <label>Fair Market Value ($)</label>
              <input
                type="number"
                value={formData.fairMarketValue}
                onChange={(e) => handleInputChange('fairMarketValue', parseFloat(e.target.value) || '')}
                placeholder="0"
                className={isFieldMissingData('fairMarketValue') ? 'field-missing-data' : ''}
                required
              />
            </div>
            <div className="form-group">
              <label>Vacancy Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.vacancyRate}
                onChange={(e) => handleInputChange('vacancyRate', parseFloat(e.target.value) || '')}
                placeholder="5"
              />
            </div>
            <div className="form-group">
              <label>Management Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.managementRate}
                onChange={(e) => handleInputChange('managementRate', parseFloat(e.target.value) || '')}
                placeholder="10"
              />
            </div>
            <div className="form-group">
              <label>Advertising Cost per Vacancy ($)</label>
              <input
                type="number"
                value={formData.advertisingCostPerVacancy}
                onChange={(e) => handleInputChange('advertisingCostPerVacancy', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Number of Units</label>
              <input
                type="number"
                value={formData.numberOfUnits}
                onChange={(e) => handleInputChange('numberOfUnits', parseInt(e.target.value) || '')}
                placeholder="1"
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Annual Appreciation Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.annualAppreciationRate}
                onChange={(e) => handleInputChange('annualAppreciationRate', parseFloat(e.target.value) || '')}
                placeholder="3"
              />
            </div>
          </div>
        </div>

        {/* 2. Purchase Info Section */}
        <div className="form-section">
          <div className="section-header">
            <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>2. Purchase Info</h3>
          </div>
          <div className="form-grid">
            <div className={`form-group ${isFieldMissingData('offerPrice') ? 'field-missing-data' : ''}`}>
              <label>Offer Price ($)</label>
              <input
                type="number"
                value={formData.offerPrice}
                onChange={(e) => handleInputChange('offerPrice', parseFloat(e.target.value) || '')}
                placeholder="0"
                className={isFieldMissingData('offerPrice') ? 'field-missing-data' : ''}
                required
              />
            </div>
            <div className="form-group">
              <label>Repairs ($)</label>
              <input
                type="number"
                value={formData.repairs}
                onChange={(e) => handleInputChange('repairs', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Lender Fee ($)</label>
              <input
                type="number"
                value={formData.lendersFee}
                onChange={(e) => handleInputChange('lendersFee', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Broker Fee ($)</label>
              <input
                type="number"
                value={formData.brokerFee}
                onChange={(e) => handleInputChange('brokerFee', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Inspections or Engineer Report ($)</label>
              <input
                type="number"
                value={formData.inspectionsOrEngineerReport}
                onChange={(e) => handleInputChange('inspectionsOrEngineerReport', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Appraisals ($)</label>
              <input
                type="number"
                value={formData.appraisals}
                onChange={(e) => handleInputChange('appraisals', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Misc (Site Visit, Title Ins, Corp, Assign Fee) ($)</label>
              <input
                type="number"
                value={formData.misc}
                onChange={(e) => handleInputChange('misc', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Transfer Tax ($)</label>
              <input
                type="number"
                value={formData.transferTax}
                onChange={(e) => handleInputChange('transferTax', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Legal ($)</label>
              <input
                type="number"
                value={formData.legal}
                onChange={(e) => handleInputChange('legal', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Real Purchase Price (RPP) ($)</label>
              <input
                type="number"
                value={formData.realPurchasePrice}
                onChange={(e) => handleInputChange('realPurchasePrice', parseFloat(e.target.value) || '')}
                placeholder="0"
                disabled
                title="Calculated automatically"
              />
            </div>
          </div>
        </div>

        {/* 3. Financing (Monthly) Section */}
        <div className="form-section">
          <div className="section-header">
            <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3>3. Financing (Monthly)</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>1st Mtg Principle Borrowed ($)</label>
              <input
                type="number"
                value={formData.firstMtgPrincipleBorrowed}
                onChange={(e) => handleInputChange('firstMtgPrincipleBorrowed', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>1st Mtg Interest Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.firstMtgInterestRate}
                onChange={(e) => handleInputChange('firstMtgInterestRate', parseFloat(e.target.value) || '')}
                placeholder="7.00"
              />
            </div>
            <div className="form-group">
              <label>1st Mtg Amortization Period (Years)</label>
              <input
                type="number"
                value={formData.firstMtgAmortizationPeriod}
                onChange={(e) => handleInputChange('firstMtgAmortizationPeriod', parseFloat(e.target.value) || '')}
                placeholder="30"
              />
            </div>
            <div className="form-group">
              <label>1st Mtg Total Principle (Incl. CMHC Fees) ($)</label>
              <input
                type="number"
                value={formData.firstMtgTotalPrinciple}
                onChange={(e) => handleInputChange('firstMtgTotalPrinciple', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>1st Mtg Total Monthly Payment ($)</label>
              <input
                type="number"
                value={formData.firstMtgTotalMonthlyPayment}
                onChange={(e) => handleInputChange('firstMtgTotalMonthlyPayment', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>2nd Mtg Interest Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.secondMtgInterestRate}
                onChange={(e) => handleInputChange('secondMtgInterestRate', parseFloat(e.target.value) || '')}
                placeholder="12.00"
              />
            </div>
            <div className="form-group">
              <label>2nd Mtg Amortization Period (Years)</label>
              <input
                type="number"
                value={formData.secondMtgAmortizationPeriod}
                onChange={(e) => handleInputChange('secondMtgAmortizationPeriod', parseFloat(e.target.value) || '')}
                placeholder="9999"
              />
            </div>
            <div className="form-group">
              <label>Cash Required to Close (After Financing) ($)</label>
              <input
                type="number"
                value={formData.cashRequiredToClose}
                onChange={(e) => handleInputChange('cashRequiredToClose', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* 4. Income (Annual) Section */}
        <div className="form-section">
          <div className="section-header">
            <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>4. Income (Annual)</h3>
          </div>
          <div className="form-grid">
            <div className={`form-group ${isFieldMissingData('grossRents') ? 'field-missing-data' : ''}`}>
              <label>Gross Rents ($)</label>
              <input
                type="number"
                value={formData.grossRents}
                onChange={(e) => handleInputChange('grossRents', parseFloat(e.target.value) || '')}
                placeholder="0"
                className={isFieldMissingData('grossRents') ? 'field-missing-data' : ''}
                required
              />
            </div>
          </div>
        </div>

        {/* 5. Operating Expenses (Annual) Section */}
        <div className="form-section">
          <div className="section-header">
            <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3>5. Operating Expenses (Annual)</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Property Taxes ($)</label>
              <input
                type="number"
                value={formData.propertyTaxes}
                onChange={(e) => handleInputChange('propertyTaxes', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Insurance ($)</label>
              <input
                type="number"
                value={formData.insurance}
                onChange={(e) => handleInputChange('insurance', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Repairs (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.repairsExpensePercent}
                onChange={(e) => handleInputChange('repairsExpensePercent', parseFloat(e.target.value) || '')}
                placeholder="5.00"
              />
            </div>
            <div className="form-group">
              <label>Electricity ($)</label>
              <input
                type="number"
                value={formData.electricity}
                onChange={(e) => handleInputChange('electricity', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Water / Sewer ($)</label>
              <input
                type="number"
                value={formData.waterSewer}
                onChange={(e) => handleInputChange('waterSewer', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Management ($)</label>
              <input
                type="number"
                value={formData.management}
                onChange={(e) => handleInputChange('management', parseFloat(e.target.value) || '')}
                placeholder="0"
                disabled
                title="Calculated from Management Rate"
              />
            </div>
            <div className="form-group">
              <label>Advertising ($)</label>
              <input
                type="number"
                value={formData.advertising}
                onChange={(e) => handleInputChange('advertising', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Pest Control ($)</label>
              <input
                type="number"
                value={formData.pestControl}
                onChange={(e) => handleInputChange('pestControl', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Security ($)</label>
              <input
                type="number"
                value={formData.security}
                onChange={(e) => handleInputChange('security', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Evictions ($)</label>
              <input
                type="number"
                value={formData.evictions}
                onChange={(e) => handleInputChange('evictions', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleSaveProperty} className="btn-secondary" style={{ backgroundColor: '#10b981', color: 'white', border: 'none' }}>
            Save this Property
          </button>
          <button type="submit" className="btn-primary">
            Analyze {getStrategyTitle()}
          </button>
        </div>
      </form>
    </div>
  );
}

