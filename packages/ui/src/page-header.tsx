export interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
}

export function PageHeader({ title, description, eyebrow }: PageHeaderProps) {
  return (
    <header className="max-w-3xl">
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{description}</p>
      ) : null}
    </header>
  );
}
