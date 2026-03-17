// src/lib/razorpay.js
export function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export async function openRazorpayCheckout({ orderId, amount, currency, keyId, userName, userEmail, onSuccess, onFailure }) {
  const loaded = await loadRazorpay()
  if (!loaded) {
    onFailure?.('Could not load Razorpay. Please check your connection.')
    return
  }

  const options = {
    key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount,
    currency,
    name: 'ShipSmart',
    description: 'Meesho Image Optimiser Plan',
    order_id: orderId,
    prefill: { name: userName, email: userEmail },
    theme: { color: '#e84c3d' },
    modal: { ondismiss: () => onFailure?.('Payment cancelled') },
    handler: (response) => {
      onSuccess?.({
        orderId,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature,
      })
    },
  }

  const rzp = new window.Razorpay(options)
  rzp.on('payment.failed', (resp) => onFailure?.(resp.error.description))
  rzp.open()
}
