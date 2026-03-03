import React, { useEffect, useState, useRef } from 'react';
import { nodeApiService as apiService } from '../utils/nodeApi';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useOrderTracking } from '../contexts/OrderTrackingContext';

export default function PaymentStatusPage() {
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [message, setMessage] = useState<string>('Processing your payment...');
  const [orderId, setOrderId] = useState<string>('');
  const [retrying, setRetrying] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);
  const savingOrderRef = useRef(false);
  const { items, totalAmount, getCurrentVendor, clearCart } = useCart();
  const { user } = useAuth();
  const { clearActiveOrder } = useOrderTracking();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txnId = params.get('transactionId') || params.get('merchantTransactionId') || params.get('orderId');
    const fallback = sessionStorage.getItem('last_order_id') || '';
    const id = txnId || fallback;
    setOrderId(id || '');

    const statusParam = params.get('status');
    const reasonParam = params.get('reason');

    if (statusParam === 'failed') {
      setStatus('failed');
      setMessage(reasonParam ? `Payment failed: ${reasonParam}` : 'Payment failed.');
      clearActiveOrder(); // Remove the floating order bar on payment failure
      return;
    }

    if (!id) {
      setStatus('failed');
      setMessage('Missing order identifier.');
      return;
    }

    let cancelled = false;
    let startTime = Date.now();
    async function poll() {
      try {
        const res = await apiService.getPaymentStatus(id);
        const result = (res as any)?.data || res;
        if (result.success) {
          const status = result.data?.body?.resultInfo?.resultStatus;
        }

        const code = result?.code || result?.data?.code;
        const state = result?.state || result?.data?.state;

        if (code === 'SUCCESS' || state === 'COMPLETED' || state === 'SUCCESS') {
          if (!cancelled) {
            setStatus('success');
            setMessage('Payment successful! Order placed.');
            if (items.length > 0) {
              await clearCart();
            }

            let isSubscription = false;
            try {
              const finalOrderId = result?.body?.orderId || result?.orderId || result?.data?.orderId || id;
              if (user?.phone) {
                const orderRes = await apiService.getOrder(user.phone, finalOrderId);
                if (orderRes.success && orderRes.data) {
                  const order = orderRes.data;
                  if (order.items && order.items.length > 0 && order.items[0].metadata?.subscription) {
                    isSubscription = true;
                  }
                }
              }
            } catch (err) {
              console.error('Failed to check subscription status:', err);
            }

            const trackingId = result?.body?.transactionId || result?.transactionId || result?.data?.transactionId || id;
            setTimeout(() => {
              if (isSubscription) {
                window.location.href = `/?subscription_success=true`;
              } else {
                window.location.href = `/tracking/${trackingId}`;
              }
            }, 100);
          }
          return;
        }

        const isFailed =
          (code && code !== 'PAYMENT_PENDING' && code !== 'PENDING') ||
          (state && state !== 'PENDING' && state !== 'COMPLETED');

        if (isFailed) {
          if (!cancelled) {
            setStatus('failed');
            setMessage('Payment failed or cancelled.');
            clearActiveOrder();
          }
          return;
        }
      } catch (e: any) {
        console.error('Poll error', e);
      }

      if (!cancelled && Date.now() - startTime < 2 * 60 * 1000) {
        setTimeout(poll, 1500);
      } else if (!cancelled) {
        setStatus('pending');
        setMessage('Payment is processing. Please check order history for updates.');
      }
    }
    poll();
    return () => { cancelled = true; };
  }, [user, items, totalAmount, getCurrentVendor, clearCart, orderSaved]);

  // ─── Retry: Reprice with CURRENT prices, then re-initiate Paytm for the same order ─
  const handleRetryPayment = async () => {
    if (!orderId || !user?.phone) {
      alert('Unable to retry. Please try from your order history.');
      return;
    }

    setRetrying(true);
    try {
      // 1. Reprice the order with CURRENT product prices
      //    (in case prices changed since the original failed payment)
      const repriceRes = await (apiService as any).repriceOrder(user.phone, orderId);
      if (!repriceRes.success) {
        throw new Error(repriceRes.message || 'Failed to refresh order prices.');
      }
      const freshAmount = repriceRes.data.new_total;

      // 2. Re-initiate Paytm with the SAME orderId but FRESH amount
      //    No new order is created — this is a retry on the existing unpaid order.
      const data = await (apiService as any).initiatePaytmPayment(user.phone, orderId, freshAmount, user?.id || user.phone);
      console.log('[Retry] Initiate Payment Response:', data);

      const responseData = data.data || data;
      const paytmResp = responseData.paytmResponse || responseData.initiateTransactionResponse;
      const token = responseData.txnToken || paytmResp?.body?.txnToken;

      if (!data.success || !token || !paytmResp) {
        throw new Error('Invalid payment initiation response.');
      }

      const mid = responseData.mid || paytmResp.body.mid;
      const PAYTM_ENV = import.meta.env.VITE_PAYTM_ENV;
      const PAYTM_BASE_URL =
        PAYTM_ENV === 'production'
          ? 'https://secure.paytmpayments.com'
          : 'https://securestage.paytmpayments.com';

      // 3. Load Paytm CheckoutJS and open payment sheet
      const script = document.createElement('script');
      script.src = `${PAYTM_BASE_URL}/merchantpgpui/checkoutjs/merchants/${mid}.js`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        // @ts-ignore
        if (window.Paytm && window.Paytm.CheckoutJS) {
          // @ts-ignore
          const checkoutJs = window.Paytm.CheckoutJS;
          checkoutJs.onLoad(() => {
            const config = {
              merchant: { mid, name: 'Gutzo', redirect: false },
              flow: 'DEFAULT',
              data: {
                orderId: orderId,       // ← SAME order number, no new order
                token: token,
                tokenType: 'TXN_TOKEN',
                amount: String(freshAmount), // ← FRESH current price
              },
              handler: {
                notifyMerchant: function (eventName: string) {
                  if (eventName === 'APP_CLOSED') setRetrying(false);
                },
                transactionStatus: function (paymentStatus: any) {
                  // @ts-ignore
                  window.Paytm.CheckoutJS.close();
                  const form = document.createElement('form');
                  form.method = 'POST';
                  form.action = `${(apiService as any).baseUrl}/api/payments/callback`;
                  Object.keys(paymentStatus).forEach(key => {
                    const value = paymentStatus[key];
                    if (typeof value === 'object') return;
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = String(value);
                    form.appendChild(input);
                  });
                  document.body.appendChild(form);
                  form.submit();
                },
              },
            };
            checkoutJs.init(config)
              .then(() => checkoutJs.invoke())
              .catch((err: any) => {
                console.error('Paytm Init Error:', err);
                setRetrying(false);
                alert('Payment initialization failed. Please try again.');
              });
          });
        } else {
          setRetrying(false);
          alert('Payment gateway failed to load.');
        }
      };
      script.onerror = () => {
        setRetrying(false);
        alert('Network error loading payment gateway.');
      };
      document.body.appendChild(script);
    } catch (err: any) {
      console.error('[Retry] Error:', err);
      setRetrying(false);
      alert(err.message || 'Failed to retry payment. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-4">
          {status === 'pending' && (
            <div className="w-10 h-10 border-4 border-gutzo-primary border-t-transparent rounded-full animate-spin mx-auto" />
          )}
          {status === 'success' && (
            <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto">✓</div>
          )}
          {status === 'failed' && (
            <div className="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        <h1 className="text-xl font-semibold mb-2">Payment Status</h1>
        <p className="text-gray-600 mb-4">{message}</p>
        {orderId && <p className="text-xs text-gray-400">Order ID: {orderId}</p>}

        {status === 'failed' && (
          <div className="mt-6 flex flex-col gap-3">
            {/* Re-initiate Paytm for the SAME order — no new order created */}
            <button
              onClick={handleRetryPayment}
              disabled={retrying}
              className="w-full text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              style={{ backgroundColor: '#1ba672' }}
            >
              {retrying ? 'Opening Payment...' : '🔄 Try Payment Again'}
            </button>
            {/* Go home with ?open=orders — App.tsx detects this and opens the My Orders panel */}
            <button
              onClick={() => (window.location.href = '/?open=orders')}
              className="w-full font-medium py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              View My Orders
            </button>
          </div>
        )}

        {status === 'failed' && (
          <p className="mt-4 text-xs text-gray-400 leading-relaxed">
            Don't worry — no money was deducted. Your order is saved and you can retry anytime.
          </p>
        )}
      </div>
    </div>
  );
}
