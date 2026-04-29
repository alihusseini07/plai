import React from 'react';
import logoUrl from '../../../assets/plai-logo.svg';

export default function BrandWordmark({ logoClassName = 'h-6 w-auto' }) {
  return (
    <span className="flex items-center justify-center text-white">
      <img src={logoUrl} alt="" aria-hidden="true" className={logoClassName} />
    </span>
  );
}
