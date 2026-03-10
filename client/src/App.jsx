import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom" 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Navbar from './components/Navbar';
import HotelList from './components/HotelList'; 
import CheckAvailability from './components/CheckAvailability';

const App = () => {
    return <div className = "container">
        <Navbar />
        <Router>
            <Routes>
                <Route path="/hotels/search" element={<HotelList />} />
                <Route path="/hotels/details/:hotel_id" element={<CheckAvailability />} />
            </Routes>
        </Router>
    </div>;
};

export default App;