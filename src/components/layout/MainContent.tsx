import type { ReactNode } from "react";

type MainContentProps = {
  collapsed: boolean;
  children: ReactNode;
};

export function MainContent({ collapsed, children }: MainContentProps) {
  return (
    <main
      className={[
        "fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-[#f3f4f6] transition-all duration-300 md:top-20",
        collapsed ? "md:left-20" : "md:left-72",
      ].join(" ")}
    >
      <div className="min-h-full p-4 sm:p-5 md:p-8">{children}</div>
    </main>
  );
}
