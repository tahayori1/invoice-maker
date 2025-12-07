
import React, { useState, useEffect, useCallback } from 'react';
import { Invoice, InvoiceItem, Party, PartyType, Product, BankAccount, InvoiceType } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import PartyForm from './PartyForm';

interface InvoiceFormProps {
  initialInvoice?: Invoice;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
  products: Product[];
  customers: Party[];
}

const emptyBuyer: Party = {
  id: '', type: PartyType.NATURAL, economicCode: '', postalCode: '', province: '',
  city: '', address: '', fullName: '', nationalId: '', mobile: ''
};

const InvoiceForm: React.FC<InvoiceFormProps> = ({ initialInvoice, onSave, onCancel, products, customers }) => {
  const [invoice, setInvoice] = useState<Omit<Invoice, 'id' | 'subtotal' | 'taxAmount' | 'total'> & {id?: string}>(() => {
    const today = new Date().toISOString().split('T')[0];
    return initialInvoice || {
        invoiceNumber: `INV-${Date.now()}`,
        type: InvoiceType.INVOICE,
        date: today,
        dueDate: today,
        seller: {} as Party,
        buyer: emptyBuyer,
        items: [],
        taxRate: 9,
        discount: 0,
        notes: '',
        signature: '',
    };
  });
  
  const [seller] = useLocalStorage<Party>('seller', {} as Party);
  const [bankAccounts] = useLocalStorage<BankAccount[]>('bankAccounts', []);

  useEffect(() => {
    if (!initialInvoice) {
      setInvoice(prev => ({ ...prev, seller }));
    }
  }, [seller, initialInvoice]);
  
  const calculateTotals = useCallback(() => {
    const subtotal = invoice.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const totalItemDiscount = invoice.items.reduce((acc, item) => acc + (item.discount || 0), 0);
    const baseForTax = subtotal - totalItemDiscount - invoice.discount;
    const taxAmount = baseForTax > 0 ? baseForTax * (invoice.taxRate / 100) : 0;
    const total = baseForTax + taxAmount;
    return { subtotal, taxAmount, total, totalItemDiscount };
  }, [invoice.items, invoice.discount, invoice.taxRate]);


  const handleAddItem = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product && !invoice.items.find(item => item.productId === productId)) {
      const newItem: InvoiceItem = {
        productId: product.id,
        name: product.name,
        unit: product.unit,
        price: product.price,
        quantity: 1,
        description: '',
        discount: 0,
      };
      setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...invoice.items];
    (newItems[index] as any)[field] = value;
    setInvoice(prev => ({ ...prev, items: newItems }));
  };
  
  const handleRemoveItem = (index: number) => {
    const newItems = invoice.items.filter((_, i) => i !== index);
    setInvoice(prev => ({ ...prev, items: newItems }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setInvoice(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoice(prev => ({ ...prev, signature: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCustomer = customers.find(c => c.id === e.target.value);
    if (selectedCustomer) {
        setInvoice(prev => ({ ...prev, buyer: { ...selectedCustomer } }));
    }
  };
  
  const handleSaveInvoice = (type: InvoiceType) => {
      const finalInvoice: Invoice = {
          ...invoice,
          id: initialInvoice?.id || crypto.randomUUID(),
          ...calculateTotals(),
          type: type,
          invoiceNumber: type === InvoiceType.PROFORMA ? `PRF-${Date.now()}` : invoice.invoiceNumber
      };
      onSave(finalInvoice);
  };
  
  const { subtotal, taxAmount, total, totalItemDiscount } = calculateTotals();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 sticky top-0 z-20">
        <h2 className="text-xl font-bold text-slate-800">{initialInvoice ? 'ویرایش فاکتور' : 'صدور فاکتور جدید'}</h2>
        <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">لغو</button>
            <button onClick={() => handleSaveInvoice(InvoiceType.PROFORMA)} className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg shadow-sm hover:bg-amber-600 transition-colors">ذخیره پیش فاکتور</button>
            <button onClick={() => handleSaveInvoice(InvoiceType.INVOICE)} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors">ذخیره فاکتور</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">انتخاب خریدار از لیست مشتریان (اختیاری)</label>
            <div className="relative">
                <select onChange={handleCustomerSelect} className="w-full md:w-1/2 p-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none" defaultValue="">
                    <option value="" disabled>-- انتخاب مشتری برای پرکردن خودکار --</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.type === PartyType.NATURAL ? c.fullName : c.companyName} ({c.type === PartyType.NATURAL ? c.nationalId : c.companyId})
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 md:right-[50%] flex items-center px-3 text-slate-500">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        </div>
        <PartyForm party={invoice.buyer} setParty={(p) => setInvoice(prev => ({...prev, buyer: p}))} title="اطلاعات خریدار" />
      </div>
      
      {/* Invoice Items */}
      <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">اقلام فاکتور</h3>
        </div>
        
        <div className="mb-6">
             <label className="block text-sm font-medium text-slate-700 mb-2">افزودن کالا/خدمت</label>
             <select onChange={e => handleAddItem(e.target.value)} className="w-full md:w-1/3 p-2.5 bg-slate-50 border border-slate-300 rounded-lg" defaultValue="">
                <option value="" disabled>-- انتخاب محصول برای افزودن --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} - {p.price.toLocaleString('fa-IR')} ریال</option>)}
            </select>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-100 text-slate-700 font-medium">
              <tr>
                <th className="p-3 w-10 text-center">#</th>
                <th className="p-3">شرح کالا/خدمت</th>
                <th className="p-3 w-20">تعداد</th>
                <th className="p-3 w-20">واحد</th>
                <th className="p-3 w-28">مبلغ واحد</th>
                <th className="p-3 w-28">تخفیف</th>
                <th className="p-3 w-32">مبلغ کل</th>
                <th className="p-3 w-14"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {invoice.items.length === 0 ? (
                  <tr><td colSpan={8} className="text-center p-8 text-slate-400">هیچ آیتمی به فاکتور اضافه نشده است.</td></tr>
              ) : (
                invoice.items.map((item, index) => (
                    <React.Fragment key={index}>
                    <tr className="hover:bg-slate-50/70">
                        <td className="p-2 align-top text-center text-slate-500">{index + 1}</td>
                        <td className="p-2 align-top font-medium text-slate-800">{item.name}</td>
                        <td className="p-2 align-top"><input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.valueAsNumber)} className="w-full p-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-center" min="1" /></td>
                        <td className="p-2 align-top"><input value={item.unit} onChange={e => handleItemChange(index, 'unit', e.target.value)} className="w-full p-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-center" /></td>
                        <td className="p-2 align-top"><input type="number" value={item.price} onChange={e => handleItemChange(index, 'price', e.target.valueAsNumber)} className="w-full p-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-left dir-ltr" /></td>
                        <td className="p-2 align-top"><input type="number" value={item.discount || 0} onChange={e => handleItemChange(index, 'discount', e.target.valueAsNumber)} className="w-full p-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-left dir-ltr" /></td>
                        <td className="p-2 align-top font-mono font-semibold">{((item.quantity * item.price) - (item.discount || 0)).toLocaleString('fa-IR')}</td>
                        <td className="p-2 align-top text-center">
                            <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 transition-colors" title="حذف">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                        <td></td>
                        <td colSpan={6} className="pb-2 px-2">
                             <input type="text" value={item.description || ''} onChange={e => handleItemChange(index, 'description', e.target.value)} placeholder="توضیحات این قلم (اختیاری)" className="w-full p-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500" />
                        </td>
                        <td></td>
                    </tr>
                    </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals and Signature */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-sm border border-slate-200 space-y-4">
             <h3 className="text-lg font-bold text-slate-800 border-b pb-2">اطلاعات تکمیلی</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">شماره فاکتور</label><input type="text" name="invoiceNumber" value={invoice.invoiceNumber} onChange={handleInputChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">تاریخ صدور</label><input type="date" name="date" value={invoice.date} onChange={handleInputChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/></div>
            </div>
            <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">انتخاب حساب بانکی</label>
                <select name="bankAccount" onChange={e => setInvoice(prev => ({...prev, bankAccount: bankAccounts.find(b => b.id === e.target.value)}))} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="">-- بدون حساب بانکی --</option>
                    {bankAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountNumber}</option>)}
                </select>
            </div>
            <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">توضیحات فاکتور</label>
                <textarea name="notes" value={invoice.notes} onChange={handleInputChange} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="توضیحات تکمیلی، شرایط پرداخت و ..."></textarea>
            </div>
             <div className="mt-4 p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                <label className="block text-sm font-medium text-slate-700 mb-2">تصویر مهر و امضا (PNG)</label>
                <input type="file" accept="image/png" onChange={handleSignatureUpload} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                {invoice.signature && <div className="mt-3"><p className="text-xs text-slate-500 mb-1">پیش نمایش:</p><img src={invoice.signature} alt="امضا" className="h-16 border bg-white p-1 rounded" /></div>}
            </div>
        </div>

        <div className="p-6 bg-slate-50 rounded-xl shadow-sm border border-slate-200 h-fit">
             <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">محاسبات مالی</h3>
             <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center text-slate-600">
                    <span>جمع کل اقلام:</span> 
                    <span className="font-mono font-medium">{subtotal.toLocaleString('fa-IR')} <span className="text-xs">ریال</span></span>
                </div>
                 <div className="flex justify-between items-center text-slate-600">
                    <span>تخفیف اقلام:</span> 
                    <span className="font-mono font-medium text-red-600">{totalItemDiscount.toLocaleString('fa-IR')} <span className="text-xs">ریال</span></span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1">تخفیف کلی:</span> 
                    <div className="flex items-center gap-2">
                        <input type="number" name="discount" value={invoice.discount} onChange={handleInputChange} className="w-24 p-1.5 text-sm bg-white border border-slate-300 rounded text-left focus:ring-1 focus:ring-blue-500" />
                        <span className="text-xs">ریال</span>
                    </div>
                </div>
                 <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1">مالیات: 
                        <input type="number" name="taxRate" value={invoice.taxRate} onChange={handleInputChange} className="w-12 p-1 text-center text-sm bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500" /> 
                        %
                    </span> 
                    <span className="font-mono font-medium">{taxAmount.toLocaleString('fa-IR')} <span className="text-xs">ریال</span></span>
                </div>
                
                <div className="border-t border-slate-200 my-4"></div>
                
                <div className="flex justify-between items-center text-lg font-bold text-slate-900">
                    <span>مبلغ قابل پرداخت:</span> 
                    <span>{total.toLocaleString('fa-IR')} <span className="text-sm font-normal text-slate-500">ریال</span></span>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;