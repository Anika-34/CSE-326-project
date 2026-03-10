import React, { useEffect, useState } from 'react'
import { Fragment } from 'react';
import HotelCard from './HotelCard';


const HotelList = ({ location = "New York", checkInDate = "2026-02-15", checkOutDate = "2026-02-18", room, adults, children }) => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const baseUrl = process.env.REACT_APP_API_URL || '';

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
        <div className="hotel-list-container">
            {hotels.length > 0 ? (
                hotels.map(hotel => (
                    <HotelCard key={hotel.hotel_id} hotel={hotel} />
                ))
            ) : (
                <p>No hotels found for your destination.</p>
            )}
        </div>
    </Fragment>
};

export default HotelList;