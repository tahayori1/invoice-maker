
export enum PartyType {
  NATURAL = 'NATURAL',
  LEGAL = 'LEGAL',
}

export interface Party {
  id: string;
  type: PartyType;
  economicCode: string;
  postalCode: string;
  province: string;
  city: string;
  address: string;
  
  // Natural Person
  fullName?: string;
  nationalId?: string;
  mobile?: string;

  // Legal Entity
  companyName?: string;
  registrationNumber?: string;
  companyId?: string;
  phone?: string;
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  price: number;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
}

export enum InvoiceType {
  PROFORMA = 'PROFORMA',
  INVOICE = 'INVOICE',
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  cardNumber: string;
  iban: string;
}

export interface Invoice {
  id: string;
  type: InvoiceType;
  invoiceNumber: string;
  proformaId?: string;
  date: string; 
  dueDate: string;
  seller: Party;
  buyer: Party;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  notes: string;
  signature: string; // base64 data URL
  bankAccount?: BankAccount;
}
