/// <reference types="vite/client" />
import React, { useState, useRef, useCallback } from "react";
import { AutoComplete, Input } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import debounce from "lodash/debounce";

interface AddressSearchProps {
  onSelect?: (address: string, placeId?: string) => void;
  placeholder?: string;
  value?: string; // Add value prop
}

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const AddressSearch: React.FC<AddressSearchProps> = ({
  onSelect,
  placeholder = "Search address...",
  value,
}) => {
  const [options, setOptions] = useState<{ value: string; placeId: string }[]>(
    []
  );
  const [fetching, setFetching] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const autocompleteServiceRef = useRef<any>(null);

  React.useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();
    }
  }, []);

  // Keep inputValue in sync with value prop
  React.useEffect(() => {
    if (typeof value === "string" && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  const fetchPredictions = useCallback((val: string) => {
    if (!val || !autocompleteServiceRef.current) {
      setOptions([]);
      setFetching(false);
      return;
    }
    setFetching(true);
    autocompleteServiceRef.current.getPlacePredictions(
      { input: val },
      (predictions: any[] | null) => {
        if (!predictions) {
          setOptions([]);
          setFetching(false);
          return;
        }
        setOptions(
          predictions.map((prediction) => ({
            value: prediction.description,
            placeId: prediction.place_id,
          }))
        );
        setFetching(false);
      }
    );
  }, []);

  // Use lodash debounce
  const debouncedFetchPredictions = useRef(
    debounce(fetchPredictions, 300)
  ).current;

  const handleSearch = (val: string) => {
    if (typeof value !== "string") {
      setInputValue(val);
    }
    setFetching(true);
    debouncedFetchPredictions(val);
  };

  const handleSelect = (val: string, option: any) => {
    if (typeof value !== "string") {
      setInputValue(val);
    }
    if (onSelect) {
      onSelect(val, option.placeId);
    }
  };

  const handleChange = (val: string) => {
    if (typeof value !== "string") {
      setInputValue(val);
    }
  };

  return (
    <AutoComplete
      options={options.map((opt) => ({
        value: opt.value,
        placeId: opt.placeId,
        label: (
          <span>
            <EnvironmentOutlined style={{ color: "#4285F4", marginRight: 8 }} />
            {opt.value}
          </span>
        ),
      }))}
      onSearch={handleSearch}
      onSelect={handleSelect}
      style={{ width: "100%" }}
      notFoundContent={fetching ? "Loading..." : null}
      disabled={
        !(window.google && window.google.maps && window.google.maps.places)
      }
      value={typeof value === "string" ? value : inputValue}
      onChange={handleChange}
    >
      <Input
        placeholder={placeholder}
        prefix={<EnvironmentOutlined style={{ color: "#4285F4" }} />}
      />
    </AutoComplete>
  );
};

// Add this for TypeScript to recognize window.google
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    google: any;
  }
}

export default AddressSearch;
