export type PortionSize = 'Half' | 'Full' | 'Regular' | 'Large';
export type SpiceLevel = 'Mild 🌿' | 'Medium 🌶️' | 'Extra Spicy 🔥';

export interface MenuItem {
  id: string;
  name: string;
  category: 'Starters' | 'Mains' | 'Drinks' | 'Desserts';
  description: string;
  price: number; // Base price (usually Half or Regular)
  portionPrices?: Partial<Record<PortionSize, number>>;
  isVeg: boolean;
  isPopular?: boolean;
  prepTimeMinutes: number;
  image: string;
  imagePosition?: 'center' | 'top' | 'bottom';
  imageAttribution?: {
    creator: string;
    license: string;
    url: string;
    licenseUrl: string;
  };
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  selectedPortion: PortionSize;
  selectedSpice: SpiceLevel;
  instructions: string;
  quantity: number;
  itemTotal: number;
}

export type OrderStatus = 
  | 'pending_approval' 
  | 'preparing' 
  | 'ready' 
  | 'served' 
  | 'completed' 
  | 'cancelled';

export type PaymentMethod = 'upi' | 'card' | 'cash';
export type PaymentStatus = 'unpaid' | 'cash_pending' | 'paid';

export interface OrderItem {
  id: string;
  name: string;
  portion: PortionSize;
  spice: SpiceLevel;
  instructions: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isCompletedInKitchen?: boolean;
}

export interface Order {
  id: string;
  tableNumber: number;
  createdAt: number; // Timestamp
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  redeemedPoints: number;
  cgst: number; // 2.5%
  sgst: number; // 2.5%
  tip: number;
  grandTotal: number;
  bookingDeposit?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  prepEstimatedMinutes: number;
  prepStartedAt?: number;
  prepElapsedTimeSeconds: number;
  loyaltyEarned: number;
  customerNote?: string;
}

export interface TableStatusInfo {
  tableNumber: number;
  status: 'available' | 'booking_pending' | 'booked' | 'ordering' | 'preparing' | 'ready' | 'served' | 'cash_due' | 'paid';
  currentOrderId?: string;
  bookingId?: string;
  bookingDeposit?: number;
  bookingExpiresAt?: number;
  guestCount?: number;
  waiterCallActive?: boolean;
  waiterCallTime?: number;
  totalLoyaltyPoints: number;
}

export type TableBookingResult =
  | { status: 'payment_required'; bookingId: string }
  | { status: 'booked' | 'released' | 'unavailable'; bookingId?: string };

export interface CustomerReview {
  id: string;
  tableNumber: number;
  orderId: string;
  rating: number; // 1 to 5
  comment: string;
  customerName?: string;
  createdAt: number;
}

export interface WaiterCall {
  id: string;
  tableNumber: number;
  timestamp: number;
  resolved: boolean;
}

export type ActiveView = 'customer' | 'staff' | 'kitchen';
