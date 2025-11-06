"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CandidatoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");

    if (!token || userType !== "postulante") {
      router.push("/login");
    }
  }, [router]);

  return <>{children}</>;
}
