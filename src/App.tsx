import React from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { TopDemoBar } from './components/common/TopDemoBar';
import { WifiModal } from './components/common/WifiModal';
import { StandeeModal } from './components/qr/StandeeModal';
import { CustomerView } from './components/customer/CustomerView';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { KitchenDisplaySystem } from './components/kitchen/KitchenDisplaySystem';

const MainViewRouter: React.FC = () => {
  const { activeView } = useRestaurant();

  return (
    <main className="min-h-screen bg-slate-950">
      {activeView === 'customer' && <CustomerView />}
      {activeView === 'staff' && <StaffDashboard />}
      {activeView === 'kitchen' && <KitchenDisplaySystem />}
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <RestaurantProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <TopDemoBar />
        <MainViewRouter />
        <WifiModal />
        <StandeeModal />
      </div>
    </RestaurantProvider>
  );
};

export default App;
