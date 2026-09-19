import Analytics from "@/components/analytics";
import AnnouncementBar from "@/components/announcement-bar";
import Cursor from "@/components/cursor";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Preloader from "@/components/preloader";
import Providers from "@/components/providers";
import WhatsAppFloat from "@/components/whatsapp-float";
import { getSetting } from "@/lib/settings";
import type { Metadata, Viewport } from "next";
import { Archivo, Space_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-spacemono",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSetting<{
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    ogImage: string;
  }>("seo");
  const general = await getSetting<{ brandName: string; brandSuffix: string }>(
    "general"
  );
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: seo.metaTitle,
      template: `%s · ${general.brandName}${general.brandSuffix}`,
    },
    description: seo.metaDescription,
    keywords: seo.keywords.split(",").map((k) => k.trim()),
    openGraph: {
      type: "website",
      siteName: `${general.brandName}${general.brandSuffix}`,
      title: seo.metaTitle,
      description: seo.metaDescription,
      url: SITE_URL,
      images: [{ url: seo.ogImage, width: 1200, height: 1500 }],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.metaTitle,
      description: seo.metaDescription,
      images: [seo.ogImage],
    },
    robots: { index: true, follow: true },
    alternates: { canonical: "/" },
    icons: { icon: "/icon.svg" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const general = await getSetting<{
    brandName: string;
    brandSuffix: string;
    currency: string;
    freeShipOver: string;
    flatShipping: string;
    phone: string;
  }>("general");
  const integrations = await getSetting<{
    metaPixelId: string;
    tiktokPixelId: string;
    gaId: string;
  }>("integrations");

  return (
    <html lang="en" className={`${archivo.variable} ${spaceMono.variable}`}>
      <body
        className="grain bg-paper text-ink antialiased"
        data-currency={general.currency}
      >
        <Providers>
          <Analytics
            metaId={integrations.metaPixelId || undefined}
            tiktokId={integrations.tiktokPixelId || undefined}
            gaId={integrations.gaId || undefined}
          />
          <Preloader brandName={general.brandName} />
          <Cursor />
          <AnnouncementBar />
          <Header
            brandName={general.brandName}
            brandSuffix={general.brandSuffix}
            freeShipOver={parseFloat(general.freeShipOver || "250") * 100}
            flatShipping={parseFloat(general.flatShipping || "12") * 100}
            currency={general.currency}
          />
          {children}
          <Footer />
          <WhatsAppFloat phone={general.phone} />
        </Providers>
      </body>
    </html>
  );
}
