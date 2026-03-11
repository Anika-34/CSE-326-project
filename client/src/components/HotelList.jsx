import React, { useEffect, useState } from 'react'
import { Fragment } from 'react';
import HotelCard from './HotelCard';
import "../components/ResultSearchBar"
import ResultSearchBar from '../components/ResultSearchBar';

// TODO
// dummy data passed for now, pore useparam diye kprte hoobe


const HotelList = ({ location = "New York", checkInDate = "2026-02-15", checkOutDate = "2026-02-18", room = 1, adults = 0, children = 1 }) => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const baseUrl = process.env.REACT_APP_API_URL || '';
    const roomText = room + (room > 1 ? " rooms, " : " room, ") + adults + (adults === 1 ? adults + " adult, " : " adult, ") + (children > 1 ? children + " children" : children === 1 ? "1 child" : "");

    const searchData = {
        location: location,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: roomText,
        nights: 1
    };

    const getHotels = async () => {
        try {
            const response = await fetch(
                `${baseUrl}/v1/hotels/search?location=${encodeURIComponent(location)}&check_in_date=${encodeURIComponent(checkInDate)}&check_out_date=${encodeURIComponent(checkOutDate)}`
            );

            const contentType = response.headers.get('content-type') || '';
            const body = contentType.includes('application/json')
                ? await response.json()
                : await response.text();

            if (!response.ok) {
                throw new Error(
                    typeof body === 'string' ? body : body?.error || `HTTP ${response.status}`
                );
            }

            setHotels(body);
        } catch (err) {
            console.error('getHotels error:', err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getHotels();
    }, []);

    if (loading) return <div className="loader">Searching for best deals...</div>;

    return <Fragment>
        <div className="container-fluid px-4">
            
                <ResultSearchBar searchData={searchData} />
            
        
        <div className="hotel-list-container">
            {hotels.length > 0 ? (
                hotels.map(hotel => (
                    <HotelCard key={hotel.hotel_id} hotel={hotel} />
                ))
            ) : (
                <p>No hotels found for your destination.</p>
            )}
        </div>
        </div>
    </Fragment>
};

export default HotelList;