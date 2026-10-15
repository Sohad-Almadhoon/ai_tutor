"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import {
  Activity,
  BadgeDollarSign,
  BookOpen,
  Bookmark,
  ChartNoAxesColumnIncreasing,
  CirclePlus,
  GraduationCap,
  House,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PlusSquare,
  Settings,
  UsersRound,
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
  { label: "Home", href: "/", icon: House, available: true },
  { label: "Lessons", href: "/lessons", icon: BookOpen, available: false },
  {
    label: "Learning Companions",
    href: "/companions",
    icon: UsersRound,
    available: true,
  },
  {
    label: "Saved Lessons",
    href: "/bookmarks",
    icon: Bookmark,
    available: false,
  },
  {
    label: "My Learning Sessions",
    href: "/learning-sessions",
    icon: Activity,
    available: false,
  },
  {
    label: "My Journey",
    href: "/my-journey",
    icon: ChartNoAxesColumnIncreasing,
    available: false,
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
    available: false,
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
          <Icon className="size-[18px] shrink-0" aria-hidden="true" />
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
          className={`size-[18px] shrink-0 ${
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
      <nav aria-label="Main navigation" className="space-y-1">
        {mainLinks.map(renderLink)}
      </nav>

      <div className="my-5 border-t border-slate-200" />

      <nav aria-label="Create" className="space-y-1">
        {creationLinks.map(renderLink)}
      </nav>

      <div className="my-5 border-t border-slate-200" />

      <div
        aria-disabled="true"
        title={collapsed ? "Settings — coming soon" : "Coming soon"}
        className={`flex min-h-11 cursor-not-allowed items-center gap-3 rounded-xl px-3 text-sm text-slate-400 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <Settings className="size-[18px] shrink-0" aria-hidden="true" />
        {!collapsed && (
          <>
            <span className="flex-1">Settings</span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Soon
            </span>
          </>
        )}
      </div>

      <Link
        href="/subscription"
        onClick={onNavigate}
        title={collapsed ? "Pricing & Plan" : undefined}
        aria-current={pathname === "/subscription" ? "page" : undefined}
        className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
          collapsed ? "justify-center" : ""
        } ${
          pathname === "/subscription"
            ? "bg-violet-100 text-violet-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
        }`}
      >
        <BadgeDollarSign className="size-[18px] shrink-0" aria-hidden="true" />
        {!collapsed && <span>Pricing &amp; Plan</span>}
      </Link>
    </>
  );
}

export default function AppSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-5 transition-[width] duration-200 md:flex ${
          isCollapsed ? "w-[4.5rem]" : "w-64"
        }`}
      >
        <div
          className={`mb-7 flex items-center ${
            isCollapsed ? "flex-col gap-4" : "justify-between px-2"
          }`}
        >
          {isCollapsed ? (
            <Link href="/" title="Converso" aria-label="Converso home">
              <GraduationCap
                className="size-6 text-violet-600"
                aria-hidden="true"
              />
            </Link>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold text-slate-900"
            >
              <GraduationCap
                className="size-6 shrink-0 text-violet-600"
                aria-hidden="true"
              />
              <span>Converso</span>
            </Link>
          )}
          <button
            type="button"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
            onClick={() => setIsCollapsed((collapsed) => !collapsed)}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
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

        {!isCollapsed && (
          <div className="mt-5 rounded-2xl bg-violet-50 p-4">
            <p className="text-sm font-semibold text-slate-800">
              Learning together is better.
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Create a companion and share your knowledge.
            </p>
          </div>
        )}

        <div
          className={`mt-4 border-t border-slate-200 pt-4 ${
            isCollapsed ? "flex justify-center" : ""
          }`}
        >
          <SignedOut>
            {isCollapsed ? (
              <SignInButton>
                <button
                  type="button"
                  title="Sign in"
                  aria-label="Sign in"
                  className="flex size-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  <UsersRound className="size-[18px]" aria-hidden="true" />
                </button>
              </SignInButton>
            ) : (
              <div className="flex items-center justify-between px-2">
                <SignInButton />
                <SignUpButton>
                  <button className="h-10 cursor-pointer rounded-full bg-[#6c47ff] px-4 text-sm font-medium text-white">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            )}
          </SignedOut>
          <SignedIn>
            <div
              className={`flex items-center gap-3 ${
                isCollapsed ? "justify-center" : "px-2"
              }`}
            >
              <UserButton />
              {!isCollapsed && (
                <span className="text-sm font-medium text-slate-700">
                  Account
                </span>
              )}
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
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-lg font-bold text-slate-900"
              >
                <GraduationCap className="size-6 text-violet-600" aria-hidden="true" />
                <span>Converso</span>
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
              <div className="rounded-2xl bg-violet-50 p-4">
                <p className="text-sm font-semibold text-slate-800">
                  Learning together is better.
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Create a companion and share your knowledge.
                </p>
              </div>
              <SignedOut>
                <div className="flex items-center justify-between px-3">
                  <SignInButton />
                  <SignUpButton>
                    <button className="h-10 cursor-pointer rounded-full bg-[#6c47ff] px-4 text-sm font-medium text-white">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-3 px-3">
                  <UserButton />
                  <span className="text-sm font-medium text-slate-700">
                    Account
                  </span>
                </div>
              </SignedIn>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
