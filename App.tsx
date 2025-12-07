
import React, { useState } from 'react';
import Layout from './components/Layout';
import InvoiceList from './components/InvoiceList';
import ProductList from './components/ProductList';
import CustomerList from './components/CustomerList';
import Settings from './components/Settings';
import InvoiceForm from './components/InvoiceForm';
import { Invoice, Product, Party } from './types';
import useLocalStorage from './hooks/useLocalStorage';

export type View = 'list' | 'create' | 'edit' | 'products' | 'settings' | 'customers';
export type InvoiceView = {
  view: 'edit' | 'create',
  invoice?: Invoice
}

const App: React.FC = () => {
  const [view, setView] = useState<View>('list');
  const [invoiceView, setInvoiceView] = useState<InvoiceView | null>(null);

  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [products, setProducts] = useLocalStorage<Product[]>('products', []);
  const [customers, setCustomers] = useLocalStorage<Party[]>('customers', []);

  const handleSaveInvoice = (invoice: Invoice) => {
    const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
    if (existingIndex > -1) {
      const updatedInvoices = [...invoices];
      updatedInvoices[existingIndex] = invoice;
      setInvoices(updatedInvoices);
    } else {
      setInvoices([...invoices, invoice]);
    }
    setInvoiceView(null);
    setView('list');
  };
  
  const handleEditInvoice = (invoiceId: string) => {
    const invoiceToEdit = invoices.find(inv => inv.id === invoiceId);
    if (invoiceToEdit) {
      setInvoiceView({ view: 'edit', invoice: invoiceToEdit });
      setView('edit');
    }
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (window.confirm('آیا از حذف این فاکتور مطمئن هستید؟')) {
      setInvoices(invoices.filter(inv => inv.id !== invoiceId));
    }
  };

  const handleCreateNew = () => {
    setInvoiceView({ view: 'create' });
    setView('create');
  }

  const renderContent = () => {
    if (view === 'create' || view === 'edit') {
      return invoiceView && <InvoiceForm
        initialInvoice={invoiceView.invoice}
        onSave={handleSaveInvoice}
        onCancel={() => {
          setInvoiceView(null);
          setView('list');
        }}
        products={products}
        customers={customers}
      />
    }
    switch (view) {
      case 'list':
        return <InvoiceList invoices={invoices} onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} onCreateNew={handleCreateNew} setInvoices={setInvoices}/>;
      case 'products':
        return <ProductList products={products} setProducts={setProducts} />;
      case 'customers':
        return <CustomerList customers={customers} setCustomers={setCustomers} />;
      case 'settings':
        return <Settings />;
      default:
        return <InvoiceList invoices={invoices} onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} onCreateNew={handleCreateNew} setInvoices={setInvoices}/>;
    }
  };

  return (
    <Layout currentView={view} setView={setView}>
      {renderContent()}
    </Layout>
  );
};

export default App;
