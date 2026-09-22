import { useEffect, useState } from 'react';
import { handleNumericKeyDown, handleNumericPaste } from '@/shared/utils/numericInput';

const COUNTRY_CODES = [
  { code: '+506', label: 'CR +506' },
  { code: '+57', label: 'CO +57' },
  { code: '+1', label: 'US +1' },
];

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
};

export function PhoneInput({ label, value, onChange, maxLength = 30 }: Props) {
  const [countryCode, setCountryCode] = useState('');
  const [number, setNumber] = useState('');

  useEffect(() => {
    const matched = COUNTRY_CODES.find((c) => value.startsWith(c.code));
    if (matched) {
      setCountryCode(matched.code);
      setNumber(value.slice(matched.code.length));
    } else {
      setCountryCode('');
      setNumber(value);
    }
  }, [value]);

  function emit(code: string, num: string) {
    onChange((code + num).slice(0, maxLength));
  }

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <div className="flex gap-2">
        <select
          value={countryCode}
          onChange={(e) => { setCountryCode(e.target.value); emit(e.target.value, number); }}
          className="w-28 shrink-0 rounded-lg border border-slate-300 bg-white px-2 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
        >
          <option value="">Código</option>
          {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
        </select>
        <input
          type="text"
          inputMode="numeric"
          value={number}
          onChange={(e) => { const digits = e.target.value.replace(/\D/g, ''); setNumber(digits); emit(countryCode, digits); }}
          onKeyDown={handleNumericKeyDown}
          onPaste={handleNumericPaste}
          maxLength={Math.max(maxLength - countryCode.length, 0)}
          placeholder="88887777"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
        />
      </div>
    </div>
  );
}