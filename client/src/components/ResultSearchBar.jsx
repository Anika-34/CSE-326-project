import React from 'react';
import { MapPin, Calendar, User, Search, X } from 'lucide-react';
import '../styles/ResultSearchBar.css';

const ResultSearchBar = ({ searchData }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };
    const { location, checkIn, checkOut, guests, nights } = searchData;
    const formattedCheckIn = formatDate(checkIn);
    const formattedCheckOut = formatDate(checkOut);
    return (
        <div className="search-bar-container">

            <div className="search-section location">
                <MapPin size={20} className="icon-blue" />
                <span className="search-text">{location}</span>
                <X size={16} className="clear-icon" />
            </div>

            <div className="v-divider"></div>


            <div className="search-section dates">
                <Calendar size={20} />
                <div className="date-wrapper">
                    <span className="date-text">{formattedCheckIn}</span>
                    <span className="date-separator">—</span>
                    <span className="date-text">{formattedCheckOut}</span>
                </div>
                <span className="nights-badge">{nights} night</span>
            </div>

            <div className="v-divider"></div>

            <div className="search-section guests">
                <User size={20} />
                <span className="search-text">{guests}</span>
            </div>


            <button className="search-button">
                <Search size={20} />
                <span>Search</span>
            </button>
        </div>
    );
};

export default ResultSearchBar;