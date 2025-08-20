import React, { useState } from 'react';
import GooglePlacesAutocomplete, { geocodeByPlaceId } from 'react-google-places-autocomplete';
import { Button } from "./ui/button";
import { X } from "lucide-react";

const HomeSchoolSelector = ({ onAddressSelect, initialValue }) => {
  const [selectedPlace, setSelectedPlace] = useState(initialValue);

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
  };

  return (
    <div className="space-y-4">
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

      {selectedPlace && (
        <div className="rounded-md border border-input bg-muted p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-sm">Selected Home Education Provider</h4>
              <p className="text-sm text-muted-foreground">{selectedPlace.name}</p>
            </div>
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