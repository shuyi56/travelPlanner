/// <reference types="vite/client" />
import React, { useState, useRef, useCallback } from "react";
import { AutoComplete, Input } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import debounce from "lodash/debounce";

interface AddressSearchProps {
  onSelect?: (address: string, placeId?: string) => void;
  placeholder?: string;
}

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const AddressSearch: React.FC<AddressSearchProps> = ({
  onSelect,
  placeholder = "Search address...",
}) => {
  const [options, setOptions] = useState<{ value: string; placeId: string }[]>(
    []
  );
  const [fetching, setFetching] = useState(false);
  const autocompleteServiceRef = useRef<any>(null);

  React.useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();
    }
  }, []);

  const fetchPredictions = useCallback((value: string) => {
    if (!value || !autocompleteServiceRef.current) {
      setOptions([]);
      setFetching(false);
      return;
    }
    setFetching(true);
    autocompleteServiceRef.current.getPlacePredictions(
      { input: value },
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

  const handleSearch = (value: string) => {
    setFetching(true);
    debouncedFetchPredictions(value);
  };

  const handleSelect = (value: string, option: any) => {
    if (onSelect) {
      onSelect(value, option.placeId);
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
    >
      <Input
        placeholder={placeholder}
        prefix={<EnvironmentOutlined style={{ color: "#4285F4" }} />}
      />
    </AutoComplete>
  );
};

export default AddressSearch;
