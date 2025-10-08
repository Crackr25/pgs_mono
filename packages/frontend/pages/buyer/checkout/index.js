import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { Elements } from '@stripe/react-stripe-js';
import { 
  ArrowLeft,
  Lock,
  Truck,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Edit,
  Plus,
  Package,
  Shield
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import apiService from '../../../lib/api';
import { useCart } from '../../../contexts/CartContext';
import ShippingAddressModal from '../../../components/checkout/ShippingAddressModal';
import StripePaymentForm from '../../../components/checkout/StripePaymentForm';
import getStripe from '../../../lib/stripe';

export default function Checkout() {
  const router = useRouter();
  const { fetchCartItems, removeCartItems } = useCart();
  const [cartItems, setCartItems] = useState([]); // Use local state for selected items
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Shipping address states
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Philippines',
    phone: '',
    email: ''
  });
  
  const [billingAddress, setBillingAddress] = useState({
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Philippines',
    phone: '',
    email: ''
  });
  
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  
  // Stripe payment states
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [stripePromise] = useState(() => getStripe());
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  const [orderNotes, setOrderNotes] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        // Get selected items from sessionStorage
        const checkoutItemsData = sessionStorage.getItem('checkoutItems');
        if (checkoutItemsData) {
          const selectedItems = JSON.parse(checkoutItemsData);
          setCartItems(selectedItems);
          console.log('Loaded selected items for checkout:', selectedItems);
        } else {
          // Fallback: redirect back to cart if no selected items
          console.warn('No selected items found, redirecting to cart');
          router.push('/buyer/cart');
          return;
        }
        
        await fetchSavedAddresses();
      } finally {
        setLoading(false);
      }
    };
    
    initializeCheckout();
  }, []);

  const fetchSavedAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await apiService.getShippingAddresses();
      if (response.success) {
        setSavedAddresses(response.data);
        
        // Auto-select default address if available
        const defaultAddress = response.data.find(addr => addr.is_default);
        if (defaultAddress && !selectedAddress) {
          setSelectedAddress(defaultAddress);
          populateShippingForm(defaultAddress);
        } else if (response.data.length === 0) {
          setUseNewAddress(true);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const populateShippingForm = (address) => {
    setShippingAddress({
      firstName: address.first_name,
      lastName: address.last_name,
      company: address.company || '',
      address1: address.address_line_1,
      address2: address.address_line_2 || '',
      city: address.city,
      state: address.state,
      zipCode: address.zip_code,
      country: address.country,
      phone: address.phone,
      email: address.email
    });
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    populateShippingForm(address);
    setUseNewAddress(false);
  };

  const handleSaveNewAddress = async () => {
    try {
      const addressData = {
        first_name: shippingAddress.firstName,
        last_name: shippingAddress.lastName,
        company: shippingAddress.company,
        address_line_1: shippingAddress.address1,
        address_line_2: shippingAddress.address2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip_code: shippingAddress.zipCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone,
        email: shippingAddress.email,
        is_default: savedAddresses.length === 0 // Set as default if first address
      };

      const response = await apiService.createShippingAddress(addressData);
      if (response.success) {
        await fetchSavedAddresses();
        return true;
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
    return false;
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      // Validate shipping address
      if (!shippingAddress.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!shippingAddress.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!shippingAddress.address1.trim()) newErrors.address1 = 'Address is required';
      if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
      if (!shippingAddress.state.trim()) newErrors.state = 'State is required';
      if (!shippingAddress.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
      if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!shippingAddress.email.trim()) newErrors.email = 'Email is required';
      
      // Validate billing address if different
      if (!sameAsShipping) {
        if (!billingAddress.firstName.trim()) newErrors.billingFirstName = 'Billing first name is required';
        if (!billingAddress.lastName.trim()) newErrors.billingLastName = 'Billing last name is required';
        if (!billingAddress.address1.trim()) newErrors.billingAddress1 = 'Billing address is required';
        if (!billingAddress.city.trim()) newErrors.billingCity = 'Billing city is required';
        if (!billingAddress.state.trim()) newErrors.billingState = 'Billing state is required';
        if (!billingAddress.zipCode.trim()) newErrors.billingZipCode = 'Billing ZIP code is required';
      }
    }
    
    if (step === 2) {
      // Validate payment method - Stripe handles validation internally
      if (paymentMethod === 'stripe' && !clientSecret) {
        newErrors.payment = 'Payment setup required';
      }
    }
    
    if (step === 3) {
      if (!agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = async () => {
    if (validateStep(currentStep)) {
      // If using new address and want to save it, save before proceeding
      if (currentStep === 1 && useNewAddress && document.getElementById('saveAddress')?.checked) {
        const saved = await handleSaveNewAddress();
        if (!saved) {
          alert('Failed to save address. Please try again.');
          return;
        }
      }
      
      // If moving to payment step, create payment intent
      if (currentStep === 1) {
        await createPaymentIntent();
      }
      
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.quantity * parseFloat(item.unit_price || 0)), 0);
  };

  const getShipping = () => {
    const subtotal = getSubtotal();
    return subtotal > 100 ? 0 : 15;
  };

  const getTax = () => {
    return getSubtotal() * 0.12;
  };

  const getPlatformFee = () => {
    const subtotal = getSubtotal();
    const shipping = getShipping();
    const tax = getTax();
    const productTotal = subtotal + shipping + tax;
    return productTotal * 0.079; // 7.9% platform fee added on top of product total
  };

  const getTotal = () => {
    return getSubtotal() + getShipping() + getTax() + getPlatformFee();
  };

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      console.log('Creating order and payment intent...');
      console.log('Selected cart items for checkout:', cartItems);
      
      // Group cart items by merchant (company)
      const merchantGroups = cartItems.reduce((groups, item) => {
        const companyId = item.product.company?.id;
        console.log(`Processing item: ${item.product.name}, Company ID: ${companyId}, Company:`, item.product.company);
        
        if (!companyId) {
          throw new Error(`Product "${item.product.name}" has no associated company`);
        }
        if (!groups[companyId]) {
          groups[companyId] = {
            company: item.product.company,
            items: [],
            total: 0
          };
        }
        groups[companyId].items.push(item);
        groups[companyId].total += item.quantity * parseFloat(item.unit_price || 0);
        return groups;
      }, {});

      console.log('Merchant groups:', merchantGroups);
      
      // For now, we'll handle single merchant orders
      const merchantIds = Object.keys(merchantGroups).filter(id => id !== 'undefined' && id !== 'null');
      if (merchantIds.length === 0) {
        throw new Error('No valid merchant found for cart items');
      }
      if (merchantIds.length > 1) {
        throw new Error('Multi-merchant orders not yet supported');
      }

      const merchantId = parseInt(merchantIds[0]);
      const orderTotal = getTotal();
      const firstItem = cartItems[0];

      // Validate required data
      if (!merchantId || isNaN(merchantId)) {
        throw new Error('Invalid merchant ID');
      }
      if (!shippingAddress.email || !shippingAddress.firstName || !shippingAddress.lastName) {
        throw new Error('Complete customer information is required');
      }
      if (orderTotal < 0.50) {
        throw new Error('Order total must be at least $0.50');
      }

      // Step 1: Create order first
      const shippingAddressString = `${shippingAddress.address1}${shippingAddress.address2 ? ', ' + shippingAddress.address2 : ''}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}, ${shippingAddress.country}`;
      
      const orderData = {
        company_id: merchantId,
        product_name: cartItems.length === 1 
          ? firstItem.product.name 
          : `${cartItems.length} items from ${firstItem.product.company.name}`,
        quantity: cartItems.reduce((total, item) => total + item.quantity, 0),
        total_amount: orderTotal,
        buyer_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        buyer_email: shippingAddress.email,
        buyer_company: shippingAddress.company || null,
        shipping_address: shippingAddressString,
        notes: orderNotes || null,
        payment_method: 'stripe',
        status: 'pending', // Order starts as pending until payment succeeds
        payment_status: 'pending',
        // Store cart items as JSON in notes for now
        cart_items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          selected_specifications: item.selected_specifications
        })),
        billing_address: sameAsShipping ? shippingAddressString : `${billingAddress.address1}${billingAddress.address2 ? ', ' + billingAddress.address2 : ''}, ${billingAddress.city}, ${billingAddress.state} ${billingAddress.zipCode}, ${billingAddress.country}`
      };

      console.log('Creating order with data:', orderData);
      
      const orderResponse = await apiService.request('/orders', {
        method: 'POST',
        data: orderData
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      const createdOrder = orderResponse.data;
      console.log('Order created successfully:', createdOrder);

      // Step 2: Create payment intent with order ID
      const paymentResponse = await apiService.createOrderPaymentIntent({
        order_id: createdOrder.id,
        customer_email: shippingAddress.email,
        platform_fee_percentage: 7.9
      });

      if (paymentResponse.success) {
        setClientSecret(paymentResponse.client_secret);
        setPaymentIntentId(paymentResponse.payment_intent_id);
        
        // Store order ID for later use
        sessionStorage.setItem('pendingOrderId', createdOrder.id);
        
        console.log('Payment intent created successfully for order:', createdOrder.id);
      } else {
        throw new Error(paymentResponse.message || 'Failed to create payment intent');
      }
    } catch (error) {
      console.error('Error creating order and payment intent:', error);
      setErrors({ payment: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      setSubmitting(true);
      
      // Get the order ID that was created during payment intent creation
      const orderId = sessionStorage.getItem('pendingOrderId');
      
      if (!orderId) {
        throw new Error('Order ID not found. Please try again.');
      }
      
      console.log('Payment succeeded for order:', orderId);
      console.log('Payment Intent:', paymentIntent);
      
      // Confirm payment on backend (order already exists, just confirm payment)
      const confirmResponse = await apiService.confirmPayment({
        payment_intent_id: paymentIntent.id,
        order_id: orderId
      });
      
      console.log('Payment confirmation response:', confirmResponse);
      
      if (confirmResponse.success) {
        // Clear selected items from sessionStorage
        sessionStorage.removeItem('checkoutItems');
        sessionStorage.removeItem('pendingOrderId');
        
        // Remove ordered items from cart
        try {
          const cartItemIds = cartItems.map(item => item.id);
          console.log('Removing cart items:', cartItemIds);
          await removeCartItems(cartItemIds);
          console.log('Cart items removed successfully');
        } catch (cartError) {
          console.error('Error removing cart items:', cartError);
          // Don't fail the order if cart removal fails
        }
        
        // Redirect to success page
        router.push(`/buyer/orders/success?order_id=${orderId}`);
      } else {
        throw new Error(confirmResponse.message || 'Failed to confirm payment');
      }
      
    } catch (error) {
      console.error('Error completing order:', error);
      setErrors({ order: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setErrors({ payment: error.message || 'Payment failed. Please try again.' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
        <Link href="/buyer">
          <Button className="bg-primary-600 hover:bg-primary-700 text-white">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Checkout - Pinoy Global Supply</title>
        <meta name="description" content="Complete your order securely" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/buyer/cart">
              <button className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Cart</span>
              </button>
            </Link>
            <div className="h-6 border-l border-secondary-300"></div>
            <h1 className="text-2xl font-bold text-secondary-900">Checkout</h1>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-secondary-600">
            <Lock className="w-4 h-4" />
            <span>Secure Checkout</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-8 py-6">
          {[
            { step: 1, title: 'Shipping', icon: Truck },
            { step: 2, title: 'Payment', icon: CreditCard },
            { step: 3, title: 'Review', icon: CheckCircle }
          ].map(({ step, title, icon: Icon }) => (
            <div key={step} className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= step 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-secondary-200 text-secondary-600'
              }`}>
                {currentStep > step ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span className={`text-sm font-medium ${
                currentStep >= step ? 'text-primary-600' : 'text-secondary-600'
              }`}>
                {title}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
                
                {/* Address Selection */}
                {!loadingAddresses && savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Choose Address</h3>
                      <Button
                        onClick={() => setShowAddressModal(true)}
                        variant="outline"
                        className="text-sm"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Manage Addresses
                      </Button>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      {savedAddresses.map((address) => (
                        <label
                          key={address.id}
                          className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedAddress?.id === address.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="savedAddress"
                            checked={selectedAddress?.id === address.id}
                            onChange={() => handleAddressSelect(address)}
                            className="mt-1 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">
                                {address.first_name} {address.last_name}
                              </span>
                              {address.label && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                                  {address.label}
                                </span>
                              )}
                              {address.is_default && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                                  Default
                                </span>
                              )}
                            </div>
                            {address.company && (
                              <p className="text-sm text-gray-600">{address.company}</p>
                            )}
                            <p className="text-sm text-gray-600">
                              {address.address_line_1}
                              {address.address_line_2 && `, ${address.address_line_2}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} {address.zip_code}
                            </p>
                            <p className="text-sm text-gray-600">{address.phone}</p>
                          </div>
                        </label>
                      ))}
                      
                      <label className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        useNewAddress ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="savedAddress"
                          checked={useNewAddress}
                          onChange={() => {
                            setUseNewAddress(true);
                            setSelectedAddress(null);
                          }}
                          className="mt-1 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex items-center space-x-2">
                          <Plus className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-900">Use a new address</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
                
                {/* Show form if using new address or no saved addresses */}
                {(useNewAddress || savedAddresses.length === 0) && (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.firstName}
                      onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.firstName ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.lastName}
                      onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.lastName ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.company}
                    onChange={(e) => setShippingAddress({...shippingAddress, company: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.address1}
                    onChange={(e) => setShippingAddress({...shippingAddress, address1: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.address1 ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.address1 && <p className="text-red-500 text-xs mt-1">{errors.address1}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.address2}
                    onChange={(e) => setShippingAddress({...shippingAddress, address2: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.city ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.state ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.zipCode ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress({...shippingAddress, email: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>

                    {/* Save Address Option */}
                    {useNewAddress && (
                      <div className="mb-6">
                        <label className="flex items-center space-x-2">
                          <input
                            id="saveAddress"
                            type="checkbox"
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">Save this address for future orders</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* Billing Address Toggle */}
                <div className="mb-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Billing address is the same as shipping address</span>
                  </label>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleNextStep} className="bg-primary-600 hover:bg-primary-700 text-white">
                    Continue to Payment
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 2: Payment Information */}
            {currentStep === 2 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Payment Information</h2>
                
                {/* Error Display */}
                {errors.payment && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-900">Payment Setup Error</h4>
                        <p className="text-sm text-red-700 mt-1">{errors.payment}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Processing Information */}
                {cartItems.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">How Payment Works</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="font-medium">Your payment:</span> ${getTotal().toFixed(2)} processed securely via Stripe
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="font-medium">Platform fee:</span> ${(getTotal() * 0.025).toFixed(2)} (2.5%) for secure processing
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="font-medium">Seller receives:</span> ${(getTotal() - (getTotal() * 0.025)).toFixed(2)} 
                          {cartItems[0]?.product?.company?.preferred_payout_method === 'stripe' ? (
                            <span className="text-blue-600 ml-1">(automatic payout via Stripe)</span>
                          ) : (
                            <span className="text-green-600 ml-1">(manual payout by platform)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stripe Elements Payment Form */}
                {clientSecret && stripePromise ? (
                  <Elements 
                    stripe={stripePromise} 
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#2563eb',
                          colorBackground: '#ffffff',
                          colorText: '#374151',
                          colorDanger: '#dc2626',
                          fontFamily: 'system-ui, sans-serif',
                          spacingUnit: '4px',
                          borderRadius: '6px'
                        }
                      }
                    }}
                  >
                    <StripePaymentForm
                      clientSecret={clientSecret}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      loading={submitting}
                      orderTotal={getTotal().toFixed(2)}
                      merchantName={cartItems[0]?.product?.company?.name || 'Merchant'}
                    />
                  </Elements>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Setting up secure payment...</p>
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <Button onClick={handlePrevStep} variant="outline">
                    Back to Shipping
                  </Button>
                  {/* Payment form handles the submit button */}
                </div>
              </Card>
            )}

            {/* Step 3: Order Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Order Items */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Order Review</h2>
                  
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          {item.product.images && item.product.images.length > 0 ? (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}${item.product.images[0]}`}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                          <p className="text-sm text-gray-600">by {item.product.company?.name}</p>
                          {item.selected_specifications && Object.keys(item.selected_specifications).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(item.selected_specifications).map(([key, value]) => (
                                <span key={key} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            ${(item.quantity * parseFloat(item.unit_price || 0)).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Qty: {item.quantity} × ${parseFloat(item.unit_price || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Order Notes */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Order Notes (Optional)</h3>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Special instructions for your order..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </Card>

                {/* Payment Confirmation Notice */}
                <Card className="p-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-green-900">Payment Completed</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Your payment has been processed successfully. Your order will be confirmed shortly.
                      </p>
                      
                      {/* Payout Information */}
                      {cartItems.length > 0 && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-xs text-green-800">
                            <div className="font-medium mb-1">Payment Distribution:</div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Total Paid:</span>
                                <span>${getTotal().toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Platform Fee:</span>
                                <span>-${(getTotal() * 0.025).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-medium border-t border-green-300 pt-1">
                                <span>Seller Payout:</span>
                                <span>${(getTotal() - (getTotal() * 0.025)).toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="mt-2 text-xs">
                              {cartItems[0]?.product?.company?.preferred_payout_method === 'stripe' ? (
                                <div className="flex items-center space-x-1">
                                  <span>💳</span>
                                  <span>Seller will receive automatic payout via Stripe</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1">
                                  <span>🏦</span>
                                  <span>Seller payout will be processed by platform team</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Error Display */}
                {errors.order && (
                  <Card className="p-6">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-900">Order Error</h4>
                        <p className="text-sm text-red-700 mt-1">{errors.order}</p>
                      </div>
                    </div>
                  </Card>
                )}

                <div className="flex justify-center">
                  {submitting ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Finalizing your order...</p>
                    </div>
                  ) : (
                    <p className="text-center text-gray-600 py-4">
                      Processing complete. You will be redirected shortly.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cartItems.length} items)</span>
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
                <div className="flex justify-between text-sm">
                  <span className="flex items-center">
                    Platform Fee (Secure Processing)
                    <Shield className="w-3 h-3 ml-1 text-green-600" />
                  </span>
                  <span>${getPlatformFee().toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1 mb-2">
                  <div className="flex items-center">
                    <Shield className="w-3 h-3 mr-1 text-green-600" />
                    2.5% fee for secure payment processing, fraud protection & buyer guarantee
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Payout Information - Show after payment step */}
                {currentStep >= 2 && cartItems.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xs text-blue-800 mb-2">
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="font-medium">Payment Processing:</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Platform Fee (2.5%):</span>
                          <span>-${(getTotal() * 0.025).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Seller Receives:</span>
                          <span>${(getTotal() - (getTotal() * 0.025)).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-blue-600">
                        {cartItems[0]?.product?.company?.preferred_payout_method === 'stripe' ? (
                          <span>💳 Stripe Payout - Automatic transfer to seller</span>
                        ) : (
                          <span>🏦 Manual Payout - Platform processes transfer</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Features */}
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <Shield className="w-3 h-3" />
                  <span>SSL secured checkout</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-3 h-3" />
                  <span>256-bit encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3" />
                  <span>Money-back guarantee</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Shipping Address Modal */}
        <ShippingAddressModal
          isOpen={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          onSelectAddress={handleAddressSelect}
          selectedAddressId={selectedAddress?.id}
        />
      </div>
    </>
  );
}
