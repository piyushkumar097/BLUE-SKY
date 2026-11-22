import { TableStatusInfo, Order, CustomerReview } from '../types';

export const INITIAL_TABLES: TableStatusInfo[] = [
  { tableNumber: 1, status: 'available', totalLoyaltyPoints: 0 },
  { tableNumber: 2, status: 'preparing', currentOrderId: 'ORD-1002', totalLoyaltyPoints: 40 },
  { tableNumber: 3, status: 'available', totalLoyaltyPoints: 0 },
  { tableNumber: 4, status: 'available', totalLoyaltyPoints: 0 },
  { tableNumber: 5, status: 'available', totalLoyaltyPoints: 0 },
  { tableNumber: 6, status: 'available', totalLoyaltyPoints: 0 },
  { tableNumber: 7, status: 'available', totalLoyaltyPoints: 0 },
  { tableNumber: 8, status: 'available', totalLoyaltyPoints: 0 },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-1002',
    tableNumber: 2,
    createdAt: Date.now() - 6 * 60 * 1000, // 6 minutes ago
    status: 'preparing',
    items: [
      {
        id: 'ord-item-1',
        name: 'Tandoori Malai Broccoli',
        portion: 'Half',
        spice: 'Medium 🌶️',
        instructions: 'Extra crispy charred edges please',
        quantity: 1,
        unitPrice: 210,
        totalPrice: 210,
        isCompletedInKitchen: true,
      },
      {
        id: 'ord-item-2',
        name: 'Butter Chicken Aslam Old Delhi Style',
        portion: 'Full',
        spice: 'Medium 🌶️',
        instructions: 'Mild sweet note, more white butter',
        quantity: 1,
        unitPrice: 400,
        totalPrice: 400,
        isCompletedInKitchen: false,
      },
      {
        id: 'ord-item-3',
        name: 'Garlic Butter Naan Basket',
        portion: 'Regular',
        spice: 'Mild 🌿',
        instructions: '',
        quantity: 1,
        unitPrice: 160,
        totalPrice: 160,
        isCompletedInKitchen: false,
      },
    ],
    subtotal: 770,
    discount: 0,
    redeemedPoints: 0,
    cgst: 19.25, // 2.5%
    sgst: 19.25, // 2.5%
    tip: 50,
    grandTotal: 859,
    paymentStatus: 'unpaid',
    prepEstimatedMinutes: 16,
    prepStartedAt: Date.now() - 6 * 60 * 1000,
    prepElapsedTimeSeconds: 360,
    loyaltyEarned: 30, // 10 pts every 2 mins
    customerNote: 'Anniversary dinner table',
  },
];

export const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    tableNumber: 6,
    orderId: 'ORD-0994',
    rating: 5,
    comment: 'The rooftop ambiance and Nalli Nihari are out of this world! Excellent service by the staff.',
    customerName: 'Aarav Sharma',
    createdAt: Date.now() - 28 * 60 * 1000,
  },
  {
    id: 'rev-2',
    tableNumber: 3,
    orderId: 'ORD-0988',
    rating: 5,
    comment: 'Best Dahi Ke Kebab and Shahi Tukda in Bailey Road Patna. QR ordering was super fast.',
    customerName: 'Priyanka Verma',
    createdAt: Date.now() - 55 * 60 * 1000,
  },
];
