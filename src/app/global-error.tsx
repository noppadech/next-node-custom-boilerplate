'use client';

import BaseLayout from '@/components/BaseLayout';
import { routing } from '@/i18n/config';
import NextError from 'next/error';
import { useEffect } from 'react';

export default function GlobalError(props: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {

  }, [props.error]);

  return (
    <BaseLayout locale={routing.defaultLocale}>
      {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
      <NextError statusCode={0} />

    </BaseLayout>
  );
}
