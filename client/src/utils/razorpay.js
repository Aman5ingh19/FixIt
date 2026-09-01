import paymentApi from '../services/payment.api';
import toast from 'react-hot-toast';

/**
 * Dynamically loads official Razorpay Checkout script
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Initiate Razorpay Checkout Payment Flow
 */
export async function initiateRazorpayPayment({
  requestId,
  user,
  onSuccess = () => {},
  onFailure = () => {},
  onCancel = () => {},
}) {
  const loadingToast = toast.loading('Initializing secure Razorpay gateway...');
  try {
    // 1. Create order on backend (backend calculates price)
    const res = await paymentApi.createOrder(requestId);
    const orderData = res.data;

    toast.dismiss(loadingToast);

    if (!orderData || !orderData.orderId) {
      throw new Error('Failed to create payment order');
    }

    // 2. Check if official Razorpay test keys are present & script loads
    const hasLiveKeys = orderData.keyId && orderData.keyId.startsWith('rzp_') && !orderData.isSimulated;
    let scriptLoaded = false;

    if (hasLiveKeys) {
      scriptLoaded = await loadRazorpayScript();
    }

    if (hasLiveKeys && scriptLoaded && window.Razorpay) {
      // ── Official Razorpay Popup Mode ──
      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency || 'INR',
        name: 'FixIt Repair Network',
        description: `Payment for ${orderData.request?.serviceName || 'Service Request'}`,
        image: '/favicon.svg',
        order_id: orderData.orderId,
        handler: async function (response) {
          const verifyToast = toast.loading('Verifying payment signature with server...');
          try {
            const verifyRes = await paymentApi.verifySignature({
              requestId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.dismiss(verifyToast);
            toast.success(`Payment of ₹${orderData.amount} verified successfully!`);
            onSuccess(verifyRes.data);
          } catch (err) {
            toast.dismiss(verifyToast);
            toast.error(err.response?.data?.message || 'Payment signature verification failed');
            onFailure(err);
          }
        },
        prefill: {
          name: orderData.request?.customerName || `${user?.firstName} ${user?.lastName}`,
          email: orderData.request?.customerEmail || user?.email,
          contact: orderData.request?.customerPhone || user?.phone || '9999999999',
        },
        theme: {
          color: '#2563EB',
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled by user');
            onCancel();
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        toast.error(`Payment failed: ${response.error.description || 'Transaction declined'}`);
        onFailure(response.error);
      });
      razorpayInstance.open();
    } else {
      // ── Built-in Interactive Sandbox Simulator Modal ──
      triggerSandboxSimulator({
        orderData,
        requestId,
        onSuccess,
        onFailure,
        onCancel,
      });
    }
  } catch (err) {
    toast.dismiss(loadingToast);
    toast.error(err.response?.data?.message || err.message || 'Payment initiation failed');
    onFailure(err);
  }
}

/**
 * Built-in Sandbox Simulation Overlay
 * Renders an interactive payment sheet for seamless instant testing
 */
function triggerSandboxSimulator({ orderData, requestId, onSuccess, onFailure, onCancel }) {
  const overlayId = 'fixit-razorpay-sandbox-modal';
  const existing = document.getElementById(overlayId);
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = overlayId;
  overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in';

  overlay.innerHTML = `
    <div class="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-surface-200 dark:border-surface-300 overflow-hidden transform transition-all animate-scale-up">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-black text-xl">
            💳
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-extrabold text-base tracking-tight">Razorpay Checkout</h3>
              <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">Test Mode</span>
            </div>
            <p class="text-xs text-blue-100">FixIt Service Network</p>
          </div>
        </div>
        <button id="rzp-close-btn" class="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-lg font-bold">
          ✕
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-5">
        <!-- Order Summary -->
        <div class="p-4 rounded-2xl bg-surface-50 dark:bg-surface-200/60 border border-surface-200 dark:border-surface-300 space-y-2">
          <div class="flex items-center justify-between text-xs text-surface-500">
            <span>Service</span>
            <span class="font-bold text-surface-900">${orderData.request?.serviceName || 'Home Repair Service'}</span>
          </div>
          <div class="flex items-center justify-between text-xs text-surface-500">
            <span>Order ID</span>
            <span class="font-mono text-[11px] text-surface-600 truncate max-w-[180px]">${orderData.orderId}</span>
          </div>
          <div class="pt-2 border-t border-surface-200 dark:border-surface-300 flex items-center justify-between">
            <span class="text-sm font-bold text-surface-900">Total Payable</span>
            <span class="text-xl font-black text-primary-600 dark:text-primary-400">₹${orderData.amount}</span>
          </div>
        </div>

        <!-- Payment Options Simulator -->
        <div class="space-y-2.5">
          <p class="text-xs font-bold text-surface-700 uppercase tracking-wider">Select Test Payment Method</p>
          
          <label class="flex items-center justify-between p-3.5 rounded-2xl border-2 border-primary-500 bg-primary-50/40 dark:bg-primary-950/20 cursor-pointer">
            <div class="flex items-center gap-3">
              <span class="text-xl">📱</span>
              <div>
                <p class="text-xs font-bold text-surface-900">Instant Test UPI / QR</p>
                <p class="text-[11px] text-surface-500">Google Pay • PhonePe • Paytm</p>
              </div>
            </div>
            <input type="radio" name="rzp_method" value="UPI" checked class="text-primary-600" />
          </label>

          <label class="flex items-center justify-between p-3.5 rounded-2xl border border-surface-200 dark:border-surface-300 bg-white dark:bg-surface-200/40 hover:border-surface-300 cursor-pointer">
            <div class="flex items-center gap-3">
              <span class="text-xl">💳</span>
              <div>
                <p class="text-xs font-bold text-surface-900">Test Debit / Credit Card</p>
                <p class="text-[11px] text-surface-500">Visa • Mastercard • RuPay</p>
              </div>
            </div>
            <input type="radio" name="rzp_method" value="CARD" class="text-primary-600" />
          </label>
        </div>

        <!-- Buttons -->
        <div class="space-y-2 pt-2">
          <button id="rzp-pay-success-btn" class="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
            <span>✓ Pay ₹${orderData.amount} (Simulate Success)</span>
          </button>
          <button id="rzp-pay-fail-btn" class="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer">
            Simulate Payment Failure
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeOverlay = () => {
    overlay.remove();
  };

  document.getElementById('rzp-close-btn').onclick = () => {
    closeOverlay();
    toast.error('Payment cancelled');
    onCancel();
  };

  document.getElementById('rzp-pay-fail-btn').onclick = () => {
    closeOverlay();
    toast.error('Payment failed: Transaction declined in Sandbox test');
    onFailure(new Error('Simulated payment failure'));
  };

  document.getElementById('rzp-pay-success-btn').onclick = async () => {
    const successBtn = document.getElementById('rzp-pay-success-btn');
    successBtn.disabled = true;
    successBtn.innerHTML = '<span>Processing signature...</span>';

    const testPaymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const testSignature = `sig_test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const verifyToast = toast.loading('Verifying payment signature with server...');
    try {
      const verifyRes = await paymentApi.verifySignature({
        requestId,
        razorpayOrderId: orderData.orderId,
        razorpayPaymentId: testPaymentId,
        razorpaySignature: testSignature,
      });

      toast.dismiss(verifyToast);
      closeOverlay();
      toast.success(`Payment of ₹${orderData.amount} completed successfully!`);
      onSuccess(verifyRes.data);
    } catch (err) {
      toast.dismiss(verifyToast);
      toast.error(err.response?.data?.message || 'Payment verification failed');
      closeOverlay();
      onFailure(err);
    }
  };
}
