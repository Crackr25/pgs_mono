import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  CreditCard, 
  MapPin, 
  Calendar,
  Download,
  Mail,
  Phone,
  ArrowRight,
  Home,
  ShoppingBag,
  MessageCircle,
  Star
} from 'lucide-react';

export default function OrderSuccess() {
  const router = useRouter();
  const { orderId } = router.query;
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock order data - replace with actual API call
  useEffect(() => {
    if (router.isReady) {
      // Simulate API call
      setTimeout(() => {
        const currentOrderId = orderId || 'ORD-2024-001';
        setOrderData({
          id: currentOrderId,
          orderNumber: `#${currentOrderId}`,
          status: 'confirmed',
          total: 15750.00,
          currency: 'PHP',
          paymentMethod: 'Credit Card',
          estimatedDelivery: '3-5 business days',
          trackingNumber: null,
          createdAt: new Date().toISOString(),
          items: [
            {
              id: 1,
              name: 'Premium Rice - Jasmine',
              image: '/api/placeholder/80/80',
              quantity: 50,
              unit: 'kg',
              unitPrice: 85.00,
              total: 4250.00,
              supplier: 'Golden Harvest Co.',
              specifications: { Grade: 'Premium', Origin: 'Thailand' }
            },
            {
              id: 2,
              name: 'Organic Coconut Oil',
              image: '/api/placeholder/80/80',
              quantity: 24,
              unit: 'bottles',
              unitPrice: 125.00,
              total: 3000.00,
              supplier: 'Pure Coconut Ltd.',
              specifications: { Volume: '500ml', Type: 'Extra Virgin' }
            }
          ],
          shippingAddress: {
            name: 'John Doe',
            company: 'ABC Trading Corp',
            address: '123 Business Street',
            city: 'Manila',
            province: 'Metro Manila',
            postalCode: '1000',
            phone: '+63 912 345 6789'
          },
          billing: {
            subtotal: 7250.00,
            shipping: 500.00,
            tax: 725.00,
            discount: 0.00,
            total: 8475.00
          }
        });
        setLoading(false);
      }, 1000);
    }
  }, [router.isReady, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Package size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find the order you're looking for.</p>
          <Link href="/buyer/orders" className="text-red-600 hover:text-red-700 font-medium">
            View All Orders →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Thank you for your order. We've received your order and will process it shortly.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="text-xl font-bold text-gray-900">{orderData.orderNumber}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-green-100 rounded-full p-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Order Confirmed</p>
                  <p className="text-sm text-gray-600">
                    {new Date(orderData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Estimated Delivery</span>
                  </div>
                  <span className="font-medium text-gray-900">{orderData.estimatedDelivery}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 pb-4 border-b last:border-b-0 last:pb-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">by {item.supplier}</p>
                      {item.specifications && (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {Object.entries(item.specifications).map(([key, value]) => (
                            <span key={key} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Qty: {item.quantity} {item.unit}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          ₱{item.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Shipping Address
              </h2>
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900">{orderData.shippingAddress.name}</p>
                <p>{orderData.shippingAddress.company}</p>
                <p>{orderData.shippingAddress.address}</p>
                <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.province} {orderData.shippingAddress.postalCode}</p>
                <p className="mt-2 flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {orderData.shippingAddress.phone}
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Order Processing</p>
                    <p className="text-sm text-gray-600">We'll prepare your items and coordinate with suppliers.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Shipping Notification</p>
                    <p className="text-sm text-gray-600">You'll receive tracking information once your order ships.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Delivery</p>
                    <p className="text-sm text-gray-600">Your order will be delivered within {orderData.estimatedDelivery}.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₱{orderData.billing.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">₱{orderData.billing.shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">₱{orderData.billing.tax.toLocaleString()}</span>
                </div>
                {orderData.billing.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₱{orderData.billing.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">₱{orderData.billing.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center text-sm text-gray-600">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span>Paid via {orderData.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Order Details
                </button>
                <Link href="/buyer/orders" className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors">
                  <Package className="h-4 w-4 mr-2" />
                  Track Order
                </Link>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gray-50 rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
              <div className="space-y-3">
                <Link href="/buyer/support" className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Link>
                <Link href="/buyer/faq" className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  View FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Continue Shopping</h3>
            <p className="text-gray-600 mb-4">Discover more products from our trusted suppliers</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/buyer/products" className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Products
              </Link>
              <Link href="/buyer" className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors">
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
