import './global.css';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from './context/auth-context';
import Navbar from './components/navbar';

export const metadata = {
  title: 'A1C Project',
  description: 'A monorepo with NestJS API and NextJS web',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-500 hover:bg-blue-600 text-white',
              footerActionLink: 'text-blue-500 hover:text-blue-600',
            },
          }}
        >
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
          </AuthProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
