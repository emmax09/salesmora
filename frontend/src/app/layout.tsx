import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { ThemeProvider } from '../features/theme/theme-provider';

const themeScript = `(()=>{try{const p=localStorage.getItem('salesmora-theme')||'system';const d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=p==='system'?(d?'dark':'light'):p}catch{document.documentElement.dataset.theme='light'}})()`;

export const metadata: Metadata = {
  title: 'Salesmora',
  description: 'A foundation for connected sales and business workflows.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a
          className="sr-only rounded-control bg-surface px-4 py-2 text-sm font-medium text-primary focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:outline-2 focus:outline-focus"
          href="#main-content"
        >
          Skip to main content
        </a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
