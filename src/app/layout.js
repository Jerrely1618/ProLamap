import './globals.css';
import { Modak, Gamja_Flower, Montserrat, Manrope } from "next/font/google";
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
});

const gamjaFlower = Gamja_Flower({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata = {
  title: "Re - Programming Dictionary for Fast Learning",
  description: "Master programming languages quickly with ProlaDict, the ultimate dictionary for Python concepts including algorithms, recursion, data structures, and more. Perfect for learners and developers seeking to solidify and reapply their knowledge.",
  keywords: "ProlaDict, Python, programming, algorithms, recursion, data structures, learning, coding",
  author: "ProlaDict Team",
  robots: "index, follow",
  "og:title": "ProlaDict - Remember Programming Languages",
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
      <body className={`antialiased`}>
        {children}
      </body>
    </html>
  );
}
