import React, { useEffect, useState, useRef } from 'react';
import { nodeApiService as apiService } from '../utils/nodeApi';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';


export default function PaymentStatusPage() {
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [message, setMessage] = useState<string>('Processing your payment...');
  const [orderId, setOrderId] = useState<string>('');
  const [orderSaved, setOrderSaved] = useState(false);
  const savingOrderRef = useRef(false);
  const { items, totalAmount, getCurrentVendor, clearCart } = useCart();
  const { user } = useAuth();


  useEffect(() => {
    // console.log('Payment status response1:');
    // Payment gateway redirects back with merchantTransactionId in query or we used our own orderId
    const params = new URLSearchParams(window.location.search);
    const txnId = params.get('transactionId') || params.get('merchantTransactionId') || params.get('orderId');
    const fallback = sessionStorage.getItem('last_order_id') || '';
    const id = txnId || fallback;
    setOrderId(id || '');

    // Check for explicit status in URL (passed from backend redirect)
    const statusParam = params.get('status');
    const reasonParam = params.get('reason');

    if (statusParam === 'failed') {
      setStatus('failed');
      setMessage(reasonParam ? `Payment failed: ${reasonParam}` : 'Payment failed.');
      return; // Do not poll
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
        const result = (res as any)?.data || res; // handle either shape
        if (result.success) {
        // console.log('Payment status response:', JSON.stringify(result, null, 2));
         
          // The backend should return the status
          const status = result.data?.body?.resultInfo?.resultStatus;
        }
        
        const code = result?.code || result?.data?.code;
        const state = result?.state || result?.data?.state;

        // Treat code SUCCESS or state COMPLETED/SUCCESS as payment success
        if (code === 'SUCCESS' || state === 'COMPLETED' || state === 'SUCCESS') {
          if (!cancelled) {
            // Success!
            setStatus('success');
            setMessage('Payment successful! Order placed.');

            // Clear cart if not already cleared
            if (items.length > 0) {
              await clearCart();
            }
            
            // Check if this is a subscription order
            let isSubscription = false;
            try {
                // We need to fetch the order to check metadata
                // Use the ID we have (transactionId or orderId)
                // Note: The ID here might be transaction ID used for payment status, 
                // but usually getPaymentStatus returns the internal order ID too if needed.
                // However, the `id` variable from URL might be order_number or id.
                // Let's rely on the result body if available, or just fetch using the ID we have.
                
                const finalOrderId = result?.body?.orderId || result?.orderId || result?.data?.orderId || id;
                
                if (user?.phone) {
                    const orderRes = await apiService.getOrder(user.phone, finalOrderId);
                    if (orderRes.success && orderRes.data) {
                        const order = orderRes.data;
                        // Check first item for subscription metadata
                        if (order.items && order.items.length > 0 && order.items[0].metadata?.subscription) {
                            isSubscription = true;
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to check subscription status:", err);
            }

            // Redirect based on order type
            const trackingId = result?.body?.transactionId || result?.transactionId || result?.data?.transactionId || id;
            
            setTimeout(() => {
              if (isSubscription) {
                  // Redirect to Home with success flag for subscriptions
                  window.location.href = `/?subscription_success=true`;
              } else {
                  // Redirect to Tracking for standard orders
                  window.location.href = `/tracking/${trackingId}`;
              }
            }, 100);
          }
          return;
        }

        const isFailed = (code && code !== 'PAYMENT_PENDING' && code !== 'PENDING') || 
                         (state && state !== 'PENDING' && state !== 'COMPLETED');
                         
        if (isFailed) {
          if (!cancelled) {
            setStatus('failed');
            setMessage('Payment failed or cancelled.');
          }
          return;
        }
      } catch (e: any) {
        // keep pending and retry
        console.error('Poll error', e);
      }
      
      // Stop polling after 2 minutes
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
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-6 w-full bg-brand text-white font-medium py-3 rounded-xl hover:bg-brand-hover transition-colors"
            style={{ backgroundColor: '#1ba672' }}
          >
            Return to Home
          </button>
        )}
        

      </div>
    </div>
  );
}
