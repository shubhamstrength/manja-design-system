import type { ReactNode } from 'react';

export function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="pg-section">
      <h2 className="pg-section-title">{title}</h2>
      {note ? <p className="pg-section-note">{note}</p> : null}
      {children}
    </section>
  );
}
