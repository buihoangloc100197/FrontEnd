import { useState, type ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { MainContent } from "@/components/layout/MainContent";
import { Sidebar } from "@/components/layout/Sidebar";

type MainLayoutProps = {
  title?: string;
  children: ReactNode;
};

export function MainLayout({ title = "Trang chủ", children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-[#f5f1e8] text-[#111827]">
      <Header
        title={title}
        collapsed={collapsed}
        onToggleSidebar={() => setCollapsed((current) => !current)}
      />
      <Sidebar collapsed={collapsed} />
      <MainContent collapsed={collapsed}>{children}</MainContent>
    </div>
  );
}
