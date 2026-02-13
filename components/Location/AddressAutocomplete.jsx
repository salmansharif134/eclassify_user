import { getLocationApi } from "@/utils/api";
import { t } from "@/utils";
import React, { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "../ui/input";
import { Card } from "../ui/card"; // using Card for dropdown

const AddressAutocomplete = ({ onAddressSelect, defaultValue, placeholder, className }) => {
    const [search, setSearch] = useState(defaultValue || "");
    const [debouncedSearch] = useDebounce(search, 500);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);
    // Ref to prevent refetching when user selects an item
    const preventFetch = useRef(false);

    useEffect(() => {
        // Sync external defaultValue only if search is empty to avoid overwriting user input
        if (defaultValue && !search) {
            setSearch(defaultValue);
        }
    }, [defaultValue]);

    // Click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (preventFetch.current) {
                preventFetch.current = false;
                return;
            }

            if (debouncedSearch && debouncedSearch.length > 2) {
                setLoading(true);
                try {
                    const response = await getLocationApi.getLocation({
                        search: debouncedSearch,
                        lang: "en",
                    });

                    // Check response structure (free vs paid API)
                    let results = [];

                    if (response?.data?.data?.predictions) {
                        // Paid API (Google Places structure)
                        results = response.data.data.predictions;
                    } else if (Array.isArray(response?.data?.data)) {
                        // Free API or different structure
                        results = response.data.data.map(item => ({
                            description: [
                                item?.area_translation,
                                item?.city_translation,
                                item?.state_translation,
                                item?.country_translation,
                            ].filter(Boolean).join(", "),
                            place_id: item?.id,
                            original: item
                        }));
                    } else if (Array.isArray(response?.data?.data?.data)) {
                        // Another potential structure seen in LocationSelector
                        results = response.data.data.data.map(item => ({
                            description: item.translated_name || item.name,
                            place_id: item.id,
                            original: item
                        }));
                    }

                    setSuggestions(results);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error("Error fetching address suggestions:", error);
                    setSuggestions([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        fetchSuggestions();
    }, [debouncedSearch]);

    const handleSelect = async (suggestion) => {
        preventFetch.current = true;
        setSearch(suggestion.description);
        setShowSuggestions(false);
        setLoading(true);

        try {
            if (suggestion.place_id && !suggestion.original) {
                // Paid API: Fetch details using place_id
                const response = await getLocationApi.getLocation({
                    place_id: suggestion.place_id,
                    lang: "en",
                });

                const result = response?.data?.data?.result; // Google Place Details structure usually has 'result'

                if (result) {
                    const components = result.address_components || [];
                    const getComponent = (type) => components.find(c => c.types.includes(type))?.long_name || "";

                    const streetNum = getComponent("street_number");
                    const route = getComponent("route");
                    const city = getComponent("locality") || getComponent("sublocality_level_1") || getComponent("administrative_area_level_2");
                    const state = getComponent("administrative_area_level_1");
                    const country = getComponent("country");
                    const zip = getComponent("postal_code");

                    const streetAddress = [streetNum, route].filter(Boolean).join(" ");

                    onAddressSelect({
                        street: streetAddress,
                        city,
                        state,
                        country,
                        zip: zip,
                        formatted_address: result.formatted_address,
                        lat: result.geometry?.location?.lat,
                        lng: result.geometry?.location?.lng
                    });
                }
            } else if (suggestion.original) {
                // Free API fallback
                const item = suggestion.original;
                onAddressSelect({
                    city: item.city,
                    state: item.state,
                    country: item.country,
                    formatted_address: suggestion.description,
                    lat: item.latitude,
                    lng: item.longitude
                });
            }
        } catch (error) {
            console.error("Error fetching place details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setSearch(e.target.value);
    }

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <Input
                type="text"
                value={search}
                onChange={handleInputChange}
                placeholder={placeholder || t("enterAddress")}
                autoComplete="off"
                className={className}
            />

            {showSuggestions && suggestions.length > 0 && (
                <Card className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto p-0">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={suggestion.place_id || index}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => handleSelect(suggestion)}
                        >
                            {suggestion.description}
                        </div>
                    ))}
                </Card>
            )}
        </div>
    );
};

export default AddressAutocomplete;
