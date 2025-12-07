
import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Party, PartyType, BankAccount } from '../types';
import PartyForm from './PartyForm';

const emptyParty: Party = {
  id: 'seller', type: PartyType.NATURAL, economicCode: '', postalCode: '', province: '',
  city: '', address: '', fullName: '', nationalId: '', mobile: ''
};

const emptyBankAccount: Omit<BankAccount, 'id'> = {
    bankName: '', accountNumber: '', cardNumber: '', iban: ''
};

const Settings: React.FC = () => {
  const [seller, setSeller] = useLocalStorage<Party>('seller', emptyParty);
  const [bankAccounts, setBankAccounts] = useLocalStorage<BankAccount[]>('bankAccounts', []);
  const [invoiceHeader, setInvoiceHeader] = useLocalStorage<string>('invoiceHeader', '');
  const [invoiceFooter, setInvoiceFooter] = useLocalStorage<string>('invoiceFooter', '');
  const [currentBankAccount, setCurrentBankAccount] = useState<Omit<BankAccount, 'id'>>(emptyBankAccount);
  const [editingBankAccountId, setEditingBankAccountId] = useState<string | null>(null);

  const handleSaveSettings = () => {
    alert('تغییرات با موفقیت ذخیره شد.');
  };

  const handleBankAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentBankAccount({ ...currentBankAccount, [e.target.name]: e.target.value });
  };
  
  const handleSaveBankAccount = () => {
    if (!currentBankAccount.bankName || !currentBankAccount.accountNumber) {
        alert('لطفاً نام بانک و شماره حساب را وارد کنید.');
        return;
    }
    if(editingBankAccountId) {
        setBankAccounts(bankAccounts.map(acc => acc.id === editingBankAccountId ? {id: editingBankAccountId, ...currentBankAccount} : acc));
        setEditingBankAccountId(null);
    } else {
        setBankAccounts([...bankAccounts, {id: crypto.randomUUID(), ...currentBankAccount}]);
    }
    setCurrentBankAccount(emptyBankAccount);
  };

  const handleEditBankAccount = (account: BankAccount) => {
    setEditingBankAccountId(account.id);
    setCurrentBankAccount(account);
  };

  const handleDeleteBankAccount = (id: string) => {
    if (window.confirm('آیا از حذف این حساب بانکی مطمئن هستید؟')) {
        setBankAccounts(bankAccounts.filter(acc => acc.id !== id));
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <PartyForm party={seller} setParty={setSeller} title="اطلاعات فروشنده (من)" />
      </div>

      <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">تنظیمات چاپ فاکتور</h2>
        <div>
          <label htmlFor="invoiceHeader" className="block text-sm font-medium text-slate-700 mb-1.5">سربرگ فاکتور</label>
          <textarea 
            id="invoiceHeader"
            value={invoiceHeader}
            onChange={(e) => setInvoiceHeader(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="متنی که در بالای تمام فاکتورها نمایش داده می‌شود (مثلا: شرایط و ضوابط)"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="invoiceFooter" className="block text-sm font-medium text-slate-700 mb-1.5">پاورقی فاکتور</label>
           <textarea 
            id="invoiceFooter"
            value={invoiceFooter}
            onChange={(e) => setInvoiceFooter(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="متنی که در پایین تمام فاکتورها نمایش داده می‌شود (مثلا: از خرید شما متشکریم)"
          />
        </div>
      </div>

      <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">مدیریت حساب‌های بانکی</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <input name="bankName" value={currentBankAccount.bankName} onChange={handleBankAccountChange} placeholder="نام بانک" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
          <input name="accountNumber" value={currentBankAccount.accountNumber} onChange={handleBankAccountChange} placeholder="شماره حساب" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
          <input name="cardNumber" value={currentBankAccount.cardNumber} onChange={handleBankAccountChange} placeholder="شماره کارت" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
          <input name="iban" value={currentBankAccount.iban} onChange={handleBankAccountChange} placeholder="شماره شبا (بدون IR)" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
        </div>
        <div className="flex justify-end">
            <button onClick={handleSaveBankAccount} className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg shadow-sm hover:bg-green-700 focus:ring-4 focus:ring-green-100 transition-all">
            {editingBankAccountId ? 'ویرایش حساب' : 'افزودن حساب جدید'}
            </button>
        </div>

        <div className="mt-8 space-y-3">
            {bankAccounts.length === 0 ? <p className="text-slate-500 text-center py-4">هنوز حساب بانکی ثبت نشده است.</p> : null}
            {bankAccounts.map(acc => (
                <div key={acc.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                    <div className="mb-2 sm:mb-0">
                        <p className="font-bold text-slate-800">{acc.bankName}</p>
                        <p className="text-sm text-slate-600 mt-1 font-mono">{acc.accountNumber}</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                        <button onClick={() => handleEditBankAccount(acc)} className="flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">ویرایش</button>
                        <button onClick={() => handleDeleteBankAccount(acc.id)} className="flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">حذف</button>
                    </div>
                </div>
            ))}
        </div>
      </div>
      <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
         <button onClick={handleSaveSettings} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all">
            ذخیره تمام تغییرات
         </button>
     </div>
    </div>
  );
};

export default Settings;