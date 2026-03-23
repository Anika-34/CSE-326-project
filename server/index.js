const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const pool = require('./db');
const jwt = require('jsonwebtoken');
const Stripe = require('stripe');
const cron = require('node-cron');

const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
}));
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// routes

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret';

const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

    // if (!token) {
    //     return res.status(401).json({ error: 'Missing or invalid token' });
    // }

    // try {
    //     const payload = jwt.verify(token, JWT_SECRET);
    //     req.user = payload;
    //     return next();
    // } catch (err) {
    //     return res.status(401).json({ error: 'Invalid or expired token' });
    // }
};

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden — admin access required' });
    }
    return next();
};

const requireUser = (req, res, next) => {
    if (!req.user || req.user.role === 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden — user access only' });
    }
    return next();
};

// users

// minimal login (plain password match for seed/demo)
app.post('/v1/auth/login', async (req, res) => {
    try {
        console.log('Login attempt:', req.body);
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const result = await pool.query(
            'SELECT user_id, email, password, role FROM users WHERE email = $1',
            [email]
        );

        console.log('DB query result:', result.rows);
        if (result.rowCount === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        if (String(user.password) !== String(password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '2h' }
        );
        // console.log('token', token)

        return res.json({ token: token,
            user_id: user.user_id
         });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// minimal signup (plain password for demo)
app.post('/v1/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body || {};
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password required' });
        }

        const existing = await pool.query(
            'SELECT 1 FROM users WHERE email = $1',
            [email]
        );
        if (existing.rowCount > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const insertResult = await pool.query(
            `
            INSERT INTO users (name, email, password, role)
            VALUES ($1, $2, $3, 'REGISTERED')
            RETURNING user_id, name, email, role
            `,
            [name, email, String(password)]
        );

        const createdUser = insertResult.rows[0];
        const token = jwt.sign(
            { user_id: createdUser.user_id, email: createdUser.email, role: createdUser.role },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.status(201).json({
            message: 'Signup successful',
            user: createdUser,
            token
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});

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
        console.log('Search query params:', req.query);

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

        console.log('Hotel ID:', parsedHotelId);
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
            AND ra.is_available = TRUE
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

app.post('/v1/bookings', async (req, res) => {
    console.log('Booking request body:', req.body);
    try{
        console.log('Received booking request:', req.body);
        const{user_id, room_id,check_in_date,check_out_date,guests,first_name,last_name,email,phone_number,promo_code,special_requests} = req.body

        if (!room_id || !check_in_date || !check_out_date || !guests || !first_name || !last_name || !email || !phone_number) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const checkIn = new Date(check_in_date);
        const checkOut = new Date(check_out_date);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        if (!Number.isFinite(nights) || nights <= 0) {
            return res.status(400).json({ message: "Invalid check-in/check-out dates" });
        }
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const availCheck = await client.query(
                `
                SELECT r.price_per_night
                FROM room_availability ra
                JOIN rooms r ON r.room_id = ra.room_id
                WHERE ra.room_id = $1
                LIMIT 1
                `,
                [room_id]
            );
            // if (availCheck.rowCount === 0) {
            //     await client.query('ROLLBACK');
            //     return res.status(409).json({ message: "Room not available for booking" });
            // }
            console.log(check_in_date,check_out_date)
            await client.query(
                `
                UPDATE room_availability
                SET is_available = FALSE,start_date = $2,end_date = $3
                WHERE room_id = $1
                `,
                [room_id,check_in_date,check_out_date]
            )
            const pricePerNight = Number(availCheck.rows[0].price_per_night);
            let discountPercentage = 0;
            if (promo_code) {
                const promoResult = await client.query(
                    `
                    SELECT discount_percentage
                    FROM promo_codes
                    WHERE code = $1
                      AND is_active = TRUE
                      AND (start_date IS NULL OR start_date <= CURRENT_DATE)
                      AND (end_date IS NULL OR end_date >= CURRENT_DATE)
                    `,
                    [promo_code]
                );
                if (promoResult.rowCount > 0) {
                    discountPercentage = Number(promoResult.rows[0].discount_percentage) || 0;
                }
            }
            const baseTotal = pricePerNight * nights;
            const totalPrice = baseTotal * (1 - discountPercentage / 100);
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
            const bookingResult = await client.query(
                `
                INSERT INTO bookings (
                    user_id, room_id, check_in_date, check_out_date,
                    booking_status, total_amount, currency, guests,
                    expires_at, special_requests, promo_code
                ) VALUES (
                    $1, $2, $3, $4,
                    'INITIATED', $5, 'USD', $6,
                    $7, $8, $9
                )
                RETURNING booking_id, booking_status, total_amount, currency, expires_at
                `,
                [user_id, room_id, check_in_date, check_out_date, totalPrice, guests, expiresAt, special_requests || null, promo_code || null]
            );
            const booking = bookingResult.rows[0];
            await client.query(
                `
                INSERT INTO booking_contacts (
                    booking_id, first_name, last_name, email, phone_number
                ) VALUES ($1, $2, $3, $4, $5)
                `,
                [booking.booking_id, first_name, last_name, email, phone_number]
            );
            console.log('Booking created with ID:', booking.booking_id);
            await client.query('COMMIT');
            return res.status(201).json({
                booking_id: String(booking.booking_id),
                status: booking.booking_status,
                total_price: Number(booking.total_amount),
                // currency: booking.currency,
                expires_at: booking.expires_at
            });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(err);
            return res.status(400).json({ message: "An error occured while processing the request" });
        } finally {
            client.release();
        }
    }
    catch(err){
        console.log(err)
        res.status(400).json({message:"An error occured while processing the request"})
    }
})

// app.post('/v1/bookings', async (req, res) => {
//     const client = await pool.connect();
//     try {
//         const {
//             user_id, room_id, check_in_date, check_out_date,
//             guests, first_name, last_name, email, phone_number,
//             promo_code, special_requests
//         } = req.body;

//         // 1. Validation
//         if (!room_id || !check_in_date || !check_out_date || !guests || !first_name || !last_name || !email || !phone_number) {
//             return res.status(400).json({ message: "Missing required fields" });
//         }

//         const checkIn = new Date(check_in_date);
//         const checkOut = new Date(check_out_date);
//         const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

//         if (nights <= 0) {
//             return res.status(400).json({ message: "Invalid check-in/check-out dates" });
//         }

//         await client.query('BEGIN');

//         // 2. Lock and Check Availability for ALL requested dates
//         // This ensures no two people book the same dates simultaneously
//         const availCheck = await client.query(
//             `
//             SELECT COUNT(*)::int as available_days, MIN(r.price_per_night) as price
//             FROM room_availability ra
//             JOIN rooms r ON r.room_id = ra.room_id
//             WHERE ra.room_id = $1 
//               AND ra.start_date >= $2 
//               AND ra.start_date < $3
//               AND ra.is_available = TRUE
//             FOR UPDATE
//             `,
//             [room_id, check_in_date, check_out_date]
//         );

//         if (availCheck.rows[0].available_days < nights) {
//             await client.query('ROLLBACK');
//             return res.status(409).json({ message: "Room is no longer available for the selected dates" });
//         }

//         // 3. Mark specific dates as UNAVAILABLE
//         await client.query(
//             `
//             UPDATE room_availability
//             SET is_available = FALSE
//             WHERE room_id = $1 
//               AND start_date >= $2 
//               AND start_date < $3
//             `,
//             [room_id, check_in_date, check_out_date]
//         );

//         // 4. Calculate Pricing & Promos
//         const pricePerNight = Number(availCheck.rows[0].price);
//         let discountPercentage = 0;
//         if (promo_code) {
//             const promoResult = await client.query(
//                 `SELECT discount_percentage FROM promo_codes 
//                  WHERE code = $1 AND is_active = TRUE 
//                  AND (start_date IS NULL OR start_date <= CURRENT_DATE)
//                  AND (end_date IS NULL OR end_date >= CURRENT_DATE)`,
//                 [promo_code]
//             );
//             if (promoResult.rowCount > 0) {
//                 discountPercentage = Number(promoResult.rows[0].discount_percentage);
//             }
//         }

//         const totalPrice = (pricePerNight * nights) * (1 - discountPercentage / 100);
//         const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min expiry

//         // 5. Insert Booking
//         const bookingResult = await client.query(
//             `INSERT INTO bookings (
//                 user_id, room_id, check_in_date, check_out_date,
//                 booking_status, total_amount, guests, expires_at, 
//                 special_requests, promo_code
//             ) VALUES ($1, $2, $3, $4, 'INITIATED', $5, $6, $7, $8, $9)
//             RETURNING booking_id, booking_status, total_amount, expires_at`,
//             [user_id, room_id, check_in_date, check_out_date, totalPrice, guests, expiresAt, special_requests, promo_code]
//         );

//         const booking = bookingResult.rows[0];

//         // 6. Insert Contact Info
//         await client.query(
//             `INSERT INTO booking_contacts (booking_id, first_name, last_name, email, phone_number)
//              VALUES ($1, $2, $3, $4, $5)`,
//             [booking.booking_id, first_name, last_name, email, phone_number]
//         );

//         await client.query('COMMIT');
//         res.status(201).json({
//             booking_id: String(booking.booking_id),
//             status: booking.booking_status,
//             total_price: Number(booking.total_amount),
//             expires_at: booking.expires_at
//         });

//     } catch (err) {
//         await client.query('ROLLBACK');
//         console.error(err);
//         res.status(500).json({ message: "Server error during booking" });
//     } finally {
//         client.release();
//     }
// });


app.get('/v1/bookings/:booking_id',requireAuth,requireUser,async(req,res)=>{
    try{
        const client = await pool.connect();
        try{
            await client.query('BEGIN')
            const {booking_id} = req.params
            const result = await client.query(
                `
                SELECT *
                FROM bookings b
                JOIN booking_contacts bc on b.booking_id = bc.booking_id 
                JOIN rooms r on b.room_id = r.room_id 
                JOIN hotels h on r.hotel_id = h.hotel_id
                WHERE b.booking_id = $1
                `
                ,[booking_id]
            )
            if(result.rowCount === 0){
                return res.status(404).json({
                    message:"Booking not found"
                })
            }
            const booking_info = result.rows[0]
            if (booking_info.user_id !== req.user.user_id) {
                return res.status(403).json({ message: "Forbidden — user does not own this booking" })
            }
            return res.status(200).json({
                booking_id: String(booking_info.booking_id),
                hotel_name: booking_info.name,
                room_type: booking_info.roomType,
                check_in_date:booking_info.check_in_date,
                check_out_date: booking_info.check_out_date,
                guests: booking_info.guests,
                status: booking_info.booking_status,
                total_price: Number(booking_info.total_amount),
                currency: booking_info.currency,
                expires_at: booking_info.expires_at
            })
        }
        catch(err1){
           await client.query('ROLLBACK');
           console.error(err1);
           return res.status(400).json({ message: "An error occured while processing the request" })
        }
    }
    catch(err){
        return res.status(400).json({
            message: "An error occured while processing the request"
        })
    }
})

app.get('/v1/admin/bookings',requireAuth,requireAdmin,async(req,res)=>{
    try {
        const { status, hotel_id, from_date, to_date, page } = req.query;
        const pageNumber = Math.max(1, Number(page) || 1);
        const limit = 10;
        const offset = (pageNumber - 1) * limit;

        const where = [];
        const values = [];

        if (status) {
            values.push(status);
            where.push(`b.booking_status = $${values.length}`);
        }

        if (hotel_id) {
            values.push(Number(hotel_id));
            where.push(`h.hotel_id = $${values.length}`);
        }

        if (from_date) {
            values.push(from_date);
            where.push(`b.check_in_date >= $${values.length}`);
        }

        if (to_date) {
            values.push(to_date);
            where.push(`b.check_out_date <= $${values.length}`);
        }

        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const countResult = await pool.query(
            `
            SELECT COUNT(*)::int AS total
            FROM bookings b
            JOIN rooms r ON b.room_id = r.room_id
            JOIN hotels h ON r.hotel_id = h.hotel_id
            ${whereClause}
            `,
            values
        );

        const listResult = await pool.query(
            `
            SELECT 
                b.booking_id,
                b.user_id,
                h.hotel_id,
                b.room_id,
                b.booking_status AS status,
                b.total_amount AS total_price,
                b.currency,
                b.check_in_date,
                b.check_out_date,
                b.created_at
            FROM bookings b
            JOIN rooms r ON b.room_id = r.room_id
            JOIN hotels h ON r.hotel_id = h.hotel_id
            ${whereClause}
            ORDER BY b.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
            `,
            values
        );

        return res.status(200).json({
            page: pageNumber,
            total_pages: Math.ceil(countResult.rows[0].total / limit),
            total_bookings: countResult.rows[0].total,
            bookings: listResult.rows
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
})

app.get('/v1/admin/bookings/:booking_id',requireAuth,requireAdmin,async(req,res)=>{
    try{
        const client = await pool.connect();
        try{
            await client.query('BEGIN')
            const {booking_id} = req.params
            const result = await client.query(
                `
                SELECT *
                FROM bookings b
                JOIN booking_contacts bc on b.booking_id = bc.booking_id 
                JOIN rooms r on b.room_id = r.room_id 
                JOIN hotels h on r.hotel_id = h.hotel_id
                WHERE b.booking_id = $1
                `
                ,[booking_id]
            )
            if(result.rowCount === 0){
                return res.status(404).json({
                    message:"Booking not found"
                })
            }
            const booking_info = result.rows[0]
            return res.status(200).json({
                booking_id: String(booking_info.booking_id),
                first_name:booking_info.first_name,
                last_name:booking_info.last_name,
                email:booking_info.email,
                phone_number:booking_info.phone_number,
                hotel_name: booking_info.name,
                room_type: booking_info.roomType,
                check_in_date:booking_info.check_in_date,
                check_out_date: booking_info.check_out_date,
                guests: booking_info.guests,
                status: booking_info.booking_status,
                total_price: Number(booking_info.total_amount),
                currency: booking_info.currency,
                cancellation_time:booking_info.cancellation_at,
                
            })
        }
        catch(err1){
           await client.query('ROLLBACK');
           console.error(err1);
           return res.status(400).json({ message: "An error occured while processing the request" })
        }
    }
    catch(err){
        return res.status(400).json({
            message: "An error occured while processing the request"
        })
    }
})

const sanitizeCardNumber = (number = '') => String(number).replace(/\s+/g, '');

const mapTestCardToPaymentMethod = (cardNumber) => {
    const digits = sanitizeCardNumber(cardNumber);

    const testMethodMap = {
        '4242424242424242': 'pm_card_visa',
        '4000000000000002': 'pm_card_chargeDeclined',
        '4000002500003155': 'pm_card_threeDSecure2Required',
    };

    return testMethodMap[digits] || null;
};

const verifyPaymentWithGateway = async ({ paymentMethod, cardNumber, amount, cardholderName, expiryDate, cvv }) => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY not configured in environment');
    }

    if (paymentMethod !== 'card') {
        return {
            isVerified: true,
            providerStatus: 'succeeded',
            message: `${paymentMethod} payment authorized.`,
        };
    }

    try {
        const paymentMethodId = mapTestCardToPaymentMethod(cardNumber);

        if (!paymentMethodId) {
            return {
                isVerified: false,
                providerStatus: 'unsupported_test_card',
                message: 'Use Stripe test cards: 4242 4242 4242 4242, 4000 0000 0000 0002, or 4000 0025 0000 3155.',
            };
        }

        // Confirm PaymentIntent using Stripe test PaymentMethod IDs to avoid raw PAN APIs.
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe uses cents
            currency: 'usd',
            payment_method: paymentMethodId,
            payment_method_types: ['card'],
            confirm: true,
        });

        if (paymentIntent.status === 'succeeded') {
            return {
                isVerified: true,
                providerStatus: 'succeeded',
                message: 'Payment completed successfully.',
                transactionId: paymentIntent.id,
            };
        }

        if (paymentIntent.status === 'requires_action') {
            return {
                isVerified: false,
                providerStatus: 'requires_action',
                message: 'Payment requires additional verification. Please complete 3D Secure.',
            };
        }

        return {
            isVerified: false,
            providerStatus: paymentIntent.status,
            message: `Payment ${paymentIntent.status}. Please try again or use a different card.`,
        };
    } catch (stripeError) {
        console.error('Stripe error:', stripeError.message);

        let message = 'Payment processing failed. Please try again.';

        if (stripeError.type === 'StripeCardError') {
            message = stripeError.message;
        } else if (stripeError.type === 'StripeRateLimitError') {
            message = 'Too many requests. Please try again in a moment.';
        } else if (stripeError.type === 'StripeAuthenticationError') {
            message = 'Authentication failed. Check your Stripe configuration.';
        } else if (stripeError.type === 'StripeInvalidRequestError') {
            message = 'Invalid payment details. Please check and try again.';
        }

        return {
            isVerified: false,
            providerStatus: 'error',
            message,
        };
    }
};

app.post('/v1/payments/process', async (req, res) => {
    const {
        booking_id,
        amount,
        payment_method,
        card_number,
        cardholder_name,
        expiry_date,
        cvv,
    } = req.body || {};

    if (!booking_id || !payment_method) {
        return res.status(400).json({ message: 'booking_id and payment_method are required.' });
    }

    if (payment_method === 'card') {
        const cleanCard = sanitizeCardNumber(card_number);

        if (cleanCard.length < 12) {
            return res.status(400).json({ message: 'Card number must be at least 12 digits.' });
        }
        if (!cardholder_name || String(cardholder_name).trim().length < 3) {
            return res.status(400).json({ message: 'Cardholder name is too short.' });
        }
        if (!/^\d{2}\/\d{2}$/.test(String(expiry_date || ''))) {
            return res.status(400).json({ message: 'Expiry date must be in MM/YY format.' });
        }
        if (!/^\d{3,4}$/.test(String(cvv || ''))) {
            return res.status(400).json({ message: 'CVV/CVC must be 3 or 4 digits.' });
        }
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const bookingResult = await client.query(
            `
            SELECT booking_id, room_id, booking_status, total_amount, expires_at
            FROM bookings
            WHERE booking_id = $1
            FOR UPDATE
            `,
            [booking_id]
        );

        if (bookingResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Booking not found.' });
        }

        const booking = bookingResult.rows[0];
        const expectedAmount = Number(booking.total_amount);
        const requestedAmount = Number(amount);

        if (Number.isFinite(requestedAmount) && Math.abs(requestedAmount - expectedAmount) > 0.01) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Payment amount does not match booking total.' });
        }

        if (booking.booking_status === 'CONFIRMED') {
            await client.query('ROLLBACK');
            return res.status(409).json({ message: 'Booking is already paid.' });
        }

        if (booking.expires_at && new Date(booking.expires_at) < new Date()) {
            await client.query(
                `
                UPDATE bookings
                SET booking_status = 'EXPIRED'
                WHERE booking_id = $1
                `,
                [booking_id]
            );

            // await client.query(
            //     `
            //     UPDATE room_availability
            //     SET is_available = TRUE
            //     WHERE room_id = $1
            //     `,
            //     [booking.room_id]
            // );
            await client.query(
                `UPDATE room_availability 
                 SET is_available = TRUE 
                 WHERE room_id = $1 AND start_date >= $2 AND start_date < $3`,
                [booking.room_id, booking.check_in_date, booking.check_out_date]
            );

            await client.query('COMMIT');
            return res.status(409).json({ message: 'Booking has expired. Please book again.' });
        }

        await client.query(
            `
            UPDATE bookings
            SET booking_status = 'PAYMENT_PENDING'
            WHERE booking_id = $1
            `,
            [booking_id]
        );

        const verification = await verifyPaymentWithGateway({
            paymentMethod: payment_method,
            cardNumber: card_number,
            amount: expectedAmount,
            cardholderName: cardholder_name,
            expiryDate: expiry_date,
            cvv,
        });

        const paymentStatus = verification.isVerified ? 'SUCCESS' : 'FAILED';

        const paymentInsert = await client.query(
            `
            INSERT INTO payments (booking_id, amount, payment_status)
            VALUES ($1, $2, $3)
            RETURNING payment_id, payment_date
            `,
            [booking_id, expectedAmount, paymentStatus]
        );

        await client.query(
            `
            UPDATE bookings
            SET booking_status = $2
            WHERE booking_id = $1
            `,
            [booking_id, verification.isVerified ? 'CONFIRMED' : 'INITIATED']
        );

        await client.query('COMMIT');

        const payment = paymentInsert.rows[0];
        return res.status(200).json({
            status: paymentStatus,
            transactionId: `PMT-${payment.payment_id}`,
            booking_id: String(booking_id),
            payment_id: payment.payment_id,
            amount: expectedAmount,
            message: verification.message,
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        return res.status(500).json({ message: 'Unable to process payment right now.' });
    } finally {
        client.release();
    }
});

// populating the room availability

async function syncRoomAvailability() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query(`
            UPDATE room_availability 
            SET is_available = FALSE 
            WHERE end_date < CURRENT_DATE;
        `);

        await client.query(`
            INSERT INTO room_availability (room_id, start_date, end_date, is_available)
            SELECT 
                r.room_id, 
                d.day::date as start_date, 
                d.day::date as end_date, 
                TRUE as is_available
            FROM rooms r
            CROSS JOIN generate_series(
                CURRENT_DATE, 
                CURRENT_DATE + INTERVAL '15 days', 
                INTERVAL '1 day'
            ) AS d(day)
            WHERE NOT EXISTS (
                SELECT 1 FROM room_availability ra 
                WHERE ra.room_id = r.room_id 
                AND ra.start_date = d.day::date
            );
        `);

        await client.query('COMMIT');
        console.log('Room availability synced successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error syncing room availability:', err);
    } finally {
        client.release();
    }
}

cron.schedule('0 0 * * *', () => {
    console.log('Running daily availability sync...');
    syncRoomAvailability();
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        syncRoomAvailability();
    });
}

module.exports = app;
