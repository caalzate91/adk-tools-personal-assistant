import type { SVGAttributes } from 'react';
import './Icon.css';

interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Icon({ name, size = 'md', 'aria-label': ariaLabel, className, ...rest }: IconProps) {
  const isDecorative = !ariaLabel;

  return (
    <svg
      className={`icon icon--${size}${className ? ` ${className}` : ''}`}
      aria-hidden={isDecorative ? 'true' : undefined}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      <use href={`#icon-${name}`} />
    </svg>
  );
}
