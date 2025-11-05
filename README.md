# Invoice PDF Generator

A beautiful React application that generates professional invoices from JSON data. Built with React, TypeScript, jsPDF, and Tailwind CSS.

## Features

- 🎨 **Two Beautiful Templates**: Choose between Modern and Classic invoice designs
- 📄 **PDF Generation**: Generate PDFs entirely using jsPDF (no server required)
- 🖨️ **Direct Printing**: Print PDFs without opening additional windows using iframe approach
- 📝 **JSON Input**: Paste your invoice data as JSON and see real-time preview
- 💾 **Download Support**: Download generated invoices as PDF files
- 🚀 **Vercel Ready**: Optimized for deployment on Vercel

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Invoice Data Format

The app expects JSON data in the following format:

```json
{
  "invoiceNumber": "INV-2024-001",
  "issueDate": "2024-01-15",
  "dueDate": "2024-02-15",
  "from": {
    "name": "Your Company Name",
    "address": "123 Business Street",
    "city": "New York",
    "zip": "10001",
    "country": "USA",
    "email": "contact@yourcompany.com",
    "phone": "+1 (555) 123-4567",
    "taxId": "TAX-123456"
  },
  "to": {
    "name": "Client Company Name",
    "address": "456 Client Avenue",
    "city": "Los Angeles",
    "zip": "90001",
    "country": "USA",
    "email": "billing@clientcompany.com",
    "phone": "+1 (555) 987-6543"
  },
  "items": [
    {
      "description": "Web Development Services",
      "quantity": 40,
      "unitPrice": 150.0
    }
  ],
  "subtotal": 6000,
  "tax": 600,
  "taxRate": 10,
  "total": 6600,
  "currency": "USD",
  "notes": "Thank you for your business!",
  "paymentTerms": "Net 30 days"
}
```

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Vercel will automatically detect the Vite configuration
4. Deploy!

The `vercel.json` file is already configured for optimal deployment.

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **jsPDF** - PDF generation
- **Tailwind CSS** - Styling
- **Vercel** - Hosting platform

## License

MIT

