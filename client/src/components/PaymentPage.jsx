import { useMemo, useState, useEffect } from 'react';
import '../styles/PaymentPage.css';
import { getSimulationHint, processMockPayment } from '../services/mockPaymentGateway';
import {
  VisaIcon,
  MastercardIcon,
  AmexIcon,
  JCBIcon,
  DiscoverIcon,
  DinersIcon,
  ApplePayIcon,
  PayPalIcon,
  GooglePayIcon,
} from './PaymentIcons';

import { useNavigate } from 'react-router-dom';

const PAYMENT_METHODS = [
  { key: 'card', label: 'New credit/debit card' },
  { key: 'applePay', label: 'Apple Pay' },
  { key: 'paypal', label: 'PayPal' },
  { key: 'googlePay', label: 'Google Pay' },
];


const METHOD_ICONS = {
  card: [VisaIcon, MastercardIcon, JCBIcon, AmexIcon, DiscoverIcon, DinersIcon],
  applePay: [ApplePayIcon],
  paypal: [PayPalIcon],
  googlePay: [GooglePayIcon],
};

const BOOKING = {
  hotelName: 'Radisson Collection Hyland Shanghai',
  checkIn: 'Mar 10, 2026',
  checkOut: 'Mar 11, 2026',
  room: 1,
  night: 1,
  total: 90.05,
};

const formatCardNumber = (value) => {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
  return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

const formatExpiry = (value) => {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
  if (digitsOnly.length <= 2) {
    return digitsOnly;
  }
  return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
};

function PaymentPage() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState('00:28:45');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const parts = prev.split(':').map(Number);
        let [h, m, s] = parts;

        if (s > 0) {
          s--;
        } else if (m > 0) {
          m--;
          s = 59;
        } else if (h > 0) {
          h--;
          m = 59;
          s = 59;
        } else {
          return '00:00:00';
        }

        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const simulationHint = useMemo(
    () => getSimulationHint(formData.cardNumber),
    [formData.cardNumber]
  );

  const updateField = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const validateCardForm = () => {
    const cleanCard = formData.cardNumber.replace(/\s+/g, '');

    if (cleanCard.length < 12) {
      return 'Card number must be at least 12 digits.';
    }

    if (formData.cardholderName.trim().length < 3) {
      return 'Cardholder name is too short.';
    }

    if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      return 'Expiry date must be in MM/YY format.';
    }

    if (!/^\d{3,4}$/.test(formData.cvv)) {
      return 'CVV/CVC must be 3 or 4 digits.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setPaymentResult(null);

    if (selectedMethod === 'card') {
      const validationError = validateCardForm();
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }
    }

    try {
      setSubmitting(true);
      const response = await processMockPayment({
        amount: BOOKING.total,
        paymentMethod: selectedMethod,
        cardNumber: formData.cardNumber,
      });
      setPaymentResult(response);
    } catch (error) {
      setErrorMessage('Unable to process payment right now. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const gotoHome = () => {
    navigate('/hotels/search');
  };

  return (
    <div className="app-shell">
      <header className="payment-topbar">
        <div className="payment-topbar__brand">
          <div onClick={()=> gotoHome()}
            style={{
              fontFamily: "TripFont",
              fontSize: '30px',
            }}
            >
            Trip<span style={{
              color: '#e2c20e',
            }}>.</span>
            com
          </div>
          {/* <img
            src="/assets/logo2.png"
            alt="Trip.com"
            className="logo"
            
            onClick={() => window.location.href = '/hotels/search'}
            style={{ cursor: 'pointer',
              scale: '2',
             }}
          /> com */}
        </div>
        <div className="payment-topbar__help">Customer support</div>
      </header>

      <main className="payment-layout">
        <div class="header-shaper"></div>
        <section className="payment-main">
          <div className="payment-card">
            <div className="payment-section-header">
              <h2>Select a Payment Method</h2>
              <p>Please secure your booking within {timeLeft}</p>
            </div>

            {PAYMENT_METHODS.map((method) => (
              <div key={method.key} className="method-block">
                <label className="method-select">
                  <input
                    type="radio"
                    checked={selectedMethod === method.key}
                    onChange={() => setSelectedMethod(method.key)}
                  />
                  <span>{method.label}</span>
                  <div className="method-badges" aria-hidden="true">
                    {METHOD_ICONS[method.key].map((IconComponent, idx) => (
                      <div key={idx} className="method-icon">
                        <IconComponent />
                      </div>
                    ))}
                  </div>
                </label>

                {method.key === 'card' && selectedMethod === 'card' && (
                  <div className="card-form-wrap">
                    <input
                      placeholder="Bank card no."
                      value={formData.cardNumber}
                      onChange={(event) =>
                        updateField('cardNumber', formatCardNumber(event.target.value))
                      }
                    />
                    <input
                      placeholder="Cardholder name"
                      value={formData.cardholderName}
                      onChange={(event) =>
                        updateField('cardholderName', event.target.value)
                      }
                    />
                    <div className="card-form-row">
                      <input
                        placeholder="Expiration date"
                        value={formData.expiryDate}
                        onChange={(event) =>
                          updateField('expiryDate', formatExpiry(event.target.value))
                        }
                      />
                      <input
                        placeholder="CVV/CVC"
                        value={formData.cvv}
                        onChange={(event) =>
                          updateField('cvv', event.target.value.replace(/\D/g, '').slice(0, 4))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="payment-card gift-card">
            <h3>Use Gift Card to save on this booking</h3>
            <label className="gift-option">
              <input type="checkbox" disabled />
              <span>Gift Card</span>
            </label>
          </div>

          <form className="payment-card" onSubmit={handleSubmit}>
            {errorMessage && <p className="status status--error">{errorMessage}</p>}
            {paymentResult && (
              <p
                className={`status ${paymentResult.status === 'SUCCESS'
                    ? 'status--success'
                    : paymentResult.status === 'PENDING'
                      ? 'status--pending'
                      : 'status--error'
                  }`}
              >
                {paymentResult.status}: {paymentResult.message}
                {paymentResult.transactionId
                  ? ` (Transaction: ${paymentResult.transactionId})`
                  : ''}
              </p>
            )}

            <button className="confirm-button" disabled={submitting}>
              {submitting
                ? 'Processing...'
                : `Confirm and Pay US$${BOOKING.total.toFixed(2)}`}
            </button>
          </form>
        </section>

        <aside className="payment-sidebar">
          <div className="summary-card">
            <div className="sidebar-header">
              <h3>Booking Info</h3>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsDetailsOpen(true); }} className="sidebar-link">Details &gt;</a>
            </div>
            <p className="hotel-name">{BOOKING.hotelName}</p>
            <div className="summary-grid">
              <div>
                <span>Check-in</span>
                <strong>{BOOKING.checkIn}</strong>
              </div>
              <div>
                <span>Check-out</span>
                <strong>{BOOKING.checkOut}</strong>
              </div>
              <div>
                <span>Room</span>
                <strong>{BOOKING.room}</strong>
              </div>
              <div>
                <span>Night</span>
                <strong>{BOOKING.night}</strong>
              </div>
            </div>

            <h4 className="price-section-header">Price Details</h4>
            <div className="price-line">
              <span>Prepay online</span>
              <strong>US${BOOKING.total.toFixed(2)}</strong>
            </div>
            <p className="fee-warning">
              Foreign transaction fees may be charged by your card issuer.
            </p>
            <hr />
            <div className="total-line">
              <span>Total</span>
              <strong>US${BOOKING.total.toFixed(2)}</strong>
            </div>
          </div>

          <div className="summary-card notice-card">
            <div className="sidebar-header">
              <h3>Notice</h3>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }} className="sidebar-link">Show More &gt;</a>
            </div>
            <ul>
              <li>
                You are about to complete a booking. If booking cannot be confirmed,
                you will receive a refund per policy.
              </li>
            </ul>
          </div>

          {isModalOpen && (
            <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Notice</h2>
                  <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <ul>
                    <li>
                      You're about to complete a booking on Trip.com. If your booking cannot be confirmed, you'll receive a full refund. If you cancel up to 30-minute after confirmation, you'll get a full refund. If you cancel more than 30-minute after confirmation, you won't receive a refund. You'll be charged the cancellation fee if you don't check in.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {isDetailsOpen && (
            <div className="modal-overlay" onClick={() => setIsDetailsOpen(false)}>
              <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Booking Details</h2>
                  <button className="modal-close" onClick={() => setIsDetailsOpen(false)}>✕</button>
                </div>
                <div className="modal-body details-body">
                  <div className="details-section">
                    <h3>Price Details</h3>
                    <div className="price-breakdown">
                      <div className="price-row">
                        <span>Room Rate</span>
                        <span className="price">US$176.65</span>
                      </div>
                      <div className="price-row">
                        <span>Taxes & fees</span>
                        <span className="price">US$7.82</span>
                      </div>
                      <div className="price-row discount">
                        <span>First Booking Deal</span>
                        <span className="price">-US$27.68</span>
                      </div>
                      <div className="price-row discount">
                        <span>Special Discount</span>
                        <span className="price">-US$18.45</span>
                      </div>
                      <div className="price-row discount">
                        <span>New user promo code</span>
                        <span className="price">-US$10.00</span>
                      </div>
                      <div className="price-row prepay-row">
                        <span>Prepay Online</span>
                        <span className="price prepay-price">US$128.34</span>
                      </div>
                    </div>
                  </div>

                  <div className="details-section">
                    <h3>{BOOKING.hotelName}</h3>
                    <div className="hotel-details-grid">
                      <div>
                        <span className="label">Room type</span>
                        <span className="value">Collection Executive Twin Room</span>
                      </div>
                      <div>
                        <span className="label">Check-in</span>
                        <span className="value">{BOOKING.checkIn}</span>
                      </div>
                      <div>
                        <span className="label">Check-out</span>
                        <span className="value">{BOOKING.checkOut}</span>
                      </div>
                      <div>
                        <span className="label">Room</span>
                        <span className="value">{BOOKING.room}</span>
                      </div>
                      <div>
                        <span className="label">Night</span>
                        <span className="value">{BOOKING.night}</span>
                      </div>
                    </div>
                    <div className="hotel-info-text">
                      <p>Max. occupancy: 2 guests/room</p>
                      <p>Includes breakfast for 2 guests</p>
                    </div>
                  </div>

                  <div className="details-section">
                    <h3>Traveler Info</h3>
                    <p className="traveler-name">Agatsuma zenitsu</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </main>

      <footer className="payment-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo-icon">🌐</span>
            <span className="logo-text">VeriSign</span>
          </div>
          <p className="footer-copyright">Copyright © 2025 Trip.com Travel Singapore Pte. Ltd. All rights reserved</p>
          <p className="footer-operator">Site Operator: Trip.com Travel Singapore Pte. Ltd.</p>
        </div>
      </footer>
    </div>
  );
}

export default PaymentPage;
