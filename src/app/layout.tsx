import type { Metadata } from "next";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { Plus_Jakarta_Sans, Syne } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const syne = Syne({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: "KIIT Mini Project Management System",
  description: "A premium project management hub for KIITians.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${syne.variable}`}>
      <body>
        <nav className="navbar glass">
          <div className="container navbar-content">
            <Link href="/" className="brand" style={{ gap: '1.5rem' }}>
              <div style={{ position: 'relative', height: '42px', width: '160px' }}>
                <Image 
                  src="/KIIT-Logo.webp" 
                  alt="KIIT Logo" 
                  fill
                  style={{ objectFit: 'contain', objectPosition: 'left' }}
                  priority
                  quality={100}
                />
              </div>
              <div className="brand-divider" style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
              <span className="brand-name" style={{ fontSize: '1rem', letterSpacing: '0.05em', color: 'var(--muted-fg)' }}>PORTAL</span>
            </Link>
            <div className="nav-actions">
              <span className="system-tag">KIIT MINI PROJECT MANAGEMENT</span>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
