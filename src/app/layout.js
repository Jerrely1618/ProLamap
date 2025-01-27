import './globals.css';
import { Gamja_Flower, Montserrat, Manrope, Old_Standard_TT } from "next/font/google";
import { SpeedInsights } from '@vercel/speed-insights/next';
import AdSense from './ads/AdSense';
import { ThemeProvider } from 'next-themes';
import { ExpandedProvider } from './providers/ExpansionProvider';
 
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

const oldstdTT = Old_Standard_TT({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal'],
  display: 'swap',
  variable: '--font-oldstdTT',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata = {
  title: "qReReRe - Programming Dictionary for Fast Learning",
  description: "Master programming languages quickly with qReReRe, the ultimate dictionary for Python concepts including algorithms, recursion, data structures, and more. Perfect for learners and developers seeking to solidify and reapply their knowledge.",
  keywords: "qReReRe, Python, programming, algorithms, recursion, data structures, learning, coding",
  author: "qReReRe Team",
  robots: "index, follow",
  "og:title": "qReReRe - Remember Programming Languages",
  "og:description": "A comprehensive dictionary to remember, learn and apply programming concepts easily.",
  "og:type": "website",
  applicationName: "qReReRe",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { rel: "icon", type: "image/png", sizes: "48x48", url: "/favicon-48x48.png" },
      { rel: "icon", type: "image/svg+xml", url: "/favicon.svg" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
};


export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({ children }) {
  return (

    <html lang="en" className={`${montserrat.className} ${oldstdTT.className} ${gamjaFlower.className} ${manrope.className}`}>

      <head>
        <AdSense/>
      </head>
      <body className={`antialiased`} suppressHydrationWarning >   
        <ExpandedProvider>   
          <ThemeProvider attribute="class">
            {children}
          </ThemeProvider>
        </ExpandedProvider>
        <SpeedInsights/>
      </body>
    </html>
  );
}
