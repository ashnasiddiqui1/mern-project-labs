import { createContext, useContext, useState, useEffect, useCallback } from "react";
import apiClient from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchCurrentCart = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await apiClient.get("/cart");
      setCartItems(response.data?.cart || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setCartItems([]);
      } else {
        setErrorMessage("Unable to load cart items.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentCart();
  }, [fetchCurrentCart]);

  const addToCart = async (productId) => {
    try {
      const response = await apiClient.post(`/cart/${productId}`);
      if (response.data?.cart) {
        setCartItems(response.data.cart);
      }
      return {
        success: true,
        message: response.data?.message || "Item added to cart"
      };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Failed to add product to cart",
        status: err.response?.status
      };
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const response = await apiClient.patch(`/cart/${productId}`, {
        quantity: newQuantity
      });
      if (response.data?.cart) {
        setCartItems(response.data.cart);
      }
      return {
        success: true,
        message: response.data?.message || "Cart updated"
      };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Failed to update quantity",
        status: err.response?.status
      };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await apiClient.delete(`/cart/${productId}`);
      if (response.data?.cart) {
        setCartItems(response.data.cart);
      } else {
        setCartItems((current) =>
          current.filter(
            (item) => (item.product?._id || item.product) !== productId
          )
        );
      }
      return {
        success: true,
        message: response.data?.message || "Item removed from cart"
      };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Failed to remove item",
        status: err.response?.status
      };
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalCount = cartItems.reduce(
    (accum, entry) => accum + (entry.quantity || 0),
    0
  );

  const subtotal = cartItems.reduce(
    (accum, entry) => accum + (entry.product?.price || 0) * (entry.quantity || 0),
    0
  );

  const contextPayload = {
    cartItems,
    loading: isLoading,
    error: errorMessage,
    totalCount,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart: fetchCurrentCart,
    clearCart
  };

  return (
    <CartContext.Provider value={contextPayload}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be called within CartProvider");
  }
  return ctx;
}

export default CartContext;
