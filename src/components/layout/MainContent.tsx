import type { ReactNode } from "react";

type MainContentProps = {
  collapsed: boolean;
  children: ReactNode;
};

export function MainContent({ collapsed, children }: MainContentProps) {
  return (
    <main
      className={[
        "fixed right-0 top-20 bottom-0 overflow-y-auto bg-[#f5f1e8] transition-all duration-300",
        collapsed ? "left-20" : "left-72",
      ].join(" ")}
    >
      <div className="min-h-full p-5 md:p-8">{children}</div>
    </main>
  );
}
