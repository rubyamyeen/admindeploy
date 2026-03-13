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
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/images", label: "Images" },
      { href: "/captions", label: "Captions" },
      { href: "/caption-examples", label: "Caption Examples" },
      { href: "/terms", label: "Terms" },
    ],
  },
  {
    label: "Humor",
    items: [
      { href: "/humor-flavors", label: "Humor Flavors" },
      { href: "/humor-flavor-steps", label: "Flavor Steps" },
      { href: "/humor-mix", label: "Humor Mix" },
    ],
  },
  {
    label: "LLM",
    items: [
      { href: "/llm-providers", label: "LLM Providers" },
      { href: "/llm-models", label: "LLM Models" },
      { href: "/llm-prompt-chains", label: "Prompt Chains" },
      { href: "/llm-responses", label: "LLM Responses" },
    ],
  },
  {
    label: "Users",
    items: [
      { href: "/profiles", label: "Profiles" },
      { href: "/caption-requests", label: "Caption Requests" },
      { href: "/allowed-domains", label: "Allowed Domains" },
      { href: "/whitelisted-emails", label: "Whitelisted Emails" },
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top nav */}
      <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="text-xl font-bold text-gray-900 ml-2">Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">{userEmail}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-14">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r transform transition-transform lg:transform-none pt-14 lg:pt-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="h-full overflow-y-auto py-4">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-4">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {group.label}
                </div>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`block px-4 py-2 text-sm ${
                      pathname === item.href
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
