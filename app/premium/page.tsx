import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Example of gating a page behind a paid plan.
// "pro" must match a plan key you create in Clerk Dashboard → Billing → Plans.
export default async function PremiumPage() {
  const { userId, has } = await auth();

  if (!userId) redirect("/sign-in");
  if (!has({ plan: "pro" })) redirect("/subscription");

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Premium content</h1>
      <p>You have an active Pro subscription.</p>
    </main>
  );
}
