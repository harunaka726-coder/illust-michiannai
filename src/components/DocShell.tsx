import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export function DocShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#FFF8F1] text-[#4A4038]">
      <SiteHeader showStudioCta />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h1>
        <div className="space-y-5 text-sm leading-relaxed text-[#5C534A]">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
