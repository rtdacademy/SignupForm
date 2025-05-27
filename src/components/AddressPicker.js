import React, { useState } from 'react';
import GooglePlacesAutocomplete, { geocodeByPlaceId, getLatLng } from 'react-google-places-autocomplete';
import { Button } from "./ui/button";
import { X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

const AddressPicker = ({ onAddressSelect, studentType }) => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [error, setError] = useState(null);

  const handleSelect = async (selection) => {
    try {
      setError(null);
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
          setError('Please select an address within Alberta. The selected address is in ' + province + '.');
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
      setError('Failed to fetch address details. Please try again.');
    }
  };

  const handleClear = () => {
    setSelectedPlace(null);
    onAddressSelect(null);
    setError(null);
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

  const placeholder = isUnrestrictedType
    ? 'Search for your address'
    : 'Search for your address in Canada';

  return (
    <div className="space-y-4">
      <div className="relative">
        <GooglePlacesAutocomplete
          apiKey="AIzaSyCrZ6Nh909XAiAksbBp52wh0lsG9jYFYRA"
          selectProps={{
            value: selectedPlace ? { 
              label: selectedPlace.fullAddress, 
              value: { place_id: selectedPlace.placeId } 
            } : null,
            onChange: handleSelect,
            placeholder: placeholder,
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

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-sm text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {selectedPlace && (
        <div className="rounded-md border border-input bg-muted p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-sm">Selected Address</h4>
              <p className="text-sm text-muted-foreground">{selectedPlace.fullAddress}</p>
            </div>
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