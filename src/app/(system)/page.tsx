// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import InitialWelcomeForm from "./form";

export default function Home() {
  const { user, isLoaded } = useUser();
  const clerkId = user?.id ?? "";
  const router = useRouter();

  const { data: userData, isLoading } = api.user.getUserByClerkId.useQuery(
    { clerkId },
    { enabled: !!clerkId }
  );

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isLoaded || isLoading) return;

    const isProfileComplete =
      userData?.apelido && userData?.nomecompleto && userData?.datanascimento;

    if (isProfileComplete) {
      router.push("/user/medications");
    } else {
      setShowForm(true);
    }
  }, [isLoaded, isLoading, userData, router]);

  if (!isLoaded || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-black">
        Carregando...
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white text-black">
      {showForm && <InitialWelcomeForm />}
    </main>
  );
}
