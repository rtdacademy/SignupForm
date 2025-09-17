import React, { useState, useEffect } from 'react';
import GooglePlacesAutocomplete, { geocodeByPlaceId } from 'react-google-places-autocomplete';
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { X, ExternalLink } from "lucide-react";

const HomeSchoolSelector = ({ onAddressSelect, initialValue }) => {
  const [selectedPlace, setSelectedPlace] = useState(initialValue);
  const [isRTDConnect, setIsRTDConnect] = useState(false);

  // RTD Connect pre-filled details
  const RTD_CONNECT_DETAILS = {
    name: 'RTD Connect',
    streetAddress: 'RTD Connect Home Education Program',
    city: 'Alberta',
    province: 'AB',
    placeId: 'rtd-connect-direct',
    fullAddress: 'RTD Connect Home Education Program, Alberta, AB',
    location: {
      lat: null,
      lng: null
    }
  };

  // Check if initial value is RTD Connect
  useEffect(() => {
    if (initialValue?.placeId === 'rtd-connect-direct') {
      setIsRTDConnect(true);
      setSelectedPlace(RTD_CONNECT_DETAILS);
    }
  }, [initialValue]);

  const handleRTDConnectChange = (checked) => {
    setIsRTDConnect(checked);
    if (checked) {
      setSelectedPlace(RTD_CONNECT_DETAILS);
      onAddressSelect(RTD_CONNECT_DETAILS);
    } else {
      setSelectedPlace(null);
      onAddressSelect(null);
    }
  };

  const handleSelect = async (selection) => {
    try {
      const results = await geocodeByPlaceId(selection.value.place_id);
      if (results?.[0]) {
        const place = results[0];
        
        // Format the address details
        const addressDetails = {
          name: selection.label.split(',')[0], // Get organization name
          streetAddress: place.formatted_address.split(',')[0],
          city: place.formatted_address.split(',')[1]?.trim() || '',
          province: 'AB', // Hardcoded for Alberta
          placeId: selection.value.place_id,
          fullAddress: place.formatted_address,
          location: {
            lat: place.geometry?.location.lat() || null,
            lng: place.geometry?.location.lng() || null
          }
        };
        
        setSelectedPlace(addressDetails);
        onAddressSelect(addressDetails);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  const handleClear = () => {
    setSelectedPlace(null);
    onAddressSelect(null);
    setIsRTDConnect(false);
  };

  return (
    <div className="space-y-4">
      {/* RTD Connect checkbox option */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rtd-connect-checkbox"
          checked={isRTDConnect}
          onCheckedChange={handleRTDConnectChange}
        />
        <label
          htmlFor="rtd-connect-checkbox"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          I am part of RTD Connect
        </label>
      </div>

      {/* Promotional message */}
      <div className="text-sm text-muted-foreground">
        Not part of RTD Connect?
        <a
          href="https://rtd-connect.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
        >
          Learn more about our home education program
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Google Places search - only show if RTD Connect is not selected */}
      {!isRTDConnect && (
        <div className="relative">
          <GooglePlacesAutocomplete
          apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
          selectProps={{
            value: selectedPlace ? { 
              label: selectedPlace.name, 
              value: { place_id: selectedPlace.placeId } 
            } : null,
            defaultInputValue: initialValue?.name || '',
            onChange: handleSelect,
            placeholder: 'Search for your home education provider',
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
            autocompletionRequest={{
              types: ['establishment'], // Allow any establishment type
              componentRestrictions: { country: 'ca' }
            }}
          />
          {selectedPlace && !isRTDConnect && (
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
      )}

      {/* Display selected place (either RTD Connect or Google Places selection) */}
      {selectedPlace && (
        <div className="rounded-md border border-input bg-muted p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-medium text-sm">
                Selected Home Education Provider
                {isRTDConnect && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Direct Selection
                  </span>
                )}
              </h4>
              <p className="text-sm text-muted-foreground">{selectedPlace.name}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-1.5"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <h4 className="font-medium text-sm">Address</h4>
            <p className="text-sm text-muted-foreground">
              {selectedPlace.streetAddress}
              <br />
              {selectedPlace.city}, {selectedPlace.province}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeSchoolSelector;