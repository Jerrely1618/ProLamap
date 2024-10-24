import Head from 'next/head';
import './globals.css';
import { Gamja_Flower, Montserrat, Manrope } from "next/font/google";
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

const gamjaFlower = Gamja_Flower({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-gamja-flower',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata = {
  title: "Re - Programming Dictionary for Fast Learning",
  description: "Master programming languages quickly with Re, the ultimate dictionary for Python concepts including algorithms, recursion, data structures, and more. Perfect for learners and developers seeking to solidify and reapply their knowledge.",
  keywords: "Re, Python, programming, algorithms, recursion, data structures, learning, coding",
  author: "Re Team",
  robots: "index, follow",
  "og:title": "Re - Remember Programming Languages",
  "og:description": "A comprehensive dictionary to remember, learn and apply programming concepts easily.",
  "og:type": "website",
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.className} ${gamjaFlower.className} ${manrope.className}`}>
      <Head>
      <link rel="icon" type="image/png" href="/favicon-48x48.png" sizes="48x48" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-title" content="Re" />
<link rel="manifest" href="/site.webmanifest" />
</Head>
      <body className={`antialiased`}>
        {children}
      </body>
    </html>
  );
}
