import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * item.price }
            : item
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          subtotal: product.price,
        },
      ];
    });
  }, []);

  const updateQty = useCallback((productId, qty) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? { ...item, qty, subtotal: qty * item.price }
          : item
      ).filter((item) => item.qty > 0)
    );
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item.product_id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, totalPrice, totalItems, addItem, updateQty, removeItem, clearCart }}
    >
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
