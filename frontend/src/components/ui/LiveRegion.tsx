import React from 'react';
import type { ReactNode } from 'react';

interface LiveRegionProps {
  /** 'polite' = wait for current speech to finish (dashboard updates)
   *  'assertive' = interrupt immediately (errors, form validation) */
  readonly politeness: 'polite' | 'assertive';
  readonly atomic?: boolean;
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Accessible live region component.
 * Wraps dynamic content that updates without navigation (charts, chat, insights).
 * Screen readers will announce content changes automatically.
 *
 * @example
 * <LiveRegion politeness="polite">
 *   <FootprintSummaryCard kg={dailyKg} />
 * </LiveRegion>
 */
export function LiveRegion({ politeness, atomic = true, children, className }: LiveRegionProps): React.ReactElement {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className={className}
    >
      {children}
    </div>
  );
}
