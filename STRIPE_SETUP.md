# Stripe Integration Setup Guide

## Step 1: Get Stripe API Keys

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Create a free account or sign in
3. Navigate to **Developers** → **API Keys**
4. You'll see two sets of keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

For testing, use `pk_test_*` and `sk_test_*` keys.

## Step 2: Configure Environment Variables

Update your `.env` file in the `server/` directory:

```
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=tripv1
DB_PASSWORD=your_db_password
DB_PORT=5432
PORT=5000
JWT_SECRET=jwt_secret
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

**Replace `sk_test_YOUR_SECRET_KEY_HERE` with your actual Stripe Secret Key.**

## Step 3: Test the Integration

### Test Card Numbers (Stripe Test Mode)

Use these card numbers in test mode:

| Card Type | Number | Result |
|-----------|--------|--------|
| Visa (success) | 4242 4242 4242 4242 | Payment succeeds |
| Visa (declined) | 4000 0000 0000 0002 | Card declined |
| Visa (requires auth) | 4000 0025 0000 3155 | Requires 3D Secure |
| Mastercard | 5555 5555 5555 4444 | Payment succeeds |
| American Express | 3782 822463 10005 | Payment succeeds |

**For all test cards:**
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)

### Example Flow

1. Start your server: `cd server && npm start`
2. Start your client: `cd client && npm start`
3. Navigate through: Search → Hotel Details → Booking Page → Payment Page
4. Try paying with `4242 4242 4242 4242` (will succeed)
5. You'll see the success modal with transaction ID starting with `pi_`

## Step 4: Monitor Payments

1. Go to [https://dashboard.stripe.com/test/payments](https://dashboard.stripe.com/test/payments)
2. You'll see all test payments in real-time
3. Click on any payment to view details

## Database Records

When a payment succeeds:
- A row is inserted in `payments` table with `payment_status = 'SUCCESS'`
- The corresponding booking is updated to `booking_status = 'CONFIRMED'`
- Transaction ID (`pi_xxxxx`) is stored in database

## Support

- Stripe Documentation: https://stripe.com/docs/payments
- Test Mode: https://stripe.com/docs/testing
- API Reference: https://stripe.com/docs/api
