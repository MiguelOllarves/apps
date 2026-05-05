'use client';

import React from 'react';
import { NumericFormat, NumericFormatProps } from 'react-number-format';

interface Props extends Omit<NumericFormatProps, 'onChange'> {
  label?: string;
  onValueChange?: (values: any) => void;
  className?: string;
}

export const NumericInput = ({ label, onValueChange, className, ...props }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">{label}</label>}
      <NumericFormat
        {...props}
        onValueChange={onValueChange}
        className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300 ${className}`}
      />
    </div>
  );
};
