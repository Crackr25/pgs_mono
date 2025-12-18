import { useState, useEffect } from 'react';
import Head from 'next/head';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/common/Toast';
import apiService from '../../lib/api';

export default function TestOrderStatus() {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBuyerOrders({ per_page: 100 });
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.showError('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (orderNumber, newStatus) => {
    try {
      // This is a direct database change - you'll need to implement the API endpoint
      // For now, show instructions
      toast.showInfo(
        'Manual Update Required',
        `Run this SQL:\nUPDATE orders SET status = '${newStatus}', is_confirmed = 0 WHERE order_number = '${orderNumber}';`,
        10000
      );
      
      // Copy to clipboard
      const sql = `UPDATE orders SET status = '${newStatus}', is_confirmed = 0 WHERE order_number = '${orderNumber}';`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(sql);
        toast.showSuccess('Copied!', 'SQL command copied to clipboard');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!isAuthenticated) {
    return <div className="p-8 text-center">Please log in</div>;
  }

  return (
    <>
      <Head>
        <title>Test Order Status Changer</title>
      </Head>

      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-red-600">🧪 TEST MODE - Order Status Changer</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Click buttons to generate SQL commands to change order status (for testing purposes only)
          </p>
        </div>

        {loading ? (
          <Card className="p-8 text-center">
            <p>Loading...</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">Order {order.order_number}</h3>
                    <p className="text-sm text-secondary-600">
                      Current Status: <span className="font-semibold text-blue-600">{order.status}</span>
                    </p>
                    <p className="text-sm text-secondary-600">
                      Confirmed: <span className="font-semibold">{order.is_confirmed ? 'YES ✅' : 'NO ❌'}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-secondary-600">Product</p>
                    <p className="font-medium">{order.product_name}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-secondary-700 mb-2">
                    Change Status To:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => changeStatus(order.order_number, 'pending')}
                      className={order.status === 'pending' ? 'bg-yellow-100' : ''}
                    >
                      Pending
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => changeStatus(order.order_number, 'confirmed')}
                      className={order.status === 'confirmed' ? 'bg-blue-100' : ''}
                    >
                      Confirmed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => changeStatus(order.order_number, 'in_production')}
                      className={order.status === 'in_production' ? 'bg-indigo-100' : ''}
                    >
                      In Production
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => changeStatus(order.order_number, 'shipped')}
                      className={order.status === 'shipped' ? 'bg-purple-100' : ''}
                    >
                      Shipped ✅
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => changeStatus(order.order_number, 'delivered')}
                      className={order.status === 'delivered' ? 'bg-green-100' : ''}
                    >
                      Delivered ✅
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => changeStatus(order.order_number, 'cancelled')}
                      className={order.status === 'cancelled' ? 'bg-red-100' : ''}
                    >
                      Cancelled
                    </Button>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>💡 Tip:</strong> Set to "Shipped" or "Delivered" to see the "Confirm Receipt" button!
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      SQL command will be copied to clipboard when you click a button.
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <h3 className="text-lg font-bold text-yellow-800 mb-2">
            ⚠️ How to Use This Page
          </h3>
          <ol className="text-sm text-yellow-900 space-y-2 list-decimal list-inside">
            <li>Click a status button above (e.g., "Shipped" or "Delivered")</li>
            <li>SQL command will be copied to your clipboard</li>
            <li>Open your database tool (phpMyAdmin, MySQL Workbench, etc.)</li>
            <li>Paste and run the SQL command</li>
            <li>Go back to your Orders page and refresh</li>
            <li>You should now see the "Confirm Receipt" button!</li>
          </ol>
        </Card>

        <Button
          variant="outline"
          onClick={() => window.location.href = '/buyer/orders'}
          className="w-full"
        >
          ← Back to Orders Page
        </Button>
      </div>
    </>
  );
}
