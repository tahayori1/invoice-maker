
import React from 'react';
import type { View } from '../App';
import { InvoiceIcon, ProductsIcon, SettingsIcon, UsersIcon } from './icons';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  setView: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const navItems = [
    { id: 'list', label: 'فاکتورها', icon: <InvoiceIcon /> },
    { id: 'customers', label: 'مشتریان', icon: <UsersIcon /> },
    { id: 'products', label: 'محصولات و خدمات', icon: <ProductsIcon /> },
    { id: 'settings', label: 'تنظیمات', icon: <SettingsIcon /> },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <aside className="w-72 flex-shrink-0 bg-white border-l border-slate-200 shadow-sm z-10 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-center">
            <div className="bg-blue-600 p-2 rounded-lg ml-3">
                 <InvoiceIcon /> 
                 {/* Reusing icon as logo placeholder */}
            </div>
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">فاکتورساز</h1>
        </div>
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setView(item.id as View)}
                      className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-bold shadow-sm ring-1 ring-blue-200'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className={`transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                          {item.icon}
                      </span>
                      <span className="mr-3">{item.label}</span>
                      {isActive && <span className="mr-auto w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                    </button>
                  </li>
                )
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-100">
            <p className="text-xs text-center text-slate-400">نسخه ۱.۰.۰</p>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto scroll-smooth">
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
