import { InvoiceTemplate } from '../types/invoice';

interface TemplateSelectorProps {
  selectedTemplate: InvoiceTemplate;
  onTemplateChange: (template: InvoiceTemplate) => void;
}

export default function TemplateSelector({
  selectedTemplate,
  onTemplateChange,
}: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => onTemplateChange('modern')}
        className={`p-4 rounded-lg border-2 transition-all ${
          selectedTemplate === 'modern'
            ? 'border-indigo-500 bg-indigo-50 shadow-md'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}
      >
        <div className="text-center">
          <div
            className={`w-12 h-12 mx-auto mb-2 rounded ${
              selectedTemplate === 'modern'
                ? 'bg-indigo-500'
                : 'bg-slate-300'
            }`}
          />
          <h3 className="font-semibold text-slate-900 mb-1">Modern</h3>
          <p className="text-xs text-slate-600">
            Clean, colorful design with gradient header
          </p>
        </div>
      </button>

      <button
        onClick={() => onTemplateChange('classic')}
        className={`p-4 rounded-lg border-2 transition-all ${
          selectedTemplate === 'classic'
            ? 'border-indigo-500 bg-indigo-50 shadow-md'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}
      >
        <div className="text-center">
          <div
            className={`w-12 h-12 mx-auto mb-2 rounded border-2 ${
              selectedTemplate === 'classic'
                ? 'border-indigo-500 bg-white'
                : 'border-slate-300 bg-white'
            }`}
          />
          <h3 className="font-semibold text-slate-900 mb-1">Classic</h3>
          <p className="text-xs text-slate-600">
            Traditional layout with borders and boxes
          </p>
        </div>
      </button>
    </div>
  );
}

