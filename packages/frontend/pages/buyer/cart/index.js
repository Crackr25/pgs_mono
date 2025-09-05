import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Lock,
  Truck,
  Shield,
  AlertCircle,
  CheckCircle,
  Heart,
  ExternalLink,
  Package
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Skeleton from '../../../components/common/Skeleton';
import { useCart } from '../../../contexts/CartContext';

export default function Cart() {
  const router = useRouter();
  const { cartItems, cartCount, loading, fetchCartItems, updateCartItem, removeFromCart, clearCart } = useCart();
  const [updatingItems, setUpdatingItems] = useState({});
  const [removingItems, setRemovingItems] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => {
    fetchCartItems();
  }, []);

  useEffect(() => {
    // Select all items by default
    if (cartItems.length > 0) {
      const allSelected = {};
      cartItems.forEach(item => {
        allSelected[item.id] = true;
      });
      setSelectedItems(allSelected);
    }
  }, [cartItems]);

  const handleQuantityUpdate = async (itemId, newQuantity) => {
    if (updatingItems[itemId]) return;

    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
      await updateCartItem(itemId, newQuantity);
      await fetchCartItems(); // Refresh cart items
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity. Please try again.');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (removingItems[itemId]) return;

    try {
      setRemovingItems(prev => ({ ...prev, [itemId]: true }));
      await removeFromCart(itemId);
      await fetchCartItems(); // Refresh cart items
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item. Please try again.');
    } finally {
      setRemovingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleSelectAll = (checked) => {
    const newSelected = {};
    cartItems.forEach(item => {
      newSelected[item.id] = checked;
    });
    setSelectedItems(newSelected);
  };

  const handleSelectItem = (itemId, checked) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: checked
    }));
  };

  const getSelectedItems = () => {
    return cartItems.filter(item => selectedItems[item.id]);
  };

  const getSubtotal = () => {
    return getSelectedItems().reduce((total, item) => total + (item.quantity * parseFloat(item.unit_price || 0)), 0);
  };

  const getShipping = () => {
    const subtotal = getSubtotal();
    return subtotal > 100 ? 0 : 15; // Free shipping over $100
  };

  const getTax = () => {
    return getSubtotal() * 0.12; // 12% tax
  };

  const getDiscount = () => {
    return promoApplied ? getSubtotal() * 0.1 : 0; // 10% discount
  };

  const getTotal = () => {
    return getSubtotal() + getShipping() + getTax() - getDiscount();
  };

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'save10') {
      setPromoApplied(true);
    } else {
      alert('Invalid promo code');
    }
  };

  const handleCheckout = () => {
    const selectedCartItems = getSelectedItems();
    if (selectedCartItems.length === 0) {
      alert('Please select items to checkout');
      return;
    }
    
    // Navigate to checkout with selected items
    router.push('/buyer/checkout');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <Card key={i} className="p-6">
                <div className="flex space-x-4">
                  <Skeleton className="h-24 w-24" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div>
            <Card className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Shopping Cart - Pinoy Global Supply</title>
        <meta name="description" content="Review and manage your cart items" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </button>
            <div className="h-6 border-l border-secondary-300"></div>
            <h1 className="text-2xl font-bold text-secondary-900">
              Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
            </h1>
          </div>
          
          {cartItems.length > 0 && (
            <Button
              variant="outline"
              onClick={() => clearCart()}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          )}
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-secondary-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-secondary-400" />
            </div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">Your cart is empty</h2>
            <p className="text-secondary-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start shopping to find great products!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/buyer">
                <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                  <Package className="w-4 h-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
              <Link href="/buyer/suppliers">
                <Button variant="outline">
                  Find Suppliers
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Cart Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={cartItems.length > 0 && cartItems.every(item => selectedItems[item.id])}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="font-medium">Select All ({cartItems.length} items)</span>
                  </label>
                  <div className="text-sm text-secondary-600">
                    {Object.values(selectedItems).filter(Boolean).length} of {cartItems.length} selected
                  </div>
                </div>
              </Card>

              {/* Cart Items */}
              {cartItems.map((item) => (
                <Card key={item.id} className="p-6">
                  <div className="flex space-x-4">
                    {/* Checkbox */}
                    <div className="flex items-start pt-2">
                      <input
                        type="checkbox"
                        checked={selectedItems[item.id] || false}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>

                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-secondary-100 rounded-lg overflow-hidden">
                        {item.product.images && item.product.images.length > 0 ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}${item.product.images[0]}`}
                            alt={item.product.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-secondary-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link href={`/buyer/products/${item.product.id}`}>
                            <h3 className="font-semibold text-secondary-900 hover:text-primary-600 cursor-pointer line-clamp-2">
                              {item.product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-secondary-600 mt-1">
                            by {item.product.company?.name}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removingItems[item.id]}
                          className="p-1 text-secondary-400 hover:text-red-600 disabled:opacity-50"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Specifications */}
                      {item.selected_specifications && Object.keys(item.selected_specifications).length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(item.selected_specifications).map(([key, value]) => (
                              <span
                                key={key}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary-100 text-secondary-700"
                              >
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-secondary-600">Qty:</span>
                            <div className="flex items-center border border-secondary-300 rounded-md">
                              <button
                                onClick={() => handleQuantityUpdate(item.id, Math.max(1, item.quantity - 1))}
                                disabled={updatingItems[item.id] || item.quantity <= 1}
                                className="p-1 hover:bg-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                                disabled={updatingItems[item.id] || item.quantity >= item.product.stock_quantity}
                                className="p-1 hover:bg-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Stock Info */}
                          <div className="text-xs text-secondary-500">
                            {item.product.stock_quantity} available
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-lg font-bold text-secondary-900">
                            ${(item.quantity * parseFloat(item.unit_price || 0)).toFixed(2)}
                          </div>
                          <div className="text-sm text-secondary-600">
                            ${parseFloat(item.unit_price || 0).toFixed(2)} each
                          </div>
                        </div>
                      </div>

                      {/* Stock Warning */}
                      {item.quantity >= item.product.stock_quantity && (
                        <div className="mt-2 flex items-center space-x-1 text-amber-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">Maximum quantity reached</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Promo Code */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Promo Code</h3>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1 px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Button
                      onClick={handleApplyPromo}
                      variant="outline"
                      disabled={!promoCode.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                  {promoApplied && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Promo code applied: 10% off</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Order Summary */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({Object.values(selectedItems).filter(Boolean).length} items)</span>
                    <span>${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{getShipping() === 0 ? 'FREE' : `$${getShipping().toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${getTax().toFixed(2)}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount (SAVE10)</span>
                      <span>-${getDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-secondary-200 pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${getTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Free Shipping Banner */}
                {getSubtotal() < 100 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center space-x-2 text-blue-700">
                      <Truck className="w-4 h-4" />
                      <span className="text-sm">
                        Add ${(100 - getSubtotal()).toFixed(2)} more for FREE shipping
                      </span>
                    </div>
                  </div>
                )}

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={Object.values(selectedItems).filter(Boolean).length === 0}
                  className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Proceed to Checkout
                </Button>

                {/* Security Badge */}
                <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-secondary-600">
                  <Shield className="w-4 h-4" />
                  <span>Secure checkout guaranteed</span>
                </div>
              </Card>

              {/* Recommendations */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">You might also like</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border border-secondary-200 rounded-md hover:bg-secondary-50">
                    <div className="w-12 h-12 bg-secondary-100 rounded-md flex items-center justify-center">
                      <Package className="w-6 h-6 text-secondary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-secondary-900">Related Product</h4>
                      <p className="text-xs text-secondary-600">$25.99</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
