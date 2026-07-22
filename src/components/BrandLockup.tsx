import type { ReactNode } from 'react';

interface BrandLockupProps {
  className?: string;
  markClassName?: string;
  signatureClassName?: string;
  suffix?: ReactNode;
}

export default function BrandLockup({
  className = '',
  markClassName = '',
  signatureClassName = '',
  suffix,
}: BrandLockupProps) {
  return (
    <span className={`inline-flex min-w-0 flex-col items-start gap-0.5 sm:flex-row sm:items-baseline sm:gap-2 md:gap-3 ${className}`}>
      <span className={`font-display font-bold leading-none tracking-tighter ${markClassName}`}>
        CAPTUR.
      </span>
      <span className={`font-signature font-normal leading-none tracking-normal whitespace-nowrap ${signatureClassName}`}>
        by Laurentiu Pirpiliu
      </span>
      {suffix}
    </span>
  );
}
