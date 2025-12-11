import './globals.css';
import type { Metadata } from 'next';
import { Arimo } from 'next/font/google';
import Image from 'next/image';

const arimo = Arimo({
  variable: '--font-arimo',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
};

export default function GlobalNotFound() {
    return (
        <html lang="en">
            <body className={`${arimo.className} antialiased`}>
                <h1>Page Not Found</h1>
            </body>
        </html>
    )
}