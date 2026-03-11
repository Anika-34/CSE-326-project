import React from 'react';
import { 
  Hotel, Plane, Train, Car, Tent, Briefcase, 
  Map, Tag, Gift, Smartphone, Lightbulb, MapPin 
} from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = ({ isExpanded }) => {
  const menuItems = [
    { icon: <Hotel size={20} />, label: "Hotels & Homes" },
    { icon: <Plane size={20} />, label: "Flights" },
    { icon: <Train size={20} />, label: "Trains" },
    { icon: <Car size={20} />, label: "Cars" },
    { icon: <Briefcase size={20} />, label: "Attractions & Tours" },
    { icon: <Tent size={20} />, label: "Flight + Hotel", divider: true },
    { icon: <Briefcase size={20} />, label: "Private Tours" },
    { icon: <Map size={20} />, label: "Group Tours", divider: true },
    { icon: <MapPin size={20} />, label: "Trip.Planner", badge: "New" },
    { icon: <Lightbulb size={20} />, label: "Travel Inspiration" },
    { icon: <Map size={20} />, label: "Map" },
    { icon: <Tag size={20} />, label: "Deals", divider: true },
  ];

  return (
    <aside className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <ul className="menu-list">
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            <li className="menu-item">
              <span className="icon">{item.icon}</span>
              {isExpanded && (
                <span className="label">
                  {item.label}
                  {item.badge && <span className="badge">{item.badge}</span>}
                </span>
              )}
            </li>
            {item.divider && <hr className="sidebar-divider" />}
          </React.Fragment>
        ))}
        
        {/* Bottom items */}
        <li className="menu-item">
          <span className="icon"><Gift size={20} /></span>
          {isExpanded && <span className="label">Trip.com Rewards</span>}
        </li>
        <li className="menu-item">
          <span className="icon"><Smartphone size={20} /></span>
          {isExpanded && <span className="label">App</span>}
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;