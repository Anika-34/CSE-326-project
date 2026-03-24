import React, { useState, useRef, useEffect, Fragment } from 'react';
import { MapPin, Calendar, User, Search, RefreshCw, X, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/ResultSearchBar.css';

const SEARCH_STATE_KEY = 'trip.searchState';

const getStoredSearchState = () => {
    try {
        const raw = localStorage.getItem(SEARCH_STATE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const ResultSearchBar = ({ searchData }) => {
    const navigate = useNavigate();
    const [showGuestPopup, setShowGuestPopup] = useState(false);
    const [showDatePopup, setShowDatePopup] = useState(false);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const [isLocationFocused, setIsLocationFocused] = useState(false);
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [locationInput, setLocationInput] = useState(() => {
        const stored = getStoredSearchState();
        return searchData?.location || stored?.location || '';
    });

    const [selectedCheckIn, setSelectedCheckIn] = useState(() => {
        const stored = getStoredSearchState();
        return searchData?.checkIn || stored?.checkIn || new Date().toISOString().split('T')[0];
    });

    const [selectedCheckOut, setSelectedCheckOut] = useState(() => {
        const stored = getStoredSearchState();
        return searchData?.checkOut || stored?.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    });

    const [counts, setCounts] = useState(() => {
        const stored = getStoredSearchState();
        return {
            rooms: Number(searchData?.room ?? stored?.room ?? 1),
            adults: Number(searchData?.adults ?? stored?.adults ?? 2),
            children: Number(searchData?.children ?? stored?.children ?? 0)
        };
    });
    
    const popupRef = useRef(null);
    const dateRef = useRef(null);
    const locationRef = useRef(null);
    const suppressNextSuggestionOpenRef = useRef(false);
    const apiBaseUrl = process.env.REACT_APP_API_URL || '';

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowGuestPopup(false);
            }
            if (dateRef.current && !dateRef.current.contains(event.target)) {
                setShowDatePopup(false);
            }
            if (locationRef.current && !locationRef.current.contains(event.target)) {
                setIsLocationFocused(false);
                setShowLocationSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const query = locationInput.trim();
        if (!query) {
            setLocationSuggestions([]);
            setShowLocationSuggestions(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const res = await fetch(
                    `${apiBaseUrl}/v1/hotels/location-suggestions?query=${encodeURIComponent(query)}`
                );
                if (!res.ok) {
                    setLocationSuggestions([]);
                    setShowLocationSuggestions(false);
                    return;
                }
                const data = await res.json();
                const suggestions = Array.isArray(data) ? data : [];
                setLocationSuggestions(suggestions);
                if (suppressNextSuggestionOpenRef.current) {
                    suppressNextSuggestionOpenRef.current = false;
                    setShowLocationSuggestions(false);
                } else if (isLocationFocused) {
                    setShowLocationSuggestions(suggestions.length > 0);
                } else {
                    setShowLocationSuggestions(false);
                }
            } catch {
                setLocationSuggestions([]);
                setShowLocationSuggestions(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [locationInput, apiBaseUrl, isLocationFocused]);

    const updateCount = (field, delta) => {
        setCounts(prev => ({
            ...prev,
            [field]: Math.max(field === 'children' ? 0 : 1, prev[field] + delta)
        }));
    };

    useEffect(() => {
        const stored = getStoredSearchState();
        setLocationInput(searchData?.location || stored?.location || '');
        setCounts({
            rooms: Number(searchData?.room ?? stored?.room ?? 1),
            adults: Number(searchData?.adults ?? stored?.adults ?? 2),
            children: Number(searchData?.children ?? stored?.children ?? 0)
        });
    }, [searchData]);

    const resolvedCheckIn = selectedCheckIn;
    const resolvedCheckOut = selectedCheckOut;
    const resolvedNights = Math.max(1, Math.ceil((new Date(resolvedCheckOut) - new Date(resolvedCheckIn)) / (1000 * 60 * 60 * 24)));

    const handleUpdateSearch = () => {
        const params = new URLSearchParams(); // Fresh params
        params.set('location', locationInput);
        params.set('checkIn', resolvedCheckIn);
        params.set('checkOut', resolvedCheckOut);
        params.set('rooms', String(counts.rooms));
        params.set('adults', String(counts.adults));
        params.set('children', String(counts.children));

        localStorage.setItem(
            SEARCH_STATE_KEY,
            JSON.stringify({
                location: locationInput,
                checkIn: resolvedCheckIn,
                checkOut: resolvedCheckOut,
                nights: resolvedNights,
                room: counts.rooms,
                adults: counts.adults,
                children: counts.children
            })
        );
        
        navigate(`/hotels/search?${params.toString()}`);
    };

    const handleSelectLocation = (selectedLocation) => {
        suppressNextSuggestionOpenRef.current = true;
        setLocationInput(selectedLocation);
        setIsLocationFocused(false);
        setShowLocationSuggestions(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
        }).format(date);
    };

    const guestText = `${counts.rooms} room, ${counts.adults} adults, ${counts.children} children`;
    const isSearchUpdated =
        locationInput.trim() !== String(searchData?.location || '').trim() ||
        resolvedCheckIn !== String(searchData?.checkIn || '') ||
        resolvedCheckOut !== String(searchData?.checkOut || '') ||
        counts.rooms !== Number(searchData?.room ?? 1) ||
        counts.adults !== Number(searchData?.adults ?? 2) ||
        counts.children !== Number(searchData?.children ?? 0);

    return <Fragment>
        <div className="search-bar-container">
            <div className="search-section location" ref={locationRef}>
                <MapPin size={20} className="icon-blue" />
                <input 
                    type="text"
                    className="search-input"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onFocus={() => {
                        setIsLocationFocused(true);
                        if (locationSuggestions.length > 0) {
                            setShowLocationSuggestions(true);
                        }
                    }}
                    placeholder={locationInput ? '' : 'Where are you going?'}
                    style={{
                        border:0,
                        outline: 'none',
                    }}
                />
                {locationInput && (
                    <X 
                        size={16} 
                        className="clear-icon" 
                        onClick={() => {
                            setLocationInput('');
                            setLocationSuggestions([]);
                            setShowLocationSuggestions(false);
                        }} 
                        style={{ cursor: 'pointer' }}
                    />
                )}
                {showLocationSuggestions && (
                    <div className="location-suggestions-dropdown">
                        {locationSuggestions.map((item, index) => (
                            <div
                                key={`${item}-${index}`}
                                className="location-suggestion-item"
                                onClick={() => handleSelectLocation(item)}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="v-divider"></div>

            {/* Dates Section */}
            <div className="search-section dates" ref={dateRef}>
                <Calendar size={20} />
                <div className="date-wrapper" onClick={() => setShowDatePopup(!showDatePopup)} style={{ cursor: 'pointer' }}>
                    <span className="date-text">{formatDate(resolvedCheckIn)}</span>
                    <span className="date-separator">—</span>
                    <span className="date-text">{formatDate(resolvedCheckOut)}</span>
                </div>
                <span className="nights-badge">{resolvedNights} night</span>
                
                {showDatePopup && (
                    <DatePickerPopup
                        checkIn={resolvedCheckIn}
                        checkOut={resolvedCheckOut}
                        onCheckInChange={setSelectedCheckIn}
                        onCheckOutChange={setSelectedCheckOut}
                        onClose={() => setShowDatePopup(false)}
                    />
                )}
            </div>

            <div className="v-divider"></div>

            {/* Guests Section with Popup */}
            <div className="search-section guests-wrapper" ref={popupRef}>
                <div className="guests-trigger" onClick={() => setShowGuestPopup(!showGuestPopup)}>
                    <User size={20} />
                    <span className="search-text">{guestText}</span>
                </div>

                {showGuestPopup && (
                    <div className="guest-popup">
                        <CounterRow 
                            label="Rooms" 
                            count={counts.rooms} 
                            onUpdate={(d) => updateCount('rooms', d)} 
                        />
                        <CounterRow 
                            label="Adults" 
                            sublabel="18+ yrs" 
                            count={counts.adults} 
                            onUpdate={(d) => updateCount('adults', d)} 
                        />
                        <CounterRow 
                            label="Children" 
                            sublabel="0-17 yrs" 
                            count={counts.children} 
                            onUpdate={(d) => updateCount('children', d)} 
                        />
                        <button className="done-btn" onClick={() => handleUpdateSearch()}>
                            Done
                        </button>
                    </div>
                )}
            </div>

            <button className="search-button"
                onClick={handleUpdateSearch}>
                {isSearchUpdated ? <RefreshCw size={20} /> : <Search size={20} />}
                <span>{isSearchUpdated ? 'Update' : 'Search'}</span>
            </button>
        </div>
    </Fragment>
};

// Date Picker Popup Component
const DatePickerPopup = ({ checkIn, checkOut, onCheckInChange, onCheckOutChange, onClose }) => {
    const getMinCheckOut = () => {
        const minDate = new Date(checkIn);
        minDate.setDate(minDate.getDate() + 1);
        return minDate.toISOString().split('T')[0];
    };

    return (
        <div className="date-picker-popup">
            <div className="date-picker-content">
                <h3>Select Dates</h3>
                <div className="date-inputs">
                    <div className="date-input-group">
                        <label>Check-in</label>
                        <input
                            type="date"
                            value={checkIn}
                            onChange={(e) => {
                                onCheckInChange(e.target.value);
                                if (new Date(e.target.value) >= new Date(checkOut)) {
                                    const nextDay = new Date(e.target.value);
                                    nextDay.setDate(nextDay.getDate() + 1);
                                    onCheckOutChange(nextDay.toISOString().split('T')[0]);
                                }
                            }}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <div className="date-input-group">
                        <label>Check-out</label>
                        <input
                            type="date"
                            value={checkOut}
                            onChange={(e) => onCheckOutChange(e.target.value)}
                            min={getMinCheckOut()}
                        />
                    </div>
                </div>
                <button className="date-done-btn" onClick={onClose}>
                    Done
                </button>
            </div>
        </div>
    );
};


const CounterRow = ({ label, sublabel, count, onUpdate }) => (
    <div className="counter-row">
        <div className="counter-label-group">
            <span className="counter-main-label">{label}</span>
            {sublabel && <span className="counter-sub-label">{sublabel}</span>}
        </div>
        <div className="counter-controls">
            <button className="control-btn" onClick={() => onUpdate(-1)} disabled={count <= (label === 'Children' ? 0 : 1)}>
                <Minus size={18} />
            </button>
            <span className="count-display">{count}</span>
            <button className="control-btn" onClick={() => onUpdate(1)}>
                <Plus size={18} />
            </button>
        </div>
    </div>
);

export default ResultSearchBar;