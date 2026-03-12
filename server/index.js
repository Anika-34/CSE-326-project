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
app.get('/v1/dummy', async (req, res) => {
    try {
        const allUsers = await pool.query('SELECT * FROM users');
        res.json(allUsers.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.get('/v1/hotels/location-suggestions', async (req, res) => {
    try {
        const query = String(req.query.query || '').trim();
        const result = await pool.query(
            `
            SELECT DISTINCT h.location
            FROM hotels h
            WHERE h.location ILIKE $1
            ORDER BY h.location ASC
            LIMIT 8
            `,
            [`%${query}%`]
        );

        res.json(result.rows.map((row) => row.location));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// hotel list 
// TODO room, adults, children ke nei nai
app.get('/v1/hotels/search', async (req, res) => {
    try {
        const { location, check_in_date, check_out_date } = req.query;

        const result = await pool.query(
            `
            SELECT DISTINCT ON (h.hotel_id)
                h.hotel_id,
                h.name,
                h.location,
                h.image_url,
                r.room_type,
                r.price_per_night,
                r.capacity,
                p.cancellation_policy,
                d.discount_percentage,
                d.description AS deal_description
            FROM hotels h
            JOIN rooms r ON h.hotel_id = r.hotel_id
            LEFT JOIN policies p ON h.hotel_id = p.hotel_id
            LEFT JOIN deals d ON r.room_id = d.room_id
            JOIN room_availability ra ON r.room_id = ra.room_id
            WHERE 
                h.location ILIKE '%' || $1 || '%'
                AND ra.start_date <= $2
                AND ra.end_date >= $3
            GROUP BY 
                h.hotel_id, h.name, h.location, h.image_url,
                r.room_type, r.price_per_night, r.capacity,
                p.cancellation_policy, d.discount_percentage, d.description
            ORDER BY h.hotel_id, r.capacity DESC;
            `,
            [location, check_in_date, check_out_date]
        );

        const hotelIds = [...new Set(result.rows.map(h => h.hotel_id))];

        const reviewCounts = hotelIds.length
            ? await pool.query(
                `
                SELECT hotel_id, COUNT(*)::int AS review_count
                FROM reviews
                WHERE hotel_id = ANY($1::int[])
                GROUP BY hotel_id
                `,
                [hotelIds]
            )
            : { rows: [] };


        const overallScores = hotelIds.length
            ? await pool.query(
                `SELECT hr.hotel_id,
                ROUND(AVG(hr.overall_score), 1) as overall_score
                FROM hotel_ratings hr
                WHERE hr.hotel_id = ANY($1::int[])
                GROUP BY hr.hotel_id
                `,
                [hotelIds]
            )
            : { rows: [] };

        result.rows.forEach(hotel => {
            const reviewCount = reviewCounts.rows.find(rc => rc.hotel_id === hotel.hotel_id);
            hotel.review_count = reviewCount ? reviewCount.review_count : 0;
        });

        result.rows.forEach(hotel => {
            const overallScore = overallScores.rows.find(os => os.hotel_id === hotel.hotel_id);
            hotel.overall_score = overallScore ? overallScore.overall_score : null;
        });

        // console.log('Raw DB result:', result.rows);
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

            let ratingText = "Poor"
            if (score >= 4.5) ratingText = "Excellent"
            else if (score >= 3.5) ratingText = "Very Good"
            else if (score >= 2.5) ratingText = "Good"
            else if (score >= 1.5) ratingText = "Average"

            return {
                id: h.hotel_id,
                name: h.name,
                stars: Math.round(h.overall_score),
                rating: (score).toFixed(1),
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
                    ? [{ type: h.deal_description, label: `${discount}% off` }]
                    : []
            }
        });
        // console.log('Formatted hotels:', hotels);
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
        const parsedHotelId = Number(hotelId);

        if (!Number.isInteger(parsedHotelId) || parsedHotelId <= 0) {
            return res.status(400).json({ error: 'Invalid hotelId' });
        }

        const hotelQuery = `
          SELECT 
            h.hotel_id,
            h.name,
            h.location,
            h.description,
            h.image_url,
            hr.cleanliness_score,
            hr.service_score,
            hr.location_score,
            hr.overall_score,
            p.cancellation_policy,
            p.refund_policy
          FROM hotels h
          LEFT JOIN hotel_ratings hr ON h.hotel_id = hr.hotel_id
          LEFT JOIN policies p ON h.hotel_id = p.hotel_id
          WHERE h.hotel_id = $1
          GROUP BY 
            h.hotel_id, hr.cleanliness_score, hr.service_score, hr.location_score,
            hr.overall_score, p.cancellation_policy, p.refund_policy
        `;

        const amenitiesQuery = `
        SELECT 
            ha.room_id,
            a.amenity_id,
            a.name,
            a.category,
            a.is_chargeable
        FROM hotel_amenities ha
        JOIN amenities a ON a.amenity_id = ha.amenity_id
        WHERE ha.room_id IN (
            SELECT r.room_id
            FROM rooms r
            WHERE r.hotel_id = $1
        )
        `;

        const roomsQuery = `
        SELECT 
            r.room_id,
            r.room_type,
            r.price_per_night,
            r.capacity
        FROM rooms r
        WHERE r.hotel_id = $1
        `;

        const dealsQuery = `
        SELECT 
            d.room_id,
            d.description AS deal_description,
            d.discount_percentage
        FROM deals d
        JOIN rooms r ON d.room_id = r.room_id
        WHERE r.hotel_id = $1
            AND CURRENT_DATE BETWEEN d.start_date AND d.end_date
        `;

        const surroundingsQuery = `
        SELECT 
            name, description
        FROM surroundings
        WHERE hotel_id = $1
        `;

        const numberOfAvailableRoomsQuery = `
        SELECT  COUNT(*) AS available_rooms
        FROM rooms r
        JOIN room_availability ra ON r.room_id = ra.room_id
        WHERE r.hotel_id = $1
            AND ra.start_date <= CURRENT_DATE
            AND ra.end_date >= CURRENT_DATE
        `;

        const reviewQuery = `
        SELECT 
            r.review_id,
            r.rating,
            r.comment,
            u.name AS reviewer_name,
            r.review_date
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        WHERE r.hotel_id = $1
        ORDER BY r.review_date DESC
        `;

        const ratingQuery = `
        SELECT 
            ROUND(AVG(hr.cleanliness_score), 1) as cleanliness_score,
            ROUND(AVG(hr.service_score), 1) as service_score,
            ROUND(AVG(hr.location_score), 1) as location_score,
            ROUND(AVG(hr.overall_score), 1) as overall_score
        FROM hotel_ratings hr
        WHERE hr.hotel_id = $1;
        `;

        // console.log(await pool.query(ratingQuery, [hotelId]))


        const [hotel, amenities, rooms, deals, surroundings, availableRoomsResult, reviewsResult, ratingResult] = await Promise.all([
            pool.query(hotelQuery, [parsedHotelId]),
            pool.query(amenitiesQuery, [parsedHotelId]),
            pool.query(roomsQuery, [parsedHotelId]),
            pool.query(dealsQuery, [parsedHotelId]),
            pool.query(surroundingsQuery, [parsedHotelId]),
            pool.query(numberOfAvailableRoomsQuery, [parsedHotelId]),
            pool.query(reviewQuery, [parsedHotelId]),
            pool.query(ratingQuery, [parsedHotelId])
        ]);

        res.json({
            hotel: hotel.rows[0],
            amenities: amenities.rows,
            rooms: rooms.rows,
            deals: deals.rows,
            surroundings: surroundings.rows,
            availableRooms: availableRoomsResult.rowCount > 0 ? availableRoomsResult.rows[0].available_rooms : 0,
            reviews: reviewsResult.rowCount > 0 ? reviewsResult.rows : [],
            reviewCount: reviewsResult.rowCount,
            ratings: ratingResult.rowCount > 0 ? ratingResult.rows[0] : null
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});