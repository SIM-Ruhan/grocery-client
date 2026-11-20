"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Feedback } from "../../components/Catalog";
import { useStore } from "../../components/Store";
export default function AccountEntry() {
  const { user, ready, sessionError, refresh } = useStore();
  const router = useRouter();
  useEffect(() => {
    if (ready && !sessionError)
      router.replace(user?.admin ? "/admin" : user ? "/dashboard" : "/sign-in");
  }, [ready, user, sessionError, router]);
  return <Feedback error={sessionError} retry={refresh} />;
}
