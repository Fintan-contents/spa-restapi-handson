import type {Metadata} from 'next';
import './globals.css';
import {UserContextProvider} from '../contexts/UserContext';
import {NavigationHeader} from '../components/navigation-header/NavigationHeader';
import AppInitializer from '../initializer/AppInitializer';

export const metadata: Metadata = {
  title: 'ToDo App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>
        <AppInitializer>
          <UserContextProvider>
            <NavigationHeader />
            {children}
          </UserContextProvider>
        </AppInitializer>
      </body>
    </html>
  );
}
