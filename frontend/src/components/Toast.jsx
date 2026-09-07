import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 ${
      isSuccess 
        ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200' 
        : 'bg-red-950/90 border-red-500/30 text-red-200'
    }`}>
      {isSuccess ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
      <span className="text-xs font-medium">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-md transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
