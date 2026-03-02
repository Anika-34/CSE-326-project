CREATE DATABASE tripv1;

CREATE TYPE status_type AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED');
CREATE TYPE user_type AS ENUM ('REGISTERED', 'GUEST', 'ADMIN');


CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), 
    role user_type DEFAULT 'GUEST'
);

CREATE TABLE hotels (
    hotel_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    overall_rating DECIMAL(3, 2) DEFAULT 0.0
);


CREATE TABLE hotel_ratings (
    rating_id SERIAL PRIMARY KEY,
    hotel_id INTEGER REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    cleanliness_score DECIMAL(3, 2),
    service_score DECIMAL(3, 2),
    location_score DECIMAL(3, 2),
    overall_score DECIMAL(3, 2)
);

CREATE TABLE rooms (
    room_id SERIAL PRIMARY KEY,
    hotel_id INTEGER REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    room_type VARCHAR(100) NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    capacity INTEGER NOT NULL
);


CREATE TABLE amenities (
    amenity_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_chargeable BOOLEAN DEFAULT FALSE,
    category VARCHAR(100)
);

CREATE TABLE hotel_amenities (
    hotel_id INTEGER REFERENCES hotels(hotel_id),
    amenity_id INTEGER REFERENCES amenities(amenity_id),
    PRIMARY KEY (hotel_id, amenity_id)
);

CREATE TABLE policies (
    policy_id SERIAL PRIMARY KEY,
    hotel_id INTEGER REFERENCES hotels(hotel_id),
    cancellation_policy TEXT,
    refund_policy TEXT
);


CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    room_id INTEGER REFERENCES rooms(room_id),
    booking_date DATE DEFAULT CURRENT_DATE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    booking_status status_type DEFAULT 'PENDING',
    total_amount DECIMAL(10, 2) NOT NULL
);

CREATE TABLE guest_details (
    guest_id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(booking_id),
    guest_name VARCHAR(255),
    age INTEGER,
    gender VARCHAR(50)
);


CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(booking_id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_status status_type DEFAULT 'PENDING', 
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refunds (
    refund_id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(payment_id),
    refund_amount DECIMAL(10, 2) NOT NULL,
    refund_status status_type DEFAULT 'PENDING',
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    hotel_id INTEGER REFERENCES hotels(hotel_id),
    comment TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE favourites (
    favourite_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    hotel_id INTEGER REFERENCES hotels(hotel_id),
    UNIQUE(user_id, hotel_id)
);


CREATE TABLE deals (
    deal_id SERIAL PRIMARY KEY,
    hotel_id INTEGER REFERENCES hotels(hotel_id),
    description TEXT,
    discount_percentage DECIMAL(5, 2),
    start_date DATE,
    end_date DATE
);

CREATE TABLE room_availability (
    availability_id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(room_id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE
);

-- INSERT INTO users (name, email, password, role) VALUES 
-- ('Alice Johnson', 'alice@example.com', 'hashed_password_1', 'REGISTERED'),
-- ('Bob Smith', 'bob@example.com', 'hashed_password_2', 'REGISTERED'),
-- ('Charlie Brown', 'charlie@example.com', 'hashed_password_3', 'GUEST'),
-- ('Admin User', 'admin@example.com', 'hashed_password_4', 'ADMIN');