import React, { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      {/* Main content */}
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto pt-16">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;