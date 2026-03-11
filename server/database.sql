CREATE DATABASE tripv1;
-- \c tripv1

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
    overall_rating DECIMAL(3, 2) DEFAULT 0.0,
    image_url VARCHAR(255)
);


CREATE TABLE hotel_images (
  image_id SERIAL PRIMARY KEY,
  hotel_id INTEGER REFERENCES hotels(hotel_id),
  image_url TEXT
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
    room_id INTEGER REFERENCES rooms(room_id) ,
    amenity_id INTEGER REFERENCES amenities(amenity_id),
    PRIMARY KEY (room_id, amenity_id)
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
    room_id INTEGER REFERENCES rooms(room_id),
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

CREATE TABLE surroundings (
    surrounding_id SERIAL PRIMARY KEY,
    hotel_id INTEGER REFERENCES hotels(hotel_id),
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- dummy data --

INSERT INTO users (name, email, password, role) VALUES 
('Alice Johnson', 'alice@example.com', 'hashed_password_1', 'REGISTERED'),
('Bob Smith', 'bob@example.com', 'hashed_password_2', 'REGISTERED'),
('Charlie Brown', 'charlie@example.com', 'hashed_password_3', 'GUEST'),
('Admin User', 'admin@example.com', 'hashed_password_4', 'ADMIN');

INSERT INTO hotels (name, location, description, overall_rating, image_url) VALUES 
('Grand Plaza Hotel', 'New York', 'Luxury hotel in downtown Manhattan', 4.5, 'https://picsum.photos/400/300');

INSERT INTO hotel_ratings (hotel_id, cleanliness_score, service_score, location_score, overall_score) VALUES 
(1, 4.8, 4.7, 4.5, 4.67);

INSERT INTO rooms (hotel_id, room_type, price_per_night, capacity) VALUES 
(1, 'Deluxe Suite', 250.00, 2);

INSERT INTO amenities (name, description, is_chargeable, category) VALUES 
('Free WiFi', 'High-speed internet access', FALSE, 'Connectivity'),
('Swimming Pool', 'Olympic-sized outdoor pool', FALSE, 'Recreation'),
('Spa Services', 'Professional massage and wellness treatments', TRUE, 'Wellness');

INSERT INTO hotel_amenities (room_id, amenity_id) VALUES 
(1, 1), (1, 2);  -- room 1 gets WiFi and Pool

INSERT INTO deals (room_id, description, discount_percentage, start_date, end_date) VALUES 
(1, 'Early bird discount', 15.00, '2026-01-01', '2026-04-28');

INSERT INTO policies (hotel_id, cancellation_policy, refund_policy) VALUES 
(1, 'Free cancellation up to 7 days before check-in', 'Full refund for cancellations 7+ days prior');

INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, booking_status, total_amount) VALUES 
(1, 1, '2024-02-15', '2024-02-18', 'CONFIRMED', 750.00);

INSERT INTO guest_details (booking_id, guest_name, age, gender) VALUES 
(1, 'Alice Johnson', 30, 'Female');

INSERT INTO payments (booking_id, amount, payment_status) VALUES 
(1, 750.00, 'CONFIRMED');

INSERT INTO refunds (payment_id, refund_amount, refund_status) VALUES 
(1, 0.00, 'PENDING');

INSERT INTO reviews (user_id, hotel_id, comment, rating) VALUES 
(1, 1, 'Excellent stay, highly recommend!', 5);

INSERT INTO favourites (user_id, hotel_id) VALUES 
(1, 1);

INSERT INTO deals (hotel_id, description, discount_percentage, start_date, end_date) VALUES 
(1, 'Early bird discount', 15.00, '2026-01-01', '2026-04-28');

-- another hotel --
INSERT INTO hotels (name, location, description, overall_rating, image_url) VALUES 
('Oceanview Resort', 'New York', 'Beachfront resort with stunning ocean views', 4.2, 'https://picsum.photos/400/300');

INSERT INTO hotel_ratings (hotel_id, cleanliness_score, service_score, location_score, overall_score) VALUES 
(2, 4.5, 4.3, 4.0, 4.27);

INSERT INTO rooms (hotel_id, room_type, price_per_night, capacity) VALUES 
(2, 'Oceanview Room', 200.00, 2);

INSERT INTO amenities (name, description, is_chargeable, category) VALUES 
('Beach Access', 'Private beach access for guests', FALSE, 'Recreation');

INSERT INTO hotel_amenities (room_id, amenity_id) VALUES 
(2, 3);  -- room 2 gets Beach Access

INSERT INTO policies (hotel_id, cancellation_policy, refund_policy) VALUES 
(2, 'Free cancellation up to 14 days before check-in', 'Full refund for cancellations 14+ days prior');


INSERT INTO deals (room_id, description, discount_percentage, start_date, end_date) VALUES 
(2, 'Spring break special', 20.00, '2026-03-01', '2026-03-31');

INSERT INTO room_availability (room_id, start_date, end_date) VALUES 
(1, '2026-02-15', '2026-02-18');


INSERT INTO room_availability (room_id, start_date, end_date) VALUES 
(2, '2026-02-15', '2026-02-18');

INSERT INTO rooms (hotel_id, room_type, price_per_night, capacity) VALUES 
(1, 'Standard Room', 150.00, 2);

INSERT INTO hotel_amenities (room_id, amenity_id) VALUES 
(3, 1);  -- room 3 gets WiFi

INSERT INTO policies (hotel_id, cancellation_policy, refund_policy) VALUES 
(1, 'Free cancellation up to 7 days before check-in', 'Full refund for cancellations 7+ days prior');

INSERT INTO deals (room_id, description, discount_percentage, start_date, end_date) VALUES 
(3, 'Last minute deal', 10.00, '2026-02-01', '2026-02-14');

INSERT INTO room_availability (room_id, start_date, end_date) VALUES 
(3, '2026-02-15', '2026-02-18');


INSERT INTO hotel_amenities (room_id, amenity_id) VALUES 
(1, 3);  

INSERT INTO amenities (name, description, is_chargeable, category) VALUES 
('Gym Access', '24/7 access to the hotel gym', FALSE, 'Fitness');

INSERT INTO hotel_amenities (room_id, amenity_id) VALUES 
(1, 4);  


-- add new room to hotel 1
INSERT INTO rooms (hotel_id, room_type, price_per_night, capacity) VALUES 
(1, 'Family Suite', 300.00, 4);

INSERT INTO amenities (name, description, is_chargeable, category) VALUES 
('Kitchenette', 'Small kitchen area with basic appliances', FALSE, 'Convenience');

INSERT INTO hotel_amenities (room_id, amenity_id) VALUES 
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5);  -- room 4 gets all amenities

INSERT INTO surroundings (hotel_id, name, description) VALUES 
(1, 'Central Park', 'Large public park with walking paths, lakes, and recreational areas'),
(1, 'Times Square', 'Famous commercial intersection known for its bright lights and Broadway theaters'),
(2, 'Santa Monica Pier', 'Iconic pier with an amusement park, aquarium, and restaurants');


INSERT INTO reviews (user_id, hotel_id, comment, rating) VALUES 
(2, 1, 'Great location but the service could be better.', 4),
(3, 1, 'Decent stay for the price.', 3),
(1, 1, 'Amazing ocean views and friendly staff!', 5);

INSERT INTO room_availability (room_id, start_date, end_date) VALUES 
(4, '2026-02-15', '2026-02-18');

-- delete --
-- drop database tripv1;