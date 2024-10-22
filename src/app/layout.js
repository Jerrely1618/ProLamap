import localFont from "next/font/local";
import "./globals.css";

export const metadata = {
  title:"Re - Programming Dictionary for Fast Learning",
  description:
    "Master programming languages quickly with ProlaDict, the ultimate dictionary for Python concepts including algorithms, recursion, data structures, and more. Perfect for learners and developers seeking to solidify and reapply their knowledge.",
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
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
