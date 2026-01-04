import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, successResponse, ApiError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import PaytmChecksum from '../utils/paytmChecksum.js';

const router = express.Router();

// Paytm Environment variables
const PAYTM_MID = process.env.PAYTM_MID;
const PAYTM_MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY;
const PAYTM_WEBSITE_NAME = process.env.PAYTM_WEBSITE_NAME;
const PAYTM_CALLBACK_URL = process.env.PAYTM_CALLBACK_URL;
const PAYTM_ENV = process.env.PAYTM_ENV;

// Paytm URLs based on environment
const PAYTM_BASE_URL = PAYTM_ENV === 'production' 
  ? 'https://secure.paytmpayments.com' 
  : 'https://securestage.paytmpayments.com';

// ============================================
// PAYTM PAYMENT ENDPOINTS
// ============================================

// GENERATE PAYTM CHECKSUM
router.post('/generate-checksum', asyncHandler(async (req, res) => {
  const { merchantKey, ...params } = req.body;

  const key = merchantKey || PAYTM_MERCHANT_KEY;
  if (!key || Object.keys(params).length === 0) {
    throw new ApiError(400, 'merchantKey and params are required');
  }

  const checksum = await PaytmChecksum.generateSignature(params, key);

  successResponse(res, { checksum }, 'Checksum generated successfully');
}));

// VERIFY PAYTM CHECKSUM
router.post('/verify-checksum', asyncHandler(async (req, res) => {
  const { body, merchantKey, checksum } = req.body;

  const key = merchantKey || PAYTM_MERCHANT_KEY;
  if (!body || !key || !checksum) {
    throw new ApiError(400, 'body, merchantKey, and checksum are required');
  }

  const isValid = PaytmChecksum.verifySignature(body, key, checksum);

  successResponse(res, { 
    valid: isValid, 
    message: isValid ? 'Checksum is valid' : 'Checksum is invalid' 
  });
}));

// INITIATE PAYTM TRANSACTION (For web form-based flow)
router.post('/initiate', authenticate, asyncHandler(async (req, res) => {
  const { order_id, amount } = req.body;

  if (!order_id || !amount) {
    throw new ApiError(400, 'Order ID and amount are required');
  }

  // Verify order exists
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', order_id)
    .eq('user_id', req.user.id)
    .single();

  if (!order) throw new ApiError(404, 'Order not found');
  if (order.payment_status === 'paid') throw new ApiError(400, 'Order already paid');

  /* Refactored to use Paytm initiateTransaction API for JS Checkout */
  const paytmParams = {
    mid: PAYTM_MID,
    orderId: order.order_number, // User friendly order number
    requestType: 'Payment',
    txnAmount: {
      value: String(amount),
      currency: 'INR'
    },
    userInfo: {
      custId: req.user.id
    },
    callbackUrl: PAYTM_CALLBACK_URL,
    industryType: 'Retail',
    channelId: 'WEB',
    websiteName: PAYTM_WEBSITE_NAME,
  };

  try {
    // const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams), PAYTM_MERCHANT_KEY);
    // console.log('Generated Paytm Checksum:', checksum);

    console.log('[Paytm Initiate] Params:', JSON.stringify(paytmParams, null, 2));

    const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams), PAYTM_MERCHANT_KEY);

    const payload = {
      body: paytmParams,
      head: { signature: checksum }
    };

    console.log('[Paytm Initiate] Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(
      `${PAYTM_BASE_URL}/theia/api/v1/initiateTransaction?mid=${PAYTM_MID}&orderId=${order.order_number}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();
    console.log('[Paytm Initiate] Response:', JSON.stringify(data, null, 2));

    // Create payment record
    await supabaseAdmin.from('payments').insert({
      order_id: order_id, // keep UUID link
      merchant_order_id: order.order_number, // Use order number for matching
      amount,
      status: 'initiated',
      gateway: 'paytm',
      mode: 'web'
    });

    successResponse(res, {
      checksum,
      mid: PAYTM_MID,
      paytmResponse: data,
      message: 'Paytm payment initiated'
    });
  } catch (err) {
    console.error('Paytm API error:', err);
    throw new ApiError(500, 'Failed to initiate Paytm transaction');
  }
}));



// PAYTM CALLBACK/WEBHOOK (REDIRECT FLOW)
router.post('/callback', asyncHandler(async (req, res) => {
  const paytmParams = req.body;
  console.log('[Paytm Callback] Received:', paytmParams);
  console.log('[Paytm Callback] Debug Env:', { 
    FRONTEND_URL: process.env.FRONTEND_URL, 
    CALLBACK_URL: process.env.PAYTM_CALLBACK_URL 
  });

  const receivedChecksum = paytmParams.CHECKSUMHASH;
  // delete paytmParams.CHECKSUMHASH; // Do not delete if verifySignature needs it in specific way, usually it handles it. 
  // But PaytmChecksum usually expects params WITHOUT checksumHash for generation, but verifySignature(params, key, checksum). 
  // Let's stick to standard practice: Cloning.

  const paramsForVerify = { ...paytmParams };
  delete paramsForVerify.CHECKSUMHASH;

  const isValid = PaytmChecksum.verifySignature(paramsForVerify, PAYTM_MERCHANT_KEY, receivedChecksum);

  if (!isValid) {
    console.error('[Paytm Callback] Invalid checksum');
    // Still redirect but maybe with error? Or just block? 
    // Usually bad to show success if fake.
    return res.status(400).send('Invalid checksum');
  }

  const orderId = paytmParams.ORDERID;
  const txnStatus = paytmParams.STATUS;
  const txnId = paytmParams.TXNID;
  const bankTxnId = paytmParams.BANKTXNID;
  const txnAmount = paytmParams.TXNAMOUNT;

  let paymentStatus = 'failed';
  let orderStatus = 'payment_failed';

  if (txnStatus === 'TXN_SUCCESS') {
    paymentStatus = 'paid';
    orderStatus = 'paid';
  } else if (txnStatus === 'PENDING') {
    paymentStatus = 'pending';
    orderStatus = 'pending';
  }

  // Update order
  const { data: updatedOrder } = await supabaseAdmin
    .from('orders')
    .update({
      payment_status: paymentStatus,
      payment_method: 'paytm',
      payment_id: txnId,
      status: orderStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('order_number', orderId)
    .select('*, vendor:vendors(*)')
    .single();

  // Update payment record
  await supabaseAdmin
    .from('payments')
    .update({
      transaction_id: txnId,
      status: paymentStatus,
      gateway_response: paytmParams,
      updated_at: new Date().toISOString(),
    })
    .eq('merchant_order_id', orderId);

  // LOGIC: Shadowfax Request before Vendor Notification
  if (updatedOrder && paymentStatus === 'paid') {
      try {
          const { createShadowfaxOrder } = await import('../utils/shadowfax.js');
          
          // Ensure delivery_address is an object (Supabase sometimes returns it as JSON string)
          if (updatedOrder.delivery_address && typeof updatedOrder.delivery_address === 'string') {
                try {
                    updatedOrder.delivery_address = JSON.parse(updatedOrder.delivery_address);
                } catch (e) {
                    console.error("Failed to parse delivery_address JSON:", e);
                }
          }

          const sfResponse = await createShadowfaxOrder(updatedOrder, updatedOrder.vendor);

          if (sfResponse && sfResponse.success) {
              const shadowfaxId = sfResponse.data.sfx_order_id || sfResponse.data.flash_order_id || sfResponse.data.client_order_id || sfResponse.data.id;
              console.log(`[Shadowfax] Order ${orderId} accepted. ID: ${shadowfaxId}`);
              
              // Update delivery status
              await supabaseAdmin.from('deliveries').insert({
                  order_id: updatedOrder.id,
                  partner_id: 'shadowfax',
                  partner_order_id: shadowfaxId, 
                  status: 'searching_rider'
              });

              // CRITICAL: Update ORDERS table so Webhook can find it later
              await supabaseAdmin.from('orders')
                  .update({ shadowfax_order_id: shadowfaxId })
                  .eq('id', updatedOrder.id);

              // Notify User (Success)
              await supabaseAdmin.from('notifications').insert({
                  user_id: updatedOrder.user_id,
                  type: 'payment_success',
                  title: 'Payment Successful!',
                  message: `Payment received. Searching for delivery partner...`,
                  data: { order_id: orderId, txn_id: txnId }
              });

              // Notify Vendor (Email & Push) - MOVED TO SHADOWFAX WEBHOOK (Rider Assigned Event)
              // Only notify user here
              console.log(`[Shadowfax] Order ${orderId} accepted. Notification delayed until rider allocation.`);

          } else {
              console.error(`[Shadowfax] Order ${orderId} rejected/failed. Reason: ${sfResponse?.error}`);
              
              // 1. Mark Order as Cancelled / Refund Initiated
              await supabaseAdmin.from('orders').update({
                  status: 'cancelled',
                  cancellation_reason: 'Delivery partner unavailable',
                  cancelled_by: 'system',
                  cancelled_at: new Date().toISOString()
              }).eq('id', updatedOrder.id);

              // 2. Initiate Auto-Refund (Internal Logic)
              // We call the refund endpoint logic internally or trigger it.
              // For now, let's mark payment as 'refund_initiated' and log it.
              // Ideally call Paytm Refund API here.
              console.log(`[Auto-Refund] Initiating refund for ${orderId}`);
              
              // Notify User (Failure)
              await supabaseAdmin.from('notifications').insert({
                  user_id: updatedOrder.user_id,
                  type: 'order_cancelled',
                  title: 'Order Cancelled',
                  message: `Payment successful but no delivery partner available. Refund initiated.`,
                  data: { order_id: orderId }
              });

              // DO NOT Notify Vendor
          }
      } catch (err) {
          console.error('[Shadowfax] Flow Error:', err);
      }
  } else if (updatedOrder && paymentStatus !== 'paid') {
      // Payment Failed Logic
      await supabaseAdmin.from('notifications').insert({
        user_id: updatedOrder.user_id,
        type: 'payment_failed',
        title: 'Payment Failed',
        message: `Payment failed for order #${orderId}. Please try again.`,
        data: { order_id: orderId, txn_id: txnId }
      });
  }

  console.log(`[Paytm Callback] Order ${orderId} processed.`);

  // Redirect based on status (modified to show correct state)
  // If we auto-cancelled, we might want to redirect to a "refunded" or "cancelled" page if possible, 
  // currently just redirecting to status page.
  if (txnStatus === 'TXN_SUCCESS') {
    res.redirect(`${process.env.FRONTEND_URL}/payment-status?orderId=${orderId}`);
  } else {
    res.redirect(`${process.env.FRONTEND_URL}/payment-status?orderId=${orderId}&status=failed&reason=${txnStatus}`);
  }
}));

// PAYTM S2S WEBHOOK (BACKGROUND NOTIFICATION)
router.post('/webhook', asyncHandler(async (req, res) => {
  // 1. Verify that content-type is form-urlencoded (Paytm sends it this way)
  // Express body-parser handles this automatically if configured.
  
  const paytmParams = req.body;
  console.log('[Paytm Webhook] Received:', JSON.stringify(paytmParams));

  const receivedChecksum = paytmParams.CHECKSUMHASH;

  if (!receivedChecksum) {
    console.error('[Paytm Webhook] No checksum provided');
    return res.status(200).send('CHECKSUM_MISSING'); 
  }

  // Remove checksum for verification
  const paramsForVerify = { ...paytmParams };
  delete paramsForVerify.CHECKSUMHASH;

  // 2. Verify Checksum
  const isValid = PaytmChecksum.verifySignature(paramsForVerify, PAYTM_MERCHANT_KEY, receivedChecksum);

  if (!isValid) {
    console.error('[Paytm Webhook] Invalid checksum');
    return res.status(200).send('CHECKSUM_INVALID');
  }

  // 3. Process Status
  const orderId = paytmParams.ORDERID;
  const txnStatus = paytmParams.STATUS;
  const txnId = paytmParams.TXNID;
  const txnAmount = paytmParams.TXNAMOUNT;

  // console.log(`[Paytm Webhook] Processing Order: ${orderId}, Status: ${txnStatus}`);

  // Fetch existing order to check idempotency and validate amount
  const { data: existingOrder } = await supabaseAdmin
    .from('orders')
    .select('id, user_id, payment_status, total_amount')
    .eq('order_number', orderId)
    .single();

  if (!existingOrder) {
    console.error(`[Paytm Webhook] Order ${orderId} not found`);
    return res.status(200).send('ORDER_NOT_FOUND');
  }

  // Validate Amount
  if (txnAmount) {
     const orderAmount = parseFloat(existingOrder.total_amount);
     const paidAmount = parseFloat(txnAmount);
     // Allow for very small floating point diff (e.g. 0.01)
     if (Math.abs(orderAmount - paidAmount) > 0.05) { 
        console.error(`[Paytm Webhook] Amount mismatch for ${orderId}. Expected ${orderAmount}, got ${paidAmount}`);
        // Log this suspicious activity but do NOT mark as paid
        return res.status(200).send('AMOUNT_MISMATCH'); 
     }
  }

  // Idempotency: If already paid, do nothing
  if (existingOrder.payment_status === 'paid' && txnStatus === 'TXN_SUCCESS') {
    // console.log(`[Paytm Webhook] Order ${orderId} already paid. Skipping update.`);
    return res.status(200).send('OK');
  }

  let paymentStatus = 'failed';
  let orderStatus = 'payment_failed';

  if (txnStatus === 'TXN_SUCCESS') {
    paymentStatus = 'paid';
    orderStatus = 'paid';
  } else if (txnStatus === 'PENDING') {
    paymentStatus = 'pending';
    orderStatus = 'pending';
  }

  // Update Order
  const { data: updatedOrder } = await supabaseAdmin
    .from('orders')
    .update({
      payment_status: paymentStatus,
      payment_method: 'paytm',
      payment_id: txnId,
      status: orderStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('order_number', orderId)
    .select('*, vendor:vendors(*)') 
    .single();

  // Update Payment Record
  await supabaseAdmin
    .from('payments')
    .update({
      transaction_id: txnId,
      status: paymentStatus,
      gateway_response: paytmParams,
      updated_at: new Date().toISOString(),
    })
    .eq('merchant_order_id', orderId);

  // Shadowfax Logic (Same as Callback)
  if (paymentStatus === 'paid' && existingOrder.payment_status !== 'paid' && updatedOrder) {
      
      try {
          // Notify User of Payment Success First
          await supabaseAdmin.from('notifications').insert({
            user_id: existingOrder.user_id,
            type: 'payment_success',
            title: 'Payment Successful!',
            message: `Payment of ₹${txnAmount} received for order #${orderId}`,
            data: { order_id: orderId, txn_id: txnId }
          });

          const { createShadowfaxOrder } = await import('../utils/shadowfax.js');

          // Ensure delivery_address is an object (Supabase sometimes returns it as JSON string)
          if (updatedOrder.delivery_address && typeof updatedOrder.delivery_address === 'string') {
                try {
                    updatedOrder.delivery_address = JSON.parse(updatedOrder.delivery_address);
                } catch (e) {
                    console.error("Failed to parse delivery_address JSON in webhook:", e);
                }
          }

          const sfResponse = await createShadowfaxOrder(updatedOrder, updatedOrder.vendor);

          if (sfResponse && sfResponse.success) {
               const shadowfaxId = sfResponse.data.sfx_order_id || sfResponse.data.flash_order_id || sfResponse.data.client_order_id || sfResponse.data.id;
               console.log(`[Shadowfax WebhookHandler] Order ${orderId} accepted. ID: ${shadowfaxId}`);
               
               // Update Delivery
               await supabaseAdmin.from('deliveries').insert({
                  order_id: updatedOrder.id,
                  partner_id: 'shadowfax',
                  partner_order_id: shadowfaxId,
                  status: 'searching_rider'
               });
               
               // CRITICAL: Update ORDERS table so Webhook can find it later
               await supabaseAdmin.from('orders')
                  .update({ shadowfax_order_id: shadowfaxId })
                  .eq('id', updatedOrder.id);
               
               // NOW Notify Vendor
               // Notify Vendor - MOVED TO WEBHOOK
               console.log(`[Shadowfax WebhookHandler] Order ${orderId} accepted. Notification delayed until rider allocation.`);
          } else {
              console.error(`[Shadowfax WebhookHandler] Order ${orderId} rejected. Auto-Refunding...`);
              
              // Cancel & Refund
              await supabaseAdmin.from('orders').update({
                  status: 'cancelled',
                  cancellation_reason: 'Delivery partner unavailable (Auto)',
                  cancelled_by: 'system'
              }).eq('id', updatedOrder.id);

              await supabaseAdmin.from('notifications').insert({
                  user_id: updatedOrder.user_id,
                  type: 'order_cancelled',
                  title: 'Order Cancelled',
                  message: `We could not find a delivery partner. Your refund has been initiated.`,
                  data: { order_id: orderId }
              });
              
              // Trigger Refund API safely
              // Note: We need payload for refund.
          }
      } catch (err) {
          console.error('[Shadowfax WebhookHandler] Error:', err);
      }
  }

  // console.log(`[Paytm Webhook] Successfully processed ${orderId}`);
  return res.status(200).send('OK');
}));

// PAYTM REFUND WEBHOOK
router.post('/webhook/refund', asyncHandler(async (req, res) => {
  const paytmParams = req.body;
  // console.log('[Paytm Refund Webhook] Received:', JSON.stringify(paytmParams));

  const receivedChecksum = paytmParams.CHECKSUMHASH;
  if (!receivedChecksum) return res.status(200).send('CHECKSUM_MISSING');

  const paramsForVerify = { ...paytmParams };
  delete paramsForVerify.CHECKSUMHASH;

  const isValid = PaytmChecksum.verifySignature(paramsForVerify, PAYTM_MERCHANT_KEY, receivedChecksum);
  if (!isValid) return res.status(200).send('CHECKSUM_INVALID');

  // Parse fields
  const orderId = paytmParams.ORDERID;
  const refundId = paytmParams.REFID; // Our internal refund ID
  const refundAmount = paytmParams.REFUNDAMOUNT;
  // Use STATUS or refund status field depending on exact payload. 
  // Common Paytm refund webhooks often use 'STATUS' just like payment.
  // But sometimes it might be 'RESULT' or similar. We will assume standard structure.
  
  // NOTE: If this is 'Success Refund' webhook, status is usually 'TXN_SUCCESS' or 'SUCCESS'
  // If 'Accept Refund', it might be 'PENDING'
  
  // Update Payment/Order status
  // We'll update the 'payments' table to reflect refund. 
  // Ideally we should have a 'refunds' table, but for now we might update 'payments' or just log.
  
  // Since we don't have a refunds table explicitly shown in previous code, 
  // we will update the payment status to 'refunded' if it's a full refund.
  
  const { data: payment } = await supabaseAdmin
    .from('payments')
    .select('*, order:orders(id, total_amount)')
    .eq('merchant_order_id', orderId)
    .single();

  if (!payment) return res.status(200).send('ORDER_NOT_FOUND');

  if (paytmParams.STATUS === 'TXN_SUCCESS' || paytmParams.STATUS === 'SUCCESS') {
      // Mark as refunded
      await supabaseAdmin
        .from('payments')
        .update({
          status: 'refunded', // Simple state update
          gateway_response: { ...payment.gateway_response, refund_webhook: paytmParams },
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      // Also update order status if needed
      // await supabaseAdmin.from('orders').update({ payment_status: 'refunded' }).eq('order_number', orderId);
  }

  return res.status(200).send('OK');
}));

// CHECK PAYMENT STATUS
router.get('/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('payment_status, id')
    .eq('order_number', id)
    .single();

  if (error || !order) {
    // Try checking payments table directly if order not found
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('status')
      .eq('merchant_order_id', id)
      .maybeSingle();
      
    if (payment) {
       let code = 'PENDING';
       let state = 'PENDING';
       
       if (payment.status === 'paid') {
         code = 'SUCCESS';
         state = 'COMPLETED';
       } else if (payment.status === 'failed' || payment.status === 'cancelled') {
         code = 'FAILED';
         state = 'FAILED';
       }
       
       return successResponse(res, { code, state });
    }
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Map internal status to generic status expected by frontend
  let code = 'PENDING';
  let state = 'PENDING';
  
  if (order.payment_status === 'paid') {
    code = 'SUCCESS';
    state = 'COMPLETED';
  } else if (order.payment_status === 'failed' || order.payment_status === 'cancelled') {
    code = 'FAILED';
    state = 'FAILED';
  }
  
  successResponse(res, {
    code,
    state,
    transactionId: id
  });
}));

// PAYTM REFUND
router.post('/refund', authenticate, asyncHandler(async (req, res) => {
  const { order_id, refund_amount, reason } = req.body;

  if (!order_id || !refund_amount) {
    throw new ApiError(400, 'Order ID and refund amount are required');
  }

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', order_id)
    .eq('user_id', req.user.id)
    .single();

  if (!order) throw new ApiError(404, 'Order not found');
  if (order.payment_status !== 'paid') throw new ApiError(400, 'Can only refund paid orders');

  const refundId = `REFUND_${Date.now()}`;

  const paytmParams = {
    MID: PAYTM_MID,
    TXNID: order.payment_id,
    ORDERID: order.order_number,
    REFUNDAMOUNT: String(refund_amount),
    REFID: refundId,
  };

  try {
    const checksum = await PaytmChecksum.generateSignature(paytmParams, PAYTM_MERCHANT_KEY);

    const payload = {
      body: paytmParams,
      head: { signature: checksum }
    };

    const response = await fetch(
      `${PAYTM_BASE_URL}/refund/apply`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();
    // console.log('Paytm refund response:', data);

    // Create support ticket for tracking
    await supabaseAdmin
      .from('support_tickets')
      .insert({
        user_id: req.user.id,
        order_id,
        subject: `Refund Request - Order #${order.order_number}`,
        description: reason || 'Refund requested',
        category: 'refund',
        priority: 'high'
      });

    successResponse(res, {
      refund_id: refundId,
      status: data?.body?.resultInfo?.resultStatus || 'PENDING',
      message: 'Refund initiated'
    });
  } catch (err) {
    console.error('Paytm refund error:', err);
    throw new ApiError(500, 'Error processing refund');
  }
}));

// ============================================
// GENERIC PAYMENT ENDPOINTS
// ============================================

// GET PAYMENT STATUS
router.get('/status/:paymentId', authenticate, asyncHandler(async (req, res) => {
  const { data: payment, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('id', req.params.paymentId)
    .single();

  if (error || !payment) throw new ApiError(404, 'Payment not found');

  successResponse(res, {
    payment_id: payment.id,
    status: payment.status,
    amount: payment.amount,
    gateway: payment.gateway,
    transaction_id: payment.transaction_id
  });
}));

// GET USER PAYMENT HISTORY
router.get('/history', authenticate, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const { data: payments, error, count } = await supabaseAdmin
    .from('payments')
    .select('*, order:orders(order_number, vendor_name, total_amount)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) throw new ApiError(500, 'Failed to fetch payments');

  successResponse(res, { payments, page, limit, total: count });
}));

// ============================================
// MOCK PAYMENT (FOR DEV TEST ONLY)
// POST /api/payments/mock-success
// ============================================
if (process.env.NODE_ENV === 'development') {
    router.post('/mock-success', asyncHandler(async (req, res) => {
        const { orderId } = req.body;
        
        // Mark order as paid
        const { data: order } = await supabaseAdmin.from('orders').update({
            payment_status: 'paid',
            status: 'paid', // using paid instead of confirmed
            payment_method: 'mock',
            payment_id: 'MOCK_' + Date.now()
        }).eq('order_number', orderId).select().single();
        
        // Notify
        await supabaseAdmin.from('notifications').insert({
              user_id: order.user_id,
              type: 'payment_success',
              title: 'Mock Payment Successful',
              message: `Mock payment for order #${orderId}`,
              data: { order_id: orderId }
        });

        // Notify Vendor logic... (simplified here)

        successResponse(res, { order }, "Order marked as paid (Mock)");
    }));
}

export default router;
