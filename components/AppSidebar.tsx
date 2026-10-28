"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  SignedIn,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import {
  Activity,
  BadgeDollarSign,
  BookOpen,
  Bookmark,
  ChartNoAxesColumnIncreasing,
  CirclePlus,
  House,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PlusSquare,
  LogOut,
  Settings,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";

type SidebarLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  available: boolean;
};

const mainLinks: SidebarLink[] = [
  { label: "Home", href: "/companions", icon: House, available: true },
  { label: "Lessons", href: "/lessons", icon: BookOpen, available: true },
  {
    label: "Saved Lessons",
    href: "/bookmarks",
    icon: Bookmark,
    available: true,
  },
  {
    label: "My Learning Sessions",
    href: "/learning-sessions",
    icon: Activity,
    available: true,
  },
  {
    label: "My Journey",
    href: "/my-journey",
    icon: ChartNoAxesColumnIncreasing,
    available: true,
  },
];

const creationLinks: SidebarLink[] = [
  {
    label: "Create Companion",
    href: "/companions/new",
    icon: CirclePlus,
    available: true,
  },
  {
    label: "Create Lesson",
    href: "/lessons/new",
    icon: PlusSquare,
    available: true,
  },
];

function SidebarLinks({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  const renderLink = ({
    label,
    href,
    icon: Icon,
    available,
  }: SidebarLink) => {
    const isActive =
      available &&
      (href === "/"
        ? pathname === "/"
        : pathname === href ||
          (pathname.startsWith(`${href}/`) &&
            pathname !== "/companions/new"));

    if (!available) {
      return (
        <div
          key={href}
          aria-disabled="true"
          title={collapsed ? `${label} — coming soon` : "Coming soon"}
          className={`flex min-h-11 cursor-not-allowed items-center gap-3 rounded-xl px-3 text-sm text-slate-400 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Icon className="size-4.5 shrink-0" aria-hidden="true" />
          {!collapsed && (
            <>
              <span className="flex-1">{label}</span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Soon
              </span>
            </>
          )}
        </div>
      );
    }

    return (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        title={collapsed ? label : undefined}
        aria-current={isActive ? "page" : undefined}
        className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
          collapsed ? "justify-center" : ""
        } ${
          isActive
            ? "bg-violet-100 text-violet-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
        }`}
      >
        <Icon
          className={`size-4.5 shrink-0 ${
            isActive ? "text-violet-600" : "text-slate-500"
          }`}
          aria-hidden="true"
        />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <>
      {!collapsed && (
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Workspace
        </p>
      )}
      <nav aria-label="Main navigation" className="space-y-1">
        {mainLinks.map(renderLink)}
      </nav>

      <div className="my-5 border-t border-slate-100" />

      {!collapsed && (
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Create
        </p>
      )}
      <nav aria-label="Create" className="space-y-1">
        {creationLinks.map(renderLink)}
      </nav>

      <div className="my-5 border-t border-slate-100" />

      {!collapsed && (
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Account
        </p>
      )}
      <Link
        href="/settings"
        onClick={onNavigate}
        title={collapsed ? "Settings" : undefined}
        aria-current={pathname === "/settings" ? "page" : undefined}
        className={`relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all ${
          collapsed ? "justify-center" : ""
        } ${
          pathname === "/settings"
            ? "bg-violet-50 text-violet-800 ring-1 ring-violet-100"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
        }`}
      >
        <Settings className="size-4.5 shrink-0" aria-hidden="true" />
        {!collapsed && <span>Settings</span>}
      </Link>
      <Link
        href="/subscription"
        onClick={onNavigate}
        title={collapsed ? "Pricing & Plan" : undefined}
        aria-current={pathname === "/subscription" ? "page" : undefined}
        className={`mt-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
          collapsed ? "justify-center" : ""
        } ${
          pathname === "/subscription"
            ? "bg-violet-100 text-violet-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
        }`}
      >
        <BadgeDollarSign className="size-4.5 shrink-0" aria-hidden="true" />
        {!collapsed && <span>Pricing &amp; Plan</span>}
      </Link>
    </>
  );
}

export default function AppSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useUser();
  const userName =
    user?.fullName ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress.split("@")[0] ??
    "Learner";

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    return null;
  }

  return (
    <>
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-violet-100/80 bg-white/95 px-3 py-5 shadow-[8px_0_32px_-28px_rgba(70,50,130,0.28)] backdrop-blur transition-[width] duration-200 md:flex ${
          isCollapsed ? "w-[5.25rem]" : "w-64"
        }`}
      >
        <div
          className={`mb-8 flex items-center ${
            isCollapsed ? "flex-col gap-4" : "justify-between px-2"
          }`}
        >
          {isCollapsed ? (
            <Link
              href="/companions"
              title="Learnova"
              aria-label="Learnova home"
              className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 text-white shadow-md shadow-violet-200"
            >
              <Sparkles className="size-5" aria-hidden="true" />
            </Link>
          ) : (
            <Link
              href="/companions"
              className="group flex min-w-0 items-center gap-3"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 text-white shadow-md shadow-violet-200 transition group-hover:-rotate-6">
                <Sparkles className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-base font-bold tracking-tight text-slate-950">
                  Learnova
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-violet-500">
                  Learn out loud
                </span>
              </span>
            </Link>
          )}
          <button
            type="button"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
            onClick={() => setIsCollapsed((collapsed) => !collapsed)}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-violet-50 hover:text-violet-700"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-5" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarLinks collapsed={isCollapsed} />
        </div>

        <div
          className={`mt-4 border-t border-slate-100 pt-4 ${
            isCollapsed ? "flex justify-center" : ""
          }`}
        >
          <SignedIn>
            <div
              className={`flex min-w-0 items-center ${
                isCollapsed ? "flex-col gap-3" : "gap-2 px-1"
              }`}
            >
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "size-9",
                    userButtonTrigger: "rounded-xl focus-visible:ring-4 focus-visible:ring-violet-200",
                  },
                }}
              />
              {!isCollapsed && (
                <span
                  className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700"
                  title={userName}
                >
                  {userName}
                </span>
              )}
              <SignOutButton signOutOptions={{ redirectUrl: "/sign-in" }}>
                <button
                  type="button"
                  title="Sign out"
                  aria-label="Sign out"
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                </button>
              </SignOutButton>
            </div>
          </SignedIn>
        </div>
      </aside>

      {!isOpen && (
        <button
          type="button"
          aria-label="Open navigation"
          aria-expanded={false}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 left-5 z-40 flex size-12 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-300 md:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-950/35"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className="relative flex h-full w-[min(20rem,85vw)] flex-col overflow-y-auto bg-white px-4 py-6 shadow-2xl"
          >
            <div className="mb-7 flex items-center justify-between px-3">
                <Link
                  href="/companions"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-lg font-bold text-slate-900"
              >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 text-white">
                    <Sparkles className="size-4.5" aria-hidden="true" />
                  </span>
                  <span>Learnova</span>
              </Link>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setIsOpen(false)}
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <SidebarLinks onNavigate={() => setIsOpen(false)} />
            <div className="mt-auto space-y-4 pt-6">
              <SignedIn>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "size-10",
                        userButtonTrigger: "rounded-xl focus-visible:ring-4 focus-visible:ring-violet-200",
                      },
                    }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
                    {userName}
                  </span>
                  <SignOutButton signOutOptions={{ redirectUrl: "/sign-in" }}>
                    <button
                      type="button"
                      aria-label="Sign out"
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
                    >
                      <LogOut className="size-4" aria-hidden="true" />
                    </button>
                  </SignOutButton>
                </div>
              </SignedIn>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
