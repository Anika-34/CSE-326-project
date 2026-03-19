const RoomCard = ({ room, amenities, onReserve }) => {
  // const [expanded, setExpanded] = useState(false);
  const roomAmenities = amenities.filter(a => a.room_id === room.room_id);

  const discountedPrice = Number(room.price_per_night);
  const originalPrice = Math.round(discountedPrice * 1.2);
  const discountPct = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  const totalWithFees = (discountedPrice).toFixed(0);


  return (
    <div style={styles.card}>
      {/* Room Title */}
      <h5 style={styles.roomTitle}>{room.room_type}</h5>

      <div style={styles.cardBody}>
        {/* Left: Image + Features */}
        <div style={styles.leftCol}>
          <div style={styles.imageWrapper}>
            {room.image_url ? (
              <img src={room.image_url} alt={room.room_type} style={styles.roomImage} />
            ) : (
              <div style={styles.imagePlaceholder}>
                <span style={styles.placeholderIcon}>🛏</span>
              </div>
            )}
            <span style={styles.photoCount}>📷 5</span>
          </div>

          <div style={styles.features}>
            {/* <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🛏</span>
              <span>{room.capacity === 1 ? '1 single bed' : `${room.capacity} beds`}</span>
            </div> */}
            {/* <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🚫</span>
              <span>No windows</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🚭</span>
              <span>Non-smoking</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>📐</span>
              <span>6–8m² | Floor: 3</span>
            </div>
            <div style={styles.featureItem}>
              <span style={{ color: '#0071c2' }}>📶</span>
              <span style={{ color: '#0071c2' }}>Free Wi-Fi</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>❄️</span>
              <span>Air conditioning</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🚿</span>
              <span>Private bathroom</span>
            </div> */}
            <div style={styles.features}>
              {/* <div style={styles.featureItem}>
                <span style={styles.featureIcon}>👤</span>
                <span>Sleeps {room.capacity}</span>
              </div> */}

              {/* Map actual amenities from database */}
              {roomAmenities.map((amenity) => (
                <div key={amenity.amenity_id} style={styles.featureItem}>
                  <span style={styles.featureIcon}>•</span>
                  <span>{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* <button
            onClick={() => setExpanded(!expanded)}
            style={styles.detailsBtn}
          >
            Room Details
          </button> */}

          
            {/* // <div style={styles.expandedDetails}>
            //   <p style={styles.expandedText}>Room ID: {room.room_id}</p>
            //   <p style={styles.expandedText}>Capacity: {room.capacity} guest(s)</p>
            // </div> */}
            {/* <div style={styles.sleepsCol}>
              <p style={styles.colHeader}>Sleeps</p>
              <div style={styles.guestIcons}>
                {Array.from({ length: room.capacity }).map((_, i) => (
                  <span key={i} style={styles.guestIcon}>👤</span>
                ))}
              </div>
            </div> */}
          
        </div>

        {/* Middle: Your Choices */}
        <div style={styles.middleCol}>
          <p style={styles.colHeader}>Your Choices</p>
          <div style={styles.bestPriceBadge}>Today's best price!</div>
          <div style={styles.choiceItem}>
            <span style={{ color: '#0071c2', fontWeight: 600 }}>⚡ Instant confirmation</span>
            <span style={styles.infoIcon}>ⓘ</span>
          </div>
          <div style={styles.choiceItem}>
            <span>💳 Prepay online</span>
          </div>
        </div>

        {/* Sleeps */}
        <div style={styles.sleepsCol}>
          <p style={styles.colHeader}>Sleeps</p>
          <div style={styles.guestIcons}>
            {Array.from({ length: room.capacity }).map((_, i) => (
              <span key={i} style={styles.guestIcon}>👤</span>
            ))}
          </div>
        </div>

        {/* Right: Price */}
        <div style={styles.priceCol}>
          <p style={styles.colHeader}>Today's Price</p>

          <div style={styles.dealBadgeRow}>
            <span style={styles.dealLabel}>First Booking Deal</span>
            <span style={styles.discountBadge}>{discountPct}% off</span>
          </div>
{/* TODO count ta fix kora baki */}
          <div style={styles.lastRooms}>Our last 2!</div>

          <div style={styles.priceRow}>
            <span style={styles.originalPrice}>US${originalPrice}</span>
            <span style={styles.currentPrice}>US${discountedPrice}</span>
          </div>

          <p style={styles.totalFees}>Total (incl. taxes & fees): US${totalWithFees}</p>

          <button
            style={styles.reserveBtn}
            onClick={() => onReserve && onReserve(room)}
          >
            Reserve
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    marginBottom: '24px',
    overflow: 'hidden',
    fontFamily: "'BlinkMacSystemFont', 'Segoe UI', sans-serif",
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    backgroundColor: '#fff',
  },
  roomTitle: {
    margin: 0,
    padding: '14px 16px',
    fontSize: '16px',
    fontWeight: 700,
    color: '#1a1a2e',
    borderBottom: '1px solid #f0f0f0',
  },
  cardBody: {
    display: 'flex',
    gap: '0',
  },
  leftCol: {
    width: '200px',
    minWidth: '200px',
    padding: '16px',
    borderRight: '1px solid #f0f0f0',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: '12px',
  },
  roomImage: {
    width: '100%',
    height: '130px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  imagePlaceholder: {
    width: '100%',
    height: '130px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: '32px',
  },
  photoCount: {
    position: 'absolute',
    bottom: '6px',
    right: '6px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#444',
  },
  featureIcon: {
    fontSize: '13px',
  },
  detailsBtn: {
    marginTop: '12px',
    background: 'none',
    border: 'none',
    color: '#0071c2',
    cursor: 'pointer',
    padding: 0,
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'underline',
  },
  expandedDetails: {
    marginTop: '8px',
    padding: '8px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#555',
  },
  expandedText: {
    margin: '2px 0',
  },
  middleCol: {
    flex: 1,
    padding: '16px',
    borderRight: '1px solid #f0f0f0',
  },
  sleepsCol: {
    width: '100px',
    padding: '16px',
    borderRight: '1px solid #f0f0f0',
    textAlign: 'center',
  },
  priceCol: {
    width: '200px',
    minWidth: '200px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  colHeader: {
    margin: '0 0 10px 0',
    fontSize: '13px',
    fontWeight: 700,
    color: '#333',
  },
  bestPriceBadge: {
    display: 'inline-block',
    backgroundColor: '#e8192c',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '4px',
    marginBottom: '10px',
  },
  choiceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    marginBottom: '6px',
    color: '#333',
  },
  infoIcon: {
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '14px',
  },
  guestIcons: {
    display: 'flex',
    gap: '2px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: '4px',
  },
  guestIcon: {
    fontSize: '16px',
  },
  dealBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
  },
  dealLabel: {
    fontSize: '12px',
    color: '#e8192c',
    fontWeight: 600,
  },
  discountBadge: {
    backgroundColor: '#e8192c',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '4px',
  },
  lastRooms: {
    fontSize: '12px',
    color: '#e8192c',
    fontWeight: 700,
    marginBottom: '6px',
    textAlign: 'right',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },
  originalPrice: {
    fontSize: '13px',
    color: '#999',
    textDecoration: 'line-through',
  },
  currentPrice: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1a1a2e',
  },
  totalFees: {
    fontSize: '11px',
    color: '#666',
    margin: '4px 0 12px 0',
    textAlign: 'right',
  },
  reserveBtn: {
    backgroundColor: '#0071c2',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    width: '100%',
    transition: 'background 0.2s',
  },
};

export default RoomCard;
