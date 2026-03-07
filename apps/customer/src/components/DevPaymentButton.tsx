import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { nodeApiService as apiService } from '../utils/nodeApi';
import { toast } from 'sonner';
import { CreditCard, Loader2 } from 'lucide-react';

export const DevPaymentButton: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);

    const handlePayTest = async () => {
        if (!isAuthenticated || !user?.phone) {
            toast.error('Please login first to test payment');
            return;
        }

        const amountStr = prompt('Enter payment amount (₹):', '1');
        if (amountStr === null) return;
        const amount = parseFloat(amountStr) || 1;

        setLoading(true);
        try {
            // 1. Get a random vendor and product for the test order
            const vendorsRes = await apiService.getVendors();
            if (!vendorsRes.success || !vendorsRes.data || vendorsRes.data.length === 0) {
                throw new Error('No vendors available for test order');
            }
            const testVendor = vendorsRes.data[0];

            const productsRes = await apiService.getVendorProducts(testVendor.id);
            if (!productsRes.success || !productsRes.data || !productsRes.data.products || productsRes.data.products.length === 0) {
                throw new Error('No products available for test order');
            }
            const testProduct = productsRes.data.products[0];

            // 2. Get user address
            const addressRes = await apiService.getUserAddresses(user.phone);
            if (!addressRes.success || !addressRes.data || addressRes.data.length === 0) {
                throw new Error('Please add an address first to test payment');
            }
            const testAddress = addressRes.data[0];

            // 3. Create dummy order
            toast.info('Creating test order...');
            const orderPayload = {
                vendor_id: testVendor.id,
                items: [{
                    product_id: testProduct.id,
                    quantity: 1
                }],
                delivery_address: testAddress,
                delivery_phone: user.phone,
                payment_method: 'wallet', // Standard for online
                special_instructions: '[DEV_PAY_TEST]'
            };

            const orderRes = await apiService.createOrder(user.phone, orderPayload);
            if (!orderRes.success || !orderRes.data?.order) {
                throw new Error(orderRes.message || 'Failed to create test order');
            }

            const order = orderRes.data.order;
            const orderId = order.id;

            // 4. Initiate Paytm Payment
            toast.info('Initiating Paytm...');
            const payRes = await (apiService as any).initiatePaytmPayment(user.phone, orderId, amount, user?.id || user.phone);

            const responseData = payRes.data || payRes;
            const paytmResp = responseData.paytmResponse || responseData.initiateTransactionResponse;
            const token = responseData.txnToken || paytmResp?.body?.txnToken;

            if (payRes.success && token && paytmResp) {
                const mid = responseData.mid || paytmResp.body.mid;
                const PAYTM_ENV = import.meta.env.VITE_PAYTM_ENV;
                const PAYTM_BASE_URL = PAYTM_ENV === 'production'
                    ? 'https://secure.paytmpayments.com'
                    : 'https://securestage.paytmpayments.com';

                toast.info('Loading payment sheet...');
                const script = document.createElement('script');
                script.src = `${PAYTM_BASE_URL}/merchantpgpui/checkoutjs/merchants/${mid}.js`;
                script.async = true;
                script.crossOrigin = "anonymous";
                script.onload = () => {
                    // @ts-ignore
                    if (window.Paytm && window.Paytm.CheckoutJS) {
                        // @ts-ignore
                        const checkoutJs = window.Paytm.CheckoutJS;
                        checkoutJs.onLoad(() => {
                            const config = {
                                merchant: { mid: mid, name: "Gutzo Dev Test", redirect: false },
                                flow: "DEFAULT",
                                data: {
                                    orderId: order.order_number,
                                    token: token,
                                    tokenType: "TXN_TOKEN",
                                    amount: String(amount)
                                },
                                handler: {
                                    notifyMerchant: (eventName: string) => {
                                        if (eventName === 'APP_CLOSED') setLoading(false);
                                    },
                                    transactionStatus: (paymentStatus: any) => {
                                        console.log('🧪 [Dev Test] Skip callback DB update. Waiting for Webhook...');
                                        // @ts-ignore
                                        window.Paytm.CheckoutJS.close();

                                        // Directly redirect to status page
                                        // We do NOT submit the form to /api/payments/callback
                                        // This ensures the DB is ONLY updated by the background S2S webhook
                                        window.location.href = `/payment-status?orderId=${order.order_number}`;
                                    }
                                }
                            };
                            checkoutJs.init(config).then(() => checkoutJs.invoke())
                                .catch((err: any) => {
                                    console.error('Paytm Init Error:', err);
                                    setLoading(false);
                                    toast.error('Payment sheet failed');
                                });
                        });
                    }
                };
                document.body.appendChild(script);
            } else {
                throw new Error('Invalid Paytm response');
            }

        } catch (error: any) {
            console.error('Test Pay Error:', error);
            toast.error(error.message || 'Test payment failed');
            setLoading(false);
        }
    };

    if (import.meta.env.PROD) return null; // Safety: hide in prod if needed, though user asked for both

    return (
        <div className="fixed bottom-24 right-6 z-50">
            <button
                onClick={handlePayTest}
                disabled={loading}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-full shadow-2xl transition-all active:scale-95 disabled:opacity-50"
            >
                {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <>
                        <CreditCard className="h-5 w-5" />
                        <span>Dev Pay Test</span>
                    </>
                )}
            </button>
        </div>
    );
};
