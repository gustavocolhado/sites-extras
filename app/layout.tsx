import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Providers from '@/components/Providers'
import DynamicMetadata from '@/components/DynamicMetadata'
import { getServerDomainConfig, generateMetadata as generateDomainMetadata } from '@/lib/domain'

// Generate metadata based on current domain
export async function generateMetadata(): Promise<Metadata> {
  const domainConfig = getServerDomainConfig()
  return generateDomainMetadata(domainConfig)
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="search" type="application/opensearchdescription+xml" title="CORNOS BRASIL" href="/opensearch.xml" />
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "sqv8d1i4ip");
            `,
          }}
        />
      </head>
      <body>
        <Providers>
          <DynamicMetadata />
          {children}
        </Providers>
      </body>
    </html>
  )
} 