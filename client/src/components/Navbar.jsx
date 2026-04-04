import React from 'react';
import '../styles/Navbar.css';
import { useNavigate } from 'react-router-dom';
import { AUTH_TOKEN_KEY, USER_ID_KEY, clearBrowserAuthState } from '../services/authStorage';

const Navbar = () => {
    const navigate = useNavigate();
    const isLoggedIn = Boolean(localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(USER_ID_KEY));
    const gotoHome = () => {
        navigate('/');
    }

    const handleAvatarClick = () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        clearBrowserAuthState();
        navigate('/login');
    };
    return (
        <nav className="navbar">
            <div className="nav-left">
                {/* <button className="hamburger" onClick={toggleSidebar}>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                </button> */}
                {/* <img
                    src="/assets/logo.png"
                    alt="Trip.com"
                    className="logo"
                    onClick={() => window.location.href = '/hotels/search'}
                    style={{ cursor: 'pointer' }}
                /> */}
                <div onClick={() => gotoHome()}
                    style={{
                        fontFamily: "TripFont",
                        fontSize: '30px',
                        color: '#2f5ef6',
                    }}
                >
                    Trip<span style={{
                        color: '#e2c20e',
                    }}>.</span>
                    com
                </div>
                {/* <div className="search-container">
                    <input type="text" placeholder="Destination, attraction, hotel, etc" />
                    <button className="search-btn">
                        <Search size={18} color="white" />
                    </button>
                </div> */}
            </div>

            <div className="nav-right">
                {/* <div className="nav-item">List Your Property</div> */}
                {/* <div className="nav-item"><Globe size={18} /> | USD</div> */}
                {/* <div className="nav-item">Customer Support</div> */}
                <div className="nav-item" onClick={() => navigate('/bookings')}>My Bookings</div>
                {/* <div className="user-profile" onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
                    <div className="avatar">
                        <User size={20} />
                    </div>
                </div> */}
               <div
                    className="nav-item signin-btn"
                    onClick={handleAvatarClick}
                    style={{ cursor: 'pointer' 
                        
                    }}
                >
                {
                    isLoggedIn ? (
                        <button className="btn-logout" onClick={handleAvatarClick}>
                            Sign Out
                        </button>
                    ) : (
                        <button className="btn-login" onClick={handleAvatarClick}>  
                            Sign In
                        </button>
                    )
               }
                </div>


            </div>
        </nav>
    );
};

export default Navbar;