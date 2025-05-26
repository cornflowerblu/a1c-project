import './global.css';
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
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
