/**
 * Calculation utilities for BLUE SKY 2.0
 * Accurate Indian GST (5% total = 2.5% CGST + 2.5% SGST) and Loyalty Points engine
 */

export const GST_RATE = 0.05; // 5% total
export const CGST_RATE = 0.025; // 2.5%
export const SGST_RATE = 0.025; // 2.5%
export const POINTS_TO_RUPEE_RATIO = 0.5; // 10 points = ₹5 (1 pt = ₹0.50)

export interface CalculationResult {
  subtotal: number;
  discount: number;
  redeemedPoints: number;
  cgst: number;
  sgst: number;
  taxTotal: number;
  tip: number;
  grandTotal: number;
}

export function calculateOrderTotals(
  subtotal: number,
  redeemPoints: number = 0,
  availablePoints: number = 0,
  tip: number = 0
): CalculationResult {
  // Max redeemable points cannot exceed subtotal in rupee value
  const maxRedeemablePoints = Math.min(availablePoints, Math.floor(subtotal / POINTS_TO_RUPEE_RATIO));
  const pointsToRedeem = Math.min(redeemPoints, maxRedeemablePoints);
  const discount = Math.round(pointsToRedeem * POINTS_TO_RUPEE_RATIO);

  const taxableAmount = Math.max(0, subtotal - discount);
  const cgst = Number((taxableAmount * CGST_RATE).toFixed(2));
  const sgst = Number((taxableAmount * SGST_RATE).toFixed(2));
  const taxTotal = Number((cgst + sgst).toFixed(2));

  const grandTotal = Math.round(taxableAmount + taxTotal + tip);

  return {
    subtotal,
    discount,
    redeemedPoints: pointsToRedeem,
    cgst,
    sgst,
    taxTotal,
    tip,
    grandTotal,
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateBalanceDue(grandTotal: number, bookingDeposit: number = 0): number {
  const depositCredit = Math.min(Math.max(bookingDeposit, 0), Math.max(grandTotal, 0));
  return Math.max(grandTotal - depositCredit, 0);
}
