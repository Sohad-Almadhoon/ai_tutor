import { PricingTable } from "@clerk/nextjs";

export default function SubscriptionPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold">Choose your plan</h1>
      <PricingTable />
    </main>
  );
}
