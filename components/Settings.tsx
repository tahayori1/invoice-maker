
import React, { useState, useRef } from 'react';
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
  const restoreInputRef = useRef<HTMLInputElement>(null);

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

  const handleBackup = () => {
    try {
        const backupData = {
            invoices: JSON.parse(localStorage.getItem('invoices') || '[]'),
            products: JSON.parse(localStorage.getItem('products') || '[]'),
            customers: JSON.parse(localStorage.getItem('customers') || '[]'),
            seller: JSON.parse(localStorage.getItem('seller') || '{}'),
            bankAccounts: JSON.parse(localStorage.getItem('bankAccounts') || '[]'),
            invoiceHeader: JSON.parse(localStorage.getItem('invoiceHeader') || '""'),
            invoiceFooter: JSON.parse(localStorage.getItem('invoiceFooter') || '""'),
        };

        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const today = new Date().toISOString().slice(0, 10);
        link.href = url;
        link.download = `invoice-maker-backup-${today}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error creating backup:', error);
        alert('خطا در ایجاد فایل پشتیبان.');
    }
  };

  const handleRestoreClick = () => {
    restoreInputRef.current?.click();
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                throw new Error("File content is not a string");
            }
            const data = JSON.parse(text);

            const requiredKeys = ['invoices', 'products', 'customers', 'seller'];
            const hasRequiredKeys = requiredKeys.every(key => key in data);

            if (!hasRequiredKeys) {
                alert('فایل پشتیبان نامعتبر است یا فرمت صحیحی ندارد.');
                return;
            }

            if (window.confirm('توجه: بازیابی اطلاعات باعث حذف تمام اطلاعات فعلی شما (فاکتورها، مشتریان، محصولات و تنظیمات) خواهد شد. آیا مطمئن هستید؟')) {
                Object.keys(data).forEach(key => {
                    localStorage.setItem(key, JSON.stringify(data[key]));
                });
                alert('اطلاعات با موفقیت بازیابی شد. صفحه مجدداً بارگذاری می‌شود.');
                window.location.reload();
            }
        } catch (error) {
            console.error('Error restoring from backup:', error);
            alert('خطا در خواندن فایل پشتیبان. لطفاً از معتبر بودن فایل اطمینان حاصل کنید.');
        } finally {
            // Reset file input value to allow selecting the same file again
            if (restoreInputRef.current) {
                restoreInputRef.current.value = '';
            }
        }
    };
    reader.readAsText(file);
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
                        <p className="text-sm text-slate-600 mt-1">{acc.accountNumber}</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                        <button onClick={() => handleEditBankAccount(acc)} className="flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">ویرایش</button>
                        <button onClick={() => handleDeleteBankAccount(acc.id)} className="flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">حذف</button>
                    </div>
                </div>
            ))}
        </div>
      </div>
       
      <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">پشتیبان‌گیری و بازیابی اطلاعات</h2>
        <p className="text-sm text-slate-600 mb-6">شما می‌توانید از تمام اطلاعات خود (فاکتورها، مشتریان، محصولات و تنظیمات) یک فایل پشتیبان تهیه کنید یا اطلاعات خود را از یک فایل پشتیبان بازیابی نمایید. تمام اطلاعات در مرورگر شما ذخیره می‌شود و ما به آن دسترسی نداریم.</p>
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <button onClick={handleBackup} className="w-full sm:w-auto flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow-sm hover:bg-green-700 focus:ring-4 focus:ring-green-100 transition-all">
                دریافت فایل پشتیبان (JSON)
            </button>
            <button onClick={handleRestoreClick} className="w-full sm:w-auto flex-1 px-6 py-3 bg-red-600 text-white font-medium rounded-lg shadow-sm hover:bg-red-700 focus:ring-4 focus:ring-red-100 transition-all">
                بازیابی اطلاعات از فایل
            </button>
            <input type="file" ref={restoreInputRef} onChange={handleRestore} accept=".json" className="hidden" />
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