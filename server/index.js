const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const pool = require('./db');

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// routes

// users

// dummy test
app.get('/api/dummy', async (req, res) => {
    try {
        const allUsers = await pool.query('SELECT * FROM users');
        res.json(allUsers.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// hotel list 
app.get('/v1/hotels/search', async (req, res) => {
    try {
        const { location, check_in_date, check_out_date } = req.query;
        console.log('Search params:', { location, check_in_date, check_out_date });
        const result = await pool.query(
            `
            SELECT 
                h.hotel_id,
                h.name,
                h.location,
                h.overall_rating,
                h.image_url,

                hr.overall_score,

                r.room_type,
                r.price_per_night,
                r.capacity,

                p.cancellation_policy,

                COUNT(rv.review_id) AS review_count,

                d.discount_percentage,
                d.description AS deal_description

            FROM hotels h

            JOIN rooms r 
                ON h.hotel_id = r.hotel_id

            LEFT JOIN hotel_ratings hr 
                ON h.hotel_id = hr.hotel_id

            LEFT JOIN reviews rv
                ON h.hotel_id = rv.hotel_id

            LEFT JOIN policies p
                ON h.hotel_id = p.hotel_id

            LEFT JOIN deals d 
                ON h.hotel_id = d.hotel_id
                AND CURRENT_DATE BETWEEN d.start_date AND d.end_date

            JOIN room_availability ra 
                ON r.room_id = ra.room_id

            WHERE 
                h.location ILIKE '%' || $1 || '%'
                AND ra.start_date <= $2
                AND ra.end_date >= $3

            GROUP BY 
                h.hotel_id,
                h.name,
                h.location,
                h.overall_rating,
                h.image_url,
                hr.overall_score,
                r.room_type,
                r.price_per_night,
                r.capacity,
                p.cancellation_policy,
                d.discount_percentage,
                d.description
            `,
            [location, check_in_date, check_out_date]
        );

        console.log('Raw DB result:', result.rows);
        // res.json(result.rows);
        const hotels = result.rows.map(h => {

            const oldPrice = Number(h.price_per_night)
            const discount = Number(h.discount_percentage) || 0
            const currentPrice = oldPrice * (1 - discount / 100)

            const nights =
                (new Date(check_out_date) - new Date(check_in_date)) /
                (1000 * 60 * 60 * 24)

            const totalPrice = currentPrice * nights

            const score = Number(h.overall_score) || 0

            let ratingText = "Good"
            if (score >= 4.5) ratingText = "Excellent"
            else if (score >= 4) ratingText = "Very Good"
            else if (score >= 3) ratingText = "Good"

            return {
                id: h.hotel_id,
                name: h.name,
                stars: Math.round(h.overall_rating),
                rating: (score * 2).toFixed(1),
                ratingText,
                reviewCount: Number(h.review_count),

                image: h.image_url,
                location: h.location,

                roomType: h.room_type,
                capacity: h.capacity,

                cancellationPolicy: h.cancellation_policy,

                oldPrice,
                currentPrice,
                totalPrice,

                tags: discount
                    ? [{ type: h.deal_description , label: `${discount}% off` }]
                    : []
            }
        });
        console.log('Formatted hotels:', hotels);
        res.json(hotels);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// check availability
app.get('/v1/hotels/details/:hotelId', async (req, res) => {
    try {
        const { hotelId } = req.params;
        // console.log('Hotel ID:', hotelId);
        const result = await pool.query(
            `
            SELECT * from hotels h where h.hotel_id = $1
            `,
            [hotelId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});