import { useEffect, useMemo, useState , useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/BookingHistory.css';
import { USER_ID_KEY } from '../services/authStorage';
import { apiFetch } from '../services/apiFetch';

const STATUS_META = {
  INITIATED: { label: 'Initiated', tone: 'initiated' },
  PAYMENT_PENDING: { label: 'Payment pending', tone: 'pending' },
  CONFIRMED: { label: 'Confirmed', tone: 'confirmed' },
  CANCELLED: { label: 'Cancelled', tone: 'cancelled' },
  REFUNDED: { label: 'Refunded', tone: 'refunded' },
  EXPIRED: { label: 'Expired', tone: 'expired' },
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const BookingHistory = () => {
  const navigate = useNavigate();
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';
  const userId = localStorage.getItem(USER_ID_KEY);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionId, setActionId] = useState(null);

  const canCancelStatuses = useMemo(
    () => new Set(['INITIATED', 'PAYMENT_PENDING', 'CONFIRMED']),
    []
  );

  const loadBookings = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await apiFetch(`${apiBaseUrl}/v1/bookings?user_id=${encodeURIComponent(userId)}`);
      const contentType = response.headers.get('content-type') || '';
      const body = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message = typeof body === 'string' ? body : body?.message || body?.error || `HTTP ${response.status}`;
        throw new Error(message);
      }

      setBookings(Array.isArray(body) ? body : []);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to load bookings right now.');
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, userId]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancel = async (bookingId) => {
    if (!userId) {
      setErrorMessage('Please sign in to cancel a booking.');
      return;
    }

    const confirmed = window.confirm('Cancel this booking? Refund eligibility depends on the policy.');
    if (!confirmed) return;

    setActionId(bookingId);
    setErrorMessage('');

    try {
      const response = await apiFetch(`${apiBaseUrl}/v1/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: Number(userId) }),
      });

      const contentType = response.headers.get('content-type') || '';
      const body = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message = typeof body === 'string' ? body : body?.message || body?.error || `HTTP ${response.status}`;
        throw new Error(message);
      }

      setBookings((prev) =>
        prev.map((booking) =>
          booking.booking_id === String(bookingId)
            ? {
                ...booking,
                status: body.status || booking.status,
                refund_status: body.refund_status || booking.refund_status,
                refund_amount: Number(body.refund_amount ?? booking.refund_amount ?? 0),
                cancelled_at: body.cancelled_at || booking.cancelled_at,
              }
            : booking
        )
      );
    } catch (err) {
      setErrorMessage(err.message || 'Unable to cancel booking.');
    } finally {
      setActionId(null);
    }
  };

  const bookingCountLabel = bookings.length === 1 ? '1 booking' : `${bookings.length} bookings`;

  return (
    <div className="booking-history-page">
      <Navbar />
      <div className="booking-history-hero">
        <div className="booking-history-hero__content">
          <p className="booking-history-hero__eyebrow">Your trip ledger</p>
          <h1>Booking history</h1>
          <p className="booking-history-hero__subhead">
            Track upcoming stays, verify refund eligibility, and manage cancellations in one place.
          </p>
        </div>
        <div className="booking-history-hero__accent" aria-hidden="true">
          <div className="booking-history-hero__ring" />
          <div className="booking-history-hero__spark" />
        </div>
      </div>

      <div className="booking-history-shell">
        <div className="booking-history-toolbar">
          <div>
            <h2>Your bookings</h2>
            <p>{bookingCountLabel}</p>
          </div>
          <div className="booking-history-actions">
            <button type="button" className="booking-history-btn ghost" onClick={loadBookings}>
              Refresh
            </button>
            <button
              type="button"
              className="booking-history-btn solid"
              onClick={() => navigate('/hotels/search')}
            >
              Find a stay
            </button>
          </div>
        </div>

        {!userId && (
          <div className="booking-history-empty">
            <h3>Sign in to view your trips</h3>
            <p>Log in to see your confirmed and upcoming bookings.</p>
            <button type="button" className="booking-history-btn solid" onClick={() => navigate('/login')}>
              Go to sign in
            </button>
          </div>
        )}

        {userId && loading && (
          <div className="booking-history-loading">
            <div className="booking-history-spinner" />
            <p>Loading your bookings...</p>
          </div>
        )}

        {userId && !loading && errorMessage && (
          <div className="booking-history-error">
            <span>{errorMessage}</span>
          </div>
        )}

        {userId && !loading && !errorMessage && bookings.length === 0 && (
          <div className="booking-history-empty">
            <h3>No bookings yet</h3>
            <p>Your reservations will show up here once you book a stay.</p>
            <button type="button" className="booking-history-btn solid" onClick={() => navigate('/hotels/search')}>
              Start exploring
            </button>
          </div>
        )}

        {userId && !loading && bookings.length > 0 && (
          <div className="booking-history-grid">
            {bookings.map((booking) => {
              const statusMeta = STATUS_META[booking.status] || { label: booking.status, tone: 'pending' };
              const canCancel = canCancelStatuses.has(booking.status);
              return (
                <article key={booking.booking_id} className="booking-history-card">
                  <header className="booking-history-card__header">
                    <div>
                      <p className="booking-history-card__hotel">{booking.hotel_name}</p>
                      <p className="booking-history-card__location">{booking.location || 'Location hidden'}</p>
                    </div>
                    <span className={`booking-status ${statusMeta.tone}`}>{statusMeta.label}</span>
                  </header>

                  <div className="booking-history-card__details">
                    <div>
                      <span className="booking-history-card__label">Room</span>
                      <p>{booking.room_type}</p>
                    </div>
                    <div>
                      <span className="booking-history-card__label">Check-in</span>
                      <p>{formatDate(booking.check_in_date)}</p>
                    </div>
                    <div>
                      <span className="booking-history-card__label">Check-out</span>
                      <p>{formatDate(booking.check_out_date)}</p>
                    </div>
                    <div>
                      <span className="booking-history-card__label">Guests</span>
                      <p>{booking.guests}</p>
                    </div>
                  </div>

                  <div className="booking-history-card__policies">
                    <div>
                      <span className="booking-history-card__label">Cancellation</span>
                      <p>{booking.cancellation_policy || 'See property policy'}</p>
                    </div>
                    <div>
                      <span className="booking-history-card__label">Refund</span>
                      <p>{booking.refund_policy || 'See property policy'}</p>
                    </div>
                  </div>

                  <div className="booking-history-card__footer">
                    <div>
                      <span className="booking-history-card__label">Total</span>
                      <p className="booking-history-card__price">
                        {booking.currency || 'USD'} {Number(booking.total_price || 0).toFixed(2)}
                      </p>
                      {['INITIATED', 'PAYMENT_PENDING'].includes(booking.status) && (
                        <p className="booking-history-card__refund">
                          Retries used: {Number(booking.retry_count || 0)} / 3
                          {' '}({Number(booking.retries_left || 0)} left)
                        </p>
                      )}
                      {booking.refund_status && (
                        <p className="booking-history-card__refund">
                          Refund: {booking.refund_status}
                          {Number(booking.refund_amount || 0) > 0
                            ? ` (${Number(booking.refund_amount).toFixed(2)})`
                            : ''}
                        </p>
                      )}
                    </div>
                    <div className="booking-history-card__actions">
                      {canCancel && (
                        <button
                          type="button"
                          className="booking-history-btn warning"
                          onClick={() => handleCancel(booking.booking_id)}
                          disabled={actionId === booking.booking_id}
                        >
                          {actionId === booking.booking_id ? 'Cancelling...' : 'Cancel booking'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
