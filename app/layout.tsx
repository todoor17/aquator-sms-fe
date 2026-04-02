import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import StoreProvider from "@/store/StoreProvider";

export const metadata: Metadata = {
  title: "Aquator SMS Reminder Agent",
  description: "Gestioneaza clientii si programarile SMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" data-theme="dark">
      <body suppressHydrationWarning>
        <StoreProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
