
import React from 'react';
import { Invoice, InvoiceType, PartyType } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

interface InvoiceViewProps {
  invoice: Invoice;
  onBack: () => void;
}

const PartyInfo: React.FC<{ title: string; party: Invoice['seller'] }> = ({ title, party }) => (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
        <h3 className="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2 text-lg">{title}</h3>
        <div className="space-y-1.5 leading-relaxed">
            {party.type === PartyType.LEGAL ? (
                <>
                    <p><span className="font-medium text-gray-600">نام شرکت:</span> {party.companyName}</p>
                    <p><span className="font-medium text-gray-600">شناسه ملی:</span> {party.companyId}</p>
                    <p><span className="font-medium text-gray-600">شماره ثبت:</span> {party.registrationNumber}</p>
                    <p><span className="font-medium text-gray-600">شماره تماس:</span> {party.phone}</p>
                </>
            ) : (
                <>
                    <p><span className="font-medium text-gray-600">نام:</span> {party.fullName}</p>
                    <p><span className="font-medium text-gray-600">کد ملی:</span> {party.nationalId}</p>
                    <p><span className="font-medium text-gray-600">شماره همراه:</span> {party.mobile}</p>
                </>
            )}
            <p><span className="font-medium text-gray-600">شماره اقتصادی:</span> {party.economicCode}</p>
            <p><span className="font-medium text-gray-600">کد پستی:</span> {party.postalCode}</p>
            <p><span className="font-medium text-gray-600">آدرس:</span> {party.province}، {party.city}، {party.address}</p>
        </div>
    </div>
);

const InvoiceView: React.FC<InvoiceViewProps> = ({ invoice, onBack }) => {
  const [invoices] = useLocalStorage<Invoice[]>('invoices', []);

  const handlePrint = () => {
      window.print();
  };
  
  return (
    <div className="min-h-screen bg-slate-100 p-8">
        <div className="max-w-[210mm] mx-auto bg-white shadow-2xl rounded-none sm:rounded-lg overflow-hidden no-print-shadow print:shadow-none print:w-full print:max-w-none">
            
            {/* Toolbar - Hidden in Print */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 no-print">
                <h2 className="text-xl font-bold text-slate-700">پیش‌نمایش چاپ</h2>
                <div className="flex gap-3">
                    <button onClick={onBack} className="px-4 py-2 text-slate-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">بازگشت</button>
                    <button onClick={handlePrint} className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        چاپ فاکتور
                    </button>
                </div>
            </div>

            {/* Invoice Content */}
            <div id="print-area" className="p-10 print:p-0">
                {/* Header */}
                <header className="flex justify-between items-start pb-6 border-b-2 border-gray-800 mb-8">
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">{invoice.type === InvoiceType.INVOICE ? 'فاکتور فروش کالا و خدمات' : 'پیش فاکتور'}</h1>
                        <div className="text-sm text-gray-500">سیستم تولید خودکار فاکتور</div>
                    </div>
                    <div className="text-left space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-200 print:border-0 print:bg-transparent print:p-0">
                        <p className="font-mono text-lg font-bold text-gray-800">شماره: {invoice.invoiceNumber}</p>
                        <p className="text-gray-600">تاریخ صدور: {new Date(invoice.date).toLocaleDateString('fa-IR')}</p>
                        {invoice.proformaId && <p className="text-sm text-gray-500 mt-1">عطف به پیش فاکتور: {invoices.find(i => i.id === invoice.proformaId)?.invoiceNumber}</p>}
                    </div>
                </header>
                
                {/* Parties */}
                <section className="grid grid-cols-2 gap-8 mb-10 text-sm">
                   <PartyInfo title="فروشنده" party={invoice.seller} />
                   <PartyInfo title="خریدار" party={invoice.buyer} />
                </section>

                {/* Items */}
                <section className="mb-10">
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="p-3 text-center border-l border-gray-700 w-12 rounded-tr-lg">#</th>
                                <th className="p-3 text-right border-l border-gray-700">شرح کالا یا خدمات</th>
                                <th className="p-3 text-center border-l border-gray-700 w-20">تعداد</th>
                                <th className="p-3 text-center border-l border-gray-700 w-24">واحد</th>
                                <th className="p-3 text-right border-l border-gray-700 w-32">مبلغ واحد (ریال)</th>
                                <th className="p-3 text-right w-36 rounded-tl-lg">مبلغ کل (ریال)</th>
                            </tr>
                        </thead>
                        <tbody className="border border-gray-200">
                            {invoice.items.map((item, index) => (
                                <tr key={index} className="even:bg-gray-50 hover:bg-gray-100 transition-colors print:hover:bg-transparent">
                                    <td className="p-3 border-l border-gray-200 text-center font-mono text-gray-500">{index + 1}</td>
                                    <td className="p-3 border-l border-gray-200 font-medium text-gray-900">{item.name}</td>
                                    <td className="p-3 border-l border-gray-200 text-center font-mono">{item.quantity}</td>
                                    <td className="p-3 border-l border-gray-200 text-center">{item.unit}</td>
                                    <td className="p-3 border-l border-gray-200 font-mono">{item.price.toLocaleString('fa-IR')}</td>
                                    <td className="p-3 font-mono font-bold text-gray-800">{(item.quantity * item.price).toLocaleString('fa-IR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
                
                {/* Footer Section */}
                <section className="flex flex-col md:flex-row justify-between gap-8">
                    <div className="w-full md:w-3/5 space-y-6">
                        {invoice.bankAccount && (
                            <div className="p-4 border border-gray-300 rounded-lg bg-white">
                                <h4 className="font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">اطلاعات حساب بانکی</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                    <p>بانک: <span className="font-semibold text-gray-900">{invoice.bankAccount.bankName}</span></p>
                                    <p>شماره کارت: <span className="font-mono text-gray-900">{invoice.bankAccount.cardNumber}</span></p>
                                    <p className="col-span-2">شماره حساب: <span className="font-mono text-gray-900">{invoice.bankAccount.accountNumber}</span></p>
                                    <p className="col-span-2">شبا: <span className="font-mono text-gray-900">IR{invoice.bankAccount.iban}</span></p>
                                </div>
                            </div>
                        )}
                         {invoice.notes && (
                            <div className="text-sm">
                                <h4 className="font-bold text-gray-800 mb-1">توضیحات:</h4>
                                <p className="text-gray-600 leading-relaxed bg-gray-50 p-3 rounded border border-gray-200">{invoice.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="w-full md:w-2/5">
                        <table className="w-full text-sm border border-gray-300 rounded-lg overflow-hidden">
                            <tbody>
                                <tr className="bg-gray-50 border-b border-gray-300"><td className="p-3 font-bold text-gray-700">جمع کل:</td><td className="p-3 text-left font-mono font-bold text-gray-900">{invoice.subtotal.toLocaleString('fa-IR')} <span className="text-xs font-normal">ریال</span></td></tr>
                                <tr className="border-b border-gray-300"><td className="p-3 text-gray-600">تخفیف:</td><td className="p-3 text-left font-mono text-gray-900">{invoice.discount.toLocaleString('fa-IR')} <span className="text-xs font-normal">ریال</span></td></tr>
                                <tr className="border-b border-gray-300"><td className="p-3 text-gray-600">مالیات ({invoice.taxRate}%):</td><td className="p-3 text-left font-mono text-gray-900">{invoice.taxAmount.toLocaleString('fa-IR')} <span className="text-xs font-normal">ریال</span></td></tr>
                                <tr className="bg-gray-800 text-white font-bold text-lg"><td className="p-4">مبلغ قابل پرداخت:</td><td className="p-4 text-left font-mono">{invoice.total.toLocaleString('fa-IR')} <span className="text-sm font-normal opacity-80">ریال</span></td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <footer className="grid grid-cols-2 gap-12 mt-16 pt-8 border-t-2 border-gray-200">
                     <div className="text-center">
                        <p className="font-bold text-gray-800 mb-4">مهر و امضای فروشنده</p>
                        <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                            {invoice.signature ? <img src={invoice.signature} alt="امضای فروشنده" className="max-h-28 object-contain" /> : <span className="text-gray-400 text-sm">محل امضا</span>}
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-gray-800 mb-4">مهر و امضای خریدار</p>
                        <div className="h-32 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50"></div>
                    </div>
                </footer>
                
                <div className="text-center mt-12 text-xs text-gray-400 no-print">
                    این فاکتور با استفاده از نرم‌افزار فاکتورساز تولید شده است.
                </div>
            </div>
        </div>
    </div>
  );
};
export default InvoiceView;
