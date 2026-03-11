const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sanitizeCardNumber = (number) => number.replace(/\s+/g, '');

export const getSimulationHint = (cardNumber) => {
  const digits = sanitizeCardNumber(cardNumber);

  if (digits.startsWith('4242')) {
    return 'Will succeed';
  }

  if (digits.startsWith('4000')) {
    return 'Will fail';
  }

  if (digits.startsWith('4111')) {
    return 'Will be pending';
  }

  return 'Unknown (random outcome)';
};

export const processMockPayment = async ({ amount, cardNumber, paymentMethod }) => {
  await wait(1200);

  if (paymentMethod !== 'card') {
    return {
      status: 'SUCCESS',
      transactionId: `TXN-${Date.now()}`,
      amount,
      message: `${paymentMethod} payment authorized in sandbox mode.`,
    };
  }

  const digits = sanitizeCardNumber(cardNumber);

  if (digits.startsWith('4242')) {
    return {
      status: 'SUCCESS',
      transactionId: `TXN-${Date.now()}`,
      amount,
      message: 'Payment completed successfully.',
    };
  }

  if (digits.startsWith('4000')) {
    return {
      status: 'FAILED',
      transactionId: null,
      amount,
      message: 'Card was declined by issuer simulation.',
    };
  }

  if (digits.startsWith('4111')) {
    return {
      status: 'PENDING',
      transactionId: `TXN-${Date.now()}`,
      amount,
      message: 'Payment is pending confirmation.',
    };
  }

  const outcomes = ['SUCCESS', 'FAILED'];
  const randomStatus = outcomes[Math.floor(Math.random() * outcomes.length)];

  return {
    status: randomStatus,
    transactionId: randomStatus === 'SUCCESS' ? `TXN-${Date.now()}` : null,
    amount,
    message:
      randomStatus === 'SUCCESS'
        ? 'Payment completed successfully.'
        : 'Payment failed in simulation.',
  };
};
