import type { HTMLAttributes, PropsWithChildren } from 'react';
import './ui.css';

export const Card = ({ children, className = '', ...props }: PropsWithChildren<HTMLAttributes<HTMLElement>>) => (
  <section className={`cb-card ${className}`.trim()} {...props}>{children}</section>
);
