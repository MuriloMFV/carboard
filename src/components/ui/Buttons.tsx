import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react';
import './ui.css';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export const PrimaryButton = ({ children, className = '', ...props }: ButtonProps) => (
  <button className={`cb-button cb-button--primary ${className}`.trim()} type="button" {...props}>{children}</button>
);

export const SecondaryButton = ({ children, className = '', ...props }: ButtonProps) => (
  <button className={`cb-button cb-button--secondary ${className}`.trim()} type="button" {...props}>{children}</button>
);

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
}

export const IconButton = ({ label, icon, className = '', ...props }: IconButtonProps) => (
  <button className={`cb-icon-button ${className}`.trim()} type="button" aria-label={label} {...props}>{icon}</button>
);
