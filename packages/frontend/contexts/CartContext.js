import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../lib/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart count on component mount
  useEffect(() => {
    fetchCartCount();
  }, []);

  const fetchCartCount = async () => {
    try {
      const response = await apiService.getCartCount();
      setCartCount(response.count || 0);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    }
  };

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCartItems();
      setCartItems(response.cart_items || []);
      setCartCount(response.total_items || 0);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setCartItems([]);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity, selectedSpecifications = {}) => {
    try {
      const response = await apiService.addToCart(productId, quantity, selectedSpecifications);
      await fetchCartCount(); // Refresh cart count
      return response;
    } catch (error) {
      throw error;
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    try {
      const response = await apiService.updateCartItem(cartItemId, quantity);
      await fetchCartCount(); // Refresh cart count
      return response;
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const response = await apiService.removeFromCart(cartItemId);
      await fetchCartCount(); // Refresh cart count
      return response;
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const response = await apiService.clearCart();
      setCartCount(0);
      setCartItems([]);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    cartCount,
    cartItems,
    loading,
    fetchCartCount,
    fetchCartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
