import React from "react";
import {
    ArrowRight,
    Heart,
    MapPin,
    Wifi,
    Waves,
    Coffee,
    BriefcaseMedical,
    User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ResultSearchBar from "./ResultSearchBar";
import "../styles/HomePage.css";

const recentlyViewedHotels = [
    {
        id: 1,
        name: "Viewplace hotel & Residence",
        location: "Maafushi, Maldives",
        score: "8.8",
        rating: "Good",
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: 2,
        name: "Modern City Hotel",
        location: "Newyork, USA",
        score: "8.1",
        rating: "Good",
        image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: 3,
        name: "Onayaa Bali Resort",
        location: "Bali, Indonesia",
        score: "9.3",
        rating: "Very Good",
        image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: 4,
        name: "Alberte Hotel",
        location: "Paris, France",
        score: "7.8",
        rating: "Moderate",
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80",
    },
];

const destinations = [
    {
        id: 1,
        city: "Paris",
        country: "France",
        properties: "1200 properties",
        badge: "20% off",
        trending: true,
        image: "https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: 2,
        city: "London",
        country: "UK",
        properties: "1200 properties",
        trending: true,
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: 3,
        city: "Milan",
        country: "Italy",
        properties: "800 properties",
        badge: "15% off",
        image: "https://images.unsplash.com/photo-1533676802871-eca1ae998cd5?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: 4,
        city: "Venice",
        country: "Italy",
        properties: "1200 properties",
        trending: true,
        image: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: 5,
        city: "Tokyo",
        country: "Japan",
        properties: "1200 properties",
        image: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=900&q=80",
    },
];

const italianHotels = [
    {
        id: 11,
        tag: "Sea side",
        name: "Grand Canal Boutique Hotel",
        location: "Venice, Italy",
        nearby: "0.3 km from st.mark square",
        score: "8.8",
        rating: "Good",
        image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: 12,
        tag: "Best value",
        name: "Roma Imperial Suites",
        location: "Roma, Italy",
        nearby: "0.5 km from Colosseum",
        score: "8.8",
        rating: "Good",
        image: "https://images.unsplash.com/photo-1529154036614-a60975f5c760?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: 13,
        tag: "Sea side",
        name: "Tuscany Villa Resort",
        location: "Florence, Italy",
        nearby: "1.2 km from Duomo Cathedral",
        score: "8.8",
        rating: "Good",
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: 14,
        tag: "Great Location",
        name: "Italian Riviera Hotel",
        location: "Cinque Terre, Italy",
        nearby: "0.3 km from Vernazza Harbor",
        score: "8.8",
        rating: "Good",
        image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80",
    },
];

const HomePage = () => {
    const navigate = useNavigate();
    const isLoggedIn = Boolean(localStorage.getItem("authToken") || localStorage.getItem("userId"));

    return (
        <main className="home-v2">
            <section className="hero-banner">
                <header className="hero-topbar">
                    <div className="trip-logo">
                        Trip<span>.</span>com
                    </div>
                    <div className="topbar-right">
                        <button className="ghost-chip">BDT | English</button>
                        {isLoggedIn ? (
                            <button
                                className="profile-chip"
                                type="button"
                                aria-label="Open profile"
                                title="Profile"
                            >
                                <User size={20} />
                            </button>
                        ) : (
                            <button className="primary-chip" onClick={() => navigate('/login')}>Sign in</button>
                        )}
                    </div>
                </header>

                <div className="hero-glass-card">
                    <h4>Every check-in is a new beginning</h4>
                    <div className="hero-badges">
                        <span>We price match</span>
                        <span>Hotel booking guarantee</span>
                        <span>Hotel stay guarantee</span>
                    </div>

                    <ResultSearchBar />
                </div>
            </section>

            <section className="home-section">
                <div className="section-head">
                    <div>
                        <h2>Here&apos;s where you left off</h2>
                        <p>Your recently viewed hotels</p>
                    </div>
                    <button type="button" className="explore-link">
                        Explore all <ArrowRight size={28} />
                    </button>
                </div>

                <div className="card-grid four-up">
                    {recentlyViewedHotels.map((hotel) => (
                        <article key={hotel.id} className="hotel-card-v2">
                            <div className="image-wrap">
                                <img src={hotel.image} alt={hotel.name} />
                                <button type="button" className="wishlist-floating">
                                    <Heart size={20} />
                                </button>
                            </div>
                            <div className="card-body-v2">
                                <h3>{hotel.name}</h3>
                                <p className="location-row-v2"><MapPin size={16} /> {hotel.location}</p>
                                <div className="amenities-row">
                                    <Wifi size={16} />
                                    <Waves size={16} />
                                    <Coffee size={16} />
                                    <span>+2 more</span>
                                </div>
                                <div className="rating-row-v2">
                                    <span className="score-pill">{hotel.score} / 10</span>
                                    <div>
                                        <strong>{hotel.rating}</strong>
                                        <p>12,188 reviews</p>
                                    </div>
                                </div>
                                <div className="price-book-row">
                                    <p>From <b>$1350</b> / night</p>
                                    <button type="button">Book</button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="home-section">
                <div className="section-head narrow">
                    <div>
                        <h2>Popular Destinations</h2>
                        <p>Explore the most sought-after travel destinations</p>
                    </div>
                </div>

                <div className="card-grid five-up">
                    {destinations.map((city) => (
                        <article key={city.id} className="destination-card">
                            <img src={city.image} alt={city.city} />
                            <div className="gradient-overlay" />
                            <div className="destination-tags">
                                {city.badge && <span className="sale-badge">{city.badge}</span>}
                                {city.trending && <span className="trend-badge">Trending</span>}
                            </div>
                            <div className="destination-info">
                                <h3>{city.city}</h3>
                                <p>{city.country}</p>
                                <div className="destination-footer">
                                    <span>{city.properties}</span>
                                    <button type="button" aria-label={`Go to ${city.city}`}>
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="home-section">
                <div className="section-head">
                    <div>
                        <h2>Popular Hotels in Italy</h2>
                        <p>Discover romantic getaways in Venice, historic stays in Rome, and charming villas in Tuscany</p>
                    </div>
                    <button type="button" className="explore-link">
                        Explore all <ArrowRight size={28} />
                    </button>
                </div>

                <div className="card-grid four-up">
                    {italianHotels.map((hotel) => (
                        <article key={hotel.id} className="hotel-card-v2">
                            <div className="image-wrap">
                                <img src={hotel.image} alt={hotel.name} />
                                <span className="property-tag">{hotel.tag}</span>
                                <button type="button" className="wishlist-floating">
                                    <Heart size={20} />
                                </button>
                                <button type="button" className="map-btn">
                                    <MapPin size={16} /> Map
                                </button>
                            </div>
                            <div className="card-body-v2">
                                <h3>{hotel.name}</h3>
                                <p className="location-row-v2"><MapPin size={16} /> {hotel.location}</p>
                                <p className="nearby-pill">{hotel.nearby}</p>
                                <div className="amenities-row">
                                    <Wifi size={16} />
                                    <Waves size={16} />
                                    <BriefcaseMedical size={16} />
                                    <span>+2 more</span>
                                </div>
                                <div className="rating-row-v2">
                                    <span className="score-pill">{hotel.score} / 10</span>
                                    <div>
                                        <strong>{hotel.rating}</strong>
                                        <p>12,188 reviews</p>
                                    </div>
                                </div>
                                <div className="price-book-row">
                                    <p>From <b>$350</b> / night</p>
                                    <button type="button">Book</button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <footer className="homepage-footer">
                <div className="newsletter-box">
                    <h2>Subscribe to our newsletter</h2>
                    <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                        <input type="text" placeholder="First name" />
                        <input type="email" placeholder="Email address" />
                        <button type="submit">Subscribe Now</button>
                    </form>
                </div>

                <div className="footer-columns">
                    <div>
                        <div className="trip-logo big">
                            Trip<span>.</span>com
                        </div>
                        <p>A Convenient Hotel Booking Site</p>
                    </div>

                    <div>
                        <h4>COMPANY</h4>
                        <a href="/">About</a>
                        <a href="/">Features</a>
                        <a href="/">Works</a>
                        <a href="/">Career</a>
                    </div>

                    <div>
                        <h4>HELP</h4>
                        <a href="/">Customer Support</a>
                        <a href="/">Delivery Details</a>
                        <a href="/">Terms & Conditions</a>
                        <a href="/">Privacy Policy</a>
                    </div>

                    <div>
                        <h4>RESOURCES</h4>
                        <a href="/">Free eBooks</a>
                        <a href="/">Development Tutorial</a>
                        <a href="/">How to - Blog</a>
                        <a href="/">Youtube Playlist</a>
                    </div>
                </div>
            </footer>
        </main>
    );
};

export default HomePage;