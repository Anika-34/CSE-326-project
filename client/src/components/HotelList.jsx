import React, { useEffect, useState } from 'react'
import { Fragment } from 'react';
import HotelCard from './HotelCard';
import "../components/ResultSearchBar"
import ResultSearchBar from '../components/ResultSearchBar';
import Navbar from './Navbar';
import { useSearchParams } from 'react-router-dom';

// TODO
// dummy data passed for now, pore useparam diye kprte hoobe
// query te room, adults, children egula pass kori nai


const HotelList = () => {
    const [searchParams] = useSearchParams();
    console.log('Search params:', Object.fromEntries(searchParams.entries()));
    const location = searchParams.get('location') || "Where are you going?";
    const checkInDate = searchParams.get('checkIn') || 
    new Date().toISOString().split('T')[0]
    const checkOutDate = searchParams.get('checkOut') || new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const room = parseInt(searchParams.get('rooms')) || 1;
    const adults = parseInt(searchParams.get('adults')) || 2;
    const children = parseInt(searchParams.get('children')) || 0;
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const baseUrl = process.env.REACT_APP_API_URL || '';
    const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
    // const roomText = room + (room > 1 ? " rooms, " : " room, ") + adults + (adults === 1 ? adults + " adult, " : " adult, ") + (children > 1 ? children + " children" : children === 1 ? "1 child" : "");

    const searchData = {
        location: location,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        // guests: roomText,
        nights: nights,
        room,
        adults,
        children
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
            console.log('API response:', body);
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
        <Navbar />
        <div className="container-fluid px-4"
        style={{ alignItems: 'center', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}
        >
            <ResultSearchBar searchData={searchData} />


            <div className="hotel-list-container"
                >
                {hotels.length > 0 ? (
                    hotels.map(hotel => (
                        <HotelCard
                            key={hotel.hotel_id}
                            hotel={hotel}
                            
                            searchDetails={{
                                checkInDate,
                                checkOutDate,
                                nights,
                                room,
                                adults,
                                children
                            }}
                        />
                    ))
                ) : (
                    <p>No hotels found for your destination.</p>
                )}
            </div>
        </div>
    </Fragment>
};

export default HotelList;