import React, { useId } from 'react';

/**
 * Logo do Vivavós: a vovó (de óculos e coque) e o vovô (de bigode), lado a lado.
 * As cores vêm de variáveis CSS para acompanhar o tema escolhido (alto contraste, escuro...).
 * Mesmo desenho de public/favicon.svg.
 */
export function Logo({ className = 'w-11 h-11' }) {
  const clipId = useId();
  const v = (name) => `var(--c-logo-${name})`;

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clipId}>
          <rect width="64" height="64" rx="14" />
        </clipPath>
      </defs>
      <rect width="64" height="64" rx="14" fill={v('bg')} />
      <g clipPath={`url(#${clipId})`}>
        {/* Vovó */}
        <g transform="translate(-2.5 0)">
          <circle cx="23" cy="14.5" r="6" fill={v('hair')} />
          <circle cx="23" cy="32" r="14.5" fill={v('hair')} />
          <ellipse cx="23" cy="64" rx="16" ry="13" fill={v('grandma')} />
          <circle cx="23" cy="36" r="11" fill={v('skin')} />
          <path
            d="M12.3 35C12.6 26 18.5 22.4 23 22.4S33.4 26 33.7 35C30.5 30 26.5 28 23 28.6 19.5 28 15.5 30 12.3 35Z"
            fill={v('hair')}
          />
          <circle cx="16.4" cy="41.6" r="1.9" fill="#EE9A8A" />
          <circle cx="29.6" cy="41.6" r="1.9" fill="#EE9A8A" />
          <g fill="none" stroke={v('line')} strokeWidth="1.6" strokeLinecap="round">
            <circle cx="19" cy="37" r="3.4" />
            <circle cx="27" cy="37" r="3.4" />
            <path d="M22.4 37h1.2M19.6 42.4q3.4 2.8 6.8 0" />
          </g>
          <circle cx="19" cy="37.3" r="1" fill={v('line')} />
          <circle cx="27" cy="37.3" r="1" fill={v('line')} />
        </g>

        {/* Vovô */}
        <g transform="translate(1.5 0)">
          <ellipse cx="43" cy="67" rx="17.5" ry="13.5" fill={v('grandpa')} stroke={v('bg')} strokeWidth="2" />
          <path d="M38 54.5l5 5 5-5" fill="none" stroke={v('bg')} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="30.6" cy="40.5" r="2.8" fill={v('skin')} stroke={v('bg')} strokeWidth="1.5" />
          <circle cx="55.4" cy="40.5" r="2.8" fill={v('skin')} />
          <circle cx="43" cy="39.5" r="12.2" fill={v('skin')} stroke={v('bg')} strokeWidth="2" />
          <ellipse cx="33" cy="35" rx="2.8" ry="4.4" fill={v('hair')} transform="rotate(-18 33 35)" />
          <ellipse cx="53" cy="35" rx="2.8" ry="4.4" fill={v('hair')} transform="rotate(18 53 35)" />
          <path d="M40.6 28.2q2.4-3 4.8 0" fill="none" stroke={v('hair')} strokeWidth="1.8" strokeLinecap="round" />
          <g fill="none" stroke={v('line')} strokeWidth="1.6" strokeLinecap="round">
            <path d="M36.6 38.8q1.8-1.9 3.6 0M45.8 38.8q1.8-1.9 3.6 0" />
            <path d="M40.4 48.6q2.6 1.6 5.2 0" />
          </g>
          <ellipse cx="43" cy="42.2" rx="1.9" ry="1.5" fill="#E9A984" />
          <path
            d="M36.6 46C38.6 43.4 41.6 43.8 43 45 44.4 43.8 47.4 43.4 49.4 46 46.8 47.6 44.6 47 43 46.2 41.4 47 39.2 47.6 36.6 46Z"
            fill={v('hair')}
            stroke={v('line')}
            strokeWidth="0.7"
            strokeLinejoin="round"
          />
        </g>
      </g>
      <rect x="1" y="1" width="62" height="62" rx="13" fill="none" stroke={v('ring')} strokeWidth="2" />
    </svg>
  );
}
