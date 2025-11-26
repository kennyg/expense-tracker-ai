import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ExpenseProvider } from "@/context/ExpenseContext";
import Navigation from "@/components/Navigation";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExpenseTracker - Personal Finance Management",
  description: "Track your expenses and manage your personal finances with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <ExpenseProvider>
          <Navigation />
          <main className="lg:ml-64 pt-14 pb-20 lg:pt-0 lg:pb-0 min-h-screen">
            <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
              {children}
            </div>
          </main>
        </ExpenseProvider>
      </body>
    </html>
  );
}
