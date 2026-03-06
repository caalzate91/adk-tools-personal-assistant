import type { ReactNode } from 'react';
import './LoginTemplate.css';

interface LoginTemplateProps {
  children: ReactNode;
}

export function LoginTemplate({ children }: LoginTemplateProps) {
  return (
    <div className="login-template">
      <div className="login-template__card">
        {children}
      </div>
    </div>
  );
}
