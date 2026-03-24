import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom" 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// import Navbar from './components/Navbar';
import HotelList from './components/HotelList'; 
import CheckAvailability from './components/CheckAvailability';
import PaymentPage from './components/PaymentPage';  
import BookingPage from './components/BookingPage';
import SignIn from './components/SignIn';
import HomePage from './components/HomePage';

const App = () => {
    return <div className = "app-wrapper">
        <Router>
            <Routes>
                <Route path="/" element={<HomePage/>} />
                <Route path="/hotels/search" element={<HotelList />} />
                <Route path="/hotels/details/:hotel_id" element={<CheckAvailability />} />
                <Route path="/bookings/new" element={<BookingPage />} />
                <Route path="/payment" element={<PaymentPage />} /> 
                <Route path="/login" element={<SignIn />} /> 
            </Routes>
        </Router>
    </div>;
};

export default App;
