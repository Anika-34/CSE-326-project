import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/BookingPage.css';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const {
    hotel,
    room,
    checkInDate,
    checkOutDate,
    nights = 1,
    adults = 2,
    children = 0
  } = state;

  const apiBaseUrl = process.env.REACT_APP_API_URL || '';

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    special_requests: '',
    promo_code: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!hotel || !room) {
      navigate('/hotels/search');
    }
  }, [hotel, room, navigate]);

  const totalGuests = useMemo(() => adults + children, [adults, children]);
  const totalPrice = useMemo(() => {
    const price = Number(room?.price_per_night || 0);
    return price * Math.max(1, nights);
  }, [room, nights]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone_number) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${apiBaseUrl}/v1/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: localStorage.getItem('userId'),
          room_id: room.room_id,
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          guests: totalGuests,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: formData.phone_number,
          special_requests: formData.special_requests || null,
          promo_code: formData.promo_code || null
        })
      });

      const contentType = response.headers.get('content-type') || '';
      const body = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Room not available for the selected dates. Please choose another room.');
        }
        const message = typeof body === 'string' ? body : body?.message || body?.error || `HTTP ${response.status}`;
        throw new Error(message);
      }

      navigate('/payment', {
        state: {
          hotel,
          room,
          checkInDate,
          checkOutDate,
          nights,
          adults,
          children,
          totalPrice,
          travelerName: `${formData.first_name} ${formData.last_name}`.trim(),
          bookingResponse: body
        }
      });
    } catch (err) {
      setErrorMessage(err.message || 'Unable to create booking right now.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!hotel || !room) {
    return null;
  }

  return (
    <div className="booking-shell">
      <Navbar />
      <div className="booking-container">
        <div className="booking-header">
          <div>
            <h1>Confirm your booking</h1>
            <p>Enter traveler details and proceed to pay.</p>
          </div>
          <div className="booking-steps">
            <span className="booking-step active">1</span>
            <span className="booking-step">2</span>
            <span className="booking-step">3</span>
          </div>
        </div>

        <div className="booking-grid">
          <section className="booking-main">
            <div className="booking-card">
              <h2>Who's staying?</h2>
              <form className="booking-form" onSubmit={handleSubmit}>
                <div className="booking-row">
                  <div className="booking-field">
                    <label>First name *</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => updateField('first_name', e.target.value)}
                    />
                  </div>
                  <div className="booking-field">
                    <label>Last name *</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => updateField('last_name', e.target.value)}
                    />
                  </div>
                </div>

                <div className="booking-row">
                  <div className="booking-field">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                    />
                  </div>
                  <div className="booking-field">
                    <label>Phone number *</label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => updateField('phone_number', e.target.value)}
                    />
                  </div>
                </div>

                <div className="booking-field">
                  <label>Special requests (optional)</label>
                  <textarea
                    rows="4"
                    value={formData.special_requests}
                    onChange={(e) => updateField('special_requests', e.target.value)}
                    placeholder="Let us know if you have any special requests."
                  />
                </div>

                <div className="booking-field">
                  <label>Promo code (optional)</label>
                  <input
                    type="text"
                    value={formData.promo_code}
                    onChange={(e) => updateField('promo_code', e.target.value)}
                    placeholder="e.g. WELCOME10"
                  />
                </div>

                {errorMessage && <div className="booking-error">{errorMessage}</div>}

                <button type="submit" className="booking-cta" disabled={submitting}>
                  {submitting ? 'Creating reservation...' : 'Proceed to Pay'}
                </button>
              </form>
            </div>

            <div className="booking-card">
              <h2>Special requests</h2>
              <p>
                Special requests are subject to availability. Additional fees may apply and requests cannot be guaranteed.
              </p>
            </div>
          </section>

          <aside className="booking-summary">
            <div className="summary-card">
              <h3>Booking summary</h3>
              <p className="summary-hotel">{hotel.name}</p>
              <div className="summary-row">
                <span>Room</span>
                <strong>{room.room_type}</strong>
              </div>
              <div className="summary-row">
                <span>Check-in</span>
                <strong>{formatDate(checkInDate)}</strong>
              </div>
              <div className="summary-row">
                <span>Check-out</span>
                <strong>{formatDate(checkOutDate)}</strong>
              </div>
              <div className="summary-row">
                <span>Guests</span>
                <strong>{totalGuests}</strong>
              </div>
              <div className="summary-row">
                <span>Nights</span>
                <strong>{Math.max(1, nights)}</strong>
              </div>
              <div className="summary-total">
                <span>Total (est.)</span>
                <strong>US${totalPrice.toFixed(2)}</strong>
              </div>
            </div>

            <div className="summary-card">
              <h3>Cancellation</h3>
              <p>
                Free cancellation policies apply based on the hotel rules. Review details before proceeding.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
