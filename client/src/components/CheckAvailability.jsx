import React from 'react'
import { Fragment } from 'react'
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';


const CheckAvailability = () => {
    const { hotel_id } = useParams();
    const apiBaseUrl = process.env.REACT_APP_API_URL || '';
    const getAvailability = async (hotel_id) => {
        try {
            const response = await fetch(`${apiBaseUrl}/v1/hotels/details/${hotel_id}`);
            const data = await response.json();
            console.log(data);
        } catch (err) {
            console.error(err.message);
        }
    }
    useEffect(() => {
        getAvailability(hotel_id);
    }, [hotel_id]);

    return <Fragment>
        <h1>Check Availability for Hotel ID: {hotel_id}</h1>
    </Fragment>
}

export default CheckAvailability