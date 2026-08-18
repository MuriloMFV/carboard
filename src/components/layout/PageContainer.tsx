import type { PropsWithChildren } from 'react';

interface PageContainerProps extends PropsWithChildren {
  className?: string;
}

export const PageContainer = ({ children, className = '' }: PageContainerProps) => (
  <main className={`cb-page-container ${className}`.trim()}>{children}</main>
);
