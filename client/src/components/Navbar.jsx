import React from 'react';
import { Search, Globe, User } from 'lucide-react';
import '../styles/Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="nav-left">
                {/* <button className="hamburger" onClick={toggleSidebar}>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                </button> */}
                <img
                    src="/assets/logo.png"
                    alt="Trip.com"
                    className="logo"
                />
                <div className="search-container">
                    <input type="text" placeholder="Destination, attraction, hotel, etc" />
                    <button className="search-btn">
                        <Search size={18} color="white" />
                    </button>
                </div>
            </div>

            <div className="nav-right">
                {/* <div className="nav-item">List Your Property</div> */}
                {/* <div className="nav-item"><Globe size={18} /> | USD</div> */}
                <div className="nav-item">Customer Support</div>
                <div className="nav-item">My Bookings</div>
                <div className="user-profile">
                    <div className="avatar">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;