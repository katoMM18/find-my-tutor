'use client';

import { ChevronDown } from 'lucide-react';

import { useT } from '@/shared/hooks/use-t';

// Plain answers to what parents ask before they message anyone. Also published as FAQ structured data for search.
export const HomeFaq = () => {
  const { t } = useT();
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.home.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <section aria-labelledby="faq-heading" className="px-4 pb-24 sm:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="faq-heading" className="font-heading text-3xl font-extrabold sm:text-4xl">{t.home.faqTitle}</h2>
          <p className="mt-2 text-muted-foreground">{t.home.faqLead}</p>
        </div>
        <div className="paper divide-y divide-rule rounded-xl lg:col-span-8">
          {t.home.faq.map((item) => (
            <details key={item.question} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold outline-none focus-visible:underline">
                {item.question}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </section>
  );
};
