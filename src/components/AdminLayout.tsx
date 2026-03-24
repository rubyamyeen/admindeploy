"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const navGroups = [
  {
    label: null,
    items: [
      { href: "/", label: "Dashboard" },
      { href: "/profiles", label: "Users" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/images", label: "Images" },
      { href: "/captions", label: "Captions" },
      { href: "/caption-requests", label: "Caption Requests" },
      { href: "/caption-examples", label: "Caption Examples" },
      { href: "/terms", label: "Terms" },
    ],
  },
  {
    label: "Humor",
    items: [
      { href: "/humor-flavors", label: "Flavors" },
      { href: "/humor-flavor-steps", label: "Flavor Steps" },
      { href: "/humor-mix", label: "Humor Mix" },
    ],
  },
  {
    label: "AI / LLM",
    items: [
      { href: "/llm-models", label: "Models" },
      { href: "/llm-providers", label: "Providers" },
      { href: "/llm-prompt-chains", label: "Prompt Chains" },
      { href: "/llm-responses", label: "Responses" },
    ],
  },
  {
    label: "Access Control",
    items: [
      { href: "/allowed-domains", label: "Signup Domains" },
      { href: "/whitelisted-emails", label: "Email Whitelist" },
    ],
  },
];

export default function AdminLayout({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Suppress unused variable warning
  void userEmail;

  return (
    <div className="min-h-screen bg-[#0f1623]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-52 bg-[#0f1623] border-r border-slate-800/50 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-4">
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            {navGroups.map((group, groupIndex) => (
              <div key={group.label || `group-${groupIndex}`} className="mb-1">
                {group.label && (
                  <div className="px-4 py-2 mt-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {group.label}
                  </div>
                )}
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                        isActive
                          ? "text-white bg-slate-800/50"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Sign out */}
          <div className="p-4 border-t border-slate-800/50">
            <button
              onClick={handleLogout}
              className="w-full text-left text-sm text-slate-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#0f1623] border-b border-slate-800/50">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-medium text-white">Admin</span>
          <div className="w-10" />
        </div>
      </div>

      {/* Main content */}
      <main className="lg:pl-52 min-h-screen">
        <div className="p-6 lg:p-8 pt-[4.5rem] lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
