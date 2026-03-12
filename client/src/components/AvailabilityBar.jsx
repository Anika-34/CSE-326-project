import React from 'react';

const AvailabilityBar = ({ tabs = [], activeTab, onTabChange, price, onSelectRooms, isSticky }) => {
  // const AvailabilityBar = ({ tabs = [], activeTab, onTabChange, price, onSelectRooms }) => {
  const defaultTabs = [
    { label: 'Rooms', id: 'rooms' },
    { label: 'Guest Reviews', id: 'reviews' },
    { label: 'Services & Amenities', id: 'amenities' },
    { label: 'Policies', id: 'policies' },
  ];

  const displayTabs = tabs.length > 0 ? tabs : defaultTabs;

  return (
    <nav style={{
    ...styles.navbar,
    position: isSticky ? 'fixed' : 'relative',
    top: 0,
    left: isSticky ? '50%' : 'auto',
    transform: isSticky ? 'translateX(-50%)' : 'none',
    width: '100%',
    maxWidth: '1100px',
    zIndex: 1100,
    margin: isSticky ? '0' : '0 auto',
}}>
      <div style={styles.tabsRow}>
        <div style={styles.tabs}>
          {displayTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange && onTabChange(tab.id)}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.activeTab : {}),
              }}
            >
              {tab.label}
              {activeTab === tab.id && <span style={styles.activeUnderline} />}
            </button>
          ))}
        </div>

        {price !== undefined && (
          <div style={styles.priceArea}>
            <span style={styles.originalNavPrice}>
              US${Math.round(price * 2)}
            </span>
            <span style={styles.navPrice}>US${price}</span>
            <button
              style={styles.selectRoomsBtn}
              onClick={onSelectRooms}
            >
              Select Rooms
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: '#fff',
    borderBottom: '2px solid #e0e0e0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    fontFamily: "'BlinkMacSystemFont', 'Segoe UI', sans-serif",
  },
  tabsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '1100px',  // match this to your ca-rooms-section maxWidth
    margin: '0 auto',
    padding: '0 16px',
    width: '100%',       // 👈 add this
  },
  tabs: {
    display: 'flex',
    gap: '0',
  },
  tab: {
    position: 'relative',
    background: 'none',
    border: 'none',
    padding: '14px 18px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#555',
    cursor: 'pointer',
    transition: 'color 0.15s',
    whiteSpace: 'nowrap',
  },
  activeTab: {
    color: '#0071c2',
    borderBottom: '3px solid #0071c2',
  },
  activeUnderline: {
    display: 'none', // handled via borderBottom on activeTab
  },
  priceArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  originalNavPrice: {
    fontSize: '13px',
    color: '#999',
    textDecoration: 'line-through',
  },
  navPrice: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1a1a2e',
  },
  selectRoomsBtn: {
    backgroundColor: '#0071c2',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '9px 18px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginLeft: '4px',
  },
};

export default AvailabilityBar;
