import { TableStatusInfo, Order, CustomerReview, WaiterCall } from '../types';
import { INITIAL_TABLES, INITIAL_ORDERS, INITIAL_REVIEWS } from '../data/initialTables';

const STORAGE_KEYS = {
  TABLES: 'bluesky_tables_v2',
  ORDERS: 'bluesky_orders_v2',
  REVIEWS: 'bluesky_reviews_v2',
  WAITER_CALLS: 'bluesky_waiter_calls_v2',
};

export const storageService = {
  loadTables(): TableStatusInfo[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TABLES);
      if (data) {
        const tables: TableStatusInfo[] = JSON.parse(data);
        const now = Date.now();
        return tables.map((table) => {
          if (
            table.status === 'paid' ||
            (table.status === 'booking_pending' &&
              (table.bookingExpiresAt === undefined ||
                !Number.isFinite(table.bookingExpiresAt) ||
                table.bookingExpiresAt <= now))
          ) {
            return {
              ...table,
              status: 'available' as const,
              currentOrderId: undefined,
              bookingId: undefined,
              bookingDeposit: undefined,
              bookingExpiresAt: undefined,
            };
          }
          return table;
        });
      }
    } catch (e) {
      console.warn('Error reading tables from localStorage', e);
    }
    return INITIAL_TABLES;
  },

  saveTables(tables: TableStatusInfo[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
      // Dispatch custom event for same-tab reactivity
      window.dispatchEvent(new Event('bluesky_state_change'));
    } catch (e) {
      console.warn('Error saving tables to localStorage', e);
    }
  },

  loadOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading orders from localStorage', e);
    }
    return INITIAL_ORDERS;
  },

  saveOrders(orders: Order[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      window.dispatchEvent(new Event('bluesky_state_change'));
    } catch (e) {
      console.warn('Error saving orders to localStorage', e);
    }
  },

  loadReviews(): CustomerReview[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading reviews from localStorage', e);
    }
    return INITIAL_REVIEWS;
  },

  saveReviews(reviews: CustomerReview[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
      window.dispatchEvent(new Event('bluesky_state_change'));
    } catch (e) {
      console.warn('Error saving reviews to localStorage', e);
    }
  },

  loadWaiterCalls(): WaiterCall[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WAITER_CALLS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading waiter calls from localStorage', e);
    }
    return [];
  },

  saveWaiterCalls(calls: WaiterCall[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.WAITER_CALLS, JSON.stringify(calls));
      window.dispatchEvent(new Event('bluesky_state_change'));
    } catch (e) {
      console.warn('Error saving waiter calls to localStorage', e);
    }
  },

  resetAll(): { tables: TableStatusInfo[]; orders: Order[]; reviews: CustomerReview[]; waiterCalls: WaiterCall[] } {
    try {
      localStorage.removeItem(STORAGE_KEYS.TABLES);
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
      localStorage.removeItem(STORAGE_KEYS.REVIEWS);
      localStorage.removeItem(STORAGE_KEYS.WAITER_CALLS);
    } catch (e) {
      console.warn('Error resetting localStorage', e);
    }
    return {
      tables: INITIAL_TABLES,
      orders: INITIAL_ORDERS,
      reviews: INITIAL_REVIEWS,
      waiterCalls: [],
    };
  },
};
