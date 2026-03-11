import React from 'react';
import { Heart, MapPin, Users, Bed, ChevronRight } from 'lucide-react';
import '../styles/HotelCard.css';
import { useNavigate } from 'react-router-dom';


const HotelCard = ({ hotel, searchDetails }) => {
  // Destructuring for cleaner code
  const {
    id,
    name,
    stars,
    rating,
    ratingText,
    reviewCount,
    image,
    location,
    roomType,
    oldPrice,
    currentPrice,
    totalPrice,
    tags
  } = hotel;

  //   const baseUrl = process.env.REACT_APP_API_URL || '';
  const navigate = useNavigate();
  const checkAvailability = (hotel_id) => {
    navigate(`/hotels/details/${hotel_id}`,
      {
        state: {
          location: location,
          checkInDate: searchDetails.checkInDate,
          checkOutDate: searchDetails.checkOutDate,
          nights: searchDetails.nights,
          room: searchDetails.room,
          adults: searchDetails.adults,
          children: searchDetails.children
        }
      });
  }

  return (
    <div className="hotel-card">
      <div className="card-image-wrapper">
        <img src={image} alt={name} />
        <button className="wishlist-btn"><Heart size={18} /></button>
      </div>

      <div className="card-content">
        <div className="card-header">
          <h2 className="hotel-name">
            {name}
            <span className="stars">

              {Array(Number(stars) || 0).fill('⭐').join('')}
            </span>
          </h2>

          <div className="rating-row">
            <span className="rating-badge">{rating || 'N/A'}</span>
            <span className="rating-text">{ratingText}</span>
            <span className="review-count">

              {reviewCount?.toLocaleString() ?? 0} reviews
            </span>
          </div>

          <div className="location-row">
            <MapPin size={14} />
            <span>{location} • </span>
            {/* <button className="map-link-btn">Show on Map</button> */}
          </div>
        </div>

        <div className="room-details-box">
          <div className="room-info">
            <div className="room-type">
              {roomType} <span className="room-icons"><Users size={14} /> {hotel.capacity}<span style={{}}>
              </span><Bed size={14} /></span>
            </div>
            <div className="perks">
              {hotel.cancellationPolicy && (
                <span className="free-cancel">
                  {hotel.cancellationPolicy}
                </span>
              )}
            </div>
          </div>

          <div className="price-section">
            <div className="deals" style={{
              margin: "3px", padding: '5px'
            }}>
              {tags.map((tag, index) => (
                <span key={index} className={`deal-tag ${tag.type}`} style={{
                  color: "red", backgroundColor: "#ffe6e6", padding: "2px 6px", borderRadius: "4px", fontSize: "0.8rem", marginRight: "5px"
                }}>{tag.type}</span>
              ))}
              {tags.map((tag, index) => (
                <span key={index} className={`deal-tag ${tag.type}`} style={{
                  color: "white", fontWeight: "bold", fontSize: "0.8rem", padding: "2px 6px", backgroundColor: "#ff4d4d", borderRadius: "4px"
                }}>{tag.label}</span>
              ))}
            </div>
            <div className="price-display">
              {
                oldPrice > currentPrice && (
                  <span className="old-price">US${oldPrice}</span>
                )
              }
              <span className="current-price">US${currentPrice}</span>
            </div>
            <div className="tax-info">Total: US${totalPrice}</div>
            <button className="check-btn" onClick={() => checkAvailability(id)}>Check Availability <ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
