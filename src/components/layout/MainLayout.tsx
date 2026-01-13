/**
 * MainLayout Component
 * ====================
 * Main layout wrapper with fixed sidebar and scrollable content area.
 */

import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar - Fixed, doesn't scroll with content */}
      <AppSidebar />
      
      {/* Main Content - Scrollable independently */}
      <main className="flex-1 lg:pl-0 pl-0 overflow-y-auto">
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}
