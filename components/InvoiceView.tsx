
import React from 'react';
import { Invoice, InvoiceType, PartyType } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

// Declare htmlToImage for TypeScript
declare const htmlToImage: any;

interface InvoiceViewProps {
  invoice: Invoice;
  onBack: () => void;
}

const PartyInfo: React.FC<{ title: string; party: Invoice['seller'] }> = ({ title, party }) => (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
        <h3 className="font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1.5 text-base">{title}</h3>
        <div className="space-y-1 leading-relaxed text-xs">
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
  const [invoiceHeader] = useLocalStorage<string>('invoiceHeader', '');
  const [invoiceFooter] = useLocalStorage<string>('invoiceFooter', '');
  const [isExporting, setIsExporting] = React.useState(false);


  const handlePrint = () => {
      window.print();
  };
  
  const handleExportPng = () => {
    const node = document.getElementById('print-area');
    if (node) {
        setIsExporting(true);
        htmlToImage.toPng(node, { 
            quality: 0.98,
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            cacheBust: true,
        })
          .then((dataUrl: string) => {
            const link = document.createElement('a');
            link.download = `${invoice.invoiceNumber}.png`;
            link.href = dataUrl;
            link.click();
          })
          .catch((error: any) => {
            console.error('oops, something went wrong!', error);
            alert('خطا در ایجاد تصویر PNG.');
          })
          .finally(() => {
              setIsExporting(false);
          });
      }
  };

  const totalItemDiscount = invoice.items.reduce((acc, item) => acc + (item.discount || 0), 0);
  
  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
        <div className="max-w-[210mm] mx-auto bg-white shadow-2xl rounded-lg overflow-hidden no-print-shadow print:shadow-none print:w-full print:max-w-none">
            
            {/* Toolbar - Hidden in Print */}
            <div className="flex flex-wrap justify-between items-center p-4 sm:p-6 border-b border-gray-100 bg-gray-50 no-print">
                <h2 className="text-lg sm:text-xl font-bold text-slate-700 mb-2 sm:mb-0">پیش‌نمایش چاپ</h2>
                <div className="flex gap-2 sm:gap-3">
                    <button onClick={onBack} className="px-4 py-2 text-slate-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">بازگشت</button>
                    <button onClick={handleExportPng} disabled={isExporting} className="px-5 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-sm transition-colors flex items-center gap-2 disabled:bg-green-300">
                        {isExporting ? 'در حال ساخت...' : 'خروجی PNG'}
                    </button>
                    <button onClick={handlePrint} className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        چاپ
                    </button>
                </div>
            </div>

            {/* Invoice Content */}
            <div id="print-area" className="p-6 sm:p-8 print:p-2 bg-white">
                {invoiceHeader && (
                    <div className="mb-4 p-3 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-xs text-gray-600 whitespace-pre-wrap">{invoiceHeader}</div>
                )}
                {/* Header */}
                <header className="flex justify-between items-start pb-4 border-b-2 border-gray-800 mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 mb-1">{invoice.type === InvoiceType.INVOICE ? 'فاکتور فروش کالا و خدمات' : 'پیش فاکتور'}</h1>
                    </div>
                    <div className="text-left text-xs space-y-1">
                        <p className="text-sm font-bold text-gray-800">شماره: {invoice.invoiceNumber}</p>
                        <p className="text-gray-600">تاریخ: {new Date(invoice.date).toLocaleDateString('fa-IR')}</p>
                        {invoice.proformaId && <p className="text-xs text-gray-500">عطف به پ.ف: {invoices.find(i => i.id === invoice.proformaId)?.invoiceNumber}</p>}
                    </div>
                </header>
                
                {/* Parties */}
                <section className="grid grid-cols-2 gap-4 mb-6 text-sm">
                   <PartyInfo title="فروشنده" party={invoice.seller} />
                   <PartyInfo title="خریدار" party={invoice.buyer} />
                </section>

                {/* Items */}
                <section className="mb-6">
                    <table className="w-full text-xs border-collapse">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="p-2 text-center border-l border-gray-700 w-8 rounded-tr-lg">#</th>
                                <th className="p-2 text-right border-l border-gray-700">شرح</th>
                                <th className="p-2 text-center border-l border-gray-700 w-12">تعداد</th>
                                <th className="p-2 text-center border-l border-gray-700 w-16">واحد</th>
                                <th className="p-2 text-right border-l border-gray-700 w-24">مبلغ واحد</th>
                                <th className="p-2 text-right border-l border-gray-700 w-24">تخفیف</th>
                                <th className="p-2 text-right w-28 rounded-tl-lg">مبلغ کل</th>
                            </tr>
                        </thead>
                        <tbody className="border border-gray-200">
                            {invoice.items.map((item, index) => (
                                <tr key={index} className="even:bg-gray-50 hover:bg-gray-100 transition-colors print:hover:bg-transparent border-b border-gray-200 last:border-b-0">
                                    <td className="p-2 border-l border-gray-200 text-center text-gray-500 align-top">{index + 1}</td>
                                    <td className="p-2 border-l border-gray-200 font-medium text-gray-900 align-top">
                                        {item.name}
                                        {item.description && <p className="text-xs font-normal text-gray-500 mt-1">{item.description}</p>}
                                    </td>
                                    <td className="p-2 border-l border-gray-200 text-center align-top">{item.quantity}</td>
                                    <td className="p-2 border-l border-gray-200 text-center align-top">{item.unit}</td>
                                    <td className="p-2 border-l border-gray-200 text-right align-top">{item.price.toLocaleString('fa-IR')}</td>
                                    <td className="p-2 border-l border-gray-200 text-right align-top text-red-600">{(item.discount || 0).toLocaleString('fa-IR')}</td>
                                    <td className="p-2 font-bold text-gray-800 text-right align-top">{((item.quantity * item.price) - (item.discount || 0)).toLocaleString('fa-IR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
                
                {/* Footer Section */}
                <section className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="w-full md:w-3/5 space-y-4">
                        {invoice.bankAccount && (
                            <div className="p-3 border border-gray-200 rounded-lg bg-white">
                                <h4 className="font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1 text-sm">اطلاعات حساب بانکی</h4>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-600">
                                    <p>بانک: <span className="font-semibold text-gray-900">{invoice.bankAccount.bankName}</span></p>
                                    <p>شماره کارت: <span className="text-gray-900">{invoice.bankAccount.cardNumber}</span></p>
                                    <p className="col-span-2">شماره حساب: <span className="text-gray-900">{invoice.bankAccount.accountNumber}</span></p>
                                    <p className="col-span-2">شبا: <span className="text-gray-900">IR{invoice.bankAccount.iban}</span></p>
                                </div>
                            </div>
                        )}
                         {invoice.notes && (
                            <div className="text-xs">
                                <h4 className="font-bold text-gray-800 mb-1">توضیحات:</h4>
                                <p className="text-gray-600 leading-relaxed bg-gray-50 p-2 rounded border border-gray-200 whitespace-pre-wrap">{invoice.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="w-full md:w-2/5 flex-shrink-0">
                        <table className="w-full text-xs border border-gray-300 rounded-lg overflow-hidden">
                            <tbody>
                                <tr className="bg-gray-50 border-b border-gray-300"><td className="p-2 font-bold text-gray-700">جمع کل:</td><td className="p-2 text-left font-bold text-gray-900">{invoice.subtotal.toLocaleString('fa-IR')} <span className="text-2xs font-normal">ریال</span></td></tr>
                                { (totalItemDiscount > 0) && <tr className="border-b border-gray-300"><td className="p-2 text-gray-600">تخفیف اقلام:</td><td className="p-2 text-left text-red-600">{totalItemDiscount.toLocaleString('fa-IR')} <span className="text-2xs font-normal">ریال</span></td></tr> }
                                { (invoice.discount > 0) && <tr className="border-b border-gray-300"><td className="p-2 text-gray-600">تخفیف کلی:</td><td className="p-2 text-left text-red-600">{invoice.discount.toLocaleString('fa-IR')} <span className="text-2xs font-normal">ریال</span></td></tr> }
                                <tr className="border-b border-gray-300"><td className="p-2 text-gray-600">مالیات ({invoice.taxRate}%):</td><td className="p-2 text-left text-gray-900">{invoice.taxAmount.toLocaleString('fa-IR')} <span className="text-2xs font-normal">ریال</span></td></tr>
                                <tr className="bg-gray-800 text-white font-bold text-base"><td className="p-3">مبلغ قابل پرداخت:</td><td className="p-3 text-left">{invoice.total.toLocaleString('fa-IR')} <span className="text-sm font-normal opacity-80">ریال</span></td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <footer className="grid grid-cols-2 gap-8 mt-10 pt-6 border-t-2 border-gray-200 text-sm">
                     <div className="text-center">
                        <p className="font-bold text-gray-800 mb-2">مهر و امضای فروشنده</p>
                        <div className="h-28 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                            {invoice.signature ? <img src={invoice.signature} alt="امضای فروشنده" className="max-h-24 object-contain" /> : <span className="text-gray-400 text-xs">محل امضا</span>}
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-gray-800 mb-2">مهر و امضای خریدار</p>
                        <div className="h-28 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50"></div>
                    </div>
                </footer>
                
                {invoiceFooter && (
                     <div className="mt-6 pt-4 border-t border-dashed text-center text-xs text-gray-500 whitespace-pre-wrap">{invoiceFooter}</div>
                )}
            </div>
        </div>
    </div>
  );
};
export default InvoiceView;