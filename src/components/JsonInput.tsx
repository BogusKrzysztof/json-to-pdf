import { useState, useEffect } from 'react';

interface JsonInputProps {
  initialJson: string;
  onJsonChange: (json: string) => void;
}

export default function JsonInput({ initialJson, onJsonChange }: JsonInputProps) {
  const [json, setJson] = useState(initialJson);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setJson(initialJson);
  }, [initialJson]);

  const handleChange = (value: string) => {
    setJson(value);
    try {
      JSON.parse(value);
      setIsValid(true);
      onJsonChange(value);
    } catch {
      setIsValid(false);
    }
  };

  return (
    <div>
      <textarea
        value={json}
        onChange={(e) => handleChange(e.target.value)}
        className={`w-full h-96 p-4 font-mono text-sm rounded-lg border-2 ${
          isValid
            ? 'border-slate-200 focus:border-indigo-500'
            : 'border-red-300 focus:border-red-500'
        } focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none`}
        placeholder="Paste your JSON invoice data here..."
        spellCheck={false}
      />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {isValid ? '✓ Valid JSON' : '✗ Invalid JSON'}
        </p>
        <button
          onClick={() => {
            try {
              const formatted = JSON.stringify(JSON.parse(json), null, 2);
              setJson(formatted);
              handleChange(formatted);
            } catch {
              // Ignore formatting errors
            }
          }}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Format JSON
        </button>
      </div>
    </div>
  );
}

