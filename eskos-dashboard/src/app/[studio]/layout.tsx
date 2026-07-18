import React from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function StudioLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ studio: string }>;
}) {
  const { studio } = await params;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {/* Global Header */}
      <Header currentStudio={studio} />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar currentStudio={studio} />

        {/* Workspace content area */}
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>

      {/* Status Footer */}
      <Footer />
    </div>
  );
}
