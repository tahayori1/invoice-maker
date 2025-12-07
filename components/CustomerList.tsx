
import React, { useState } from 'react';
import { Party, PartyType } from '../types';
import PartyForm from './PartyForm';

interface CustomerListProps {
  customers: Party[];
  setCustomers: React.Dispatch<React.SetStateAction<Party[]>>;
}

const emptyCustomer: Party = {
  id: '', type: PartyType.NATURAL, economicCode: '', postalCode: '', province: '',
  city: '', address: '', fullName: '', nationalId: '', mobile: ''
};

const CustomerList: React.FC<CustomerListProps> = ({ customers, setCustomers }) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [currentCustomer, setCurrentCustomer] = useState<Party>(emptyCustomer);

  const handleSave = () => {
     if (currentCustomer.type === PartyType.NATURAL && !currentCustomer.fullName) {
         alert('نام وارد نشده است'); return;
     }
     if (currentCustomer.type === PartyType.LEGAL && !currentCustomer.companyName) {
         alert('نام شرکت وارد نشده است'); return;
     }

     if (currentCustomer.id) {
         setCustomers(customers.map(c => c.id === currentCustomer.id ? currentCustomer : c));
     } else {
         setCustomers([...customers, { ...currentCustomer, id: crypto.randomUUID() }]);
     }
     setView('list');
     setCurrentCustomer(emptyCustomer);
  };

  const handleEdit = (customer: Party) => {
      setCurrentCustomer(customer);
      setView('form');
  };

  const handleDelete = (id: string) => {
      if(window.confirm('آیا از حذف این مشتری مطمئن هستید؟')) {
          setCustomers(customers.filter(c => c.id !== id));
      }
  };

  const handleCreateNew = () => {
      setCurrentCustomer(emptyCustomer);
      setView('form');
  };

  if (view === 'form') {
      return (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-5xl mx-auto">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">{currentCustomer.id ? 'ویرایش مشتری' : 'افزودن مشتری جدید'}</h2>
             </div>
             <PartyForm party={currentCustomer} setParty={setCurrentCustomer} title="اطلاعات مشتری" />
             <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                 <button onClick={() => setView('list')} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">انصراف</button>
                 <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all">ذخیره مشتری</button>
             </div>
          </div>
      )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-800 mb-4 sm:mb-0">مدیریت مشتریان</h2>
        <button onClick={handleCreateNew} className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all flex items-center">
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          افزودن مشتری جدید
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">نام / شرکت</th>
              <th className="px-6 py-4">نوع</th>
              <th className="px-6 py-4">کد ملی / شناسه</th>
              <th className="px-6 py-4">شماره تماس</th>
              <th className="px-6 py-4 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map(customer => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                        {customer.type === PartyType.NATURAL ? customer.fullName : customer.companyName}
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.type === PartyType.NATURAL ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                            {customer.type === PartyType.NATURAL ? 'حقیقی' : 'حقوقی'}
                        </span>
                    </td>
                    <td className="px-6 py-4 font-mono">
                         {customer.type === PartyType.NATURAL ? customer.nationalId : customer.companyId}
                    </td>
                    <td className="px-6 py-4 font-mono">
                         {customer.type === PartyType.NATURAL ? customer.mobile : customer.phone}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                             <button onClick={() => handleEdit(customer)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="ویرایش">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                             </button>
                            <button onClick={() => handleDelete(customer.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            ))}
            {customers.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                        <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <p>هنوز مشتری ثبت نشده است.</p>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerList;
