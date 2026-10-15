import { createContext, useContext, useState, useEffect, useCallback } from "react";
import apiClient from "../services/api";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [savedItems, setSavedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchCurrentWishlist = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await apiClient.get("/wishlist");
      setSavedItems(response.data?.wishlist || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setSavedItems([]);
      } else {
        setFetchError("Unable to retrieve wishlist items.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentWishlist();
  }, [fetchCurrentWishlist]);

  const isWishlisted = (productId) => {
    if (!productId) return false;
    const targetIdStr = String(productId);
    return savedItems.some((item) => {
      const itemId = item._id || item.id || item;
      return String(itemId) === targetIdStr;
    });
  };

  const addToWishlist = async (product) => {
    const productId = product._id || product.id || product;
    try {
      const response = await apiClient.post(`/wishlist/${productId}`);
      setSavedItems((previous) => {
        const targetIdStr = String(productId);
        const alreadySaved = previous.some(
          (item) => String(item._id || item.id || item) === targetIdStr
        );
        if (alreadySaved) return previous;
        return [...previous, typeof product === "object" ? product : { _id: productId }];
      });
      return {
        success: true,
        message: response.data?.message || "Saved to wishlist"
      };
    } catch (err) {
      if (err.response?.status === 409) {
        setSavedItems((previous) => {
          const targetIdStr = String(productId);
          const alreadySaved = previous.some(
            (item) => String(item._id || item.id || item) === targetIdStr
          );
          if (alreadySaved) return previous;
          return [...previous, typeof product === "object" ? product : { _id: productId }];
        });
        return { success: true, message: "Already in Wishlist" };
      }
      return {
        success: false,
        error: err.response?.data?.error || "Failed to save to wishlist",
        status: err.response?.status
      };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await apiClient.delete(`/wishlist/${productId}`);
      const targetIdStr = String(productId);
      setSavedItems((previous) =>
        previous.filter(
          (item) => String(item._id || item.id || item) !== targetIdStr
        )
      );
      return {
        success: true,
        message: response.data?.message || "Removed from wishlist"
      };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Failed to remove from wishlist",
        status: err.response?.status
      };
    }
  };

  const toggleWishlist = async (product) => {
    const productId = product._id || product.id || product;
    if (isWishlisted(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(product);
    }
  };

  const contextPayload = {
    wishlist: savedItems,
    loading: isLoading,
    error: fetchError,
    isWishlisted,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    refreshWishlist: fetchCurrentWishlist
  };

  return (
    <WishlistContext.Provider value={contextPayload}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be called within WishlistProvider");
  }
  return ctx;
}

export default WishlistContext;
