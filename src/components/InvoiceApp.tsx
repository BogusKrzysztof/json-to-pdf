import { useState, useEffect } from 'react';
import { InvoiceData, InvoiceTemplate } from '../types/invoice';
import { PDFGenerator } from '../services/pdfGenerator';
import TemplateSelector from './TemplateSelector';
import JsonInput from './JsonInput';
import PDFPreview from './PDFPreview';

const defaultInvoiceData: InvoiceData = {
  invoiceNumber: 'INV-2024-001',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  from: {
    name: 'Your Company Name',
    address: '123 Business Street',
    city: 'New York',
    zip: '10001',
    country: 'USA',
    email: 'contact@yourcompany.com',
    phone: '+1 (555) 123-4567',
    taxId: 'TAX-123456',
  },
  to: {
    name: 'Client Company Name',
    address: '456 Client Avenue',
    city: 'Los Angeles',
    zip: '90001',
    country: 'USA',
    email: 'billing@clientcompany.com',
    phone: '+1 (555) 987-6543',
  },
  items: [
    {
      description: 'Web Development Services',
      quantity: 40,
      unitPrice: 150.0,
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop',
    },
    {
      description: 'UI/UX Design',
      quantity: 20,
      unitPrice: 120.0,
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&h=200&fit=crop',
    },
    {
      description: 'Consultation',
      quantity: 10,
      unitPrice: 100.0,
      imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&h=200&fit=crop',
    },
  ],
  subtotal: 9000,
  tax: 900,
  taxRate: 10,
  total: 9900,
  currency: 'USD',
  notes: 'Thank you for your business! Please make payment within 30 days.',
  paymentTerms: 'Net 30 days. Payment is due within 30 days of invoice date.',
};

export default function InvoiceApp() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(defaultInvoiceData);
  const [template, setTemplate] = useState<InvoiceTemplate>('modern');
  const [pdfDataUri, setPdfDataUri] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    generatePDF();
  }, [invoiceData, template]);

  const generatePDF = () => {
    try {
      setError('');
      const generator = new PDFGenerator(invoiceData, template);
      const dataUri = generator.generate();
      setPdfDataUri(dataUri);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
      console.error('PDF generation error:', err);
    }
  };

  const handleJsonChange = (json: string) => {
    try {
      const parsed = JSON.parse(json);
      setInvoiceData(parsed);
      setError('');
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  const handleTemplateChange = (newTemplate: InvoiceTemplate) => {
    setTemplate(newTemplate);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Invoice PDF Generator
          </h1>
          <p className="text-slate-600">
            Create beautiful invoices from JSON data. Choose a template and print directly.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - Input */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Template Selection
              </h2>
              <TemplateSelector
                selectedTemplate={template}
                onTemplateChange={handleTemplateChange}
              />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Invoice Data (JSON)
              </h2>
              <JsonInput
                initialJson={JSON.stringify(invoiceData, null, 2)}
                onJsonChange={handleJsonChange}
              />
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right column - Preview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Invoice Preview
            </h2>
            {pdfDataUri ? (
              <PDFPreview pdfDataUri={pdfDataUri} />
            ) : (
              <div className="flex items-center justify-center h-96 bg-slate-50 rounded-lg">
                <p className="text-slate-500">Generating PDF...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

