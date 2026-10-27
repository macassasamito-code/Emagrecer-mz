import React from 'react';

interface MealIllustrationProps {
  variant: 'cassava_eggs' | 'fish_sweetpotato' | 'peanuts_fruit' | 'chicken_nhemba';
  className?: string;
}

export const MealIllustration: React.FC<MealIllustrationProps> = ({ variant, className = '' }) => {
  if (variant === 'cassava_eggs') {
    return (
      <div
        className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border border-slate-800/80 flex items-center justify-center p-4 ${className}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 160 110" className="w-full h-full max-h-28">
          <ellipse cx="80" cy="58" rx="64" ry="42" fill="#0F172A" stroke="#334155" strokeWidth="2" />
          <ellipse cx="80" cy="58" rx="52" ry="33" fill="#1E293B" />
          {/* Mandioca / Batata-doce medallions */}
          <circle cx="54" cy="48" r="13" fill="#F59E0B" fillOpacity="0.85" />
          <circle cx="48" cy="66" r="11" fill="#FBBF24" fillOpacity="0.9" />
          {/* Poached / Scrambled Eggs */}
          <ellipse cx="96" cy="46" rx="18" ry="13" fill="#F8FAFC" />
          <circle cx="96" cy="46" r="6.5" fill="#F59E0B" />
          <ellipse cx="104" cy="67" rx="16" ry="12" fill="#F8FAFC" />
          <circle cx="103" cy="67" r="5.5" fill="#F59E0B" />
          {/* Couve / Greens */}
          <path
            d="M64 72 C68 60, 82 62, 84 74 C76 80, 66 78, 64 72 Z"
            fill="#10B981"
          />
          <path
            d="M72 34 C78 26, 90 30, 86 40 C79 42, 73 39, 72 34 Z"
            fill="#34D399"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'fish_sweetpotato') {
    return (
      <div
        className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-950/70 via-slate-900 to-slate-950 border border-slate-800/80 flex items-center justify-center p-4 ${className}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 160 110" className="w-full h-full max-h-28">
          <ellipse cx="80" cy="56" rx="66" ry="43" fill="#0F172A" stroke="#334155" strokeWidth="2" />
          <ellipse cx="80" cy="56" rx="54" ry="34" fill="#1E293B" />
          {/* Grilled Fish Fillet */}
          <path
            d="M36 52 C54 34, 96 34, 118 52 C96 68, 54 68, 36 52 Z"
            fill="#CBD5E1"
          />
          <line x1="56" y1="43" x2="52" y2="60" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="72" y1="41" x2="68" y2="62" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="88" y1="43" x2="84" y2="60" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          {/* Lemon wedge & Matapa greens */}
          <circle cx="112" cy="38" r="9" fill="#FDE047" />
          <circle cx="62" cy="74" r="10" fill="#10B981" />
          <circle cx="78" cy="76" r="9" fill="#059669" />
          {/* Feijão Nhemba */}
          <ellipse cx="98" cy="73" rx="5" ry="3.5" fill="#B45309" />
          <ellipse cx="107" cy="75" rx="5" ry="3.5" fill="#92400E" />
        </svg>
      </div>
    );
  }

  if (variant === 'peanuts_fruit') {
    return (
      <div
        className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-slate-800/80 flex items-center justify-center p-4 ${className}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 160 110" className="w-full h-full max-h-28">
          <ellipse cx="80" cy="56" rx="62" ry="40" fill="#0F172A" stroke="#334155" strokeWidth="2" />
          {/* Papaya slice */}
          <path d="M42 64 C54 84, 98 84, 114 58 L78 44 Z" fill="#F97316" />
          <path d="M40 66 C53 88, 100 88, 116 60" stroke="#10B981" strokeWidth="4" fill="none" />
          {/* Roasted Peanuts (Amendoim) */}
          <ellipse cx="56" cy="42" rx="7" ry="4.5" fill="#D97706" />
          <ellipse cx="68" cy="38" rx="6.5" ry="4.5" fill="#B45309" />
          <ellipse cx="62" cy="50" rx="7" ry="4.5" fill="#F59E0B" />
          {/* Boiled Egg */}
          <circle cx="102" cy="40" r="12" fill="#F8FAFC" />
          <circle cx="102" cy="40" r="6" fill="#FBBF24" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 border border-slate-800/80 flex items-center justify-center p-4 ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 160 110" className="w-full h-full max-h-28">
        <ellipse cx="80" cy="56" rx="64" ry="42" fill="#0F172A" stroke="#334155" strokeWidth="2" />
        <ellipse cx="80" cy="56" rx="52" ry="33" fill="#1E293B" />
        {/* Grilled Zambeziano Chicken */}
        <path
          d="M44 50 C48 34, 82 32, 92 48 C96 62, 68 70, 48 62 Z"
          fill="#F59E0B"
        />
        <line x1="56" y1="42" x2="66" y2="58" stroke="#78350F" strokeWidth="2" />
        <line x1="68" y1="40" x2="78" y2="56" stroke="#78350F" strokeWidth="2" />
        {/* Pumpkin leaves / Folhas de abóbora */}
        <circle cx="104" cy="48" r="12" fill="#10B981" />
        <circle cx="96" cy="64" r="11" fill="#059669" />
        <circle cx="110" cy="62" r="10" fill="#34D399" />
      </svg>
    </div>
  );
};

export const CoachAvatarIllustration: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <div
    className={`relative rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shrink-0 ${className}`}
    aria-hidden="true"
  >
    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <rect width="64" height="64" fill="#0F172A" />
        <circle cx="32" cy="24" r="12" fill="#B45309" />
        {/* Braided hair silhouette */}
        <path d="M18 24 C18 12, 46 12, 46 24 C46 18, 38 14, 32 14 C26 14, 18 18, 18 24 Z" fill="#020617" />
        {/* Athletic Emerald Top */}
        <path d="M14 58 C14 42, 50 42, 50 58 Z" fill="#10B981" />
        {/* Smile */}
        <path d="M28 26 Q32 30 36 26" stroke="#FDE68A" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  </div>
);
