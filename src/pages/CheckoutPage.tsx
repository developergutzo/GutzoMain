import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ShoppingCart, CreditCard, Package, CheckCircle } from "lucide-react";
import { useRouter } from "../components/Router";
import { useEffect } from "react";

export function CheckoutPage() {
  const { navigate } = useRouter();

  // Ensure page starts at top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gutzo-primary" style={{ fontFamily: 'Poppins' }}>
                Gutzo
              </h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Checkout</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins' }}>
            Checkout
          </h1>
          <p className="text-gray-600 text-lg">
            Complete your order and get healthy meals delivered
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 bg-gutzo-primary rounded-full flex items-center justify-center text-white mb-2">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gutzo-primary">Cart</span>
            </div>
            <div className="flex-1 h-1 bg-gutzo-primary mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 bg-gutzo-primary rounded-full flex items-center justify-center text-white mb-2">
                <Package className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gutzo-primary">Details</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 mb-2">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-600">Payment</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 mb-2">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-600">Confirm</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gutzo-primary">Delivery Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="font-medium text-gray-900 mb-2">Home</p>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    123, Sample Street<br />
                    Coimbatore, Tamil Nadu - 641001<br />
                    Phone: +91 XXXXX-XXXXX
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-gutzo-primary text-gutzo-primary hover:bg-gutzo-highlight"
                >
                  Change Address
                </Button>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gutzo-primary">Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sample Item 1 */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Healthy Bowl</h3>
                    <p className="text-sm text-gray-600">Vendor: The Fruit Bowl Co</p>
                    <p className="text-sm text-gutzo-primary font-medium mt-1">₹250</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Qty: 1</p>
                  </div>
                </div>

                {/* Sample Item 2 */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Green Smoothie</h3>
                    <p className="text-sm text-gray-600">Vendor: The Fruit Bowl Co</p>
                    <p className="text-sm text-gutzo-primary font-medium mt-1">₹150</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Qty: 2</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gutzo-primary">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-gutzo-primary rounded-lg cursor-pointer bg-gutzo-highlight">
                  <input 
                    type="radio" 
                    name="payment" 
                    defaultChecked
                    className="w-4 h-4 text-gutzo-primary"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Pay Online</p>
                    <p className="text-sm text-gray-600">UPI, Card, Wallet</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gutzo-primary">
                  <input 
                    type="radio" 
                    name="payment"
                    className="w-4 h-4 text-gutzo-primary"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive</p>
                  </div>
                </label>
              </CardContent>
            </Card>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-gutzo-primary">Price Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>₹550</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Platform Fee</span>
                    <span>₹5</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>GST (5%)</span>
                    <span>₹27.50</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between font-bold text-gray-900 text-lg">
                      <span>Total</span>
                      <span className="text-gutzo-primary">₹582.50</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gutzo-highlight rounded-lg p-4">
                  <p className="text-sm text-gutzo-selected">
                    💰 You saved ₹50 on delivery fees!
                  </p>
                </div>

                <Button 
                  className="w-full bg-gutzo-primary hover:bg-gutzo-primary-hover text-white py-3 rounded-lg font-medium"
                  onClick={() => {
                    // This would normally process payment
                    alert('Payment processing will be integrated here');
                  }}
                >
                  Proceed to Payment
                </Button>

                <div className="text-center">
                  <button 
                    onClick={() => navigate('/')}
                    className="text-gutzo-primary hover:text-gutzo-primary-hover text-sm font-medium"
                  >
                    Continue Shopping
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="font-medium text-gray-900 text-sm">Secure Payment</p>
            <p className="text-xs text-gray-600 mt-1">100% secure transactions</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <Package className="h-8 w-8 text-gutzo-primary mx-auto mb-2" />
            <p className="font-medium text-gray-900 text-sm">Fresh Delivery</p>
            <p className="text-xs text-gray-600 mt-1">Delivered fresh & hot</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <CreditCard className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="font-medium text-gray-900 text-sm">Easy Returns</p>
            <p className="text-xs text-gray-600 mt-1">Hassle-free refunds</p>
          </div>
        </div>
      </main>
    </div>
  );
}
