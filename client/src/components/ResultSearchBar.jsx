import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, User, Search, X, Plus, Minus } from 'lucide-react';
import '../styles/ResultSearchBar.css';

const ResultSearchBar = ({ searchData }) => {
    const [showGuestPopup, setShowGuestPopup] = useState(false);
    const [locationInput, setLocationInput] = useState(searchData.location || '');


    const [counts, setCounts] = useState({
        rooms: 1,
        adults: 2,
        children: 0
    });
    
    const popupRef = useRef(null);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowGuestPopup(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const updateCount = (field, delta) => {
        setCounts(prev => ({
            ...prev,
            [field]: Math.max(field === 'children' ? 0 : 1, prev[field] + delta)
        }));
    };

    useEffect(() => {
        setLocationInput(searchData.location);
        setCounts({
            rooms: searchData.room,
            adults: searchData.adults,
            children: searchData.children
        });
    }, [searchData]);

    const handleUpdateSearch = () => {
        const params = new URLSearchParams(); // Fresh params
        params.set('location', locationInput);
        params.set('checkIn', searchData.checkIn);
        params.set('checkOut', searchData.checkOut);
        params.set('rooms', String(counts.rooms));
        params.set('adults', String(counts.adults));
        params.set('children', String(counts.children));

        // Use window.location.search to trigger a re-render of HotelList
        window.location.search = params.toString();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
        }).format(date);
    };

    const { location, checkIn, checkOut, nights } = searchData;
    const guestText = `${counts.rooms} room, ${counts.adults} adults, ${counts.children} children`;

    return (
        <div className="search-bar-container">
            {/* Location Section */}
            {/* <div className="search-section location">
                <MapPin size={20} className="icon-blue" />
                <span className="search-text">{location}</span>
                <X size={16} className="clear-icon" />
            </div> */}
            <div className="search-section location">
                <MapPin size={20} className="icon-blue" />
                <input 
                    type="text"
                    className="search-input"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="Where are you going?"
                    style={{
                        border:0,
                        outline: 'none',
                    }}
                />
                {locationInput && (
                    <X 
                        size={16} 
                        className="clear-icon" 
                        onClick={() => setLocationInput('')} 
                        style={{ cursor: 'pointer' }}
                    />
                )}
            </div>

            <div className="v-divider"></div>

            {/* Dates Section */}
            <div className="search-section dates">
                <Calendar size={20} />
                <div className="date-wrapper">
                    <span className="date-text">{formatDate(checkIn)}</span>
                    <span className="date-separator">—</span>
                    <span className="date-text">{formatDate(checkOut)}</span>
                </div>
                <span className="nights-badge">{nights} night</span>
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
                <Search size={20} />
                <span>Search</span>
            </button>
        </div>
    );
};

// Reusable Counter Component
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