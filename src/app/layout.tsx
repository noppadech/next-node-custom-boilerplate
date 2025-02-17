import type { ReactNode } from 'react';
import clsx from 'clsx';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

type Props = {
  children: ReactNode;
};

export default async function LocaleLayout({ children }: Props) {
  const locale = await getLocale();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <title>next-intl example</title>
      </head>
      <body
        className={clsx(
          'flex min-h-[100vh] flex-col bg-slate-100',
          inter.className,
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <div id="root">{children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
