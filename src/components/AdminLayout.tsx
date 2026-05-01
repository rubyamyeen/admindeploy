"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const navGroups = [
  {
    label: "Overview",
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
      { href: "/caption-ratings", label: "Caption Ratings" },
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

function getInitials(email: string): string {
  const parts = email.split("@")[0];
  if (parts.length >= 2) {
    return parts.substring(0, 2).toUpperCase();
  }
  return parts.toUpperCase();
}

function getDisplayName(email: string): string {
  return email.split("@")[0];
}

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

  const initials = getInitials(userEmail);
  const displayName = getDisplayName(userEmail);

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0d1117] border-r border-slate-800/50 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-5 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                AC
              </div>
              <div>
                <h1 className="font-semibold text-white tracking-tight">AlmostCrack&apos;d</h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* User Section */}
          <div className="p-4 border-b border-slate-800/50">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/30">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-medium text-xs">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{displayName}</p>
                <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 ml-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-[11px] text-emerald-400 font-medium">Superadmin</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {navGroups.map((group, groupIndex) => (
              <div key={group.label || `group-${groupIndex}`} className="mb-2">
                <div className="px-5 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                  {group.label}
                </div>
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between mx-3 px-3 py-2 text-sm rounded-lg transition-all duration-150 ${
                        isActive
                          ? "text-cyan-400 bg-cyan-500/10"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/50"
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
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-slate-400 hover:text-white bg-slate-800/30 hover:bg-slate-800/50 rounded-full transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#0d1117]/95 backdrop-blur-sm border-b border-slate-800/50">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
              AC
            </div>
            <span className="font-medium text-white">Admin</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-medium text-xs">
            {initials}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="lg:pl-64 min-h-screen">
        <div className="p-6 lg:p-8 pt-[4.5rem] lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
