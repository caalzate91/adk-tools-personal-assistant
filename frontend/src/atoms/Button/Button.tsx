import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, variant = 'primary', className, ...rest }: ButtonProps) {
  return (
    <button className={`button ${variant}${className ? ` ${className}` : ''}`} {...rest}>
      {label}
    </button>
  );
}
