import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "Truck Management System",
  description: "Fleet management platform for transportation companies",
};

// Force all pages to be dynamically rendered
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
