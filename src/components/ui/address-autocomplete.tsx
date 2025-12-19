"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

type AddressFeature = {
  properties: {
    label: string;
    name: string;
    city: string;
    postcode: string;
    context: string;
  };
  geometry: {
    coordinates: [number, number];
  };
};

type AddressAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (data: {
    address: string;
    city: string;
    postcode: string;
    coordinates: [number, number];
  }) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  onBlur?: () => void;
};

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "12 rue de la Salle, 75004 Paris",
  disabled = false,
  id,
  name,
  required,
  onBlur,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressFeature[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`,
      );
      const data = await response.json();
      setSuggestions(data.features || []);
      setIsOpen(true);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(newValue);
    }, 300);
  };

  const handleSelectAddress = (feature: AddressFeature) => {
    const { label, name: addressName, city, postcode } = feature.properties;
    const [lng, lat] = feature.geometry.coordinates;

    onChange(label);
    setIsOpen(false);
    setSuggestions([]);

    if (onAddressSelect) {
      onAddressSelect({
        address: addressName,
        city,
        postcode,
        coordinates: [lat, lng],
      });
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        data-form-type="other"
        className="bg-background"
      />

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-white bg-gray-100 shadow-lg">
          <ul className="max-h-60 overflow-y-auto p-1">
            {suggestions.map((feature, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="relative flex w-full cursor-pointer items-start gap-2 rounded-sm px-3 py-2.5 text-left text-sm transition-colors outline-none select-none hover:bg-gray-100"
                  onClick={() => handleSelectAddress(feature)}
                >
                  <div className="flex-1 space-y-0.5">
                    <div className="leading-none font-medium text-gray-900">
                      {feature.properties.label}
                    </div>
                    <div className="text-xs leading-none text-gray-500">
                      {feature.properties.context}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isLoading && (
        <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />
        </div>
      )}
    </div>
  );
}
