import React, { Fragment, useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import RoomCard from './RoomCard';
import AvailabilityBar from './AvailabilityBar';
import ResultSearchBar from './ResultSearchBar';
import '../styles/CheckAvailability.css';
import { useRef } from 'react';
import { getRatingLabel } from '../services/ratingUtils';

const SEARCH_STATE_KEY = 'trip.searchState';

const TABS = [
    { label: 'Rooms', id: 'rooms' },
    { label: 'Guest Reviews', id: 'reviews' },
    { label: 'Services & Amenities', id: 'amenities' },
    { label: 'Policies', id: 'policies' },
];


const CheckAvailability = () => {
    const navigate = useNavigate();
    const locationState = useLocation();
    const searchParams = locationState.state || {};

    let storedSearch = {};
    try {
        storedSearch = JSON.parse(localStorage.getItem(SEARCH_STATE_KEY) || '{}');
    } catch {
        storedSearch = {};
    }

    const location = searchParams.location || storedSearch.location || '';
    const checkInDate = searchParams.checkInDate || storedSearch.checkIn || new Date().toISOString().split('T')[0];
    const checkOutDate = searchParams.checkOutDate || storedSearch.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const room = Number(searchParams.room ?? storedSearch.room ?? 1);
    const adults = Number(searchParams.adults ?? storedSearch.adults ?? 2);
    const children = Number(searchParams.children ?? storedSearch.children ?? 0);
    const nights = Number(searchParams.nights ?? storedSearch.nights ?? Math.max(1, Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24))));

    const searchData = {
        location: location,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights: nights,
        room,
        adults,
        children
    };

    const [isSticky, setIsSticky] = useState(false);
    const lastScrollY = useRef(0);


    const { hotel_id } = useParams();
    const [hotelDetails, setHotelDetails] = useState(null);
    const [activeTab, setActiveTab] = useState('rooms');
    const [activeFilter, setActiveFilter] = useState(null);

    const apiBaseUrl = process.env.REACT_APP_API_URL || '';


    useEffect(() => {
        const sentinel = document.getElementById('availability-bar-sentinel');
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                const scrollingDown = window.scrollY > lastScrollY.current;
                lastScrollY.current = window.scrollY;

                if (!entry.isIntersecting && scrollingDown) {
                    setIsSticky(true);   // going down past sentinel → stick
                } else if (entry.isIntersecting) {
                    setIsSticky(false);  // sentinel visible again → unstick
                }
            },
            { threshold: 0 }
        );
        if (sentinel) observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hotelDetails]);

    useEffect(() => {
        const getAvailability = async () => {
            try {
                const res = await fetch(`${apiBaseUrl}/v1/hotels/details/${hotel_id}`);
                const data = await res.json();
                console.log('Hotel details response:', data);
                setHotelDetails(data);
            } catch (err) {
                console.error(err.message);
            }
        };
        getAvailability();
    }, [hotel_id, apiBaseUrl]);

    if (!hotelDetails) {
        return (
            <div className="ca-loading">
                <div className="ca-spinner" />
                <p className="ca-loading-text">Loading hotel details...</p>
            </div>
        );
    }

    const renderStars = (rating) => {
        const starCount = Math.round(Number(rating));
        return '★'.repeat(starCount).split('').map((s, i) => (
            <span key={i} className="ca-star">{s}</span>
        ));
    };

    // const { hotel, amenities, rooms, deals, reviewCount } = hotelDetails;
    const { hotel, rooms = [], deals = [], reviewCount } = hotelDetails;
    // const amenities = hotelDetails.amenities || [];
    // ameniety map without duplicates
    // const roomAmenities = amenities.filter((a, index, self) =>
    //     index === self.findIndex((am) => am.name === a.name)
    // );
    const ratings = hotelDetails.ratings || {};
    const roomAmenities = rooms
        .flatMap(r => r.amenities || [])
        .filter((a, index, self) =>
            index === self.findIndex(am => am.name === a.name)
        );
    const lowestPrice = rooms.length > 0
        ? Math.min(...rooms.map(r => Number(r.price_per_night)))
        : null;

    // const roomFilters = [
    //     { label: `All Rooms (${rooms.length})`, id: 'all' },
    //     {
    //         label: `Suites (${rooms.filter(r => r.room_type.includes('Suite')).length})`,
    //         id: 'suite'
    //     },
    //     {
    //         label: `Under $200 (${rooms.filter(r => Number(r.price_per_night) < 200).length})`,
    //         id: 'cheap'
    //     },
    // ];


    const handleSelectRooms = () => {
        document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' });
        setActiveTab('rooms');
    };

    const handleActiveReview = () => {
        document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
        setActiveTab('reviews');
    }

    const handleReserve = (room) => {
        navigate('/bookings/new', {
            state: {
                hotel,
                room,
                checkInDate,
                checkOutDate,
                nights,
                adults,
                children
            }
        });
    };

    return (
        <Fragment>
            <Navbar />
            <div className="ca-topbar">
                <div className="container-fluid px-4 ca-search-wrap">
                    <ResultSearchBar searchData={searchData} />
                </div>
            </div>

            <div className="ca-page">

                {/* ─── HOTEL HEADER ─── */}
                <div className="ca-header-section">
                    <div className="ca-header-top">
                        <div>
                            <div className="ca-star-row">
                                {/* {'★★'.split('').map((s, i) => (
                                    <span key={i} className="ca-star">{s}</span>
                                ))} */}
                                {renderStars(hotelDetails.ratings?.overall)}
                                {/* <span className="ca-opened-badge">Opened in 2025</span> */}
                            </div>
                            <h1 className="ca-hotel-name">{hotel.name}</h1>
                            <p className="ca-hotel-location">📍 {hotel.location}</p>
                        </div>

                        {lowestPrice && (
                            <div className="ca-header-price-box">
                                <span className="ca-header-original-price">US${Math.round(lowestPrice * 2)}</span>
                                <span className="ca-header-price">US${lowestPrice}</span>
                                <button className="ca-select-rooms-header-btn" onClick={handleSelectRooms}>
                                    Select Rooms
                                </button>
                                {/* <p className="ca-pricematch">💙 We Price Match</p> */}
                            </div>
                        )}
                    </div>

                    {/* Photo Grid */}
                    <div className="ca-photo-grid">
                        <div className="ca-main-photo">
                            {hotel.image_url
                                ? <img src={hotel.image_url} alt={hotel.name} className="ca-main-photo-img" />
                                : (
                                    <div className="ca-photo-placeholder">
                                        <span className="ca-hotel-emoji">🏨</span>
                                    </div>
                                )
                            }
                        </div>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="ca-thumb-photo">
                                <div className="ca-thumb-placeholder" />
                                {i === 4 && <div className="ca-see-all-overlay">📷 See All Photos</div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── HIGHLIGHTS + RATING ─── */}
                <div className="ca-mid-section">
                    <div className="ca-highlights-box">
                        <h3 className="ca-section-title">Family-friendly Highlights</h3>
                        <div className="ca-highlights-list">
                            {['Loved by families', 'Cafe', 'Free luggage storage', 'Newly opened', 'Scenic nightscapes'].map((h, i) => (
                                <div key={i} className="ca-highlight">
                                    <span className="ca-highlight-icon">
                                        {['👨‍👩‍👧', '☕', '🧳', '🆕', '🌃'][i]}
                                    </span>
                                    <span className="ca-highlight-label">{h}</span>
                                </div>
                            ))}
                        </div>

                        <h3 className="ca-section-title ca-mt-24">Amenities</h3>
                        <div className="ca-amenities-grid">
                            {roomAmenities.slice(0, 8).map((a, i) => (
                                <div key={i} className="ca-amenity-item">
                                    <span className="ca-amenity-dot" />
                                    <span className="ca-amenity-name">
                                        {a.name}
                                        {!a.is_chargeable && <span className="ca-free-tag"> Free</span>}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* <button className="ca-all-amenities-btn">All amenities</button> */}

                        <h3 className="ca-section-title ca-mt-24">Property Description</h3>
                        <p className="ca-description-text">
                            {hotel.description
                                ? hotel.description.slice(0, 200) + (hotel.description.length > 200 ? '...' : '')
                                : 'No description available.'}
                        </p>
                        {/* <button className="ca-show-more-btn">Show more</button> */}
                    </div>

                    {/* Rating + Surroundings */}
                    <div className="ca-right-panel">
                        <div className="ca-rating-box">
                            {/* <div className="ca-rating-score">
                                {hotel.overall_score || hotel.overall_rating || '8.8'}
                                <span className="ca-rating-max">/10</span>
                            </div> */}
                            <div className="ca-rating-score">
                                {hotelDetails.ratings.overall}
                                <span className="ca-rating-max">/5</span> {/* Matching your 5-point scale in JSON */}
                            </div>
                            <p className="ca-rating-desc">Read location, friendly front desk staff will check and then they can store your luggage</p>
                            <a href="#reviews" className="ca-review-link" onClick={() => handleActiveReview()}>
                                All {reviewCount || 0} reviews →
                            </a>
                        </div>

                        <div className="ca-surroundings-box">
                            <h4 className="ca-surroundings-title">📍 Surroundings</h4>
                            {hotelDetails.surroundings.map(({ name, description }, i) => (
                                <div key={i} className="ca-surround-row">
                                    <span className="ca-surround-name"><strong>{name}</strong></span>
                                    <span className="ca-surround-dist">{description}</span>
                                </div>
                            ))}
                            {/* <a href="#map" className="ca-view-map-link">View on map →</a> */}
                        </div>
                    </div>
                </div>

                {/* ─── DEALS BANNER ─── */}
                {/* {deals?.length > 0 && (
                    <div className="ca-deals-banner">
                        {deals.map((d, i) => (
                            <span key={i} className="ca-description-text">
                                🎉 <strong>{d.description} !</strong>
                            </span>
                        ))}
                        {deals.map((d, i) => (
                            <span key={i} className="ca-deal-chip">
                                Up to {d.discount_percentage}% OFF
                            </span>
                        ))}
                    </div>
                )} */}
                {deals?.length > 0 && (
                    <div className="ca-deals-banner"
                        style={{
                            paddingTop: 10,
                            paddingBottom: 10,
                            marginTop: 10,
                            marginBottom: 10
                        }}
                    >
                        {deals.map((d, i) => (
                            <Fragment key={i}>
                                <span className="ca-description-text">
                                    🎉 <strong>{d.deal_description}!</strong>
                                </span>
                                <span className="ca-deal-chip">
                                    {Math.round(d.discount_percentage)}% OFF
                                </span>
                            </Fragment>
                        ))}
                    </div>
                )}

                {/* ─── STICKY NAVBAR ─── */}
                {/* <div className="ca-sticky-nav-wrapper"
                    style={{
                        position: 'sticky',
                        top: '0px',                // Required: Sticky won't work without a top value
                        zIndex: 1100,              // Ensure it stays above room cards (which have z-index 100)
                        width: '100%',             // Ensure it spans the full viewport width
                    }}
                >

                    <div className="container-fluid px-4 sticky-nav-container"
                        style={{
                            paddingBottom: '12px',
                            // display: 'flex',
                            // justifyContent: 'center',
                            maxWidth: '1150px',
                            margin: '0 auto',
                        }}
                    >
                        <AvailabilityBar
                            tabs={TABS}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            price={lowestPrice}
                            onSelectRooms={handleSelectRooms}
                        />
                    </div>
                </div> */}
                {/* Sentinel must be OUTSIDE the sticky wrapper */}
                <div id="availability-bar-sentinel" style={{ height: 0 }} />

                {isSticky && <div style={{ height: '56px' }} />}
                {/* {console.log('Is sticky:', isSticky)} */}
                <AvailabilityBar
                    tabs={TABS}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    price={lowestPrice}
                    onSelectRooms={handleSelectRooms}
                    isSticky={isSticky}
                />

                {/* ─── ROOMS SECTION ─── */}
                {activeTab === 'rooms' && (
                    <div id="rooms-section" className="ca-rooms-section">

                        {/* <div className="ca-filter-row">
                            {roomFilters.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setActiveFilter(activeFilter === f.id ? null : f.id)}
                                    className={`ca-filter-chip ${activeFilter === f.id ? 'active' : ''}`}
                                >
                                    {f.icon && <span className="ca-chip-icon">{f.icon}</span>}
                                    {f.label}
                                </button>
                            ))}
                        </div> */}

                        {/* Room Cards */}
                        {rooms.length > 0 ? (
                            rooms.map((room) => (
                                <RoomCard
                                    key={room.room_id}
                                    room={room}
                                    amenities={room.amenities || []}
                                    onReserve={handleReserve}
                                />
                            ))
                        ) : (
                            <p className="ca-no-rooms">No rooms available at the moment.</p>
                        )}

                    </div>
                )}

                {/* {activeTab === 'reviews' && (
                    <div className="ca-reviews-container">
                        {hotelDetails.reviews?.length > 0 ? (
                            hotelDetails.reviews.map((r, i) => (
                                <div key={i} className="ca-review-card">
                                    <div className="ca-review-left">
                                        <div className="ca-reviewer-avatar">
                                            {r.reviewer_name.charAt(0)}
                                        </div>
                                        <div className="ca-reviewer-info">
                                            <span className="ca-reviewer-name">{r.reviewer_name}</span>
                                            <span className="ca-review-date">
                                                Reviewed on {new Date(r.review_date).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ca-review-right">
                                        <div className="ca-review-rating-badge">
                                            <span className="ca-rating-number">{Number(r.rating).toFixed(1)}</span>
                                            <span className="ca-rating-out-of">/ 5.0</span>
                                        </div>
                                        <p className="ca-review-comment">"{r.comment}"</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="ca-no-reviews">
                                <p>No reviews yet for this property.</p>
                            </div>
                        )}
                    </div>
                )} */}

                {activeTab === 'reviews' && (
                    /* Wrap in a container to align with other sections */
                    <div className="ca-container">
                        <div className="ca-reviews-layout">
                            {/* Left Side: Rating Summary */}
                            <div className="ca-ratings-summary-sidebar">
                                <div className="ca-summary-header">
                                    <span className="ca-big-score">{hotelDetails.ratings?.overall || '0.0'}</span>
                                    <div>
                                        {(() => {
                                            const overallScore = hotelDetails.ratings?.overall || 0;
                                            const rLabel = getRatingLabel(overallScore, 5);
                                            return (
                                                <div
                                                    className="ca-score-label"
                                                    style={{ color: rLabel.color, backgroundColor: rLabel.bg }}
                                                >
                                                    {rLabel.label}
                                                </div>
                                            );
                                        })()}
                                        <div className="ca-total-reviews">{reviewCount} reviews</div>
                                    </div>
                                </div>

                                <div className="ca-category-bars">
                                    {[
                                        { label: 'Cleanliness', key: 'cleanliness' },
                                        { label: 'Service', key: 'service' },
                                        { label: 'Location', key: 'location' }
                                    ].map((item) => (
                                        <div key={item.key} className="ca-bar-row">
                                            <div className="ca-bar-info">
                                                <span>{item.label}</span>
                                                <span>{ratings[item.key] ?? 0}</span>
                                            </div>
                                            <div className="ca-bar-bg">
                                                <div
                                                    className="ca-bar-fill"
                                                    style={{ width: `${((ratings[item.key]?? 0) / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Side: Review Cards */}
                            <div className="ca-reviews-list-side">
                                {hotelDetails.reviews?.length > 0 ? (
                                    hotelDetails.reviews.map((r, i) => (
                                        <div key={i} className="ca-review-card">
                                            <div className="ca-review-left">
                                                <div className="ca-reviewer-avatar">{r.reviewer_name.charAt(0)}</div>
                                                <div className="ca-reviewer-info">
                                                    <span className="ca-reviewer-name">{r.reviewer_name}</span>
                                                    <span className="ca-review-date">{new Date(r.review_date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="ca-review-right">
                                                <div className="ca-review-rating-top">
                                                    <div className="ca-review-rating-badge">
                                                        <span className="ca-rating-number">{Number(r.rating).toFixed(1)}</span>
                                                    </div>
                                                    {(() => {
                                                        const rLabel = getRatingLabel(r.rating, 5);
                                                        return (
                                                            <span
                                                                className="ca-review-score-label"
                                                                style={{ color: rLabel.color, backgroundColor: rLabel.bg }}
                                                            >
                                                                {rLabel.label}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                                <p className="ca-review-comment">"{r.comment}"</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No reviews yet for this property.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── AMENITIES TAB ─── */}
                {activeTab === 'amenities' && (
                    <div className="ca-tab-content">
                        <h3 className="ca-tab-title">Services & Amenities</h3>
                        <div className="ca-amenities-grid">
                            {roomAmenities.map((a, i) => (
                                <div key={i} className="ca-amenity-item">
                                    <span className="ca-amenity-dot" />
                                    <span className="ca-amenity-name">
                                        {a.name}
                                        {a.is_chargeable
                                            ? <span className="ca-paid-tag"> (Paid)</span>
                                            : <span className="ca-free-tag"> Free</span>
                                        }
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── POLICIES TAB ─── */}
                {activeTab === 'policies' && (
                    <div className="ca-tab-content">
                        <h3 className="ca-tab-title">Property Policies</h3>

                        <div className="ca-policies-grid">
                            {/* Cancellation Card */}
                            <div className="ca-policy-card">
                                <div className="ca-policy-header">
                                    <span className="ca-policy-icon">📅</span>
                                    <h4>Cancellation</h4>
                                </div>
                                <div className="ca-policy-body">
                                    <p className="ca-policy-text">
                                        {hotel.cancellation_policy || 'Standard cancellation rules apply.'}
                                    </p>
                                </div>
                            </div>

                            {/* Refund Card */}
                            <div className="ca-policy-card">
                                <div className="ca-policy-header">
                                    <span className="ca-policy-icon">💰</span>
                                    <h4>Refund</h4>
                                </div>
                                <div className="ca-policy-body">
                                    <p className="ca-policy-text">
                                        {hotel.refund_policy || 'Contact the property for refund details.'}
                                    </p>
                                </div>
                            </div>



                            {/* Important Info Card */}
                            <div className="ca-policy-card ca-full-width">
                                <div className="ca-policy-header">
                                    <span className="ca-policy-icon">📝</span>
                                    <h4>Special Requests</h4>
                                </div>
                                <div className="ca-policy-body">
                                    <p className="ca-policy-text small">
                                        Special requests are subject to availability and cannot be guaranteed.
                                        The property may charge additional fees for certain services or late check-outs.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Fragment >
    );
};

export default CheckAvailability;
