import { FREE_COMPANION_LIMIT } from "@/constants";
import CompanionForm from "@/components/CompanionForm";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function NewCompanionPage() {
  const { userId, has } = await auth();
  if (!userId) redirect("/sign-in");

  const isPro = has({ plan: "pro" });
  const companionCount = await prisma.companion.count({ where: { userId } });
  if (!isPro && companionCount >= FREE_COMPANION_LIMIT) {
    redirect("/subscription");
  }

  return <CompanionForm />;
}
