/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, LayoutDashboard, ReceiptText, Pizza } from 'lucide-react';
import NewOrder from '@/components/POS/NewOrder';
import Dashboard from '@/components/POS/Dashboard';
import Expenses from '@/components/POS/Expenses';
import { Toaster } from '@/components/ui/sonner';

type Tab = 'order' | 'dashboard' | 'expenses';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('order');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOrderSaved = () => {
    setRefreshKey(prev => prev + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'order':
        return <NewOrder onOrderSaved={handleOrderSaved} />;
      case 'dashboard':
        return <Dashboard key={refreshKey} />;
      case 'expenses':
        return <Expenses />;
      default:
        return <NewOrder onOrderSaved={handleOrderSaved} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-brand-red text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-yellow p-1.5 rounded-lg">
              <Pizza className="w-6 h-6 text-brand-black" />
            </div>
            <h1 className="text-xl font-black font-display tracking-tight uppercase">
              Hot Kitchen <span className="text-brand-yellow">Live Pizza</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <NavButton 
            active={activeTab === 'order'} 
            onClick={() => setActiveTab('order')}
            icon={<ShoppingCart className="w-6 h-6" />}
            label="Order"
          />
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            icon={<LayoutDashboard className="w-6 h-6" />}
            label="Dashboard"
          />
          <NavButton 
            active={activeTab === 'expenses'} 
            onClick={() => setActiveTab('expenses')}
            icon={<ReceiptText className="w-6 h-6" />}
            label="Expenses"
          />
        </div>
      </nav>

      <Toaster position="top-center" richColors />
    </div>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function NavButton({ active, onClick, icon, label }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-20 py-1 transition-all duration-200 ${
        active ? 'text-brand-red scale-110' : 'text-slate-400'
      }`}
    >
      <div className={`p-1 rounded-xl transition-colors ${active ? 'bg-brand-red/10' : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${active ? 'opacity-100' : 'opacity-70'}`}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="w-1 h-1 bg-brand-red rounded-full mt-1"
        />
      )}
    </button>
  );
}
