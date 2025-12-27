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
        const res = await apiService.getPaymentStatus(orderId);
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

            // Redirect home after delay
            setTimeout(() => {
              window.location.href = '/';
            }, 2500);
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
            <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto">✕</div>
          )}
        </div>
        <h1 className="text-xl font-semibold mb-2">Payment Status</h1>
        <p className="text-gray-600 mb-4">{message}</p>
        {orderId && <p className="text-xs text-gray-400">Order ID: {orderId}</p>}
        
        {status === 'failed' && (
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-6 w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Return to Home
          </button>
        )}
      </div>
    </div>
  );
}
