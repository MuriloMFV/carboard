import type { PropsWithChildren, ReactNode } from 'react';

interface RecordFormSectionProps extends PropsWithChildren {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const RecordFormSection = ({ title, description, action, className = '', children }: RecordFormSectionProps) => (
  <section className={`cb-record-section ${className}`.trim()}>
    {(title || action) && (
      <header className="cb-record-section__header">
        <div>
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </div>
        {action}
      </header>
    )}
    <div className="cb-record-section__body">{children}</div>
  </section>
);
