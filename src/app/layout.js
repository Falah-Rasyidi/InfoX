import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "InfoX",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-blue-700 via-blue-800 to-gray-900 min-h-screen flex flex-col`}
      >
        {/* Header */}
        <header className="bg-gray-800 text-white flex-none">
          <nav className="container mx-auto flex justify-between items-center py-4 px-6">
            <div className="text-2xl font-bold">Info<sup>X</sup></div>
            <ul className="flex space-x-4">
              <li>
                <a href="#" className="hover:underline">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Services
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-4 flex-none">
          <div className="container mx-auto text-center">
            &copy; {new Date().getFullYear()} InfoX. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
