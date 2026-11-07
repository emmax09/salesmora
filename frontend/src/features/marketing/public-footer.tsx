import Link from 'next/link';

const footerLinks = [
  { href: '/product', label: 'Product' },
  { href: '/features', label: 'Features' },
  { href: '/demo', label: 'Demo' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <Link className="font-semibold tracking-tight text-primary" href="/">
            Salesmora
          </Link>
          <p className="mt-2 max-w-md text-sm text-secondary">
            A connected workspace for customer conversations and sales work. In development.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-3">
          {footerLinks.map((link) => (
            <Link
              className="text-sm text-secondary underline-offset-4 hover:text-primary hover:underline"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
