import React, { useState, useEffect } from 'react';
import GooglePlacesAutocomplete, { geocodeByPlaceId, getLatLng } from 'react-google-places-autocomplete';
import { Button } from "./ui/button";
import { X, AlertCircle, MapPin, Edit3 } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

const AddressPicker = ({ onAddressSelect, studentType, value, error, placeholder = "Start typing your address..." }) => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [internalError, setInternalError] = useState(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualAddressData, setManualAddressData] = useState({
    country: 'CA',
    province: '',
    city: '',
    addressType: 'urban',
    address: ''
  });

  // Canadian provinces and territories
  const canadianProvinces = [
    { code: 'AB', name: 'Alberta' },
    { code: 'BC', name: 'British Columbia' },
    { code: 'MB', name: 'Manitoba' },
    { code: 'NB', name: 'New Brunswick' },
    { code: 'NL', name: 'Newfoundland and Labrador' },
    { code: 'NS', name: 'Nova Scotia' },
    { code: 'NT', name: 'Northwest Territories' },
    { code: 'NU', name: 'Nunavut' },
    { code: 'ON', name: 'Ontario' },
    { code: 'PE', name: 'Prince Edward Island' },
    { code: 'QC', name: 'Quebec' },
    { code: 'SK', name: 'Saskatchewan' },
    { code: 'YT', name: 'Yukon' }
  ];

  const countries = [
    { code: 'CA', name: 'Canada' },
    { code: 'OTHER', name: 'Other' }
  ];

  // Initialize selectedPlace from value prop
  useEffect(() => {
    if (value) {
      setSelectedPlace(value);
    } else {
      setSelectedPlace(null);
    }
  }, [value]);

  const handleSelect = async (selection) => {
    try {
      setInternalError(null);
      const results = await geocodeByPlaceId(selection.value.place_id);
      if (results?.[0]) {
        const place = results[0];
        
        // Get latitude and longitude
        const latLng = await getLatLng(place);
        
        // Extract address components
        const addressComponents = place.address_components;
        let streetNumber = '';
        let streetName = '';
        let city = '';
        let province = '';
        let postalCode = '';
        let country = '';
        let countryLong = '';

        addressComponents.forEach(component => {
          const types = component.types;
          if (types.includes('street_number')) {
            streetNumber = component.long_name;
          }
          if (types.includes('route')) {
            streetName = component.long_name;
          }
          if (types.includes('locality')) {
            city = component.long_name;
          }
          // Fallback for city - try sublocality_level_1 for international addresses
          if (!city && types.includes('sublocality_level_1')) {
            city = component.long_name;
          }
          // Another fallback - try administrative_area_level_2
          if (!city && types.includes('administrative_area_level_2')) {
            city = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            province = component.short_name;
          }
          if (types.includes('country')) {
            country = component.short_name;
            countryLong = component.long_name;
          }
          if (types.includes('postal_code')) {
            postalCode = component.long_name;
          }
        });

        // Final fallback for international addresses - extract city from formatted address
        const needsCityFallback = studentType === 'International Student' || 
                                 studentType === 'Adult Student' || 
                                 studentType === 'Parent Verification';
        
        if (!city && needsCityFallback) {
          // Try to extract city from the last part of the formatted address before country
          const addressParts = place.formatted_address.split(',').map(part => part.trim());
          if (addressParts.length >= 2) {
            // Take the second-to-last part as a potential city
            const potentialCity = addressParts[addressParts.length - 2];
            if (potentialCity && potentialCity !== country && potentialCity !== countryLong) {
              city = potentialCity;
            }
          }
        }

        // For students other than International, Adult, and Parent Verification, check if the address is in Alberta
        const normalizedStudentType = studentType?.trim();
        const isRestrictedType = normalizedStudentType !== 'International Student' && 
                                normalizedStudentType !== 'Adult Student' && 
                                normalizedStudentType !== 'Parent Verification';
        
        if (isRestrictedType && province !== 'AB') {
          setInternalError('Please select an address within Alberta. The selected address is in ' + province + '.');
          return;
        }
        
        // Format the address details
        const addressDetails = {
          streetAddress: `${streetNumber} ${streetName}`.trim(),
          city: city,
          province: province,
          country: country,
          countryLong: countryLong,
          postalCode: postalCode,
          placeId: selection.value.place_id,
          fullAddress: place.formatted_address,
          location: {
            lat: latLng.lat,
            lng: latLng.lng
          },
          // Additional useful data
          formattedAddress: place.formatted_address,
          types: place.types || []
        };
        
        setSelectedPlace(addressDetails);
        onAddressSelect(addressDetails);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      setInternalError('Failed to fetch address details. Please try again.');
    }
  };

  const handleClear = () => {
    setSelectedPlace(null);
    onAddressSelect(null);
    setInternalError(null);
  };

  // Manual entry handlers
  const toggleToManualEntry = () => {
    setIsManualEntry(true);
    setSelectedPlace(null);
    setInternalError(null);
  };

  const toggleToAutocomplete = () => {
    setIsManualEntry(false);
    setManualAddressData({
      country: 'CA',
      province: '',
      city: '',
      addressType: 'urban',
      address: ''
    });
    setInternalError(null);
  };

  const handleManualInputChange = (field, value) => {
    setManualAddressData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Clear province when country changes from CA to something else
      if (field === 'country' && prev.country === 'CA' && value !== 'CA') {
        newData.province = '';
      }
      
      return newData;
    });
    setInternalError(null);
  };

  const validateManualEntry = () => {
    const errors = [];
    if (!manualAddressData.country) errors.push('Country is required');
    
    // Province is only required for Canadian addresses
    if (manualAddressData.country === 'CA' && !manualAddressData.province) {
      errors.push('Province is required for Canadian addresses');
    }
    
    // City is only required for Canadian addresses
    if (manualAddressData.country === 'CA' && !manualAddressData.city.trim()) {
      errors.push('City/Town is required');
    }
    
    if (!manualAddressData.address.trim()) errors.push('Address is required');
    if (manualAddressData.address.trim().length < 10) errors.push('Please provide a more complete address');
    
    return errors;
  };

  const handleManualSubmit = () => {
    const validationErrors = validateManualEntry();
    if (validationErrors.length > 0) {
      setInternalError(validationErrors[0]);
      return;
    }

    // Check Alberta restriction - only applies to Canadian addresses
    const normalizedStudentType = studentType?.trim();
    const isRestrictedType = normalizedStudentType !== 'International Student' && 
                            normalizedStudentType !== 'Adult Student' && 
                            normalizedStudentType !== 'Parent Verification';
    
    if (isRestrictedType && manualAddressData.country === 'CA' && manualAddressData.province !== 'AB') {
      setInternalError('Please select Alberta as your province. Only Alberta addresses are allowed for this student type.');
      return;
    }

    // Create address structure matching autocomplete format
    const selectedCountry = countries.find(c => c.code === manualAddressData.country);
    const selectedProvince = canadianProvinces.find(p => p.code === manualAddressData.province);
    
    const addressDetails = {
      streetAddress: '', // Empty for manual entries
      city: manualAddressData.country === 'CA' ? manualAddressData.city.trim() : '', // City only for Canada
      province: manualAddressData.country === 'CA' ? manualAddressData.province : '', // Province only for Canada
      country: manualAddressData.country,
      countryLong: selectedCountry?.name || manualAddressData.country,
      postalCode: '', // Empty for manual entries
      placeId: null, // Indicates manual entry
      fullAddress: manualAddressData.address.trim(),
      formattedAddress: manualAddressData.address.trim(),
      location: null, // No coordinates for manual entries
      types: ['manual_entry', manualAddressData.addressType],
      isManualEntry: true
    };

    setSelectedPlace(addressDetails);
    onAddressSelect(addressDetails);
  };
  // Different configurations based on student type
  const isUnrestrictedType = studentType === 'International Student' || 
                            studentType === 'Adult Student' || 
                            studentType === 'Parent Verification';
  
  const autocompletionRequest = isUnrestrictedType
    ? {
        // No restrictions for international students, adult students, and parent verification
      } 
    : {
        // Restrict to Canada for other student types
        componentRestrictions: { country: 'ca' }
      };

  const searchPlaceholder = isUnrestrictedType
    ? 'Search for your address'
    : 'Search for your address in Canada';

  return (
    <div className="space-y-4">
      {!isManualEntry ? (
        // Autocomplete Mode
        <>
          <div className="relative">
            <GooglePlacesAutocomplete
              apiKey="AIzaSyCrZ6Nh909XAiAksbBp52wh0lsG9jYFYRA"
              selectProps={{
                value: selectedPlace ? { 
                  label: selectedPlace.fullAddress, 
                  value: { place_id: selectedPlace.placeId } 
                } : null,
                onChange: handleSelect,
                placeholder: placeholder || searchPlaceholder,
                classNames: {
                  control: () => 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  menu: () => 'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                  option: () => 'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent'
                },
                components: {
                  DropdownIndicator: () => null,
                  IndicatorSeparator: () => null
                }
              }}
              autocompletionRequest={autocompletionRequest}
            />
            {selectedPlace && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-auto py-1 px-1.5"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {!selectedPlace && (
            <div className="text-center">
              <button
                type="button"
                onClick={toggleToManualEntry}
                className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center justify-center space-x-1"
              >
                <Edit3 className="w-4 h-4" />
                <span>Can't find your address? Enter manually</span>
              </button>
            </div>
          )}
        </>
      ) : (
        // Manual Entry Mode
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Manual Address Entry</h4>
                <p className="text-xs text-blue-700 mt-1">
                  Enter your address information below. This is helpful for rural addresses or locations not found in our search.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Country Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <select
                value={manualAddressData.country}
                onChange={(e) => handleManualInputChange('country', e.target.value)}
                className="w-full border border-input rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-sm"
              >
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Province Selection - Only for Canadian addresses */}
            {manualAddressData.country === 'CA' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province *
                </label>
                <select
                  value={manualAddressData.province}
                  onChange={(e) => handleManualInputChange('province', e.target.value)}
                  className="w-full border border-input rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-sm"
                >
                  <option value="">Select Province</option>
                  {canadianProvinces.map(province => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* No state/province field for Other countries - users will include this in their address */}

            {/* City/Town - Only for Canadian addresses */}
            {manualAddressData.country === 'CA' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City/Town *
                </label>
                <input
                  type="text"
                  value={manualAddressData.city}
                  onChange={(e) => handleManualInputChange('city', e.target.value)}
                  placeholder="Enter the city or town closest to you"
                  className="w-full border border-input rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-sm"
                />
              </div>
            )}

            {/* Address Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="urban"
                    checked={manualAddressData.addressType === 'urban'}
                    onChange={(e) => handleManualInputChange('addressType', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Urban</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="rural"
                    checked={manualAddressData.addressType === 'rural'}
                    onChange={(e) => handleManualInputChange('addressType', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Rural</span>
                </label>
              </div>
            </div>

            {/* Address Text Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {manualAddressData.country === 'CA' ? 'Your Address *' : 'Complete Address (including city, state/province) *'}
              </label>
              <textarea
                value={manualAddressData.address}
                onChange={(e) => handleManualInputChange('address', e.target.value)}
                rows={manualAddressData.country === 'CA' ? 3 : 4}
                placeholder={
                  manualAddressData.country === 'CA' ? (
                    manualAddressData.addressType === 'rural' ? 
                    "Example: Box 247, RR#3, Legal Land Description SW-25-24-1-W5" :
                    "Example: 123 Main Street, Unit 4B"
                  ) : (
                    "Example: 123 Main Street, Unit 4B\nNew York, NY 10001\nUnited States"
                  )
                }
                className="w-full border border-input rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {manualAddressData.country === 'CA' 
                  ? 'Enter your complete address as you would write it on mail or packages.'
                  : 'Please include the full address including street, city, state/province, postal code, and country.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={handleManualSubmit}
                className="flex-1"
              >
                Use This Address
              </Button>
              <Button
                variant="outline"
                onClick={toggleToAutocomplete}
                className="flex-1"
              >
                Back to Search
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Error Display */}
      {(error || internalError) && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-sm text-red-700">
            {error || internalError}
          </AlertDescription>
        </Alert>
      )}

      {/* Selected Address Display */}
      {selectedPlace && (
        <div className="rounded-md border border-input bg-muted p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-medium text-sm">Selected Address</h4>
              <p className="text-sm text-muted-foreground">{selectedPlace.fullAddress}</p>
              {selectedPlace.isManualEntry && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 mt-2">
                  <Edit3 className="w-3 h-3 mr-1" />
                  Manual Entry
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {selectedPlace.streetAddress && (
              <div>
                <h5 className="text-xs font-medium text-gray-500">Street</h5>
                <p className="text-sm">{selectedPlace.streetAddress}</p>
              </div>
            )}
            <div>
              <h5 className="text-xs font-medium text-gray-500">City</h5>
              <p className="text-sm">{selectedPlace.city || 'Not specified'}</p>
            </div>
            <div>
              <h5 className="text-xs font-medium text-gray-500">Province/State</h5>
              <p className="text-sm">{selectedPlace.province || 'Not specified'}</p>
            </div>
            {selectedPlace.postalCode && (
              <div>
                <h5 className="text-xs font-medium text-gray-500">Postal/ZIP Code</h5>
                <p className="text-sm">{selectedPlace.postalCode}</p>
              </div>
            )}
            {selectedPlace.country && (
              <div>
                <h5 className="text-xs font-medium text-gray-500">Country</h5>
                <p className="text-sm">{selectedPlace.countryLong || selectedPlace.country}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressPicker;