import './global.css';
import '../styles/globals.css';
import '../lib/tailwind-setup';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from './context/auth-context';
import Navbar from './components/navbar';

export const metadata = {
  title: 'A1C Project - Estimate Your A1C Levels',
  description: 'Track glucose readings and estimate A1C levels with our easy-to-use tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      </head>
      <body className="h-full">
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-500 hover:bg-blue-600 text-white',
              footerActionLink: 'text-blue-500 hover:text-blue-600',
            },
          }}
        >
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow bg-gray-50">
                {children}
              </main>
              <footer className="bg-gray-800 text-white py-6">
                <div className="container mx-auto px-4">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                      <p className="text-sm">&copy; {new Date().getFullYear()} A1C Estimator. All rights reserved.</p>
                    </div>
                    <div className="flex space-x-4">
                      <a href="/instructions" className="text-sm hover:text-blue-300">Instructions</a>
                      <a href="/contact" className="text-sm hover:text-blue-300">Contact</a>
                      <a href="/privacy" className="text-sm hover:text-blue-300">Privacy Policy</a>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </AuthProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
