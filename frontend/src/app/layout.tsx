import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XAUUSD Intelligence Terminal | Institutional Decision Support",
  description: "Discretionary trading decision-support terminal for XAUUSD gold scalping, intraday, and swing trading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080b11] text-gray-100 min-h-screen antialiased selection:bg-gold/30 selection:text-gold">
        {children}
      </body>
    </html>
  );
}
