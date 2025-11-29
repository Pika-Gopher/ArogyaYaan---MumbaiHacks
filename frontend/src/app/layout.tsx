import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { I18nProvider } from "../context/I18nContext";

export const metadata: Metadata = {
  title: "ArogyaYaan DHO Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}