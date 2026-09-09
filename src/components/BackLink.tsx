import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackLinkProps {
  /** Fallback path when browser history has nothing useful to go back to. */
  fallbackTo?: string;
  label?: string;
  className?: string;
}

/**
 * Prefer history back; otherwise navigate to fallbackTo (default /).
 */
export function BackLink({
  fallbackTo = '/',
  label = 'Geri dön',
  className = '',
}: BackLinkProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(fallbackTo);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold transition ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
