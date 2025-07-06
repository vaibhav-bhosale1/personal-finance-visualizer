// app/(dashboard)/layout.tsx
import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto py-8">
      {/* You can add a common header/sidebar for the dashboard here if needed */}
      {children}
    </div>
  );
}