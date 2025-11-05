export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  tax?: number;
  imageUrl?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  from: {
    name: string;
    address?: string;
    city?: string;
    zip?: string;
    country?: string;
    email?: string;
    phone?: string;
    taxId?: string;
  };
  to: {
    name: string;
    address?: string;
    city?: string;
    zip?: string;
    country?: string;
    email?: string;
    phone?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax?: number;
  taxRate?: number;
  total: number;
  currency?: string;
  notes?: string;
  paymentTerms?: string;
}

export type InvoiceTemplate = 'modern' | 'classic';

