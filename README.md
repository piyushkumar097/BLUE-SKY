# BLUE SKY — Smart QR Restaurant Ordering & Engagement System

**BLUE SKY: Modern Indian Dining & Rooftop Lounge**
- **Address & Tax ID:** 4th Floor, Skyview Plaza, Bailey Road, Patna, Bihar 800001 | GSTIN: `10AABCB4821M1Z5`
- **Tech Stack:** React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Web Audio API + HTML5 Canvas QR Generation + LocalStorage Real-time Cross-tab Sync.

---

## 🌟 Key Features

### 1. Persistent Top Demo Role Switcher Bar
- **Role Tabs:** 
  - `[1. Customer Mobile View (Table #04)]`
  - `[2. Staff / Waiter POS Dashboard]` (with live count badges for waiter calls, pending approvals, ready orders, and cash due)
  - `[3. Kitchen Display System (KDS)]` (with active kitchen ticket count)
- **Active Table Dropdown:** Quickly switch the Customer view between `Table #01` to `Table #08`.
- **Standee QR Preview Button:** Generates physical table standee QR codes ready for printing or download.
- **Simulation Controls:**
  - **"⏩ Fast-Forward +2 Mins":** Advances active kitchen prep countdowns by 2 minutes and immediately awards `+10 Loyalty Points` to active preparing orders for instant testing.
  - **"Reset Demo Data":** Restores clean initial demo state (Table #02 pre-populated preparing demo, Table #04 clean).
  - **Audio Mute/Unmute:** Toggles pleasant Web Audio synthesizer chimes.

---

### 2. View 1: Customer Mobile Interface (QR Scan Experience)
- **Mobile Viewport Frame:** Max-width `480px` centered on desktop with subtle device framing.
- **Sticky Header:** Displays BLUE SKY branding, Table Badge (`Table #04`), Live Table Loyalty Pill (`⭐ 0 pts = ₹0`), and **"📶 Free Wi-Fi"** modal.
- **Wi-Fi Access Modal:** Shows SSID `BlueSky_Guest_5G`, Password `BlueSky@2026`, and one-tap **"Copy Password & Connect"** with green status badge.
- **Floating Emergency "Call Waiter" Button:** High-visibility red button with 60-second cooldown protection (`Waiter Notified (59s)`).
- **Interactive Menu & Customization Drawer:**
  - Search bar + Veg-Only toggle + Sticky Category Tabs (`Starters`, `Mains`, `Drinks`, `Desserts`).
  - Dish cards with photos, Veg/Non-Veg indicators, base prep time badges, and starting price.
  - Portion size selector (Half/Full or Regular/Large with dynamic price calculation).
  - Spice level selector (`Mild 🌿`, `Medium 🌶️`, `Extra Spicy 🔥`).
  - Special cooking instruction input + quantity stepper.
- **Direct Ordering & Wait-Time Loyalty Engine:**
  - Bottom cart drawer with 1-tap "Place Order".
  - Pinned real-time order tracker card:
    - **State 1:** Pending Staff Approval.
    - **State 2:** Preparing in Kitchen with dynamic countdown timer (`Math.max(...basePrepTimes)`) and live wait-time loyalty points counter (10 pts every 2 mins) with visual milestone progress bar (`10 pts = ₹5 off`).
    - **State 3:** Ready for Pickup & Food Served.
- **Itemized Bill, Loyalty Redemption & Payment:**
  - Subtotal + Redeem Loyalty Points toggle (`-₹XX` discount) + 5% GST (2.5% CGST + 2.5% SGST) + Tip selector (`No Tip`, `₹20`, `₹50`, `₹100`, Custom) + Grand Total.
  - **UPI:** Dynamic QR code generation (`upi://pay?...`), UPI ID copy button, and "Simulate UPI Payment Success".
  - **Card:** Clean credit/debit card form.
  - **Cash:** "Pay Cash at Table" triggers immediate cash collection alert on Staff Dashboard.
- **Digital Tax Receipt & 1-5 Star Review:**
  - Full itemized tax invoice with restaurant details, GSTIN, invoice #, and `PAID` watermark.
  - Email receipt field with instant confirmation toast.
  - 1-to-5 star rating & feedback widget that pushes to Staff POS live feed.

---

### 3. View 2: Restaurant Staff / Waiter Dashboard (POS View)
- **Live Waiter Call Alert Banner:** Flashing red alert banner with Web Audio chime and "✓ Mark Resolved" button.
- **Floor Table Status Strip:** Color-coded status for Tables #01 through #08 (`Available`, `Ordering`, `Preparing`, `Ready`, `Cash Due`, `Paid`).
- **Incoming Orders Queue:** Displays customer orders needing approval with **"👨🍳 Send to Kitchen (1-Tap)"** action.
- **Active Orders, Service & Payment Tracker:** Tracks orders, provides **"🍽️ Mark Food Served"** button, and **"✓ Confirm Cash Collected"** action.
- **Recent Customer Reviews Feed:** Real-time stream of 1-5 star ratings and reviews.

---

### 4. View 3: Kitchen Display System (KDS)
- **Dark-Mode High-Contrast Display:** `#0F172A` background with crisp white, amber, and green ticket cards.
- **Header Metrics:** Active tickets count, average prep time target, and retro digital kitchen clock.
- **FIFO Ticket Queue:** Table number, order ID, elapsed cooking stopwatch (turns amber at 15 mins, red if overtime), portion size tags, spice level tags, and special cooking notes.
- **Interactive Checklist:** Line cooks can tap items to strike them off as plated.
- **Ticket Completion:** Full-width **"✅ Mark Food Ready"** button that notifies staff immediately.

---

## 🚀 Running Locally

### Option A: Open Standalone HTML Directly (No Node/Server Required)
Double-click `dist/index.html` directly from Windows File Explorer:
```text
C:\Users\sohail ansari\Downloads\restro\dist\index.html
```
Thanks to `vite-plugin-singlefile`, all JavaScript, CSS, icons, and SVG graphics are bundled into a single self-contained HTML file!

### Option B: Local Development Server
```bash
# In c:\Users\sohail ansari\Downloads\restro:
npm run dev
```
Server runs at: `http://localhost:5173/`

### Option C: Re-build Single Standalone HTML
```bash
npm run build
```
Outputs the self-contained `dist/index.html`.
