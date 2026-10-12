"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

const HIDDEN_ROUTES = ["/sign-in", "/sign-up"];

export default function Navbar() {
  const pathname = usePathname();

  if (HIDDEN_ROUTES.some((route) => pathname.startsWith(route))) {
    return null;
  }

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b px-6">
      <Link href="/" className="text-lg font-bold">
        AI Tutor
      </Link>
      <nav className="flex items-center gap-4">
        <Link href="/subscription">Pricing</Link>
        <SignedOut>
          <SignInButton />
          <SignUpButton>
            <button className="h-10 cursor-pointer rounded-full bg-[#6c47ff] px-4 text-sm font-medium text-white">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </nav>
    </header>
  );
}
