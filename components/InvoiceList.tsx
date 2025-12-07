
import React, { useState } from 'react';
import { Invoice, InvoiceType } from '../types';
import InvoiceView from './InvoiceView';

interface InvoiceListProps {
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, setInvoices, onEdit, onDelete, onCreateNew }) => {
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const handleConvertToInvoice = (proformaId: string) => {
    const proforma = invoices.find(inv => inv.id === proformaId);
    if (proforma) {
        const newInvoice: Invoice = {
            ...proforma,
            id: crypto.randomUUID(),
            type: InvoiceType.INVOICE,
            invoiceNumber: `INV-${Date.now()}`,
            proformaId: proforma.id,
            date: new Date().toISOString().split('T')[0],
        };
        setInvoices([...invoices, newInvoice]);
        alert('پیش فاکتور با موفقیت به فاکتور تبدیل شد.');
    }
  };

  const sortedInvoices = [...invoices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (viewingInvoice) {
    return <InvoiceView invoice={viewingInvoice} onBack={() => setViewingInvoice(null)} />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-800 mb-4 sm:mb-0">لیست فاکتورها</h2>
        <button onClick={onCreateNew} className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all flex items-center">
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          صدور فاکتور جدید
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
            <tr>
              <th scope="col" className="px-6 py-4">شماره</th>
              <th scope="col" className="px-6 py-4">نوع</th>
              <th scope="col" className="px-6 py-4">خریدار</th>
              <th scope="col" className="px-6 py-4">تاریخ صدور</th>
              <th scope="col" className="px-6 py-4">مبلغ کل (ریال)</th>
              <th scope="col" className="px-6 py-4 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{invoice.invoiceNumber}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                    invoice.type === InvoiceType.INVOICE 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {invoice.type === InvoiceType.INVOICE ? 'فاکتور' : 'پیش فاکتور'}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">{invoice.buyer.fullName || invoice.buyer.companyName}</td>
                <td className="px-6 py-4">{new Date(invoice.date).toLocaleDateString('fa-IR')}</td>
                <td className="px-6 py-4 font-bold text-slate-800">{invoice.total.toLocaleString('fa-IR')}</td>
                <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-3">
                        <button onClick={() => setViewingInvoice(invoice)} className="text-slate-500 hover:text-blue-600 transition-colors font-medium text-xs" title="مشاهده">مشاهده</button>
                        <button onClick={() => onEdit(invoice.id)} className="text-slate-500 hover:text-blue-600 transition-colors font-medium text-xs" title="ویرایش">ویرایش</button>
                        <button onClick={() => onDelete(invoice.id)} className="text-slate-500 hover:text-red-600 transition-colors font-medium text-xs" title="حذف">حذف</button>
                        {invoice.type === InvoiceType.PROFORMA && (
                            <button onClick={() => handleConvertToInvoice(invoice.id)} className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs font-bold transition-colors" title="تبدیل به فاکتور">
                                تبدیل
                            </button>
                        )}
                    </div>
                </td>
              </tr>
            ))}
             {sortedInvoices.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                         <svg className="w-16 h-16 mx-auto mb-4 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p>هنوز فاکتوری صادر نشده است.</p>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceList;