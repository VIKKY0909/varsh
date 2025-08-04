import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  size: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock_quantity: number;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, size: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  checkStockAvailability: (productId: string, size: string, quantity: number) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setItems([]);
    }
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(id, name, price, images, stock_quantity)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      // Handle error silently or show user-friendly message
    } finally {
      setLoading(false);
    }
  };

  const checkStockAvailability = async (productId: string, size: string, quantity: number): Promise<boolean> => {
    try {
      // Get current stock for the product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single();

      if (productError || !productData) {
        return false;
      }

      // Check if requested quantity is available
      return productData.stock_quantity >= quantity;
    } catch (error) {
      return false;
    }
  };

  const addToCart = async (productId: string, size: string, quantity = 1) => {
    if (!user) return;

    try {
      // Check stock availability before adding to cart
      const isAvailable = await checkStockAvailability(productId, size, quantity);
      if (!isAvailable) {
        throw new Error('Insufficient stock available');
      }

      // Check if item already exists
      const existingItem = items.find(
        item => item.product_id === productId && item.size === size
      );

      if (existingItem) {
        // Check if new total quantity is available
        const newTotalQuantity = existingItem.quantity + quantity;
        const isTotalAvailable = await checkStockAvailability(productId, size, newTotalQuantity);
        if (!isTotalAvailable) {
          throw new Error('Insufficient stock for requested quantity');
        }
        
        await updateQuantity(existingItem.id, newTotalQuantity);
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            size,
            quantity,
          });

        if (error) throw error;
        await fetchCartItems();
      }
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      // Get the cart item to check product and size
      const cartItem = items.find(item => item.id === itemId);
      if (!cartItem) {
        throw new Error('Cart item not found');
      }

      // Check stock availability for new quantity
      const isAvailable = await checkStockAvailability(cartItem.product_id, cartItem.size, quantity);
      if (!isAvailable) {
        throw new Error('Insufficient stock for requested quantity');
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;
      
      setItems(items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setItems([]);
    } catch (error) {
      throw error;
    }
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    items,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    checkStockAvailability,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};