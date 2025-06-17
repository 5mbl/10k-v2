import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Manrope } from 'next/font/google';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Configure the Manrope font
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Modular Semantic Search",
  description: "Bachelor Thesis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.className} antialiased`}
      >
{/*         <Header />
 */}        {children}
        <Footer />
      </body>
    </html>
  );
}
