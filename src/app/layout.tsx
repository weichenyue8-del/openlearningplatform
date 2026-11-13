import type { Metadata } from "next";

import "katex/dist/katex.min.css";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { siteConfig } from "@/lib/site";
import { getSiteUrl } from "@/lib/supabase/config";

import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  ...(siteUrl
    ? {
        metadataBase: new URL(siteUrl),
      }
    : {}),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|; )openap-theme=([^;]+)/);var p=m?decodeURIComponent(m[1]):'system';var q=window.matchMedia('(prefers-color-scheme: dark)');var a=function(){var d=p==='dark'||(p==='system'&&q.matches);document.documentElement.dataset.theme=d?'dark':'light';};a();q.addEventListener&&q.addEventListener('change',function(){if(p==='system')a();});}catch(e){document.documentElement.dataset.theme='light';}})();`,
          }}
        />
      </head>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
