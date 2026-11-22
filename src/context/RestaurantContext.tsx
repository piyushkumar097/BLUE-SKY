import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  ActiveView,
  TableStatusInfo,
  Order,
  CartItem,
  MenuItem,
  PortionSize,
  SpiceLevel,
  CustomerReview,
  WaiterCall,
  PaymentMethod,
  TableBookingResult,
} from '../types';
import { storageService } from '../services/storage';
import { sound } from '../utils/audio';
import { calculateOrderTotals } from '../utils/calculations';
import { TABLE_BOOKING_DEPOSIT_INR, TABLE_BOOKING_HOLD_MS } from '../constants';

interface RestaurantContextType {
  theme: 'day' | 'night';
  toggleTheme: () => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedTable: number;
  setSelectedTable: (table: number) => void;
  tables: TableStatusInfo[];
  orders: Order[];
  reviews: CustomerReview[];
  waiterCalls: WaiterCall[];
  cart: CartItem[];
  isMuted: boolean;
  isWifiModalOpen: boolean;
  isStandeeModalOpen: boolean;
  activeTableOrder: Order | undefined;

  // Table booking actions
  beginTableBooking: (tableNumber: number, currentBookingId?: string | null) => TableBookingResult;
  completeTableBooking: (tableNumber: number, bookingId: string) => boolean;
  cancelTableBooking: (tableNumber: number, bookingId: string) => void;

  // Cart actions
  addToCart: (item: MenuItem, portion: PortionSize, spice: SpiceLevel, instructions: string, quantity: number) => void;
  updateCartItemQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;

  // Order lifecycle actions
  placeOrder: (tableNumber: number, customerNote?: string) => Promise<Order>;
  approveOrder: (orderId: string) => void;
  markFoodReady: (orderId: string) => void;
  markFoodServed: (orderId: string) => void;
  toggleKitchenItemComplete: (orderId: string, itemId: string) => void;

  // Waiter & Service actions
  callWaiter: (tableNumber: number) => boolean;
  resolveWaiterCall: (callId: string) => void;

  // Payment & Loyalty actions
  processPayment: (orderId: string, method: PaymentMethod, tip: number, redeemedPoints: number) => void;
  confirmCashCollected: (orderId: string) => void;
  addReview: (review: Omit<CustomerReview, 'id' | 'createdAt'>) => void;

  // Simulation & Demo Controls
  fastForwardTwoMinutes: () => void;
  resetDemoData: () => void;
  toggleMute: () => void;
  toggleWifiModal: (open?: boolean) => void;
  toggleStandeeModal: (open?: boolean) => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'day' | 'night'>(() => {
    try {
      return localStorage.getItem('bluesky_theme') === 'day' ? 'day' : 'night';
    } catch (error) {
      console.warn('Unable to read theme preference', error);
      return 'night';
    }
  });
  const [activeView, setActiveView] = useState<ActiveView>('customer');
  const [selectedTable, setSelectedTable] = useState<number>(4);
  const [tables, setTables] = useState<TableStatusInfo[]>(() => storageService.loadTables());
  const [orders, setOrders] = useState<Order[]>(() => storageService.loadOrders());
  const [reviews, setReviews] = useState<CustomerReview[]>(() => storageService.loadReviews());
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>(() => storageService.loadWaiterCalls());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted);
  const [isWifiModalOpen, setIsWifiModalOpen] = useState<boolean>(false);
  const [isStandeeModalOpen, setIsStandeeModalOpen] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === 'day' ? 'light' : 'dark';
    try {
      localStorage.setItem('bluesky_theme', theme);
    } catch (error) {
      console.warn('Unable to save theme preference', error);
    }
  }, [theme]);

  // Sync state with storage
  useEffect(() => {
    storageService.saveTables(tables);
  }, [tables]);

  useEffect(() => {
    storageService.saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    storageService.saveReviews(reviews);
  }, [reviews]);

  useEffect(() => {
    storageService.saveWaiterCalls(waiterCalls);
  }, [waiterCalls]);

  // Listen to cross-tab storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith('bluesky_')) {
        setTables(storageService.loadTables());
        setOrders(storageService.loadOrders());
        setReviews(storageService.loadReviews());
        setWaiterCalls(storageService.loadWaiterCalls());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Timer loop for active preparing orders (advances stopwatch)
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prevOrders) => {
        let changed = false;
        const updated = prevOrders.map((ord) => {
          if (ord.status === 'preparing') {
            changed = true;
            const newElapsed = ord.prepElapsedTimeSeconds + 1;
            // Every 120s gives +10 points
            const newPoints = Math.floor(newElapsed / 120) * 10;
            return {
              ...ord,
              prepElapsedTimeSeconds: newElapsed,
              loyaltyEarned: newPoints,
            };
          }
          return ord;
        });
        return changed ? updated : prevOrders;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setTables((prevTables) => {
        let changed = false;
        const updated = prevTables.map((table) => {
          if (
            table.status === 'booking_pending' &&
            (table.bookingExpiresAt === undefined ||
              !Number.isFinite(table.bookingExpiresAt) ||
              table.bookingExpiresAt <= now)
          ) {
            changed = true;
            return {
              ...table,
              status: 'available' as const,
              bookingId: undefined,
              bookingDeposit: undefined,
              bookingExpiresAt: undefined,
            };
          }
          return table;
        });
        return changed ? updated : prevTables;
      });
    }, 15_000);

    return () => clearInterval(timer);
  }, []);

  // Update table loyalty when orders gain points
  useEffect(() => {
    setTables((prevTables) =>
      prevTables.map((tbl) => {
        const tableOrder = orders.find((o) => o.tableNumber === tbl.tableNumber && o.status !== 'completed' && o.status !== 'cancelled');
        if (tableOrder) {
          return {
            ...tbl,
            totalLoyaltyPoints: tableOrder.loyaltyEarned,
          };
        }
        return tbl;
      })
    );
  }, [orders]);

  const activeTableOrder = orders.find(
    (o) => o.tableNumber === selectedTable && o.status !== 'completed' && o.status !== 'cancelled'
  );

  const beginTableBooking = useCallback(
    (tableNumber: number, currentBookingId?: string | null): TableBookingResult => {
      const table = tables.find((candidate) => candidate.tableNumber === tableNumber);
      if (!table) return { status: 'unavailable' };
      const hasActiveOrder = orders.some(
        (order) =>
          order.tableNumber === tableNumber &&
          order.status !== 'completed' &&
          order.status !== 'cancelled'
      );

      const isExpiredPending =
        table.status === 'booking_pending' &&
        (table.bookingExpiresAt === undefined ||
          !Number.isFinite(table.bookingExpiresAt) ||
          table.bookingExpiresAt <= Date.now());

      if (table.status === 'booked' && table.bookingId && table.bookingId === currentBookingId) {
        return { status: 'booked', bookingId: table.bookingId };
      }

      if (
        table.status === 'booking_pending' &&
        !isExpiredPending &&
        table.bookingId &&
        table.bookingId === currentBookingId
      ) {
        return { status: 'payment_required', bookingId: table.bookingId };
      }

      if (
        table.bookingId &&
        table.bookingId === currentBookingId &&
        table.status !== 'available' &&
        table.status !== 'paid' &&
        !isExpiredPending
      ) {
        return { status: 'booked', bookingId: table.bookingId };
      }

      if (hasActiveOrder) return { status: 'unavailable' };

      if (table.status === 'available' && currentBookingId) {
        return { status: 'released', bookingId: currentBookingId };
      }

      if (table.status !== 'available' && table.status !== 'paid' && !isExpiredPending) {
        return { status: 'unavailable' };
      }

      const bookingId = `BOOK-${tableNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setTables((prev) =>
        prev.map((candidate) =>
          candidate.tableNumber === tableNumber
            ? {
                ...candidate,
                status: 'booking_pending',
                bookingId,
                bookingDeposit: TABLE_BOOKING_DEPOSIT_INR,
                bookingExpiresAt: Date.now() + TABLE_BOOKING_HOLD_MS,
              }
            : candidate
        )
      );
      return { status: 'payment_required', bookingId };
    },
    [orders, tables]
  );

  const completeTableBooking = useCallback(
    (tableNumber: number, bookingId: string): boolean => {
      const table = tables.find((candidate) => candidate.tableNumber === tableNumber);
      if (
        !table ||
        table.status !== 'booking_pending' ||
        table.bookingId !== bookingId ||
        table.bookingExpiresAt === undefined ||
        !Number.isFinite(table.bookingExpiresAt) ||
        table.bookingExpiresAt <= Date.now()
      ) {
        return false;
      }

      setTables((prev) =>
        prev.map((candidate) =>
          candidate.tableNumber === tableNumber && candidate.bookingId === bookingId
            ? { ...candidate, status: 'booked', bookingExpiresAt: undefined }
            : candidate
        )
      );
      sound.playSuccess();
      return true;
    },
    [tables]
  );

  const cancelTableBooking = useCallback((tableNumber: number, bookingId: string) => {
    setTables((prev) =>
      prev.map((candidate) =>
        candidate.tableNumber === tableNumber &&
        candidate.status === 'booking_pending' &&
        candidate.bookingId === bookingId
          ? {
              ...candidate,
              status: 'available',
              bookingId: undefined,
              bookingDeposit: undefined,
              bookingExpiresAt: undefined,
            }
          : candidate
      )
    );
  }, []);

  // Cart operations
  const addToCart = useCallback(
    (item: MenuItem, portion: PortionSize, spice: SpiceLevel, instructions: string, quantity: number) => {
      const unitPrice = item.portionPrices?.[portion] || item.price;
      const cartItemId = `${item.id}-${portion}-${spice}-${instructions.trim()}`;

      setCart((prev) => {
        const existingIdx = prev.findIndex((ci) => ci.cartItemId === cartItemId);
        if (existingIdx > -1) {
          const updated = [...prev];
          const newQty = updated[existingIdx].quantity + quantity;
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: newQty,
            itemTotal: newQty * unitPrice,
          };
          return updated;
        }
        return [
          ...prev,
          {
            cartItemId,
            menuItem: item,
            selectedPortion: portion,
            selectedSpice: spice,
            instructions,
            quantity,
            itemTotal: quantity * unitPrice,
          },
        ];
      });
      sound.playChime();
    },
    []
  );

  const updateCartItemQuantity = useCallback((cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            const unitPrice = item.menuItem.portionPrices?.[item.selectedPortion] || item.menuItem.price;
            return {
              ...item,
              quantity: newQty,
              itemTotal: newQty * unitPrice,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Place Order
  const placeOrder = useCallback(
    async (tableNumber: number, customerNote?: string): Promise<Order> => {
      if (cart.length === 0) {
        throw new Error('Cannot place an empty order');
      }

      const hasActiveOrder = orders.some(
        (order) =>
          order.tableNumber === tableNumber &&
          order.status !== 'completed' &&
          order.status !== 'cancelled'
      );
      if (hasActiveOrder) {
        throw new Error('An active order already exists for this table');
      }

      const orderItems = cart.map((ci) => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: ci.menuItem.name,
        portion: ci.selectedPortion,
        spice: ci.selectedSpice,
        instructions: ci.instructions,
        quantity: ci.quantity,
        unitPrice: ci.menuItem.portionPrices?.[ci.selectedPortion] || ci.menuItem.price,
        totalPrice: ci.itemTotal,
        isCompletedInKitchen: false,
      }));

      const subtotal = orderItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
      const estPrepTime = Math.max(...cart.map((ci) => ci.menuItem.prepTimeMinutes), 12);
      const totals = calculateOrderTotals(subtotal, 0, 0, 0);

      const newOrder: Order = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        tableNumber,
        createdAt: Date.now(),
        status: 'pending_approval',
        items: orderItems,
        subtotal: totals.subtotal,
        discount: 0,
        redeemedPoints: 0,
        cgst: totals.cgst,
        sgst: totals.sgst,
        tip: 0,
        grandTotal: totals.grandTotal,
        bookingDeposit: tables.find((table) => table.tableNumber === tableNumber)?.bookingDeposit || 0,
        paymentStatus: 'unpaid',
        prepEstimatedMinutes: estPrepTime,
        prepElapsedTimeSeconds: 0,
        loyaltyEarned: 0,
        customerNote,
      };

      setOrders((prev) => [newOrder, ...prev]);
      setTables((prev) =>
        prev.map((tbl) =>
          tbl.tableNumber === tableNumber
            ? { ...tbl, status: 'ordering', currentOrderId: newOrder.id }
            : tbl
        )
      );
      setCart([]);
      sound.playSuccess();
      return newOrder;
    },
    [cart, orders, tables]
  );

  // Approve Order (Staff sends to kitchen)
  const approveOrder = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'preparing',
            prepStartedAt: Date.now(),
          };
        }
        return ord;
      })
    );

    setTables((prev) =>
      prev.map((tbl) => {
        const matched = orders.find((o) => o.id === orderId);
        if (matched && tbl.tableNumber === matched.tableNumber) {
          return { ...tbl, status: 'preparing' };
        }
        return tbl;
      })
    );
    sound.playChime();
  }, [orders]);

  // Kitchen completes order
  const markFoodReady = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'ready',
            items: ord.items.map((i) => ({ ...i, isCompletedInKitchen: true })),
          };
        }
        return ord;
      })
    );

    setTables((prev) =>
      prev.map((tbl) => {
        const matched = orders.find((o) => o.id === orderId);
        if (matched && tbl.tableNumber === matched.tableNumber) {
          return { ...tbl, status: 'ready' };
        }
        return tbl;
      })
    );
    sound.playAlert();
  }, [orders]);

  // Staff marks food served
  const markFoodServed = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'served' } : ord))
    );
    setTables((prev) =>
      prev.map((tbl) => {
        const matched = orders.find((order) => order.id === orderId);
        return matched && tbl.tableNumber === matched.tableNumber
          ? { ...tbl, status: 'served' }
          : tbl;
      })
    );
    sound.playSuccess();
  }, [orders]);

  // Strike off item in Kitchen
  const toggleKitchenItemComplete = useCallback((orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            items: ord.items.map((item) =>
              item.id === itemId
                ? { ...item, isCompletedInKitchen: !item.isCompletedInKitchen }
                : item
            ),
          };
        }
        return ord;
      })
    );
    sound.playChime();
  }, []);

  // Call Waiter with 60s cooldown validation
  const callWaiter = useCallback(
    (tableNumber: number): boolean => {
      const activeCall = waiterCalls.find((c) => c.tableNumber === tableNumber && !c.resolved);
      if (activeCall) {
        const elapsed = (Date.now() - activeCall.timestamp) / 1000;
        if (elapsed < 60) {
          return false; // In cooldown
        }
      }

      const newCall: WaiterCall = {
        id: `call-${Date.now()}`,
        tableNumber,
        timestamp: Date.now(),
        resolved: false,
      };

      setWaiterCalls((prev) => [newCall, ...prev.filter((c) => c.tableNumber !== tableNumber)]);
      setTables((prev) =>
        prev.map((t) =>
          t.tableNumber === tableNumber
            ? { ...t, waiterCallActive: true, waiterCallTime: Date.now() }
            : t
        )
      );
      sound.playAlert();
      return true;
    },
    [waiterCalls]
  );

  const resolveWaiterCall = useCallback((callId: string) => {
    setWaiterCalls((prev) =>
      prev.map((c) => (c.id === callId ? { ...c, resolved: true } : c))
    );
    setTables((prev) =>
      prev.map((t) => {
        const call = waiterCalls.find((c) => c.id === callId);
        if (call && t.tableNumber === call.tableNumber) {
          return { ...t, waiterCallActive: false };
        }
        return t;
      })
    );
    sound.playSuccess();
  }, [waiterCalls]);

  // Payment processing
  const processPayment = useCallback(
    (orderId: string, method: PaymentMethod, tip: number, redeemedPoints: number) => {
      const existing = orders.find((order) => order.id === orderId);
      if (!existing || existing.paymentStatus !== 'unpaid') {
        return;
      }

      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            const totals = calculateOrderTotals(ord.subtotal, redeemedPoints, ord.loyaltyEarned, tip);
            return {
              ...ord,
              paymentMethod: method,
              paymentStatus: method === 'cash' ? 'cash_pending' : 'paid',
              status: method === 'cash' ? ord.status : 'completed',
              tip,
              redeemedPoints,
              discount: totals.discount,
              cgst: totals.cgst,
              sgst: totals.sgst,
              grandTotal: totals.grandTotal,
            };
          }
          return ord;
        })
      );

      setTables((prev) =>
        prev.map((tbl) => {
          const matched = orders.find((o) => o.id === orderId);
          if (matched && tbl.tableNumber === matched.tableNumber) {
            if (method === 'cash') {
              return { ...tbl, status: 'cash_due' };
            }
            return {
              ...tbl,
              status: 'available',
              currentOrderId: undefined,
              bookingId: undefined,
              bookingDeposit: undefined,
              bookingExpiresAt: undefined,
            };
          }
          return tbl;
        })
      );

      if (method === 'cash') {
        sound.playAlert();
      } else {
        sound.playSuccess();
      }
    },
    [orders]
  );

  const confirmCashCollected = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, paymentStatus: 'paid', status: 'completed' }
          : ord
      )
    );
    setTables((prev) =>
      prev.map((tbl) => {
        const matched = orders.find((o) => o.id === orderId);
        if (matched && tbl.tableNumber === matched.tableNumber) {
          return {
            ...tbl,
            status: 'available',
            currentOrderId: undefined,
            bookingId: undefined,
            bookingDeposit: undefined,
            bookingExpiresAt: undefined,
          };
        }
        return tbl;
      })
    );
    sound.playSuccess();
  }, [orders]);

  const addReview = useCallback((rev: Omit<CustomerReview, 'id' | 'createdAt'>) => {
    const newRev: CustomerReview = {
      ...rev,
      id: `rev-${Date.now()}`,
      createdAt: Date.now(),
    };
    setReviews((prev) => [newRev, ...prev]);
    sound.playSuccess();
  }, []);

  // Demo Controls
  const fastForwardTwoMinutes = useCallback(() => {
    setOrders((prevOrders) =>
      prevOrders.map((ord) => {
        if (ord.status === 'preparing') {
          const newElapsed = ord.prepElapsedTimeSeconds + 120;
          const newPoints = ord.loyaltyEarned + 10;
          return {
            ...ord,
            prepElapsedTimeSeconds: newElapsed,
            loyaltyEarned: newPoints,
          };
        }
        return ord;
      })
    );
    sound.playChime();
  }, []);

  const resetDemoData = useCallback(() => {
    const fresh = storageService.resetAll();
    setTables(fresh.tables);
    setOrders(fresh.orders);
    setReviews(fresh.reviews);
    setWaiterCalls(fresh.waiterCalls);
    setCart([]);
    setSelectedTable(4);
    sound.playSuccess();
  }, []);

  const toggleMute = useCallback(() => {
    const nextMute = sound.toggleMute();
    setIsMuted(nextMute);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => current === 'night' ? 'day' : 'night');
  }, []);

  const toggleWifiModal = useCallback((open?: boolean) => {
    setIsWifiModalOpen((prev) => (open !== undefined ? open : !prev));
  }, []);

  const toggleStandeeModal = useCallback((open?: boolean) => {
    setIsStandeeModalOpen((prev) => (open !== undefined ? open : !prev));
  }, []);

  return (
    <RestaurantContext.Provider
      value={{
        theme,
        toggleTheme,
        activeView,
        setActiveView,
        selectedTable,
        setSelectedTable,
        tables,
        orders,
        reviews,
        waiterCalls,
        cart,
        isMuted,
        isWifiModalOpen,
        isStandeeModalOpen,
        activeTableOrder,
        beginTableBooking,
        completeTableBooking,
        cancelTableBooking,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        approveOrder,
        markFoodReady,
        markFoodServed,
        toggleKitchenItemComplete,
        callWaiter,
        resolveWaiterCall,
        processPayment,
        confirmCashCollected,
        addReview,
        fastForwardTwoMinutes,
        resetDemoData,
        toggleMute,
        toggleWifiModal,
        toggleStandeeModal,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = (): RestaurantContextType => {
  const ctx = useContext(RestaurantContext);
  if (!ctx) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return ctx;
};
